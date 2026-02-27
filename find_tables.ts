import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Checking tables...");
  const { data, error } = await supabase.from('partners').select('*').limit(1);
  console.log(error || "partners exists!");

  // Check if maybe it's singular
  const { data: d2, error: e2 } = await supabase.from('partner').select('*').limit(1);
  console.log(e2 || "partner exists!");
}
check();
