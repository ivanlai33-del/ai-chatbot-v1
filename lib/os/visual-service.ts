import { createClient } from '@supabase/supabase-js';
import { trackEvent } from './event-bus';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type VisualRequest = {
  bot_id: string;
  source_instance_id?: string;
  asset_type: 'rich_menu_bg' | 'flex_hero' | 'form_header' | 'coupon_cover';
  prompt_context: string; // 具體的活動或功能描述
};

/**
 * 🎨 Visual Design Service
 * 負責將「品牌 DNA」轉化為「功能視覺資產」
 */
export const VisualService = {
  /**
   * 生成視覺資產 (整合 AI 與品牌規範)
   */
  async generateAsset(req: VisualRequest) {
    try {
      // 1. 取得品牌 DNA
      const { data: brand } = await supabase
        .from('brand_profiles')
        .select('*')
        .eq('bot_id', req.bot_id)
        .single();

      if (!brand) throw new Error('Brand profile not found. Please set Brand DNA first.');

      // 2. 構建品牌風格化的 AI Prompt
      const finalPrompt = `
        Style: ${brand.style_keywords?.join(', ')}
        Colors: Primary ${brand.primary_color}
        Negative Prompt: ${brand.negative_prompts}
        Context: ${req.prompt_context}
        Format: Optimized for ${req.asset_type}
      `.trim();

      // 3. 呼叫 AI 圖像生成 (此處為示意，可串接 OpenAI DALL-E 或 Stable Diffusion)
      console.log(`[VisualService] Calling AI with prompt: ${finalPrompt}`);
      
      // 模擬產出的圖片 URL (未來串接 API)
      const generatedUrl = `https://api.placeholder.ai/generated/${req.asset_type}/${Date.now()}.png`;

      // 4. 存入資產庫
      const { data: asset, error } = await supabase
        .from('visual_assets')
        .insert([
          {
            bot_id: req.bot_id,
            source_instance_id: req.source_instance_id,
            asset_type: req.asset_type,
            image_url: generatedUrl,
            prompt_used: finalPrompt,
            review_status: 'pending' // 企業級系統必備：人工審核流
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // 5. 拋出「視覺資產生成」事件
      await trackEvent({
        bot_id: req.bot_id,
        event_name: 'asset.generated',
        source_type: 'system',
        source_id: asset.id,
        payload: { asset_type: req.asset_type, url: generatedUrl }
      });

      return asset;
    } catch (err) {
      console.error('[VisualService] Failed to generate visual asset', err);
      throw err;
    }
  },

  /**
   * 審核資產 (由後台管理人員執行)
   */
  async approveAsset(assetId: string, botId: string) {
    const { data, error } = await supabase
      .from('visual_assets')
      .update({ review_status: 'approved' })
      .eq('id', assetId)
      .eq('bot_id', botId)
      .select()
      .single();

    if (!error) {
      await trackEvent({
        bot_id: botId,
        event_name: 'asset.approved',
        source_type: 'system',
        source_id: assetId
      });
    }

    return data;
  }
};
