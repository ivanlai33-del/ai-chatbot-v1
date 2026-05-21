import { createClient } from '@supabase/supabase-js';
import { OS_Event } from './event-bus';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * 📈 Lead Service / Processor
 * 負責監聽事件並自動轉化為商機 (Sales Funnel)
 */
export const LeadService = {
  /**
   * 處理事件並判斷是否產生商機
   */
  async handleEvent(event: OS_Event) {
    switch (event.event_name) {
      case 'booking.created':
        return await this.createLeadFromBooking(event);
      case 'form.submitted':
        return await this.createLeadFromForm(event);
      default:
        return null;
    }
  },

  /**
   * 當預約發生時，建立商機
   */
  async createLeadFromBooking(event: OS_Event) {
    const { payload, actor_id, bot_id } = event;
    
    // 取得聯絡人基本資料
    const { data: contact } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', actor_id)
      .single();

    if (!contact) return;

    // 寫入 saas_leads (兼容既有結構)
    const { error } = await supabase.from('saas_leads').upsert([
      {
        line_user_id: contact.line_user_id,
        name: contact.name,
        contact_info: contact.phone || contact.email || contact.line_user_id,
        intent: 'Booking Interest',
        details: `自動由預約事件生成: ${payload?.service_type} (${payload?.requested_date})\n留言: ${payload?.raw_message}`,
        status: 'New',
        updated_at: new Date().toISOString()
      }
    ], { onConflict: 'line_user_id' });

    if (error) {
      console.error('[LeadService] Failed to create lead from booking', error);
    } else {
      console.log(`[LeadService] Lead generated for contact ${contact.id}`);
    }
  },

  /**
   * 當表單提交時，建立商機 (範例)
   */
  async createLeadFromForm(event: OS_Event) {
    // 類似邏輯...
  }
};
