import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const ADMIN_ID = "Ud8b8dd79162387a80b2b5a4aba20f604";

    if (userId !== ADMIN_ID) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        // 1. DATA AGGREGATION (Concise)
        // Leads
        const { data: newLeads } = await supabase.from('saas_leads').select('line_user_id, industry, details').eq('lead_category', 'Cold').limit(10);
        // Feedback
        const { data: feedback } = await supabase.from('owner_feedback').select('content, feedback_type').limit(5);
        // Logs (Only text)
        const { data: logs } = await supabase.from('chat_logs').select('content').eq('role', 'user').order('created_at', { ascending: false }).limit(30);

        const promptContext = {
            leads: newLeads || [],
            feedback: feedback || [],
            recentQueries: logs?.map(l => l.content.slice(0, 50)) || []
        };

        // 2. TOKEN-EFFICIENT AI ANALYSIS
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini', // 🚀 Use mini for background tasks to save tokens
            messages: [
                { 
                  role: 'system', 
                  content: `
                    你是一位高效率的「幕僚長(Chief of Staff)」。
                    分析提供的經營數據並產出極其精簡的 JSON 報告。
                    
                    要求格式：
                    {
                      "lead_scoring": [{"id": String, "score": 1-5, "cat": "Hot/Warm/Cold", "reason": String}],
                      "anomalies": [String],
                      "top_keywords": [String],
                      "daily_summary": String (100字內)
                    }
                  ` 
                },
                { role: 'user', content: JSON.stringify(promptContext) }
            ],
            response_format: { type: 'json_object' }
        });

        const reportData = JSON.parse(response.choices[0].message.content || '{}');

        // 3. PERSISTENCE & ACTIONS
        // Update leads with scores
        if (reportData.lead_scoring) {
            for (const lead of reportData.lead_scoring) {
                await supabase
                    .from('saas_leads')
                    .update({ 
                        priority_score: lead.score, 
                        lead_category: lead.cat,
                        updated_at: new Date().toISOString()
                    })
                    .eq('line_user_id', lead.id);
            }
        }

        // Save formal report
        const { data: finalReport, error: repErr } = await supabase
            .from('strategist_reports')
            .insert({
                report_type: 'daily_digest',
                content: reportData,
                summary: reportData.daily_summary
            })
            .select()
            .single();

        if (repErr) throw repErr;

        return NextResponse.json({ success: true, report: finalReport });
    } catch (e: any) {
        console.error("Strategist Task Error:", e);
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
