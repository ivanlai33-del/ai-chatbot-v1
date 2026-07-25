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

export default function StarkWorksProposalPage() {
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  // Commercial Defense & Admin Bypass State
  const [isAdminBypass, setIsAdminBypass] = useState(false);
  const [isForeignOrVpn, setIsForeignOrVpn] = useState(false);

  // Proposal Effective Date
  const CREATED_AT = "2026-07-25";
  const lifecycle = calculateProposalLifecycle(CREATED_AT);

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

  // Selected Plan State
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "flagship">("flagship");

  // Admin View State
  const [isAdminView, setIsAdminView] = useState(false);
  const [invoiceRecords, setInvoiceRecords] = useState<InvoiceRecord[]>([]);

  // Password Verification (Today's date: 20260725 or 0725)
  const VALID_PASSWORDS = ["20260725", "0725", "20260724", "0724"];

  // Anti-Theft & Security Hooks (Anti-Copy, Anti-Cut, Anti-Drag, Anti-Select)
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
      if ((e.ctrlKey || e.metaKey) && (e.key === "U" || e.key === "u" || e.key === "S" || e.key === "s" || e.key === "c" || e.key === "C" || e.key === "x" || e.key === "X" || e.key === "a" || e.key === "A")) {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
          return;
        }
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

    const handleCopy = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return;
      }
      e.preventDefault();
      return false;
    };

    const handleCut = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return;
      }
      e.preventDefault();
      return false;
    };

    const handleSelectStart = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return;
      }
      e.preventDefault();
      return false;
    };

    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return;
      }
      e.preventDefault();
      return false;
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("cut", handleCut);
    document.addEventListener("selectstart", handleSelectStart);
    document.addEventListener("dragstart", handleDragStart);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("cut", handleCut);
      document.removeEventListener("selectstart", handleSelectStart);
      document.removeEventListener("dragstart", handleDragStart);
    };
  }, [isUnlocked]);

  useEffect(() => {
    // 2. 🔑 管理者上帝視角 (Owner Bypass Mode: ?admin=87257257)
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("admin") === "87257257") {
        setIsAdminBypass(true);
        setIsUnlocked(true);
      }
    }

    const unlocked = sessionStorage.getItem("proposal_unlocked_stark_works");
    if (unlocked === "true") {
      setIsUnlocked(true);
      sendProposalAuditTrack("stark-works", "PAGE_VISITED_SESSION");
    }
    const savedInfo = localStorage.getItem("stark_works_invoice_info");
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
      sessionStorage.setItem("proposal_unlocked_stark_works", "true");
      setErrorMsg("");
      sendProposalAuditTrack("stark-works", "PASSWORD_UNLOCKED");
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
          remittanceBank5,
          remittanceName,
          proposalSlug: "stark-works",
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

  // 🔴 3-Stage Lifecycle: Stage 3 (ARCHIVED_404 > 10 Days) — 除非為管理者上帝視角
  if (!isAdminBypass && lifecycle.stage === "ARCHIVED_404") {
    return (
      <div className="w-full min-h-screen bg-[#0F172A] text-slate-200 flex flex-col justify-center items-center p-6 text-center font-sans">
        <div className="w-16 h-16 bg-rose-950/80 text-rose-400 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-rose-700/50">
          🚫
        </div>
        <h1 className="text-3xl font-black mb-2 text-white">404 — 專案頁面已隱蔽歸檔</h1>
        <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed mb-6">
          本商業提案已超過最高有效期限並對外隱蔽歸檔，專案畫面與密碼視窗已下架。如需重新查看專案簡報，請聯繫專案負責窗口。
        </p>
      </div>
    );
  }

  // Password Lock View / 🟡 Stage 2 (EXPIRED 6-10 Days) — 除非為管理者上帝視角
  if (!isUnlocked && !isAdminBypass) {
    return (
      <div className="w-full min-h-screen bg-[#F8F5EE] text-[#0F172A] flex flex-col justify-center items-center p-4 font-sans overflow-x-hidden">
        <Script src="https://static.line-scdn.net/liff/edge/2/sdk.js" onLoad={handleLiffInit} />
        <div className="w-full max-w-sm bg-[#FFFDF9] border border-[#E2D9C8] rounded-3xl p-6 shadow-2xl text-center backdrop-blur-md">
          {lifecycle.stage === "EXPIRED" ? (
            <>
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-xl mx-auto mb-3 border border-amber-300">
                🔒
              </div>
              <h1 className="text-lg font-black mb-1.5 text-rose-600">
                🔒 專案報價存取期限已過期失效
              </h1>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed font-medium">
                本專案報價已超過 5 天有效存取期 (第 {lifecycle.daysDiff} 天)，系統已自動停用密碼輸入。外人無法再輸入密碼查看內容，請聯絡專案窗口展延權限。
              </p>
              <div className="space-y-3">
                <input
                  type="password"
                  disabled
                  placeholder="密碼已自動停用"
                  className="w-full px-3 py-2.5 bg-[#F4EFE6] border border-[#D5C9B3] rounded-xl text-center text-base opacity-50 cursor-not-allowed text-slate-400 font-medium"
                />
                <button
                  disabled
                  className="w-full py-2.5 bg-slate-400 text-white font-bold rounded-xl text-sm cursor-not-allowed opacity-60"
                >
                  密碼已失效停用
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="w-12 h-12 bg-teal-100/80 text-teal-700 rounded-full flex items-center justify-center text-xl mx-auto mb-3 border border-teal-300/60 shadow-xs">
                🏃‍♂️
              </div>
              <h1 className="text-lg font-black mb-1.5 text-[#0F172A]">
                【史塔克運動科學團隊】<br />AI 運動顧問與雙通道智能店長系統提案
              </h1>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed font-medium">
                本專案報價為受資安防護與商業加密保護之受控內容，請輸入授權密碼檢視。
              </p>

              <form onSubmit={handleUnlock} className="space-y-3">
                <div>
                  <input
                    type="password"
                    placeholder="請輸入瀏覽密碼 (如: 20260725)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#F4EFE6] border border-[#D5C9B3] rounded-xl text-center text-base focus:outline-none focus:border-teal-600 text-[#0F172A] placeholder-slate-400 font-medium"
                    autoFocus
                  />
                </div>

                {errorMsg && <p className="text-xs text-rose-600 font-bold">{errorMsg}</p>}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-extrabold rounded-xl shadow-lg transition text-sm active:scale-95 cursor-pointer"
                >
                  解鎖檢視史塔克專屬提案
                </button>
              </form>
            </>
          )}

          <div className="mt-4 pt-3 border-t border-[#E8DFC8] text-[10px] text-slate-500 flex items-center justify-center gap-1 font-medium">
            <span className="w-2 h-2 rounded-full bg-teal-500 inline-block animate-pulse"></span>
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
        <span className="h-[2px] w-6 md:w-10 bg-teal-500"></span>
        <span className="text-[10px] md:text-xs font-black text-teal-700 tracking-widest uppercase font-mono">
          SPECIAL PROPOSAL ✕ 史塔克運動科學團隊
        </span>
        <span className="h-[2px] w-6 md:w-10 bg-teal-500"></span>
      </div>

      <h1 className="text-xl md:text-4xl lg:text-5xl font-black mb-2 md:mb-4 leading-tight text-[#0F172A]">
        【史塔克運動科學團隊】<br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600">
          LINE 官方帳號 ✕ 官網雙通道 AI 店長客服系統
        </span>
      </h1>

      <p className="text-xs md:text-base text-slate-700 max-w-2xl mx-auto mb-4 md:mb-6 leading-relaxed font-bold">
        結合史塔克 11 年頂尖選手與大眾運動科學專業！<b>「LINE 機器人 ✕ 官網 AI 小幫手雙通道進駐 ✕ 動作評估諮詢導客 ✕ 1對1課程線上預約 ✕ Shopline 電商產品推薦」</b>全方位 AI 智能店長！
      </p>

      {/* 4 Core Pillars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-4 md:mb-6 text-left">
        <div className="bg-[#FFFDF9] border border-[#E5DCC5] p-3 rounded-2xl shadow-xs">
          <div className="text-xs md:text-sm font-black text-teal-700 mb-1 flex items-center gap-1">
            <span>🏃‍♂️</span> 史塔克運動科學大腦
          </div>
          <p className="text-[11px] md:text-xs text-slate-600 leading-tight font-medium">精準分流久坐族、增肌減脂、運動嗜好、頂尖選手與特別照護族群。</p>
        </div>

        <div className="bg-[#FFFDF9] border border-[#E5DCC5] p-3 rounded-2xl shadow-xs">
          <div className="text-xs md:text-sm font-black text-cyan-700 mb-1 flex items-center gap-1">
            <span>📲</span> LINE ✕ 官網雙通道進駐
          </div>
          <p className="text-[11px] md:text-xs text-slate-600 leading-tight font-medium">LINE 官方帳號全天候自動客服，同步支援 Shopline 官網右下角嵌入小幫手！</p>
        </div>

        <div className="bg-[#FFFDF9] border border-[#E5DCC5] p-3 rounded-2xl shadow-xs">
          <div className="text-xs md:text-sm font-black text-emerald-700 mb-1 flex items-center gap-1">
            <span>📅</span> 1對1評估與課程線上預約
          </div>
          <p className="text-[11px] md:text-xs text-slate-600 leading-tight font-medium">引導學員完成初次動作評估，彈出選單點擊即可完成 1對1 訓練線上預約！</p>
        </div>

        <div className="bg-[#FFFDF9] border border-[#E5DCC5] p-3 rounded-2xl shadow-xs">
          <div className="text-xs md:text-sm font-black text-sky-700 mb-1 flex items-center gap-1">
            <span>🛍️</span> Shopline 周邊器材導購
          </div>
          <p className="text-[11px] md:text-xs text-slate-600 leading-tight font-medium">推薦 FLEXIBAR、AIREX、BellaBambi、MUNI 與運動精油圖文卡片。</p>
        </div>
      </div>

      <div className="inline-flex items-center flex-wrap justify-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 text-white rounded-full text-xs font-black shadow-md mb-4">
        <span>✨ 實用版建置費：NT$ 38,000</span>
        <span>•</span>
        <span>✨ 旗艦雙通道版：NT$ 68,000</span>
        <span>•</span>
        <span>✨ 年省客服成本 80%+</span>
      </div>

      <div className="pt-3 border-t border-[#E2D9C8] text-xs text-slate-600 font-bold flex justify-center flex-wrap gap-2 md:gap-4">
        <span>🏢 <b>提案單位：</b>奕暢創新設計工作室 <span className="font-mono text-teal-700 font-black">(統編: 41370842)</span></span>
        <span>💬 <b>LINE ID：</b><b className="text-teal-700 font-mono font-black">ivanlai33</b></span>
        <span>📞 <b>電話：</b><b className="text-teal-700 font-mono font-black">0987528785</b></span>
      </div>
    </div>
  );

  // Section 2: Requirements & Problem Statement
  const sectionRequirements = (
    <div className="w-full my-auto space-y-4">
      <div className="flex justify-between items-center border-b border-[#E2D9C8] pb-2">
        <h2 className="text-base md:text-2xl font-black text-[#0F172A]">
          【史塔克運動科學】品牌痛點與 AI 解決方案
        </h2>
        <span className="text-[10px] md:text-xs bg-teal-100/90 text-teal-800 px-2.5 py-0.5 rounded-full font-black border border-teal-300">
          需求完全對齊
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <div className="bg-[#FFFDF9] border border-[#E5DCC5] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🎯</span>
            <h3 className="font-black text-sm md:text-base text-teal-700">挑戰 1：5大族群需求各異，人工客服回覆耗時</h3>
          </div>
          <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-medium">
            史塔克服務涵蓋「久坐族、增肌減脂、運動嗜好、頂尖選手與特別照護者」。<b>AI 智庫能自動辨識諮詢者身分，給予最精準的運動科學建議與課程引導。</b>
          </p>
        </div>

        <div className="bg-[#FFFDF9] border border-[#E5DCC5] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🌐</span>
            <h3 className="font-black text-sm md:text-base text-cyan-700">挑戰 2：官網與 LINE 訪客雙向分散，諮詢中斷</h3>
          </div>
          <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-medium">
            官網 (stark.works) 逛街訪客與 LINE 好友分流。<b>建置雙通道 AI 機器人，官網嵌入式客服與 LINE 機器人共享同一個 AI 大腦，不漏接任何意向顧客！</b>
          </p>
        </div>

        <div className="bg-[#FFFDF9] border border-[#E5DCC5] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">📅</span>
            <h3 className="font-black text-sm md:text-base text-emerald-700">挑戰 3：1對1訓練與動作評估，預約流程繁瑣</h3>
          </div>
          <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-medium">
            顧客常詢問「怎麼預約一對一訓練？」、「急性不適怎麼辦？」。<b>AI 秒回諮詢並彈出 LIFF 線上預約選單，大幅提高諮詢轉化為實體預約的成功率！</b>
          </p>
        </div>

        <div className="bg-[#FFFDF9] border border-[#E5DCC5] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🛍️</span>
            <h3 className="font-black text-sm md:text-base text-sky-700">挑戰 4：Shopline 運動器材與周邊電商導購</h3>
          </div>
          <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-medium">
            當顧客詢問「FLEXIBAR 如何使用？」、「AIREX 墊子或運動精油推薦」，<b>AI 自動引導彈出產品卡片，點擊直達 Shopline 購物車完成結帳！</b>
          </p>
        </div>
      </div>
    </div>
  );

  // Section 3: Detailed Modules Breakdown
  const sectionModules = (
    <div className="w-full my-auto space-y-3">
      <div className="flex justify-between items-center border-b border-[#E2D9C8] pb-1.5">
        <h2 className="text-base md:text-2xl font-black text-[#0F172A]">
          詳細功能模組與雙通道系統架構拆解
        </h2>
        <span className="text-[10px] md:text-xs bg-teal-100/90 text-teal-800 px-2.5 py-0.5 rounded-full font-black border border-teal-300">
          4 大核心模組
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {/* Module 1 */}
        <div className="bg-[#FFFDF9] border border-teal-200 p-3 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <h4 className="font-black text-xs md:text-sm text-teal-700 flex items-center gap-1.5">
              <span>📲</span> 模組 1：LINE 官方帳號 ✕ 官網小幫手雙通道進駐
            </h4>
            <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded font-mono font-bold">
              雙通道 AI 大腦
            </span>
          </div>
          <ul className="text-[11px] md:text-xs text-slate-700 space-y-1 font-medium">
            <li>✓ <b>LINE 機器人主通道</b>：24H 自動回應官方帳號訊息、發送圖文卡片</li>
            <li>✓ <b>官網右下角 AI Widget 嵌入</b>：一行程式碼直接嵌入 Shopline 官網</li>
            <li>✓ <b>共享知識庫與語氣</b>：官網與 LINE 諮詢紀錄自動同步，體驗完整</li>
          </ul>
        </div>

        {/* Module 2 */}
        <div className="bg-[#FFFDF9] border border-cyan-200 p-3 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <h4 className="font-black text-xs md:text-sm text-cyan-700 flex items-center gap-1.5">
              <span>🏋️‍♂️</span> 模組 2：史塔克運動科學與5大族群諮詢智庫
            </h4>
            <span className="text-[10px] bg-cyan-100 text-cyan-800 px-1.5 py-0.5 rounded font-mono font-bold">
              專業知識庫
            </span>
          </div>
          <ul className="text-[11px] md:text-xs text-slate-700 space-y-1 font-medium">
            <li>✓ <b>5大族群精準問答</b>：久坐族、增肌減脂、運動嗜好、專項選手、特別照護族</li>
            <li>✓ <b>醫師與教練團隊導流</b>：急性不適自動引導至團隊醫師門診與評估流程</li>
            <li>✓ <b>品牌 11 年權威人設</b>：展現亞洲頂尖選手訓練經驗與專業信任感</li>
          </ul>
        </div>

        {/* Module 3 */}
        <div className="bg-[#FFFDF9] border border-emerald-200 p-3 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <h4 className="font-black text-xs md:text-sm text-emerald-700 flex items-center gap-1.5">
              <span>📅</span> 模組 3：1對1訓練預約與體能評估引導 (LIFF)
            </h4>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-bold">
              線上預約導客
            </span>
          </div>
          <ul className="text-[11px] md:text-xs text-slate-700 space-y-1 font-medium">
            <li>✓ <b>初次動作評估導流</b>：引導新學員進行動作篩檢與體能諮詢</li>
            <li>✓ <b>LINE LIFF 滿版預約選單</b>：直覺選擇課程、時段與服務教練</li>
            <li>✓ <b>預約前自動提醒 SOP</b>：課前注意事項與門市位置地圖自動發送</li>
          </ul>
        </div>

        {/* Module 4 */}
        <div className="bg-[#FFFDF9] border border-sky-200 p-3 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <h4 className="font-black text-xs md:text-sm text-sky-700 flex items-center gap-1.5">
              <span>🛍️</span> 模組 4：Shopline 運動器材與周邊產品 AI 導購
            </h4>
            <span className="text-[10px] bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded font-mono font-bold">
              電商圖文導購
            </span>
          </div>
          <ul className="text-[11px] md:text-xs text-slate-700 space-y-1 font-medium">
            <li>✓ <b>圖文產品卡片</b>：自動拉出 FLEXIBAR、AIREX、BellaBambi、精油等卡片</li>
            <li>✓ <b>使用場景建議</b>：根據學員恢復需求，主動推薦搭配之運動修復器材</li>
            <li>✓ <b>直達 Shopline 購物車</b>：點擊直接跳轉完成下單，提高電商轉換率</li>
          </ul>
        </div>
      </div>
    </div>
  );

  // Section 4: Pricing Options
  const sectionPricing = (
    <div className="w-full my-auto space-y-3">
      <div className="flex justify-between items-center border-b border-[#E2D9C8] pb-2">
        <h2 className="text-base md:text-2xl font-black text-[#0F172A]">
          史塔克專案報價方案選擇與發票資料
        </h2>
        <div className="flex items-center gap-1 text-xs">
          <button
            onClick={() => setSelectedPlan("starter")}
            className={`px-3 py-1 rounded-lg font-extrabold transition cursor-pointer ${selectedPlan === "starter" ? "bg-teal-700 text-white shadow-xs" : "bg-[#F4EFE6] text-slate-600"}`}
          >
            精準實用版 ($38,000)
          </button>
          <button
            onClick={() => setSelectedPlan("flagship")}
            className={`px-3 py-1 rounded-lg font-extrabold transition cursor-pointer ${selectedPlan === "flagship" ? "bg-teal-700 text-white shadow-xs" : "bg-[#F4EFE6] text-slate-600"}`}
          >
            ★ 雙通道旗艦版 ($68,000)
          </button>
        </div>
      </div>

      {/* Pricing Cards Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Starter Plan */}
        <div className={`bg-[#FFFDF9] border-2 rounded-2xl p-3.5 shadow-xs flex flex-col justify-between ${selectedPlan === "starter" ? "border-teal-600 ring-2 ring-teal-500/20" : "border-[#E5DCC5] opacity-80"}`}>
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-black text-xs md:text-sm text-teal-800">
                🟢 【方案 A】LINE 機器人精準實用版
              </span>
              <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-bold">
                專注 LINE 管道
              </span>
            </div>
            <div className="text-2xl md:text-3xl font-black font-mono text-[#0F172A] my-1">
              NT$ 38,000 <span className="text-xs font-normal text-slate-500">(建置費未稅)</span>
            </div>
            <div className="text-xs text-slate-700 mb-2 bg-[#F4EFE6] p-1.5 rounded-lg border border-[#E2D9C8] font-bold">
              月維護費：<b>NT$ 2,500 / 月 (未稅)</b> ｜ 含 5% 稅金 <b>$2,625/月</b>
            </div>
            <ul className="text-xs text-slate-700 space-y-1 mb-2 font-medium">
              <li className="flex items-center gap-1"><span className="text-teal-700 font-bold">✓</span> <b>LINE 官方帳號 24H AI 店長進駐</b></li>
              <li className="flex items-center gap-1"><span className="text-teal-700 font-bold">✓</span> 史塔克運動科學與 5 大族群專業智庫</li>
              <li className="flex items-center gap-1"><span className="text-teal-700 font-bold">✓</span> 1對1預約與體能評估線上導流選單</li>
              <li className="flex items-center gap-1"><span className="text-teal-700 font-bold">✓</span> Shopline 運動器材產品圖文卡片推薦</li>
            </ul>
          </div>
          {selectedPlan === "starter" ? (
            <button
              onClick={handleMonthlyCheckout}
              disabled={checkoutLoading}
              className="w-full py-2 px-3 bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-extrabold rounded-xl shadow-md transition flex items-center justify-center gap-1 text-xs cursor-pointer active:scale-95 mt-2"
            >
              <span>💳</span>
              <span>{checkoutLoading ? "正在連接藍新金流..." : "線上驗收點此【綁定信用卡開通】(NT$ 2,625/月含稅)"}</span>
              <span>➔</span>
            </button>
          ) : (
            <button
              onClick={() => setSelectedPlan("starter")}
              className="w-full py-2 bg-[#F4EFE6] hover:bg-teal-700 hover:text-white text-slate-800 font-bold rounded-xl text-xs transition cursor-pointer mt-2 border border-[#D5C9B3]"
            >
              點擊選擇【方案 A 精準實用版】
            </button>
          )}
        </div>

        {/* Flagship Dual Channel Plan */}
        <div className={`bg-[#FFFDF9] border-2 rounded-2xl p-3.5 shadow-md flex flex-col justify-between ${selectedPlan === "flagship" ? "border-teal-600 bg-teal-50/30 ring-2 ring-teal-500/30" : "border-[#E5DCC5] opacity-80"}`}>
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-black text-xs md:text-sm text-teal-800">
                💎 【方案 B】LINE ✕ 官網雙通道全方位旗艦版
              </span>
              <span className="text-[10px] bg-teal-700 text-white px-2 py-0.5 rounded-full font-bold">
                全通道導客首選
              </span>
            </div>
            <div className="text-2xl md:text-3xl font-black font-mono text-[#0F172A] my-1">
              NT$ 68,000 <span className="text-xs font-normal text-slate-500">(建置費未稅)</span>
            </div>
            <div className="text-xs text-slate-700 mb-2 bg-[#F4EFE6] p-1.5 rounded-lg border border-[#E2D9C8] font-bold">
              月維護費：<b>NT$ 3,500 / 月 (未稅)</b> ｜ 含 5% 稅金 <b>$3,675/月</b>
            </div>
            <ul className="text-xs text-slate-700 space-y-1 mb-3 font-medium">
              <li className="flex items-center gap-1"><span className="text-teal-700 font-bold">★</span> <b>包含方案 A 所有功能 ✕ 官網嵌入式 AI 小幫手</b></li>
              <li className="flex items-center gap-1"><span className="text-teal-700 font-bold">✓</span> <b>stark.works 官網右下角一鍵嵌入 Web Widget</b></li>
              <li className="flex items-center gap-1"><span className="text-teal-700 font-bold">✓</span> 雙通道資料共享：官網訪客直接引導加入 LINE 預約</li>
              <li className="flex items-center gap-1"><span className="text-teal-700 font-bold">✓</span> 享優先語氣客製與電商數據月報表分析</li>
            </ul>
          </div>

          {selectedPlan === "flagship" ? (
            <button
              onClick={handleMonthlyCheckout}
              disabled={checkoutLoading}
              className="w-full py-2 px-3 bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-extrabold rounded-xl shadow-md transition flex items-center justify-center gap-1 text-xs cursor-pointer active:scale-95 mt-2"
            >
              <span>💳</span>
              <span>{checkoutLoading ? "正在連接藍新金流..." : "線上驗收點此【綁定信用卡開通】(NT$ 3,675/月含稅)"}</span>
              <span>➔</span>
            </button>
          ) : (
            <button
              onClick={() => setSelectedPlan("flagship")}
              className="w-full py-2 bg-[#F4EFE6] hover:bg-teal-700 hover:text-white text-slate-800 font-bold rounded-xl text-xs transition cursor-pointer mt-2 border border-[#D5C9B3]"
            >
              點擊選擇【方案 B 雙通道旗艦版】
            </button>
          )}
        </div>
      </div>

      {/* 5. 🚨 官方直營防詐聲明與網域驗證 */}
      <FraudAlertAndDomainVerifier />

      {/* Bank Account Details */}
      <div className="bg-gradient-to-r from-[#FFFDF9] via-[#F4EFE6] to-[#FFFDF9] border-2 border-teal-500/50 rounded-2xl p-2.5 shadow-xs">
        <div className="flex justify-between items-center mb-1">
          <h4 className="font-black text-teal-800 text-xs md:text-sm flex items-center gap-1">
            <span>🏦</span> 建置費訂金與尾款 — 現金匯款指定帳號
          </h4>
          <button
            onClick={handleCopyAccount}
            className="px-2 py-0.5 bg-teal-700 text-white text-[11px] font-bold rounded-lg hover:bg-teal-600 transition cursor-pointer"
          >
            {copySuccess ? "✓ 已複製" : "📋 複製帳號"}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 text-xs bg-[#FFFDF9] p-1.5 rounded-xl border border-[#E2D9C8]">
          <div>
            <span className="text-slate-500 block text-[10px]">匯款銀行</span>
            <span className="font-bold text-[#0F172A]">{PROVIDER_INFO.bankName}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">銀行代碼</span>
            <span className="font-bold text-[#0F172A]">（{PROVIDER_INFO.bankCode}）</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">戶名</span>
            <span className="font-bold text-[#0F172A]">{PROVIDER_INFO.accountName}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">帳號</span>
            <span className="font-mono font-black text-teal-700 text-sm">{PROVIDER_INFO.accountNumber}</span>
          </div>
        </div>
      </div>

      {/* Invoice Info Form */}
      <div className="bg-[#FFFDF9] border border-[#E5DCC5] rounded-2xl p-2.5 shadow-xs">
        <div className="flex justify-between items-center mb-1">
          <h4 className="font-black text-xs text-teal-800 flex items-center gap-1">
            <span>🧾</span> 史塔克團隊發票與匯款資料 (開立三聯式發票)
          </h4>
          <div className="flex items-center gap-2">
            {isSaved && (
              <span className="text-[10px] text-teal-800 font-bold bg-teal-100 px-2 py-0.5 rounded border border-teal-300">
                ✓ 已傳送
              </span>
            )}
            <button onClick={toggleAdminView} className="text-xs text-teal-700 underline font-bold cursor-pointer">
              {isAdminView ? "返回" : "🔍 發票紀錄"}
            </button>
          </div>
        </div>

        {isAdminView ? (
          <div className="bg-[#F4EFE6] p-2 rounded-xl border border-[#E2D9C8] max-h-32 overflow-y-auto space-y-1 text-xs">
            <div className="font-bold text-teal-800 border-b border-[#E2D9C8] pb-1 flex justify-between">
              <span>所有已填寫發票清單</span>
              <span>狀態: 已同步至雲端</span>
            </div>
            {invoiceRecords.length === 0 ? (
              <p className="text-xs text-slate-500 py-2 text-center">目前尚無已填寫之發票資料紀錄</p>
            ) : (
              invoiceRecords.map((r) => (
                <div key={r.id} className="bg-[#FFFDF9] p-1.5 rounded-lg border border-[#E2D9C8] space-y-0.5">
                  <div className="flex justify-between font-bold text-[#0F172A]">
                    <span>🏢 {r.company_name}</span>
                    <span className="font-mono text-teal-700">統編: {r.tax_id}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
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
                className="w-full px-2 py-1 bg-[#F4EFE6] border border-[#D5C9B3] rounded-lg focus:outline-none focus:border-teal-600 text-[#0F172A] placeholder-slate-400 font-medium"
                required
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="統一編號 (統編)"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                className="w-full px-2 py-1 bg-[#F4EFE6] border border-[#D5C9B3] rounded-lg focus:outline-none focus:border-teal-600 text-[#0F172A] placeholder-slate-400 font-medium"
                required
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="發票寄送地址"
                value={invoiceAddress}
                onChange={(e) => setInvoiceAddress(e.target.value)}
                className="w-full px-2 py-1 bg-[#F4EFE6] border border-[#D5C9B3] rounded-lg focus:outline-none focus:border-teal-600 text-[#0F172A] placeholder-slate-400 font-medium"
              />
            </div>
            <div>
              <input
                type="email"
                placeholder="電子發票通知 Email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-2 py-1 bg-[#F4EFE6] border border-[#D5C9B3] rounded-lg focus:outline-none focus:border-teal-600 text-[#0F172A] placeholder-slate-400 font-medium"
              />
            </div>
            <div className="md:col-span-2 text-right">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-3 py-1 bg-teal-700 hover:bg-teal-600 text-white font-bold rounded-lg text-xs transition cursor-pointer"
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
      <div className="flex justify-between items-center border-b border-[#E2D9C8] pb-2">
        <h2 className="text-base md:text-2xl font-black text-[#0F172A]">
          全遠端零干擾建置、測試與上線時程
        </h2>
        <span className="text-[10px] md:text-xs bg-teal-100/90 text-teal-800 px-2.5 py-0.5 rounded-full font-black border border-teal-300">
          100% 全遠端無縫導入
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        <div className="bg-[#FFFDF9] border border-[#E5DCC5] rounded-2xl p-4 shadow-xs">
          <span className="inline-block px-2.5 py-0.5 bg-teal-700 text-white rounded-full text-[10px] font-bold mb-2">PHASE 1 (Week 1)</span>
          <h4 className="font-black text-teal-800 mb-1.5 text-sm md:text-base">LINE 授權與運動科學知識庫建置</h4>
          <ul className="text-xs md:text-sm text-slate-700 space-y-1 font-medium">
            <li>✓ 簽訂合約並<b>轉帳付訂金</b></li>
            <li>✓ 授權 LINE 官方帳號與 Shopline 官網連線</li>
            <li>✓ 匯入史塔克 11 年 5 大族群專業智庫與課程介紹</li>
          </ul>
        </div>
        <div className="bg-[#FFFDF9] border border-[#E5DCC5] rounded-2xl p-4 shadow-xs">
          <span className="inline-block px-2.5 py-0.5 bg-teal-700 text-white rounded-full text-[10px] font-bold mb-2">PHASE 2 (Week 2)</span>
          <h4 className="font-serif font-black text-cyan-800 mb-1.5 text-sm md:text-base">預約流程與雙通道測試</h4>
          <ul className="text-xs md:text-sm text-slate-700 space-y-1 font-medium">
            <li>✓ 提供專屬測試環境，測試 1對1評估線上預約</li>
            <li>✓ 測試 Shopline 周邊器材圖文卡片拉取與導購</li>
            <li>✓ 雙方進行 30 分鐘線上視訊會審微調諮詢對話語氣</li>
          </ul>
        </div>
        <div className="bg-teal-50/50 border-2 border-teal-600 rounded-2xl p-4 shadow-xs">
          <span className="inline-block px-2.5 py-0.5 bg-teal-700 text-white rounded-full text-[10px] font-bold mb-2">PHASE 3 (Week 3 遠端驗收)</span>
          <h4 className="font-black text-teal-900 mb-1.5 text-sm md:text-base">驗收開通 ➔ 綁定信用卡 ➔ 保固</h4>
          <ul className="text-xs md:text-sm text-slate-800 space-y-1 font-bold">
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
      <div className="flex justify-between items-center border-b border-[#E2D9C8] pb-2">
        <h2 className="text-base md:text-2xl font-black text-[#0F172A]">
          詳細服務交付 ✕ 系統完整清單
        </h2>
        <span className="text-[10px] md:text-xs bg-teal-100/90 text-teal-800 px-2.5 py-0.5 rounded-full font-black border border-teal-300">
          史塔克專屬交付清單
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        <div className="bg-[#FFFDF9] border border-[#E5DCC5] rounded-2xl p-4 shadow-xs">
          <h4 className="font-black text-teal-800 text-xs md:text-sm mb-2">📌 AI 系統建置交付清單 (一次性)</h4>
          <ul className="text-xs md:text-sm text-slate-700 space-y-1.5 font-medium">
            <li>✓ 100% 全遠端雲端建置與線上指導驗收</li>
            <li>✓ <b>1. LINE 官方帳號 ✕ 官網 AI 小幫手雙通道</b></li>
            <li>✓ <b>2. 史塔克運動科學與 5大族群專業智庫</b></li>
            <li>✓ <b>3. 1對1訓練與動作評估線上預約 (LIFF)</b></li>
            <li>✓ <b>4. Shopline 周邊器材圖文卡片導購</b></li>
          </ul>
        </div>

        <div className="bg-[#FFFDF9] border border-[#E5DCC5] rounded-2xl p-4 shadow-xs">
          <h4 className="font-black text-cyan-800 text-xs md:text-sm mb-2">🔄 代營運與保固交付 (每月持續)</h4>
          <ul className="text-xs md:text-sm text-slate-700 space-y-1 font-medium">
            <li>✓ <b>首月 30 天線上免費維護保障 (語氣與內容微調)</b></li>
            <li>✓ 每月課程庫與商品資訊編修支援</li>
            <li>✓ 官方 LINE 與官網 API 連線維護與系統安全</li>
            <li>✓ 雲端資料庫與對話紀錄每日自動備份</li>
          </ul>
        </div>

        <div className="bg-[#FFFDF9] border-2 border-teal-500/60 rounded-2xl p-4 shadow-xs bg-teal-50/30">
          <h4 className="font-black text-teal-900 text-xs md:text-sm mb-2">🔒 企業級帳號安全與個資防線</h4>
          <ul className="text-xs md:text-sm text-slate-800 space-y-1 font-bold">
            <li>✓ <b>官方帳號安全金鑰防護</b>：連線憑證高強度加密隔離</li>
            <li>✓ <b>AI 惡意意圖過濾</b>：防範無關干擾與競業惡意探聽</li>
            <li>✓ <b>學員健康個資保護</b>：符合個人資料保護法</li>
            <li>✓ <b>店家專屬權限鎖</b>：非授權帳號無法變更</li>
          </ul>
        </div>
      </div>
    </div>
  );

  // Section 7: Summary, 1-Year Cost Savings & ROI Calculation
  const sectionSummary = (
    <div className="w-full pt-1 space-y-2.5">
      <div className="flex flex-wrap justify-between items-center border-b border-[#E2D9C8] pb-1 gap-1">
        <h2 className="text-sm md:text-xl font-black text-[#0F172A] leading-tight">
          與真人客服小編比較 — 1 年投資報酬率 (ROI) 與費用節省算表
        </h2>
        <span className="text-[10px] md:text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-black border border-emerald-300 shrink-0">
          年省 80%~88% 客服成本
        </span>
      </div>

      {/* 1-Year Cost Comparison Highlight Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-cyan-700 to-emerald-700 text-white rounded-2xl p-2.5 md:p-3.5 shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold block w-fit mb-1">
              💰 一年費用總效益算表 (1-Year ROI Summary)
            </span>
            <h3 className="text-xs md:text-base font-black">
              聘用 1 名真人全職客服 vs 史塔克 AI 雙通道智能店長
            </h3>
          </div>
          <div className="text-left sm:text-right shrink-0">
            <span className="text-[11px] md:text-xs text-teal-100 block font-medium">首年預計為史塔克直接省下</span>
            <span className="text-sm md:text-lg font-black font-mono text-yellow-300 whitespace-nowrap">
              NT$ 445,000 ~ 495,000 元 / 年
            </span>
          </div>
        </div>
      </div>

      {/* Detailed Cost Comparison Table */}
      <div className="bg-[#FFFDF9] border-2 border-teal-600/60 rounded-2xl overflow-x-auto shadow-xs">
        <table className="w-full min-w-[340px] text-left text-xs md:text-sm">
          <thead className="bg-[#F4EFE6] text-teal-900 font-extrabold border-b border-[#E2D9C8]">
            <tr>
              <th className="p-2 md:p-2.5">費用計算項目</th>
              <th className="p-2 md:p-2.5 text-slate-600">聘用 1 名真人全職客服</th>
              <th className="p-2 md:p-2.5 text-teal-800 bg-teal-100/60 font-black">🟢 AI 方案 A (精準實用版)</th>
              <th className="p-2 md:p-2.5 text-teal-900 bg-teal-200/60 font-black">💎 AI 方案 B (雙通道旗艦版)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2D9C8] text-slate-800 font-medium">
            <tr>
              <td className="p-2 md:p-2.5 font-bold">月薪 / 維護月費</td>
              <td className="p-2 md:p-2.5 text-rose-600 font-bold">$38,000 / 月</td>
              <td className="p-2 md:p-2.5 text-teal-800 bg-teal-50/50 font-bold">$2,500 / 月</td>
              <td className="p-2 md:p-2.5 text-teal-900 bg-teal-100/40 font-bold">$3,500 / 月</td>
            </tr>
            <tr>
              <td className="p-2 md:p-2.5 font-bold">一次性系統建置費</td>
              <td className="p-2 md:p-2.5 text-slate-500">$0</td>
              <td className="p-2 md:p-2.5 text-teal-800 bg-teal-50/50 font-bold">$38,000 (僅首年)</td>
              <td className="p-2 md:p-2.5 text-teal-900 bg-teal-100/40 font-bold">$68,000 (僅首年)</td>
            </tr>
            <tr>
              <td className="p-2 md:p-2.5 font-bold">年終獎金與勞健保福利</td>
              <td className="p-2 md:p-2.5 text-rose-600 font-bold">約 $107,000 (年終1.5月+勞健保)</td>
              <td className="p-2 md:p-2.5 text-emerald-700 bg-teal-50/50 font-bold"><b>$0 (無額外人事隱形成本)</b></td>
              <td className="p-2 md:p-2.5 text-emerald-700 bg-teal-100/40 font-bold"><b>$0 (無額外人事隱形成本)</b></td>
            </tr>
            <tr className="bg-[#F8F5EE]">
              <td className="p-2 md:p-2.5 font-black text-[#0F172A]">【第一年】年度總費用總計</td>
              <td className="p-2 md:p-2.5 text-rose-600 font-black font-mono text-sm">NT$ 563,000 元/年</td>
              <td className="p-2 md:p-2.5 text-teal-800 bg-teal-100 font-black font-mono text-sm">NT$ 68,000 元/首年</td>
              <td className="p-2 md:p-2.5 text-teal-900 bg-teal-200/80 font-black font-mono text-sm">NT$ 110,000 元/首年</td>
            </tr>
            <tr className="bg-emerald-50">
              <td className="p-2 md:p-2.5 font-black text-emerald-900">🎉 第一年為史塔克省下金額</td>
              <td className="p-2 md:p-2.5 text-slate-400 font-bold">—</td>
              <td className="p-2 md:p-2.5 text-emerald-800 font-black font-mono text-base"><b>省下 NT$ 495,000 (88%)</b></td>
              <td className="p-2 md:p-2.5 text-emerald-900 font-black font-mono text-base"><b>省下 NT$ 453,000 (80%)</b></td>
            </tr>
            <tr className="bg-teal-100/40">
              <td className="p-2 md:p-2.5 font-black text-teal-900">🚀 第二年起每年持續省下</td>
              <td className="p-2 md:p-2.5 text-slate-400 font-bold">—</td>
              <td className="p-2 md:p-2.5 text-teal-900 font-black font-mono text-base"><b>每年省 NT$ 533,000 (94%)</b></td>
              <td className="p-2 md:p-2.5 text-teal-950 font-black font-mono text-base"><b>每年省 NT$ 521,000 (92%)</b></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Proposing Company Card */}
      <div className="bg-gradient-to-r from-[#FFFDF9] via-[#F4EFE6] to-[#FFFDF9] border-2 border-teal-600/60 rounded-2xl p-2.5 md:p-3 shadow-xs flex flex-col md:flex-row justify-between items-center gap-2">
        <div>
          <span className="text-[10px] bg-teal-700 text-white px-2 py-0.5 rounded-full font-bold block w-fit mb-1">
            🏢 提案團隊聯絡資訊
          </span>
          <h3 className="font-black text-sm md:text-base text-[#0F172A] flex items-center gap-1.5">
            <span>奕暢創新設計工作室</span>
            <span className="text-[10px] md:text-xs font-mono font-bold text-teal-800 bg-teal-100 px-1.5 py-0.5 rounded border border-teal-300">
              統編: 41370842
            </span>
          </h3>
        </div>

        <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm">
          <div className="bg-[#FFFDF9] px-3 py-1.5 rounded-xl border border-[#E2D9C8]">
            <span className="text-[9px] text-slate-500 block">LINE ID</span>
            <span className="font-mono font-black text-teal-800">ivanlai33</span>
          </div>

          <div className="bg-[#FFFDF9] px-3 py-1.5 rounded-xl border border-[#E2D9C8]">
            <span className="text-[9px] text-slate-500 block">電話</span>
            <span className="font-mono font-black text-teal-800">0987528785</span>
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
    { title: "1年省下的費用與ROI", component: sectionSummary },
  ];

  return (
    <div className="w-full min-h-screen bg-[#F8F5EE] print:bg-white text-[#0F172A] font-sans overflow-x-hidden select-none">
      <Script src="https://static.line-scdn.net/liff/edge/2/sdk.js" onLoad={handleLiffInit} />

      {/* 5重防拷貝、防選取、防拖曳 CSS 注入 */}
      <style dangerouslySetInnerHTML={{ __html: `
        * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
        }
        input, textarea {
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          -ms-user-select: text !important;
          user-select: text !important;
        }
      `}} />

      {/* 4. 🛡️ 5重防複製、防變造與背景斜向 Security Watermark */}
      <SecurityWatermarkOverlay />

      {/* 2. 🔑 管理者上帝視角 Banner */}
      {isAdminBypass && <OwnerBypassBanner />}

      {/* 7. 🌐 VPN 代理與海外 IP 全螢幕攔截 */}
      {isForeignOrVpn && !isAdminBypass && <VpnInterceptModal />}

      {/* Top Header Bar */}
      <header className="sticky top-0 z-50 bg-[#F4EFE6]/95 backdrop-blur-md border-b border-[#E2D9C8] px-4 py-2.5 print:hidden">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block animate-pulse"></span>
            <span className="font-black text-xs md:text-sm text-[#0F172A]">
              史塔克運動科學團隊 — AI 運動顧問與雙通道智能店長系統
            </span>
          </div>
          <div className="text-[10px] md:text-xs text-slate-600 font-mono flex items-center gap-1.5">
            <button
              onClick={() => window.print()}
              className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-bold transition cursor-pointer active:scale-95"
            >
              🖨️ 列印/輸出官方簽核單
            </button>
            <span className="text-teal-800 font-black bg-teal-100 px-2 py-0.5 rounded border border-teal-300">
              🛡️ 史塔克專屬提案
            </span>
            {lineProfile?.displayName && (
              <span className="hidden sm:inline text-cyan-800 font-black bg-cyan-100 px-2 py-0.5 rounded border border-cyan-300">
                👤 {lineProfile.displayName}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Mode: Native Vertical Continuous Scroll View inside LINE LIFF */}
      <div className="block md:hidden w-full max-w-xl mx-auto p-3 space-y-6 overflow-y-auto touch-pan-y print:hidden" style={{ WebkitOverflowScrolling: "touch" }}>
        <div className="bg-[#FFFDF9] border border-[#E2D9C8] rounded-3xl p-4 shadow-xl backdrop-blur-md">
          {sectionCover}
        </div>
        <div className="bg-[#FFFDF9] border border-[#E2D9C8] rounded-3xl p-4 shadow-xl backdrop-blur-md">
          {sectionRequirements}
        </div>
        <div className="bg-[#FFFDF9] border border-[#E2D9C8] rounded-3xl p-4 shadow-xl backdrop-blur-md">
          {sectionModules}
        </div>
        <div className="bg-[#FFFDF9] border border-[#E2D9C8] rounded-3xl p-4 shadow-xl backdrop-blur-md">
          {sectionPricing}
        </div>
        <div className="bg-[#FFFDF9] border border-[#E2D9C8] rounded-3xl p-4 shadow-xl backdrop-blur-md">
          {sectionTimeline}
        </div>
        <div className="bg-[#FFFDF9] border border-[#E2D9C8] rounded-3xl p-4 shadow-xl backdrop-blur-md">
          {sectionChecklist}
        </div>
        <div className="bg-[#FFFDF9] border border-[#E2D9C8] rounded-3xl p-4 shadow-xl backdrop-blur-md mb-8">
          {sectionSummary}
        </div>
        <PrintSignatureSection proposalTitle="【史塔克運動科學團隊】AI 運動顧問與雙通道智能店長系統" />
      </div>

      {/* Desktop Mode: High-End Vertically & Horizontally Centered Minimalist Deck View */}
      <div className="hidden md:flex min-h-[calc(100vh-65px)] flex-col justify-between items-center p-6 max-w-5xl mx-auto print:hidden">
        <main className="w-full h-[78vh] max-h-[700px] bg-[#FFFDF9] border border-[#E2D9C8] rounded-3xl p-8 md:p-10 shadow-2xl flex flex-col justify-center items-center my-auto backdrop-blur-md overflow-y-auto">
          {allSections[currentSlide].component}
        </main>

        <footer className="w-full flex justify-between items-center pt-3 border-t border-[#E2D9C8]">
          <div className="text-xs font-mono font-black text-slate-500">
            SLIDE {currentSlide + 1} / {allSections.length} — {allSections[currentSlide].title}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentSlide((prev) => Math.max(prev - 1, 0))}
              disabled={currentSlide === 0}
              className="px-5 py-2 bg-[#F4EFE6] border border-[#D5C9B3] rounded-full text-xs font-bold text-slate-700 hover:bg-teal-700 hover:text-white disabled:opacity-30 transition shadow-xs active:scale-95 cursor-pointer"
            >
              ← 上一頁
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => Math.min(prev + 1, allSections.length - 1))}
              disabled={currentSlide === allSections.length - 1}
              className="px-5 py-2 bg-[#F4EFE6] border border-[#D5C9B3] rounded-full text-xs font-bold text-slate-700 hover:bg-teal-700 hover:text-white disabled:opacity-30 transition shadow-xs active:scale-95 cursor-pointer"
            >
              下一頁 →
            </button>
            <button
              onClick={() => window.print()}
              className="px-5 py-2 bg-teal-100 border border-teal-300 text-teal-800 rounded-full text-xs font-extrabold hover:bg-teal-700 hover:text-white transition shadow-xs active:scale-95 cursor-pointer"
            >
              🖨️ 列印 / PDF
            </button>
          </div>
        </footer>
      </div>

      {/* 8. 🖨️ 官方白紙黑字紙本列印與主管簽核用印區 (電腦版列印) */}
      <div className="hidden print:block max-w-5xl mx-auto p-4">
        <PrintSignatureSection proposalTitle="【史塔克運動科學團隊】AI 運動顧問與雙通道智能店長系統" />
      </div>
    </div>
  );
}
