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
      <div className="w-full min-h-screen bg-[#F0F4F8] text-slate-700 flex flex-col justify-center items-center p-6 text-center font-sans">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-blue-200 shadow-sm">
          🔒
        </div>
        <h1 className="text-3xl font-bold mb-2 text-slate-900">404 — 專案頁面已隱蔽歸檔</h1>
        <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed mb-6">
          {lifecycleState.stage === "MANUALLY_CLOSED"
            ? "本專案報價單已由系統管理員手動封存歸檔。若需重新開啓或調閱歷史數據，請聯繫專案負責人。"
            : "本專案報價單已超過 10 天有效議價與展示期，系統已自動執行商業隱蔽歸檔。"}
        </p>
        <div className="text-xs text-blue-700 bg-blue-50 px-4 py-2 rounded-xl border border-blue-200">
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

  // Calculation for Deposit and Balance
  const basePrice = selectedPlan === "flagship" ? 68000 : 58000;
  const depositAmount = basePrice * 0.5; // 50% 訂金
  const balanceAmount = basePrice * 0.5; // 50% 尾款
  const depositTaxed = depositAmount * 1.05;
  const balanceTaxed = balanceAmount * 1.05;

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
      alert("✅ 開票與匯款對帳資訊已成功確認送出！專案團隊已收到對帳資訊。");
    } catch (err) {
      console.error(err);
      alert("❌ 儲存失敗，請稍後再試。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProposalEditableProvider slug="xianghui">
      <div className="min-h-screen bg-[#F4F7FB] text-slate-800 font-sans relative selection:bg-[#0066FF] selection:text-white pb-24">
        {/* Security overlays */}
        <SecurityWatermarkOverlay />
        {isAdminBypass && <OwnerBypassBanner />}
        <FraudAlertAndDomainVerifier />

        {/* Lock Screen Modal - Clean Tech Modal */}
        {!isUnlocked && (
          <div className="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white border border-slate-200/80 rounded-3xl p-8 shadow-2xl text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 border border-blue-100 shadow-sm">
                🔹
              </div>
              <h2 className="text-2xl font-bold font-serif text-slate-900 mb-1">祥惠有限公司 — 專案報價單</h2>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                進口畜牧生技與動物產品 ｜ 祥惠官方帳號 AI 智慧店長 & 業務白名單廣播系統
              </p>
              <form onSubmit={handleUnlock} className="space-y-4">
                <input
                  type="password"
                  placeholder="請輸入密碼 (統編或本日日期)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-lg focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 placeholder-slate-400 transition"
                  autoFocus
                />
                {errorMsg && <p className="text-xs text-rose-500 font-medium">{errorMsg}</p>}
                <button
                  type="submit"
                  className="w-full py-3 bg-[#0066FF] hover:bg-[#0052CC] text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition"
                >
                  解鎖進入報價單
                </button>
              </form>
              <p className="text-[10px] text-slate-400 mt-4">提示：貴司統編 23215860 或 本日日期 20260729</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="max-w-5xl mx-auto px-4 pt-10">
          {/* Header Banner - Light Fresh Bio-Tech SaaS Visual */}
          <div className="bg-gradient-to-br from-white via-[#F0F6FF] to-[#E5F0FF] rounded-3xl p-8 border border-blue-200/80 shadow-[0_10px_30px_rgba(0,102,255,0.08)] mb-8 relative overflow-hidden">
            <div className="absolute -right-12 -bottom-12 opacity-[0.04] text-[200px] pointer-events-none select-none text-blue-900">
              🧬
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/90 rounded-full border border-blue-200 text-xs font-semibold text-blue-600 mb-3 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                祥惠有限公司 ｜ 進口畜牧生技與動物保健產品
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold font-serif text-slate-900 tracking-tight leading-tight mb-3">
                祥惠官方帳號 AI 智慧店長 & 業務白名單廣播系統建置案
              </h1>
              <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
                專為祥惠有限公司（進口畜牧生技、雞/豬養殖保健與營養產品）量身打造！具備清爽生技醫療風格，整合一般農場客戶的三大互動模式（含產品 PDF 手冊檢索）與內部業務專屬白名單獨立頻道。
              </p>
            </div>
          </div>

          {/* Customer & Proposal Meta Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs uppercase font-bold text-blue-600 tracking-wider mb-4 flex items-center gap-2">
                <span>🏢</span> 客戶對象資訊 (CLIENT)
              </h3>
              <div className="space-y-2 text-sm text-slate-700">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">公司名稱</span>
                  <span className="font-semibold text-slate-900">祥惠有限公司</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">統一編號</span>
                  <span className="font-mono text-blue-600 font-medium">23215860</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">聯絡電話</span>
                  <span>04-8531155</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">公司地址</span>
                  <span className="text-xs text-slate-800">彰化縣大村鄉加錫村加錫三巷5-28號</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500">產業領域</span>
                  <span className="text-xs font-semibold text-blue-700">進口畜牧生技 / 動物保健與營養產品</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs uppercase font-bold text-blue-600 tracking-wider mb-4 flex items-center gap-2">
                <span>📑</span> 報價與專案資訊 (PROPOSAL)
              </h3>
              <div className="space-y-2 text-sm text-slate-700">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">專案編號</span>
                  <span className="font-mono text-blue-600 font-medium">XH-202607-AI01</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">報價日期</span>
                  <span>2026 年 07 月 29 日</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">建置預算區間</span>
                  <span className="font-bold text-amber-600">NT$ 58,000 ~ 68,000</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">預估建置工期</span>
                  <span>3 ~ 4 週 (包含線上驗收與上線)</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500">規劃顧問</span>
                  <span className="text-xs font-semibold text-blue-700">奕暢 🌞 / iVan3514</span>
                </div>
              </div>
            </div>
          </div>

          {/* Core Feature Matrix */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold font-serif text-slate-900 mb-2 flex items-center gap-2">
              <span>🔹</span> 核心功能規劃與系統架構
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              結合一般農場客戶的三大互動模式、業務人員白名單獨立頻道與完整的後台管理機制。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm relative overflow-hidden hover:border-blue-300 transition">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-lg mb-4 border border-blue-100">
                  📱
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">1. 一般客戶三大互動模式</h3>
                <ul className="text-xs text-slate-600 space-y-2.5 leading-relaxed">
                  <li className="flex items-start gap-1.5">
                    <span className="text-blue-500 font-bold">▶</span>
                    <span><strong>富圖文選單 (Rich Menu)</strong>：快速進入「雞隻專區」、「豬隻專區」、「營養保健」、「公司諮詢」。</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-blue-500 font-bold">▶</span>
                    <span><strong>對話與 PDF 卡片拉出</strong>：客戶輸入「豬」或「蛋雞營養品」，祥惠官方帳號 AI 智慧店長自動拉出進口產品卡片與 PDF 說明手冊。</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-blue-500 font-bold">▶</span>
                    <span><strong>洽詢表單與門市地圖</strong>：線上留單採購諮詢、地圖導航與直撥電話。</span>
                  </li>
                </ul>
              </div>

              {/* Feature 2 */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm relative overflow-hidden hover:border-blue-300 transition">
                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-bold text-lg mb-4 border border-amber-100">
                  🔐
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">2. 業務白名單與內部廣播</h3>
                <ul className="text-xs text-slate-600 space-y-2.5 leading-relaxed">
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-500 font-bold">▶</span>
                    <span><strong>內部業務白名單 (4~6人)</strong>：識別業務身分，解鎖業務專屬圖文選單與產品筆記。</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-500 font-bold">▶</span>
                    <span><strong>內部訊息獨立推播</strong>：內部進貨、價格政策與訓練通知，<strong>絕不干擾公頻</strong>。</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-500 font-bold">▶</span>
                    <span><strong>牧場週期與產品提醒</strong>：記錄客戶牧場進場週期，每週提醒業務關懷客戶與回購。</span>
                  </li>
                </ul>
              </div>

              {/* Feature 3 */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm relative overflow-hidden hover:border-blue-300 transition">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-lg mb-4 border border-blue-100">
                  ⚙️
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">3. 後台管理與雙頻道廣播</h3>
                <ul className="text-xs text-slate-600 space-y-2.5 leading-relaxed">
                  <li className="flex items-start gap-1.5">
                    <span className="text-blue-500 font-bold">▶</span>
                    <span><strong>業務名單權限控制</strong>：後台自由新增或設定業務 LINE 白名單。</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-blue-500 font-bold">▶</span>
                    <span><strong>雙頻道獨立推播引擎</strong>：可選「內部業務頻道」或「公開農場客戶頻道」。</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-blue-500 font-bold">▶</span>
                    <span><strong>PDF 知識庫訓練</strong>：匯入最新進口原廠產品 PDF 手冊供祥惠官方帳號 AI 智慧店長精準辨識問答。</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* ROI Comparison Analysis */}
          <div className="bg-[#F0F6FF] border border-blue-200/80 rounded-3xl p-8 shadow-sm mb-12 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-0.5 bg-blue-600 text-white rounded-full text-xs font-bold">ROI 效益分析</span>
              <h2 className="text-2xl font-bold font-serif text-slate-900">替代專職小編 ｜ 每年人理成本節省與效益對比</h2>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              傳統聘用一位全職客服小編 vs. 導入「祥惠官方帳號 AI 智慧店長」全天候自動化運作。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Traditional Staff Cost */}
              <div className="bg-white border border-rose-200 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                  <span className="text-sm font-bold text-slate-800">👤 聘用全職專責小編 (單人)</span>
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">高額固定人事</span>
                </div>
                <div className="space-y-2 text-xs text-slate-600 mb-4">
                  <div className="flex justify-between">
                    <span>底薪＋勞健保＋退撫提撥（約 NT$ 38,000/月）</span>
                    <span className="font-semibold text-slate-900">NT$ 456,000 / 年</span>
                  </div>
                  <div className="flex justify-between">
                    <span>年終獎金 / 節慶獎金（約 1.5 個月）</span>
                    <span className="font-semibold text-slate-900">NT$ 57,000 / 年</span>
                  </div>
                  <div className="flex justify-between">
                    <span>辦公設備、培訓與管理行政隱性成本</span>
                    <span className="font-semibold text-slate-900">約 NT$ 30,000 / 年</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-rose-100 flex justify-between items-center text-sm font-bold text-rose-600">
                  <span>每年人力總成本支出：</span>
                  <span className="text-lg">約 NT$ 543,000 / 年</span>
                </div>
              </div>

              {/* AI Store Manager Cost */}
              <div className="bg-white border border-blue-300 ring-2 ring-blue-500/10 rounded-2xl p-6 shadow-md">
                <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                  <span className="text-sm font-bold text-slate-900">🤖 祥惠官方帳號 AI 智慧店長 (旗艦版)</span>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">24H 無休自動化</span>
                </div>
                <div className="space-y-2 text-xs text-slate-600 mb-4">
                  <div className="flex justify-between">
                    <span>一次性系統客製建置費（僅首年支付）</span>
                    <span className="font-semibold text-slate-900">NT$ 68,000 (一次性)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>全年系統維運與 AI 高階模型費（NT$ 3,500/月 × 12）</span>
                    <span className="font-semibold text-slate-900">NT$ 42,000 / 年</span>
                  </div>
                  <div className="flex justify-between">
                    <span>24 小時即時回覆、PDF 比對、業務白名單管理</span>
                    <span className="font-semibold text-blue-600">全部包含，無額外加班費</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-blue-100 flex justify-between items-center text-sm font-bold text-blue-700">
                  <span>首年總費用（建置＋全年維運）：</span>
                  <span className="text-lg">NT$ 110,000 / 首年</span>
                </div>
              </div>
            </div>

            {/* Savings Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-2 shadow-md">
              <div className="text-sm">
                <span className="font-bold text-amber-300">💰 首年即可為貴司省下：</span>
                <span className="text-base font-extrabold ml-1">約 NT$ 433,000 成本</span>
                <span className="text-xs text-blue-100 block md:inline md:ml-2">(次年起每年省下超過 50 萬元人事費用)</span>
              </div>
              <div className="text-xs font-semibold bg-white/20 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-white/30">
                相當於用 <span className="text-amber-300 font-bold">1/5 的小編薪水</span> 聘請 24 小時全天候頂級客服與業務管家！
              </div>
            </div>
          </div>

          {/* Pricing Plans Selection */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold font-serif text-slate-900 mb-2 flex items-center gap-2">
              <span>💎</span> 建議建置方案與月費說明 (雙版本規劃)
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              系統建置完成並驗收後，即進入每月維運期。月費已包含雲端伺服器運算、AI 對話模型點數、後台資料庫與定期系統更新維護，透明無隱藏費用。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Plan Starter */}
              <div
                onClick={() => setSelectedPlan("starter")}
                className={`cursor-pointer rounded-3xl p-8 border-2 transition-all relative flex flex-col justify-between ${
                  selectedPlan === "starter"
                    ? "bg-white border-[#0066FF] shadow-xl shadow-blue-500/10 scale-[1.02]"
                    : "bg-white/80 border-slate-200/80 opacity-80 hover:opacity-100"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-200">
                        方案 A
                      </span>
                      <h3 className="text-xl font-bold text-slate-900 mt-2">【標準生技管家版】</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-extrabold text-slate-900">NT$ 58,000</span>
                      <span className="text-xs text-slate-500 block">一次性建置費 (未稅)</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mb-4 pb-3 border-b border-slate-100 leading-relaxed">
                    適合基礎建置，包含一般農場客戶基本問答、圖文選單、洽詢表單與 6 人業務白名單。
                  </p>

                  <ul className="text-xs text-slate-700 space-y-2.5 mb-6">
                    <li className="flex items-center gap-2">
                      <span className="text-blue-600 font-bold">✓</span> 一般客戶 3 種互動（圖文選單 + 關鍵字卡片 + 洽詢表單）
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-600 font-bold">✓</span> 業務白名單管理（最多 6 位業務人員）
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-600 font-bold">✓</span> 內部獨立訊息推播（不干擾公頻）
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-600 font-bold">✓</span> 基礎產品分類與維護提醒模板
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-100 bg-slate-50/70 -mx-8 -mb-8 p-6 rounded-b-3xl space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">每月維運費用 (建置交屋後收費)：</span>
                    <span className="font-bold text-blue-600 text-sm">NT$ 2,500 / 月 (含稅 2,625)</span>
                  </div>
                  <ul className="text-[11px] text-slate-500 space-y-1">
                    <li>• 包含雲端伺服器運算與 7×24 小時服務穩定度保障</li>
                    <li>• 包含每月基礎 AI 對話 token 額度配額</li>
                    <li>• 包含資料庫安全備份與系統定期技術更新</li>
                  </ul>
                </div>
              </div>

              {/* Plan Flagship (Recommended) */}
              <div
                onClick={() => setSelectedPlan("flagship")}
                className={`cursor-pointer rounded-3xl p-8 border-2 transition-all relative flex flex-col justify-between ${
                  selectedPlan === "flagship"
                    ? "bg-white border-[#0066FF] ring-4 ring-blue-500/10 shadow-xl shadow-blue-500/15 scale-[1.02]"
                    : "bg-white/80 border-slate-200/80 opacity-80 hover:opacity-100"
                }`}
              >
                {selectedPlan === "flagship" && (
                  <div className="absolute -top-3.5 right-8 bg-[#0066FF] text-white font-black text-[10px] px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    ⭐ 專案推薦首選
                  </div>
                )}
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-xs font-bold px-3 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
                        方案 B
                      </span>
                      <h3 className="text-xl font-bold text-slate-900 mt-2">【旗艦 AI 智慧店長】</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-extrabold text-blue-600">NT$ 68,000</span>
                      <span className="text-xs text-slate-500 block">一次性建置費 (未稅)</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mb-4 pb-3 border-b border-slate-100 leading-relaxed">
                    完整涵蓋原廠進口產品 PDF 智慧檢索、15 人業務白名單、動態週期筆記與雙頻道廣播。
                  </p>

                  <ul className="text-xs text-slate-700 space-y-2.5 mb-6">
                    <li className="flex items-center gap-2">
                      <span className="text-blue-600 font-bold">★</span> 一般客戶 3 種互動（祥惠官方帳號 AI 智慧店長自動拉出 PDF 與多圖卡片）
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-600 font-bold">★</span> 高階業務白名單管理（最多 15 位業務人員 + 派單歷程）
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-600 font-bold">★</span> 後台雙頻道獨立廣播引擎（內部業務廣播 vs 公開農場廣播）
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-600 font-bold">★</span> 雞/豬產品動態週期提醒與 AI 隨機問答知識庫
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-blue-100 bg-blue-50/50 -mx-8 -mb-8 p-6 rounded-b-3xl space-y-2 border-t">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800">每月維運費用 (建置交屋後收費)：</span>
                    <span className="font-bold text-blue-700 text-sm">NT$ 3,500 / 月 (含稅 3,675)</span>
                  </div>
                  <ul className="text-[11px] text-slate-600 space-y-1">
                    <li>• 包含高階多模態 AI 對話點數與原廠 PDF 檔案解析算力</li>
                    <li>• 包含高頻次雲端數據同步與優先伺服器通道</li>
                    <li>• 包含專屬線上技術顧問技術支援與功能優化維護</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Implementation Timeline & Payment Terms (New Section) */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm mb-12 space-y-8">
            {/* Timeline */}
            <div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-6">
                <h2 className="text-xl font-bold font-serif text-slate-900 flex items-center gap-2">
                  <span>🚀</span> 專案建置與驗收上線流程 (約 3 ~ 4 週)
                </h2>
                <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold border border-blue-200">
                  全遠端無縫導入
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
                  <span className="inline-block px-2.5 py-0.5 bg-blue-600 text-white rounded-full text-[10px] font-bold">
                    PHASE 1 (Week 1)
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">需求對齊 ➔ 簽約付訂金 (50%)</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    確定雞隻/豬隻產品資料結構、匯入 PDF 產品知識庫，完成合約簽訂與第一期建置訂金匯款。
                  </p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
                  <span className="inline-block px-2.5 py-0.5 bg-blue-500 text-white rounded-full text-[10px] font-bold">
                    PHASE 2 (Week 2~3)
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">AI 智慧店長訓練 ➔ 雙頻道部署</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    進行對話模型訓練、設定一般客戶 3 大互動模式，以及建立業務白名單後台廣播通道。
                  </p>
                </div>
                <div className="bg-blue-50/80 p-5 rounded-2xl border border-blue-200 space-y-2">
                  <span className="inline-block px-2.5 py-0.5 bg-emerald-600 text-white rounded-full text-[10px] font-bold">
                    PHASE 3 (Week 4)
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">線上驗收 ➔ 付尾款 (50%) ➔ 系統上線</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    提供內部測試環境測試對話與白名單推播，驗收無誤後支付建置尾款 50%，開通正式營運與每月維運！
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Milestone Terms */}
            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span>🏦</span> 建置費用付款條件 (兩期款付款細節)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-md">
                      第一期：簽約訂金 (50%)
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      NT$ {depositAmount.toLocaleString()} <span className="text-xs font-normal text-slate-500">(含稅 ${depositTaxed.toLocaleString()})</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    雙方確認報價與需求細節，簽訂正式合約後支付。專案小組收到首期訂金即啟動 AI 模型訓練與 LINE 官方帳號 API 串接工程。
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                      第二期：線上驗收尾款 (50%)
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      NT$ {balanceAmount.toLocaleString()} <span className="text-xs font-normal text-slate-500">(含稅 ${balanceTaxed.toLocaleString()})</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    系統建置完成，經祥惠團隊線上測試驗收無誤後支付尾款。結清尾款後立刻交屋並開通正式營運與後台廣播權限。
                  </p>
                </div>
              </div>
            </div>

            {/* Remittance Bank Info */}
            <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200 text-xs text-slate-700 space-y-1">
              <div className="font-bold text-blue-800 flex items-center gap-1.5 mb-1 text-sm">
                <span>💳</span> 指定匯款轉帳銀行帳戶資訊：
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>• <b>匯款銀行</b>：{PROVIDER_INFO.bankName}</div>
                <div>• <b>戶名</b>：{PROVIDER_INFO.accountName}</div>
                <div>• <b>銀行代碼</b>：<span className="font-mono font-bold text-blue-700">{PROVIDER_INFO.bankCode}</span></div>
                <div>• <b>匯款帳號</b>：<span className="font-mono font-bold text-blue-700">{PROVIDER_INFO.accountNumber}</span></div>
              </div>
            </div>
          </div>

          {/* Form & Invoice Checkout Section */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm mb-12">
            <h2 className="text-xl font-bold font-serif text-slate-900 mb-2 flex items-center gap-2">
              <span>🧾</span> 發票開立與首期訂金對帳登記
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              請核對貴司發票抬頭與統編，並填寫預計匯款對帳帳號後五碼，專案團隊將第一時間為您進行訂金核對與發票開立。
            </p>

            <form onSubmit={handleSaveInvoiceInfo} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">公司發票抬頭</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">統一編號</label>
                <input
                  type="text"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">發票寄送地址</label>
                <input
                  type="text"
                  value={invoiceAddress}
                  onChange={(e) => setInvoiceAddress(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">預計匯款帳號後 5 碼 (首期訂金對帳用)</label>
                <input
                  type="text"
                  placeholder="例如: 88219"
                  value={remittanceBank5}
                  onChange={(e) => setRemittanceBank5(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">電子發票通知 Email</label>
                <input
                  type="email"
                  placeholder="contact@xianghui.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition"
                />
              </div>

              <div className="md:col-span-2 flex flex-col md:flex-row gap-4 mt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-[#0066FF] hover:bg-[#0052CC] text-white font-bold rounded-xl shadow-md transition text-sm flex items-center justify-center gap-2"
                >
                  <span>📝</span> {isSubmitting ? "資料對帳中..." : "送出訂金對帳與發票資訊"}
                </button>

                <button
                  type="button"
                  onClick={handleMonthlyCheckout}
                  disabled={checkoutLoading}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl shadow-md transition text-sm flex items-center justify-center gap-2"
                >
                  <span>💳</span> {checkoutLoading ? "連線藍新金流..." : `線上訂閱月費 (${selectedPlan === "flagship" ? "$3,675" : "$2,625"}/月)`}
                </button>
              </div>
            </form>

            <PrintSignatureSection proposalTitle="祥惠有限公司 — 祥惠官方帳號 AI 智慧店長 & 業務白名單廣播系統建置案" />
          </div>
        </main>
      </div>
    </ProposalEditableProvider>
  );
}
