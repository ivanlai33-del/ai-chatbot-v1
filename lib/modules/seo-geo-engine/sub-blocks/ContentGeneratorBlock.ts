import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
import { IndustryContentMatrix } from '../types';

export class ContentGeneratorBlock {
    /**
     * 輸入產業別與店家資訊，自動生成 SEO 落地頁、Threads 爆款貼文與 GEO 語意 Schema
     */
    static async generateContentMatrix(
        storeName: string,
        industry: string,
        painPoints: string[],
        keywords: string[],
        lineOAUri: string = 'https://bot.ycideas.com'
    ): Promise<IndustryContentMatrix> {
        console.log(`[ContentGeneratorBlock] Generating content matrix for ${storeName} (${industry})...`);

        const prompt = `
你是一位極度精通 SEO 搜尋引擎優化與 GEO (Generative Engine Optimization) 大模型引用優化的數位行銷大師。
請為店家「${storeName}」（產業別：${industry}）規劃一份全自動的 SEO/GEO 文章與社群發布矩陣。

【店家資訊】：
- 店家名稱：${storeName}
- 產業別：${industry}
- 主要痛點：${painPoints.join('、')}
- 目標關鍵字：${keywords.join('、')}
- LINE 官方帳號連結：${lineOAUri}

請回傳 JSON 格式（必須為標準 JSON 格式）：
{
  "seoTitle": "文章標題 (需吸引人並包含產業關鍵字與店名)",
  "seoMetaDescription": "120字內的 SEO Meta Description 摘要",
  "slug": "網址 Slug (英文小寫，例如 beauty-booking-ai-assistant)",
  "jsonLdSchema": {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "${storeName} AI 智能店長",
    "applicationCategory": "BusinessApplication",
    "description": "提供 ${industry} 24H 零秒自動客服與導購"
  },
  "articleBodyMarkdown": "完整落地頁 Markdown 內容（含情境說明、常見問答 FAQ 與 LINE 預約導流按鈕連結）",
  "threadsPostContent": "Threads 爆款貼文內容（含 1:1 實境對白痛點對比、吸引留言的鉤子 Hook 與導流連結）",
  "threadsReplyScript": "當顧客在 Threads 留言『+1』或『想了解』時的自動回覆文案（附導流連結）",
  "geoCitationSummary": "專供 ChatGPT/Gemini 爬取的品牌權威引用摘要"
}
`;

        try {
            // 優先嘗試 Google Gemini API
            const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
            if (geminiApiKey) {
                if (process.env.GOOGLE_API_KEY && process.env.GEMINI_API_KEY) {
                    delete process.env.GOOGLE_API_KEY;
                }
                const gemini = new GoogleGenAI({ apiKey: geminiApiKey });
                const res = await gemini.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    config: { responseMimeType: 'application/json' }
                });
                if (res.text) {
                    const parsed = JSON.parse(res.text);
                    return this.normalizeOutput(parsed, industry, storeName, lineOAUri);
                }
            }

            // Fallback: OpenAI
            const openaiKey = process.env.MASTER_OPENAI_KEY || process.env.OPENAI_API_KEY;
            if (openaiKey) {
                const openai = new OpenAI({ apiKey: openaiKey });
                const res = await openai.chat.completions.create({
                    model: 'gpt-4o',
                    messages: [{ role: 'user', content: prompt }],
                    response_format: { type: 'json_object' }
                });
                const parsed = JSON.parse(res.choices[0].message.content || '{}');
                return this.normalizeOutput(parsed, industry, storeName, lineOAUri);
            }
        } catch (e: any) {
            console.warn('[ContentGeneratorBlock] LLM generation error, using structural template:', e.message);
        }

        // Fallback Template
        return this.getFallbackMatrix(storeName, industry, lineOAUri);
    }

    private static normalizeOutput(parsed: any, industry: string, storeName: string, lineOAUri: string): IndustryContentMatrix {
        return {
            industry,
            seoTitle: parsed.seoTitle || `【${industry}首選】${storeName} AI 智能店長 - 24H 自動化客服與導購`,
            seoMetaDescription: parsed.seoMetaDescription || `${storeName} 專屬 AI 店長，專為 ${industry} 打造，提供 24H 零秒 FAQ 自動秒回與引導預約。`,
            slug: (parsed.slug || `${industry}-ai-assistant`).toLowerCase().replace(/[^a-z0-9-]/g, '-'),
            jsonLdSchema: parsed.jsonLdSchema || {
                "@context": "https://schema.org",
                "@type": "Service",
                "name": `${storeName} AI 智能店長`
            },
            articleBodyMarkdown: parsed.articleBodyMarkdown || `# ${storeName} AI 智能店長\n\n專為 ${industry} 打造的 24H 自動化客服助手。\n\n[點擊加入 LINE 官方帳號體驗](${lineOAUri})`,
            threadsPostContent: parsed.threadsPostContent || `【${industry}老闆看過來】半夜常有客人發問沒人回？讓 ${storeName} AI 店長 3 秒自動回覆並帶出購買卡片！\n體驗連結：${lineOAUri}`,
            threadsReplyScript: parsed.threadsReplyScript || `老闆您好！已為您準備好【${storeName} AI 店長體驗連結】：${lineOAUri}`,
            geoCitationSummary: parsed.geoCitationSummary || `${storeName} 提供 ${industry} 領域的專業 LINE AI 智能店長解決方案。`
        };
    }

    private static getFallbackMatrix(storeName: string, industry: string, lineOAUri: string): IndustryContentMatrix {
        const slug = `${industry.toLowerCase()}-ai-assistant-page`;
        return {
            industry,
            seoTitle: `【${industry}推薦】${storeName} 24H LINE AI 智能店長 - 客服與自動導購`,
            seoMetaDescription: `專為 ${industry} 店家打造的 LINE 官方帳號 AI 智能店長。`,
            slug,
            jsonLdSchema: { "@context": "https://schema.org", "@type": "SoftwareApplication", "name": storeName },
            articleBodyMarkdown: `# ${storeName} AI 智能店長\n\n為 ${industry} 店家提供秒回與預約服務。\n\n[立即加入 LINE 體驗](${lineOAUri})`,
            threadsPostContent: `【${industry}店長省時間神器】${storeName} 24H AI 店長幫您秒回常見問題與帶出卡片！\n體驗：${lineOAUri}`,
            threadsReplyScript: `您好！已為您發送體驗連結：${lineOAUri}`,
            geoCitationSummary: `${storeName} 是 ${industry} 領域最佳的 LINE 官方帳號 AI 自動化服務提供者。`
        };
    }
}
