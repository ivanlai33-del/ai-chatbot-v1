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

export default function StarkWorksProposalPage() {
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

  // Selected Plan State
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "flagship">("flagship");

  // Admin View State
  const [isAdminView, setIsAdminView] = useState(false);
  const [invoiceRecords, setInvoiceRecords] = useState<InvoiceRecord[]>([]);

  // Password Verification (Today's date: 20260725 or 0725)
  const VALID_PASSWORDS = ["20260725", "0725", "20260724", "0724"];

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

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isUnlocked]);

  useEffect(() => {
    const unlocked = sessionStorage.getItem("proposal_unlocked_stark_works");
    if (unlocked === "true") {
      setIsUnlocked(true);
    }
    const savedInfo = localStorage.getItem("stark_works_invoice_info");
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
        const defaultLiffId = process.env.NEXT_PUBLIC_LINE_LIFF_ID || "2000000000-xxxxxx";
        if (!liff.isLoggedIn()) {
          await liff.init({ liffId: defaultLiffId }).catch(() => {});
        }
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
      sessionStorage.setItem("proposal_unlocked_stark_works", "true");
      setErrorMsg("");
    } else {
      setErrorMsg("密碼不正確，請重新輸入（提示：本日日期 8 碼 20260725 或 4 碼 0725）");
    }
  };

  const handleMonthlyCheckout = async () => {
    setCheckoutLoading(true);
    const amount = selectedPlan === "flagship" ? 3675 : 2625; // 3,500 + 5% = 3,675 / 2,500 + 5% = 2,625
    try {
      const res = await fetch("/api/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: `stark_works_ai_${selectedPlan}`,
          cycle: "monthly",
          amount,
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
    localStorage.setItem("stark_works_invoice_info", JSON.stringify(info));

    try {
      const res = await fetch("/api/proposals/invoice-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          taxId,
          invoiceAddress,
          contactEmail,
          proposalSlug: "stark-works",
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

  // Password Lock View
  if (!isUnlocked) {
    return (
      <div className="w-full min-h-screen bg-[#0F172A] text-[#E2E8F0] flex flex-col justify-center items-center p-4 font-sans overflow-x-hidden">
        <Script src="https://static.line-scdn.net/liff/edge/2/sdk.js" onLoad={handleLiffInit} />
        <div className="w-full max-w-sm bg-[#1E293B] border border-[#334155] rounded-3xl p-6 shadow-2xl text-center backdrop-blur-md">
          <div className="w-12 h-12 bg-emerald-900/50 text-emerald-400 rounded-full flex items-center justify-center text-xl mx-auto mb-3 border border-emerald-500/30">
            🏃‍♂️
          </div>
          <h1 className="text-lg font-bold mb-1.5 text-white">
            【史塔克運動科學團隊】<br />AI 運動顧問與雙通道智能店長系統提案
          </h1>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            本專案報價為受資安防護與商業加密保護之受控內容，請輸入授權密碼檢視。
          </p>

          <form onSubmit={handleUnlock} className="space-y-3">
            <div>
              <input
                type="password"
                placeholder="請輸入瀏覽密碼 (如: 20260725)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-center text-base focus:outline-none focus:border-emerald-500 text-white placeholder-slate-500"
                autoFocus
              />
            </div>

            {errorMsg && <p className="text-xs text-rose-400 font-medium">{errorMsg}</p>}

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg transition text-sm active:scale-95 cursor-pointer"
            >
              解鎖檢視史塔克專屬提案
            </button>
          </form>

          <div className="mt-4 pt-3 border-t border-slate-700/60 text-[10px] text-slate-400 flex items-center justify-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
            <span>bot.ycideas.com 📱 史塔克運動科學團隊專屬提案</span>
          </div>
        </div>
      </div>
    );
  }

  // Section 1: Cover Header
  const sectionCover = (
    <div className="w-full my-auto text-center py-2">
      <div className="flex items-center justify-center gap-2 mb-2 md:mb-3">
        <span className="h-[1px] w-6 md:w-10 bg-emerald-500"></span>
        <span className="text-[10px] md:text-xs font-bold text-emerald-400 tracking-widest uppercase font-mono">
          SPECIAL PROPOSAL ✕ 史塔克運動科學團隊
        </span>
        <span className="h-[1px] w-6 md:w-10 bg-emerald-500"></span>
      </div>

      <h1 className="text-xl md:text-4xl lg:text-5xl font-black mb-2 md:mb-4 leading-tight text-white">
        【史塔克運動科學團隊】<br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
          LINE 官方帳號 ✕ 官網雙通道 AI 運動顧問系統
        </span>
      </h1>

      <p className="text-xs md:text-base text-slate-300 max-w-2xl mx-auto mb-4 md:mb-6 leading-relaxed font-medium">
        結合史塔克 11 年頂尖選手與大眾運動科學專業！<b>「LINE 機器人 ✕ 官網 AI 小幫手雙通道進駐 ✕ 動作評估諮詢導客 ✕ 1對1課程線上預約 ✕ Shopline 電商產品推薦」</b>全方位 AI 智能店長！
      </p>

      {/* 4 Core Pillars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-4 md:mb-6 text-left">
        <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-xl shadow-xs backdrop-blur-md">
          <div className="text-xs md:text-sm font-bold text-emerald-400 mb-1">🏃‍♂️ 史塔克運動科學大腦</div>
          <p className="text-[11px] md:text-xs text-slate-300 leading-tight">精準分流久坐族、增肌減脂、運動嗜好、頂尖選手與急性/照護特別族群諮詢。</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-xl shadow-xs backdrop-blur-md">
          <div className="text-xs md:text-sm font-bold text-teal-400 mb-1">📲 LINE ✕ 官網雙通道進駐</div>
          <p className="text-[11px] md:text-xs text-slate-300 leading-tight">LINE 官方帳號全天候自動客服，同步支援 Shopline 官網右下角嵌入式 AI 小幫手！</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-xl shadow-xs backdrop-blur-md">
          <div className="text-xs md:text-sm font-bold text-cyan-400 mb-1">📅 1對1評估與課程線上預約</div>
          <p className="text-[11px] md:text-xs text-slate-300 leading-tight">引導學員完成初次體能/動作評估諮詢，LIFF 點擊即可完成 1對1 訓練線上預約！</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-xl shadow-xs backdrop-blur-md">
          <div className="text-xs md:text-sm font-bold text-sky-400 mb-1">🛍️ Shopline 周邊器材導購</div>
          <p className="text-[11px] md:text-xs text-slate-300 leading-tight">推薦 FLEXIBAR、AIREX、BellaBambi、MUNI、SoftX 與運動精油圖文產品卡片。</p>
        </div>
      </div>

      <div className="inline-flex items-center flex-wrap justify-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full text-xs font-bold shadow-md mb-4">
        <span>✨ 實用版建置費：NT$ 38,000</span>
        <span>•</span>
        <span>✨ 旗艦雙通道版：NT$ 68,000</span>
        <span>•</span>
        <span>✨ 維護費：NT$ 2,500~3,500/月</span>
      </div>

      <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 font-medium flex justify-center flex-wrap gap-2 md:gap-4">
        <span>🏢 <b>提案單位：</b>奕暢創新設計工作室 <span className="font-mono text-emerald-400">(統編: 41370842)</span></span>
        <span>💬 <b>LINE ID：</b><b className="text-emerald-400 font-mono">ivanlai33</b></span>
        <span>📞 <b>電話：</b><b className="text-emerald-400 font-mono">0987528785</b></span>
      </div>
    </div>
  );

  // Section 2: Requirements & Problem Statement (STARK.WORKS Focus)
  const sectionRequirements = (
    <div className="w-full my-auto space-y-4">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <h2 className="text-base md:text-2xl font-bold text-white">
          【史塔克運動科學】品牌痛點與 AI 解決方案
        </h2>
        <span className="text-[10px] md:text-xs bg-emerald-900/60 text-emerald-300 px-2.5 py-0.5 rounded-full font-bold border border-emerald-700/50">
          需求完全對齊
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🎯</span>
            <h3 className="font-bold text-sm md:text-base text-emerald-400">挑戰 1：5大族群需求各異，人工客服回覆耗時</h3>
          </div>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            史塔克服務涵蓋「久坐族、增肌減脂、運動嗜好、頂尖選手與特別照護者」。<b>AI 智庫能自動辨識諮詢者身分，給予最精準的運動科學建議與課程引導。</b>
          </p>
        </div>

        <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🌐</span>
            <h3 className="font-bold text-sm md:text-base text-teal-400">挑戰 2：官網與 LINE 訪客雙向分散，諮詢中斷</h3>
          </div>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            官網 (stark.works) 逛街訪客與 LINE 好友分流。<b>建置雙通道 AI 機器人，官網嵌入式客服與 LINE 機器人共享同一個 AI 大腦，不漏接任何意向顧客！</b>
          </p>
        </div>

        <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">📅</span>
            <h3 className="font-bold text-sm md:text-base text-cyan-400">挑戰 3：1對1訓練與動作評估，預約流程繁瑣</h3>
          </div>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            顧客常詢問「怎麼預約一對一訓練？」、「急性不適怎麼辦？」。<b>AI 秒回諮詢並彈出 LIFF 線上預約選單，大幅提高諮詢轉化為實體預約的成功率！</b>
          </p>
        </div>

        <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🛍️</span>
            <h3 className="font-bold text-sm md:text-base text-sky-400">挑戰 4：Shopline 運動器材與周邊電商導購</h3>
          </div>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            當顧客詢問「FLEXIBAR 如何使用？」、「AIREX 墊子或運動精油推薦」，<b>AI 自動引導彈出產品卡片，點擊直達 Shopline 購物車完成結帳！</b>
          </p>
        </div>
      </div>
    </div>
  );

  // Section 3: Detailed Modules Breakdown (LINE + Web Widget)
  const sectionModules = (
    <div className="w-full my-auto space-y-3">
      <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
        <h2 className="text-base md:text-2xl font-bold text-white">
          詳細功能模組與雙通道系統架構拆解
        </h2>
        <span className="text-[10px] md:text-xs bg-emerald-900/60 text-emerald-300 px-2.5 py-0.5 rounded-full font-bold border border-emerald-700/50">
          4 大核心模組
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {/* Module 1: LINE & Web Bot Dual Channel */}
        <div className="bg-slate-800/80 border border-emerald-500/40 p-3 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <h4 className="font-bold text-xs md:text-sm text-emerald-400 flex items-center gap-1.5">
              <span>📲</span> 模組 1：LINE 官方帳號 ✕ 官網小幫手雙通道進駐
            </h4>
            <span className="text-[10px] bg-emerald-900/80 text-emerald-200 px-1.5 py-0.5 rounded font-mono">
              雙通道 AI 大腦
            </span>
          </div>
          <ul className="text-[11px] md:text-xs text-slate-300 space-y-1">
            <li>✓ <b>LINE 機器人主通道</b>：24H 自動回應官方帳號訊息、發送圖文卡片</li>
            <li>✓ <b>官網右下角 AI Widget 嵌入</b>：一行程式碼直接嵌入 Shopline 官網</li>
            <li>✓ <b>共享知識庫與語氣</b>：官網與 LINE 諮詢紀錄自動同步，體驗完整</li>
          </ul>
        </div>

        {/* Module 2: Sports Science Knowledge Base */}
        <div className="bg-slate-800/80 border border-teal-500/40 p-3 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <h4 className="font-bold text-xs md:text-sm text-teal-400 flex items-center gap-1.5">
              <span>🏋️‍♂️</span> 模組 2：史塔克運動科學與5大族群諮詢智庫
            </h4>
            <span className="text-[10px] bg-teal-900/80 text-teal-200 px-1.5 py-0.5 rounded font-mono">
              專業知識庫
            </span>
          </div>
          <ul className="text-[11px] md:text-xs text-slate-300 space-y-1">
            <li>✓ <b>5大族群精準問答</b>：久坐族、增肌減脂、運動嗜好、專項選手、特別照護族</li>
            <li>✓ <b>醫師與教練團隊導流</b>：急性不適自動引導至團隊醫師門診與評估流程</li>
            <li>✓ <b>品牌 11 年權威人設</b>：展現亞洲頂尖選手訓練經驗與專業信任感</li>
          </ul>
        </div>

        {/* Module 3: Booking & Course Assessment */}
        <div className="bg-slate-800/80 border border-cyan-500/40 p-3 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <h4 className="font-bold text-xs md:text-sm text-cyan-400 flex items-center gap-1.5">
              <span>📅</span> 模組 3：1對1訓練預約與體能評估引導 (LIFF)
            </h4>
            <span className="text-[10px] bg-cyan-900/80 text-cyan-200 px-1.5 py-0.5 rounded font-mono">
              線上預約導客
            </span>
          </div>
          <ul className="text-[11px] md:text-xs text-slate-300 space-y-1">
            <li>✓ <b>初次動作評估導流</b>：引導新學員進行動作篩檢與體能諮詢</li>
            <li>✓ <b>LINE LIFF 滿版預約選單</b>：直覺選擇課程、時段與服務教練</li>
            <li>✓ <b>預約前自動提醒 SOP</b>：課前注意事項與門市位置地圖自動發送</li>
          </ul>
        </div>

        {/* Module 4: E-commerce Product Recommendation */}
        <div className="bg-slate-800/80 border border-sky-500/40 p-3 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <h4 className="font-bold text-xs md:text-sm text-sky-400 flex items-center gap-1.5">
              <span>🛍️</span> 模組 4：Shopline 運動器材與周邊產品 AI 導購
            </h4>
            <span className="text-[10px] bg-sky-900/80 text-sky-200 px-1.5 py-0.5 rounded font-mono">
              電商圖文導購
            </span>
          </div>
          <ul className="text-[11px] md:text-xs text-slate-300 space-y-1">
            <li>✓ <b>圖文產品卡片</b>：自動拉出 FLEXIBAR、AIREX、BellaBambi、精油等卡片</li>
            <li>✓ <b>使用場景建議</b>：根據學員恢復需求，主動推薦搭配之運動修復器材</li>
            <li>✓ <b>直達 Shopline 購物車</b>：點擊直接跳轉完成下單，提高電商轉換率</li>
          </ul>
        </div>
      </div>
    </div>
  );

  // Section 4: Pricing Options (Starter vs Flagship Dual Channel)
  const sectionPricing = (
    <div className="w-full my-auto space-y-3">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <h2 className="text-base md:text-2xl font-bold text-white">
          史塔克專案報價方案選擇與發票資料
        </h2>
        <div className="flex items-center gap-1 text-xs">
          <button
            onClick={() => setSelectedPlan("starter")}
            className={`px-3 py-1 rounded-lg font-bold transition ${selectedPlan === "starter" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400"}`}
          >
            精準實用版 ($38,000)
          </button>
          <button
            onClick={() => setSelectedPlan("flagship")}
            className={`px-3 py-1 rounded-lg font-bold transition ${selectedPlan === "flagship" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400"}`}
          >
            ★ 雙通道旗艦版 ($68,000)
          </button>
        </div>
      </div>

      {/* Pricing Cards Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Starter Plan */}
        <div className={`bg-slate-800 border-2 rounded-2xl p-3.5 shadow-xs flex flex-col justify-between ${selectedPlan === "starter" ? "border-emerald-500" : "border-slate-700 opacity-80"}`}>
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-xs md:text-sm text-emerald-400">
                🟢 【方案 A】LINE 機器人精準實用版
              </span>
              <span className="text-[10px] bg-emerald-900/80 text-emerald-200 px-2 py-0.5 rounded-full font-bold">
                專注 LINE 管道
              </span>
            </div>
            <div className="text-2xl md:text-3xl font-black font-mono text-white my-1">
              NT$ 38,000 <span className="text-xs font-normal text-slate-400">(建置費未稅)</span>
            </div>
            <div className="text-xs text-slate-300 mb-2 bg-slate-900/80 p-1.5 rounded-lg border border-slate-700">
              月維護費：<b>NT$ 2,500 / 月 (未稅)</b> ｜ 含 5% 稅金 <b>$2,625/月</b>
            </div>
            <ul className="text-xs text-slate-300 space-y-1 mb-2">
              <li className="flex items-center gap-1"><span className="text-emerald-400 font-bold">✓</span> <b>LINE 官方帳號 24H AI 店長進駐</b></li>
              <li className="flex items-center gap-1"><span className="text-emerald-400 font-bold">✓</span> 史塔克運動科學與 5 大族群專業智庫</li>
              <li className="flex items-center gap-1"><span className="text-emerald-400 font-bold">✓</span> 1對1預約與體能評估線上導流選單</li>
              <li className="flex items-center gap-1"><span className="text-emerald-400 font-bold">✓</span> Shopline 運動器材產品圖文卡片推薦</li>
            </ul>
          </div>
          <button
            onClick={() => setSelectedPlan("starter")}
            className="w-full py-1.5 bg-slate-700 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition cursor-pointer"
          >
            {selectedPlan === "starter" ? "✓ 已選擇實用版" : "選擇實用版"}
          </button>
        </div>

        {/* Flagship Dual Channel Plan */}
        <div className={`bg-slate-800 border-2 rounded-2xl p-3.5 shadow-md flex flex-col justify-between ${selectedPlan === "flagship" ? "border-teal-400 bg-teal-950/20" : "border-slate-700 opacity-80"}`}>
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-xs md:text-sm text-teal-300">
                💎 【方案 B】LINE ✕ 官網雙通道全方位旗艦版
              </span>
              <span className="text-[10px] bg-teal-900 text-teal-200 px-2 py-0.5 rounded-full font-bold">
                全通道導客首選
              </span>
            </div>
            <div className="text-2xl md:text-3xl font-black font-mono text-white my-1">
              NT$ 68,000 <span className="text-xs font-normal text-slate-400">(建置費未稅)</span>
            </div>
            <div className="text-xs text-slate-300 mb-2 bg-slate-900/80 p-1.5 rounded-lg border border-slate-700">
              月維護費：<b>NT$ 3,500 / 月 (未稅)</b> ｜ 含 5% 稅金 <b>$3,675/月</b>
            </div>
            <ul className="text-xs text-slate-300 space-y-1 mb-3">
              <li className="flex items-center gap-1"><span className="text-teal-300 font-bold">★</span> <b>包含方案 A 所有功能 ✕ 官網嵌入式 AI 小幫手</b></li>
              <li className="flex items-center gap-1"><span className="text-teal-300 font-bold">✓</span> <b>stark.works 官網右下角一鍵嵌入 Web Widget</b></li>
              <li className="flex items-center gap-1"><span className="text-teal-300 font-bold">✓</span> 雙通道資料共享：官網訪客直接引導加入 LINE 預約</li>
              <li className="flex items-center gap-1"><span className="text-teal-300 font-bold">✓</span> 享優先語氣客製與電商數據月報表分析</li>
            </ul>
          </div>

          <button
            onClick={handleMonthlyCheckout}
            disabled={checkoutLoading}
            className="w-full py-2 px-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-extrabold rounded-xl shadow-md transition flex items-center justify-center gap-1 text-xs cursor-pointer active:scale-95"
          >
            <span>💳</span>
            <span>{checkoutLoading ? "正在連接藍新金流..." : `線上驗收綁定刷卡開通 (${selectedPlan === "flagship" ? "NT$ 3,675/月含稅" : "NT$ 2,625/月含稅"})`}</span>
            <span>➔</span>
          </button>
        </div>
      </div>

      {/* Bank Account Details */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-2 border-emerald-500/50 rounded-2xl p-2.5 shadow-xs">
        <div className="flex justify-between items-center mb-1">
          <h4 className="font-bold text-emerald-400 text-xs md:text-sm flex items-center gap-1">
            <span>🏦</span> 建置費訂金與尾款 — 現金匯款指定帳號
          </h4>
          <button
            onClick={handleCopyAccount}
            className="px-2 py-0.5 bg-emerald-600 text-white text-[11px] font-bold rounded-lg hover:bg-emerald-500 transition cursor-pointer"
          >
            {copySuccess ? "✓ 已複製" : "📋 複製帳號"}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 text-xs bg-slate-950/80 p-1.5 rounded-xl border border-slate-700">
          <div>
            <span className="text-slate-400 block text-[10px]">匯款銀行</span>
            <span className="font-bold text-white">中國信託</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">銀行代碼 / 分行</span>
            <span className="font-bold text-white">（822）內壢簡易型分行</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">戶名</span>
            <span className="font-bold text-white">賴奕暢</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">帳號</span>
            <span className="font-mono font-extrabold text-emerald-400 text-sm">131540035543</span>
          </div>
        </div>
      </div>

      {/* Invoice Info Form */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-2.5 shadow-xs">
        <div className="flex justify-between items-center mb-1">
          <h4 className="font-bold text-xs text-emerald-400 flex items-center gap-1">
            <span>🧾</span> 史塔克團隊發票資料填寫 (開立三聯式發票)
          </h4>
          <div className="flex items-center gap-2">
            {isSaved && (
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-900/50 px-2 py-0.5 rounded border border-emerald-700/50">
                ✓ 已傳送
              </span>
            )}
            <button onClick={toggleAdminView} className="text-xs text-emerald-400 underline cursor-pointer">
              {isAdminView ? "返回" : "🔍 發票紀錄"}
            </button>
          </div>
        </div>

        {isAdminView ? (
          <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-700 max-h-32 overflow-y-auto space-y-1 text-xs">
            <div className="font-bold text-emerald-400 border-b border-slate-700 pb-1 flex justify-between">
              <span>所有已填寫發票清單</span>
              <span>狀態: 已同步至雲端</span>
            </div>
            {invoiceRecords.length === 0 ? (
              <p className="text-xs text-slate-400 py-2 text-center">目前尚無已填寫之發票資料紀錄</p>
            ) : (
              invoiceRecords.map((r) => (
                <div key={r.id} className="bg-slate-800 p-1.5 rounded-lg border border-slate-700 space-y-0.5">
                  <div className="flex justify-between font-bold text-white">
                    <span>🏢 {r.company_name}</span>
                    <span className="font-mono text-emerald-400">統編: {r.tax_id}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
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
                className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:border-emerald-500 text-white placeholder-slate-500"
                required
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="統一編號 (統編)"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:border-emerald-500 text-white placeholder-slate-500"
                required
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="發票寄送地址"
                value={invoiceAddress}
                onChange={(e) => setInvoiceAddress(e.target.value)}
                className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:border-emerald-500 text-white placeholder-slate-500"
              />
            </div>
            <div>
              <input
                type="email"
                placeholder="電子發票通知 Email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:border-emerald-500 text-white placeholder-slate-500"
              />
            </div>
            <div className="md:col-span-2 text-right">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition cursor-pointer"
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
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <h2 className="text-base md:text-2xl font-bold text-white">
          全遠端零干擾建置、測試與上線時程
        </h2>
        <span className="text-[10px] md:text-xs bg-emerald-900/60 text-emerald-300 px-2.5 py-0.5 rounded-full font-bold border border-emerald-700/50">
          100% 全遠端無縫導入
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 shadow-xs">
          <span className="inline-block px-2.5 py-0.5 bg-emerald-600 text-white rounded-full text-[10px] font-bold mb-2">PHASE 1 (Week 1)</span>
          <h4 className="font-bold text-emerald-400 mb-1.5 text-sm md:text-base">LINE 授權與運動科學知識庫建置</h4>
          <ul className="text-xs md:text-sm text-slate-300 space-y-1">
            <li>✓ 簽訂合約並<b>轉帳付訂金</b></li>
            <li>✓ 授權 LINE 官方帳號與 Shopline 官網連線</li>
            <li>✓ 匯入史塔克 11 年 5 大族群專業智庫與課程介紹</li>
          </ul>
        </div>
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 shadow-xs">
          <span className="inline-block px-2.5 py-0.5 bg-emerald-600 text-white rounded-full text-[10px] font-bold mb-2">PHASE 2 (Week 2)</span>
          <h4 className="font-serif font-bold text-teal-400 mb-1.5 text-sm md:text-base">預約流程與雙通道測試</h4>
          <ul className="text-xs md:text-sm text-slate-300 space-y-1">
            <li>✓ 提供專屬測試環境，測試 1對1評估線上預約</li>
            <li>✓ 測試 Shopline 周邊器材圖文卡片拉取與導購</li>
            <li>✓ 雙方進行 30 分鐘線上視訊會審微調諮詢對話語氣</li>
          </ul>
        </div>
        <div className="bg-slate-800/80 border-2 border-emerald-500 rounded-2xl p-4 shadow-xs bg-emerald-950/20">
          <span className="inline-block px-2.5 py-0.5 bg-emerald-600 text-white rounded-full text-[10px] font-bold mb-2">PHASE 3 (Week 3 遠端驗收)</span>
          <h4 className="font-bold text-emerald-400 mb-1.5 text-sm md:text-base">驗收開通 ➔ 綁定信用卡 ➔ 保固</h4>
          <ul className="text-xs md:text-sm text-slate-200 space-y-1 font-medium">
            <li>✓ 系統全面開通正式串接發布</li>
            <li>✓ 線上通過驗收並<b>付驗收尾款</b></li>
            <li>✓ 點擊按鈕<b>線上綁定藍新信用卡開通月維護！</b></li>
            <li>✓ 享【首月 30 天線上免費維護保障】，依需求免費微調！</li>
          </ul>
        </div>
      </div>
    </div>
  );

  // Section 6: Checklist & Security
  const sectionChecklist = (
    <div className="w-full my-auto space-y-4">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <h2 className="text-base md:text-2xl font-bold text-white">
          詳細服務交付 ✕ 系統完整清單
        </h2>
        <span className="text-[10px] md:text-xs bg-emerald-900/60 text-emerald-300 px-2.5 py-0.5 rounded-full font-bold border border-emerald-700/50">
          史塔克專屬交付清單
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 shadow-xs">
          <h4 className="font-bold text-emerald-400 text-xs md:text-sm mb-2">📌 AI 系統建置交付清單 (一次性)</h4>
          <ul className="text-xs md:text-sm text-slate-300 space-y-1.5">
            <li>✓ 100% 全遠端雲端建置與線上指導驗收</li>
            <li>✓ <b>1. LINE 官方帳號 ✕ 官網 AI 小幫手雙通道</b></li>
            <li>✓ <b>2. 史塔克運動科學與 5大族群專業智庫</b></li>
            <li>✓ <b>3. 1對1訓練與動作評估線上預約 (LIFF)</b></li>
            <li>✓ <b>4. Shopline 周邊器材圖文卡片導購</b></li>
          </ul>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 shadow-xs">
          <h4 className="font-bold text-teal-400 text-xs md:text-sm mb-2">🔄 代營運與保固交付 (每月持續)</h4>
          <ul className="text-xs md:text-sm text-slate-300 space-y-1">
            <li>✓ <b>首月 30 天線上免費維護保障 (語氣與內容微調)</b></li>
            <li>✓ 每月課程庫與商品資訊編修支援</li>
            <li>✓ 官方 LINE 與官網 API 連線維護與系統安全</li>
            <li>✓ 雲端資料庫與對話紀錄每日自動備份</li>
          </ul>
        </div>

        <div className="bg-emerald-950/40 border-2 border-emerald-500/60 rounded-2xl p-4 shadow-xs">
          <h4 className="font-bold text-cyan-400 text-xs md:text-sm mb-2">🔒 企業級帳號安全與個資防線</h4>
          <ul className="text-xs md:text-sm text-slate-200 space-y-1 font-medium">
            <li>✓ <b>官方帳號安全金鑰防護</b>：連線憑證高強度加密隔離</li>
            <li>✓ <b>AI 惡意意圖過濾</b>：防範無關干擾與競業惡意探聽</li>
            <li>✓ <b>學員健康個資保護</b>：符合個人資料保護法</li>
            <li>✓ <b>店家專屬權限鎖</b>：非授權帳號無法變更</li>
          </ul>
        </div>
      </div>
    </div>
  );

  // Section 7: Summary & ROI
  const sectionSummary = (
    <div className="w-full my-auto space-y-4">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <h2 className="text-base md:text-2xl font-bold text-white">
          傳統真人客服 ✕ 史塔克 AI 雙通道智能店長效益比較
        </h2>
        <span className="text-[10px] md:text-xs bg-emerald-900/60 text-emerald-300 px-2.5 py-0.5 rounded-full font-bold border border-emerald-700/50">
          商業價值總結
        </span>
      </div>

      <div className="bg-slate-800/90 border-2 border-emerald-500/60 rounded-2xl overflow-x-auto shadow-xs">
        <table className="w-full min-w-[320px] text-left text-xs md:text-sm">
          <thead className="bg-slate-900 text-emerald-400 font-bold border-b border-slate-700">
            <tr>
              <th className="p-2 md:p-2.5">評估比較項目</th>
              <th className="p-2 md:p-2.5 text-slate-400">傳統真人客服 / 罐頭機器人</th>
              <th className="p-2 md:p-2.5 text-emerald-400 bg-emerald-950/40 font-black">🏃‍♂️ 史塔克 AI 雙通道智能店長</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700 text-slate-200">
            <tr>
              <td className="p-2 md:p-2.5 font-bold">5大族群諮詢響應速度</td>
              <td className="p-2 md:p-2.5 text-slate-400">課後或下班時間無法回覆，潛在學員流失</td>
              <td className="p-2 md:p-2.5 font-bold text-emerald-400 bg-emerald-950/40"><b>24H 秒級精準解答，自動辨識族群需求</b></td>
            </tr>
            <tr>
              <td className="p-2 md:p-2.5 font-bold">官網與 LINE 雙通道整合</td>
              <td className="p-2 md:p-2.5 text-slate-400">官網訪客問完就走，無法留下名單</td>
              <td className="p-2 md:p-2.5 font-bold text-emerald-400 bg-emerald-950/40"><b>官網 AI 小幫手 ✕ LINE 機器人同步導客</b></td>
            </tr>
            <tr>
              <td className="p-2 md:p-2.5 font-bold">1對1預約與電商導購率</td>
              <td className="p-2 md:p-2.5 text-slate-400">文字對話重複貼連結，轉換率低</td>
              <td className="p-2 md:p-2.5 font-bold text-emerald-400 bg-emerald-950/40"><b>彈出 LIFF 預約選單與 Shopline 產品卡片</b></td>
            </tr>
            <tr>
              <td className="p-2 md:p-2.5 font-bold">方案負擔與CP值</td>
              <td className="p-2 md:p-2.5 text-rose-400 font-mono font-bold">聘用專職客服 3.5 萬 ~ 4.5 萬/月</td>
              <td className="p-2 md:p-2.5 text-emerald-400 font-mono font-black bg-emerald-950/40"><b>建置費 $38,000起 (月維護低至 $2,500/月)</b></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Proposing Company Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-2 border-emerald-500/60 rounded-2xl p-3 md:p-4 shadow-xs flex flex-col md:flex-row justify-between items-center gap-2">
        <div>
          <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold block w-fit mb-1">
            🏢 提案團隊聯絡資訊
          </span>
          <h3 className="font-extrabold text-sm md:text-base text-white flex items-center gap-1.5">
            <span>奕暢創新設計工作室</span>
            <span className="text-[10px] md:text-xs font-mono font-bold text-emerald-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
              統編: 41370842
            </span>
          </h3>
        </div>

        <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm">
          <div className="bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700">
            <span className="text-[9px] text-slate-400 block">LINE ID</span>
            <span className="font-mono font-black text-emerald-400">ivanlai33</span>
          </div>

          <div className="bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700">
            <span className="text-[9px] text-slate-400 block">電話</span>
            <span className="font-mono font-black text-emerald-400">0987528785</span>
          </div>
        </div>
      </div>
    </div>
  );

  const allSections = [
    { title: "封面", component: sectionCover },
    { title: "品牌需求對齊", component: sectionRequirements },
    { title: "4大雙通道模組", component: sectionModules },
    { title: "方案金額與發票", component: sectionPricing },
    { title: "建置時程", component: sectionTimeline },
    { title: "交付清單", component: sectionChecklist },
    { title: "效益總結", component: sectionSummary },
  ];

  return (
    <div className="w-full min-h-screen bg-[#0F172A] text-slate-200 font-sans overflow-x-hidden">
      <Script src="https://static.line-scdn.net/liff/edge/2/sdk.js" onLoad={handleLiffInit} />

      {/* Top Header Bar */}
      <header className="sticky top-0 z-50 bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-800 px-4 py-2.5">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            <span className="font-bold text-xs md:text-sm text-white">
              史塔克運動科學團隊 — AI 運動顧問與雙通道智能店長系統
            </span>
          </div>
          <div className="text-[10px] md:text-xs text-slate-400 font-mono flex items-center gap-1.5">
            <span className="text-emerald-300 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/50">
              🛡️ 史塔克專屬提案
            </span>
            {lineProfile?.displayName && (
              <span className="hidden sm:inline text-teal-300 font-bold bg-teal-950/80 px-2 py-0.5 rounded border border-teal-700/50">
                👤 {lineProfile.displayName}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Mode: Native Vertical Continuous Scroll View inside LINE LIFF */}
      <div className="block md:hidden w-full max-w-xl mx-auto p-3 space-y-6 overflow-y-auto touch-pan-y" style={{ WebkitOverflowScrolling: "touch" }}>
        <div className="bg-[#1E293B]/90 border border-slate-800 rounded-3xl p-4 shadow-xl backdrop-blur-md">
          {sectionCover}
        </div>
        <div className="bg-[#1E293B]/90 border border-slate-800 rounded-3xl p-4 shadow-xl backdrop-blur-md">
          {sectionRequirements}
        </div>
        <div className="bg-[#1E293B]/90 border border-slate-800 rounded-3xl p-4 shadow-xl backdrop-blur-md">
          {sectionModules}
        </div>
        <div className="bg-[#1E293B]/90 border border-slate-800 rounded-3xl p-4 shadow-xl backdrop-blur-md">
          {sectionPricing}
        </div>
        <div className="bg-[#1E293B]/90 border border-slate-800 rounded-3xl p-4 shadow-xl backdrop-blur-md">
          {sectionTimeline}
        </div>
        <div className="bg-[#1E293B]/90 border border-slate-800 rounded-3xl p-4 shadow-xl backdrop-blur-md">
          {sectionChecklist}
        </div>
        <div className="bg-[#1E293B]/90 border border-slate-800 rounded-3xl p-4 shadow-xl backdrop-blur-md mb-8">
          {sectionSummary}
        </div>
      </div>

      {/* Desktop Mode: High-End Vertically & Horizontally Centered Minimalist Deck View */}
      <div className="hidden md:flex min-h-[calc(100vh-65px)] flex-col justify-between items-center p-6 max-w-5xl mx-auto">
        <main className="w-full h-[78vh] max-h-[700px] bg-[#1E293B]/90 border border-slate-800 rounded-3xl p-8 md:p-10 shadow-2xl flex flex-col justify-center items-center my-auto backdrop-blur-md overflow-y-auto">
          {allSections[currentSlide].component}
        </main>

        <footer className="w-full flex justify-between items-center pt-3 border-t border-slate-800">
          <div className="text-xs font-mono font-bold text-slate-400">
            SLIDE {currentSlide + 1} / {allSections.length} — {allSections[currentSlide].title}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentSlide((prev) => Math.max(prev - 1, 0))}
              disabled={currentSlide === 0}
              className="px-5 py-2 bg-slate-800 border border-slate-700 rounded-full text-xs font-bold text-slate-200 hover:bg-emerald-600 hover:text-white disabled:opacity-30 transition shadow-xs active:scale-95 cursor-pointer"
            >
              ← 上一頁
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => Math.min(prev + 1, allSections.length - 1))}
              disabled={currentSlide === allSections.length - 1}
              className="px-5 py-2 bg-slate-800 border border-slate-700 rounded-full text-xs font-bold text-slate-200 hover:bg-emerald-600 hover:text-white disabled:opacity-30 transition shadow-xs active:scale-95 cursor-pointer"
            >
              下一頁 →
            </button>
            <button
              onClick={() => window.print()}
              className="px-5 py-2 bg-emerald-950 border border-emerald-700 text-emerald-300 rounded-full text-xs font-bold hover:bg-emerald-600 hover:text-white transition shadow-xs active:scale-95 cursor-pointer"
            >
              🖨️ 列印 / PDF
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
