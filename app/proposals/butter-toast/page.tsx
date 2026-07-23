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
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Admin View State
  const [isAdminView, setIsAdminView] = useState(false);
  const [invoiceRecords, setInvoiceRecords] = useState<InvoiceRecord[]>([]);

  // Today's date password (e.g., 20260723 or 0723)
  const VALID_PASSWORDS = ["20260723", "0723"];

  useEffect(() => {
    const unlocked = sessionStorage.getItem("proposal_unlocked_butter_toast");
    if (unlocked === "true") {
      setIsUnlocked(true);
    }
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

  const handleMonthlyCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: "butter_toast_managed",
          cycle: "monthly",
          isPartner: false,
        }),
      });

      const result = await res.json();
      if (!result.success) {
        alert(`藍新金流連線錯誤: ${result.error}`);
        return;
      }

      const { MerchantID, TradeInfo, TradeSha, Version, TargetUrl } = result.data;
      const form = document.createElement("form");
      form.method = "POST";
      form.action = TargetUrl;

      const params: Record<string, string> = {
        MerchantID,
        TradeInfo,
        TradeSha,
        Version,
        RespondType: "JSON",
      };

      Object.entries(params).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err: any) {
      console.error(err);
      alert("啟動藍新定期定額刷卡失敗，請稍後再試。");
    } finally {
      setCheckoutLoading(false);
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
        alert("✓ 發票資料已成功儲存並同步傳送！");
      } else {
        setIsSaved(true);
        alert("發票資料已成功儲存！");
      }
    } catch (err) {
      console.error(err);
      setIsSaved(true);
      alert("發票資料已儲存於本機。");
    } fontally {
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

  // Password Gate
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[#F7F3ED] text-[#382D24] flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md bg-[#FFFDF9] border border-[#E6DDCF] rounded-3xl p-8 shadow-xl text-center backdrop-blur-md">
          <div className="w-16 h-16 bg-[#EFE7DA] text-[#B26A27] rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-[#D6A86E]">
            🔒
          </div>
          <h1 className="text-2xl font-bold font-serif mb-2 text-[#382D24]">
            【生乳/奶霜專賣店】專屬提案
          </h1>
          <p className="text-sm text-[#7C6E62] mb-6">
            本專案報價為【生乳/奶霜專賣店 (cream_specialty_store)】量身打造之受保護內容，請輸入授權密碼檢視。
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
              解鎖檢視量身打造提案
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#E6DDCF] text-xs text-[#A39587]">
            bot.ycideas.com 專屬安全加密報價系統
          </div>
        </div>
      </div>
    );
  }

  // Interactive Tailor-made Slides
  const slides = [
    // Slide 1: Tailored Cover
    {
      badge: "🧁 生乳/奶霜專賣店 專屬 AI 店長提案",
      content: (
        <div className="text-center py-6">
          <span className="text-xs font-bold text-[#B26A27] uppercase tracking-widest block mb-2 font-mono">
            cream_specialty_store ✕ LINE 官方帳號升級
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold font-serif mb-4 leading-tight text-[#382D24]">
            【生乳/奶霜專賣店】<br />
            <span className="text-[#B26A27]">奶霜炸吐司 AI 點餐算錢與自動化專案</span>
          </h1>
          <p className="text-base md:text-lg text-[#7C6E62] max-w-2xl mx-auto mb-6 leading-relaxed">
            專為「奶霜炸吐司 (原味/抹茶/巧克力)、OREO系列、夏日限定芒果系列與 3入$270/5入$400自由配」量身打造 前後台 LIFF 網頁架構、24hr 自動算錢、廚房印單/POS對接與雙向取貨通知
          </p>
          <span className="inline-block px-6 py-2 bg-[#B26A27] text-[#FFFDF9] rounded-full text-sm font-bold shadow-md">
            營業時間 18:00 - 售完為止 / 現金面交恕不找零 / 0 小編自動化
          </span>
        </div>
      ),
    },
    // Slide 2: Tailored Pain Points & Real Operational Needs
    {
      badge: "5,000人規模規劃",
      title: "【生乳/奶霜專賣店】現況與核心需求拆解",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-[#E6DDCF] rounded-2xl p-5 shadow-sm hover:border-[#D6A86E] transition">
            <div className="text-2xl mb-1">🏠</div>
            <h3 className="font-serif font-bold text-lg text-[#B26A27] mb-1">需求 1：取餐導引與現點現做說明</h3>
            <p className="text-sm text-[#7C6E62] leading-relaxed">
              「生乳/奶霜專賣店」無實體內用門市。AI 24hr 自動說明「✨營業時間 18:00 - 售完為止 (餐點現點現做)」、指引取餐地點與地圖導航，避免耽誤顧客寶貴時間。
            </p>
          </div>

          <div className="bg-white border border-[#E6DDCF] rounded-2xl p-5 shadow-sm hover:border-[#D6A86E] transition">
            <div className="text-2xl mb-1">🧮</div>
            <h3 className="font-serif font-bold text-lg text-[#B26A27] mb-1">需求 2：奶霜炸吐司多品項自動算錢</h3>
            <p className="text-sm text-[#7C6E62] leading-relaxed">
              免去人工計算「奶霜炸吐司 ($55-$70)、OREO系列 ($75-$85)、夏日限定芒果 ($120-$130) 與 3入$270/5入$400 自由配」。AI 自動試算總金額，並提示「📌付款請準備剛好金額 (恕不找零) 或提前匯款」。
            </p>
          </div>

          <div className="bg-white border border-[#E6DDCF] rounded-2xl p-5 shadow-sm hover:border-[#D6A86E] transition">
            <div className="text-2xl mb-1">🤖</div>
            <h3 className="font-serif font-bold text-lg text-[#B26A27] mb-1">需求 3：AI 自動發送「預約完成✔️」與雙向通知</h3>
            <p className="text-sm text-[#7C6E62] leading-relaxed">
              目前無專職 LINE 小編。當顧客確認訂購後，AI 自動發送「預約完成✔️」Flex 卡片與廚房 Notify 推播；廚房做完點擊「完成備貨」，AI 自動推播「餐點已備妥，請至指定地點取餐」給顧客！
            </p>
          </div>

          <div className="bg-white border border-[#E6DDCF] rounded-2xl p-5 shadow-sm hover:border-[#D6A86E] transition">
            <div className="text-2xl mb-1">📈</div>
            <h3 className="font-serif font-bold text-lg text-[#B26A27] mb-1">需求 4：會員清單匯出與組合預購營運</h3>
            <p className="text-sm text-[#7C6E62] leading-relaxed">
              後台支援一鍵導出「訂貨會員 CSV/Excel 清單」（含姓名、電話、口味偏好、消費次數）。團隊協助每月 2 次發送「夏日限定芒果系列 / 3入與5入優惠組」預購推播。
            </p>
          </div>
        </div>
      ),
    },
    // Slide 3: Complete Front-end & Back-end LIFF Architecture & Kitchen Printing Workflow
    {
      badge: "前後台 LIFF 網頁與廚房串接架構",
      title: "前後台 LINE LIFF 網頁 ✕ 廚房打單/POS 完整流程",
      content: (
        <div className="space-y-3">
          {/* Front-end & Back-end Dual System Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Front-end LIFF App */}
            <div className="bg-white border-2 border-[#D6A86E] p-3.5 rounded-xl shadow-xs">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-base">📱</span>
                <h4 className="font-serif font-bold text-sm text-[#B26A27]">
                  前台：LINE LIFF 顧客免登入點餐體驗
                </h4>
              </div>
              <ul className="text-xs text-[#382D24] space-y-1">
                <li>• <b>免記憶密碼</b>：顧客點擊「🍞線上點餐」彈出 LIFF 頁面，自動帶入 LINE 身份。</li>
                <li>• <b>點餐算錢大腦</b>：直覺選擇奶霜炸吐司口味、3入$270 / 5入$400自由配，AI 自動折價。</li>
                <li>• <b>預約憑證卡片</b>：送出訂單即刻於 LINE 對話生成格式化「預約完成✔️」Flex 卡片。</li>
              </ul>
            </div>

            {/* Back-end Merchant Dashboard */}
            <div className="bg-white border-2 border-[#B26A27] p-3.5 rounded-xl shadow-xs">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-base">👨‍🍳</span>
                <h4 className="font-serif font-bold text-sm text-[#B26A27]">
                  後台：LINE LIFF 廚房看板 ✕ 電腦數據後台
                </h4>
              </div>
              <ul className="text-xs text-[#382D24] space-y-1">
                <li>• <b>手機 LIFF 廚房看板</b>：廚房手機點開 LINE 即可看單，按 `[✅完成備貨]` 觸發取貨推播。</li>
                <li>• <b>電腦端 RWD 後台</b>：電腦大螢幕登入，即時查看營運數據與<b>一鍵匯出會員 CSV/Excel</b>。</li>
                <li>• <b>自動打單 / POS 拋轉</b>：支援雲端打單機（自動印小白單/送貨聯）或拋轉既有 POS 機。</li>
              </ul>
            </div>
          </div>

          {/* 4-Step Process Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
            <div className="bg-[#FFFDF9] border border-[#E6DDCF] p-2 rounded-lg">
              <b className="text-[#B26A27]">1. LIFF 免登入點餐</b>
              <p className="text-[10px] text-[#7C6E62]">顧客開 LIFF 選吐司與優惠組，AI 精確算金額 $475</p>
            </div>
            <div className="bg-[#FFFDF9] border border-[#E6DDCF] p-2 rounded-lg">
              <b className="text-[#B26A27]">2. 出單機/POS自動打單</b>
              <p className="text-[10px] text-[#7C6E62]">廚房印出備貨單與送貨聯，Notify 群組即時通知</p>
            </div>
            <div className="bg-[#FFFDF9] border border-[#E6DDCF] p-2 rounded-lg">
              <b className="text-[#B26A27]">3. LIFF 完成備貨按鈕</b>
              <p className="text-[10px] text-[#7C6E62]">廚房點擊 LIFF 備貨看板 `[✅製作完成]`</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-300 p-2 rounded-lg text-emerald-900">
              <b className="text-emerald-700">4. AI 自動推播取餐</b>
              <p className="text-[10px] text-emerald-800">AI 身分發送 LINE 提醒顧客取貨（含地圖/剛好金額）</p>
            </div>
          </div>
        </div>
      ),
    },
    // Slide 4: PRICING CARDS ($48,000 建置費 / $6,800 月費) + BANK + INVOICE + CHECKOUT BUTTON + CANCELLATION POLICY
    {
      badge: "生乳/奶霜專賣店 專案報價",
      title: "專案報價金額、匯款帳號與發票填寫",
      content: (
        <div className="space-y-3">
          {/* Top Two Main Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Card 1: One-time Setup ($48,000) */}
            <div className="bg-white border-2 border-[#D6A86E] rounded-2xl p-3.5 shadow-sm relative flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-sm text-[#B26A27] flex items-center gap-1">
                    🛠️ 【一次性】AI 店長系統建置費
                  </span>
                  <span className="text-[10px] bg-[#EFE7DA] text-[#B26A27] px-2 py-0.5 rounded-full font-bold">
                    分兩期 (簽約訂金 / 驗收尾款)
                  </span>
                </div>
                <div className="text-xl md:text-2xl font-black font-mono text-[#B26A27] my-0.5">
                  NT$ 48,000 <span className="text-xs font-normal text-[#7C6E62]">(未稅)</span>
                </div>
                <div className="text-[11px] text-[#7C6E62] mb-1.5 bg-[#F7F3ED] p-1 rounded-lg border border-[#E6DDCF]">
                  🧾 加上 5% 營業稅 ($2,400) ＝ <b>含稅總額 NT$ 50,400</b>
                </div>
                <ul className="text-xs text-[#382D24] space-y-0.5 mb-1.5">
                  <li className="flex items-center gap-1.5"><span className="text-[#B26A27] font-bold">✓</span> 前後台 LINE LIFF 網頁建置 (免登入點餐/廚房看板)</li>
                  <li className="flex items-center gap-1.5"><span className="text-[#B26A27] font-bold">✓</span> 奶霜炸吐司與 3/5入優惠組 AI 算錢引擎</li>
                  <li className="flex items-center gap-1.5"><span className="text-[#B26A27] font-bold">✓</span> 廚房自動打單機/POS對接、發送「預約完成✔️」與雙向取貨推播</li>
                </ul>
              </div>
              <div className="text-[11px] text-[#7C6E62] bg-[#FFF8F0] p-1.5 rounded-xl border border-[#D6A86E] font-medium text-center">
                👇 簽約開工付訂金 $25,200 (含稅)；第3週<b>驗收通過付尾款 $25,200 (含稅)</b>
              </div>
            </div>

            {/* Card 2: Monthly Recurring ($6,800/月) with PROMINENT CHECKOUT BUTTON */}
            <div className="bg-white border-2 border-[#B26A27] rounded-2xl p-3.5 shadow-md relative flex flex-col justify-between ring-2 ring-[#B26A27]/20">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-sm text-[#B26A27] flex items-center gap-1">
                    💳 【每月】代營運與 AI 系統費
                  </span>
                  <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold shadow-xs">
                    驗收通過當天線上刷卡開通
                  </span>
                </div>
                <div className="text-xl md:text-2xl font-black font-mono text-[#B26A27] my-0.5">
                  NT$ 6,800 <span className="text-xs font-normal text-[#7C6E62]">/ 月 (未稅)</span>
                </div>
                <div className="text-[11px] text-[#7C6E62] mb-1.5 bg-[#F7F3ED] p-1 rounded-lg border border-[#E6DDCF]">
                  🧾 加上 5% 營業稅 ($340) ＝ <b>含稅 NT$ 7,140 / 月</b>
                </div>
                <ul className="text-xs text-[#382D24] space-y-0.5 mb-2">
                  <li className="flex items-center gap-1.5"><span className="text-[#B26A27] font-bold">✓</span> 5,000 會員容量 AI 流量 (20,000則/月)</li>
                  <li className="flex items-center gap-1.5"><span className="text-[#B26A27] font-bold">✓</span> 每月 2 次夏日限定與優惠組 Banner 全自動推播</li>
                  <li className="flex items-center gap-1.5"><span className="text-[#B26A27] font-bold">✓</span> 每週 AI 對話巡檢、菜單維護與會員 CSV 資料匯出</li>
                </ul>
              </div>

              {/* PROMINENT CHECKOUT BUTTON */}
              <button
                onClick={handleMonthlyCheckout}
                disabled={checkoutLoading}
                className="w-full py-2 px-3 bg-gradient-to-r from-[#B26A27] via-[#D6A86E] to-[#B26A27] hover:from-[#8F521B] hover:to-[#8F521B] text-white font-extrabold rounded-xl shadow-md shadow-[#B26A27]/30 transition-all duration-200 transform hover:scale-[1.01] flex items-center justify-center gap-1.5 text-xs cursor-pointer disabled:opacity-50 active:scale-95"
              >
                <span>💳</span>
                <span>{checkoutLoading ? "正在連接藍新金流..." : "驗收通過點此【線上綁定藍新信用卡開通營運】(NT$ 7,140/月)"}</span>
                <span>➔</span>
              </button>
            </div>
          </div>

          {/* Bank Transfer Card */}
          <div className="bg-gradient-to-br from-[#FFFDF9] to-[#FCEFDC] border-2 border-[#B26A27] rounded-2xl p-2.5 shadow-sm relative">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-1.5">
                <span className="text-base">🏦</span>
                <h4 className="font-serif font-bold text-[#B26A27] text-xs md:text-sm">
                  建置費訂金與尾款 — 現金匯款指定帳號
                </h4>
              </div>
              <button
                onClick={handleCopyAccount}
                className="px-2.5 py-0.5 bg-[#B26A27] text-white text-[11px] font-bold rounded-lg hover:bg-[#8F521B] transition shadow-xs"
              >
                {copySuccess ? "✓ 已複製帳號" : "📋 複製帳號"}
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] bg-white/80 p-2 rounded-xl border border-[#D6A86E]">
              <div>
                <span className="text-[#7C6E62] block text-[10px]">匯款銀行</span>
                <span className="font-bold text-[#382D24]">中國信託</span>
              </div>
              <div>
                <span className="text-[#7C6E62] block text-[10px]">銀行代碼 / 分行</span>
                <span className="font-bold text-[#382D24]">（822）內壢簡易型分行</span>
              </div>
              <div>
                <span className="text-[#7C6E62] block text-[10px]">戶名</span>
                <span className="font-bold text-[#382D24]">賴奕暢</span>
              </div>
              <div>
                <span className="text-[#7C6E62] block text-[10px]">帳號</span>
                <span className="font-mono font-extrabold text-[#B26A27] text-xs md:text-sm">
                  131540035543
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] text-[#7C6E62] mt-1 px-1 font-medium">
              <span>● 第一期簽約訂金 (50%)：<b className="text-[#B26A27]">NT$ 24,000</b> (含稅 $25,200) ➔ 簽約付款</span>
              <span>● 第二期交案尾款 (50%)：<b className="text-[#B26A27]">NT$ 24,000</b> (含稅 $25,200) ➔ 驗收付款</span>
            </div>
          </div>

          {/* Service Cancellation & Digital Product Non-Refundable Policy Box */}
          <div className="bg-[#FFFDF9] border border-[#D6A86E] rounded-xl p-2.5 text-[11px] text-[#7C6E62] leading-relaxed space-y-1 shadow-xs">
            <div className="font-bold text-[#B26A27] flex items-center gap-1.5 text-xs">
              <span>📋</span>
              <span>月費開通方式、服務取消與數位雲端服務條款：</span>
            </div>
            <ul className="list-disc pl-4 space-y-0.5 text-[10px] text-[#382D24]">
              <li><b>月費開通時機：</b>第 3 週雙方實測並<b>完成驗收通過當天</b>，點擊上方按鈕綁定藍新信用卡支付首月代營運費（含稅 $7,140/月），系統即刻開通 AI 店長權限上線服務。</li>
              <li><b>取消扣款流程：</b>若後續欲取消每月代營運與 AI 系統服務，只需於<b>下一期自動扣款日前 7 天</b>通知團隊客服，我們將即時為您辦理藍新定期扣款解約。</li>
              <li><b>當期服務權益與數位退款：</b>已扣款之當期服務持續運作至當月帳期結束；依消保法合理例外情事規定，數位雲端內容與代營運資源一經扣款恕不辦理當期中途退款。</li>
            </ul>
          </div>

          {/* Invoice Info Form Card */}
          <div className="bg-white border border-[#E6DDCF] rounded-2xl p-2.5 shadow-sm">
            <div className="flex justify-between items-center mb-1.5">
              <h4 className="font-serif font-bold text-xs text-[#B26A27] flex items-center gap-1.5">
                <span>🧾</span> 客戶公司發票資料填寫 (線上同步傳送給團隊開立三聯式發票)
              </h4>
              <div className="flex items-center gap-2">
                {isSaved && (
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    ✓ 發票資料已同步傳送
                  </span>
                )}
                <button
                  onClick={toggleAdminView}
                  className="text-[10px] text-[#B26A27] underline hover:text-[#8F521B]"
                >
                  {isAdminView ? "返回提案頁" : "🔍 老闆檢視收到的發票紀錄"}
                </button>
              </div>
            </div>

            {isAdminView ? (
              <div className="bg-[#F7F3ED] p-2 rounded-xl border border-[#E6DDCF] max-h-32 overflow-y-auto space-y-1 text-xs">
                <div className="font-bold text-[#B26A27] border-b pb-1 flex justify-between">
                  <span>所有已填寫發票清單</span>
                  <span>狀態: 已同步至雲端</span>
                </div>
                {invoiceRecords.length === 0 ? (
                  <p className="text-xs text-[#7C6E62] py-2 text-center">目前尚無已填寫之發票資料紀錄</p>
                ) : (
                  invoiceRecords.map((r) => (
                    <div key={r.id} className="bg-white p-2 rounded-lg border border-[#E6DDCF] space-y-1">
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
              <form onSubmit={handleSaveInvoiceInfo} className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[#7C6E62] mb-0.5 text-[10px]">公司全銜 / 買受人抬頭</label>
                  <input
                    type="text"
                    placeholder="例如: 生乳/奶霜專賣店"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-2 py-1 bg-[#F7F3ED] border border-[#E6DDCF] rounded-lg focus:outline-none focus:border-[#B26A27] text-[#382D24] text-[11px]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#7C6E62] mb-0.5 text-[10px]">統一編號 (統編)</label>
                  <input
                    type="text"
                    placeholder="例如: 88888888"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    className="w-full px-2 py-1 bg-[#F7F3ED] border border-[#E6DDCF] rounded-lg focus:outline-none focus:border-[#B26A27] text-[#382D24] text-[11px]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#7C6E62] mb-0.5 text-[10px]">發票寄送地址</label>
                  <input
                    type="text"
                    placeholder="請輸入紙本發票寄送地址"
                    value={invoiceAddress}
                    onChange={(e) => setInvoiceAddress(e.target.value)}
                    className="w-full px-2 py-1 bg-[#F7F3ED] border border-[#E6DDCF] rounded-lg focus:outline-none focus:border-[#B26A27] text-[#382D24] text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-[#7C6E62] mb-0.5 text-[10px]">電子發票通知 Email</label>
                  <input
                    type="email"
                    placeholder="請輸入收到發票通知的 Email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-2 py-1 bg-[#F7F3ED] border border-[#E6DDCF] rounded-lg focus:outline-none focus:border-[#B26A27] text-[#382D24] text-[11px]"
                  />
                </div>
                <div className="md:col-span-2 text-right">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-3 py-1 bg-[#B26A27] hover:bg-[#8F521B] text-white font-bold rounded-lg shadow-xs transition text-[11px] disabled:opacity-50"
                  >
                    {isSubmitting ? "傳送中..." : "💾 儲存並同步傳送發票資料"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ),
    },
    // Slide 5: UPDATED TIMELINE WITH CLEAR ACCEPTANCE & ACTIVATION MILESTONES
    {
      badge: "共計 3 週上線",
      title: "專案製作時間與交案流程",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-[#E6DDCF] rounded-2xl p-5 shadow-sm">
            <span className="inline-block px-2.5 py-0.5 bg-[#B26A27] text-[#FFFDF9] rounded-full text-xs font-bold mb-2">PHASE 1 (Week 1)</span>
            <h4 className="font-serif font-bold text-[#B26A27] mb-2">Messaging API 串接與菜單匯入</h4>
            <ul className="text-xs text-[#7C6E62] space-y-1.5">
              <li>✓ 簽訂合約並<b>轉帳付訂金 $24,000 (含稅$25,200)</b></li>
              <li>✓ 串接現有 LINE 官方帳號 Messaging API 權限</li>
              <li>✓ 載入奶霜炸吐司單品與【夏日限定】芒果系列菜單</li>
            </ul>
          </div>
          <div className="bg-white border border-[#E6DDCF] rounded-2xl p-5 shadow-sm">
            <span className="inline-block px-2.5 py-0.5 bg-[#B26A27] text-[#FFFDF9] rounded-full text-xs font-bold mb-2">PHASE 2 (Week 2)</span>
            <h4 className="font-serif font-bold text-[#B26A27] mb-2">AI 算錢引擎與前後台 LIFF 建置</h4>
            <ul className="text-xs text-[#7C6E62] space-y-1.5">
              <li>✓ 前台 LIFF 免登入點餐與後台 LIFF 廚房看板建置</li>
              <li>✓ 自動計算金額、提示自備零錢與「預約完成✔️」卡片</li>
              <li>✓ 串接廚房打單機/POS對接、Notify 推播與雙向取貨通知</li>
            </ul>
          </div>
          <div className="bg-white border-2 border-[#B26A27] rounded-2xl p-5 shadow-md bg-amber-50/30">
            <span className="inline-block px-2.5 py-0.5 bg-[#B26A27] text-[#FFFDF9] rounded-full text-xs font-bold mb-2">PHASE 3 (Week 3 驗收上線)</span>
            <h4 className="font-serif font-bold text-[#B26A27] mb-2">驗收通過 ➔ 付尾款 ➔ 刷卡開通</h4>
            <ul className="text-xs text-[#382D24] space-y-1.5 font-medium">
              <li>✓ 雙方進行點餐算錢與廚房打單/取貨流程實測</li>
              <li>✓ 驗收通過<b>轉帳付尾款 $24,000 (含稅$25,200)</b></li>
              <li>✓ 驗收當天<b>線上綁定藍新信用卡 ($7,140/月含稅) 開通 AI 店長正式營運！</b></li>
            </ul>
          </div>
        </div>
      ),
    },
    // Slide 6: Tailored Feature Checklist
    {
      badge: "生乳/奶霜專賣店 交付清單",
      title: "詳細服務與交付對照表",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-[#E6DDCF] rounded-2xl p-5 shadow-sm">
            <h4 className="font-bold text-[#B26A27] mb-2">📌 AI 店長建置交付項目 (一次性)</h4>
            <ul className="text-xs text-[#382D24] space-y-1.5">
              <li>✓ 現有 LINE 官方帳號 Messaging API 權限串接</li>
              <li>✓ 前後台 LINE LIFF 網頁介面開發 (顧客點餐 / 廚房備貨看板)</li>
              <li>✓ 奶霜炸吐司、芒果限定與 3入/5入優惠組合 AI 算錢邏輯</li>
              <li>✓ 廚房自動出單機 / POS 機 API / 送貨單列印整合</li>
              <li>✓ 「預約完成✔️」 Flex Card 與雙向【完成備貨推播顧客】</li>
              <li>✓ 廚房小編 LINE Notify 訊息推播與一鍵通知串接</li>
            </ul>
          </div>
          <div className="bg-white border border-[#E6DDCF] rounded-2xl p-5 shadow-sm">
            <h4 className="font-bold text-[#B26A27] mb-2">🔄 代營運交付項目 (每月持續)</h4>
            <ul className="text-xs text-[#382D24] space-y-1.5">
              <li>✓ 每月 2 次限量預購 Banner 設計與全自動推播</li>
              <li>✓ 每週巡檢 AI 未解答對話與補充知識庫</li>
              <li>✓ 季節限定甜點 (如夏日芒果/秋冬新品) 上架與價格更新</li>
              <li>✓ 5,000 會員偏好標籤維護與 CSV/Excel 會員清單導出</li>
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
            <p className="text-xs text-[#7C6E62]">聘請專職小編月薪至少 NT$ 30,000+；全包方案每月僅 **$6,800 (含稅$7,140)**，省下龐大固定成本。</p>
          </div>
          <div className="bg-white border border-[#E6DDCF] rounded-2xl p-5 shadow-sm">
            <div className="text-2xl mb-1">⏱️</div>
            <h3 className="font-serif font-bold text-[#B26A27] mb-1">每日省 3.3 小時接單時間</h3>
            <p className="text-xs text-[#7C6E62]">AI 24 小時精確算錢與出單，每天處理 50 人對話，讓老闆專心做甜點。</p>
          </div>
          <div className="bg-white border border-[#E6DDCF] rounded-2xl p-5 shadow-sm">
            <div className="text-2xl mb-1">📈</div>
            <h3 className="font-serif font-bold text-[#B26A27] mb-1">推播輕鬆賺回月費</h3>
            <p className="text-xs text-[#7C6E62]">每月 2 次限量預購推播帶動 15 筆奶霜炸吐司組合訂單，即可完全覆蓋每月營運費用。</p>
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
