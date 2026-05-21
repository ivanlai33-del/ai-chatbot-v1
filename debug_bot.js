const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkBot() {
  console.log('--- 診斷報告：AI 股市分析師 ---');
  
  // 1. Find the bot
  const { data: bots, error: bError } = await supabase
    .from('line_channel_configs')
    .select('id, channel_name, active')
    .ilike('channel_name', '%股市分析師%');

  if (bError || !bots.length) {
    console.log('❌ 找不到名為「AI 股市分析師」的店長。');
    return;
  }

  const bot = bots[0];
  console.log(`✅ 找到店長：${bot.channel_name} (ID: ${bot.id})`);
  console.log(`狀態：${bot.active ? '運作中' : '已關閉'}`);

  // 2. Get recent chat logs
  const { data: logs, error: lError } = await supabase
    .from('chat_logs')
    .select('created_at, user_message, ai_response, metadata')
    .eq('config_id', bot.id)
    .order('created_at', { ascending: false })
    .limit(10);

  if (lError) {
    console.log('❌ 無法則取對話紀錄：', lError.message);
    return;
  }

  console.log('\n--- 最近 10 筆對話紀錄 ---');
  logs.forEach((log, i) => {
    console.log(`[${i+1}] ${log.created_at}`);
    console.log(`問：${log.user_message.substring(0, 50)}...`);
    console.log(`答：${log.ai_response ? log.ai_response.substring(0, 50) + '...' : '🔴 (無回應)'}`);
    if (log.metadata) console.log(`備註：${JSON.stringify(log.metadata)}`);
    console.log('-------------------');
  });
}

checkBot();
