import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { 
            ip, city, district, isp, referer,
            session_id, visitor_id,
            utm_source, utm_medium, utm_campaign, utm_content, utm_term,
            page_url, page_title,
            browser, os, device_type,
            content_tags, liff_user_id
        } = body;

        // Log the visit to the platform_visitor_logs
        await supabase
            .from('platform_visitor_logs')
            .insert({
                ip, city, district, isp, referer,
                session_id, visitor_id,
                utm_source, utm_medium, utm_campaign, utm_content, utm_term,
                page_url, page_title,
                browser, os, device_type,
                content_tags, liff_user_id,
                created_at: new Date().toISOString()
            });

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
