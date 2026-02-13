import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const eventType = body.event_type;
        const resource = body.resource;
        const customId = resource.custom_id; // This is the storeName we passed during creation

        console.log(`[PayPal Webhook] Received ${eventType} for ${customId}`);

        if (!customId) {
            return NextResponse.json({ message: 'Missing custom_id' }, { status: 400 });
        }

        // Subscription Termination Events
        const terminationEvents = [
            'BILLING.SUBSCRIPTION.CANCELLED',
            'BILLING.SUBSCRIPTION.EXPIRED',
            'BILLING.SUBSCRIPTION.SUSPENDED',
            'BILLING.SUBSCRIPTION.PAYMENT.FAILED'
        ];

        if (terminationEvents.includes(eventType)) {
            console.log(`[PayPal Webhook] Deactivating bot for store: ${customId}`);

            const { error } = await supabase
                .from('bots')
                .update({ status: 'inactive' })
                .eq('store_name', customId);

            if (error) {
                console.error('[PayPal Webhook] Supabase Update Error:', error.message);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }
        }

        // Subscription Activation / Renewal Events
        const activationEvents = [
            'BILLING.SUBSCRIPTION.CREATED',
            'BILLING.SUBSCRIPTION.ACTIVATED',
            'BILLING.SUBSCRIPTION.RENEWED',
            'PAYMENT.SALE.COMPLETED'
        ];

        if (activationEvents.includes(eventType)) {
            console.log(`[PayPal Webhook] Activating/Renewing bot for store: ${customId}`);

            const { error } = await supabase
                .from('bots')
                .update({
                    status: 'active',
                    current_period_end: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString() // Extend by 31 days
                })
                .eq('store_name', customId);

            if (error) {
                console.error('[PayPal Webhook] Supabase Update Error:', error.message);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }
        }

        return NextResponse.json({ status: 'success' });
    } catch (error: any) {
        console.error('[PayPal Webhook] Error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Support HEAD/GET for PayPal verification if needed
export async function GET() {
    return new Response('PayPal Webhook Active', { status: 200 });
}
