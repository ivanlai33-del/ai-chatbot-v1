import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { encrypt, decrypt } from '@/lib/encryption';

export const dynamic = 'force-dynamic';

export async function GET() {
    const diagnostics: any = {
        time: new Date().toISOString(),
        env: {
            MASTER_OPENAI_KEY: (process.env.MASTER_OPENAI_KEY || process.env.OPENAI_API_KEY) ? 'Set' : 'Missing',
            SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
            SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing',
            ENCRYPTION_KEY: process.env.ENCRYPTION_KEY ? 'Set' : 'Using Default',
            MASTER_LINE_TOKEN: (process.env.MASTER_LINE_TOKEN || process.env.LINE_CHANNEL_ACCESS_TOKEN) ? 'Set' : 'Missing (Crucial for Master Bot)',
            MASTER_LINE_SECRET: (process.env.MASTER_LINE_SECRET || process.env.LINE_CHANNEL_SECRET) ? 'Set' : 'Missing (Crucial for Master Bot)',
        },
        tests: {
            encryption_loop: false,
            supabase_connection: false,
        }
    };

    // Test Encryption
    try {
        const testStr = "ping-test-123";
        const encrypted = encrypt(testStr);
        const decrypted = decrypt(encrypted);
        diagnostics.tests.encryption_loop = (decrypted === testStr);
    } catch (e: any) {
        diagnostics.tests.encryption_loop = `Error: ${e.message}`;
    }

    // Test Supabase
    try {
        const { error } = await supabase.from('bots').select('*', { count: 'exact', head: true });
        diagnostics.tests.supabase_connection = error ? `Error: ${error.message}` : true;
    } catch (e: any) {
        diagnostics.tests.supabase_connection = `Error: ${e.message}`;
    }

    return NextResponse.json(diagnostics);
}
