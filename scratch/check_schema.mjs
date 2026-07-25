import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const { data, error } = await supabase.rpc('get_schema_info_for_debug', {}, { head: false });

// Let's query information_schema.columns for memberships
const { data: cols, error: err } = await supabase.rpc('pg_eval', { query: `
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'memberships'
` });

// If pg_eval RPC doesn't exist, we can use a workaround or just log columns from the JS object keys.
// Since we selected a row, the keys were:
// id, org_id, user_name, user_role, avatar_url, email, is_active, created_at, organization_id
// Wait, is there a user_id column that was null?
const { data: rawData, error: rawErr } = await supabase.from('memberships').select('*').limit(1);
console.log('Keys in memberships:', Object.keys(rawData[0] || {}));
