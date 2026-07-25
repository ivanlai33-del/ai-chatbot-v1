import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
    const { data: adminUser } = await supabase.from('direct_users').select('id').eq('line_user_id', 'Ud8b8dd79162387a80b2b5a4aba20f604').single();
    if (!adminUser) {
        console.log("Admin user not found in direct_users!");
        return;
    }
    const realId = adminUser.id;
    console.log("Real Admin ID:", realId);

    const { data: configs, error: configError } = await supabase.from('line_channel_configs').update({ user_id: realId }).eq('user_id', '00000000-0000-0000-0000-000000000001').select('id');
    console.log("Updated configs:", configs?.length, configError || '');

    const { data: stores, error: storeError } = await supabase.from('store_configs').update({ user_id: realId }).eq('user_id', '00000000-0000-0000-0000-000000000001').select('id');
    console.log("Updated store_configs:", stores?.length, storeError || '');
}
run();
