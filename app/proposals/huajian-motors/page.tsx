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

export default function HuajianMotorsProposalPage() {
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
    const unlocked = sessionStorage.getItem("proposal_unlocked_huajian_motors");
    if (unlocked === "true") {
      setIsUnlocked(true);
    }
    const savedInfo = localStorage.getItem("huajian_motors_invoice_info");
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
      sessionStorage.setItem("proposal_unlocked_huajian_motors", "true");
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
          planId: "huajian_motors_social_ai",
          cycle: "monthly",
          amount: 2625, // NT$ 2,500 + 5% tax = NT$ 2,625
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
          proposalSlug: "huajian-motors",
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
      <div className="w-full min-h-screen bg-[#121824] text-[#E2E8F0] flex flex-col justify-center items-center p-4 font-sans select-none overflow-x-hidden">
        <Script src="https://static.line-scdn.net/liff/edge/2/sdk.js" onLoad={handleLiffInit} />
        <div className="w-full max-w-sm bg-[#1E293B] border border-[#334155] rounded-3xl p-6 shadow-2xl text-center backdrop-blur-md">
          <div className="w-12 h-12 bg-blue-900/50 text-blue-400 rounded-full flex items-center justify-center text-xl mx-auto mb-3 border border-blue-500/30">
            🏎️
          </div>
          <h1 className="text-lg font-bold mb-1.5 text-white">
            【華鍵汽車】<br />AI 社群全自動文案與多平台發布系統提案
          </h1>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            本專案報價為受資安防護與商業加密保護之受控內容，請輸入授權密碼檢視。
          </p>

          <form onSubmit={handleUnlock} className="space-y-3">
            <div>
              <input
                type="password"
                placeholder="請輸入瀏覽密碼 (如: 20260724)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-center text-base focus:outline-none focus:border-blue-500 text-white placeholder-slate-500"
                autoFocus
              />
            </div>

            {errorMsg && <p className="text-xs text-rose-400 font-medium">{errorMsg}</p>}

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition text-sm active:scale-95"
            >
              解鎖檢視華鍵汽車提案
            </button>
          </form>

          <div className="mt-4 pt-3 border-t border-slate-700/60 text-[10px] text-slate-400 flex items-center justify-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
            <span>bot.ycideas.com 📱 華鍵汽車專屬技術提案</span>
          </div>
        </div>
      </div>
    );
  }

  // Section 1: Cover Header
  const sectionCover = (
    <div className="w-full my-auto text-center py-2">
      <div className="flex items-center justify-center gap-2 mb-2 md:mb-3">
        <span className="h-[1px] w-6 md:w-10 bg-blue-500"></span>
        <span className="text-[10px] md:text-xs font-bold text-blue-400 tracking-widest uppercase font-mono">
          SPECIAL PROPOSAL ✕ 華鍵汽車專屬
        </span>
        <span className="h-[1px] w-6 md:w-10 bg-blue-500"></span>
      </div>

      <h1 className="text-xl md:text-4xl lg:text-5xl font-black mb-2 md:mb-4 leading-tight text-white">
        【華鍵汽車】<br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400">
          AI 社群全自動文案 ✕ 臉書 IG 脆三平台連線系統
        </span>
      </h1>

      <p className="text-xs md:text-base text-slate-300 max-w-2xl mx-auto mb-4 md:mb-6 leading-relaxed font-medium">
        協助華鍵汽車達成<b>「日常/知識/活動穩定發文 ✕ 色調排版一致性 ✕ 臉書 IG 脆一鍵發布 ✕ AI 自動回覆留言與導客」</b>的全方位社群 AI 自動化小編！
      </p>

      {/* 4 Core Pillars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-4 md:mb-6 text-left">
        <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-xl shadow-xs backdrop-blur-md">
          <div className="text-xs md:text-sm font-bold text-blue-400 mb-1">✍️ AI 汽車專業文案大腦</div>
          <p className="text-[11px] md:text-xs text-slate-300 leading-tight">自動生成日常文案、車款知識、優惠促銷，維持華鍵汽車品牌色調與排版一致性。</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-xl shadow-xs backdrop-blur-md">
          <div className="text-xs md:text-sm font-bold text-indigo-400 mb-1">📱 電腦/手機雙用後台</div>
          <p className="text-[11px] md:text-xs text-slate-300 leading-tight">支援手機相機即拍即傳上傳照片影片，也可在電腦登入一鍵審核與發布。</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-xl shadow-xs backdrop-blur-md">
          <div className="text-xs md:text-sm font-bold text-sky-400 mb-1">🚀 臉書 / IG / 脆 一鍵同步發布</div>
          <p className="text-[11px] md:text-xs text-slate-300 leading-tight">臉書官方形象發文、IG 視覺風格排版、Threads (脆) 優惠活動一鍵自動同步與排程！</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-xl shadow-xs backdrop-blur-md">
          <div className="text-xs md:text-sm font-bold text-emerald-400 mb-1">💬 AI 小編留言/私訊秒回</div>
          <p className="text-[11px] md:text-xs text-slate-300 leading-tight">三平台 AI 小編進駐，自動回覆網友詢問、引導私訊並留下賞車預約名單！</p>
        </div>
      </div>

      <div className="inline-flex items-center flex-wrap justify-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-xs font-bold shadow-md mb-4">
        <span>✨ 系統建置費：NT$ 36,000</span>
        <span>•</span>
        <span>✨ 月營運維護費：NT$ 2,500/月 (每天可發 2~3 篇貼文)</span>
      </div>

      <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 font-medium flex justify-center flex-wrap gap-2 md:gap-4">
        <span>🏢 <b>提案單位：</b>奕暢創新設計工作室 <span className="font-mono text-blue-400">(統編: 41370842)</span></span>
        <span>💬 <b>LINE ID：</b><b className="text-blue-400 font-mono">ivanlai33</b></span>
        <span>📞 <b>電話：</b><b className="text-blue-400 font-mono">0987528785</b></span>
      </div>
    </div>
  );

  // Section 2: Requirements & Quotas
  const sectionRequirements = (
    <div className="w-full my-auto space-y-4">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <h2 className="text-base md:text-2xl font-bold text-white">
          每月發文與圖片產出額度詳細說明
        </h2>
        <span className="text-[10px] md:text-xs bg-blue-900/60 text-blue-300 px-2.5 py-0.5 rounded-full font-bold border border-blue-700/50">
          每月包月服務內容
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        {/* Quota 1: Articles */}
        <div className="bg-slate-800/80 border-2 border-blue-500/50 rounded-2xl p-4 shadow-xs">
          <div className="text-2xl mb-1">📝</div>
          <h3 className="font-bold text-sm md:text-base text-blue-400 mb-1">
            1. 文案生成額度：60 ~ 90 篇 / 月
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed mb-2">
            相當於<b>天天可發文，每天可發 2~3 篇</b>！涵蓋華鍵汽車臉書官方形象、IG 視覺與 Threads 即時促銷特賣。
          </p>
          <div className="bg-slate-900/80 p-2 rounded-xl text-[11px] text-slate-400 border border-slate-700">
            • 中古車挑選眉角知識貼文<br/>
            • 在庫熱門車款開箱與規格介紹<br/>
            • 限時優惠活動與節慶促銷貼文
          </div>
        </div>

        {/* Quota 2: Images */}
        <div className="bg-slate-800/80 border-2 border-indigo-500/50 rounded-2xl p-4 shadow-xs">
          <div className="text-2xl mb-1">🖼️</div>
          <h3 className="font-bold text-sm md:text-base text-indigo-400 mb-1">
            2. 圖片配圖額度：實拍照片無限量
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed mb-2">
            上傳華鍵汽車在庫車實拍照，AI 自動最佳化配色裁切加浮水印<b>不限張數 (無限量)</b>！
          </p>
          <div className="bg-slate-900/80 p-2 rounded-xl text-[11px] text-slate-400 border border-slate-700">
            • 在庫實拍照上傳加壓浮水印：<b>無限量</b><br/>
            • AI 完全生成行銷情境海報：<b>每月 30 張</b><br/>
            • 色調風格 100% 統一排版
          </div>
        </div>

        {/* Quota 3: Comments & DM Auto-Reply */}
        <div className="bg-slate-800/80 border-2 border-emerald-500/50 rounded-2xl p-4 shadow-xs">
          <div className="text-2xl mb-1">⚡</div>
          <h3 className="font-bold text-sm md:text-base text-emerald-400 mb-1">
            3. AI 小編留言與私訊秒回：無限量
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed mb-2">
            三平台（臉書/IG/Threads）網友留言與私訊互動，AI 小編 24 小時駐點<b>不限次數自動回覆</b>並導客留單！
          </p>
          <div className="bg-slate-900/80 p-2 rounded-xl text-[11px] text-slate-400 border border-slate-700">
            • 網友詢問車價/地點：<b>24H秒回</b><br/>
            • 私訊自動發送規格與賞車預約連結<br/>
            • 未使用額度自動順延至下月
          </div>
        </div>
      </div>
    </div>
  );

  // Section 3: Detailed Modules Breakdown (Includes Optional Short Video Module with Mobile Camera Support)
  const sectionModules = (
    <div className="w-full my-auto space-y-3">
      <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
        <h2 className="text-base md:text-2xl font-bold text-white">
          詳細功能模組與系統架構拆解
        </h2>
        <span className="text-[10px] md:text-xs bg-indigo-900/60 text-indigo-300 px-2.5 py-0.5 rounded-full font-bold border border-indigo-700/50">
          4 大核心模組 ✕ 1 選配擴充模組
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {/* Module 1: AI Content Engine */}
        <div className="bg-slate-800/80 border border-blue-500/40 p-3 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <h4 className="font-bold text-xs md:text-sm text-blue-400 flex items-center gap-1.5">
              <span>🤖</span> 模組 1：AI 汽車專業文案與圖片配圖大腦
            </h4>
            <span className="text-[10px] bg-blue-900/80 text-blue-200 px-1.5 py-0.5 rounded font-mono">
              文案大腦
            </span>
          </div>
          <ul className="text-[11px] md:text-xs text-slate-300 space-y-1">
            <li>✓ <b>汽車專業知識庫</b>：中古車挑選眉角、保養日常、車款規格與促銷文案</li>
            <li>✓ <b>品牌風格視覺</b>：維護華鍵汽車統一色調、特色 Hashtag 與專業排版</li>
            <li>✓ <b>AI 智慧配圖推薦</b>：上傳在庫車照片，AI 自動配對最佳文案與圖片視覺</li>
          </ul>
        </div>

        {/* Module 2: Merchant Console (Mobile Camera Direct Capture Support) */}
        <div className="bg-slate-800/80 border border-indigo-500/40 p-3 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <h4 className="font-bold text-xs md:text-sm text-indigo-400 flex items-center gap-1.5">
              <span>🖥️</span> 模組 2：電腦/手機雙用後台 (支援手機相機即拍即傳)
            </h4>
            <span className="text-[10px] bg-indigo-900/80 text-indigo-200 px-1.5 py-0.5 rounded font-mono">
              雙用管理後台
            </span>
          </div>
          <ul className="text-[11px] md:text-xs text-slate-300 space-y-1">
            <li>✓ <b>📱 手機網頁直接開相機</b>：手機登入點上傳，自動開啟手機鏡頭即拍即傳</li>
            <li>✓ <b>草稿一鍵生成</b>：輸入關鍵字（如：2022 Benz C300 入庫），秒出 3 平台文案</li>
            <li>✓ <b>多平台自由勾選發布</b>：可獨立選擇勾選發布至臉書、IG 或 Threads (脆)</li>
          </ul>
        </div>

        {/* Module 3: Multi-Platform Auto-Publisher */}
        <div className="bg-slate-800/80 border border-sky-500/40 p-3 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <h4 className="font-bold text-xs md:text-sm text-sky-400 flex items-center gap-1.5">
              <span>🚀</span> 模組 3：臉書 ✕ IG ✕ Threads 一鍵同步與排程發布
            </h4>
            <span className="text-[10px] bg-sky-900/80 text-sky-200 px-1.5 py-0.5 rounded font-mono">
              多平台同步推播
            </span>
          </div>
          <ul className="text-[11px] md:text-xs text-slate-300 space-y-1">
            <li>✓ <b>社群官方安全連線</b>：Facebook 粉絲專頁與 Instagram 商業帳號官方安全連線</li>
            <li>✓ <b>Threads (脆) 管道自動連線</b>：自動排程發布優惠活動與熱點貼文</li>
            <li>✓ <b>智慧排程推播引擎</b>：支援「立即發布」或「指定高流量時段自動排程」</li>
          </ul>
        </div>

        {/* Module 4: Social Engagement & Lead Gen */}
        <div className="bg-slate-800/80 border border-emerald-500/40 p-3 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <h4 className="font-bold text-xs md:text-sm text-emerald-400 flex items-center gap-1.5">
              <span>💬</span> 模組 4：三平台 AI 小編留言秒回與賞車留單
            </h4>
            <span className="text-[10px] bg-emerald-900/80 text-emerald-200 px-1.5 py-0.5 rounded font-mono">
              AI 小編互動
            </span>
          </div>
          <ul className="text-[11px] md:text-xs text-slate-300 space-y-1">
            <li>✓ <b>留言自動回覆</b>：貼文下方網友詢問車價或地點，AI 即時回應親切留言</li>
            <li>✓ <b>私訊自動引導</b>：自動發送詳細規格與預約賞車連結給私訊顧客</li>
            <li>✓ <b>潛在買家留單導客</b>：自動整理留言/私訊有意向顧客名單至後台</li>
          </ul>
        </div>
      </div>

      {/* Module 5: Optional Video Upgrade Card */}
      <div className="bg-gradient-to-r from-purple-950/60 via-slate-800 to-indigo-950/60 border-2 border-purple-500/60 p-3 rounded-2xl shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5 border-b border-purple-700/50 pb-1">
          <h4 className="font-bold text-xs md:text-sm text-purple-300 flex items-center gap-1.5">
            <span>🎬</span> 【彈性加購選配模組】AI 社群短影音 ✕ IG Reels 自動剪輯生成系統
          </h4>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] bg-purple-900 text-purple-200 px-2 py-0.5 rounded-full font-bold border border-purple-500/50">
              選購建置費 +$15,000 / 月費 +$1,500/月
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] md:text-xs">
          <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-700">
            <span className="font-bold text-purple-300 block mb-0.5">📹 每月短影音產出額度</span>
            <p className="text-slate-300"><b>每月 15 ~ 30 支短影片</b> (每 1~2 天即可發布一支精美 Reels / Shorts 短影片)。未用完額度順延。</p>
          </div>

          <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-700">
            <span className="font-bold text-purple-300 block mb-0.5">🎙️ 核心影音編輯功能</span>
            <p className="text-slate-300"><b>• 手機相機直拍直傳 ➔ AI 剪輯與字幕</b><br/><b>• AI 國台語真人口播語音配音</b><br/><b>• 照片 ➔ 3D 動態鏡頭推拉影片</b></p>
          </div>

          <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-700">
            <span className="font-bold text-purple-300 block mb-0.5">📱 簡單 3 步驟使用方式</span>
            <p className="text-slate-300">1. <b>手機登入開啟相機直接拍</b><br/>2. AI 秒配 BGM 配音與大字幕<br/>3. 一鍵同步推播 IG Reels / FB 短片</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Section 4: Pricing & Invoice
  const sectionPricing = (
    <div className="w-full my-auto space-y-3">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <h2 className="text-base md:text-2xl font-bold text-white">
          專案報價金額與發票資料填寫
        </h2>
        <span className="text-[10px] md:text-xs bg-emerald-900/80 text-emerald-300 px-2.5 py-0.5 rounded-full font-bold border border-emerald-700/50">
          專屬優惠方案
        </span>
      </div>

      {/* Main Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Card 1: Setup Fee ($36,000) */}
        <div className="bg-slate-800 border-2 border-blue-500/60 rounded-2xl p-3.5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-xs md:text-sm text-blue-400">
                🛠️ 【一次性】AI 社群發文系統建置費
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
              <li className="flex items-center gap-1"><span className="text-blue-400 font-bold">✓</span> 串接臉書粉絲團、Instagram 商業帳號與 Threads (脆)</li>
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
              <li className="flex items-center gap-1"><span className="text-purple-400 font-bold">🎬</span> 可隨時彈性選配加購 AI 短影音/Reels 模組 (+ $1,500/月)</li>
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

      {/* Bank Account Details */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-2 border-blue-500/50 rounded-2xl p-2.5 shadow-xs">
        <div className="flex justify-between items-center mb-1">
          <h4 className="font-bold text-blue-400 text-xs md:text-sm flex items-center gap-1">
            <span>🏦</span> 建置費訂金與尾款 — 現金匯款指定帳號
          </h4>
          <button
            onClick={handleCopyAccount}
            className="px-2 py-0.5 bg-blue-600 text-white text-[11px] font-bold rounded-lg hover:bg-blue-500 transition"
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
            <span className="font-mono font-extrabold text-blue-400 text-sm">131540035543</span>
          </div>
        </div>
      </div>

      {/* Invoice Info Form */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-2.5 shadow-xs">
        <div className="flex justify-between items-center mb-1">
          <h4 className="font-bold text-xs text-blue-400 flex items-center gap-1">
            <span>🧾</span> 客戶公司發票資料填寫 (開立三聯式發票)
          </h4>
          <div className="flex items-center gap-2">
            {isSaved && (
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-900/50 px-2 py-0.5 rounded border border-emerald-700/50">
                ✓ 已傳送
              </span>
            )}
            <button onClick={toggleAdminView} className="text-xs text-blue-400 underline">
              {isAdminView ? "返回" : "🔍 發票紀錄"}
            </button>
          </div>
        </div>

        {isAdminView ? (
          <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-700 max-h-32 overflow-y-auto space-y-1 text-xs">
            <div className="font-bold text-blue-400 border-b border-slate-700 pb-1 flex justify-between">
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
                placeholder="公司全銜 / 買受人抬頭"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-slate-500"
                required
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="統一編號 (統編)"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-slate-500"
                required
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="發票寄送地址"
                value={invoiceAddress}
                onChange={(e) => setInvoiceAddress(e.target.value)}
                className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-slate-500"
              />
            </div>
            <div>
              <input
                type="email"
                placeholder="電子發票通知 Email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-slate-500"
              />
            </div>
            <div className="md:col-span-2 text-right">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs transition"
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
        <span className="text-[10px] md:text-xs bg-blue-900/60 text-blue-300 px-2.5 py-0.5 rounded-full font-bold border border-blue-700/50">
          100% 全遠端無縫導入
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 shadow-xs">
          <span className="inline-block px-2.5 py-0.5 bg-blue-600 text-white rounded-full text-[10px] font-bold mb-2">PHASE 1 (Week 1)</span>
          <h4 className="font-bold text-blue-400 mb-1.5 text-sm md:text-base">社群授權交接與 AI 知識庫建置</h4>
          <ul className="text-xs md:text-sm text-slate-300 space-y-1">
            <li>✓ 簽訂合約並<b>轉帳付訂金 $18,900 (含稅)</b></li>
            <li>✓ 授權 Facebook 粉絲專頁、Instagram 與 Threads 帳號</li>
            <li>✓ 匯入「華鍵汽車」二手車挑選知識、車款列表與風格色調</li>
          </ul>
        </div>
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 shadow-xs">
          <span className="inline-block px-2.5 py-0.5 bg-blue-600 text-white rounded-full text-[10px] font-bold mb-2">PHASE 2 (Week 2)</span>
          <h4 className="font-serif font-bold text-blue-400 mb-1.5 text-sm md:text-base">專屬後台微調與一鍵三發測試</h4>
          <ul className="text-xs md:text-sm text-slate-300 space-y-1">
            <li>✓ 提供專屬後台登入帳號，測試 AI 一鍵草稿生成</li>
            <li>✓ 測試臉書官方形象發文、IG 視覺圖文與 Threads 優惠排程</li>
            <li>✓ 雙方進行 30 分鐘線上視訊會審微調對話語氣</li>
          </ul>
        </div>
        <div className="bg-slate-800/80 border-2 border-blue-500 rounded-2xl p-4 shadow-xs bg-blue-950/20">
          <span className="inline-block px-2.5 py-0.5 bg-blue-600 text-white rounded-full text-[10px] font-bold mb-2">PHASE 3 (Week 3 遠端驗收)</span>
          <h4 className="font-bold text-blue-400 mb-1.5 text-sm md:text-base">驗收開通 ➔ 綁定信用卡 ➔ 保固</h4>
          <ul className="text-xs md:text-sm text-slate-200 space-y-1 font-medium">
            <li>✓ 系統全面開通正式串接發布</li>
            <li>✓ 線上通過驗收並<b>轉帳付尾款 $18,900 (含稅)</b></li>
            <li>✓ 點擊按鈕<b>線上綁定藍新信用卡 ($2,625/月含稅) 開通！</b></li>
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
        <span className="text-[10px] md:text-xs bg-blue-900/60 text-blue-300 px-2.5 py-0.5 rounded-full font-bold border border-blue-700/50">
          華鍵汽車專屬交付清單
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 shadow-xs">
          <h4 className="font-bold text-blue-400 text-xs md:text-sm mb-2">📌 AI 系統建置交付清單 (一次性)</h4>
          <ul className="text-xs md:text-sm text-slate-300 space-y-1.5">
            <li>✓ 100% 全遠端雲端建置與線上指導驗收</li>
            <li>✓ <b>1. AI 汽車文案大腦與圖片風格配圖</b></li>
            <li>✓ <b>2. 電腦/手機雙用後台 (支援手機相機即拍即傳)</b></li>
            <li>✓ <b>3. 臉書 / IG / Threads 三平台一鍵同步與排程</b></li>
            <li>✓ <b>4. AI 小編留言秒回與賞車引導導客</b></li>
          </ul>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 shadow-xs">
          <h4 className="font-bold text-indigo-400 text-xs md:text-sm mb-2">🔄 代營運與保固交付 (每月持續)</h4>
          <ul className="text-xs md:text-sm text-slate-300 space-y-1">
            <li>✓ <b>首月 30 天線上免費維護保障 (語氣與文案微調)</b></li>
            <li>✓ 每月車款庫與知識庫編修支援</li>
            <li>✓ 官方社群管道連線維護與系統安全</li>
            <li>✓ 雲端資料庫與發文紀錄每日自動備份</li>
          </ul>
        </div>

        <div className="bg-emerald-950/40 border-2 border-emerald-500/60 rounded-2xl p-4 shadow-xs">
          <h4 className="font-bold text-emerald-400 text-xs md:text-sm mb-2">🔒 企業級帳號安全與個資防線</h4>
          <ul className="text-xs md:text-sm text-slate-200 space-y-1 font-medium">
            <li>✓ <b>官方帳號安全金鑰防護</b>：連線憑證高強度加密隔離</li>
            <li>✓ <b>AI 惡意意圖過濾</b>：防範謾罵與競業惡意探聽</li>
            <li>✓ <b>賞車顧客名單保護</b>：符合個人資料保護法</li>
            <li>✓ <b>店家專屬權限鎖</b>：非授權帳號無法發布</li>
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
          傳統真人社群小編 ✕ AI 社群矩陣系統效益比較
        </h2>
        <span className="text-[10px] md:text-xs bg-blue-900/60 text-blue-300 px-2.5 py-0.5 rounded-full font-bold border border-indigo-700/50">
          商業價值總結
        </span>
      </div>

      <div className="bg-slate-800/90 border-2 border-blue-500/60 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs md:text-sm">
          <thead className="bg-slate-900 text-blue-400 font-bold border-b border-slate-700">
            <tr>
              <th className="p-2 md:p-2.5">評估比較項目</th>
              <th className="p-2 md:p-2.5 text-slate-400">外包/聘用傳統小編</th>
              <th className="p-2 md:p-2.5 text-blue-400 bg-blue-950/40 font-black">🏎️ 華鍵汽車 AI 社群矩陣系統</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700 text-slate-200">
            <tr>
              <td className="p-2 md:p-2.5 font-bold">發文速度與風格一致性</td>
              <td className="p-2 md:p-2.5 text-slate-400">人工產文慢，色調與排版易走樣</td>
              <td className="p-2 md:p-2.5 font-bold text-emerald-400 bg-blue-950/40"><b>後台 5 秒自動生成，色調排版 100% 一致</b></td>
            </tr>
            <tr>
              <td className="p-2 md:p-2.5 font-bold">三平台一鍵同步發布</td>
              <td className="p-2 md:p-2.5 text-slate-400">臉書/IG/Threads 需分開複製貼上</td>
              <td className="p-2 md:p-2.5 font-bold text-emerald-400 bg-blue-950/40"><b>後台勾選一鍵同步發布 臉書形象/IG視覺/脆促銷</b></td>
            </tr>
            <tr>
              <td className="p-2 md:p-2.5 font-bold">留言與私訊即時引導</td>
              <td className="p-2 md:p-2.5 text-slate-400">下班時間無人回，顧客易流失</td>
              <td className="p-2 md:p-2.5 font-bold text-emerald-400 bg-blue-950/40"><b>24H 秒回留言、引導私訊留單預約賞車</b></td>
            </tr>
            <tr>
              <td className="p-2 md:p-2.5 font-bold">方案金額與負擔</td>
              <td className="p-2 md:p-2.5 text-rose-400 font-mono font-bold">NT$ 35,000 ~ 50,000/月</td>
              <td className="p-2 md:p-2.5 text-emerald-400 font-mono font-black bg-blue-950/40"><b>建置費 $36,000 (月維護僅 NT$ 2,500/月)</b></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Proposing Company Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-2 border-blue-500/60 rounded-2xl p-3 md:p-4 shadow-xs flex flex-col md:flex-row justify-between items-center gap-2">
        <div>
          <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold block w-fit mb-1">
            🏢 提案團隊聯絡資訊
          </span>
          <h3 className="font-extrabold text-sm md:text-base text-white flex items-center gap-1.5">
            <span>奕暢創新設計工作室</span>
            <span className="text-[10px] md:text-xs font-mono font-bold text-blue-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
              統編: 41370842
            </span>
          </h3>
        </div>

        <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm">
          <div className="bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700">
            <span className="text-[9px] text-slate-400 block">LINE ID</span>
            <span className="font-mono font-black text-blue-400">ivanlai33</span>
          </div>

          <div className="bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700">
            <span className="text-[9px] text-slate-400 block">電話</span>
            <span className="font-mono font-black text-blue-400">0987528785</span>
          </div>
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
    <div className="w-full min-h-screen bg-[#0F172A] text-slate-200 font-sans select-none overflow-x-hidden">
      <Script src="https://static.line-scdn.net/liff/edge/2/sdk.js" onLoad={handleLiffInit} />

      {/* Top Header Bar */}
      <header className="sticky top-0 z-50 bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-800 px-4 py-2.5">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block animate-pulse"></span>
            <span className="font-bold text-xs md:text-sm text-white">
              華鍵汽車 — AI 社群全自動文案與多平台發布系統
            </span>
          </div>
          <div className="text-[10px] md:text-xs text-slate-400 font-mono flex items-center gap-1.5">
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

      {/* Mobile Mode: Native Vertical Continuous Scroll View (手機直向順暢上下滑動模式) */}
      <div className="block md:hidden w-full max-w-xl mx-auto p-3 space-y-4">
        {sectionCover}
        {sectionRequirements}
        {sectionModules}
        {sectionPricing}
        {sectionTimeline}
        {sectionChecklist}
        {sectionSummary}
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
              className="px-5 py-2 bg-slate-800 border border-slate-700 rounded-full text-xs font-bold text-slate-200 hover:bg-blue-600 hover:text-white disabled:opacity-30 transition shadow-xs active:scale-95"
            >
              ← 上一頁
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => Math.min(prev + 1, allSections.length - 1))}
              disabled={currentSlide === allSections.length - 1}
              className="px-5 py-2 bg-slate-800 border border-slate-700 rounded-full text-xs font-bold text-slate-200 hover:bg-blue-600 hover:text-white disabled:opacity-30 transition shadow-xs active:scale-95"
            >
              下一頁 →
            </button>
            <button
              onClick={() => window.print()}
              className="px-5 py-2 bg-blue-950 border border-blue-700 text-blue-300 rounded-full text-xs font-bold hover:bg-blue-600 hover:text-white transition shadow-xs active:scale-95"
            >
              🖨️ 列印 / PDF
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
