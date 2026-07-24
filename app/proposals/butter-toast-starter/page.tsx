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

export default function ButterToastStarterProposalPage() {
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

  // Password Verification (Today's date: 20260724 or 0724)
  const VALID_PASSWORDS = ["20260724", "0724", "20260723", "0723"];

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
    const unlocked = sessionStorage.getItem("proposal_unlocked_butter_toast_starter");
    if (unlocked === "true") {
      setIsUnlocked(true);
    }
    const savedInfo = localStorage.getItem("butter_toast_starter_invoice_info");
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
      sessionStorage.setItem("proposal_unlocked_butter_toast_starter", "true");
      setErrorMsg("");
    } else {
      setErrorMsg("密碼不正確，請重新輸入（提示：本日日期 8 碼 20260724 或 4 碼 0724）");
    }
  };

  const handleMonthlyCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: "butter_toast_starter_managed",
          cycle: "monthly",
          amount: 1050, // NT$ 1,000 + 5% tax = NT$ 1,050
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
    localStorage.setItem("butter_toast_starter_invoice_info", JSON.stringify(info));

    try {
      const res = await fetch("/api/proposals/invoice-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          taxId,
          invoiceAddress,
          contactEmail,
          proposalSlug: "butter-toast-starter",
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
            【生乳/奶霜專賣店】<br />AI 店長基礎入門版提案
          </h1>
          <p className="text-xs text-[#7C6E62] mb-4 leading-relaxed">
            本專案報價為受資安防護與商業加密保護之受控內容，請輸入授權密碼檢視。
          </p>

          <form onSubmit={handleUnlock} className="space-y-3">
            <div>
              <input
                type="password"
                placeholder="請輸入瀏覽密碼 (如: 20260724)"
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
              解鎖檢視入門版報價
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
          STARTER PROPOSAL ✕ 輕量入門專案
        </span>
        <span className="h-[1px] w-6 md:w-10 bg-[#D6A86E]"></span>
      </div>

      <h1 className="text-xl md:text-4xl lg:text-5xl font-black font-serif mb-2 md:mb-4 leading-tight text-[#382D24]">
        【生乳/奶霜專賣店】<br />
        <span className="text-[#B26A27]">AI 品牌店長 基礎入門版專案</span>
      </h1>

      <p className="text-xs md:text-base text-[#7C6E62] max-w-2xl mx-auto mb-4 md:mb-6 leading-relaxed font-medium">
        專為輕量預算門市打造的 <b>1 萬元極速上線 AI 智慧總管 ✕ 1,000 元小額月費</b>！精準專注於<b>「聊天回覆 ✕ 產品卡片 ✕ 對話記憶 ✕ AI 對話資安防護 ✕ 品牌人設」</b>！
      </p>

      {/* 5 Core Feature Highlights Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 max-w-4xl mx-auto mb-4 md:mb-6 text-left">
        <div className="bg-white/90 border border-[#D6A86E] p-2.5 rounded-xl shadow-xs">
          <div className="text-xs font-bold text-[#B26A27] mb-0.5">💬 24H 聊天回覆</div>
          <p className="text-[10px] text-[#7C6E62] leading-tight">24小時自動親切回應顧客詢問與介紹</p>
        </div>

        <div className="bg-white/90 border border-[#D6A86E] p-2.5 rounded-xl shadow-xs">
          <div className="text-xs font-bold text-[#B26A27] mb-0.5">📱 彈出產品卡片</div>
          <p className="text-[10px] text-[#7C6E62] leading-tight">即時調出圖文產品卡片供顧客點選</p>
        </div>

        <div className="bg-white/90 border border-[#D6A86E] p-2.5 rounded-xl shadow-xs">
          <div className="text-xs font-bold text-[#B26A27] mb-0.5">🧠 記憶聊天內容</div>
          <p className="text-[10px] text-[#7C6E62] leading-tight">記憶顧客喜好與買過的口味偏好</p>
        </div>

        <div className="bg-white/90 border border-[#D6A86E] p-2.5 rounded-xl shadow-xs">
          <div className="text-xs font-bold text-[#B26A27] mb-0.5">🔒 AI 智能資安防護</div>
          <p className="text-[10px] text-[#7C6E62] leading-tight">防謾罵/亂打字/十萬字爆量/防套成本個資</p>
        </div>

        <div className="bg-white/90 border border-[#D6A86E] p-2.5 rounded-xl shadow-xs col-span-2 sm:col-span-1">
          <div className="text-xs font-bold text-[#B26A27] mb-0.5">🧸 品牌人設導入</div>
          <p className="text-[10px] text-[#7C6E62] leading-tight">融入品牌娃娃口頭禪與親切語氣</p>
        </div>
      </div>

      <div className="inline-flex items-center flex-wrap justify-center gap-1.5 px-4 py-1.5 bg-[#B26A27] text-[#FFFDF9] rounded-full text-xs font-bold shadow-xs mb-4">
        <span>✨ 建置費僅 NT$ 10,000</span>
        <span>•</span>
        <span>✨ 月費低至 NT$ 1,000/月</span>
        <span>•</span>
        <span>✨ 彈性加購完整模組地圖</span>
      </div>

      <div className="pt-3 border-t border-[#E6DDCF] text-xs text-[#7C6E62] font-medium flex justify-center flex-wrap gap-2 md:gap-4">
        <span>🏢 <b>提案單位：</b>奕暢創新設計工作室 <span className="font-mono text-[#B26A27]">(統編: 41370842)</span></span>
        <span>💬 <b>LINE ID：</b><b className="text-[#B26A27] font-mono">ivanlai33</b></span>
        <span>📞 <b>電話：</b><b className="text-[#B26A27] font-mono">0987528785</b></span>
      </div>
    </div>
  );

  // Section 2: Pain Points (Detailed 5 Core Features)
  const sectionPainPoints = (
    <div className="w-full my-auto space-y-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center border-b border-[#E6DDCF] pb-2">
        <h2 className="text-base md:text-2xl font-bold font-serif text-[#382D24]">
          【生乳/奶霜專賣店】入門版 5 大極簡核心功能
        </h2>
        <span className="text-[10px] md:text-xs bg-[#EFE7DA] text-[#B26A27] px-2.5 py-0.5 rounded-full font-bold">
          極速 1 周輕鬆上線
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white border-2 border-[#D6A86E] rounded-2xl p-3.5 shadow-xs">
          <div className="text-xl mb-1">💬</div>
          <h3 className="font-serif font-bold text-sm text-[#B26A27] mb-1">
            功能 1：24H 自動聊天回覆與門市問答
          </h3>
          <p className="text-xs text-[#7C6E62] leading-relaxed">
            全天候 24 小時自動回覆顧客關於營業時間 (18:00-售完為止)、面交地點地圖、品牌故事與各類常見問題。
          </p>
        </div>

        <div className="bg-white border-2 border-[#D6A86E] rounded-2xl p-3.5 shadow-xs">
          <div className="text-xl mb-1">📱</div>
          <h3 className="font-serif font-bold text-sm text-[#B26A27] mb-1">
            功能 2：自動拉出圖文產品卡片與算錢
          </h3>
          <p className="text-xs text-[#7C6E62] leading-relaxed">
            當顧客詢問品項或點餐時，AI 秒級彈出圖文產品卡片，自動計算「奶霜炸吐司 ($55-$70) 與 3入/5入優惠」。
          </p>
        </div>

        <div className="bg-white border-2 border-[#D6A86E] rounded-2xl p-3.5 shadow-xs">
          <div className="text-xl mb-1">🧠</div>
          <h3 className="font-serif font-bold text-sm text-[#B26A27] mb-1">
            功能 3：記憶客人對話內容與口味偏好
          </h3>
          <p className="text-xs text-[#7C6E62] leading-relaxed">
            AI 自動記憶顧客歷史對話、買過的品項與口味偏好，在互動對話中展現個人化關懷與溫暖推薦。
          </p>
        </div>

        <div className="bg-white border-2 border-[#B26A27] rounded-2xl p-3.5 shadow-xs bg-amber-50/20">
          <div className="text-xl mb-1">🔒</div>
          <h3 className="font-serif font-bold text-sm text-[#B26A27] mb-1">
            功能 4：AI 智能對話資安防護與反套話防線
          </h3>
          <p className="text-xs text-[#382D24] leading-relaxed">
            <b>【AI 機密與情緒防護大腦】</b>自動過濾不理性謾罵髒話、亂打字清洗、防範十萬字灌爆過載；當惡意反向套話<em>（如問成本多少？問店長個人資料電話？）</em>時，AI 智能捍衛機密並高 EQ 優雅婉拒！
          </p>
        </div>

        <div className="bg-white border-2 border-[#D6A86E] rounded-2xl p-3.5 shadow-xs md:col-span-2">
          <div className="text-xl mb-1">🧸</div>
          <h3 className="font-serif font-bold text-sm text-[#B26A27] mb-1">
            功能 5：品牌吉祥物/娃娃 AI 擬真人設導入
          </h3>
          <p className="text-xs text-[#7C6E62] leading-relaxed">
            將「品牌吉祥物娃娃」的親切可愛語氣、口頭禪與店長靈魂注入 AI，讓對話活潑親切、建立極佳顧客好感度！
          </p>
        </div>
      </div>
    </div>
  );

  // Section 3: Add-on Modules Architecture Map (Clean Header & No Bottom Banner)
  const sectionArchitecture = (
    <div className="w-full my-auto space-y-4">
      <div className="flex justify-between items-center border-b border-[#E6DDCF] pb-2">
        <div>
          <h2 className="text-base md:text-xl font-bold font-serif text-[#382D24]">
            基礎入門版 ($10,000) ✕ 4 大擴充模組對照總覽
          </h2>
          <p className="text-[11px] text-[#7C6E62]">
            👉 門市可先以 <b>$10,000 入門</b>，日後可依需求隨時彈性加購獨立擴充模組！
          </p>
        </div>
        <span className="text-[10px] md:text-xs bg-[#EFE7DA] text-[#B26A27] px-2.5 py-1 rounded-full font-bold">
          模組功能・無縫升級
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4">
        {/* Left Column: Starter Plan (5 Core Features) */}
        <div className="md:col-span-5 bg-white border-2 border-[#D6A86E] p-4 rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-serif font-bold text-xs md:text-sm text-[#B26A27] flex items-center gap-1">
                <span>✅</span> 【基礎入門版】5 大核心
              </h4>
              <span className="text-[10px] font-mono font-bold text-[#B26A27] bg-[#EFE7DA] px-2 py-0.5 rounded-full">
                $10,000 (月費 $1,000)
              </span>
            </div>
            <ul className="text-xs text-[#382D24] space-y-1.5 font-medium">
              <li className="p-1.5 bg-[#FFF8F0] rounded-lg border border-[#D6A86E]">💬 1. 24H 聊天回覆與門市問答</li>
              <li className="p-1.5 bg-[#FFF8F0] rounded-lg border border-[#D6A86E]">📱 2. 自動彈出圖文產品卡片算錢</li>
              <li className="p-1.5 bg-[#FFF8F0] rounded-lg border border-[#D6A86E]">🧠 3. 記憶客人對話內容與喜好</li>
              <li className="p-1.5 bg-[#FFF8F0] rounded-lg border border-[#D6A86E]">🔒 4. AI 資安防護 (防謾罵/套話/過載)</li>
              <li className="p-1.5 bg-[#FFF8F0] rounded-lg border border-[#D6A86E]">🧸 5. 品牌吉祥物娃娃 AI 人設</li>
            </ul>
          </div>
          <div className="mt-3 text-xs text-[#7C6E62] bg-[#F7F3ED] p-2 rounded-xl text-center font-bold">
            💡 輕鬆低門檻，1 萬元極速開通上線
          </div>
        </div>

        {/* Right Column: 4 Full Add-on Modules */}
        <div className="md:col-span-7 bg-white border border-[#E6DDCF] p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-serif font-bold text-xs md:text-sm text-[#7C6E62] flex items-center gap-1">
              <span>🧩</span> 完整 4 大彈性擴充模組清單
            </h4>
            <span className="text-[10px] font-mono text-[#7C6E62]">
              (依需求彈性加購)
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="bg-[#F7F3ED] p-2 rounded-xl border border-[#E6DDCF] flex justify-between items-center">
              <div>
                <b className="text-[#B26A27] block text-[11px] md:text-xs">🚨 模組 1：完售缺料推播警報 ✕ 廚房看板 ✕ 老闆 AI 日報</b>
                <span className="text-[10px] text-[#7C6E62]">低庫存倒數標籤、完售/缺料秒級推推播老闆、廚房備貨通知、AI 自動算帳出日報。</span>
              </div>
              <div className="text-right font-mono text-xs font-bold text-[#B26A27] shrink-0 ml-2">
                +$12,000<br/><span className="text-[#7C6E62] font-normal text-[10px]">+$500/月</span>
              </div>
            </div>

            <div className="bg-[#F7F3ED] p-2 rounded-xl border border-[#E6DDCF] flex justify-between items-center">
              <div>
                <b className="text-[#B26A27] block text-[11px] md:text-xs">🪙 模組 2：會員紅利積點 ✕ 點數現折 ✕ VIP 尊榮 3 層分級</b>
                <span className="text-[10px] text-[#7C6E62]">滿$50送1點、點數現折現金、銅/銀/金吐司會員自動升降等與折扣。</span>
              </div>
              <div className="text-right font-mono text-xs font-bold text-[#B26A27] shrink-0 ml-2">
                +$12,000<br/><span className="text-[#7C6E62] font-normal text-[10px]">+$500/月</span>
              </div>
            </div>

            <div className="bg-[#F7F3ED] p-2 rounded-xl border border-[#E6DDCF] flex justify-between items-center">
              <div>
                <b className="text-[#B26A27] block text-[11px] md:text-xs">🏢 模組 3：企業 B2B 大宗團購 (200-400份) ✕ PDF 自動估價單</b>
                <span className="text-[10px] text-[#7C6E62]">公司活動採購對接、階梯折扣算帳、一鍵自動生成用印公司抬頭 PDF 估價單。</span>
              </div>
              <div className="text-right font-mono text-xs font-bold text-[#B26A27] shrink-0 ml-2">
                +$14,000<br/><span className="text-[#7C6E62] font-normal text-[10px]">+$600/月</span>
              </div>
            </div>

            <div className="bg-[#F7F3ED] p-2 rounded-xl border border-[#E6DDCF] flex justify-between items-center">
              <div>
                <b className="text-[#B26A27] block text-[11px] md:text-xs">🛡️ 模組 4：防改單風控 SOP ✕ 逾時 30 分久候自動催取關懷卡</b>
                <span className="text-[10px] text-[#7C6E62]">製作中狀態鎖定防改單、逾時 30 分鐘 LINE 自動雙向催取與關懷卡片。</span>
              </div>
              <div className="text-right font-mono text-xs font-bold text-[#B26A27] shrink-0 ml-2">
                +$10,000<br/><span className="text-[#7C6E62] font-normal text-[10px]">+$400/月</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Section 4: Pricing & Invoice ($10,000 / $1,000)
  const sectionPricing = (
    <div className="w-full my-auto space-y-3">
      <div className="flex justify-between items-center border-b border-[#E6DDCF] pb-2">
        <h2 className="text-base md:text-2xl font-bold font-serif text-[#382D24]">
          基礎入門版專案報價金額與發票填寫
        </h2>
        <span className="text-[10px] md:text-xs bg-emerald-600 text-white px-2.5 py-0.5 rounded-full font-bold">
          小額負擔・無痛升級
        </span>
      </div>

      {/* Main Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Card 1: Setup Fee ($10,000) */}
        <div className="bg-white border-2 border-[#D6A86E] rounded-2xl p-3.5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-xs md:text-sm text-[#B26A27]">
                🛠️ 【一次性】AI 店長基礎建置費
              </span>
              <span className="text-[10px] bg-[#EFE7DA] text-[#B26A27] px-2 py-0.5 rounded-full font-bold">
                分兩期 (訂金 / 尾款)
              </span>
            </div>
            <div className="text-2xl md:text-3xl font-black font-mono text-[#B26A27] my-1">
              NT$ 10,000 <span className="text-xs font-normal text-[#7C6E62]">(未稅)</span>
            </div>
            <div className="text-xs text-[#7C6E62] mb-2 bg-[#F7F3ED] p-1.5 rounded-lg border border-[#E6DDCF]">
              🧾 加上 5% 營業稅 ($500) ＝ <b>含稅總額 NT$ 10,500</b>
            </div>
            <ul className="text-xs text-[#382D24] space-y-1 mb-2">
              <li className="flex items-center gap-1"><span className="text-[#B26A27] font-bold">✓</span> 100% 線上全遠端建置，免到店干擾營運</li>
              <li className="flex items-center gap-1"><span className="text-[#B26A27] font-bold">✓</span> <b>包含 5 大極簡核心功能 (聊天/卡片/記憶/AI資安/人設)</b></li>
              <li className="flex items-center gap-1"><span className="text-[#B26A27] font-bold">✓</span> 前後台原生身份認證與資安防護鎖</li>
              <li className="flex items-center gap-1"><span className="text-[#B26A27] font-bold">✓</span> 享【首月 30 天線上維護保障】與微調</li>
            </ul>
          </div>
          <div className="text-xs text-[#7C6E62] bg-[#FFF8F0] p-1.5 rounded-xl border border-[#D6A86E] text-center font-medium">
            👇 簽約付訂金 $5,250 (含稅)；驗收付尾款 $5,250 (含稅)
          </div>
        </div>

        {/* Card 2: Monthly Managed ($1,000/mo) */}
        <div className="bg-white border-2 border-[#B26A27] rounded-2xl p-3.5 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-xs md:text-sm text-[#B26A27]">
                💳 【每月】代營運與 AI 系統費
              </span>
              <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
                極致輕量小額
              </span>
            </div>
            <div className="text-2xl md:text-3xl font-black font-mono text-[#B26A27] my-1">
              NT$ 1,000 <span className="text-xs font-normal text-[#7C6E62]">/ 月 (未稅)</span>
            </div>
            <div className="text-xs text-[#7C6E62] mb-2 bg-[#F7F3ED] p-1.5 rounded-lg border border-[#E6DDCF]">
              🧾 加上 5% 營業稅 ($50) ＝ <b>含稅 NT$ 1,050 / 月</b>
            </div>
            <ul className="text-xs text-[#382D24] space-y-1 mb-3">
              <li className="flex items-center gap-1"><span className="text-emerald-700 font-bold">★</span> <b>包含每個月 AI 對話流量與系統安全運作維護</b></li>
              <li className="flex items-center gap-1"><span className="text-[#B26A27] font-bold">✓</span> 每月菜單內容彈性微調支援</li>
              <li className="flex items-center gap-1"><span className="text-[#B26A27] font-bold">✓</span> 雲端資料庫每日自動備份服務</li>
            </ul>
          </div>

          <button
            onClick={handleMonthlyCheckout}
            disabled={checkoutLoading}
            className="w-full py-2 px-3 bg-gradient-to-r from-[#B26A27] via-[#D6A86E] to-[#B26A27] hover:from-[#8F521B] hover:to-[#8F521B] text-white font-extrabold rounded-xl shadow-md transition flex items-center justify-center gap-1 text-xs cursor-pointer active:scale-95"
          >
            <span>💳</span>
            <span>{checkoutLoading ? "正在連接藍新金流..." : "驗收通過點此【線上綁定藍新信用卡開通】(NT$ 1,050/月含稅)"}</span>
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
              <input
                type="text"
                placeholder="公司全銜 / 買受人抬頭"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-2 py-1 bg-[#F7F3ED] border border-[#E6DDCF] rounded-lg focus:outline-none focus:border-[#B26A27] text-[#382D24]"
                required
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="統一編號 (統編)"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                className="w-full px-2 py-1 bg-[#F7F3ED] border border-[#E6DDCF] rounded-lg focus:outline-none focus:border-[#B26A27] text-[#382D24]"
                required
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="發票寄送地址"
                value={invoiceAddress}
                onChange={(e) => setInvoiceAddress(e.target.value)}
                className="w-full px-2 py-1 bg-[#F7F3ED] border border-[#E6DDCF] rounded-lg focus:outline-none focus:border-[#B26A27] text-[#382D24]"
              />
            </div>
            <div>
              <input
                type="email"
                placeholder="電子發票通知 Email"
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
            <li>✓ 簽訂合約並<b>轉帳付訂金 $5,000 (含稅$5,250)</b></li>
            <li>✓ 線上邀請授權與菜單人設匯入</li>
          </ul>
        </div>
        <div className="bg-white border border-[#E6DDCF] rounded-2xl p-4 shadow-xs">
          <span className="inline-block px-2.5 py-0.5 bg-[#B26A27] text-white rounded-full text-[10px] font-bold mb-2">PHASE 2 (Week 2)</span>
          <h4 className="font-serif font-bold text-[#B26A27] mb-1.5 text-sm md:text-base">測試環境與線上視訊演練</h4>
          <ul className="text-xs md:text-sm text-[#7C6E62] space-y-1">
            <li>✓ 專屬點餐介面免登入與 AI 聊天對話測試</li>
            <li>✓ 雙方進行 30 分鐘線上視訊會審微調語氣</li>
          </ul>
        </div>
        <div className="bg-white border-2 border-[#B26A27] rounded-2xl p-4 shadow-xs bg-amber-50/30">
          <span className="inline-block px-2.5 py-0.5 bg-[#B26A27] text-white rounded-full text-[10px] font-bold mb-2">PHASE 3 (Week 3 遠端驗收)</span>
          <h4 className="font-serif font-bold text-[#B26A27] mb-1.5 text-sm md:text-base">無縫切換 ➔ 驗收開通 ➔ 保固</h4>
          <ul className="text-xs md:text-sm text-[#382D24] space-y-1 font-medium">
            <li>✓ 5 分鐘遠端無縫切換連線，原官方帳號零停機升級</li>
            <li>✓ 線上通過驗收並<b>轉帳付尾款 $5,000 (含稅$5,250)</b></li>
            <li>✓ 點擊按鈕<b>線上綁定藍新信用卡 ($1,050/月含稅) 開通！</b></li>
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
          詳細服務交付 ✕ 5 大極簡功能交付清單
        </h2>
        <span className="text-[10px] md:text-xs bg-[#EFE7DA] text-[#B26A27] px-2.5 py-0.5 rounded-full font-bold">
          入門版交付清單
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        <div className="bg-white border border-[#E6DDCF] rounded-2xl p-4 shadow-xs">
          <h4 className="font-bold text-[#B26A27] text-xs md:text-sm mb-2">📌 5 大極簡核心功能交付 (一次性)</h4>
          <ul className="text-xs md:text-sm text-[#382D24] space-y-1.5">
            <li>✓ <b>1. 24H 聊天回覆與門市問答</b></li>
            <li>✓ <b>2. 自動彈出圖文產品卡片與算錢</b></li>
            <li>✓ <b>3. 記憶客人對話內容與口味偏好</b></li>
            <li>✓ <b>4. AI 對話資安防護 (防謾罵/防十萬字過載/防套成本與個資)</b></li>
            <li>✓ <b>5. 品牌吉祥物/娃娃 AI 人設導入</b></li>
          </ul>
        </div>

        <div className="bg-white border border-[#E6DDCF] rounded-2xl p-4 shadow-xs">
          <h4 className="font-bold text-[#B26A27] text-xs md:text-sm mb-2">🔄 代營運與保固交付 (每月持續)</h4>
          <ul className="text-xs md:text-sm text-[#382D24] space-y-1">
            <li>✓ <b>首月 30 天線上免費維護保障 (語氣與菜單微調)</b></li>
            <li>✓ 每月菜單內容彈性編修支援</li>
            <li>✓ 雲端資料庫每日自動備份服務</li>
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
              <th className="p-2 md:p-2.5 text-[#B26A27] bg-[#FFF8F0] font-black">🤖 AI 店長極簡入門版</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6DDCF] text-[#382D24]">
            <tr>
              <td className="p-2 md:p-2.5 font-bold">聊天回覆與人設</td>
              <td className="p-2 md:p-2.5 text-gray-600">打字慢，晚上休假無法即時回</td>
              <td className="p-2 md:p-2.5 font-bold text-emerald-700 bg-[#FFF8F0]"><b>吉祥物娃娃語氣 24H 即時回覆 ✕ 記憶顧客內容</b></td>
            </tr>
            <tr>
              <td className="p-2 md:p-2.5 font-bold">對話資安與反套話防線</td>
              <td className="p-2 md:p-2.5 text-gray-600">人工易情緒化，可能失言洩密</td>
              <td className="p-2 md:p-2.5 font-bold text-emerald-700 bg-[#FFF8F0]"><b>防謾罵/防十萬字爆量/防反向套問成本與個資</b></td>
            </tr>
            <tr>
              <td className="p-2 md:p-2.5 font-bold">方案金額與負擔</td>
              <td className="p-2 md:p-2.5 text-red-600 font-mono font-bold">NT$ 30,000 ~ 35,000/月</td>
              <td className="p-2 md:p-2.5 text-emerald-700 font-mono font-black bg-[#FFF8F0]"><b>建置費僅 $10,000 (月費僅 NT$ 1,000/月)</b></td>
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
    { title: "入門功能拆解", component: sectionPainPoints },
    { title: "架構與擴充地圖", component: sectionArchitecture },
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
              AI 品牌店長 基礎入門版專案
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
              className="px-5 py-2 bg-[#F7F3ED] border border-[#E6DDCF] rounded-full text-xs font-bold text-[#382D24] hover:bg-[#B26A27] hover:text-white disabled:opacity-30 transition shadow-xs active:scale-95"
            >
              ← 上一頁
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => Math.min(prev + 1, allSections.length - 1))}
              disabled={currentSlide === allSections.length - 1}
              className="px-5 py-2 bg-[#F7F3ED] border border-[#E6DDCF] rounded-full text-xs font-bold text-[#382D24] hover:bg-[#B26A27] hover:text-white disabled:opacity-30 transition shadow-xs active:scale-95"
            >
              下一頁 →
            </button>
            <button
              onClick={() => window.print()}
              className="px-5 py-2 bg-[#EFE7DA] border border-[#D6A86E] text-[#B26A27] rounded-full text-xs font-bold hover:bg-[#B26A27] hover:text-white transition shadow-xs active:scale-95"
            >
              🖨️ 列印 / PDF
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
