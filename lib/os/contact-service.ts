import { createClient } from '@supabase/supabase-js';
import { trackEvent } from './event-bus';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type ContactProfile = {
  bot_id: string;
  line_user_id?: string;
  name?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  tags?: string[];
  custom_fields?: Record<string, any>;
};

/**
 * 👤 Unified Contact Service
 * 負責「一人一檔」的身份識別與資料同步
 */
export const ContactService = {
  /**
   * 根據 LINE User ID 取得或建立聯絡人
   */
  async getOrCreateFromLine(botId: string, lineUserId: string, initialData: Partial<ContactProfile> = {}) {
    // 1. 嘗試查找現有聯絡人
    const { data: existing, error: fetchError } = await supabase
      .from('contacts')
      .select('*')
      .eq('bot_id', botId)
      .eq('line_user_id', lineUserId)
      .single();

    if (existing) return existing;

    // 2. 若不存在，則建立新聯絡人
    const { data: created, error: createError } = await supabase
      .from('contacts')
      .insert([
        {
          bot_id: botId,
          line_user_id: lineUserId,
          name: initialData.name || '新好友',
          avatar_url: initialData.avatar_url,
          created_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (createError) throw createError;

    // 拋出「新好友加入」事件
    await trackEvent({
      bot_id: botId,
      actor_id: created.id,
      event_name: 'contact.created',
      source_type: 'system',
      payload: { method: 'line_join' }
    });

    return created;
  },

  /**
   * 更新聯絡人資料 (支援表單積木回寫)
   */
  async updateProfile(contactId: string, botId: string, updates: Partial<ContactProfile>) {
    const { data, error } = await supabase
      .from('contacts')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', contactId)
      .eq('bot_id', botId)
      .select()
      .single();

    if (error) throw error;

    // 拋出「資料更新」事件
    await trackEvent({
      bot_id: botId,
      actor_id: contactId,
      event_name: 'contact.updated',
      source_type: 'block',
      payload: { updated_fields: Object.keys(updates) }
    });

    return data;
  },

  /**
   * 為聯絡人貼標籤
   */
  async addTags(contactId: string, botId: string, newTags: string[]) {
    // 這裡使用 PostgreSQL 的 array_cat 功能在資料庫端合併標籤，避免併發覆蓋
    const { data, error } = await supabase.rpc('append_contact_tags', {
      target_contact_id: contactId,
      target_bot_id: botId,
      new_tags: newTags
    });

    if (error) {
      // 如果 RPC 不存在，先用傳統方式 (讀取後寫回)
      const { data: current } = await supabase.from('contacts').select('tags').eq('id', contactId).single();
      const mergedTags = Array.from(new Set([...(current?.tags || []), ...newTags]));
      
      await supabase.from('contacts').update({ tags: mergedTags }).eq('id', contactId);
    }

    return { success: true };
  }
};
