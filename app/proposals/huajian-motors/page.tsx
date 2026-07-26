"use client";

import React, { useState, useEffect } from "react";
import Script from "next/script";
import { calculateProposalLifecycle, sendProposalAuditTrack } from "@/lib/services/ProposalLifecycleHelper";
import {
  SecurityWatermarkOverlay,
  OwnerBypassBanner,
  FraudAlertAndDomainVerifier,
  VpnInterceptModal,
  PrintSignatureSection,
  PROVIDER_INFO,
  ProposalEditableProvider,
  EditableText,
} from "@/components/proposals/CommercialDefenseComponents";

interface InvoiceRecord {
  id: string;
  company_name: string;
  tax_id: string;
  address: string;
  contact_email: string;
  created_at: string;
  notes: string;
}

export default function HuajianMotorsProposalPage() {
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  // Commercial Defense & Admin Bypass State
  const [isAdminBypass, setIsAdminBypass] = useState(false);
  const [isForeignOrVpn, setIsForeignOrVpn] = useState(false);

  // Proposal Effective Date
  const CREATED_AT = "2026-07-24";
  const [lifecycleState, setLifecycleState] = useState<{ stage: string; daysDiff: number }>(
    calculateProposalLifecycle(CREATED_AT)
  );

  useEffect(() => {
    sendProposalAuditTrack("huajian-motors", "PAGE_VISITED_SESSION").then((res) => {
      if (res && res.lifecycle) {
        setLifecycleState(res.lifecycle);
      }
    });
  }, []);

  // 🔴 3-Stage Lifecycle & Manual Closure (Unless Owner Bypass Mode)
  if (!isAdminBypass && (lifecycleState.stage === "ARCHIVED_404" || lifecycleState.stage === "MANUALLY_CLOSED")) {
    return (
      <div className="w-full min-h-screen bg-[#0F172A] text-slate-200 flex flex-col justify-center items-center p-6 text-center font-sans">
        <div className="w-16 h-16 bg-rose-950/80 text-rose-400 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-rose-700/50">
          🔒
        </div>
        <h1 className="text-3xl font-black mb-2 text-white">404 — 專案頁面已隱蔽歸檔</h1>
        <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed mb-6">
          {lifecycleState.stage === "MANUALLY_CLOSED"
            ? "本商業提案已由管理者手動隱蔽關閉，對外不開放檢視與存取。如需查看專案內容，請聯繫專案負責窗口。"
            : "本商業提案已超過最高有效期限並對外隱蔽歸檔，專案畫面與密碼視窗已下架。如需重新查看專案簡報，請聯繫專案負責窗口。"}
        </p>
      </div>
    );
  }

  // LIFF Context State
  const [lineProfile, setLineProfile] = useState<{ displayName?: string; userId?: string } | null>(null);

  // Invoice & Remittance Form State
  const [companyName, setCompanyName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [invoiceAddress, setInvoiceAddress] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [remittanceBank5, setRemittanceBank5] = useState("");
  const [remittanceName, setRemittanceName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Admin View State
  const [isAdminView, setIsAdminView] = useState(false);
  const [invoiceRecords, setInvoiceRecords] = useState<InvoiceRecord[]>([]);

  // Password Verification (Today's date: 20260724 or 0724)
  const VALID_PASSWORDS = ["20260724", "0724", "20260723", "0723", "20260725", "0725"];

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
    // 2. 🔑 管理者上帝視角 (?admin=87257257)
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("admin") === "87257257") {
        setIsAdminBypass(true);
        setIsUnlocked(true);
      }
    }

    const unlocked = sessionStorage.getItem("proposal_unlocked_huajian_motors");
    if (unlocked === "true") {
      setIsUnlocked(true);
      sendProposalAuditTrack("huajian-motors", "PAGE_VISITED_SESSION");
    }
    const savedInfo = localStorage.getItem("huajian_motors_invoice_info");
    if (savedInfo) {
      try {
        const parsed = JSON.parse(savedInfo);
        setCompanyName(parsed.companyName || "");
        setTaxId(parsed.taxId || "");
        setInvoiceAddress(parsed.invoiceAddress || "");
        setContactEmail(parsed.contactEmail || "");
        setRemittanceBank5(parsed.remittanceBank5 || "");
        setRemittanceName(parsed.remittanceName || "");
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
      sessionStorage.setItem("proposal_unlocked_huajian_motors", "true");
      setErrorMsg("");
      sendProposalAuditTrack("huajian-motors", "PASSWORD_UNLOCKED");
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
          planId: "huajian_motors_ai_social",
          cycle: "monthly",
          amount: 2625,
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

  // 6. 🔒 預約匯出帳號對帳綁定表單驗證與發送
  const handleSaveInvoiceInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !taxId) {
      alert("請填寫公司全銜與統一編號！");
      return;
    }
    if (!remittanceBank5 || !remittanceName) {
      alert("請填寫首期訂金對帳所需之「預計匯出銀行與帳號後 5 碼」與「預計匯款戶名」！");
      return;
    }

    setIsSubmitting(true);
    const info = { companyName, taxId, invoiceAddress, contactEmail, remittanceBank5, remittanceName };
    localStorage.setItem("huajian_motors_invoice_info", JSON.stringify(info));

    try {
      const res = await fetch("/api/proposals/invoice-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          taxId,
          invoiceAddress,
          contactEmail,
          remittanceBank5,
          remittanceName,
          proposalSlug: "huajian-motors",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsSaved(true);
        alert("✓ 發票與銀行對帳綁定資料已成功儲存並同步傳送！");
      } else {
        setIsSaved(true);
        alert("發票與對帳資料已成功儲存！");
      }
    } catch (err) {
      console.error(err);
      setIsSaved(true);
      alert("發票與對帳資料已儲存於本機。");
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

  // Password Lock View / 🟡 Stage 2 (EXPIRED 6-10 Days)
  if (!isUnlocked && !isAdminBypass) {
    return (
      <div className="w-full min-h-screen bg-[#121824] text-[#E2E8F0] flex flex-col justify-center items-center p-4 font-sans overflow-x-hidden">
        <Script src="https://static.line-scdn.net/liff/edge/2/sdk.js" onLoad={handleLiffInit} />
        <div className="w-full max-w-sm bg-[#1E293B] border border-[#334155] rounded-3xl p-6 shadow-2xl text-center backdrop-blur-md">
          {lifecycleState.stage === "EXPIRED" ? (
            <>
              <div className="w-12 h-12 bg-amber-900/50 text-amber-400 rounded-full flex items-center justify-center text-xl mx-auto mb-3 border border-amber-500/30">
                🔒
              </div>
              <h1 className="text-lg font-bold mb-1.5 text-rose-400">
                🔒 專案報價存取期限已過期失效
              </h1>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                本專案報價已超過 5 天有效存取期 (第 {lifecycleState.daysDiff} 天)，系統已自動停用密碼輸入。外人無法再輸入密碼查看內容，請聯絡專案窗口展延權限。
              </p>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
                <input
                  type="password"
                  disabled
                  placeholder="密碼已自動停用"
                  className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-center text-sm text-slate-500 cursor-not-allowed"
                />
                <button
                  type="button"
                  disabled
                  className="w-full py-2.5 bg-slate-700 text-slate-400 font-bold rounded-xl text-xs cursor-not-allowed"
                >
                  已停止解鎖
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="w-12 h-12 bg-blue-900/50 text-blue-400 rounded-full flex items-center justify-center text-xl mx-auto mb-3 border border-blue-500/30">
                🔑
              </div>
              <h1 className="text-lg font-bold mb-1 text-white">華鍵汽車 — 專案解鎖</h1>
              <p className="text-xs text-slate-400 mb-4">請輸入查看密碼觀看專案簡報</p>
              <form onSubmit={handleUnlock} className="space-y-3">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="請輸入解鎖密碼"
                  className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-center text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                  autoFocus
                />
                {errorMsg && <p className="text-xs text-rose-400 font-bold">{errorMsg}</p>}
                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition cursor-pointer active:scale-95 shadow-md"
                >
                  解鎖觀看簡報 ➔
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    );
  }

  // Section 1: Cover
  const sectionCover = (
    <div className="w-full text-center my-auto space-y-4">
      <div className="inline-block px-3 py-1 bg-blue-950/80 text-blue-300 rounded-full text-xs font-bold border border-blue-700/50 mb-2">
        🚗 華鍵汽車 ✕ 社群營運專屬提案
      </div>
      <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white leading-tight">
        華鍵汽車 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">AI 社群全自動文案</span><br/>
        與多平台發布系統
      </h1>
      <p className="text-xs md:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
        專為華鍵汽車打造：AI大腦每日自動為中古車款創作高吸引力貼文，一鍵同步發布至 FB 粉絲專頁、Instagram 與 Threads，讓好車曝光翻倍！
      </p>
      <div className="pt-2 flex justify-center items-center gap-4 text-xs text-slate-400 font-mono">
        <span>提案日期：2026-07-24</span>
        <span>｜</span>
        <span>規劃團隊：奕暢創新設計工作室</span>
      </div>
    </div>
  );

  // Section 2: Requirements
  const sectionRequirements = (
    <div className="w-full my-auto space-y-4">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <h2 className="text-base md:text-xl font-bold text-white">
          需求規格對齊 — 發文與照片配圖額度
        </h2>
        <span className="text-xs bg-blue-950 text-blue-300 px-2.5 py-0.5 rounded-full font-bold border border-blue-700">
          貼文規格
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700 space-y-2">
          <span className="text-xs font-bold text-blue-400">📅 每月貼文發布額度</span>
          <h3 className="text-lg font-black text-white">60 ~ 90 篇 / 月</h3>
          <p className="text-xs text-slate-400">包含每日定時自動發文與中古車特色推播文案。</p>
        </div>
        <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700 space-y-2">
          <span className="text-xs font-bold text-sky-400">🖼️ 車輛真實照無限量</span>
          <h3 className="text-lg font-black text-white">車款圖組配圖</h3>
          <p className="text-xs text-slate-400">每一篇車款文案自動匹配對應車款真實照與規格圖卡。</p>
        </div>
        <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700 space-y-2">
          <span className="text-xs font-bold text-purple-400">🌐 3 大社群平台一鍵同步</span>
          <h3 className="text-lg font-black text-white">FB ✕ IG ✕ Threads</h3>
          <p className="text-xs text-slate-400">一次撰寫發布，三大社群頻道同時觸及車友流量。</p>
        </div>
      </div>
    </div>
  );

  // Section 3: Core Modules
  const sectionModules = (
    <div className="w-full my-auto space-y-3">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <h2 className="text-base md:text-xl font-bold text-white">
          4 大核心建置模組 ✕ 彈性選配擴充
        </h2>
        <span className="text-xs bg-indigo-950 text-indigo-300 px-2.5 py-0.5 rounded-full font-bold border border-indigo-700">
          系統架構
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700 space-y-1">
          <h4 className="font-bold text-sm text-blue-400">1. 華鍵汽車專屬 AI 文案大腦</h4>
          <p className="text-xs text-slate-300">深度學習中古車選購細節、車款規格、配備亮點與信譽優勢，自動產生高轉換銷售文案。</p>
        </div>

        <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700 space-y-1">
          <h4 className="font-bold text-sm text-sky-400">2. 雙用後台 (手機/電腦簡化版)</h4>
          <p className="text-xs text-slate-300">提供超級極簡操作介面，無論在車場用手機或在辦公室用電腦，10 秒內完成貼文預覽與排程。</p>
        </div>

        <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700 space-y-1">
          <h4 className="font-bold text-sm text-indigo-400">3. 三大社群 API 自動同步發布引擎</h4>
          <p className="text-xs text-slate-300">整合 Meta API 與 Threads API，實現多平台排程自動送出，無須人工排版轉貼。</p>
        </div>

        <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700 space-y-1">
          <h4 className="font-bold text-sm text-emerald-400">4. 訪客 AI 秒回互動與留言私訊引導</h4>
          <p className="text-xs text-slate-300">貼文下方買家留言自動秒回，並適時導引至 LINE 官方帳號進行預約賞車與對話。</p>
        </div>
      </div>
    </div>
  );

  // Section 4: Pricing & Invoice
  const sectionPricing = (
    <div className="w-full my-auto space-y-3">
      <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
        <h2 className="text-base md:text-xl font-bold text-white">
          建置方案費用與匯款對帳發票資料
        </h2>
        <span className="text-xs bg-emerald-950 text-emerald-300 px-2.5 py-0.5 rounded-full font-bold border border-emerald-700">
          透明報價
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Card 1: One-time Setup ($36,000) */}
        <div className="bg-slate-800 border-2 border-blue-500/60 rounded-2xl p-3.5 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-xs md:text-sm text-blue-400">
                📌 【一次性】系統建置與 AI 訓練費
              </span>
              <span className="text-[10px] bg-blue-900/80 text-blue-200 px-2 py-0.5 rounded-full font-bold">
                分兩期 (訂金 / 尾款)
              </span>
            </div>
            <div className="text-2xl md:text-3xl font-black font-mono text-white my-1">
              NT$ 36,000 <span className="text-xs font-normal text-slate-400">(未稅)</span>
            </div>
            <div className="text-xs text-slate-300 mb-2 bg-slate-900/80 p-1.5 rounded-lg border border-slate-700">
              🧾 加上 5% 營業稅 ($1,800) ＝ <b>含稅總額 NT$ 37,800</b>
            </div>
            <ul className="text-xs text-slate-300 space-y-1 mb-2">
              <li className="flex items-center gap-1"><span className="text-blue-400 font-bold">✓</span> 100% 全遠端雲端建置，完全不干擾門市營運</li>
              <li className="flex items-center gap-1"><span className="text-blue-400 font-bold">✓</span> <b>包含 4 大系統模組：文案大腦、雙用後台、3平台發布與AI留言秒回</b></li>
              <li className="flex items-center gap-1"><span className="text-blue-400 font-bold">✓</span> 串接臉書粉絲團、Instagram 商業帳號與 Threads</li>
              <li className="flex items-center gap-1"><span className="text-blue-400 font-bold">✓</span> 享【首月 30 天線上免費維護保障與語氣微調】</li>
            </ul>
          </div>
          <div className="text-xs text-slate-300 bg-blue-950/50 p-1.5 rounded-xl border border-blue-700/50 text-center font-medium">
            👇 簽約付訂金 $18,900 (含稅)；線上驗收付尾款 $18,900 (含稅)
          </div>
        </div>

        {/* Card 2: Monthly Managed ($2,500/mo) */}
        <div className="bg-slate-800 border-2 border-indigo-500/60 rounded-2xl p-3.5 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-xs md:text-sm text-indigo-400">
                💳 【每月】代營運與多平台連線維護費
              </span>
              <span className="text-[10px] bg-emerald-900/80 text-emerald-200 px-2 py-0.5 rounded-full font-bold">
                每月持續維持
              </span>
            </div>
            <div className="text-2xl md:text-3xl font-black font-mono text-white my-1">
              NT$ 2,500 <span className="text-xs font-normal text-slate-400">/ 月 (未稅)</span>
            </div>
            <div className="text-xs mb-2 bg-slate-900/80 p-1.5 rounded-lg border border-slate-700 text-slate-300">
              🧾 加上 5% 營業稅 ($125) ＝ <b>含稅 NT$ 2,625 / 月</b>
            </div>
            <ul className="text-xs text-slate-300 space-y-1 mb-3">
              <li className="flex items-center gap-1"><span className="text-emerald-400 font-bold">★</span> <b>月發文 60-90 篇 ✕ 車輛照片無限量 ✕ AI留言秒回無限次</b></li>
              <li className="flex items-center gap-1"><span className="text-indigo-400 font-bold">✓</span> 每月華鍵汽車知識庫彈性新增與車款微調</li>
            </ul>
          </div>

          <button
            onClick={handleMonthlyCheckout}
            disabled={checkoutLoading}
            className="w-full py-2 px-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white font-extrabold rounded-xl shadow-md transition flex items-center justify-center gap-1 text-xs cursor-pointer active:scale-95"
          >
            <span>💳</span>
            <span>{checkoutLoading ? "正在連接藍新金流..." : "驗收通過點此【線上綁定藍新信用卡開通】(NT$ 2,625/月含稅)"}</span>
            <span>➔</span>
          </button>
        </div>
      </div>

      {/* 5. 🚨 官方直營防詐聲明與網域驗證 */}
      <FraudAlertAndDomainVerifier />

      {/* Bank Account Details */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-2 border-blue-500/50 rounded-2xl p-2.5 shadow-xs">
        <div className="flex justify-between items-center mb-1">
          <h4 className="font-bold text-blue-400 text-xs md:text-sm flex items-center gap-1">
            <span>🏦</span> 建置費訂金與尾款 — 現金匯款指定帳號
          </h4>
          <button
            onClick={handleCopyAccount}
            className="px-2 py-0.5 bg-blue-600 text-white text-[11px] font-bold rounded-lg hover:bg-blue-500 transition cursor-pointer"
          >
            {copySuccess ? "✓ 已複製" : "📋 複製帳號"}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 text-xs bg-slate-950/80 p-1.5 rounded-xl border border-slate-700">
          <div>
            <span className="text-slate-400 block text-[10px]">匯款銀行</span>
            <span className="font-bold text-white">{PROVIDER_INFO.bankName}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">銀行代碼</span>
            <span className="font-bold text-white">（{PROVIDER_INFO.bankCode}）</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">戶名</span>
            <span className="font-bold text-white">{PROVIDER_INFO.accountName}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">帳號</span>
            <span className="font-mono font-extrabold text-blue-400 text-sm">{PROVIDER_INFO.accountNumber}</span>
          </div>
        </div>
      </div>

      {/* Invoice Info Form & Remittance Account Binding */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-2.5 shadow-xs">
        <div className="flex justify-between items-center mb-1">
          <h4 className="font-bold text-xs text-blue-400 flex items-center gap-1">
            <span>🧾</span> 發票開立與首期訂金對帳綁定填寫
          </h4>
          <div className="flex items-center gap-2">
            {isSaved && (
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-900/50 px-2 py-0.5 rounded border border-emerald-700/50">
                ✓ 已傳送
              </span>
            )}
            <button onClick={toggleAdminView} className="text-xs text-blue-400 underline font-bold cursor-pointer">
              {isAdminView ? "返回" : "🔍 發票紀錄"}
            </button>
          </div>
        </div>

        {isAdminView ? (
          <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-700 max-h-32 overflow-y-auto space-y-1 text-xs">
            <div className="font-bold text-blue-400 border-b border-slate-700 pb-1 flex justify-between">
              <span>所有已填寫發票與對帳清單</span>
              <span>狀態: 已同步至雲端</span>
            </div>
            {invoiceRecords.length === 0 ? (
              <p className="text-xs text-slate-400 py-2 text-center">目前尚無已填寫之發票與對帳紀錄</p>
            ) : (
              invoiceRecords.map((r) => (
                <div key={r.id} className="bg-slate-800 p-1.5 rounded-lg border border-slate-700 space-y-0.5">
                  <div className="flex justify-between font-bold text-white">
                    <span>🏢 {r.company_name}</span>
                    <span className="font-mono text-blue-400">統編: {r.tax_id}</span>
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
                placeholder="公司全銜 / 買受人抬頭 *"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-slate-500 font-medium"
                required
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="統一編號 (統編) *"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-slate-500 font-medium"
                required
              />
            </div>

            {/* 6. 🔒 預約匯出帳號對帳綁定欄位 */}
            <div>
              <input
                type="text"
                placeholder="預計匯出銀行與帳號後 5 碼 * (如: 中國信託 12345)"
                value={remittanceBank5}
                onChange={(e) => setRemittanceBank5(e.target.value)}
                className="w-full px-2 py-1 bg-slate-900 border border-amber-500/80 rounded-lg focus:outline-none focus:border-amber-400 text-amber-300 placeholder-amber-500/70 font-bold"
                required
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="預計匯款戶名 / 匯款人姓名 * (如: 某某公司)"
                value={remittanceName}
                onChange={(e) => setRemittanceName(e.target.value)}
                className="w-full px-2 py-1 bg-slate-900 border border-amber-500/80 rounded-lg focus:outline-none focus:border-amber-400 text-amber-300 placeholder-amber-500/70 font-bold"
                required
              />
            </div>

            <div>
              <input
                type="text"
                placeholder="發票寄送地址"
                value={invoiceAddress}
                onChange={(e) => setInvoiceAddress(e.target.value)}
                className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-slate-500 font-medium"
              />
            </div>
            <div>
              <input
                type="email"
                placeholder="電子發票通知 Email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-slate-500 font-medium"
              />
            </div>
            <div className="md:col-span-2 text-right">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs transition cursor-pointer active:scale-95 shadow-sm"
              >
                {isSubmitting ? "傳送中..." : "💾 儲存資料並綁定匯款對帳"}
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
        <h2 className="text-base md:text-xl font-bold text-white">建置與線上驗收時程圖 (約 2 ~ 3 週)</h2>
        <span className="text-xs bg-blue-950 text-blue-300 px-2.5 py-0.5 rounded-full font-bold border border-blue-700">
          執行時程
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700 space-y-2">
          <span className="text-xs font-bold text-blue-400">PHASE 1 (Week 1)</span>
          <h3 className="text-sm font-bold text-white">資料對齊 ➔ 簽約付訂金</h3>
          <p className="text-xs text-slate-400">確定車輛貼文風格、知識庫資料收集與支付第一期訂金 50% ($18,900)。</p>
        </div>
        <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700 space-y-2">
          <span className="text-xs font-bold text-sky-400">PHASE 2 (Week 2)</span>
          <h3 className="text-sm font-bold text-white">AI 訓練 ➔ API 社群串接</h3>
          <p className="text-xs text-slate-400">進行文案大腦訓練、Meta/Threads API 安全認證串接與雙用後台配置。</p>
        </div>
        <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700 space-y-2">
          <span className="text-xs font-bold text-emerald-400">PHASE 3 (Week 3)</span>
          <h3 className="text-sm font-bold text-white">線上驗收 ➔ 付尾款與開通</h3>
          <p className="text-xs text-slate-400">線上測試自動發文與互動、支付尾款 50% ($18,900) 並開啟每月維護！</p>
        </div>
      </div>
    </div>
  );

  // Section 6: Checklist
  const sectionChecklist = (
    <div className="w-full my-auto space-y-4">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <h2 className="text-base md:text-xl font-bold text-white">服務交付清單</h2>
        <span className="text-xs bg-blue-950 text-blue-300 px-2.5 py-0.5 rounded-full font-bold border border-blue-700">
          完整交付
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
        <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700 space-y-1.5">
          <h4 className="font-bold text-white text-sm">📌 建置服務交付項目</h4>
          <ul className="space-y-1">
            <li>✓ 華鍵汽車專屬 AI 社群文案大腦模型</li>
            <li>✓ 手機/電腦雙用貼文發布後台</li>
            <li>✓ FB 粉絲團 ✕ IG ✕ Threads 自動化發布 API 串接</li>
            <li>✓ 貼文留言 AI 秒回與 LINE 引導設定</li>
          </ul>
        </div>
        <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700 space-y-1.5">
          <h4 className="font-bold text-white text-sm">🔄 每月維護與售後服務</h4>
          <ul className="space-y-1">
            <li>✓ 首月 30 天線上維護保障與語氣微調</li>
            <li>✓ 每月知識庫車款資料更新支援</li>
            <li>✓ API 連線與資安持續守護</li>
            <li>✓ 雲端資料每日自動備份</li>
          </ul>
        </div>
      </div>
    </div>
  );

  // Section 7: Summary
  const sectionSummary = (
    <div className="w-full my-auto space-y-4">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <h2 className="text-base md:text-xl font-bold text-white">專案效益總結</h2>
        <span className="text-xs bg-emerald-950 text-emerald-300 px-2.5 py-0.5 rounded-full font-bold border border-emerald-700">
          效益極大化
        </span>
      </div>

      <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 p-5 rounded-2xl border border-blue-700/50 space-y-3">
        <h3 className="text-lg font-black text-white">華鍵汽車 AI 自動化社群文案大腦</h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          以最精簡的人力成本，獲得 24 小時不間斷的社群發文與互動行銷！讓專業的 AI 為華鍵汽車說故事，把優質車款推廣給全台車友。
        </p>
        <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>奕暢創新設計工作室</span>
          <span className="font-mono text-blue-400">諮詢熱線：0987528785 ｜ LINE: ivanlai33</span>
        </div>
      </div>
    </div>
  );

  const allSections = [
    { title: "封面", component: sectionCover },
    { title: "發文與配圖額度", component: sectionRequirements },
    { title: "4大核心模組+選配", component: sectionModules },
    { title: "金額與發票", component: sectionPricing },
    { title: "建置時程", component: sectionTimeline },
    { title: "交付清單", component: sectionChecklist },
    { title: "效益總結", component: sectionSummary },
  ];

  return (
    <ProposalEditableProvider slug="huajian-motors" isAdminBypass={isAdminBypass}>
      <div className="w-full min-h-screen bg-[#0F172A] print:bg-white text-[#E2E8F0] font-sans select-none overflow-x-hidden">
        <Script src="https://static.line-scdn.net/liff/edge/2/sdk.js" onLoad={handleLiffInit} />

        {/* 4. 🛡️ 5重防複製、防變造與背景斜向 Security Watermark */}
        <SecurityWatermarkOverlay />

        {/* 2. 🔑 管理者上帝視角 Banner */}
        {isAdminBypass && <OwnerBypassBanner />}

        {/* 7. 🌐 VPN 代理與海外 IP 全螢幕攔截 */}
        {isForeignOrVpn && !isAdminBypass && <VpnInterceptModal />}

        {/* Top Header Bar */}
        <header className="sticky top-0 z-50 bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-800 px-4 py-2.5 print:hidden">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block animate-pulse"></span>
              <span className="font-bold text-xs md:text-sm text-white">
                <EditableText id="hj_header_title" defaultText="華鍵汽車 — AI 社群全自動文案與多平台發布系統" />
              </span>
            </div>
            <div className="text-[10px] md:text-xs text-slate-400 font-mono flex items-center gap-1.5">
              <button
                onClick={() => window.print()}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-white rounded font-bold transition cursor-pointer active:scale-95"
              >
                🖨️ 列印/輸出官方簽核單
              </button>
              <span className="text-blue-300 font-bold bg-blue-950/80 px-2 py-0.5 rounded border border-blue-700/50">
                🛡️ 華鍵汽車專屬
              </span>
              {lineProfile?.displayName && (
                <span className="hidden sm:inline text-emerald-300 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/50">
                  👤 {lineProfile.displayName}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Mode: Native Vertical Continuous Scroll View inside LINE LIFF */}
        <div className="block md:hidden w-full max-w-xl mx-auto p-3 space-y-6 overflow-y-auto touch-pan-y print:hidden" style={{ WebkitOverflowScrolling: "touch" }}>
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
          <PrintSignatureSection proposalTitle="【華鍵汽車】AI 社群全自動文案與多平台發布系統" />
        </div>

        {/* Desktop Mode: High-End Vertically & Horizontally Centered Minimalist Deck View */}
        <div className="hidden md:flex min-h-[calc(100vh-65px)] flex-col justify-between items-center p-6 max-w-5xl mx-auto print:hidden">
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
                className="px-5 py-2 bg-slate-800 border border-slate-700 rounded-full text-xs font-bold text-slate-200 hover:bg-blue-600 hover:text-white disabled:opacity-30 transition shadow-xs active:scale-95 cursor-pointer"
              >
                ← 上一頁
              </button>
              <button
                onClick={() => setCurrentSlide((prev) => Math.min(prev + 1, allSections.length - 1))}
                disabled={currentSlide === allSections.length - 1}
                className="px-5 py-2 bg-slate-800 border border-slate-700 rounded-full text-xs font-bold text-slate-200 hover:bg-blue-600 hover:text-white disabled:opacity-30 transition shadow-xs active:scale-95 cursor-pointer"
              >
                下一頁 →
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-blue-950 border border-blue-700 text-blue-300 rounded-full text-xs font-bold hover:bg-blue-600 hover:text-white transition shadow-xs active:scale-95 cursor-pointer"
              >
                🖨️ 列印 / PDF
              </button>
            </div>
          </footer>
        </div>

        {/* 8. 🖨️ 官方白紙黑字紙本列印與主管簽核用印區 (電腦版列印) */}
        <div className="hidden print:block max-w-5xl mx-auto p-4">
          <PrintSignatureSection proposalTitle="【華鍵汽車】AI 社群全自動文案與多平台發布系統" />
        </div>
      </div>
    </ProposalEditableProvider>
  );
}
