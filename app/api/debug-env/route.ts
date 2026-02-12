import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { encrypt, decrypt } from '@/lib/encryption';

export const dynamic = 'force-dynamic';

export async function GET() {
    const diagnostics: any = {
        status: "Debugging System Active",
        timestamp: new Date().toISOString(),
        environment: {
            MASTER_OPENAI_KEY: (process.env.MASTER_OPENAI_KEY || process.env.OPENAI_API_KEY) ? 'Set' : 'Missing',
            SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
            SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing',
            ENCRYPTION_KEY: process.env.ENCRYPTION_KEY ? 'Set' : 'Using Default',
            LINE_TOKEN_AVAILABLE: (process.env.MASTER_LINE_TOKEN || process.env.LINE_CHANNEL_ACCESS_TOKEN) ? 'Yes' : 'No',
            LINE_SECRET_AVAILABLE: (process.env.MASTER_LINE_SECRET || process.env.LINE_CHANNEL_SECRET) ? 'Yes' : 'No',
        },
        checks: {
            encryption: false,
            supabase: false,
        }
    };

    try {
        const test = "ping";
        diagnostics.checks.encryption = (decrypt(encrypt(test)) === test);
    } catch (e: any) { diagnostics.checks.encryption = e.message; }

    try {
        const { error } = await supabase.from('bots').select('*', { count: 'exact', head: true });
        diagnostics.checks.supabase = error ? error.message : "Connection Successful";
    } catch (e: any) { diagnostics.checks.supabase = e.message; }

    return NextResponse.json(diagnostics);
}
