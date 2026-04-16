import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { 
            ip, country, city, district, isp, referer,
            session_id, visitor_id,
            utm_source, utm_medium, utm_campaign, utm_content, utm_term,
            page_url, page_title,
            browser, os, device_type,
            content_tags, liff_user_id,
            duration
        } = body;

        // Use upsert to update duration if the session on the same page already exists
        await supabase
            .from('platform_visitor_logs')
            .upsert({
                ip, country, city, district, isp, referer,
                session_id, visitor_id,
                utm_source, utm_medium, utm_campaign, utm_content, utm_term,
                page_url, page_title,
                browser, os, device_type,
                content_tags, liff_user_id,
                duration: duration || 0,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'session_id,visitor_id,page_url'
            });

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
