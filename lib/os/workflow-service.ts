import { createClient } from '@supabase/supabase-js';
import { OS_Event } from './event-bus';
import { LeadService } from './lead-service';
import { ContactService } from './contact-service';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * ⚡ Workflow Service (Automation Engine)
 * 負責處理「觸發器 -> 條件 -> 動作」的自動化旅程
 */
export const WorkflowService = {
  /**
   * 當事件總線攔截到事件時呼叫此入口
   */
  async processEvent(event: OS_Event) {
    console.log(`[Workflow Engine] Processing event: ${event.event_name} for bot ${event.bot_id}`);

    try {
      // 1. 查詢該 Bot 針對此事件設定的「啟動中」流程
      const { data: workflows, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('bot_id', event.bot_id)
        .eq('trigger_event', event.event_name)
        .eq('is_active', true);

      if (error) throw error;
      if (!workflows || workflows.length === 0) return;

      // 2. 逐一執行符合條件的流程
      for (const workflow of workflows) {
        await this.executeWorkflow(workflow, event);
      }
    } catch (err) {
      console.error('[Workflow Engine] Error processing event', err);
    }
  },

  /**
   * 執行單一流程邏輯
   */
  async executeWorkflow(workflow: any, event: OS_Event) {
    console.log(`[Workflow Engine] Executing workflow: ${workflow.name}`);

    // TODO: 條件過濾 (Conditions Check)
    // 目前先跳過，後續實作詳細規則引擎

    // 執行動作序列
    const actions = workflow.actions || [];
    for (const action of actions) {
      await this.runAction(action, event);
    }
  },

  /**
   * 執行具體動作
   */
  async runAction(action: any, event: OS_Event) {
    const { type, params } = action;

    switch (type) {
      case 'create_lead':
        console.log('[Workflow Engine] Action: Creating Lead...');
        await LeadService.handleEvent(event); // 複用現有的 LeadService
        break;

      case 'add_tag':
        if (event.actor_id && params?.tag) {
          console.log(`[Workflow Engine] Action: Adding tag ${params.tag} to contact ${event.actor_id}`);
          // 這裡可以呼叫 ContactService 更新標籤 (未來實作)
        }
        break;

      case 'notify_admin':
        console.log(`[Workflow Engine] Action: Notifying admin about ${event.event_name}`);
        // 這裡可以串接 LINE Notify 或內部通知系統
        break;

      default:
        console.warn(`[Workflow Engine] Unknown action type: ${type}`);
    }
  }
};
