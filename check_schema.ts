import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
  const { data: bots } = await supabase.from('bots').select('*').limit(1)
  console.log('Bots Schema:', Object.keys(bots?.[0] || {}))
  
  const { data: partners } = await supabase.from('partners').select('*').limit(1)
  console.log('Partners Schema:', Object.keys(partners?.[0] || {}))
}

check()
