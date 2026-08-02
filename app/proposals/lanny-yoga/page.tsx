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

export default function LannyYogaProposalPage() {
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Commercial Defense & Admin Bypass State
  const [isAdminBypass, setIsAdminBypass] = useState(false);

  // Proposal Effective Date
  const CREATED_AT = "2026-08-02";
  const [lifecycleState, setLifecycleState] = useState<{ stage: string; daysDiff: number }>(
    calculateProposalLifecycle(CREATED_AT)
  );

  useEffect(() => {
    sendProposalAuditTrack("lanny-yoga", "PAGE_VISITED_SESSION").then((res) => {
      if (res && res.lifecycle) {
        setLifecycleState(res.lifecycle);
      }
    });
  }, []);

  // 3-Stage Lifecycle: Stage 3 (ARCHIVED_404 > 10 Days) & Manual Closure
  if (!isAdminBypass && (lifecycleState.stage === "ARCHIVED_404" || lifecycleState.stage === "MANUALLY_CLOSED")) {
    return (
      <div className="w-full min-h-screen bg-[#FAF6F0] text-stone-700 flex flex-col justify-center items-center p-6 text-center font-sans">
        <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-amber-200 shadow-sm">
          🔒
        </div>
        <h1 className="text-3xl font-bold mb-2 text-stone-900">404 — 專案頁面已隱蔽歸檔</h1>
        <p className="text-sm text-stone-600 max-w-md mx-auto leading-relaxed mb-6">
          {lifecycleState.stage === "MANUALLY_CLOSED"
            ? "本專案報價單已由系統管理員手動封存歸檔。若需重新開啓或調閱歷史數據，請聯繫專案負責人。"
            : "本專案報價單已超過有效議價與展示期，系統已自動執行商業隱蔽歸檔。"}
        </p>
        <div className="text-xs text-amber-800 bg-amber-50 px-4 py-2 rounded-xl border border-amber-200">
          專案代碼：lanny-yoga ｜ Lanny Yoga Studio 瑜伽教室
        </div>
      </div>
    );
  }

  // Invoice & Remittance Form State
  const [companyName, setCompanyName] = useState("Lanny Yoga Studio 瑜伽教室");
  const [taxId, setTaxId] = useState("");
  const [invoiceAddress, setInvoiceAddress] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [remittanceBank5, setRemittanceBank5] = useState("");
  const [remittanceName, setRemittanceName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Selected Plan State: 'starter' (3.88萬) | 'flagship' (5.88萬)
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "flagship">("flagship");

  // Calculation for Deposit and Balance
  const basePrice = selectedPlan === "flagship" ? 58800 : 38800;
  const depositAmount = basePrice * 0.5; // 50% 訂金
  const balanceAmount = basePrice * 0.5; // 50% 尾款
  const depositTaxed = depositAmount * 1.05;
  const balanceTaxed = balanceAmount * 1.05;

  // Passwords: Today (20260802 / 0802)
  const VALID_PASSWORDS = ["20260802", "0802", "20260729", "0729"];

  // Security Hooks
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
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("admin") === "87257257") {
        setIsAdminBypass(true);
        setIsUnlocked(true);
      }
    }

    const unlocked = sessionStorage.getItem("proposal_unlocked_lanny_yoga");
    if (unlocked === "true") {
      setIsUnlocked(true);
      sendProposalAuditTrack("lanny-yoga", "PAGE_VISITED_SESSION");
    }
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (VALID_PASSWORDS.includes(password.trim())) {
      setIsUnlocked(true);
      sessionStorage.setItem("proposal_unlocked_lanny_yoga", "true");
      setErrorMsg("");
      sendProposalAuditTrack("lanny-yoga", "PASSWORD_UNLOCKED");
    } else {
      setErrorMsg("密碼不正確，請重新輸入（提示：本日日期 20260802 或 0802）");
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

      await sendProposalAuditTrack("lanny-yoga", "SUBMIT_INVOICE_INFO", infoData);
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
    <ProposalEditableProvider slug="lanny-yoga">
      <div className="min-h-screen bg-[#FAF6F0] text-stone-800 font-sans relative selection:bg-[#D4A373] selection:text-white pb-24">
        {/* Security overlays */}
        <SecurityWatermarkOverlay />
        {isAdminBypass && <OwnerBypassBanner />}
        <FraudAlertAndDomainVerifier />

        {/* Lock Screen Modal */}
        {!isUnlocked && (
          <div className="fixed inset-0 z-[999] bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white border border-stone-200 rounded-3xl p-8 shadow-2xl text-center">
              <div className="w-16 h-16 bg-amber-50 text-amber-800 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 border border-amber-100 shadow-sm">
                🧘
              </div>
              <h2 className="text-2xl font-bold font-serif text-stone-900 mb-1">Lanny Yoga Studio — 專案報價單</h2>
              <p className="text-xs text-stone-500 mb-6 leading-relaxed">
                【LINE 官方帳號 ＋ LINE BOT ＋ LIFF 獨立官網】數位品牌升級建置案
              </p>
              <form onSubmit={handleUnlock} className="space-y-4">
                <input
                  type="password"
                  placeholder="請輸入密碼 (本日日期)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-center text-lg focus:outline-none focus:border-amber-600 focus:bg-white text-stone-800 placeholder-stone-400 transition"
                  autoFocus
                />
                {errorMsg && <p className="text-xs text-rose-500 font-medium">{errorMsg}</p>}
                <button
                  type="submit"
                  className="w-full py-3 bg-[#5C504A] hover:bg-[#4A403B] text-white font-bold rounded-xl shadow-md transition"
                >
                  解鎖進入報價單
                </button>
              </form>
              <p className="text-[10px] text-stone-400 mt-4">提示：本日日期 20260802 或 0802</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="max-w-5xl mx-auto px-4 pt-10">
          {/* Header Banner - Warm Morandi Aesthetic */}
          <div className="bg-gradient-to-br from-white via-[#FDFBF7] to-[#F5EFE6] rounded-3xl p-8 border border-stone-200/80 shadow-md mb-8 relative overflow-hidden animate-fade-in-up">
            <div className="absolute -right-12 -bottom-12 opacity-[0.05] text-[200px] pointer-events-none select-none text-stone-900">
              🧘
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/90 rounded-full border border-stone-300 text-xs font-semibold text-amber-900 mb-3 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
                <EditableText id="client_tag" defaultText="Lanny Yoga Studio ｜ Lanny 老師專屬客製" />
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold font-serif text-stone-900 tracking-tight leading-tight mb-3">
                <EditableText id="proposal_title" defaultText="【LINE 官方帳號 ＋ LINE BOT ＋ LIFF 獨立官網】數位品牌建置案" />
              </h1>
              <p className="text-sm text-stone-600 max-w-2xl leading-relaxed">
                <EditableText
                  id="proposal_subtitle"
                  defaultText="專為 Lanny Yoga Studio 瑜伽教室量身打造！結合 LINE 富選單、LIFF 免下載預約官網、自動算效期課券對帳系統，以及 Gemini AI 雙向文案與 5 大視覺風格 HD 配圖小編。"
                />
              </p>
            </div>
          </div>

          {/* Customer & Proposal Meta Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs uppercase font-bold text-amber-800 tracking-wider mb-4 flex items-center gap-2">
                <span>🏢</span> 客戶對象資訊 (CLIENT)
              </h3>
              <div className="space-y-2 text-sm text-stone-700">
                <div className="flex justify-between border-b border-stone-100 pb-1.5">
                  <span className="text-stone-500">教室名稱</span>
                  <span className="font-semibold text-stone-900">
                    <EditableText id="client_name" defaultText="Lanny Yoga Studio 瑜伽教室" />
                  </span>
                </div>
                <div className="flex justify-between border-b border-stone-100 pb-1.5">
                  <span className="text-stone-500">代表人物</span>
                  <span className="font-medium text-stone-900">
                    <EditableText id="client_owner" defaultText="Lanny 老師" />
                  </span>
                </div>
                <div className="flex justify-between border-b border-stone-100 pb-1.5">
                  <span className="text-stone-500">獨立網域定位</span>
                  <span className="font-mono text-amber-800 font-medium">booking.lanny-yoga.com</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-stone-500">產業領域</span>
                  <span className="text-xs font-semibold text-amber-900">正念陰瑜珈 / 哈達瑜伽 / Barre 雕塑 / 體態指引</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs uppercase font-bold text-amber-800 tracking-wider mb-4 flex items-center gap-2">
                <span>📑</span> 報價與專案資訊 (PROPOSAL)
              </h3>
              <div className="space-y-2 text-sm text-stone-700">
                <div className="flex justify-between border-b border-stone-100 pb-1.5">
                  <span className="text-stone-500">專案編號</span>
                  <span className="font-mono text-amber-800 font-medium">LY-202608-AI01</span>
                </div>
                <div className="flex justify-between border-b border-stone-100 pb-1.5">
                  <span className="text-stone-500">報價日期</span>
                  <span>2026 年 08 月 02 日</span>
                </div>
                <div className="flex justify-between border-b border-stone-100 pb-1.5">
                  <span className="text-stone-500">建置預算區間</span>
                  <span className="font-bold text-amber-700">NT$ 38,800 ~ 58,800</span>
                </div>
                <div className="flex justify-between border-b border-stone-100 pb-1.5">
                  <span className="text-stone-500">預估建置工期</span>
                  <span>1 ~ 2 週 (包含驗收上線與 1 對 1 教培)</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-stone-500">規劃顧問</span>
                  <span className="text-xs font-semibold text-amber-900">奕暢 🌞 / iVan3514</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Pain Points vs Solution Comparison */}
          <div className="bg-white border border-stone-200/80 rounded-3xl p-8 shadow-sm mb-12">
            <h2 className="text-xl font-bold font-serif text-stone-900 mb-2 flex items-center gap-2">
              <span>💡</span> 營運痛點對照與系統解決方案 (Pain Point Transformation)
            </h2>
            <p className="text-xs text-stone-500 mb-6">從傳統人工訊息洗板，升級為 24HR 全自動化 LINE 智慧數位總管</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-rose-50/60 border border-rose-100 rounded-2xl p-5 space-y-3">
                <h4 className="font-bold text-rose-900 text-sm flex items-center gap-2 border-b border-rose-200/60 pb-2">
                  <span>❌</span> 傳統人工經營痛點
                </h4>
                <ul className="text-xs text-rose-800 space-y-2 leading-relaxed">
                  <li>• 每天下班還要花 2~3 小時在 LINE 訊息私訊裡處理學員預約與請假</li>
                  <li>• 手動對帳易錯漏，多堂方案與體驗課的到期日計算複雜易生糾紛</li>
                  <li>• 每月花上萬元請外包小編，還常常找不到貼合教室溫暖質感的照片</li>
                  <li>• 第三方平台網址缺乏專屬感，學員資料被扣在別人平台池子裡</li>
                </ul>
              </div>

              <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-5 space-y-3">
                <h4 className="font-bold text-amber-900 text-sm flex items-center gap-2 border-b border-amber-200/60 pb-2">
                  <span>✨</span> Lanny 智慧總管解決方案
                </h4>
                <ul className="text-xs text-amber-800 space-y-2 leading-relaxed">
                  <li>• LIFF 官網學員免下載即可預約，開課前 2 小時 LINE 自動叮咚提醒</li>
                  <li>• 轉帳後五碼即時核對，一鍵確認自動發算 1 個月/3 個月效期憑證</li>
                  <li>• 內建 Gemini AI 行銷小編，常駐 5 大風格（莫蘭迪柔和/極簡日光/日系唯美...）自動畫 HD 配圖</li>
                  <li>• 100% 獨立專屬網域與獨立 Supabase 雲端資料庫，顧客資產 100% 掌握</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section: 8 Core System Modules */}
          <div className="mb-12">
            <h2 className="text-xl font-bold font-serif text-stone-900 mb-2 flex items-center gap-2">
              <span>🚀</span> 專案建置 8 大核心系統功能模組 (Scope & Deliverables)
            </h2>
            <p className="text-xs text-stone-500 mb-6">完整複製 Lanny Yoga Studio 頂級營運架構，一站式搞定教務、財務與 AI 行銷</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  title: "1. 👥 學員與課券 CRM 中心",
                  desc: "學員歷史歷程卡、獨立有效堂數精算 (過期自動過濾)、`repair_credits` 數據防漂移校正、手動撥補發券、LINE 單獨私訊與課堂廣播。",
                },
                {
                  title: "2. 📅 多模式課表與點名系統",
                  desc: "月曆/週曆/單日排課視窗、名額上限控管 (Capacity)、3 天保護期內課堂點名與出席狀態標記、簽到自動扣券。",
                },
                {
                  title: "3. 💳 方案訂單與財務對帳",
                  desc: "學員轉帳後五碼即時亮燈核對、一鍵「確認收款」自動呼叫 `grant_credit_lot()` 算效期發券，自動傳送 LINE 收條憑證。",
                },
                {
                  title: "4. 📊 營運分析與時段熱力圖",
                  desc: "預估/預約/實現三口徑營收分析、過去 6 個月熱門時段熱力圖、12 個月歷史比較 (手刻輕量化 SVG 圖表，免負擔重型套件)。",
                },
                {
                  title: "5. 🛍️ 嚴選商城與實體訂單",
                  desc: "瑜伽輔具與周邊商品目錄管理 (多圖、價格、庫存、上下架開關)、購物訂單處理與出貨物流單號追蹤。",
                },
                {
                  title: "6. 🖼️ 網站內容模組化維護",
                  desc: "教室與品牌簡介 (安全銀行帳號管理)、老師經歷與形象照網址設定、課程類型 (難度星等/預設時長/簡介)。",
                },
                {
                  title: "7. 🤖 LINE 與 AI 助手全方位整合",
                  desc: "富選單設計對接、Gemini AI 行銷文案、常駐 5 大視覺風格 (莫蘭迪柔和/極簡日光/陽光自然/日系唯美/抽象水彩) HD 配圖小編、8 項實體叮咚推播過濾過濾。",
                },
                {
                  title: "8. 📮 合作邀約與企業包班",
                  desc: "網站訪客與企業包班/品牌合作表單收件匣、處理進度標記與備忘追蹤筆記。",
                },
              ].map((mod, idx) => (
                <div key={idx} className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-2xs space-y-1.5">
                  <h3 className="font-bold text-stone-900 text-sm">{mod.title}</h3>
                  <p className="text-xs text-stone-600 leading-relaxed">{mod.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Interactive Dual Plan Pricing */}
          <div className="bg-white border border-stone-200/80 rounded-3xl p-8 shadow-sm mb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-stone-100 pb-4">
              <div>
                <h2 className="text-xl font-bold font-serif text-stone-900 flex items-center gap-2">
                  <span>💰</span> 建置方案選擇與價格試算 (Interactive Pricing Matrix)
                </h2>
                <p className="text-xs text-stone-500 mt-1">請選擇最符合貴教室需求的建置方案（點擊切換查看試算）：</p>
              </div>
              <div className="inline-flex rounded-xl bg-stone-100 p-1 border border-stone-200 self-start md:self-auto">
                <button
                  type="button"
                  onClick={() => setSelectedPlan("starter")}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                    selectedPlan === "starter"
                      ? "bg-white text-stone-900 shadow-sm"
                      : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  精緻單店專屬版 ($3.88萬)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPlan("flagship")}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                    selectedPlan === "flagship"
                      ? "bg-[#5C504A] text-white shadow-sm"
                      : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  👑 品牌旗艦 AI 尊榮版 ($5.88萬)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Starter Plan Box */}
              <div
                onClick={() => setSelectedPlan("starter")}
                className={`cursor-pointer rounded-2xl p-6 border transition-all ${
                  selectedPlan === "starter"
                    ? "bg-amber-50/40 border-amber-600 ring-2 ring-amber-600/20 shadow-md"
                    : "bg-white border-stone-200 hover:border-stone-300"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-stone-900 text-lg">精緻單店專屬版</h3>
                    <p className="text-xs text-stone-500">適合獨立老師 / 個人預約工作室</p>
                  </div>
                  <span className="text-xl font-bold font-mono text-stone-900">NT$ 38,800</span>
                </div>
                <ul className="text-xs text-stone-600 space-y-2 border-t border-stone-200/60 pt-3">
                  <li>✔ 100% 獨立專屬網域綁定</li>
                  <li>✔ LINE BOT ＋ LIFF 官網預約系統</li>
                  <li>✔ 學員 CRM 與轉帳自動對帳算效期</li>
                  <li>✔ 基礎 LINE 富選單圖文設計</li>
                  <li>✔ 基礎 8 項叮咚推播設定</li>
                </ul>
              </div>

              {/* Flagship Plan Box */}
              <div
                onClick={() => setSelectedPlan("flagship")}
                className={`cursor-pointer rounded-2xl p-6 border transition-all relative overflow-hidden ${
                  selectedPlan === "flagship"
                    ? "bg-[#FAF6F0] border-amber-700 ring-2 ring-amber-700/20 shadow-md"
                    : "bg-white border-stone-200 hover:border-stone-300"
                }`}
              >
                <div className="absolute top-0 right-0 bg-amber-700 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                  官方推薦 👑
                </div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-stone-900 text-lg">品牌旗艦 AI 尊榮全功能版</h3>
                    <p className="text-xs text-stone-500">適合瑜伽館 / 中型美業沙龍 / 多位師資團隊</p>
                  </div>
                  <span className="text-xl font-bold font-mono text-amber-800">NT$ 58,800</span>
                </div>
                <ul className="text-xs text-stone-700 space-y-2 border-t border-stone-200/60 pt-3 font-medium">
                  <li>★ 包含精緻版全部功能</li>
                  <li>★ **Gemini AI 雙向行銷小編** (IG貼文 + 課程簡介)</li>
                  <li>★ **常駐 5 大美業/瑜伽視覺風格** (莫蘭迪/極簡/日系...)</li>
                  <li>★ **AI 高清圖片生成與實體預覽視窗**</li>
                  <li>★ 嚴選商城與實體商品訂單模組</li>
                  <li>★ 營運分析與過去 6 個月時段熱力圖</li>
                  <li>★ 1 對 1 教務實機培訓與優先技術支援</li>
                </ul>
              </div>
            </div>

            {/* Price Breakdown Calculation Box */}
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6">
              <h4 className="font-bold text-stone-900 text-sm mb-3 flex items-center justify-between">
                <span>分期結算與稅額精算（已選：{selectedPlan === "flagship" ? "品牌旗艦 AI 尊榮版" : "精緻單店專屬版"}）</span>
                <span className="text-xs text-stone-500 font-normal">營運與 AI 雲端月費：NT$ 1,200 / 月 (年繳 NT$ 12,000)</span>
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-white p-3 rounded-xl border border-stone-200">
                  <span className="text-[11px] text-stone-500 block">專案建置總額</span>
                  <span className="text-base font-bold font-mono text-stone-900">NT$ {basePrice.toLocaleString()}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-stone-200">
                  <span className="text-[11px] text-stone-500 block">首期 50% 訂金</span>
                  <span className="text-base font-bold font-mono text-amber-800">NT$ {depositAmount.toLocaleString()}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-stone-200">
                  <span className="text-[11px] text-stone-500 block">尾款 50% (驗收後)</span>
                  <span className="text-base font-bold font-mono text-stone-700">NT$ {balanceAmount.toLocaleString()}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-stone-200">
                  <span className="text-[11px] text-stone-500 block">含 5% 營業稅 (訂金)</span>
                  <span className="text-base font-bold font-mono text-stone-800">NT$ {Math.round(depositTaxed).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Remittance Bank Info & Checkout Form */}
          <div className="bg-white border border-stone-200/80 rounded-3xl p-8 shadow-sm mb-12">
            <h2 className="text-xl font-bold font-serif text-stone-900 mb-2 flex items-center gap-2">
              <span>💳</span> 匯款對帳帳戶與開票資訊確認
            </h2>
            <p className="text-xs text-stone-500 mb-6">請於匯款首期訂金後填寫下方欄位，系統將即時發送通知至專案團隊對帳。</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Remittance Bank Info Box */}
              <div className="bg-[#FAF6F0] border border-amber-200 rounded-2xl p-6 space-y-3">
                <h3 className="font-bold text-amber-900 text-sm flex items-center gap-2 border-b border-amber-200/80 pb-2">
                  🏦 指定匯款銀行帳戶
                </h3>
                <div className="space-y-2 text-xs text-stone-700">
                  <div className="flex justify-between">
                    <span className="text-stone-500">銀行名稱</span>
                    <span className="font-bold text-stone-900">國泰世華銀行 (013)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">分行名稱</span>
                    <span>館前分行</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">戶名</span>
                    <span className="font-bold text-stone-900">奕暢數位創意有限公司</span>
                  </div>
                  <div className="flex justify-between border-t border-amber-200/60 pt-2">
                    <span className="text-stone-500">匯款帳號</span>
                    <span className="font-mono font-bold text-amber-900 text-sm tracking-wider">013-03-500888-9</span>
                  </div>
                </div>
              </div>

              {/* Invoice Form Form */}
              <form onSubmit={handleSaveInvoiceInfo} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">開票抬頭 (公司/教室全銜)</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="請輸入公司或教室抬頭"
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">統一編號 (無統編填無)</label>
                    <input
                      type="text"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      placeholder="例: 88888888"
                      className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">匯款帳號後五碼</label>
                    <input
                      type="text"
                      value={remittanceBank5}
                      onChange={(e) => setRemittanceBank5(e.target.value)}
                      placeholder="例: 12345"
                      className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-stone-800 outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">通知與電子發票 Email</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="例: lanny@example.com"
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || isSaved}
                  className="w-full py-3 bg-[#5C504A] hover:bg-[#4A403B] disabled:bg-stone-300 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  {isSaved ? "✅ 對帳與開票資訊已確認送出" : isSubmitting ? "確認中..." : "送出對帳與開票資訊"}
                </button>
              </form>
            </div>

            {/* Print & Signature Section */}
            <PrintSignatureSection />
          </div>
        </main>
      </div>
    </ProposalEditableProvider>
  );
}
