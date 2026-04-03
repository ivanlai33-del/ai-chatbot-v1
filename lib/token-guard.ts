/**
 * Token Guard Utility
 * Lead: Data Persona
 * Purpose: Track and estimate token costs to ensure ROI and prevent budget overrun.
 */

export interface TokenUsage {
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  cost_estimate: number;
}

// Pricing per 1K tokens (as of March 2026 - Sandbox Estimates)
const PRICING: Record<string, { prompt: number; completion: number }> = {
  'gpt-4o':     { prompt: 0.005,  completion: 0.015 },
  'gpt-4o-mini': { prompt: 0.00015, completion: 0.0006 },
};

export function calculateCost(model: string, promptTokens: number, completionTokens: number): number {
  const rates = PRICING[model] || PRICING['gpt-4o-mini'];
  const cost = (promptTokens / 1000 * rates.prompt) + (completionTokens / 1000 * rates.completion);
  return Number(cost.toFixed(6));
}

export async function logTokenUsage(supabase: any, botId: string | 'master', usage: TokenUsage) {
  try {
    const { error } = await supabase.from('token_usage').insert([
      {
        bot_id: botId === 'master' ? null : botId,
        is_master: botId === 'master',
        model: usage.model,
        prompt_tokens: usage.prompt_tokens,
        completion_tokens: usage.completion_tokens,
        cost_usd: usage.cost_estimate
      }
    ]);
    // Silently ignore "table not found" — token_usage table may not be created yet
    if (error && !error.message.includes('does not exist') && !error.message.includes('schema cache')) {
      console.error('Token Logging Failed:', error.message);
    }
  } catch (e) {
    // Non-critical — never crash the bot over logging
  }
}
