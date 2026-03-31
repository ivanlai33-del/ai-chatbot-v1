import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    console.log('[Debug] Verifying database tables...');
    
    const tables = ['direct_users', 'line_channel_configs', 'store_configs', 'subscriptions'];
    const results: any = {};

    for (const table of tables) {
        const { error } = await supabase.from(table).select('*', { count: 'exact', head: true }).limit(1);
        results[table] = error ? `Error: ${error.message}` : 'Exists';
    }

    return NextResponse.json(results);
}
