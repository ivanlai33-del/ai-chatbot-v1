import { createClient } from '@supabase/supabase-js';
import { supabase as supabaseAnon } from '@/lib/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// 伺服器端環境下使用高權限的 Admin 客戶端，避免 RPC 權限回收後無法計數
const supabase = supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        }
    })
    : supabaseAnon;


export class UsageService {
    /**
     * Increment message count and total tokens for a user for the current month.
     * Month format: YYYY-MM
     */
    static async incrementUsage(userId: string, tokens: number = 0) {
        if (!userId) return;

        const currentMonth = new Date().toISOString().slice(0, 7); // "2026-03"

        try {
            // ⚡ 單次原子 RPC 呼叫，取代「select → insert/update」兩步走
            //    防止競蓆條件：兩個并行請求同時讀到 0 再同時 insert
            const { error } = await supabase.rpc('increment_user_usage', {
                p_user_id: userId,
                p_month: currentMonth,
                p_tokens: tokens
            });

            if (error) {
                console.error('[UsageService] RPC Error:', error);
            }
        } catch (error) {
            console.error('[UsageService] General Error:', error);
        }
    }

    /**
     * Get current month usage for a user
     */
    static async getMonthlyUsage(userId: string) {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const { data } = await supabase
            .from('user_usage_stats')
            .select('*')
            .eq('user_id', userId)
            .eq('month', currentMonth)
            .maybeSingle();
        
        return data || { message_count: 0, total_tokens: 0 };
    }
}
