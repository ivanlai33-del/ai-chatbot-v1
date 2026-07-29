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
  const [currentSlide, setCurrentSlide] = useState(0);

  // Commercial Defense & Admin Bypass State
  const [isAdminBypass, setIsAdminBypass] = useState(false);
  const [isForeignOrVpn, setIsForeignOrVpn] = useState(false);

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
      <div className="w-full min-h-screen bg-[#0E241B] text-emerald-100 flex flex-col justify-center items-center p-6 text-center font-sans">
        <div className="w-16 h-16 bg-emerald-950/80 text-emerald-400 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-emerald-700/50">
          🔒
        </div>
        <h1 className="text-3xl font-black mb-2 text-white">404 — 專案頁面已隱蔽歸檔</h1>
        <p className="text-sm text-emerald-300 max-w-md mx-auto leading-relaxed mb-6">
          {lifecycleState.stage === "MANUALLY_CLOSED"
            ? "本專案報價單已由系統管理員手動封存歸檔。若需重新開啓或調閱歷史數據，請聯繫專案負責人。"
            : "本專案報價單已超過 10 天有效議價與展示期，系統已自動執行商業隱蔽歸檔。"}
        </p>
        <div className="text-xs text-emerald-500 bg-emerald-900/40 px-4 py-2 rounded-xl border border-emerald-800/40">
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
  const [copySuccess, setCopySuccess] = useState(false);
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
    const amount = selectedPlan === "flagship" ? 3675 : 2625; // 3,500 + 5% = 3,675 / 2,500 + 5% = 2,625
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
      <div className="min-h-screen bg-[#0D1F17] text-slate-100 font-sans relative selection:bg-[#2E7D32] selection:text-white pb-24">
        {/* Security overlays */}
        <SecurityWatermarkOverlay />
        {isAdminBypass && <OwnerBypassBanner />}
        <FraudAlertAndDomainVerifier />

        {/* Lock Screen Modal */}
        {!isUnlocked && (
          <div className="fixed inset-0 z-[999] bg-[#0A1610]/95 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-[#132A20] border border-[#2E7D32]/40 rounded-3xl p-8 shadow-2xl text-center">
              <div className="w-16 h-16 bg-[#1B4332] text-[#A5D6A7] rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-[#2E7D32]">
                🌾
              </div>
              <h2 className="text-2xl font-bold font-serif text-white mb-2">祥惠有限公司 — 專案報價單</h2>
              <p className="text-xs text-emerald-300/80 mb-6 leading-relaxed">
                本提案書包含 AI 畜牧店長、業務白名單廣播系統與互動架構，請輸入存取密碼解鎖檢視。
              </p>
              <form onSubmit={handleUnlock} className="space-y-4">
                <input
                  type="password"
                  placeholder="請輸入密碼 (統編或本日日期)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0A1610] border border-[#2E7D32]/50 rounded-xl text-center text-lg focus:outline-none focus:border-[#4CAF50] text-emerald-100 placeholder-emerald-700"
                  autoFocus
                />
                {errorMsg && <p className="text-xs text-rose-400">{errorMsg}</p>}
                <button
                  type="submit"
                  className="w-full py-3 bg-[#2E7D32] hover:bg-[#1B4332] text-white font-bold rounded-xl shadow-lg shadow-emerald-950 transition"
                >
                  解鎖進入報價單
                </button>
              </form>
              <p className="text-[10px] text-emerald-600 mt-4">提示：貴司統編 23215860 或 本日日期 20260729</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="max-w-5xl mx-auto px-4 pt-10">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#1B4332] via-[#2E7D32] to-[#132A20] rounded-3xl p-8 border border-[#4CAF50]/30 shadow-2xl mb-8 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 opacity-10 text-[180px] pointer-events-none select-none">
              🐓🐖
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0D1F17]/60 rounded-full border border-emerald-400/30 text-xs text-emerald-300 mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                祥惠有限公司 專屬線上報價單
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold font-serif text-white tracking-tight leading-tight mb-3">
                AI 畜牧店長 & 業務白名單廣播系統建置案
              </h1>
              <p className="text-sm text-emerald-200/90 max-w-2xl leading-relaxed">
                專為祥惠有限公司（雞、豬畜牧養殖與營養品/防疫）量身打造！整合 LINE 官方帳號三大一般客戶互動模式，並配備內部業務人員專屬白名單獨立頻道與後台管理。
              </p>
            </div>
          </div>

          {/* Customer & Proposal Meta Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-[#132A20] border border-[#2E7D32]/30 rounded-2xl p-6 shadow-md">
              <h3 className="text-xs uppercase font-bold text-emerald-400 tracking-wider mb-4 flex items-center gap-2">
                <span>🏢</span> 客戶對象資訊 (CLIENT)
              </h3>
              <div className="space-y-2 text-sm text-emerald-100">
                <div className="flex justify-between border-b border-emerald-900/40 pb-1">
                  <span className="text-emerald-400">公司名稱</span>
                  <span className="font-semibold text-white">祥惠有限公司</span>
                </div>
                <div className="flex justify-between border-b border-emerald-900/40 pb-1">
                  <span className="text-emerald-400">統一編號</span>
                  <span className="font-mono text-emerald-200">23215860</span>
                </div>
                <div className="flex justify-between border-b border-emerald-900/40 pb-1">
                  <span className="text-emerald-400">聯絡電話</span>
                  <span>04-8531155</span>
                </div>
                <div className="flex justify-between border-b border-emerald-900/40 pb-1">
                  <span className="text-emerald-400">公司地址</span>
                  <span className="text-xs">彰化縣大村鄉加錫村加錫三巷5-28號</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-emerald-400">服務目標</span>
                  <span className="text-xs font-semibold text-amber-300">雞隻（白肉/蛋/土/種雞）與豬隻養殖戶</span>
                </div>
              </div>
            </div>

            <div className="bg-[#132A20] border border-[#2E7D32]/30 rounded-2xl p-6 shadow-md">
              <h3 className="text-xs uppercase font-bold text-emerald-400 tracking-wider mb-4 flex items-center gap-2">
                <span>📑</span> 報價與專案資訊 (PROPOSAL)
              </h3>
              <div className="space-y-2 text-sm text-emerald-100">
                <div className="flex justify-between border-b border-emerald-900/40 pb-1">
                  <span className="text-emerald-400">專案編號</span>
                  <span className="font-mono text-emerald-200">XH-202607-AI01</span>
                </div>
                <div className="flex justify-between border-b border-emerald-900/40 pb-1">
                  <span className="text-emerald-400">報價日期</span>
                  <span>2026 年 07 月 29 日</span>
                </div>
                <div className="flex justify-between border-b border-emerald-900/40 pb-1">
                  <span className="text-emerald-400">建議預算區間</span>
                  <span className="font-bold text-amber-400">NT$ 50,000 ~ 70,000</span>
                </div>
                <div className="flex justify-between border-b border-emerald-900/40 pb-1">
                  <span className="text-emerald-400">預估建置工期</span>
                  <span>3 ~ 4 週</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-emerald-400">規劃顧問</span>
                  <span className="text-xs font-semibold text-emerald-300">奕暢 🌞 / iVan3514</span>
                </div>
              </div>
            </div>
          </div>

          {/* Core Feature Matrix */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold font-serif text-white mb-2 flex items-center gap-2">
              <span>🌾</span> 核心功能規劃與系統架構
            </h2>
            <p className="text-xs text-emerald-300/80 mb-6">
              結合一般農場客戶的三大互動模式、業務人員白名單獨立頻道與完整的後台管理機制。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="bg-[#132A20] border border-[#2E7D32]/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="w-10 h-10 bg-[#1B4332] text-emerald-300 rounded-xl flex items-center justify-center font-bold text-lg mb-4 border border-[#4CAF50]/30">
                  📱
                </div>
                <h3 className="text-lg font-bold text-white mb-2">1. 一般客戶三大互動模式</h3>
                <ul className="text-xs text-emerald-200/90 space-y-2 leading-relaxed">
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-400">▶</span>
                    <span><strong>富圖文選單 (Rich Menu)</strong>：直覺點選「雞隻專區」、「豬隻專區」、「營養品/防疫計畫」、「公司資訊」。</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-400">▶</span>
                    <span><strong>語言互動與卡片/PDF拉出</strong>：客戶輸入「豬」或「蛋雞營養品」，AI 店長自動拉出多圖產品卡片與 PDF 手冊。</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-400">▶</span>
                    <span><strong>洽詢表單與門市資訊</strong>：線上留下規模與需求表單，兼具地址、電話與公司導覽。</span>
                  </li>
                </ul>
              </div>

              {/* Feature 2 */}
              <div className="bg-[#132A20] border border-[#2E7D32]/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="w-10 h-10 bg-[#1B4332] text-amber-300 rounded-xl flex items-center justify-center font-bold text-lg mb-4 border border-[#4CAF50]/30">
                  🔐
                </div>
                <h3 className="text-lg font-bold text-white mb-2">2. 業務白名單與內部推播</h3>
                <ul className="text-xs text-emerald-200/90 space-y-2 leading-relaxed">
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-400">▶</span>
                    <span><strong>內部業務白名單 (4~6人)</strong>：自動辨識業務身分，解鎖業務專屬圖文選單與筆記功能。</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-400">▶</span>
                    <span><strong>內部訊息獨立推播</strong>：公司內部消息、緊急通知只推播給自家業務，<strong>不干擾公頻</strong>。</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-400">▶</span>
                    <span><strong>牧場週期與回購提醒</strong>：記錄客戶物種與進場週數，週定時提醒業務關懷客戶。</span>
                  </li>
                </ul>
              </div>

              {/* Feature 3 */}
              <div className="bg-[#132A20] border border-[#2E7D32]/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="w-10 h-10 bg-[#1B4332] text-emerald-300 rounded-xl flex items-center justify-center font-bold text-lg mb-4 border border-[#4CAF50]/30">
                  ⚙️
                </div>
                <h3 className="text-lg font-bold text-white mb-2">3. 後台管理與廣播系統</h3>
                <ul className="text-xs text-emerald-200/90 space-y-2 leading-relaxed">
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-400">▶</span>
                    <span><strong>業務名單權限控制</strong>：後台隨時新增/移除業務 LINE 白名單。</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-400">▶</span>
                    <span><strong>雙頻道廣播引擎</strong>：自由切換「內部業務廣播」或「公開客戶廣播」。</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-400">▶</span>
                    <span><strong>表單派單與 AI 知識庫</strong>：即時檢視農場客戶洽詢名單，支援上傳最新產品 PDF 訓練 AI。</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Pricing Plans Selection */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold font-serif text-white mb-2 flex items-center gap-2">
              <span>💎</span> 建議建置方案 (雙版本規劃)
            </h2>
            <p className="text-xs text-emerald-300/80 mb-6">
              請點擊選擇符合祥惠有限公司需求之方案，金額皆透明公開。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Plan Starter */}
              <div
                onClick={() => setSelectedPlan("starter")}
                className={`cursor-pointer rounded-3xl p-8 border-2 transition-all relative flex flex-col justify-between ${
                  selectedPlan === "starter"
                    ? "bg-[#1B4332] border-[#4CAF50] shadow-2xl shadow-emerald-950 scale-[1.02]"
                    : "bg-[#132A20] border-[#2E7D32]/40 opacity-80 hover:opacity-100"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-xs font-bold px-3 py-1 bg-emerald-950 text-emerald-400 rounded-full border border-emerald-800">
                        方案 A
                      </span>
                      <h3 className="text-2xl font-black text-white mt-2">【標準農業管家版】</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-extrabold text-white">NT$ 58,000</span>
                      <span className="text-xs text-emerald-300 block">一次性建置費 (未稅)</span>
                    </div>
                  </div>

                  <p className="text-xs text-emerald-200 mb-6 pb-4 border-b border-emerald-800/60 leading-relaxed">
                    適合基礎建置，包含一般客戶基本問答、圖文選單、基礎洽詢表單與 6 人業務白名單。
                  </p>

                  <ul className="text-xs text-emerald-100 space-y-2 mb-8">
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span> 一般客戶 3 種互動（圖文選單 + 關鍵字卡片 + 洽詢表單）
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span> 業務白名單管理（最多 6 位業務人員）
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span> 內部獨立訊息推播（不干擾公頻）
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span> 基礎物種分類與週期提醒模板
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-emerald-800/60 flex justify-between items-center text-xs">
                  <span className="text-emerald-300">月費（維運/AI對話費）：</span>
                  <span className="font-bold text-amber-300">NT$ 2,500 / 月 (含稅 2,625)</span>
                </div>
              </div>

              {/* Plan Flagship (Recommended) */}
              <div
                onClick={() => setSelectedPlan("flagship")}
                className={`cursor-pointer rounded-3xl p-8 border-2 transition-all relative flex flex-col justify-between ${
                  selectedPlan === "flagship"
                    ? "bg-[#1B4332] border-amber-400 shadow-2xl shadow-amber-950/30 scale-[1.02]"
                    : "bg-[#132A20] border-[#2E7D32]/40 opacity-80 hover:opacity-100"
                }`}
              >
                {selectedPlan === "flagship" && (
                  <div className="absolute -top-3.5 right-8 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-wider shadow">
                    ⭐ 專案推薦首選
                  </div>
                )}
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-xs font-bold px-3 py-1 bg-amber-950/80 text-amber-400 rounded-full border border-amber-800">
                        方案 B
                      </span>
                      <h3 className="text-2xl font-black text-white mt-2">【旗艦 AI 智慧畜牧店長】</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-extrabold text-amber-300">NT$ 68,000</span>
                      <span className="text-xs text-emerald-300 block">一次性建置費 (未稅)</span>
                    </div>
                  </div>

                  <p className="text-xs text-emerald-200 mb-6 pb-4 border-b border-emerald-800/60 leading-relaxed">
                    完整涵蓋 AI PDF 手冊智慧檢索、15 人業務白名單、動態週期筆記與雙頻道廣播後台。
                  </p>

                  <ul className="text-xs text-emerald-100 space-y-2 mb-8">
                    <li className="flex items-center gap-2">
                      <span className="text-amber-400">★</span> 全功能一般客戶 3 種互動（自動辨識拉出 PDF 訊息與卡片）
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-amber-400">★</span> 高階業務白名單管理（最多 15 位業務人員 + 派單記錄）
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-amber-400">★</span> 後台雙頻道獨立廣播引擎（內部業務廣播 vs 公開客戶廣播）
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-amber-400">★</span> 雞/豬物種動態牧場週期提醒與 AI 隨機疾病問答庫
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-emerald-800/60 flex justify-between items-center text-xs">
                  <span className="text-emerald-300">月費（高階AI模型與維運）：</span>
                  <span className="font-bold text-amber-300">NT$ 3,500 / 月 (含稅 3,675)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form & Invoice Checkout Section */}
          <div className="bg-[#132A20] border border-[#2E7D32]/50 rounded-3xl p-8 shadow-2xl mb-12">
            <h2 className="text-xl font-bold font-serif text-white mb-2 flex items-center gap-2">
              <span>💳</span> 線上對帳與發票資料確認
            </h2>
            <p className="text-xs text-emerald-300/80 mb-6">
              請核對貴司抬頭與統編，完成資料確認後可直接進行藍新金流線上月費訂閱或銀行匯款對帳。
            </p>

            <form onSubmit={handleSaveInvoiceInfo} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-emerald-300 mb-1">公司發票抬頭</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0D1F17] border border-[#2E7D32]/60 rounded-xl text-emerald-100 text-sm focus:outline-none focus:border-[#4CAF50]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-emerald-300 mb-1">統一編號</label>
                <input
                  type="text"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0D1F17] border border-[#2E7D32]/60 rounded-xl text-emerald-100 text-sm focus:outline-none focus:border-[#4CAF50]"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-emerald-300 mb-1">發票寄送地址</label>
                <input
                  type="text"
                  value={invoiceAddress}
                  onChange={(e) => setInvoiceAddress(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0D1F17] border border-[#2E7D32]/60 rounded-xl text-emerald-100 text-sm focus:outline-none focus:border-[#4CAF50]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-emerald-300 mb-1">匯款銀行帳號後 5 碼 (匯款對帳用)</label>
                <input
                  type="text"
                  placeholder="例如: 88219"
                  value={remittanceBank5}
                  onChange={(e) => setRemittanceBank5(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0D1F17] border border-[#2E7D32]/60 rounded-xl text-emerald-100 text-sm focus:outline-none focus:border-[#4CAF50]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-emerald-300 mb-1">聯絡 Email</label>
                <input
                  type="email"
                  placeholder="contact@xianghui.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0D1F17] border border-[#2E7D32]/60 rounded-xl text-emerald-100 text-sm focus:outline-none focus:border-[#4CAF50]"
                />
              </div>

              <div className="md:col-span-2 flex flex-col md:flex-row gap-4 mt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-[#2E7D32] hover:bg-[#1B4332] text-white font-bold rounded-xl shadow-lg transition text-sm flex items-center justify-center gap-2"
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

            <PrintSignatureSection proposalTitle="祥惠有限公司 — AI 畜牧店長 & 業務白名單廣播系統建置案" />
          </div>
        </main>
      </div>
    </ProposalEditableProvider>
  );
}
