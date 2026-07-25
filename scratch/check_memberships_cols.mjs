import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const { data, error } = await supabase.rpc('get_schema_info_for_debug', {}, { head: false }); // or just query information_schema

// If we don't have get_schema_info_for_debug, we can just do a query using postgres raw SQL if supabase allows RPC, or just select 1 row
const { data: cols, error: err } = await supabase.from('memberships').select('*').limit(1);
if (err) {
    console.error('Error fetching memberships:', err);
} else {
    console.log('Memberships record:', cols);
}
