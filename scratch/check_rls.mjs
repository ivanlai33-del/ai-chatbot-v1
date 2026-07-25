import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const { data: policies, error } = await supabase.rpc('pg_eval', { query: `
    SELECT schemaname, tablename, policyname, roles, cmd, qual
    FROM pg_policies 
    WHERE tablename = 'memberships'
` });

if (error) {
    console.error('Error fetching policies:', error);
} else {
    console.log('Policies for memberships:', policies);
}

const { data: rlsStatus, error: rlsErr } = await supabase.rpc('pg_eval', { query: `
    SELECT relname, relrowsecurity 
    FROM pg_class 
    WHERE relname = 'memberships'
` });

if (rlsErr) {
    console.error('Error fetching RLS status:', rlsErr);
} else {
    console.log('RLS Status for memberships:', rlsStatus);
}
