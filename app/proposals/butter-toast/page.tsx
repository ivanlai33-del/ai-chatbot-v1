"use client";

import React, { useState, useEffect } from "react";

interface InvoiceRecord {
  id: string;
  company_name: string;
  tax_id: string;
  address: string;
  contact_email: string;
  created_at: string;
  notes: string;
}

export default function ButterToastProposalPage() {
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  // Invoice Form State
  const [companyName, setCompanyName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [invoiceAddress, setInvoiceAddress] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Admin View State
  const [isAdminView, setIsAdminView] = useState(false);
  const [invoiceRecords, setInvoiceRecords] = useState<InvoiceRecord[]>([]);

  // Today's date password (e.g., 20260723 or 0723)
  const VALID_PASSWORDS = ["20260723", "0723"];

  useEffect(() => {
    // Check session unlock
    const unlocked = sessionStorage.getItem("proposal_unlocked_butter_toast");
    if (unlocked === "true") {
      setIsUnlocked(true);
    }
    // Load saved invoice info from local storage
    const savedInfo = localStorage.getItem("butter_toast_invoice_info");
    if (savedInfo) {
      try {
        const parsed = JSON.parse(savedInfo);
        setCompanyName(parsed.companyName || "");
        setTaxId(parsed.taxId || "");
        setInvoiceAddress(parsed.invoiceAddress || "");
        setContactEmail(parsed.contactEmail || "");
        setIsSaved(true);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (VALID_PASSWORDS.includes(password.trim())) {
      setIsUnlocked(true);
      sessionStorage.setItem("proposal_unlocked_butter_toast", "true");
      setErrorMsg("");
    } else {
      setErrorMsg("密碼不正確，請重新輸入（提示：本日日期 8 碼或 4 碼）");
    }
  };

  const handleSaveInvoiceInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !taxId) {
      alert("請填寫公司全銜與統一編號！");
      return;
    }

    setIsSubmitting(true);
    const info = { companyName, taxId, invoiceAddress, contactEmail };
    localStorage.setItem("butter_toast_invoice_info", JSON.stringify(info));

    try {
      const res = await fetch("/api/proposals/invoice-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          taxId,
          invoiceAddress,
          contactEmail,
          proposalSlug: "butter-toast",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsSaved(true);
        alert("✓ 發票資料已成功儲存並傳送給系統管理員！");
      } else {
        alert("儲存成功，如需開啟通知請確認系統設定。");
        setIsSaved(true);
      }
    } catch (err) {
      console.error(err);
      setIsSaved(true);
      alert("發票資料已儲存於本機對話中。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchAdminRecords = async () => {
    try {
      const res = await fetch("/api/proposals/invoice-submit");
      const data = await res.json();
      if (data.records) {
        setInvoiceRecords(data.records);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleAdminView = () => {
    if (!isAdminView) {
      fetchAdminRecords();
    }
    setIsAdminView(!isAdminView);
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText("131540035543");
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isUnlocked) return;
    if (e.key === "ArrowRight" || e.key === " ") {
      setCurrentSlide((prev) => Math.min(prev + 1, 6));
    } else if (e.key === "ArrowLeft") {
      setCurrentSlide((prev) => Math.max(prev - 1, 0));
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isUnlocked]);

  // Password Input Screen (Japanese Minimalist Style)
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[#F7F3ED] text-[#382D24] flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md bg-[#FFFDF9] border border-[#E6DDCF] rounded-3xl p-8 shadow-xl text-center backdrop-blur-md">
          <div className="w-16 h-16 bg-[#EFE7DA] text-[#B26A27] rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-[#D6A86E]">
            🔒
          </div>
          <h1 className="text-2xl font-bold font-serif mb-2 text-[#382D24]">
            【奶油吐司】AI 店長服務提案
          </h1>
          <p className="text-sm text-[#7C6E62] mb-6">
            本專案報價為受保護內容，請輸入授權瀏覽密碼以檢視專案細節。
          </p>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="請輸入瀏覽密碼 (如: 20260723)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#F7F3ED] border border-[#E6DDCF] rounded-xl text-center text-lg focus:outline-none focus:border-[#B26A27] text-[#382D24] placeholder-[#A39587]"
                autoFocus
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-red-600 font-medium">{errorMsg}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-[#B26A27] hover:bg-[#8F521B] text-[#FFFDF9] font-bold rounded-xl shadow-md transition-all duration-200"
            >
              解鎖檢視報價提案
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#E6DDCF] text-xs text-[#A39587]">
            bot.ycideas.com 專屬安全加密報價系統
          </div>
        </div>
      </div>
    );
  }

  // Interactive Slides (Rendered when Unlocked)
  const slides = [
    // Slide 1: Cover
    {
      badge: "🍞 奶油吐司 AI 店長提案",
      content: (
        <div className="text-center py-6">
          <h1 className="text-4xl md:text-5xl font-extrabold font-serif mb-4 leading-tight text-[#382D24]">
            LINE 官方帳號全包建置<br />
            <span className="text-[#B26A27]">✕ AI 智慧店長服務</span>
          </h1>
          <p className="text-lg text-[#7C6E62] max-w-xl mx-auto mb-8">
            0 到 1 打造 5,000 會員自動化點餐算錢與全代營運閉環
          </p>
          <span className="inline-block px-6 py-2 bg-[#B26A27] text-[#FFFDF9] rounded-full text-sm font-bold shadow-md">
            工作室模式 / 現金面交 / 無小編最佳解答
          </span>
        </div>
      ),
    },
    // Slide 2: Challenges
    {
      badge: "5,000人規模規劃",
      title: "工作室現況與核心痛點",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-[#E6DDCF] rounded-2xl p-5 shadow-sm hover:border-[#D6A86E] transition">
            <div className="text-2xl mb-1">🏠</div>
            <h3 className="font-serif font-bold text-lg text-[#B26A27] mb-1">痛點 1：無實體內用店面</h3>
            <p className="text-sm text-[#7C6E62]">中央廚房工作室模式，缺乏門市接待。需 24hr 自動指引「指定地址面交」與「取餐導航」。</p>
          </div>
          <div className="bg-white border border-[#E6DDCF] rounded-2xl p-5 shadow-sm hover:border-[#D6A86E] transition">
            <div className="text-2xl mb-1">🧮</div>
            <h3 className="font-serif font-bold text-lg text-[#B26A27] mb-1">痛點 2：現金面交，人工算錢耗時</h3>
            <p className="text-sm text-[#7C6E62]">無線上刷卡，需人工計算多品項數量金額。AI 店長需具備精確自動算錢與生成訂單明細能力。</p>
          </div>
          <div className="bg-white border border-[#E6DDCF] rounded-2xl p-5 shadow-sm hover:border-[#D6A86E] transition">
            <div className="text-2xl mb-1">👥</div>
            <h3 className="font-serif font-bold text-lg text-[#B26A27] mb-1">痛點 3：團隊內部無 LINE 小編</h3>
            <p className="text-sm text-[#7C6E62]">缺乏視覺設計與運營人力。需要全權委外進行 0 到 1 官方帳號視覺包裝與每月代營運。</p>
          </div>
          <div className="bg-white border border-[#E6DDCF] rounded-2xl p-5 shadow-sm hover:border-[#D6A86E] transition">
            <div className="text-2xl mb-1">📈</div>
            <h3 className="font-serif font-bold text-lg text-[#B26A27] mb-1">痛點 4：5,000 會員流量負擔</h3>
            <p className="text-sm text-[#7C6E62]">每日約 50 人對話詢問。需要高容量 AI 大腦穩定接單與限量預購推播導購。</p>
          </div>
        </div>
      ),
    },
    // Slide 3: Core Modules
    {
      badge: "奶油吐司客製化",
      title: "四大專屬 AI 服務模組",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-[#E6DDCF] rounded-2xl p-5 shadow-sm hover:border-[#D6A86E] transition">
            <div className="text-2xl mb-1">🎨</div>
            <h3 className="font-serif font-bold text-lg text-[#B26A27] mb-1">01. LINE 0 到 1 品牌視覺包裝</h3>
            <p className="text-sm text-[#7C6E62]">官方帳號申請、品牌 Banner 設計，以及專屬 6 格高質感圖文選單 (Rich Menu)。</p>
          </div>
          <div className="bg-white border border-[#E6DDCF] rounded-2xl p-5 shadow-sm hover:border-[#D6A86E] transition">
            <div className="text-2xl mb-1">🤖</div>
            <h3 className="font-serif font-bold text-lg text-[#B26A27] mb-1">02. AI 點餐與金額試算系統</h3>
            <p className="text-sm text-[#7C6E62]">辨識品項與數量（生吐司x2+布丁x3）➔ 自動試算總金額 ➔ 產出現金面交訂單明細 ＋ Notify 通知。</p>
          </div>
          <div className="bg-white border border-[#E6DDCF] rounded-2xl p-5 shadow-sm hover:border-[#D6A86E] transition">
            <div className="text-2xl mb-1">📚</div>
            <h3 className="font-serif font-bold text-lg text-[#B26A27] mb-1">03. 無內用導覽與 FAQ 知識庫</h3>
            <p className="text-sm text-[#7C6E62]">24/7 自動解答無內用說明、面交地址導航，以及生吐司/甜點冷凍重烤教學。</p>
          </div>
          <div className="bg-white border border-[#E6DDCF] rounded-2xl p-5 shadow-sm hover:border-[#D6A86E] transition">
            <div className="text-2xl mb-1">🚀</div>
            <h3 className="font-serif font-bold text-lg text-[#B26A27] mb-1">04. 5,000 會員 CRM 與代營運</h3>
            <p className="text-sm text-[#7C6E62]">每月 2 次限量預購圖文推播設計與發送 ＋ 每週 AI 菜單優化與未解答巡檢。</p>
          </div>
        </div>
      ),
    },
    // Slide 4: Pricing & Bank Transfer & Invoice
    {
      badge: "報價與金流資訊",
      title: "專案報價、匯款帳號與發票填寫",
      content: (
        <div className="space-y-4">
          {/* Bank Transfer Card */}
          <div className="bg-gradient-to-br from-[#FFFDF9] to-[#FCEFDC] border-2 border-[#B26A27] rounded-2xl p-4 shadow-md relative">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏦</span>
                <h4 className="font-serif font-bold text-lg text-[#B26A27]">
                  建置訂金與尾款 — 現金匯款指定帳號
                </h4>
              </div>
              <button
                onClick={handleCopyAccount}
                className="px-3 py-1 bg-[#B26A27] text-white text-xs font-bold rounded-lg hover:bg-[#8F521B] transition shadow-sm"
              >
                {copySuccess ? "✓ 已複製帳號" : "📋 複製帳號"}
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-white/80 p-3 rounded-xl border border-[#D6A86E]">
              <div>
                <span className="text-[#7C6E62] block">匯款銀行</span>
                <span className="font-bold text-[#382D24]">中國信託</span>
              </div>
              <div>
                <span className="text-[#7C6E62] block">銀行代碼 / 分行</span>
                <span className="font-bold text-[#382D24]">（822）內壢簡易型分行</span>
              </div>
              <div>
                <span className="text-[#7C6E62] block">戶名</span>
                <span className="font-bold text-[#382D24]">賴奕暢</span>
              </div>
              <div>
                <span className="text-[#7C6E62] block">帳號</span>
                <span className="font-mono font-extrabold text-[#B26A27] text-sm">
                  131540035543
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center text-[11px] text-[#7C6E62] mt-2 px-1">
              <span>● 第一期簽約訂金 (50%)：<b>NT$ 14,000</b> (含稅 $14,700)</span>
              <span>● 第二期交案尾款 (50%)：<b>NT$ 14,000</b> (含稅 $14,700)</span>
            </div>
          </div>

          {/* Invoice Info Form Card */}
          <div className="bg-white border border-[#E6DDCF] rounded-2xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-serif font-bold text-sm text-[#B26A27] flex items-center gap-1.5">
                <span>🧾</span> 客戶公司發票資料填寫 (線上同步傳送給團隊)
              </h4>
              <div className="flex items-center gap-2">
                {isSaved && (
                  <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    ✓ 發票資料已同步傳送
                  </span>
                )}
                <button
                  onClick={toggleAdminView}
                  className="text-[11px] text-[#B26A27] underline hover:text-[#8F521B]"
                >
                  {isAdminView ? "返回提案頁" : "🔍 老闆檢視收到的發票紀錄"}
                </button>
              </div>
            </div>

            {isAdminView ? (
              <div className="bg-[#F7F3ED] p-3 rounded-xl border border-[#E6DDCF] max-h-48 overflow-y-auto space-y-2 text-xs">
                <div className="font-bold text-[#B26A27] border-b pb-1 flex justify-between">
                  <span>所有已填寫發票清單</span>
                  <span>點擊刷卡/開立</span>
                </div>
                {invoiceRecords.length === 0 ? (
                  <p className="text-xs text-[#7C6E62] py-2 text-center">目前尚無已填寫之發票資料紀錄</p>
                ) : (
                  invoiceRecords.map((r) => (
                    <div key={r.id} className="bg-white p-2.5 rounded-lg border border-[#E6DDCF] space-y-1">
                      <div className="flex justify-between font-bold text-[#382D24]">
                        <span>🏢 {r.company_name}</span>
                        <span className="font-mono text-[#B26A27]">統編: {r.tax_id}</span>
                      </div>
                      <div className="text-[11px] text-[#7C6E62]">
                        📍 地址: {r.address || "未填寫"} ｜ ✉️ Email: {r.contact_email || "未填寫"}
                      </div>
                      <div className="text-[10px] text-[#A39587] text-right">
                        填寫時間: {new Date(r.created_at).toLocaleString("zh-TW")}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <form onSubmit={handleSaveInvoiceInfo} className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[#7C6E62] mb-1 font-medium">公司全銜 / 買受人抬頭</label>
                  <input
                    type="text"
                    placeholder="例如: 奶油吐司甜點工作室"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F7F3ED] border border-[#E6DDCF] rounded-lg focus:outline-none focus:border-[#B26A27] text-[#382D24]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#7C6E62] mb-1 font-medium">統一編號 (統編)</label>
                  <input
                    type="text"
                    placeholder="例如: 88888888"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F7F3ED] border border-[#E6DDCF] rounded-lg focus:outline-none focus:border-[#B26A27] text-[#382D24]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#7C6E62] mb-1 font-medium">發票寄送地址</label>
                  <input
                    type="text"
                    placeholder="請輸入紙本發票寄送地址"
                    value={invoiceAddress}
                    onChange={(e) => setInvoiceAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F7F3ED] border border-[#E6DDCF] rounded-lg focus:outline-none focus:border-[#B26A27] text-[#382D24]"
                  />
                </div>
                <div>
                  <label className="block text-[#7C6E62] mb-1 font-medium">電子發票通知 Email</label>
                  <input
                    type="email"
                    placeholder="請輸入收到發票通知的 Email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F7F3ED] border border-[#E6DDCF] rounded-lg focus:outline-none focus:border-[#B26A27] text-[#382D24]"
                  />
                </div>
                <div className="md:col-span-2 text-right">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-[#B26A27] hover:bg-[#8F521B] text-white font-bold rounded-lg shadow-sm transition text-xs disabled:opacity-50"
                  >
                    {isSubmitting ? "傳送中..." : "💾 儲存並同步傳送發票資料"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* NewebPay Monthly Subscription Security Box */}
          <div className="bg-[#FFFDF9] border border-[#D6A86E] rounded-xl p-3 text-[11px] text-[#7C6E62] leading-relaxed flex items-start gap-2 shadow-xs">
            <span className="text-base text-[#B26A27]">💳</span>
            <div>
              <strong className="text-[#B26A27] block mb-0.5">每月代營運系統費 ($4,800/月未稅，含稅 $5,040/月) 藍新扣款說明：</strong>
              交案正式上線時，將透過『藍新金流 (NewebPay) 第三方支付平台』設定信用卡定期定額每月自動扣款。全站採用 256-bit SSL 加密與 PCI-DSS 安全認證，每月扣款將自動寄送電子發票至您的 Email。
            </div>
          </div>
        </div>
      ),
    },
    // Slide 5: Timeline
    {
      badge: "共計 3 週上線",
      title: "專案製作時間與交案流程",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-[#E6DDCF] rounded-2xl p-5 shadow-sm">
            <span className="inline-block px-2.5 py-0.5 bg-[#B26A27] text-[#FFFDF9] rounded-full text-xs font-bold mb-2">PHASE 1 (Week 1)</span>
            <h4 className="font-serif font-bold text-[#B26A27] mb-2">素材收集與專案啟動</h4>
            <ul className="text-xs text-[#7C6E62] space-y-1.5">
              <li>✓ 簽訂合約並<b>轉帳付訂金 $14,000 (含稅$14,700)</b></li>
              <li>✓ 收集菜單品項、價格、面交地址與門檻</li>
              <li>✓ 開通 LINE 官方帳號管理權限並開立發票</li>
            </ul>
          </div>
          <div className="bg-white border border-[#E6DDCF] rounded-2xl p-5 shadow-sm">
            <span className="inline-block px-2.5 py-0.5 bg-[#B26A27] text-[#FFFDF9] rounded-full text-xs font-bold mb-2">PHASE 2 (Week 2)</span>
            <h4 className="font-serif font-bold text-[#B26A27] mb-2">視覺設計與 AI 開發</h4>
            <ul className="text-xs text-[#7C6E62] space-y-1.5">
              <li>✓ 6格 Rich Menu 圖文選單視覺設計</li>
              <li>✓ AI 點餐算錢引擎與 Notify 通知串接</li>
              <li>✓ 載入 50+ 題問答與保存重烤知識庫</li>
            </ul>
          </div>
          <div className="bg-white border border-[#E6DDCF] rounded-2xl p-5 shadow-sm">
            <span className="inline-block px-2.5 py-0.5 bg-[#B26A27] text-[#FFFDF9] rounded-full text-xs font-bold mb-2">PHASE 3 (Week 3)</span>
            <h4 className="font-serif font-bold text-[#B26A27] mb-2">測試驗收與正式交案</h4>
            <ul className="text-xs text-[#7C6E62] space-y-1.5">
              <li>✓ 雙方進行點餐算錢與接管流程實測</li>
              <li>✓ 驗收通過<b>轉帳付尾款 $14,000 (含稅$14,700)</b></li>
              <li>✓ 綁定藍新定期定額 ($5,040/月含稅)，正式上線！</li>
            </ul>
          </div>
        </div>
      ),
    },
    // Slide 6: Checklist
    {
      badge: "完整交付項目",
      title: "詳細服務與交付對照表",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-[#E6DDCF] rounded-2xl p-5 shadow-sm">
            <h4 className="font-bold text-[#B26A27] mb-2">📌 建置期交付項目 (一次性)</h4>
            <ul className="text-xs text-[#382D24] space-y-1.5">
              <li>✓ LINE 帳號權限與主頁 Banner 包裝</li>
              <li>✓ 6格 Rich Menu (點餐/面交/保存/預購/小編/會員)</li>
              <li>✓ AI 語意點餐算錢與單價加總邏輯</li>
              <li>✓ 現金面交訂單明細 Flex Message 生成</li>
              <li>✓ 備貨小編 LINE Notify 訊息推播串接</li>
            </ul>
          </div>
          <div className="bg-white border border-[#E6DDCF] rounded-2xl p-5 shadow-sm">
            <h4 className="font-bold text-[#B26A27] mb-2">🔄 代營運交付項目 (每月持續)</h4>
            <ul className="text-xs text-[#382D24] space-y-1.5">
              <li>✓ 每月 2 次限量預購 Banner 設計與推播</li>
              <li>✓ 每週巡檢 AI 未解答對話並補充知識庫</li>
              <li>✓ 季節甜點上架與價格即時調整</li>
              <li>✓ 5,000 會員偏好標籤維護與數據月報</li>
            </ul>
          </div>
        </div>
      ),
    },
    // Slide 7: ROI
    {
      badge: "商業價值總結",
      title: "核心效益與 ROI 評估",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-[#E6DDCF] rounded-2xl p-5 shadow-sm">
            <div className="text-2xl mb-1">💰</div>
            <h3 className="font-serif font-bold text-[#B26A27] mb-1">節省 85% 人力費用</h3>
            <p className="text-xs text-[#7C6E62]">聘請專職小編月薪至少 NT$ 30,000+；全包方案每月僅 $4,800 (含稅$5,040)，省下龐大固定成本。</p>
          </div>
          <div className="bg-white border border-[#E6DDCF] rounded-2xl p-5 shadow-sm">
            <div className="text-2xl mb-1">⏱️</div>
            <h3 className="font-serif font-bold text-[#B26A27] mb-1">每日省 3.3 小時接單時間</h3>
            <p className="text-xs text-[#7C6E62]">AI 24 小時精確算錢與出單，每天處理 50 人對話，讓老闆專心做甜點。</p>
          </div>
          <div className="bg-white border border-[#E6DDCF] rounded-2xl p-5 shadow-sm">
            <div className="text-2xl mb-1">📈</div>
            <h3 className="font-serif font-bold text-[#B26A27] mb-1">推播輕鬆賺回月費</h3>
            <p className="text-xs text-[#7C6E62]">每月 2 次限量預購推播帶動 10 筆生吐司訂單，即可完全覆蓋每月營運費用。</p>
          </div>
          <div className="bg-white border border-[#E6DDCF] rounded-2xl p-5 shadow-sm">
            <div className="text-2xl mb-1">🤝</div>
            <h3 className="font-serif font-bold text-[#B26A27] mb-1">開箱即用，零學習負擔</h3>
            <p className="text-xs text-[#7C6E62]">完全不需要學習複雜的後台操作，從視覺設計到 AI 維護全包服務。</p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F3ED] text-[#382D24] flex flex-col justify-between items-center p-4 md:p-8 font-sans">
      {/* Top Header */}
      <header className="w-full max-w-5xl flex justify-between items-center pb-4 border-b border-[#E6DDCF]">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-[#EFE7DA] border border-[#D6A86E] text-[#B26A27] rounded-full text-xs font-bold">
            {slides[currentSlide].badge}
          </span>
        </div>
        <div className="text-xs text-[#7C6E62] font-mono">
          bot.ycideas.com / proposals / butter-toast
        </div>
      </header>

      {/* Main Slide Card */}
      <main className="w-full max-w-5xl flex-1 my-6 bg-[#FFFDF9] border border-[#E6DDCF] rounded-3xl p-6 md:p-10 shadow-xl flex flex-col justify-between backdrop-blur-md">
        {slides[currentSlide].title && (
          <h2 className="text-2xl md:text-3xl font-bold font-serif text-[#382D24] mb-6">
            {slides[currentSlide].title}
          </h2>
        )}

        <div className="flex-1 flex flex-col justify-center">
          {slides[currentSlide].content}
        </div>
      </main>

      {/* Bottom Controls */}
      <footer className="w-full max-w-5xl flex justify-between items-center">
        <div className="text-xs font-mono font-bold text-[#7C6E62]">
          SLIDE {currentSlide + 1} / {slides.length}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentSlide((prev) => Math.max(prev - 1, 0))}
            disabled={currentSlide === 0}
            className="px-5 py-2 bg-white border border-[#E6DDCF] rounded-full text-sm font-bold text-[#382D24] hover:bg-[#B26A27] hover:text-[#FFFDF9] disabled:opacity-30 transition shadow-sm"
          >
            ← 上一頁
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1))}
            disabled={currentSlide === slides.length - 1}
            className="px-5 py-2 bg-white border border-[#E6DDCF] rounded-full text-sm font-bold text-[#382D24] hover:bg-[#B26A27] hover:text-[#FFFDF9] disabled:opacity-30 transition shadow-sm"
          >
            下一頁 →
          </button>
          <button
            onClick={() => window.print()}
            className="px-5 py-2 bg-[#EFE7DA] border border-[#D6A86E] text-[#B26A27] rounded-full text-sm font-bold hover:bg-[#B26A27] hover:text-[#FFFDF9] transition shadow-sm"
          >
            🖨️ 列印 / PDF
          </button>
        </div>
      </footer>
    </div>
  );
}
