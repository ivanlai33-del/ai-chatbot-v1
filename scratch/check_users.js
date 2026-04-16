const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUsers() {
  const { data, error } = await supabase
    .from('direct_users')
    .select('line_user_id, email, updated_at')
    .order('updated_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching users:', error);
  } else {
    console.log('Recent Users:', JSON.stringify(data, null, 2));
  }
}

checkUsers();
