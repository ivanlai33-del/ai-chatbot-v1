import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const { data, error } = await supabase.from('line_channel_configs').select('id, user_id, channel_name, setup_token, status');
if (error) console.error(error);
console.log(JSON.stringify(data, null, 2));
