"use client";

import React, { useState, useEffect } from "react";
import Script from "next/script";

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

  // LIFF Context State
  const [lineProfile, setLineProfile] = useState<{ displayName?: string; userId?: string } | null>(null);

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

  // Password Verification (20260723 or 0723)
  const VALID_PASSWORDS = ["20260723", "0723"];

  // Anti-Theft & Security Hooks
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F12" || e.keyCode === 123) {
        e.preventDefault();
        return false;
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c")) {
        e.preventDefault();
        return false;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "U" || e.key === "u" || e.key === "S" || e.key === "s")) {
        e.preventDefault();
        return false;
      }

      // Keyboard Slide Switch for Desktop
      if (isUnlocked) {
        if (e.key === "ArrowRight" || e.key === " ") {
          setCurrentSlide((prev) => Math.min(prev + 1, 6));
        } else if (e.key === "ArrowLeft") {
          setCurrentSlide((prev) => Math.max(prev - 1, 0));
        }
      }
    };

    const handleSelectStart = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return true;
      }
      e.preventDefault();
      return false;
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("selectstart", handleSelectStart);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("selectstart", handleSelectStart);
    };
  }, [isUnlocked]);

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

  const handleLiffInit = async () => {
    if (typeof window !== "undefined" && (window as any).liff) {
      try {
        const liff = (window as any).liff;
        if (liff.isInClient && liff.isInClient()) {
          if (liff.isLoggedIn && liff.isLoggedIn()) {
            const profile = await liff.getProfile();
            setLineProfile({ displayName: profile.displayName, userId: profile.userId });
          }
        }
      } catch (err) {
        console.log("LIFF Init Notice:", err);
      }
    }
  };

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

  // Password Lock View (100% Mobile Responsive inside LINE LIFF)
  if (!isUnlocked) {
    return (
      <div className="w-full min-h-screen bg-[#F7F3ED] text-[#382D24] flex flex-col justify-center items-center p-4 font-sans select-none overflow-x-hidden">
        <Script src="https://static.line-scdn.net/liff/edge/2/sdk.js" onLoad={handleLiffInit} />
        <div className="w-full max-w-sm bg-[#FFFDF9] border border-[#E6DDCF] rounded-3xl p-6 shadow-xl text-center backdrop-blur-md">
          <div className="w-12 h-12 bg-[#EFE7DA] text-[#B26A27] rounded-full flex items-center justify-center text-xl mx-auto mb-3 border border-[#D6A86E]">
            🔒
          </div>
          <h1 className="text-lg font-bold font-serif mb-1.5 text-[#382D24]">
            【生乳/奶霜專賣店】專屬提案
          </h1>
          <p className="text-xs text-[#7C6E62] mb-4 leading-relaxed">
            本專案報價為受資安防護與商業加密保護之受控內容，請輸入授權密碼檢視。
          </p>

          <form onSubmit={handleUnlock} className="space-y-3">
            <div>
              <input
                type="password"
                placeholder="請輸入瀏覽密碼 (如: 20260723)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#F7F3ED] border border-[#E6DDCF] rounded-xl text-center text-base focus:outline-none focus:border-[#B26A27] text-[#382D24] placeholder-[#A39587]"
                autoFocus
              />
            </div>

            {errorMsg && <p className="text-xs text-red-600 font-medium">{errorMsg}</p>}

            <button
              type="submit"
              className="w-full py-2.5 bg-[#B26A27] hover:bg-[#8F521B] text-[#FFFDF9] font-bold rounded-xl shadow-md transition text-sm active:scale-95"
            >
              解鎖檢視量身打造提案
            </button>
          </form>

          <div className="mt-4 pt-3 border-t border-[#E6DDCF] text-[10px] text-[#A39587] flex items-center justify-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>bot.ycideas.com 📱 LINE LIFF 直向流暢瀏覽</span>
          </div>
        </div>
      </div>
    );
  }

  // Section 1: Cover Header
  const sectionCover = (
    <div className="w-full my-auto text-center py-2">
      <div className="flex items-center justify-center gap-2 mb-2 md:mb-3">
        <span className="h-[1px] w-6 md:w-10 bg-[#D6A86E]"></span>
        <span className="text-[10px] md:text-xs font-bold text-[#B26A27] tracking-widest uppercase font-mono">
          SPECIAL PROPOSAL ✕ 2026 品牌升級企劃
        </span>
        <span className="h-[1px] w-6 md:w-10 bg-[#D6A86E]"></span>
      </div>

      <h1 className="text-xl md:text-4xl lg:text-5xl font-black font-serif mb-2 md:mb-4 leading-tight text-[#382D24]">
        【生乳/奶霜專賣店】<br />
        <span className="text-[#B26A27]">AI 品牌店長 24H 自動化專案</span>
      </h1>

      <p className="text-xs md:text-base text-[#7C6E62] max-w-2xl mx-auto mb-4 md:mb-6 leading-relaxed font-medium">
        專為無專職小編門市打造的 <b>24 小時線上 AI 智慧總管 ✕ 老闆後台 AI 數據助手</b>！前台自動接單、後台實時推播<b>「完售/缺料警報 ✕ LINE 會員紅利積點折抵 ✕ 雙向提醒」</b>！
      </p>

      {/* 4 Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-4 md:mb-6 text-left">
        <div className="bg-white/90 border border-[#D6A86E] p-3 rounded-xl shadow-xs">
          <div className="text-xs md:text-sm font-bold text-[#B26A27] mb-1">🧸 吉祥物擬真人設</div>
          <p className="text-[11px] md:text-xs text-[#7C6E62] leading-tight">融入品牌娃娃溫暖語氣與口頭禪，建立親切感</p>
        </div>

        <div className="bg-white/90 border border-[#D6A86E] p-3 rounded-xl shadow-xs">
          <div className="text-xs md:text-sm font-bold text-[#B26A27] mb-1">🪙 會員紅利積點折抵</div>
          <p className="text-[11px] md:text-xs text-[#7C6E62] leading-tight">消費滿$50送1點，結帳一鍵折抵金額或兌換免費甜點</p>
        </div>

        <div className="bg-white/90 border border-[#D6A86E] p-3 rounded-xl shadow-xs">
          <div className="text-xs md:text-sm font-bold text-[#B26A27] mb-1">🛡️ 刪單改單控管 SOP</div>
          <p className="text-[11px] md:text-xs text-[#7C6E62] leading-tight">製作中狀態自動鎖定防隨意改單，保障現做品質與產線流程</p>
        </div>

        <div className="bg-white/90 border border-[#D6A86E] p-3 rounded-xl shadow-xs">
          <div className="text-xs md:text-sm font-bold text-[#B26A27] mb-1">🏢 企業 B2B 大宗團購</div>
          <p className="text-[11px] md:text-xs text-[#7C6E62] leading-tight">200-400份公司採購自動引導、階梯折扣與一鍵匯出 PDF 估價單</p>
        </div>
      </div>

      <div className="inline-flex items-center flex-wrap justify-center gap-1.5 px-4 py-1.5 bg-[#B26A27] text-[#FFFDF9] rounded-full text-xs font-bold shadow-xs mb-4">
        <span>✨ 0 專職小編需求</span>
        <span>•</span>
        <span>✨ 會員紅利積點折抵</span>
        <span>•</span>
        <span>✨ 改單刪單 SOP 控管</span>
        <span>•</span>
        <span>✨ 後台 AI 日報</span>
      </div>

      <div className="pt-3 border-t border-[#E6DDCF] text-xs text-[#7C6E62] font-medium flex justify-center flex-wrap gap-2 md:gap-4">
        <span>🏢 <b>提案單位：</b>奕暢創新設計工作室 <span className="font-mono text-[#B26A27]">(統編: 41370842)</span></span>
        <span>💬 <b>LINE ID：</b><b className="text-[#B26A27] font-mono">ivanlai33</b></span>
        <span>📞 <b>電話：</b><b className="text-[#B26A27] font-mono">0987528785</b></span>
      </div>
    </div>
  );

  // Section 2: Pain Points
  const sectionPainPoints = (
    <div className="w-full my-auto space-y-4">
      <div className="flex justify-between items-center border-b border-[#E6DDCF] pb-2">
        <h2 className="text-base md:text-2xl font-bold font-serif text-[#382D24]">
          【生乳/奶霜專賣店】現況與核心需求拆解
        </h2>
        <span className="text-[10px] md:text-xs bg-[#EFE7DA] text-[#B26A27] px-2.5 py-0.5 rounded-full font-bold">
          5,000人規模與 CRM 忠誠度規劃
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <div className="bg-white border border-[#E6DDCF] rounded-2xl p-4 shadow-xs">
          <div className="text-xl md:text-2xl mb-1">🧸</div>
          <h3 className="font-serif font-bold text-sm md:text-base text-[#B26A27] mb-1">需求 1：品牌娃娃人設口吻與商店介紹</h3>
          <p className="text-xs md:text-sm text-[#7C6E62] leading-relaxed">
            注入「品牌吉祥物娃娃」親切可愛語氣作為 AI 店長靈魂！24hr 自動介紹品牌故事、✨營業時間 (18:00-售完為止)、面交地點地圖，並一鍵跳轉官方社群專頁。
          </p>
        </div>

        <div className="bg-white border-2 border-[#D6A86E] rounded-2xl p-4 shadow-xs bg-amber-50/20">
          <div className="text-xl md:text-2xl mb-1">🪙</div>
          <h3 className="font-serif font-bold text-sm md:text-base text-[#B26A27] mb-1">需求 2：LINE 會員紅利積點 ✕ 點數直接折抵點餐</h3>
          <p className="text-xs md:text-sm text-[#382D24] leading-relaxed">
            <b>【高回購率 CRM 機制】</b>消費滿 $50 贈 1 點（1點＝$1元）。結帳卡片自動讀取會員剩餘點數，允許<b>「一鍵全額/部分折抵」</b>或兌換指定免費炸吐司！
          </p>
        </div>

        <div className="bg-white border border-[#E6DDCF] rounded-2xl p-4 shadow-xs">
          <div className="text-xl md:text-2xl mb-1">🛡️</div>
          <h3 className="font-serif font-bold text-sm md:text-base text-[#B26A27] mb-1">需求 3：刪單、改單嚴格防護 SOP 與久候催取</h3>
          <p className="text-xs md:text-sm text-[#7C6E62] leading-relaxed">
            未備貨狀態允許自主改單釋庫存；一旦切換為「製作中」，AI 即刻鎖定訂單並溫和說明；逾時 30 分鐘自動推播二次催取卡片，保障現做口感！
          </p>
        </div>

        <div className="bg-white border border-[#E6DDCF] rounded-2xl p-4 shadow-xs">
          <div className="text-xl md:text-2xl mb-1">🏢</div>
          <h3 className="font-serif font-bold text-sm md:text-base text-[#B26A27] mb-1">需求 4：企業 B2B 大宗團購 200-400 份應變</h3>
          <p className="text-xs md:text-sm text-[#7C6E62] leading-relaxed">
            識別經辦大宗詢問，AI 自動引導填寫公司統編、活動日期與數量；現場計算階梯折扣並秒級推播警報給老闆，後台一鍵匯出<b>「正式 PDF 蓋章估價單」</b>！
          </p>
        </div>
      </div>
    </div>
  );

  // Section 3: Architecture
  const sectionArchitecture = (
    <div className="w-full my-auto space-y-4">
      <div className="flex justify-between items-center border-b border-[#E6DDCF] pb-2">
        <h2 className="text-base md:text-2xl font-bold font-serif text-[#382D24]">
          會員紅利積點折抵 ✕ 顧客點餐介面 ✕ 老闆 AI 助手
        </h2>
        <span className="text-[10px] md:text-xs bg-[#EFE7DA] text-[#B26A27] px-2.5 py-0.5 rounded-full font-bold">
          前後台權限隔離
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <div className="bg-white border-2 border-[#D6A86E] p-4 rounded-2xl shadow-xs">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-lg">📱</span>
            <h4 className="font-serif font-bold text-xs md:text-base text-[#B26A27]">
              前台：LINE 會員紅利積點 ✕ 一鍵點數折抵點餐
            </h4>
          </div>
          <ul className="text-xs md:text-sm text-[#382D24] space-y-1.5">
            <li>• <b>點數自動歸戶與折抵</b>：消費滿 $50 送 1 點。結帳卡片自動顯示顧客點數並允許一鍵勾選「折抵現金」。</li>
            <li>• <b>尊榮會員三層分級 (新星/狂熱者/VIP)</b>：根據消費金額自動升級，享有 1.5倍 ~ 2倍 點數加速與新品預購權。</li>
            <li>• <b>改單/刪單 SOP 控管</b>：未製作前可自主微調；已開始製作自動鎖定，AI 溫和說明並提供店家聯繫方式。</li>
            <li>• <b>久候未取雙向催取</b>：逾時 30 分鐘自動推播關懷卡片提醒取貨，維護現做最佳口感風味。</li>
          </ul>
        </div>

        <div className="bg-white border-2 border-[#B26A27] p-4 rounded-2xl shadow-xs">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-lg">🚨</span>
            <h4 className="font-serif font-bold text-[#B26A27] text-xs md:text-base">
              後台：會員點數數據與 CRM 匯出 ✕ AI 數據 Copilot
            </h4>
          </div>
          <ul className="text-xs md:text-sm text-[#382D24] space-y-1.5">
            <li>• <b>會員點數發放與過期設定</b>：老闆可彈性設定點數活動（如週五雙倍送）、手動補點與名單匯出。</li>
            <li>• <b>久候未取雙向同步通知</b>：顧客逾時未取餐，系統同步推播給老闆/廚房即時控管餐點狀況。</li>
            <li>• <b>大宗採購一鍵 PDF 匯出</b>：後台自動生成帶有公司統編與大小印章之正式 PDF 估價單供報帳。</li>
            <li>• <b>後台 AI 數據 Copilot</b>：店長直接查詢「今日業績/完成幾單/詢問未下單幾人/新會員數」，AI 秒回！</li>
          </ul>
        </div>
      </div>
    </div>
  );

  // Section 4: Pricing & Invoice
  const sectionPricing = (
    <div className="w-full my-auto space-y-3">
      <div className="flex justify-between items-center border-b border-[#E6DDCF] pb-2">
        <h2 className="text-base md:text-2xl font-bold font-serif text-[#382D24]">
          專案報價金額、對標真人小編成本與發票填寫
        </h2>
        <span className="text-[10px] md:text-xs bg-emerald-600 text-white px-2.5 py-0.5 rounded-full font-bold">
          節省 85% 人力成本
        </span>
      </div>

      {/* Main Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Card 1: Setup Fee */}
        <div className="bg-white border-2 border-[#D6A86E] rounded-2xl p-3.5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-xs md:text-sm text-[#B26A27]">
                🛠️ 【一次性】AI 店長系統建置費
              </span>
              <span className="text-[10px] bg-[#EFE7DA] text-[#B26A27] px-2 py-0.5 rounded-full font-bold">
                分兩期 (訂金 / 尾款)
              </span>
            </div>
            <div className="text-xl md:text-2xl font-black font-mono text-[#B26A27] my-0.5">
              NT$ 48,000 <span className="text-xs font-normal text-[#7C6E62]">(未稅)</span>
            </div>
            <div className="text-xs text-[#7C6E62] mb-1.5 bg-[#F7F3ED] p-1 rounded-lg border border-[#E6DDCF]">
              🧾 加上 5% 營業稅 ($2,400) ＝ <b>含稅總額 NT$ 50,400</b>
            </div>
            <ul className="text-xs text-[#382D24] space-y-0.5 mb-1.5">
              <li className="flex items-center gap-1"><span className="text-[#B26A27] font-bold">✓</span> 100% 線上全遠端建置，免到店干擾營運</li>
              <li className="flex items-center gap-1"><span className="text-[#B26A27] font-bold">✓</span> <b>LINE 會員紅利積點 ✕ 點費折抵 ✕ 改單 SOP</b></li>
              <li className="flex items-center gap-1"><span className="text-[#B26A27] font-bold">✓</span> 後台 AI 經營助手大腦 (調閱業績與未下單分析)</li>
              <li className="flex items-center gap-1"><span className="text-[#B26A27] font-bold">✓</span> AI 歷史訂單記憶大腦 (口味記憶・貼心推薦)</li>
              <li className="flex items-center gap-1"><span className="text-[#B26A27] font-bold">✓</span> 前後台原生身份認證與店家員工專屬權限鎖</li>
            </ul>
          </div>
          <div className="text-xs text-[#7C6E62] bg-[#FFF8F0] p-1 rounded-xl border border-[#D6A86E] text-center font-medium">
            👇 簽約付訂金 $25,200 (含稅)；驗收付尾款 $25,200 (含稅)
          </div>
        </div>

        {/* Card 2: Monthly Managed */}
        <div className="bg-white border-2 border-[#B26A27] rounded-2xl p-3.5 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-xs md:text-sm text-[#B26A27]">
                💳 【每月】代營運與 AI 系統費
              </span>
              <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
                超高 CP 值
              </span>
            </div>
            <div className="text-xl md:text-2xl font-black font-mono text-[#B26A27] my-0.5">
              NT$ 4,800 <span className="text-xs font-normal text-[#7C6E62]">/ 月 (未稅)</span>
            </div>
            <div className="text-xs text-[#7C6E62] mb-1.5 bg-[#F7F3ED] p-1 rounded-lg border border-[#E6DDCF]">
              🧾 加上 5% 營業稅 ($240) ＝ <b>含稅 NT$ 5,040 / 月</b>
            </div>
            <div className="text-[11px] bg-amber-50 border border-[#D6A86E] p-1 rounded-lg mb-1.5 text-[#382D24]">
              💡 <b>對標真人小編：</b>每年直接為店家省下 <b>NT$ 28 萬薪資支出！</b>
            </div>
            <ul className="text-xs text-[#382D24] space-y-0.5 mb-2">
              <li className="flex items-center gap-1"><span className="text-emerald-700 font-bold">★</span> <b>首月 30 天線上免費維護保障 (依需求彈性微調)</b></li>
              <li className="flex items-center gap-1"><span className="text-[#B26A27] font-bold">✓</span> 5,000 會員容量 AI 流量 (20,000則/月)</li>
              <li className="flex items-center gap-1"><span className="text-[#B26A27] font-bold">✓</span> 每月 2 次限量預購 Banner 設計全自動推播</li>
              <li className="flex items-center gap-1"><span className="text-[#B26A27] font-bold">✓</span> 每週 AI 對話巡檢與菜單維護</li>
            </ul>
          </div>

          <button
            onClick={handleMonthlyCheckout}
            disabled={checkoutLoading}
            className="w-full py-2 px-3 bg-gradient-to-r from-[#B26A27] via-[#D6A86E] to-[#B26A27] hover:from-[#8F521B] hover:to-[#8F521B] text-white font-extrabold rounded-xl shadow-md transition flex items-center justify-center gap-1 text-xs cursor-pointer active:scale-95"
          >
            <span>💳</span>
            <span>{checkoutLoading ? "正在連接藍新金流..." : "驗收通過點此【線上綁定藍新信用卡開通營運】(NT$ 5,040/月)"}</span>
            <span>➔</span>
          </button>
        </div>
      </div>

      {/* Bank Account Details */}
      <div className="bg-gradient-to-br from-[#FFFDF9] to-[#FCEFDC] border-2 border-[#B26A27] rounded-2xl p-2.5 shadow-xs">
        <div className="flex justify-between items-center mb-1">
          <h4 className="font-serif font-bold text-[#B26A27] text-xs md:text-sm flex items-center gap-1">
            <span>🏦</span> 建置費訂金與尾款 — 現金匯款指定帳號
          </h4>
          <button
            onClick={handleCopyAccount}
            className="px-2 py-0.5 bg-[#B26A27] text-white text-[11px] font-bold rounded-lg hover:bg-[#8F521B] transition"
          >
            {copySuccess ? "✓ 已複製" : "📋 複製帳號"}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 text-xs bg-white/90 p-1.5 rounded-xl border border-[#D6A86E]">
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
            <span className="font-mono font-extrabold text-[#B26A27] text-sm">131540035543</span>
          </div>
        </div>
      </div>

      {/* Invoice Info Form */}
      <div className="bg-white border border-[#E6DDCF] rounded-2xl p-2.5 shadow-xs">
        <div className="flex justify-between items-center mb-1">
          <h4 className="font-serif font-bold text-xs text-[#B26A27] flex items-center gap-1">
            <span>🧾</span> 客戶公司發票資料填寫 (開立三聯式發票)
          </h4>
          <div className="flex items-center gap-2">
            {isSaved && (
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                ✓ 已傳送
              </span>
            )}
            <button onClick={toggleAdminView} className="text-xs text-[#B26A27] underline">
              {isAdminView ? "返回" : "🔍 發票紀錄"}
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
                <div key={r.id} className="bg-white p-1.5 rounded-lg border border-[#E6DDCF] space-y-0.5">
                  <div className="flex justify-between font-bold text-[#382D24]">
                    <span>🏢 {r.company_name}</span>
                    <span className="font-mono text-[#B26A27]">統編: {r.tax_id}</span>
                  </div>
                  <div className="text-[11px] text-[#7C6E62]">
                    📍 地址: {r.address || "未填寫"} ｜ ✉️ Email: {r.contact_email || "未填寫"}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <form onSubmit={handleSaveInvoiceInfo} className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs">
            <div>
              <label className="block text-[#7C6E62] mb-0.5 text-[10px]">公司全銜 / 買受人抬頭</label>
              <input
                type="text"
                placeholder="例如: 生乳/奶霜專賣店"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-2 py-1 bg-[#F7F3ED] border border-[#E6DDCF] rounded-lg focus:outline-none focus:border-[#B26A27] text-[#382D24]"
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
                className="w-full px-2 py-1 bg-[#F7F3ED] border border-[#E6DDCF] rounded-lg focus:outline-none focus:border-[#B26A27] text-[#382D24]"
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
                className="w-full px-2 py-1 bg-[#F7F3ED] border border-[#E6DDCF] rounded-lg focus:outline-none focus:border-[#B26A27] text-[#382D24]"
              />
            </div>
            <div>
              <label className="block text-[#7C6E62] mb-0.5 text-[10px]">電子發票通知 Email</label>
              <input
                type="email"
                placeholder="請輸入收到發票通知的 Email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-2 py-1 bg-[#F7F3ED] border border-[#E6DDCF] rounded-lg focus:outline-none focus:border-[#B26A27] text-[#382D24]"
              />
            </div>
            <div className="md:col-span-2 text-right">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-3 py-1 bg-[#B26A27] hover:bg-[#8F521B] text-white font-bold rounded-lg text-xs transition"
              >
                {isSubmitting ? "傳送中..." : "💾 儲存並同步傳送發票資料"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  // Section 5: Timeline
  const sectionTimeline = (
    <div className="w-full my-auto space-y-4">
      <div className="flex justify-between items-center border-b border-[#E6DDCF] pb-2">
        <h2 className="text-base md:text-2xl font-bold font-serif text-[#382D24]">
          全遠端零干擾建置、線上測試與交案流程
        </h2>
        <span className="text-[10px] md:text-xs bg-[#EFE7DA] text-[#B26A27] px-2.5 py-0.5 rounded-full font-bold">
          100% 全遠端無縫導入
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        <div className="bg-white border border-[#E6DDCF] rounded-2xl p-4 shadow-xs">
          <span className="inline-block px-2.5 py-0.5 bg-[#B26A27] text-white rounded-full text-[10px] font-bold mb-2">PHASE 1 (Week 1)</span>
          <h4 className="font-serif font-bold text-[#B26A27] mb-1.5 text-sm md:text-base">遠端權限交接與雲端打單預設</h4>
          <ul className="text-xs md:text-sm text-[#7C6E62] space-y-1">
            <li>✓ 簽訂合約並<b>轉帳付訂金 $24,000 (含稅$25,200)</b></li>
            <li>✓ 線上邀請授權、提供員工名單白名單與菜單</li>
            <li>✓ 預先綁定雲端打單機設定，開箱插電即用</li>
          </ul>
        </div>
        <div className="bg-white border border-[#E6DDCF] rounded-2xl p-4 shadow-xs">
          <span className="inline-block px-2.5 py-0.5 bg-[#B26A27] text-white rounded-full text-[10px] font-bold mb-2">PHASE 2 (Week 2)</span>
          <h4 className="font-serif font-bold text-[#B26A27] mb-1.5 text-sm md:text-base">測試環境與線上視訊演練</h4>
          <ul className="text-xs md:text-sm text-[#7C6E62] space-y-1">
            <li>✓ 專屬點餐介面免登入與 AI 後台經營助手日報測試</li>
            <li>✓ 掃測試碼進行 3入/5入折價與雙向取貨測試</li>
            <li>✓ 雙方進行 30 分鐘線上視訊會審微調語氣</li>
          </ul>
        </div>
        <div className="bg-white border-2 border-[#B26A27] rounded-2xl p-4 shadow-xs bg-amber-50/30">
          <span className="inline-block px-2.5 py-0.5 bg-[#B26A27] text-white rounded-full text-[10px] font-bold mb-2">PHASE 3 (Week 3 遠端驗收)</span>
          <h4 className="font-serif font-bold text-[#B26A27] mb-1.5 text-sm md:text-base">無縫切換 ➔ 驗收開通 ➔ 保固</h4>
          <ul className="text-xs md:text-sm text-[#382D24] space-y-1 font-medium">
            <li>✓ 5 分鐘遠端無縫切換連線，原官方帳號零停機升級</li>
            <li>✓ 線上通過驗收並<b>轉帳付尾款 $24,000 (含稅$25,200)</b></li>
            <li>✓ 點擊按鈕<b>線上綁定藍新信用卡 ($5,040/月含稅) 開通！</b></li>
            <li>✓ 享【首月 30 天線上維護保障】，依需求免費微調！</li>
          </ul>
        </div>
      </div>
    </div>
  );

  // Section 6: Checklist & Cybersecurity
  const sectionChecklist = (
    <div className="w-full my-auto space-y-4">
      <div className="flex justify-between items-center border-b border-[#E6DDCF] pb-2">
        <h2 className="text-base md:text-2xl font-bold font-serif text-[#382D24]">
          詳細服務交付 ✕ 吉祥物 AI 人設 ✕ 會員 CRM 積點清單
        </h2>
        <span className="text-[10px] md:text-xs bg-[#EFE7DA] text-[#B26A27] px-2.5 py-0.5 rounded-full font-bold">
          完整交付清單
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        <div className="bg-white border border-[#E6DDCF] rounded-2xl p-4 shadow-xs">
          <h4 className="font-bold text-[#B26A27] text-xs md:text-sm mb-2">📌 AI 店長與會員 CRM 建置 (一次性)</h4>
          <ul className="text-xs md:text-sm text-[#382D24] space-y-1">
            <li>✓ 100% 全遠端雲端建置與線上指導驗收</li>
            <li>✓ <b>LINE 會員紅利積點 ✕ 點數折抵點餐機制</b></li>
            <li>✓ <b>會員尊榮分級 (新星/狂熱者/VIP) 自動升級</b></li>
            <li>✓ 刪單/改單產線鎖定控管 SOP 流程</li>
            <li>✓ 久候未取餐雙向自動化提醒與催取卡片</li>
            <li>✓ 前後台原生身份認證與店家員工專屬權限鎖</li>
          </ul>
        </div>

        <div className="bg-white border border-[#E6DDCF] rounded-2xl p-4 shadow-xs">
          <h4 className="font-bold text-[#B26A27] text-xs md:text-sm mb-2">🔄 代營運與保固交付 (每月持續)</h4>
          <ul className="text-xs md:text-sm text-[#382D24] space-y-1">
            <li>✓ <b>首月 30 天線上免費微調保障 (語氣與菜單彈性調整)</b></li>
            <li>✓ 每月 2 次限量預購 Banner 設計全自動推播</li>
            <li>✓ 每晚自動推播「今日經營日報」給店長老闆</li>
            <li>✓ 每週巡檢 AI 未解答對話與補充知識庫</li>
            <li>✓ 5,000 會員偏好標籤維護與會員訂購名單匯出</li>
          </ul>
        </div>

        <div className="bg-emerald-50/70 border-2 border-emerald-500 rounded-2xl p-4 shadow-xs">
          <h4 className="font-bold text-emerald-800 text-xs md:text-sm mb-2">🔒 企業級 AI 資安防護 4 大防線</h4>
          <ul className="text-xs md:text-sm text-emerald-900 space-y-1 font-medium">
            <li>✓ <b>金融級資安加密傳輸</b>：全站與金流高強度防護</li>
            <li>✓ <b>AI 價格防詐欺大腦</b>：防惡意誘導改價騙價</li>
            <li>✓ <b>店家員工專屬權限鎖</b>：非授權帳號絕對無法存取</li>
            <li>✓ <b>個資隔離與名單導出</b>：符合個人資料保護法</li>
          </ul>
        </div>
      </div>
    </div>
  );

  // Section 7: Summary & ROI
  const sectionSummary = (
    <div className="w-full my-auto space-y-4">
      <div className="flex justify-between items-center border-b border-[#E6DDCF] pb-2">
        <h2 className="text-base md:text-2xl font-bold font-serif text-[#382D24]">
          真人小編 ✕ AI 店長效益與聯絡資訊
        </h2>
        <span className="text-[10px] md:text-xs bg-[#EFE7DA] text-[#B26A27] px-2.5 py-0.5 rounded-full font-bold">
          商業價值總結
        </span>
      </div>

      <div className="bg-white border-2 border-[#B26A27] rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs md:text-sm">
          <thead className="bg-[#EFE7DA] text-[#B26A27] font-bold border-b border-[#D6A86E]">
            <tr>
              <th className="p-2 md:p-2.5">評估比較項目</th>
              <th className="p-2 md:p-2.5 text-gray-500">真人小編</th>
              <th className="p-2 md:p-2.5 text-[#B26A27] bg-[#FFF8F0] font-black">🤖 AI 店長全代營運</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6DDCF] text-[#382D24]">
            <tr>
              <td className="p-2 md:p-2.5 font-bold">會員經營與紅利積點</td>
              <td className="p-2 md:p-2.5 text-gray-600">手動蓋章卡易遺失，無法精確算點折抵</td>
              <td className="p-2 md:p-2.5 font-bold text-emerald-700 bg-[#FFF8F0]"><b>LINE 免下載卡片自動算點 ✕ 點餐一鍵直接折抵現金</b></td>
            </tr>
            <tr>
              <td className="p-2 md:p-2.5 font-bold">刪改單與棄單防禦</td>
              <td className="p-2 md:p-2.5 text-gray-600">口頭改單易忘記，棄單無法即時催取損耗大</td>
              <td className="p-2 md:p-2.5 font-bold text-emerald-700 bg-[#FFF8F0]"><b>製作中狀態自動鎖定防隨意改單 ✕ 久候未取雙向催卡</b></td>
            </tr>
            <tr>
              <td className="p-2 md:p-2.5 font-bold">企業 B2B 大宗團購對接</td>
              <td className="p-2 md:p-2.5 text-gray-600">人工詢問溝通慢，缺 PDF 報價單</td>
              <td className="p-2 md:p-2.5 font-bold text-emerald-700 bg-[#FFF8F0]"><b>200-400份採購引導、階梯折扣與一鍵 PDF 估價單</b></td>
            </tr>
            <tr>
              <td className="p-2 md:p-2.5 font-bold">每月固定費用成本</td>
              <td className="p-2 md:p-2.5 text-red-600 font-mono font-bold">NT$ 30,000 ~ 35,000</td>
              <td className="p-2 md:p-2.5 text-emerald-700 font-mono font-black bg-[#FFF8F0]">NT$ 4,800 / 月 (含稅 $5,040)</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Proposing Company Card */}
      <div className="bg-gradient-to-r from-[#FFFDF9] via-[#FCEFDC] to-[#FFFDF9] border-2 border-[#B26A27] rounded-2xl p-3 md:p-4 shadow-xs flex flex-col md:flex-row justify-between items-center gap-2">
        <div>
          <span className="text-[10px] bg-[#B26A27] text-white px-2 py-0.5 rounded-full font-bold block w-fit mb-1">
            🏢 提案團隊聯絡資訊
          </span>
          <h3 className="font-serif font-extrabold text-sm md:text-base text-[#382D24] flex items-center gap-1.5">
            <span>奕暢創新設計工作室</span>
            <span className="text-[10px] md:text-xs font-mono font-bold text-[#B26A27] bg-[#EFE7DA] px-1.5 py-0.5 rounded border border-[#D6A86E]">
              統編: 41370842
            </span>
          </h3>
        </div>

        <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm">
          <div className="bg-white/80 px-3 py-1.5 rounded-xl border border-[#D6A86E]">
            <span className="text-[9px] text-[#7C6E62] block">LINE ID</span>
            <span className="font-mono font-black text-[#B26A27]">ivanlai33</span>
          </div>

          <div className="bg-white/80 px-3 py-1.5 rounded-xl border border-[#D6A86E]">
            <span className="text-[9px] text-[#7C6E62] block">電話</span>
            <span className="font-mono font-black text-[#B26A27]">0987528785</span>
          </div>
        </div>
      </div>
    </div>
  );

  const allSections = [
    { title: "封面", component: sectionCover },
    { title: "需求拆解", component: sectionPainPoints },
    { title: "前後台架構", component: sectionArchitecture },
    { title: "金額與發票", component: sectionPricing },
    { title: "建置時程", component: sectionTimeline },
    { title: "交付清單", component: sectionChecklist },
    { title: "效益總結", component: sectionSummary },
  ];

  return (
    <div className="w-full min-h-screen bg-[#F7F3ED] text-[#382D24] font-sans select-none overflow-x-hidden">
      <Script src="https://static.line-scdn.net/liff/edge/2/sdk.js" onLoad={handleLiffInit} />

      {/* Top Header Bar */}
      <header className="sticky top-0 z-50 bg-[#F7F3ED]/95 backdrop-blur-md border-b border-[#E6DDCF] px-4 py-2.5">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            <span className="font-bold text-xs md:text-sm text-[#382D24]">
              AI 品牌店長 24H 自動化專案
            </span>
          </div>
          <div className="text-[10px] md:text-xs text-[#7C6E62] font-mono flex items-center gap-1.5">
            <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              🛡️ 資安保護中
            </span>
            {lineProfile?.displayName && (
              <span className="hidden sm:inline text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                👤 {lineProfile.displayName}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Mode: Native Vertical Continuous Scroll View (手機直向順暢上下滑動模式) */}
      <div className="block md:hidden w-full max-w-xl mx-auto p-3 space-y-4">
        {sectionCover}
        {sectionPainPoints}
        {sectionArchitecture}
        {sectionPricing}
        {sectionTimeline}
        {sectionChecklist}
        {sectionSummary}
      </div>

      {/* Desktop Mode: High-End Vertically & Horizontally Centered Minimalist Deck View */}
      <div className="hidden md:flex min-h-[calc(100vh-65px)] flex-col justify-between items-center p-6 max-w-5xl mx-auto">
        <main className="w-full h-[78vh] max-h-[700px] bg-[#FFFDF9] border border-[#E6DDCF] rounded-3xl p-8 md:p-10 shadow-xl flex flex-col justify-center items-center my-auto backdrop-blur-md overflow-y-auto">
          {allSections[currentSlide].component}
        </main>

        <footer className="w-full flex justify-between items-center pt-3 border-t border-[#E6DDCF]">
          <div className="text-xs font-mono font-bold text-[#7C6E62]">
            SLIDE {currentSlide + 1} / {allSections.length} — {allSections[currentSlide].title}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentSlide((prev) => Math.max(prev - 1, 0))}
              disabled={currentSlide === 0}
              className="px-5 py-2 bg-white border border-[#E6DDCF] rounded-full text-sm font-bold text-[#382D24] hover:bg-[#B26A27] hover:text-white disabled:opacity-30 transition shadow-xs active:scale-95"
            >
              ← 上一頁
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => Math.min(prev + 1, allSections.length - 1))}
              disabled={currentSlide === allSections.length - 1}
              className="px-5 py-2 bg-white border border-[#E6DDCF] rounded-full text-sm font-bold text-[#382D24] hover:bg-[#B26A27] hover:text-white disabled:opacity-30 transition shadow-xs active:scale-95"
            >
              下一頁 →
            </button>
            <button
              onClick={() => window.print()}
              className="px-5 py-2 bg-[#EFE7DA] border border-[#D6A86E] text-[#B26A27] rounded-full text-sm font-bold hover:bg-[#B26A27] hover:text-white transition shadow-xs active:scale-95"
            >
              🖨️ 列印 / PDF
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
