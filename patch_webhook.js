const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'app/api/line/webhook/[id]/route.ts');
let code = fs.readFileSync(file, 'utf8');

// Replace supabase import to create admin client
code = code.replace(
    "import { supabase } from '@/lib/supabase';",
    "import { createClient } from '@supabase/supabase-js';\nconst supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);"
);
code = code.replace(/supabase\./g, "supabaseAdmin.");

// Add GoogleGenAI import
code = code.replace(
    "import OpenAI from 'openai';",
    "import OpenAI from 'openai';\nimport { GoogleGenAI } from '@google/genai';"
);

// Replace callOpenAIDirect with callAIDirect
code = code.replace(
    "async function callOpenAIDirect(systemPrompt: string, userMessage: string, chatHistory: any[] = [], imageBase64: string | null = null): Promise<string> {",
    `async function callAIDirect(systemPrompt: string, userMessage: string, chatHistory: any[] = [], imageBase64: string | null = null): Promise<string> {
    try {
        if (process.env.GOOGLE_API_KEY && process.env.GEMINI_API_KEY) {
            delete process.env.GOOGLE_API_KEY;
        }
        const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        const contents = chatHistory.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
        }));
        
        const currentParts = [];
        if (imageBase64) {
            currentParts.push({ text: '請辨識或解析此圖片細節，並專注回答與本店商品或服務相關的內容。' });
            currentParts.push({ inlineData: { mimeType: 'image/jpeg', data: imageBase64 } });
        } else {
            currentParts.push({ text: userMessage });
        }
        contents.push({ role: 'user', parts: currentParts });
        
        const res = await gemini.models.generateContent({
            model: 'gemini-2.5-flash',
            contents,
            config: {
                systemInstruction: systemPrompt,
                temperature: 0.7
            }
        });
        return res.text?.trim() || '抱歉，請再說一次。';
    } catch (geminiErr: any) {
        console.error('[TIER1:LineWebhook] Gemini failed, falling back to OpenAI:', geminiErr.message);
        require('fs').appendFileSync('/tmp/gemini_error.log', new Date().toISOString() + ' ' + geminiErr.message + '\\n').catch(()=>null);
        return callOpenAIFallback(systemPrompt, userMessage, chatHistory, imageBase64);
    }
}
async function callOpenAIFallback(systemPrompt: string, userMessage: string, chatHistory: any[] = [], imageBase64: string | null = null): Promise<string> {`
);

// Fix invocation
code = code.replace("callOpenAIDirect(", "callAIDirect(");

fs.writeFileSync(file, code);
