/**
 * ============================================================
 * 🏆 TIER-1: StoreManagerDojo（練功房模組）
 * ============================================================
 * 職責：處理店長(Owner)傳來的訓練指令
 *   - @店長聽令 / @更新知識 → 知識更新
 *   - @調閱知識 → 知識回報
 *   - @調閱人設 / @修改人設 → 系統提示詞管理
 *   - 語音指令 → Whisper 轉文字後同上
 *
 * 完全獨立：不依賴 webhook handler，可單獨測試。
 */

import OpenAI from 'openai';
import { SupabaseClient } from '@supabase/supabase-js';
import { Client } from '@line/bot-sdk';
import { BotConfig, DojoClassification } from '../types';
import { BotLogger, safeReply, BOT_ERROR_MESSAGES } from '../BotBase';

const TIER = 'TIER1:StoreManager' as const;

export class StoreManagerDojo {
    private openai: OpenAI;
    private supabase: SupabaseClient;
    private client: Client;
    private bot: BotConfig;
    private logger: BotLogger;
    private chatModel: string;

    constructor(openai: OpenAI, supabase: SupabaseClient, client: Client, bot: BotConfig, chatModel: string = 'gpt-4o-mini') {
        this.openai = openai;
        this.supabase = supabase;
        this.client = client;
        this.bot = bot;
        this.chatModel = chatModel;
        this.logger = new BotLogger(TIER, bot.id);
    }

    /** 判斷是否為練功房指令 */
    static isDojoCommand(text: string): boolean {
        return (
            text === '@調閱知識' ||
            text === '@調閱人設' ||
            text.startsWith('@修改人設') ||
            text.startsWith('@店長聽令') ||
            text.startsWith('@更新知識')
        );
    }

    /** 處理文字練功房指令，回傳 true 表示已處理 */
    async handleText(text: string, replyToken: string): Promise<boolean> {
        const isPaidPlan = this.isPaidForDojo();

        // 付費功能擋關
        if (!isPaidPlan && (text.startsWith('@店長聽令') || text.startsWith('@更新知識') || text.startsWith('@修改人設'))) {
            await safeReply(this.client, replyToken,
                '🌟 老闆！偵測到您正在使用「AI 練功房」指令。\n\n目前這項功能是【個人店長版】以上的專屬工具。如果您想讓店長聽令於您的每一句話，請點擊後台升級即可解鎖。🚀',
                this.logger
            );
            return true;
        }

        // @調閱知識
        if (text === '@調閱知識') {
            await this.handleKnowledgeRetrieval(replyToken);
            return true;
        }

        // @調閱人設
        if (text === '@調閱人設') {
            await this.handlePersonaRetrieval(replyToken);
            return true;
        }

        // @修改人設
        if (text.startsWith('@修改人設')) {
            const instruction = text.replace(/^@修改人設\s*/, '').trim();
            await this.handlePersonaUpdate(instruction, replyToken);
            return true;
        }

        // @店長聽令 / @更新知識 → 轉入知識分類
        if (text.startsWith('@店長聽令') || text.startsWith('@更新知識')) {
            const trainingText = text.replace(/^@店長聽令\s*|^@更新知識\s*/, '').trim();
            if (trainingText) {
                await this.handleKnowledgeUpdate(trainingText, replyToken, 'line_text');
                return true;
            }
        }

        return false;
    }

    /** 處理語音訓練指令 */
    async handleAudio(messageId: string, replyToken: string): Promise<boolean> {
        if (!this.isPaidForDojo()) {
            await safeReply(this.client, replyToken,
                '👂 老闆！剛才收到了您的「語音指令」，這是最新的 AI 練功房訓練技術。\n\n這項語音同步操作是【個人店長版】以上方案的專屬功能，請點擊後台升級即可解鎖。🚀',
                this.logger
            );
            return true;
        }

        try {
            const stream = await this.client.getMessageContent(messageId);
            const chunks: Buffer[] = [];
            for await (const chunk of stream) chunks.push(chunk as Buffer);
            const buffer = Buffer.concat(chunks);
            const audioFile = new File([buffer], 'audio.m4a', { type: 'audio/m4a' });

            const transcription = await this.openai.audio.transcriptions.create({
                file: audioFile,
                model: 'whisper-1'
            });

            await this.handleKnowledgeUpdate(transcription.text, replyToken, 'line_voice');
        } catch (err) {
            this.logger.error('Audio processing failed', err);
            await safeReply(this.client, replyToken, BOT_ERROR_MESSAGES.audio, this.logger);
        }
        return true;
    }

    // ─── Private handlers ────────────────────────────────────

    private async handleKnowledgeRetrieval(replyToken: string) {
        try {
            const [{ data: faqs }, { data: products }] = await Promise.all([
                this.supabase.from('faq').select('*').eq('bot_id', this.bot.id),
                this.supabase.from('products').select('*').eq('bot_id', this.bot.id)
            ]);

            let report = '【📊 AI 練功房知識庫清單】\n\n';
            report += '🛍️ ［商品/服務清單］\n';
            (products || []).forEach((p: any) =>
                report += `- ${p.name}: $${p.price}${p.purchase_url ? `\n  🔗 購買: ${p.purchase_url}` : ''}\n`
            );
            if (!products?.length) report += '(目前無商品資料)\n';

            report += '\n💡 ［常見問題 FAQ］\n';
            (faqs || []).forEach((f: any) => report += `Q: ${f.question}\nA: ${f.answer}\n---\n`);
            if (!faqs?.length) report += '(目前無常見問題)\n';

            await safeReply(this.client, replyToken, report.trim(), this.logger);
        } catch (err) {
            this.logger.error('Knowledge retrieval failed', err);
            await safeReply(this.client, replyToken, '老闆抱歉，調閱資料時發生錯誤，請稍後再試。', this.logger);
        }
    }

