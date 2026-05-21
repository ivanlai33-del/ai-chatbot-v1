import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { AIService } from '@/lib/services/AIService';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: NextRequest) {
    try {
        const { message, storeConfig, isFree } = await req.json();

        if (!message || !storeConfig) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        const { brand_dna, offerings, faq_base, logic_rules, contact_info } = storeConfig;

        // Use unified prompt generator
        const systemPrompt = AIService.generateStoreSystemPrompt(storeConfig, isFree);

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini', // Use cheaper model for sandbox
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: message }
            ],
            temperature: 0.7,
            max_tokens: isFree ? 150 : 500
        });

        return NextResponse.json({ reply: response.choices[0].message.content });
    } catch (error: any) {
        console.error('Sandbox Chat Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
