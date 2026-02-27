import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
  const { data: bots, error } = await supabase.from('bots').select('*').limit(1)
  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Bots Schema:', Object.keys(bots?.[0] || {}))
  }
}

check()
