import { supabase } from '@/lib/supabase';

export class UsageService {
    /**
     * Increment message count and total tokens for a user for the current month.
     * Month format: YYYY-MM
     */
    static async incrementUsage(userId: string, tokens: number = 0) {
        if (!userId) return;

        const currentMonth = new Date().toISOString().slice(0, 7); // "2026-03"

        try {
            // Use Supabase upsert with RPC or a simple select/update
            // Since we want to increment, we can use a PostgreSQL function or a two-step process.
            // For simplicity and common Next.js/Supabase patterns, we'll try to find and update.
            
            const { data: currentUsage, error: fetchError } = await supabase
                .from('user_usage_stats')
                .select('*')
                .eq('user_id', userId)
                .eq('month', currentMonth)
                .maybeSingle();

            if (fetchError) {
                console.error('[UsageService] Fetch Error:', fetchError);
                return;
            }

            if (!currentUsage) {
                // First message of the month
                await supabase.from('user_usage_stats').insert({
                    user_id: userId,
                    month: currentMonth,
                    message_count: 1,
                    total_tokens: tokens,
                    last_updated: new Date().toISOString()
                });
            } else {
                // Increment existing
                await supabase
                    .from('user_usage_stats')
                    .update({
                        message_count: (currentUsage.message_count || 0) + 1,
                        total_tokens: (currentUsage.total_tokens || 0) + tokens,
                        last_updated: new Date().toISOString()
                    })
                    .eq('id', currentUsage.id);
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
