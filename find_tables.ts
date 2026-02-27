import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function find() {
  // If we can't get table list via RPC, we'll try common variations
  const tables = ['faq', 'faqs', 'bot_faq', 'bot_faqs', 'knowledge', 'ai_knowledge'];
  for (const table of tables) {
    const { error } = await supabase.from(table).select('*', { count: 'exact', head: true }).limit(1);
    if (!error) {
       console.log(`Table found: ${table}`);
    } else {
       console.log(`Table not found or error: ${table} (${error.message})`);
    }
  }
}

find()
