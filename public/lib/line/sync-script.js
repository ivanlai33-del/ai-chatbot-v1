(function() {
    const setupToken = "REPLACE_WITH_YOUR_SETUP_TOKEN";
    const domain = "REPLACE_WITH_YOUR_DOMAIN";
    
    // Check if on correct domain
    if (!window.location.hostname.includes('developers.line.biz')) {
        alert("❌ 請在 LINE Developers Console 頁面執行本腳本！");
        return;
    }

    // UI Overlay
    const overlayId = 'ai-sync-overlay';
    if (document.getElementById(overlayId)) document.getElementById(overlayId).remove();
    
    const overlay = document.createElement('div');
    overlay.id = overlayId;
    overlay.style = `
        position: fixed; top: 30px; right: 30px; z-index: 2147483647;
        width: 340px; background: #ffffff; color: #1e293b;
        padding: 24px; border-radius: 20px;
        box-shadow: 0 20px 50px rgba(0,0,0,0.15);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        border: 1px solid #e2e8f0;
    `;
    
    overlay.innerHTML = `
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
            <div id="ai-status-pulse" style="width:10px; height:10px; border-radius:50%; background:#06C755; animation:pulse 1.5s infinite"></div>
            <h3 style="margin:0; font-size:18px; font-weight:900; letter-spacing:-0.02em">AI 智能同步助手</h3>
        </div>
        <div id="sync-status-text" style="font-size:14px; color:#64748b; line-height:1.6; margin-bottom:20px;">
            正在掃描當前頁面的 LINE 串接資料...
        </div>
        <div id="sync-progress" style="height:6px; background:#f1f5f9; border-radius:3px; overflow:hidden; margin-bottom:12px;">
            <div id="sync-bar" style="width:0%; height:100%; background:#06C755; transition:width 0.4s ease"></div>
        </div>
        <style>
            @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
        </style>
    `;
    document.body.appendChild(overlay);

    const updateStatus = (text, progress, color, title) => {
        const textEl = document.getElementById('sync-status-text');
        const barEl = document.getElementById('sync-bar');
        const pulseEl = document.getElementById('ai-status-pulse');
        if (textEl) textEl.innerHTML = text;
        if (barEl) {
            barEl.style.width = `${progress}%`;
            if (color) {
                barEl.style.background = color;
                if (pulseEl) pulseEl.style.background = color;
            }
        }
    };

    async function startSync() {
        // Detect current page context
        const isChannelPage = window.location.pathname.includes('/channel/');
        
        if (!isChannelPage) {
            updateStatus(`
                <span style="color:#e11d48; font-weight:900; display:block; margin-bottom:8px;">⚠️ 偵測不到頻道資料</span>
                您目前在 LINE 主頁面。請先點擊您要串接的 <b>【Messaging API 頻道元件】</b>（如下方的機器人圖示）進入設定頁面後，再次點擊本同步按鈕。
            `, 0, "#e11d48");
            return;
        }

        try {
            updateStatus("正在尋找 LINE 金鑰資料...", 30);
            
            let channelId = "";
            let channelSecret = "";
            let botBasicId = "";
            let channelAccessToken = "";

            const clean = (val) => val ? val.trim().split('\n')[0] : "";
            const labels = Array.from(document.querySelectorAll('label, span, th, dt, h5'));
            
            const findValue = (searchText) => {
                const label = labels.find(el => el.innerText.trim().toLowerCase().includes(searchText.toLowerCase()));
                if (!label) return "";
                let container = label.parentElement;
                for (let i = 0; i < 4; i++) {
                    if (!container) break;
                    const input = container.querySelector('input, textarea');
                    if (input && input.value) return input.value;
                    const next = container.nextElementSibling;
                    if (next) {
                        const nextInput = next.querySelector('input, textarea');
                        if (nextInput && nextInput.value) return nextInput.value;
                        const nextText = next.innerText.trim();
                        if (nextText && nextText.length > 5 && !nextText.includes("Required")) return nextText.split('\n')[0];
                    }
                    container = container.parentElement;
                }
                return "";
            };

            channelId = findValue("Channel ID");
            channelSecret = findValue("Channel secret");
            botBasicId = findValue("Bot basic ID");
            channelAccessToken = findValue("Channel access token");

            // Final check: if data found
            if (!channelId && !channelSecret && !channelAccessToken) {
                updateStatus(`
                    <span style="color:#f59e0b; font-weight:900; display:block; margin-bottom:8px;">⚠️ 未偵測到金鑰欄位</span>
                    請切換到 <b>【Basic Settings】</b> 或 <b>【Messaging API】</b> 分頁，確保頁面顯示出 Channel ID 與 Access Token 後再次執行。
                `, 50, "#f59e0b");
                return;
            }

            updateStatus("發送資料到 AI 店長智庫...", 80);

            const res = await fetch(`${domain}/api/line/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ setupToken, data: {
                    channelId: clean(channelId),
                    channelSecret: clean(channelSecret),
                    channelAccessToken: clean(channelAccessToken),
                    botBasicId: clean(botBasicId)
                }})
            });
            const result = await res.json();
            
            if (result.success) {
                updateStatus(`
                    <b style="color:#059669; font-size:16px;">✅ 同步成功！</b><br/>
                    您的 AI 店長已上線。您可以回到「AI 智庫」頁面查看結果囉。
                `, 100, "#059669");
                setTimeout(() => overlay.remove(), 10000);
            } else {
                throw new Error(result.message || "同步服務暫時不可用");
            }

        } catch (e) {
            updateStatus(`❌ 同步失敗: ${e.message}`, 100, "#ef4444");
        }
    }

    setTimeout(startSync, 500);
})();
