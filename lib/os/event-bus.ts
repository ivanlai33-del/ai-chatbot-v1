import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 延遲導入以避免循環依賴
let WorkflowService: any;
import('./workflow-service').then(m => WorkflowService = m.WorkflowService);

export type OS_Event = {
  event_name: string;
  bot_id: string;
  actor_id?: string; // Contact ID
  source_type: 'block' | 'system' | 'manual';
  source_id?: string; // Block Instance ID
  payload?: Record<string, any>;
};

/**
 * 🚀 OS Event Bus Tracker
 * 用於將所有積木模組的行為寫入統一事件總線
 */
export async function trackEvent(event: OS_Event) {
  try {
    const { data, error } = await supabase
      .from('events')
      .insert([
        {
          bot_id: event.bot_id,
          event_name: event.event_name,
          actor_id: event.actor_id,
          source_type: event.source_type,
          source_id: event.source_id,
          payload: event.payload || {},
        },
      ]);

    if (error) throw error;

    console.log(`[OS Event Bus] Event Tracked: ${event.event_name}`, event);
    
    // 🚀 核心調度：將事件傳遞給流程引擎 (Workflow Engine)
    if (WorkflowService) {
      WorkflowService.processEvent(event).catch((err: any) => 
        console.error('[OS Event Bus] WorkflowService dispatch error', err)
      );
    }

    return { success: true, data };
  } catch (err) {
    console.error(`[OS Event Bus] Failed to track event: ${event.event_name}`, err);
    return { success: false, error: err };
  }
}

/**
 * 便利函數：聯絡人互動事件
 */
export async function trackInteraction(botId: string, contactId: string, eventName: string, details: any = {}) {
  return trackEvent({
    bot_id: botId,
    actor_id: contactId,
    event_name: eventName,
    source_type: 'interaction',
    payload: details
  } as any);
}

/**
 * 相容封裝：供 MarketService 等模組呼叫
 */
export class EventBus {
  static async emit(event: any) {
    return trackEvent({
      bot_id: event.bot_id,
      event_name: event.event_name,
      actor_id: event.actor_id,
      source_type: event.source_type || 'system',
      source_id: event.source_id,
      payload: event.payload || {}
    });
  }
}
