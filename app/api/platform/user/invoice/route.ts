import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    const { lineUserId, invoiceType, invoiceTitle, taxId, mailingAddress } = await req.json();

    if (!lineUserId) {
        return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
    }

    // Update level and cycle in platform_users
    const { error: userError } = await supabase
        .from('platform_users')
        .update({ 
            invoice_type: invoiceType,
            invoice_title: invoiceTitle,
            tax_id: taxId,
            mailing_address: mailingAddress,
            updated_at: new Date().toISOString()
        })
        .eq('line_user_id', lineUserId);

    if (userError) {
        return NextResponse.json({ success: false, error: userError.message }, { status: 500 });
    }

    return NextResponse.json({ 
        success: true, 
        message: 'Invoice Info Updated',
        data: { invoiceType, invoiceTitle, taxId, mailingAddress }
    });
}
