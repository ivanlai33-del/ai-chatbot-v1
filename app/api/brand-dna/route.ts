import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * POST /api/brand-dna
 *
 * Upserts Brand DNA fields collected during the pre-onboarding chat.
 * Only saves to DB when at least one DNA field is present.
 * When contact_info is provided, the record becomes a "hot lead".
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            session_id,
            industry_type,
            company_name,
            main_services,
            target_audience,
            contact_info,
        } = body;

        if (!session_id) {
            return NextResponse.json({ error: 'session_id required' }, { status: 400 });
        }

        // Only upsert if at least one DNA field is present
        const hasData = industry_type || company_name || main_services || target_audience || contact_info;
        if (!hasData) {
            return NextResponse.json({ status: 'no_data' });
        }

        // Build update object — only include fields that are actually provided
        const updateFields: Record<string, any> = { session_id };
        if (industry_type)   updateFields.industry_type   = industry_type;
        if (company_name)    updateFields.company_name    = company_name;
        if (main_services)   updateFields.main_services   = main_services;
        if (target_audience) updateFields.target_audience = target_audience;
        if (contact_info)    updateFields.contact_info    = contact_info;

        const { error } = await supabase
            .from('brand_dna')
            .upsert(updateFields, { onConflict: 'session_id' });

        if (error) {
            console.error('[brand-dna] Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ status: 'ok' });
    } catch (err: any) {
        console.error('[brand-dna] Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