    private async handlePersonaRetrieval(replyToken: string) {
        try {
            const { data: botData } = await this.supabase
                .from('bots').select('system_prompt').eq('id', this.bot.id).single();

            let report = '【🧠 AI 店長核心人設報告】\n\n';
            if (botData?.system_prompt) {
                report += botData.system_prompt;
                report += '\n\n💡 提示：如需修改，請傳送「@修改人設 [您的新要求]」';
            } else {
                report += '(目前無人設資料)';
            }
            await safeReply(this.client, replyToken, report.trim(), this.logger);
        } catch (err) {
            this.logger.error('Persona retrieval failed', err);
            await safeReply(this.client, replyToken, '老闆抱歉，調閱人設時發生錯誤，請稍後再試。', this.logger);
        }
    }

    private async handlePersonaUpdate(instruction: string, replyToken: string) {
        if (!instruction) {
            await safeReply(this.client, replyToken,
                '老闆，請告訴我您想修改什麼呢？\n(例如：@修改人設 這個月主打中秋禮盒，請用活潑的語氣推廣)',
                this.logger
            );
            return;
        }

        try {
            const { data: botData } = await this.supabase
                .from('bots').select('system_prompt').eq('id', this.bot.id).single();
            const currentPrompt = botData?.system_prompt || '';

            const rewriteResponse = await this.openai.chat.completions.create({
                model: this.chatModel === 'gemini-2.5-flash' ? 'gemini-2.5-flash' : 'gpt-4o', // 旗艦功能
                messages: [
                    {
                        role: 'system',
                        content: '你是一個專業的 AI 提示詞工程師。依據「店長的新要求」微調現有人設提示詞。請直接輸出純文字的新版 System Prompt，不要包含 Markdown code block。'
                    },
                    {
                        role: 'user',
                        content: `【現有人設提示詞】：\n${currentPrompt}\n\n【店長的新要求】：\n${instruction}`
                    }
                ],
                temperature: 0.7,
            });

            const newSystemPrompt = rewriteResponse.choices[0].message.content?.trim();
            if (newSystemPrompt) {
                await this.supabase.from('bots').update({ system_prompt: newSystemPrompt }).eq('id', this.bot.id);
                await safeReply(this.client, replyToken,
                    '老闆沒問題！我已經調整好大腦人設了！💪\n\n輸入「@調閱人設」可查看最新狀態。',
                    this.logger
                );
            } else throw new Error('LLM returned empty prompt');
        } catch (err) {
            this.logger.error('Persona update failed', err);
            await safeReply(this.client, replyToken, '老闆抱歉，重塑人設時遇到困難，請稍後再試。', this.logger);
        }
    }

    private async handleKnowledgeUpdate(
        trainingText: string,
        replyToken: string,
        source: 'line_text' | 'line_voice'
    ) {
        try {
            const classificationResponse = await this.openai.chat.completions.create({
                model: this.chatModel,
                response_format: { type: 'json_object' },
                messages: [
                    {
                        role: 'system',
                        content: `你是一個店長助手分類員。輸出 JSON：
1. 長期知識(常見問題): {"type":"faq","question":"...","answer":"..."}
2. 長期知識(商品): {"type":"product","name":"...","price":數字,"cost":數字}
3. 短期動態: {"type":"dynamic","update":"簡短描述"}`
                    },
                    { role: 'user', content: trainingText }
                ]
            });

            const result: DojoClassification = JSON.parse(
                classificationResponse.choices[0].message.content || '{}'
            );

            // 寫入 Dojo 日誌
            await this.supabase.from('dojo_logs').insert({
                bot_id: this.bot.id,
                content: trainingText,
                category: result.type,
                source
            });

            let replyMsg = '';
            if (result.type === 'faq') {
                await this.supabase.from('faq').insert([{
                    bot_id: this.bot.id,
                    question: result.question,
                    answer: result.answer
                }]);
                replyMsg = `老闆收到！這條知識已存入智庫：\nQ: ${result.question}\nA: ${result.answer}`;
            } else if (result.type === 'product') {
                const { data: existing } = await this.supabase
                    .from('products').select('id').eq('bot_id', this.bot.id).eq('name', result.name).single();

                if (existing) {
                    await this.supabase.from('products')
                        .update({ price: result.price, cost: result.cost }).eq('id', existing.id);
                    replyMsg = `老闆收到！商品「${result.name}」的價格已更新。`;
                } else {
                    await this.supabase.from('products').insert([{
                        bot_id: this.bot.id, name: result.name, price: result.price, cost: result.cost
                    }]);
                    replyMsg = `老闆收到！新商品「${result.name}」已上架。`;
                }
            } else if (result.type === 'dynamic') {
                await this.supabase.from('bots').update({
                    dynamic_context: result.update,
                    last_dojo_update: new Date().toISOString()
                }).eq('id', this.bot.id);
                replyMsg = `老闆收到！「${result.update}」這項動態我已記在最前端了！👌`;
            } else {
                replyMsg = `老闆抱歉，我不太確定這條指令要存在哪裡，能請您換個說法嗎？`;
            }

            await safeReply(this.client, replyToken, replyMsg, this.logger);
        } catch (err) {
            this.logger.error('Knowledge update failed', err);
            await safeReply(this.client, replyToken, BOT_ERROR_MESSAGES.training, this.logger);
        }
    }

    private isPaidForDojo(): boolean {
        return (
            (!!this.bot.selected_plan && !this.bot.selected_plan.includes('Free')) ||
            this.bot.plan_level > 0
        );
    }
}
