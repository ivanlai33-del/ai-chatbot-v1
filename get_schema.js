const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
    // get user_usage_stats columns
    const { data: usageCols } = await supabase.rpc('get_columns', { table_name: 'user_usage_stats' });
    console.log("Usage Stats columns:", usageCols);
}
run();
