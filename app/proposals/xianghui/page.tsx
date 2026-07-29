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

export default function XianghuiProposalPage() {
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Commercial Defense & Admin Bypass State
  const [isAdminBypass, setIsAdminBypass] = useState(false);

  // Proposal Effective Date
  const CREATED_AT = "2026-07-29";
  const [lifecycleState, setLifecycleState] = useState<{ stage: string; daysDiff: number }>(
    calculateProposalLifecycle(CREATED_AT)
  );

  useEffect(() => {
    sendProposalAuditTrack("xianghui", "PAGE_VISITED_SESSION").then((res) => {
      if (res && res.lifecycle) {
        setLifecycleState(res.lifecycle);
      }
    });
  }, []);

  // 3-Stage Lifecycle: Stage 3 (ARCHIVED_404 > 10 Days) & Manual Closure
  if (!isAdminBypass && (lifecycleState.stage === "ARCHIVED_404" || lifecycleState.stage === "MANUALLY_CLOSED")) {
    return (
      <div className="w-full min-h-screen bg-[#06121E] text-cyan-100 flex flex-col justify-center items-center p-6 text-center font-sans">
        <div className="w-16 h-16 bg-cyan-950/80 text-cyan-400 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-cyan-700/50">
          🔒
        </div>
        <h1 className="text-3xl font-black mb-2 text-white">404 — 專案頁面已隱蔽歸檔</h1>
        <p className="text-sm text-cyan-300 max-w-md mx-auto leading-relaxed mb-6">
          {lifecycleState.stage === "MANUALLY_CLOSED"
            ? "本專案報價單已由系統管理員手動封存歸檔。若需重新開啓或調閱歷史數據，請聯繫專案負責人。"
            : "本專案報價單已超過 10 天有效議價與展示期，系統已自動執行商業隱蔽歸檔。"}
        </p>
        <div className="text-xs text-cyan-500 bg-cyan-900/40 px-4 py-2 rounded-xl border border-cyan-800/40">
          專案代碼：xianghui ｜ 祥惠有限公司
        </div>
      </div>
    );
  }

  // Invoice & Remittance Form State
  const [companyName, setCompanyName] = useState("祥惠有限公司");
  const [taxId, setTaxId] = useState("23215860");
  const [invoiceAddress, setInvoiceAddress] = useState("彰化縣大村鄉加錫村加錫三巷5-28號");
  const [contactEmail, setContactEmail] = useState("");
  const [remittanceBank5, setRemittanceBank5] = useState("");
  const [remittanceName, setRemittanceName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Selected Plan State: 'starter' (5.8萬) | 'flagship' (6.8萬)
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "flagship">("flagship");

  // Passwords: Today (20260729 / 0729), Tax ID (23215860)
  const VALID_PASSWORDS = ["20260729", "0729", "23215860", "20260725", "0725"];

  useEffect(() => {
    // 🔑 Admin Bypass Mode (?admin=87257257)
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("admin") === "87257257") {
        setIsAdminBypass(true);
        setIsUnlocked(true);
      }
    }

    const unlocked = sessionStorage.getItem("proposal_unlocked_xianghui");
    if (unlocked === "true") {
      setIsUnlocked(true);
      sendProposalAuditTrack("xianghui", "PAGE_VISITED_SESSION");
    }
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (VALID_PASSWORDS.includes(password.trim())) {
      setIsUnlocked(true);
      sessionStorage.setItem("proposal_unlocked_xianghui", "true");
      setErrorMsg("");
      sendProposalAuditTrack("xianghui", "PASSWORD_UNLOCKED");
    } else {
      setErrorMsg("密碼不正確，請重新輸入（提示：本日日期 20260729 或 貴司統編 23215860）");
    }
  };

  const handleMonthlyCheckout = async () => {
    setCheckoutLoading(true);
    const amount = selectedPlan === "flagship" ? 3675 : 2625;
    try {
      const res = await fetch("/api/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: `xianghui_ai_${selectedPlan}`,
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

      const fields = { MerchantID, TradeInfo, TradeSha, Version };
      Object.entries(fields).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value as string;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      console.error(err);
      alert("啟動支付失敗，請重新再試。");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleSaveInvoiceInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const infoData = {
        companyName,
        taxId,
        invoiceAddress,
        contactEmail,
        remittanceBank5,
        remittanceName,
        submittedAt: new Date().toISOString(),
        selectedPlan,
      };

      await sendProposalAuditTrack("xianghui", "SUBMIT_INVOICE_INFO", infoData);
      setIsSaved(true);
      alert("✅ 開票與匯款資料已成功確認送出！專案組已收到對帳資訊。");
    } catch (err) {
      console.error(err);
      alert("❌ 儲存失敗，請稍後再試。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProposalEditableProvider slug="xianghui">
      <div className="min-h-screen bg-[#07131E] text-slate-100 font-sans relative selection:bg-[#0080FF] selection:text-white pb-24">
        {/* Security overlays */}
        <SecurityWatermarkOverlay />
        {isAdminBypass && <OwnerBypassBanner />}
        <FraudAlertAndDomainVerifier />

        {/* Lock Screen Modal */}
        {!isUnlocked && (
          <div className="fixed inset-0 z-[999] bg-[#040C16]/95 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-[#0B1E30] border border-[#00A8FF]/40 rounded-3xl p-8 shadow-2xl text-center">
              <div className="w-16 h-16 bg-[#002D52] text-[#00E5FF] rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-[#0080FF]/50 shadow-[0_0_20px_rgba(0,128,255,0.3)]">
                🧪
              </div>
              <h2 className="text-2xl font-bold font-serif text-white mb-2">祥惠有限公司 — 專案報價單</h2>
              <p className="text-xs text-cyan-300/80 mb-6 leading-relaxed">
                進口畜牧生技醫療藥品 ｜ AI 店長與業務白名單廣播系統建置案
              </p>
              <form onSubmit={handleUnlock} className="space-y-4">
                <input
                  type="password"
                  placeholder="請輸入密碼 (統編或本日日期)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[#05111C] border border-[#0080FF]/50 rounded-xl text-center text-lg focus:outline-none focus:border-[#00E5FF] text-cyan-100 placeholder-cyan-800"
                  autoFocus
                />
                {errorMsg && <p className="text-xs text-rose-400">{errorMsg}</p>}
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-[#0052D4] to-[#0080FF] hover:from-[#0040A8] hover:to-[#0066CC] text-white font-bold rounded-xl shadow-lg shadow-cyan-950 transition"
                >
                  解鎖進入報價單
                </button>
              </form>
              <p className="text-[10px] text-cyan-500 mt-4">提示：貴司統編 23215860 或 本日日期 20260729</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="max-w-5xl mx-auto px-4 pt-10">
          {/* Header Banner - International BioTech / Pharma Theme */}
          <div className="bg-gradient-to-r from-[#051C33] via-[#0B3C68] to-[#082847] rounded-3xl p-8 border border-[#00A8FF]/40 shadow-[0_10px_40px_rgba(0,82,212,0.2)] mb-8 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 opacity-10 text-[180px] pointer-events-none select-none">
              🧬💊
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#041220]/80 rounded-full border border-[#00E5FF]/40 text-xs text-[#00E5FF] mb-3 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse shadow-[0_0_8px_#00E5FF]"></span>
                祥惠有限公司 ｜ 進口畜牧生技醫療與動物藥品
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold font-serif text-white tracking-tight leading-tight mb-3">
                AI 智慧藥理店長 & 業務白名單廣播系統建置案
              </h1>
              <p className="text-sm text-cyan-100/90 max-w-2xl leading-relaxed">
                專為祥惠有限公司（進口畜牧生技藥品、雞/豬養殖疫苗與營養品）量身打造！具備國際級醫療生技質感，結合一般農場客戶的三大互動模式（含產品 PDF 藥理檢索）與內部業務專屬白名單廣播。
              </p>
            </div>
          </div>

          {/* Customer & Proposal Meta Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-[#0B1E30] border border-[#0080FF]/30 rounded-2xl p-6 shadow-md">
              <h3 className="text-xs uppercase font-bold text-[#00E5FF] tracking-wider mb-4 flex items-center gap-2">
                <span>🏢</span> 客戶對象資訊 (CLIENT)
              </h3>
              <div className="space-y-2 text-sm text-cyan-100">
                <div className="flex justify-between border-b border-cyan-900/40 pb-1">
                  <span className="text-cyan-400">公司名稱</span>
                  <span className="font-semibold text-white">祥惠有限公司</span>
                </div>
                <div className="flex justify-between border-b border-cyan-900/40 pb-1">
                  <span className="text-cyan-400">統一編號</span>
                  <span className="font-mono text-cyan-200">23215860</span>
                </div>
                <div className="flex justify-between border-b border-cyan-900/40 pb-1">
                  <span className="text-cyan-400">聯絡電話</span>
                  <span>04-8531155</span>
                </div>
                <div className="flex justify-between border-b border-cyan-900/40 pb-1">
                  <span className="text-cyan-400">公司地址</span>
                  <span className="text-xs">彰化縣大村鄉加錫村加錫三巷5-28號</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-cyan-400">產業領域</span>
                  <span className="text-xs font-semibold text-cyan-300">進口畜牧生技 / 動物藥品與疫苗營養劑</span>
                </div>
              </div>
            </div>

            <div className="bg-[#0B1E30] border border-[#0080FF]/30 rounded-2xl p-6 shadow-md">
              <h3 className="text-xs uppercase font-bold text-[#00E5FF] tracking-wider mb-4 flex items-center gap-2">
                <span>📑</span> 報價與專案資訊 (PROPOSAL)
              </h3>
              <div className="space-y-2 text-sm text-cyan-100">
                <div className="flex justify-between border-b border-cyan-900/40 pb-1">
                  <span className="text-cyan-400">專案編號</span>
                  <span className="font-mono text-cyan-200">XH-202607-AI01</span>
                </div>
                <div className="flex justify-between border-b border-cyan-900/40 pb-1">
                  <span className="text-cyan-400">報價日期</span>
                  <span>2026 年 07 月 29 日</span>
                </div>
                <div className="flex justify-between border-b border-cyan-900/40 pb-1">
                  <span className="text-cyan-400">建議預算區間</span>
                  <span className="font-bold text-amber-400">NT$ 50,000 ~ 70,000</span>
                </div>
                <div className="flex justify-between border-b border-cyan-900/40 pb-1">
                  <span className="text-cyan-400">預估建置工期</span>
                  <span>3 ~ 4 週</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-cyan-400">規劃顧問</span>
                  <span className="text-xs font-semibold text-cyan-300">奕暢 🌞 / iVan3514</span>
                </div>
              </div>
            </div>
          </div>

          {/* Core Feature Matrix */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold font-serif text-white mb-2 flex items-center gap-2">
              <span>🧬</span> 國際生技級 AI 核心功能與架構
            </h2>
            <p className="text-xs text-cyan-300/80 mb-6">
              結合一般農場客戶的三大互動模式、業務人員白名單獨立頻道與完整的後台管理機制。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="bg-[#0B1E30] border border-[#0080FF]/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="w-10 h-10 bg-[#002B4D] text-[#00E5FF] rounded-xl flex items-center justify-center font-bold text-lg mb-4 border border-[#0080FF]/50 shadow-[0_0_15px_rgba(0,229,255,0.2)]">
                  📱
                </div>
                <h3 className="text-lg font-bold text-white mb-2">1. 一般客戶三大互動模式</h3>
                <ul className="text-xs text-cyan-100/90 space-y-2 leading-relaxed">
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#00E5FF]">▶</span>
                    <span><strong>富圖文選單 (Rich Menu)</strong>：快速進入「雞隻藥品/疫苗」、「豬隻藥品/營養劑」、「藥理規格」、「公司諮詢」。</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#00E5FF]">▶</span>
                    <span><strong>對話與 PDF 卡片拉出</strong>：客戶輸入「豬用藥」或「白肉雞疫苗」，AI 店長自動拉出進口藥品多圖卡片與 PDF 仿單說明。</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#00E5FF]">▶</span>
                    <span><strong>洽詢表單與門市地圖</strong>：線上留單採購諮詢、地圖導航與直撥電話。</span>
                  </li>
                </ul>
              </div>

              {/* Feature 2 */}
              <div className="bg-[#0B1E30] border border-[#0080FF]/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="w-10 h-10 bg-[#002B4D] text-amber-300 rounded-xl flex items-center justify-center font-bold text-lg mb-4 border border-[#0080FF]/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                  🔐
                </div>
                <h3 className="text-lg font-bold text-white mb-2">2. 業務白名單與內部廣播</h3>
                <ul className="text-xs text-cyan-100/90 space-y-2 leading-relaxed">
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-400">▶</span>
                    <span><strong>內部業務白名單 (4~6人)</strong>：識別業務身分，解鎖業務專屬圖文選單與藥理筆記。</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-400">▶</span>
                    <span><strong>內部訊息獨立推播</strong>：內部藥品進貨、價格政策與訓練通知，<strong>絕不干擾公頻</strong>。</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-400">▶</span>
                    <span><strong>牧場週期與用藥提醒</strong>：記錄客戶牧場進場週期，每週提醒業務關懷用藥與回購。</span>
                  </li>
                </ul>
              </div>

              {/* Feature 3 */}
              <div className="bg-[#0B1E30] border border-[#0080FF]/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="w-10 h-10 bg-[#002B4D] text-[#00E5FF] rounded-xl flex items-center justify-center font-bold text-lg mb-4 border border-[#0080FF]/50 shadow-[0_0_15px_rgba(0,229,255,0.2)]">
                  ⚙️
                </div>
                <h3 className="text-lg font-bold text-white mb-2">3. 後台管理與雙頻道廣播</h3>
                <ul className="text-xs text-cyan-100/90 space-y-2 leading-relaxed">
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#00E5FF]">▶</span>
                    <span><strong>業務名單權限控制</strong>：後台自由新增或設定業務 LINE 白名單。</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#00E5FF]">▶</span>
                    <span><strong>雙頻道獨立推播引擎</strong>：可選「內部業務頻道」或「公開農場客戶頻道」。</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#00E5FF]">▶</span>
                    <span><strong>藥理 PDF 知識庫訓練</strong>：匯入最新進口原廠藥品 PDF 手冊供 AI 店長精準辨識問答。</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Pricing Plans Selection */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold font-serif text-white mb-2 flex items-center gap-2">
              <span>💎</span> 建議建置方案 (國際生技雙版本)
            </h2>
            <p className="text-xs text-cyan-300/80 mb-6">
              請點擊選擇符合祥惠有限公司需求之方案，金額皆透明公開。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Plan Starter */}
              <div
                onClick={() => setSelectedPlan("starter")}
                className={`cursor-pointer rounded-3xl p-8 border-2 transition-all relative flex flex-col justify-between ${
                  selectedPlan === "starter"
                    ? "bg-[#0A2540] border-[#0080FF] shadow-2xl shadow-cyan-950 scale-[1.02]"
                    : "bg-[#0B1E30] border-[#0080FF]/30 opacity-80 hover:opacity-100"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-xs font-bold px-3 py-1 bg-[#001D38] text-[#00E5FF] rounded-full border border-[#0080FF]">
                        方案 A
                      </span>
                      <h3 className="text-2xl font-black text-white mt-2">【標準生技藥品版】</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-extrabold text-white">NT$ 58,000</span>
                      <span className="text-xs text-cyan-300 block">一次性建置費 (未稅)</span>
                    </div>
                  </div>

                  <p className="text-xs text-cyan-200 mb-6 pb-4 border-b border-cyan-800/60 leading-relaxed">
                    適合基礎建置，包含一般農場客戶基本問答、圖文選單、洽詢表單與 6 人業務白名單。
                  </p>

                  <ul className="text-xs text-cyan-100 space-y-2 mb-8">
                    <li className="flex items-center gap-2">
                      <span className="text-[#00E5FF]">✓</span> 一般客戶 3 種互動（圖文選單 + 關鍵字卡片 + 洽詢表單）
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#00E5FF]">✓</span> 業務白名單管理（最多 6 位業務人員）
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#00E5FF]">✓</span> 內部獨立訊息推播（不干擾公頻）
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#00E5FF]">✓</span> 基礎藥品分類與用藥提醒模板
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-cyan-800/60 flex justify-between items-center text-xs">
                  <span className="text-cyan-300">月費（維運/AI對話費）：</span>
                  <span className="font-bold text-amber-300">NT$ 2,500 / 月 (含稅 2,625)</span>
                </div>
              </div>

              {/* Plan Flagship (Recommended) */}
              <div
                onClick={() => setSelectedPlan("flagship")}
                className={`cursor-pointer rounded-3xl p-8 border-2 transition-all relative flex flex-col justify-between ${
                  selectedPlan === "flagship"
                    ? "bg-[#0A2A4A] border-[#00E5FF] shadow-[0_0_30px_rgba(0,229,255,0.25)] scale-[1.02]"
                    : "bg-[#0B1E30] border-[#0080FF]/30 opacity-80 hover:opacity-100"
                }`}
              >
                {selectedPlan === "flagship" && (
                  <div className="absolute -top-3.5 right-8 bg-gradient-to-r from-[#00E5FF] to-[#0080FF] text-slate-950 font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-wider shadow">
                    ⭐ 專案推薦首選
                  </div>
                )}
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-xs font-bold px-3 py-1 bg-amber-950/80 text-amber-400 rounded-full border border-amber-800">
                        方案 B
                      </span>
                      <h3 className="text-2xl font-black text-white mt-2">【旗艦 AI 藥理生技店長】</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-extrabold text-amber-300">NT$ 68,000</span>
                      <span className="text-xs text-cyan-300 block">一次性建置費 (未稅)</span>
                    </div>
                  </div>

                  <p className="text-xs text-cyan-200 mb-6 pb-4 border-b border-cyan-800/60 leading-relaxed">
                    完整涵蓋原廠進口藥品 PDF 智慧檢索、15 人業務白名單、動態用藥筆記與雙頻道廣播。
                  </p>

                  <ul className="text-xs text-cyan-100 space-y-2 mb-8">
                    <li className="flex items-center gap-2">
                      <span className="text-[#00E5FF]">★</span> 一般客戶 3 種互動（AI 智慧辨識自動拉出藥理 PDF 與多圖卡片）
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#00E5FF]">★</span> 高階業務白名單管理（最多 15 位業務人員 + 派單歷程）
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#00E5FF]">★</span> 後台雙頻道獨立廣播引擎（內部業務廣播 vs 公開農場廣播）
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#00E5FF]">★</span> 雞/豬藥品動態週期提醒與 AI 隨機疾病藥理問答庫
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-cyan-800/60 flex justify-between items-center text-xs">
                  <span className="text-cyan-300">月費（高階AI模型與維運）：</span>
                  <span className="font-bold text-amber-300">NT$ 3,500 / 月 (含稅 3,675)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form & Invoice Checkout Section */}
          <div className="bg-[#0B1E30] border border-[#0080FF]/40 rounded-3xl p-8 shadow-2xl mb-12">
            <h2 className="text-xl font-bold font-serif text-white mb-2 flex items-center gap-2">
              <span>💳</span> 線上對帳與發票資料確認
            </h2>
            <p className="text-xs text-cyan-300/80 mb-6">
              請核對貴司抬頭與統編，完成資料確認後可直接進行藍新金流線上月費訂閱或銀行匯款對帳。
            </p>

            <form onSubmit={handleSaveInvoiceInfo} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-cyan-300 mb-1">公司發票抬頭</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#05111C] border border-[#0080FF]/60 rounded-xl text-cyan-100 text-sm focus:outline-none focus:border-[#00E5FF]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-cyan-300 mb-1">統一編號</label>
                <input
                  type="text"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#05111C] border border-[#0080FF]/60 rounded-xl text-cyan-100 text-sm focus:outline-none focus:border-[#00E5FF]"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-cyan-300 mb-1">發票寄送地址</label>
                <input
                  type="text"
                  value={invoiceAddress}
                  onChange={(e) => setInvoiceAddress(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#05111C] border border-[#0080FF]/60 rounded-xl text-cyan-100 text-sm focus:outline-none focus:border-[#00E5FF]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-cyan-300 mb-1">匯款銀行帳號後 5 碼 (匯款對帳用)</label>
                <input
                  type="text"
                  placeholder="例如: 88219"
                  value={remittanceBank5}
                  onChange={(e) => setRemittanceBank5(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#05111C] border border-[#0080FF]/60 rounded-xl text-cyan-100 text-sm focus:outline-none focus:border-[#00E5FF]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-cyan-300 mb-1">聯絡 Email</label>
                <input
                  type="email"
                  placeholder="contact@xianghui.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#05111C] border border-[#0080FF]/60 rounded-xl text-cyan-100 text-sm focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div className="md:col-span-2 flex flex-col md:flex-row gap-4 mt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-[#0052D4] hover:bg-[#003C9E] text-white font-bold rounded-xl shadow-lg transition text-sm flex items-center justify-center gap-2"
                >
                  <span>📝</span> {isSubmitting ? "資料確認中..." : "送出對帳與開票資訊"}
                </button>

                <button
                  type="button"
                  onClick={handleMonthlyCheckout}
                  disabled={checkoutLoading}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl shadow-lg transition text-sm flex items-center justify-center gap-2"
                >
                  <span>💳</span> {checkoutLoading ? "連線藍新金流..." : `線上訂閱月費 (${selectedPlan === "flagship" ? "$3,675" : "$2,625"}/月)`}
                </button>
              </div>
            </form>

            <PrintSignatureSection proposalTitle="祥惠有限公司 — AI 智慧藥理店長 & 業務白名單廣播系統建置案" />
          </div>
        </main>
      </div>
    </ProposalEditableProvider>
  );
}
