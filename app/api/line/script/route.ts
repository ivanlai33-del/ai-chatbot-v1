import { NextRequest, NextResponse } from 'next/server';

/**
 * Returns the full LINE synchronization script.
 * Features:
 * 1. Automatic data scraping (ID, Secret, Token, Basic ID).
 * 2. Auto-Config: Automatically sets Webhook URL and enables "Use webhook" toggle.
 * 3. Support for both single bot sync and bulk bot initialization.
 */
export async function GET(req: NextRequest) {
    const setupToken = req.nextUrl.searchParams.get('t') || '';
    const domain = req.nextUrl.searchParams.get('d') || '';
    const webhookUrl = req.nextUrl.searchParams.get('w') || '';

    const script = `(function(t,d,wu){
  if(!d){
    alert("❌ [錯誤: E101] 無法偵測到儀表板網址，請重新整理頁面後再試。");
    return;
  }
  if(!window.location.hostname.includes("developers.line.biz")){
    alert("❌ [錯誤: E102] 請在 LINE Developers Console 頁面執行！");
    return;
  }

  // 移除舊 overlay
  let o = document.getElementById("ai-sync-overlay");
  if (o) o.remove();

  // 建立 overlay UI
  o = document.createElement("div");
  o.id = "ai-sync-overlay";
  o.style = "position:fixed;top:30px;right:30px;z-index:2147483647;width:340px;background:#fff;color:#1e293b;padding:24px;border-radius:20px;box-shadow:0 20px 50px rgba(0,0,0,.15);font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;border:1px solid #e2e8f0";
  o.innerHTML = ''
    + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">'
    + '  <div style="display:flex;align-items:center;gap:12px">'
    + '    <div id="ai-sync-pulse" style="width:10px;height:10px;border-radius:50%;background:#38bdf8;animation:ai-sync-pulse 1.5s infinite"></div>'
    + '    <h3 style="margin:0;font-size:18px;font-weight:900">AI串接診斷助手</h3>'
    + '  </div>'
    + '  <div id="ai-err-code" style="display:none;font-size:10px;padding:2px 6px;background:#fee2e2;color:#ef4444;border-radius:4px;font-weight:bold"></div>'
    + '</div>'
    + '<div id="ai-sync-status" style="font-size:13px;color:#64748b;line-height:1.5;margin-bottom:16px">'
    + '  正在初始化偵測系統...'
    + '</div>'
    + '<div id="ai-sync-checklist" style="background:#f8fafc;padding:12px;border-radius:12px;margin-bottom:16px;font-size:12px;display:none">'
    + '  <div id="check-id" style="display:flex;justify-content:space-between;margin-bottom:4px"><span>Channel ID</span><span class="val">⏳</span></div>'
    + '  <div id="check-sec" style="display:flex;justify-content:space-between;margin-bottom:4px"><span>Channel Secret</span><span class="val">⏳</span></div>'
    + '  <div id="check-bot" style="display:flex;justify-content:space-between;margin-bottom:4px"><span>Bot Basic ID</span><span class="val">⏳</span></div>'
    + '  <div id="check-tok" style="display:flex;justify-content:space-between"><span>Access Token</span><span class="val">⏳</span></div>'
    + '</div>'
    + '<div style="height:6px;background:#f1f5f9;border-radius:3px;overflow:hidden">'
    + '  <div id="ai-sync-bar" style="width:0;height:100%;background:#38bdf8;transition:width .4s ease"></div>'
    + '</div>'
    + '<div id="ai-sync-auto-config" style="margin-top:16px;display:none;border-top:1px solid #f1f5f9;padding-top:16px">'
    + '  <button id="ai-config-btn" style="width:100%;padding:14px;background:#10b981;color:#fff;border:0;border-radius:14px;font-weight:900;cursor:pointer;box-shadow:0 10px 25px rgba(16,185,129,.3);display:flex;align-items:center;justify-content:center;gap:8px;font-size:14px">'
    + '    ⚡ 自動設定 Webhook'
    + '  </button>'
    + '  <p style="font-size:10px;color:#94a3b8;margin-top:8px;text-align:center;font-weight:bold">將自動填入網址並開啟 Use webhook</p>'
    + '</div>'
    + '<style>'
    + '@keyframes ai-sync-pulse {0%,100%{opacity:1}50%{opacity:.3}}'
    + '.sync-success {color:#059669;font-weight:bold}'
    + '.sync-fail {color:#ef4444;font-weight:bold}'
    + '</style>';
  document.body.appendChild(o);

  function updateChecklist(results){
    var list = document.getElementById("ai-sync-checklist");
    if (list) list.style.display = "block";
    var map = { id: "check-id", sec: "check-sec", bot: "check-bot", tok: "check-tok" };
    let count = 0;
    for (var k in map){
      var el = document.getElementById(map[k]);
      if (el) {
        var val = el.querySelector(".val");
        if (results[k]) { val.innerHTML = "✅ 已取得"; val.className = "val sync-success"; count++; }
        else { val.innerHTML = "❌ 未偵測"; val.className = "val sync-fail"; }
      }
    }
    return count;
  }

  function updateStatus(message, percent, color, errCode){
    var st = document.getElementById("ai-sync-status");
    var bar = document.getElementById("ai-sync-bar");
    var dot = document.getElementById("ai-sync-pulse");
    var ec = document.getElementById("ai-err-code");
    
    if (st) st.innerHTML = message;
    if (bar) {
      bar.style.width = (percent || 0) + "%";
      if (color) bar.style.background = color;
    }
    if (dot && color) dot.style.background = color;
    
    if (errCode && ec) {
        ec.innerText = "代碼: " + errCode;
        ec.style.display = "block";
    } else if (ec) {
        ec.style.display = "none";
    }
  }

  async function handleAutoConfig(){
    const btn = document.getElementById("ai-config-btn");
    if (btn) btn.disabled = true;
    updateStatus("🚀 正在自動填寫並開啟 Webhook...", 80, "#10b981");
    
    // 1. 填寫 Webhook URL
    const nodes = Array.from(document.querySelectorAll("label, span, h5, div")).filter(el => (el.textContent||"").includes("Webhook URL"));
    let inputField = null;
    let updateBtn = null;

    for(let n of nodes){
        let p = n.parentElement;
        for(let i=0; i<6 && p; i++){
            inputField = p.querySelector("input[type='text']");
            updateBtn = Array.from(p.querySelectorAll("button")).find(b => (b.textContent||"").includes("Update") || (b.textContent||"").includes("Edit"));
            if(inputField && updateBtn) break;
            p = p.parentElement;
        }
        if(inputField) break;
    }

    if(inputField && wu){
        inputField.value = wu;
        inputField.dispatchEvent(new Event('input', { bubbles: true }));
        inputField.dispatchEvent(new Event('change', { bubbles: true }));
        inputField.dispatchEvent(new Event('blur', { bubbles: true }));
        
        // 給點時間讓 React 控制組件更新
        setTimeout(() => {
            updateBtn.click();
            console.log("✅ Webhook URL 已填寫並點擊更新");
        }, 300);
    } else {
        console.warn("❌ Webhook 填寫失敗：找不到元素");
    }

    // 2. 開啟 Use Webhook 
    setTimeout(() => {
        const toggleLabels = Array.from(document.querySelectorAll("label, span, div")).filter(el => (el.textContent||"").includes("Use webhook"));
        let switchEnabled = false;
        
        for(let l of toggleLabels){
            let p = l.parentElement;
            for(let i=0; i<6 && p; i++){
                const toggle = p.querySelector("input[type='checkbox'], .custom-control-input, .switch, button[role='switch']");
                // Check if it's already ON
                const isOff = p.innerText.includes("Disabled") || p.innerText.includes("OFF") || (toggle && !toggle.checked && toggle.getAttribute("aria-checked") !== "true");
                
                if(toggle && isOff) {
                    toggle.click();
                    switchEnabled = true;
                    console.log("✅ Use Webhook 已開啟");
                    break;
                }
                p = p.parentElement;
            }
            if (switchEnabled) break;
        }
        
        updateStatus('<b style="color:#059669;font-size:15px">🎉 Webhook 配置完成！</b><br/>網址已填入且開關已開啟。', 100, "#059669");
        if (btn) btn.style.display = "none";

        // 通知後端自動化已完成
        fetch(d + "/api/line/sync", {
            method: "POST", mode: "cors", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ setupToken: t, isAutomated: true })
        }).catch(err => console.error("Failed to notify backend:", err));
    }, 1500);
  }

  async function scanListingPage(){
    updateStatus("正在掃描您的官方帳號清單...", 20);
    const cards = Array.from(document.querySelectorAll("a[href*='/channel/'], div[class*='card']"))
      .filter((el) => {
        const text = el.innerText || "";
        return text && !text.includes("Create a new channel") && text.length > 3;
      });
      
    if (cards.length === 0) {
      updateStatus('⚠️ 偵測不到商店列表。<br/>請確認您位於 LINE Developers Console 的「Channel」列表分頁。', 0, "#ef4444", "E103");
      return;
    }

    const discovered = cards.map((c, i) => {
      const name = (c.querySelector("h3, strong, div[class*='name']"))?.innerText?.trim() || "未命名";
      const icon = (c.querySelector("img"))?.src || "";
      const type = c.innerText.includes("Messaging API") ? "Messaging API" : (c.innerText.includes("LINE Login") ? "LINE Login" : "Other");
      return { id: i, name, icon, type };
    }).filter(c => c.type === "Messaging API");

    if (discovered.length === 0) {
      updateStatus('⚠️ 偵測不到 Messaging API 類型的商店。<br/>請確認列表內有正確的官方帳號項目。', 0, "#ef4444", "E103");
      return;
    }

    updateStatus(\`找到 \${discovered.length} 個 AI 店長候選專案。<br/>您可以勾選想要批次串接的店家 (最多 5 間)：\`, 40);
    
    var listHtml = '<div style="max-height:200px;overflow-y:auto;margin:15px 0;border:1px solid #edf2f7;border-radius:12px;padding:8px">';
    discovered.forEach((bot, idx) => {
      const isChecked = idx < 5 ? "checked" : "";
      listHtml += \`<label style="display:flex;align-items:center;gap:10px;padding:8px;cursor:pointer;border-bottom:1px solid #f1f5f9">
        <input type="checkbox" class="ai-bot-cb" data-name="\${bot.name}" data-icon="\${bot.icon}" \${isChecked} style="width:16px;height:16px">
        <img src="\${bot.icon}" style="width:24px;height:24px;border-radius:6px;object-contain:cover" onerror="this.style.display='none'">
        <span style="font-size:12px;font-weight:bold;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">\${bot.name}</span>
      </label>\`;
    });
    listHtml += '</div>';
    listHtml += '<button id="ai-bulk-btn" style="width:100%;padding:10px;background:#38bdf8;color:#fff;border:0;border-radius:10px;font-weight:bold;cursor:pointer">確認建立並加入儀表板</button>';
    
    document.getElementById("ai-sync-status").innerHTML = listHtml;
    
    const checkboxes = document.querySelectorAll(".ai-bot-cb");
    checkboxes.forEach(cb => {
      cb.addEventListener('change', function() {
        const checkedCount = document.querySelectorAll(".ai-bot-cb:checked").length;
        if (checkedCount > 5) {
          this.checked = false;
          alert("最多只能選擇 5 間店家進行批次同步喔！");
        }
      });
    });
    
    document.getElementById("ai-bulk-btn").onclick = async () => {
      const selected = Array.from(document.querySelectorAll(".ai-bot-cb:checked")).map((cb) => ({
        name: cb.getAttribute("data-name"),
        icon: cb.getAttribute("data-icon")
      }));
      
      if (selected.length === 0) { alert("請至少選擇一個店家！"); return; }
      
      updateStatus("正在建立智庫與店長空間...", 70, "#38bdf8");
      try {
        const resp = await fetch(d + "/api/line/bulk-sync", {
          method: "POST", mode: "cors", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ setupToken: t, bots: selected })
        });
        const res = await resp.json();
        if (!resp.ok) throw new Error(res.error || "建立失敗");
        
        updateStatus(\`<b style="color:#059669;font-size:16px">✅ \${res.count} 間店長初始化成功！</b><br/>您可以回到儀表板開始設定。點擊個別店長可完成最終串接。\`, 100, "#059669");
        setTimeout(() => o.remove(), 10000);
      } catch(e) {
        updateStatus("⚠️ 批次建立失敗：" + e.message, 100, "#ef4444", "E303");
      }
    };
  }

  async function runSync(){
    const currentPath = window.location.href;
    const isListingPage = window.location.pathname.endsWith("/console/") || window.location.pathname.endsWith("/console") || !window.location.pathname.includes("/channel/");
    
    if (isListingPage) {
      scanListingPage();
      return;
    }

    if (!window.location.pathname.includes("/channel/")){
      updateStatus('⚠️ 偵測不到頻道專案頁面。<br/>請先點擊進入您的頻道專案後，再次執行同步。', 0, "#ef4444", "E103");
      return;
    }

    const storageKey = "line_sync_" + t;
    let cache;
    try { cache = JSON.parse(localStorage.getItem(storageKey) || "{}"); } catch(e) { cache = {}; }

    // Check for Auto-Config availability (Messaging API tab)
    const isMessagingApiTab = currentPath.includes("messaging-api");
    if(isMessagingApiTab && wu) {
        const configArea = document.getElementById("ai-sync-auto-config");
        if(configArea) {
            configArea.style.display = "block";
            document.getElementById("ai-config-btn").onclick = handleAutoConfig;
        }
    }

    updateStatus("正在偵測金鑰資料...", 30);

    function findFieldText(keywords, regex){
      const nodes = Array.from(document.querySelectorAll("label,span,th,dt,h5,div"));
      for (let kw of keywords){
        const label = nodes.find(el => (el.innerText || "").trim().toLowerCase().includes(kw.toLowerCase()));
        if (!label) continue;
        let p = label.parentElement;
        for (let i=0; i<6 && p; i++){
          const text = p.innerText || "";
          const m = text.match(regex);
          if (m) return m[0];
          const btn = p.querySelector("button");
          if (btn && (btn.innerText.includes("Show") || btn.innerText.includes("Issue"))){
            updateStatus('⚠️ 偵測到金鑰尚未顯示。<br/><br/>請先點擊該區塊的 <b>「Show」或「Issue」</b> 按鈕，讓完整金鑰出現在畫面上，然後再次點擊書籤。', 40, "#f59e0b", "E201");
            return "HIDDEN";
          }
          p = p.parentElement;
        }
      }
      return "";
    }

    const channelId = findFieldText(["Channel ID"], /\\d{10}/);
    const channelSecret = findFieldText(["Channel secret","secret"], /[a-f0-9]{32}/i);
    const botBasicId = findFieldText(["Bot basic ID"], /@[a-z0-9_]+/i);

    function findAccessToken(){
      const longNodes = Array.from(document.querySelectorAll("div,span,p")).filter(el => (el.innerText || "").match(/[a-zA-Z0-9+/=]{100,}/));
      if (longNodes.length > 0){
        const m = longNodes[0].innerText.match(/[a-zA-Z0-9+/=]{100,}/);
        if (m) return m[0];
      }
      return findFieldText(["access token","long-lived"], /[a-zA-Z0-9+/=]{100,}/);
    }

    const channelAccessToken = findAccessToken();
    const channelName = (document.querySelector(".channel-header__name")?.innerText || document.querySelector("h3")?.innerText || "").trim();
    const channelIcon = (document.querySelector(".channel-header__icon img"))?.src || "";

    if (channelId && channelId !== "HIDDEN") cache.channelId = channelId;
    if (channelSecret && channelSecret !== "HIDDEN") cache.channelSecret = channelSecret;
    if (botBasicId && botBasicId !== "HIDDEN") cache.botBasicId = botBasicId;
    if (channelAccessToken && channelAccessToken !== "HIDDEN") cache.channelAccessToken = channelAccessToken;
    if (channelName) cache.channelName = channelName;
    if (channelIcon) cache.channelIcon = channelIcon;

    localStorage.setItem(storageKey, JSON.stringify(cache));

    const currentResults = {
      id: !!cache.channelId,
      sec: !!cache.channelSecret,
      bot: !!cache.botBasicId,
      tok: !!cache.channelAccessToken
    };
    const collectedCount = updateChecklist(currentResults);

    const gotAnyOnThisPage = (channelId && channelId !== "HIDDEN") || (channelSecret && channelSecret !== "HIDDEN") || (botBasicId && botBasicId !== "HIDDEN") || (channelAccessToken && channelAccessToken !== "HIDDEN");
    
    if (!gotAnyOnThisPage && !isMessagingApiTab){
      updateStatus('⚠️ 目前頁面尚未偵測到新資料。<br/>請確認頁面正確且金鑰已呈現「顯示」狀態。', 45, "#f59e0b", "E202");
      return;
    }

    updateStatus("正在將資料同步至「AI 智庫」...", 70, "#38bdf8");

    try{
      const resp = await fetch(d + "/api/line/sync", {
        method: "POST", mode: "cors", headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(10000),
        body: JSON.stringify({ 
          setupToken: t, 
          channelId: cache.channelId, 
          channelSecret: cache.channelSecret, 
          channelAccessToken: cache.channelAccessToken, 
          botBasicId: cache.botBasicId,
          channelName: cache.channelName,
          channelIcon: cache.channelIcon
        })
      });
      const res = await resp.json();
      if (!resp.ok) throw new Error(res.error || "伺服器同步失敗");
      
      // Update our local webhook url if server returns one
      if (res.webhookUrl) {
        wu = res.webhookUrl;
        console.log("🔄 取得最新 Webhook:", wu);
      }

      if (res.isComplete && collectedCount === 4){
        localStorage.removeItem(storageKey);
        updateStatus('<b style="color:#059669;font-size:16px">✅ 資料同步完成！</b>' + (isMessagingApiTab && wu ? '<br/>請點擊下方的自動設定按鈕完成最後配置。' : '<br/>您可以關閉此分頁回到儀表板。'), 100, "#059669");
        if(!isMessagingApiTab) setTimeout(() => o.remove(), 10000);
      } else {
        updateStatus('<b style="color:#3b82f6;font-size:16px">⚡ 部份同步成功 (' + collectedCount + '/4)</b><br/>請點擊 Sidebar 切換到另一個分頁 (Basic Settings 或 Messaging API) 並再次執行書籤。', 90, "#3b82f6");
      }
    } catch(err){
      const isNetwork = err.name === "TimeoutError" || err.message.includes("fetch");
      updateStatus("⚠️ 同步出錯：" + err.message, 100, "#ef4444", isNetwork ? "E301" : "E302");
    }
  }

  setTimeout(runSync, 500);
})("${setupToken}", "${domain}", "${webhookUrl}");`;

    return new NextResponse(script, {
        headers: {
            'Content-Type': 'application/javascript',
            'Access-Control-Allow-Origin': '*',
        },
    });
}
