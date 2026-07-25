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

export default function KoloongProposalPage() {
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

  // Selected Plan State
  const [selectedPlan, setSelectedPlan] = useState<"static" | "full">("full");

  // Legal Terms Confirmation State
  const [checkTerms1, setCheckTerms1] = useState(false);
  const [checkTerms2, setCheckTerms2] = useState(false);

  // Admin View State
  const [isAdminView, setIsAdminView] = useState(false);
  const [invoiceRecords, setInvoiceRecords] = useState<InvoiceRecord[]>([]);

  // Password Verification (Today's date: 20260725 or 0725)
  const VALID_PASSWORDS = ["20260725", "0725", "20260724", "0724", "20260723", "0723"];

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
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c")
      ) {
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
          setCurrentSlide((prev) => Math.min(prev + 1, 4));
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

  // Background Audit Logger State
  const [clientIp, setClientIp] = useState("Detecting...");

  const logAuditEvent = (eventType: string, details: string = "") => {
    const now = new Date();
    const eventItem = {
      type: eventType,
      details,
      timestamp: now.toISOString(),
      timeFormatted: now.toLocaleString("zh-TW", { timeZone: "Asia/Taipei" }),
    };

    const saved = localStorage.getItem("ko_loong_proposal_audit_log");
    let currentLogs: any = saved ? JSON.parse(saved) : { events: [] };
    currentLogs.proposalSlug = "ko-loong";
    currentLogs.clientIp = clientIp;
    currentLogs.events = currentLogs.events || [];
    currentLogs.events.push(eventItem);

    localStorage.setItem("ko_loong_proposal_audit_log", JSON.stringify(currentLogs));

    fetch("/api/proposals/audit-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        proposalSlug: "ko-loong",
        clientIp,
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
        events: currentLogs.events,
        acceptedTerms: true,
      }),
    }).catch(() => {});
  };

  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then((res) => res.json())
      .then((data) => {
        if (data.ip) setClientIp(data.ip);
      })
      .catch(() => {});

    logAuditEvent("PAGE_OPENED", "Client loaded Ko-Loong proposal page");
  }, []);

  useEffect(() => {
    const unlocked = sessionStorage.getItem("proposal_unlocked_ko_loong");
    if (unlocked === "true") {
      setIsUnlocked(true);
    }
    const savedInfo = localStorage.getItem("ko_loong_invoice_info");
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
      sessionStorage.setItem("proposal_unlocked_ko_loong", "true");
      setErrorMsg("");
    } else {
      setErrorMsg("密碼不正確，請重新輸入（提示：本日日期 8 碼如 20260725 或 4 碼如 0725）");
    }
  };

  const handleMonthlyCheckout = async () => {
    setCheckoutLoading(true);
    const amount = selectedPlan === "full" ? 71400 : 39900; // NT$ 68,000 + 5% tax = 71,400 / 38,000 + 5% = 39,900
    try {
      const res = await fetch("/api/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: `ko_loong_rebuild_${selectedPlan}`,
          cycle: "once",
          amount,
          isPartner: false,
        }),
      });

      const result = await res.json();
      if (!result.success) {
        alert(`藍新金流連線提示: ${result.error || "請使用下方銀行轉帳完成專案訂金"}`);
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
      alert("連線線上刷卡失敗，請使用下方銀行匯款轉帳完成簽約。");
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
    localStorage.setItem("ko_loong_invoice_info", JSON.stringify(info));

    try {
      const res = await fetch("/api/proposals/invoice-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          taxId,
          invoiceAddress,
          contactEmail,
          proposalSlug: "ko-loong",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsSaved(true);
        alert("✓ 簽核與發票資料已成功儲存並同步確認！");
      } else {
        setIsSaved(true);
        alert("簽核資料已成功儲存！");
      }
    } catch (err) {
      console.error(err);
      setIsSaved(true);
      alert("發票資料已儲存於本機。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText("131540035543");
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  // Password Lock View
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans select-none overflow-y-auto">
        <div className="w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl my-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3 border border-blue-500/20 shadow-inner">
              🛡️
            </div>
            <h1 className="text-2xl font-bold font-serif text-white tracking-wide">
              科隆工業股份有限公司
            </h1>
            <p className="text-xs text-blue-400 font-semibold tracking-wider uppercase mt-1">
              網站重置與工程重構專案 ｜ 法律條款切結與報價單存取
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">專案瀏覽存取密碼 *</label>
              <input
                type="password"
                placeholder="請輸入訪問密碼 (預設: 本日日期)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-center text-lg focus:outline-none focus:border-blue-500 text-white placeholder-slate-500"
                autoFocus
              />
            </div>

            {/* Legal Disclaimer Checkboxes */}
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3 text-xs">
              <div className="text-slate-300 font-bold flex items-center space-x-1 border-b border-slate-800 pb-2">
                <span className="text-amber-400">⚖️</span>
                <span>委託方權利切結與法律條款聲明 (進入前請勾選確認)</span>
              </div>

              <label className="flex items-start space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={checkTerms1}
                  onChange={(e) => setCheckTerms1(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-blue-500 rounded cursor-pointer"
                />
                <span className="text-slate-300 group-hover:text-white leading-relaxed">
                  <strong className="text-blue-400">[確認一：網域與智財權切結]</strong> 我（委託方）確認為 <code className="text-amber-300 font-mono">ko-loong.com</code> 網站之合法擁有者或取得官方完全授權，保證所提供之網頁資產與商標皆具合法使用權，並無侵犯第三方智慧財產權。
                </span>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={checkTerms2}
                  onChange={(e) => setCheckTerms2(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-blue-500 rounded cursor-pointer"
                />
                <span className="text-slate-300 group-hover:text-white leading-relaxed">
                  <strong className="text-emerald-400">[確認二：用途合規與免責聲明]</strong> 我承諾本專案重置與交付之網站檔案僅用於合法商業營運，絕不用於釣魚、詐欺或違法用途；如有任何法律責任，概由委託方自行承擔，與執行團隊（奕暢創新設計工作室）無涉。
                </span>
              </label>
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-400 text-center font-medium">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={!checkTerms1 || !checkTerms2}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition shadow-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <span>同意條款並解鎖專案報價單 ➔</span>
            </button>
          </form>

          <div className="mt-8 pt-4 border-t border-slate-800/60 text-center text-xs text-slate-500">
            機密文件 ｜ © 2026 www.ycideas.com 智企概念
          </div>
        </div>
      </div>
    );
  }

  // Proposal Content Slides
  const slides = [
    { id: 0, title: "1. 現狀況主機與架構診斷" },
    { id: 1, title: "2. 資產還原與工程重構策略" },
    { id: 2, title: "3. 專案實作項目與報價單" },
    { id: 3, title: "4. 驗收流程與交付項目" },
    { id: 4, title: "5. 線上簽核與訂金匯款" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans select-none pb-20">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-600/30">
              K
            </span>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                科隆工業股份有限公司
              </h2>
              <p className="text-[10px] text-slate-400">
                網站全站重置 & 現代化工程重構計畫書
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {slides.map((s) => (
              <button
                key={s.id}
                onClick={() => setCurrentSlide(s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  currentSlide === s.id
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                {s.title}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
              PROP-2026-KL-01
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 pt-8">
        {/* Mobile Navigation Tabs */}
        <div className="md:hidden flex overflow-x-auto space-x-2 pb-4 scrollbar-none">
          {slides.map((s) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                currentSlide === s.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "bg-slate-900 text-slate-400 border border-slate-800"
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>

        {/* SLIDE 0: Host Diagnosis & Architecture */}
        {currentSlide === 0 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-blue-500/20 rounded-3xl p-6 md:p-8">
              <div className="flex items-center space-x-2 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                <span>資深系統工程團隊實測診斷</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
                目前網站主機空間與技術架構解析報告
              </h1>
              <p className="text-slate-300 text-sm leading-relaxed">
                針對目標網站 <code className="text-blue-300 bg-slate-800 px-2 py-0.5 rounded font-mono">http://ko-loong.com/tw/home</code> 進行網路節點與伺服器 Response Header 深度檢測結果如下：
              </p>
            </div>

            <div className="grid md:grid-cols-2 grid-cols-1 gap-6">
              {/* Host Space Specs */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <span className="text-xl mr-2">🖥️</span> 主機空間與電信機房資訊
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-slate-800/80">
                    <span className="text-slate-400">主機 IP 位址</span>
                    <span className="font-mono text-blue-400 font-bold">203.73.70.108</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-800/80">
                    <span className="text-slate-400">電信服務商 (ISP)</span>
                    <span className="text-slate-200 font-medium">數位聯合電信 (Seednet / 遠傳 NCIC 機房)</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-800/80">
                    <span className="text-slate-400">Web 伺服器軟體</span>
                    <span className="text-slate-200 font-mono">Apache/2.4.37 (CentOS)</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-400">後端程式語言</span>
                    <span className="text-amber-400 font-mono font-bold">PHP / 7.4.21 (舊版環境)</span>
                  </div>
                </div>
              </div>

              {/* Architecture & Features */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <span className="text-xl mr-2">⚙️</span> 網站前後台與功能評估
                </h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-start">
                    <span className="text-emerald-400 mr-2 font-bold">✓</span>
                    <div>
                      <strong className="text-white">明確包含動態後台 (CMS)：</strong>
                      <p className="text-xs text-slate-400 mt-0.5">
                        HTTP Header 帶有 <code className="text-amber-300">jddt_sessions</code> 伺服器 Session Cookie，且具備產品搜尋邏輯與動態圖片目錄，證實原網站非純靜態頁面。
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-400 mr-2 font-bold">✓</span>
                    <div>
                      <strong className="text-white">前台主要模組功能：</strong>
                      <p className="text-xs text-slate-400 mt-0.5">
                        繁中/英文雙語系、產品目錄分類導覽、關鍵字搜尋引擎、公司簡介與產品詢價/聯絡我們表單。
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-300 flex items-start space-x-3">
              <span className="text-base">⚠️</span>
              <div>
                <strong>技術升級建議：</strong> 原網站運行於 PHP 7.4 舊版環境。由於原始碼遺失，建議藉由本次專案進行全站語法高質感重構，導入現代化 Next.js/React 前台與雲端管理後台，徹底提升載入速度、RWD 手機體驗與資安等級。
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 1: Reconstruction Strategy */}
        {currentSlide === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                全資產還原與現代化工程重構技術策略
              </h2>
              <p className="text-slate-400 text-sm">
                協助客戶釐清「傳統網頁抓取」與「專業工程重構」之關鍵差異與最佳復刻路徑：
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Scraping Limit */}
              <div className="bg-slate-900/60 border border-rose-500/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-rose-400 text-base">
                    ❌ 傳統網頁抓取之極限與瓶頸
                  </h3>
                  <span className="text-xs px-2 py-0.5 bg-rose-500/10 text-rose-400 rounded border border-rose-500/20">
                    死板靜態化
                  </span>
                </div>
                <ul className="space-y-3 text-xs text-slate-300">
                  <li className="flex items-start">
                    <span className="text-rose-400 mr-2">▸</span>
                    <span><strong>無法抓取後台邏輯：</strong> 自動抓取工具只能擷取瀏覽器呈現的靜態畫面，無法還原後端 PHP 原始碼與 MySQL 資料庫。</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-rose-400 mr-2">▸</span>
                    <span><strong>搜尋與表單失效：</strong> 原網站的產品搜尋、詢價表單等動態功能會因缺乏後端回應而完全斷掉。</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-rose-400 mr-2">▸</span>
                    <span><strong>程式碼舊化冗贅：</strong> 帶有大量過時 Bootstrap 3 及 jQuery 舊語法，無法符合現代手持裝置之視覺體驗。</span>
                  </li>
                </ul>
              </div>

              {/* Engineering Strategy */}
              <div className="bg-slate-900/60 border border-emerald-500/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-emerald-400 text-base">
                    ⚡ YCideas 專業現代化工程重構方案
                  </h3>
                  <span className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">
                    高品質升級
                  </span>
                </div>
                <ul className="space-y-3 text-xs text-slate-300">
                  <li className="flex items-start">
                    <span className="text-emerald-400 mr-2">▸</span>
                    <span><strong>全站資產還原備份：</strong> 精準提取所有產品圖片、繁簡英多語系圖文與網頁結構，做到 100% 視覺視覺一模一樣。</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-400 mr-2">▸</span>
                    <span><strong>現代前端架構重寫：</strong> 全手繪重構為現代 Next.js 14 + Tailwind CSS，Google 效能與 SEO 評分飆升高達 95+。</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-400 mr-2">▸</span>
                    <span><strong>動態後台與搜尋重建：</strong> 為客戶重建專屬輕量化產品管理後台與表單收件匣，補足遺失的後端邏輯。</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Architecture Diagram */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
              <h4 className="text-sm font-bold text-slate-200 mb-4">
                🔄 重置與驗收交付架構圖
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
                  <div className="text-blue-400 font-bold mb-1">1. 資產還原與備份</div>
                  <p className="text-slate-400">完整提取所有圖片、CSS 與圖文內容</p>
                </div>
                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
                  <div className="text-indigo-400 font-bold mb-1">2. 前端工程重構</div>
                  <p className="text-slate-400">重構為極速 React/Next.js + RWD</p>
                </div>
                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
                  <div className="text-purple-400 font-bold mb-1">3. 後台與搜尋重建</div>
                  <p className="text-slate-400">建立產品管理系統與詢價收件匣</p>
                </div>
                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
                  <div className="text-emerald-400 font-bold mb-1">4. 線上驗收與交付</div>
                  <p className="text-slate-400">部署雲端環境驗收並交付全站檔案包</p>
                </div>
              </div>
            </div>

            {/* Seamless Integration Block for Original Hosting Location */}
            <div className="bg-gradient-to-r from-blue-900/30 via-slate-900 to-indigo-900/30 border border-blue-500/30 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-3">
                <span className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-lg font-bold border border-blue-500/30">
                  🔗
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">
                    放回原主機位置 — 100% 無縫銜接與無痛覆蓋部署保障
                  </h3>
                  <p className="text-xs text-blue-300">
                    完全相容數位聯合電信 (Seednet) 原有 Apache/PHP 主機環境，無需修改任何伺服器合約與設定
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 text-xs text-slate-300 pt-2">
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                  <strong className="text-blue-400 block mb-1">📁 FTP 直接覆蓋上線</strong>
                  交付包提供相容原主機 Apache/PHP 的極速靜態/輕量 API 檔案，透過 FTP 上傳至原根目錄即可立即運作。
                </div>
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                  <strong className="text-indigo-400 block mb-1">🌐 網址結構與 SEO 無縫接軌</strong>
                  包含專屬 <code className="text-amber-300 font-mono">.htaccess</code> 路由配置，100% 對齊原 `/tw/home`, `/tw/about`, `/tw/product` 等網址，Google 搜尋索引零斷鏈。
                </div>
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                  <strong className="text-purple-400 block mb-1">📦 雙軌交付（開箱即用 + 原始碼）</strong>
                  同時交付「原主機即插即用部署包」與「現代化 React/Next.js 完整專案原始碼」，未來擴充隨心所欲。
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 2: Quotation Breakdown */}
        {currentSlide === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                專案實作項目與報價單
              </h2>
              <p className="text-slate-400 text-sm">
                請選擇適合科隆工業驗收與營運需求之實作方案：
              </p>
            </div>

            {/* Plan Switcher Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Option A: Static Rebuild */}
              <div
                onClick={() => setSelectedPlan("static")}
                className={`cursor-pointer rounded-3xl p-6 transition border-2 ${
                  selectedPlan === "static"
                    ? "bg-slate-900 border-blue-500 shadow-xl shadow-blue-500/10"
                    : "bg-slate-900/40 border-slate-800 opacity-70 hover:opacity-100"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold px-2 py-0.5 bg-slate-800 text-slate-300 rounded">
                      方案 A
                    </span>
                    <h3 className="text-xl font-bold text-white mt-1">
                      純靜態前台還原與代碼重構優化
                    </h3>
                  </div>
                  <input
                    type="radio"
                    checked={selectedPlan === "static"}
                    onChange={() => setSelectedPlan("static")}
                    className="w-5 h-5 accent-blue-500"
                  />
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  適合：僅需展示前台畫面、無須更動產品內容且不需管理後台者。
                </p>

                <div className="mb-6">
                  <span className="text-3xl font-extrabold text-white">NT$ 38,000</span>
                  <span className="text-xs text-slate-400 ml-1">（一次性買斷建置費）</span>
                </div>

                <ul className="space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-4">
                  <li className="flex items-center">
                    <span className="text-blue-400 mr-2">✓</span> 全站靜態圖片與 HTML 完整資產還原備份
                  </li>
                  <li className="flex items-center">
                    <span className="text-blue-400 mr-2">✓</span> 全手繪重構頁面為現代化 HTML5 / Tailwind CSS
                  </li>
                  <li className="flex items-center">
                    <span className="text-blue-400 mr-2">✓</span> 全機型 RWD 響應式佈局校正
                  </li>
                  <li className="flex items-center">
                    <span className="text-blue-400 mr-2">✓</span> 交付靜態 HTML 網站原始碼 ZIP 檔案包
                  </li>
                  <li className="text-slate-500 flex items-center">
                    <span className="mr-2">✕</span> 不包含後台管理系統與動態搜尋
                  </li>
                </ul>
              </div>

              {/* Option B: Full Rebuild + CMS (Recommended) */}
              <div
                onClick={() => setSelectedPlan("full")}
                className={`cursor-pointer rounded-3xl p-6 transition border-2 relative overflow-hidden ${
                  selectedPlan === "full"
                    ? "bg-slate-900 border-indigo-500 shadow-xl shadow-indigo-500/20"
                    : "bg-slate-900/40 border-slate-800 opacity-70 hover:opacity-100"
                }`}
              >
                <div className="absolute top-0 right-0 bg-gradient-to-l from-indigo-600 to-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                  推薦驗收首選
                </div>

                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                      方案 B (完整版)
                    </span>
                    <h3 className="text-xl font-bold text-white mt-1">
                      全站復刻 + 現代化高質感重構 + 輕量動態後台
                    </h3>
                  </div>
                  <input
                    type="radio"
                    checked={selectedPlan === "full"}
                    onChange={() => setSelectedPlan("full")}
                    className="w-5 h-5 accent-indigo-500"
                  />
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  適合：需完整還原前台，並擁有自行上架產品、Banner 輪播與收件後台者。
                </p>

                <div className="mb-6">
                  <span className="text-3xl font-extrabold text-white">NT$ 68,000</span>
                  <span className="text-xs text-slate-400 ml-1">（一次性買斷建置費）</span>
                </div>

                <ul className="space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-4">
                  <li className="flex items-center font-semibold text-indigo-300">
                    <span className="text-indigo-400 mr-2">★</span> 包含方案 A 所有資產還原與前端重構
                  </li>
                  <li className="flex items-center">
                    <span className="text-indigo-400 mr-2">✓</span> 重建產品分類與關鍵字搜尋引擎
                  </li>
                  <li className="flex items-center">
                    <span className="text-indigo-400 mr-2">✓</span> 建置雲端後台管理系統 (產品增刪改查/Banner/詢價收件)
                  </li>
                  <li className="flex items-center">
                    <span className="text-indigo-400 mr-2">✓</span> 部署線上獨立測試網址供驗收
                  </li>
                  <li className="flex items-center">
                    <span className="text-indigo-400 mr-2">✓</span> 驗收完成交付開箱即用完整專案原始碼與資料庫備份
                  </li>
                </ul>
              </div>
            </div>

            {/* Value Added Hosting Option */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center">
                  <span className="mr-2">☁️</span> 加值選配：全代管雲端主機與網域安全託管
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  包含 SSL 安全憑證、定期資料庫備份、Cloudflare CDN 極速快取與主機維護
                </p>
              </div>
              <div className="text-right whitespace-nowrap">
                <span className="text-lg font-bold text-amber-400">NT$ 12,000</span>
                <span className="text-xs text-slate-400"> / 年</span>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 3: Acceptance & Milestones */}
        {currentSlide === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                驗收流程與交付項目
              </h2>
              <p className="text-slate-400 text-sm">
                專案執行採階段式透明里程碑，線上記錄進度，驗收完成始交付檔案：
              </p>
            </div>

            <div className="relative border-l-2 border-blue-500/30 ml-4 space-y-6">
              {/* Step 1 */}
              <div className="relative pl-6">
                <span className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-blue-500 ring-4 ring-slate-950"></span>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <span className="text-[10px] text-blue-400 font-mono uppercase font-bold">Phase 01 ｜ 預計 3 個工作天</span>
                  <h3 className="text-base font-bold text-white mt-1">全資產還原與網頁結構解析</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    完成原網站所有 HTML、CSS、JS、字型及產品圖片 100% 提取歸檔，並建立元件樹狀結構。
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative pl-6">
                <span className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-indigo-500 ring-4 ring-slate-950"></span>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <span className="text-[10px] text-indigo-400 font-mono uppercase font-bold">Phase 02 ｜ 預計 5 個工作天</span>
                  <h3 className="text-base font-bold text-white mt-1">前台 UI 響應式重構與 SEO 優化</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    手繪重構為 Next.js 現代化響應式頁面，並針對 Mobile 手機介面重新設計最適排版。
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative pl-6">
                <span className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-purple-500 ring-4 ring-slate-950"></span>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <span className="text-[10px] text-purple-400 font-mono uppercase font-bold">Phase 03 ｜ 預計 5 個工作天</span>
                  <h3 className="text-base font-bold text-white mt-1">動態後台與產品資料庫建置</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    建置專屬管理後台，導入產品資料庫 schema，並整合產品搜尋引擎與聯絡我們表單。
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative pl-6">
                <span className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-slate-950"></span>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <span className="text-[10px] text-emerald-400 font-mono uppercase font-bold">Phase 04 ｜ 預計 2 個工作天</span>
                  <h3 className="text-base font-bold text-white mt-1">部署測試環境與線上驗收交付</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    部署至臨時測試網址提供客戶比對驗收，驗收確認無誤後提供整包原始碼 ZIP 及 SQL 檔案包。
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 4: Sign-off & Bank Transfer Only */}
        {currentSlide === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                線上簽核與銀行訂金匯款資訊
              </h2>
              <p className="text-slate-400 text-sm">
                請確認您選擇的方案，填寫發票資料後請使用下方指定銀行帳戶完成專案訂金匯款：
              </p>
            </div>

            {/* Executive Vendor Information Box */}
            <div className="bg-slate-900/90 border border-blue-500/30 rounded-2xl p-6 mb-6">
              <h3 className="text-base font-bold text-white mb-3 flex items-center">
                <span className="mr-2">🏢</span> 執行團隊乙方資訊 (奕暢創新設計工作室)
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="flex justify-between py-1.5 border-b border-slate-800"><span className="text-slate-400">公司全銜</span><span className="text-white font-bold">奕暢創新設計工作室</span></div>
                <div className="flex justify-between py-1.5 border-b border-slate-800"><span className="text-slate-400">統一編號</span><span className="text-blue-400 font-bold">41370842</span></div>
                <div className="flex justify-between py-1.5 border-b border-slate-800"><span className="text-slate-400">專案聯絡電話</span><span className="text-white font-bold">0987528785</span></div>
                <div className="flex justify-between py-1.5 border-b border-slate-800"><span className="text-slate-400">聯絡人 Line ID</span><span className="text-emerald-400 font-bold">ivanlai33</span></div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Form Section */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-base font-bold text-white mb-4 flex items-center">
                  <span className="mr-2">📝</span> 發票開立與簽核資料填寫
                </h3>

                <form onSubmit={handleSaveInvoiceInfo} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">公司全銜 *</label>
                    <input
                      type="text"
                      required
                      placeholder="例：科隆工業股份有限公司"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">統一編號 *</label>
                    <input
                      type="text"
                      required
                      placeholder="例：12345678"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">發票寄送 Email</label>
                    <input
                      type="email"
                      placeholder="service@ko-loong.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">發票寄送地址</label>
                    <input
                      type="text"
                      placeholder="公司登記地址"
                      value={invoiceAddress}
                      onChange={(e) => setInvoiceAddress(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg border border-slate-700 transition flex items-center justify-center space-x-2"
                  >
                    <span>{isSaved ? "✓ 資料已更新儲存" : "儲存電子發票資料"}</span>
                  </button>
                </form>
              </div>

              {/* Payment Section */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white mb-4 flex items-center">
                    <span className="mr-2">🏦</span> 專案指定銀行對帳匯款帳號
                  </h3>

                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 mb-4 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500">匯款銀行</span>
                      <span className="text-white font-bold">中國信託銀行 (822)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">分行資訊</span>
                      <span className="text-slate-300">內壢簡易型分行</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">帳戶戶名</span>
                      <span className="text-white font-bold">賴奕暢</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-slate-900">
                      <span className="text-slate-500">匯款帳號</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-blue-400 font-bold text-sm">131540035543</span>
                        <button
                          onClick={handleCopyAccount}
                          className="px-2 py-0.5 bg-blue-600/20 text-blue-400 text-[10px] rounded hover:bg-blue-600/30"
                        >
                          {copySuccess ? "已複製！" : "複製帳號"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-indigo-950/40 border border-indigo-500/20 rounded-xl text-xs text-indigo-300 mb-4">
                    已選方案：<strong className="text-white font-bold">{selectedPlan === "full" ? "方案 B (全站復刻+動態後台) NT$ 68,000" : "方案 A (純靜態還原) NT$ 38,000"}</strong><br />
                    <span className="text-[11px] text-slate-400 mt-1 block">請於簽核完成後轉帳專案訂金（總金額之 50%），匯款後請告知帳號後五碼或聯繫 Line: ivanlai33 以利對帳。</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    handleCopyAccount();
                    alert("✓ 匯款帳號 (822 中國信託 131540035543 戶名:賴奕暢) 已成功複製！請完成專案訂金匯款，如有疑問請聯繫 Line: ivanlai33。");
                  }}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
                >
                  <span>✓ 確定填寫資料並複製帳號匯款 ➔</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Sticky Action Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-lg border-t border-slate-800 p-3 z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentSlide((prev) => Math.max(prev - 1, 0))}
              disabled={currentSlide === 0}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-white rounded-lg disabled:opacity-30 transition"
            >
              ← 上一頁
            </button>

            <span className="text-xs text-slate-400 font-mono">
              {currentSlide + 1} / {slides.length}
            </span>

            <button
              onClick={() => setCurrentSlide((prev) => Math.min(prev + 1, 4))}
              disabled={currentSlide === 4}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-white rounded-lg disabled:opacity-30 transition"
            >
              下一頁 →
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:block text-right">
              <p className="text-[10px] text-slate-400">目前選擇方案</p>
              <p className="text-xs font-bold text-blue-400">
                {selectedPlan === "full" ? "NT$ 68,000 (完整版)" : "NT$ 38,000 (靜態版)"}
              </p>
            </div>

            <button
              onClick={() => setCurrentSlide(4)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs rounded-lg shadow-md hover:from-blue-500 hover:to-indigo-500 transition"
            >
              進行簽核付款 ➔
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
