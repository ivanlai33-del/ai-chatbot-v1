import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (typeof window === 'undefined') {
    console.log('[Supabase] Initializing with key starting with:', supabaseKey?.substring(0, 10));
    console.log('[Supabase] Service Role Key is configured:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export const supabase = createClient(supabaseUrl, supabaseKey);
