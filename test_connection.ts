import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  console.log('Testing connection to:', supabaseUrl);
  try {
    const { data: bots, error } = await supabase.from('bots').select('*').limit(1);
    if (error) {
        console.error('Bots Error:', error.message);
    } else {
        console.log('Bots found:', bots?.length);
    }
    
    const { data: faq, error: faqError } = await supabase.from('faq').select('*').limit(1);
    if (faqError) {
        console.error('FAQ Error:', faqError.message);
    } else {
        console.log('FAQ found:', faq?.length);
    }
  } catch (e: any) {
    console.error('Execution error:', e.message);
  }
}

test()
