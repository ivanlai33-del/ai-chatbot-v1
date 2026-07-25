import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("=== CHECKING BOTS ===");
  const { data: bots, error: botsErr } = await supabase.from('bots').select('*');
  console.log("bots table count:", bots?.length, "error:", botsErr);
  if (bots && bots.length > 0) {
    console.log("sample bot:", bots[0]);
  }

  console.log("=== CHECKING LINE_CHANNEL_CONFIGS ===");
  const { data: lineBots, error: lineErr } = await supabase.from('line_channel_configs').select('*');
  console.log("line_channel_configs count:", lineBots?.length, "error:", lineErr);
  if (lineBots && lineBots.length > 0) {
    console.log("sample line_channel_configs:", lineBots.map(b => ({ id: b.id, name: b.channel_name, user_id: b.user_id, status: b.status })));
  }

  console.log("=== CHECKING DIRECT_USERS ===");
  const { data: users, error: usersErr } = await supabase.from('direct_users').select('*');
  console.log("direct_users count:", users?.length, "error:", usersErr);
  if (users && users.length > 0) {
    console.log("users:", users.map(u => ({ id: u.id, line_user_id: u.line_user_id, display_name: u.display_name, email: u.email })));
  }
}

check();
