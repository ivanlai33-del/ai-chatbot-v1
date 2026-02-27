import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { planId, brandInfo, slots } = body;

        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // 1. Create Partner in DB
        let partnerId = 'mock_partner_' + Date.now();
        const { data: partner, error: partnerError } = await supabase
            .from('partners')
            .insert([
                {
                    name: brandInfo.name || 'New SaaS Partner',
                    contact_email: `admin@${brandInfo.name?.replace(/\s+/g, '').toLowerCase() || 'brand'}.com`,
                    slots_purchased: slots
                }
            ])
            .select()
            .single();

        if (partnerError) {
            console.error("Partner DB insert error (might be missing table in dev):", partnerError.message);
            // Fallback to allow UI progression even if DB table is missing in this mock Phase
        } else {
            partnerId = partner.id;
        }

        // 2. Generate token
        const newToken = 'ptk_live_' + Math.random().toString(36).substring(2, 15);

        return NextResponse.json({
            success: true,
            token: newToken,
            slots: slots,
            partnerId: partnerId,
            message: 'Activation successful.'
        });

    } catch (error: any) {
        console.error('Subscription API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
