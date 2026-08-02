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

// Speaker Notes for html-ppt-skill Presenter Mode
const SPEAKER_NOTES = [
  "【專案總覽】強調專屬視覺風格與免下載 LIFF 官網。引導 Lanny 老師關注預算區間 3.88萬 ~ 5.88萬 與 1~2 週高效上線週期。",
  "【痛點解方】突出現有手動算堂數、LINE 訊息過多與社群貼文外包成本昂貴。展示 Gemini AI 小編如何替老師節省時間與金錢。",
  "【8大功能模組】展示全方位系統建置範圍：教務 (課表點名/到期過濾)、財務 (對帳發券)、AI (貼文+莫蘭迪等5大風格畫圖)。",
  "【方案比較】比較精緻版 ($38,800) 與品牌旗艦 AI 版 ($58,800)。重點推薦旗艦版內建 Gemini AI 圖片與貼文小編。",
  "【費用試算】說明首期 50% 訂金 + 線上驗收 50% 尾款的清晰付款條款，以及包含了全自動雲端託管與算力的甜甜月費 ($1,200/月)。",
  "【匯款簽署】提供國泰世華銀行對帳資訊、線上開票與對帳表單，並可列印簽核或線上藍新完成綁定。",
];

export default function LannyYogaProposalPage() {
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  // Presenter Mode & Fullscreen Controls
  const [isPresenterMode, setIsPresenterMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [presenterTimer, setPresenterTimer] = useState(0);

  // Commercial Defense & Admin Bypass State
  const [isAdminBypass, setIsAdminBypass] = useState(false);

  // Proposal Effective Date
  const CREATED_AT = "2026-08-02";
  const [lifecycleState, setLifecycleState] = useState<{ stage: string; daysDiff: number }>(
    calculateProposalLifecycle(CREATED_AT)
  );

  useEffect(() => {
    // 🔥 第一時間記錄訪客 IP 與 Session 軌跡至後台
    let isAdminAccess = false;
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("admin") === "87257257") {
        isAdminAccess = true;
        setIsAdminBypass(true);
        setIsUnlocked(true);
      }
    }

    sendProposalAuditTrack("lanny-yoga", "PAGE_VISITED_SESSION", {
      isUnlockedDirectly: isAdminAccess,
    }, isAdminAccess).then((res) => {
      if (res && res.lifecycle) {
        setLifecycleState(res.lifecycle);
      }
    });

    const unlocked = sessionStorage.getItem("proposal_unlocked_lanny_yoga");
    if (unlocked === "true") {
      setIsUnlocked(true);
    }
  }, []);

  // Timer for Presenter Mode
  useEffect(() => {
    let interval: any;
    if (isPresenterMode) {
      interval = setInterval(() => {
        setPresenterTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPresenterMode]);

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

  // Selected Plan State: 'starter' (3.88萬) | 'flagship' (5.88萬)
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "flagship">("flagship");

  // Calculation for Deposit and Balance
  const basePrice = selectedPlan === "flagship" ? 58800 : 38800;
  const depositAmount = basePrice * 0.5; // 50% 訂金
  const balanceAmount = basePrice * 0.5; // 50% 尾款
  const depositTaxed = depositAmount * 1.05;

  // Passwords: Today (20260802 / 0802)
  const VALID_PASSWORDS = ["20260802", "0802", "20260729", "0729"];

  // Security & Keyboard Listener
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return;
      }

      if (e.key === "F12" || e.keyCode === 123) {
        e.preventDefault();
        return false;
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c")) {
        e.preventDefault();
        return false;
      }

      // Keyboard Presentation Deck Shortcuts (html-ppt-skill style)
      if (isUnlocked) {
        if (e.key === "ArrowRight" || e.key === " ") {
          setCurrentSlide((prev) => Math.min(prev + 1, 5));
        } else if (e.key === "ArrowLeft") {
          setCurrentSlide((prev) => Math.max(prev - 1, 0));
        } else if (e.key === "p" || e.key === "P") {
          setIsPresenterMode((prev) => !prev);
        } else if (e.key === "f" || e.key === "F") {
          toggleFullscreen();
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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

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

  // Slide 0: Magazine Cover Slide (Editorial Presentation Layout)
  const slide0Cover = (
    <div className="w-full my-auto space-y-6">
      {/* Editorial Title Header Hero Box */}
      <div className="bg-gradient-to-br from-white via-[#FBF8F3] to-[#F3EBE0] rounded-3xl p-6 md:p-10 border border-[#E3D5C3] shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 opacity-10 pointer-events-none text-stone-900 text-9xl font-serif select-none">
          🧘
        </div>

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#5C504A] text-amber-50 rounded-full text-xs font-bold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <EditableText id="client_tag" defaultText="Lanny Yoga Studio ｜ Lanny 老師專屬客製數位專案" />
          </div>

          <h1 className="text-3xl md:text-5xl font-black font-serif text-[#3D332A] tracking-tight leading-tight">
            <EditableText id="proposal_title" defaultText="【LINE 官方帳號 ＋ LINE BOT ＋ LIFF 獨立官網】" />
            <span className="block text-xl md:text-3xl text-[#8C6D46] font-bold mt-2">
              全自動化教務預約 ✕ Gemini AI 溫暖行銷小編 建置案
            </span>
          </h1>

          <p className="text-xs md:text-sm text-[#706256] leading-relaxed max-w-3xl pt-2 border-t border-[#E3D5C3]/60">
            <EditableText
              id="proposal_subtitle"
              defaultText="專為 Lanny Yoga Studio 瑜伽教室量身打造！結合 LINE 富選單、LIFF 免下載預約官網、自動算效期課券對帳系統，以及 Gemini AI 雙向文案與 5 大視覺風格 HD 配圖小編。"
            />
          </p>

          {/* Quick Metrics Chips */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3">
            <div className="bg-white/80 p-3 rounded-2xl border border-[#EADCC9] text-center shadow-2xs">
              <span className="text-[10px] text-stone-500 block uppercase font-bold tracking-wider">建置預算區間</span>
              <span className="text-sm md:text-base font-black font-mono text-[#8C6D46]">NT$ 38,800 ~ 58,800</span>
            </div>
            <div className="bg-white/80 p-3 rounded-2xl border border-[#EADCC9] text-center shadow-2xs">
              <span className="text-[10px] text-stone-500 block uppercase font-bold tracking-wider">預估工期</span>
              <span className="text-sm md:text-base font-bold text-stone-800">1 ~ 2 週速成驗收</span>
            </div>
            <div className="bg-white/80 p-3 rounded-2xl border border-[#EADCC9] text-center shadow-2xs">
              <span className="text-[10px] text-stone-500 block uppercase font-bold tracking-wider">獨立網域</span>
              <span className="text-xs md:text-sm font-mono font-bold text-amber-900">booking.lanny-yoga.com</span>
            </div>
            <div className="bg-white/80 p-3 rounded-2xl border border-[#EADCC9] text-center shadow-2xs">
              <span className="text-[10px] text-stone-500 block uppercase font-bold tracking-wider">客戶資料掌控度</span>
              <span className="text-sm md:text-base font-bold text-emerald-700">100% 獨立資料庫</span>
            </div>
          </div>
        </div>
      </div>

      {/* Structured Client & Proposal Metadata Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/90 border border-[#E3D5C3] rounded-2xl p-5 shadow-2xs hover-float">
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-stone-200">
            <h3 className="text-xs font-black text-[#8C6D46] uppercase tracking-wider flex items-center gap-2">
              <span>🏢</span> 客戶對象資訊 (CLIENT PROFILE)
            </h3>
            <span className="px-2 py-0.5 bg-stone-100 text-[10px] font-bold text-stone-600 rounded">Verified</span>
          </div>
          <div className="space-y-2.5 text-xs md:text-sm text-stone-700">
            <div className="flex justify-between items-center">
              <span className="text-stone-500">教室名稱</span>
              <span className="font-bold text-stone-900"><EditableText id="client_name" defaultText="Lanny Yoga Studio 瑜伽教室" /></span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-500">創辦人 / 代表</span>
              <span className="font-medium text-stone-900"><EditableText id="client_owner" defaultText="Lanny 老師" /></span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-500">品牌專屬網域</span>
              <span className="font-mono text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">booking.lanny-yoga.com</span>
            </div>
          </div>
        </div>

        <div className="bg-white/90 border border-[#E3D5C3] rounded-2xl p-5 shadow-2xs hover-float">
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-stone-200">
            <h3 className="text-xs font-black text-[#8C6D46] uppercase tracking-wider flex items-center gap-2">
              <span>📑</span> 專案報價資訊 (PROPOSAL META)
            </h3>
            <span className="px-2 py-0.5 bg-amber-100 text-[10px] font-bold text-amber-900 rounded">Official</span>
          </div>
          <div className="space-y-2.5 text-xs md:text-sm text-stone-700">
            <div className="flex justify-between items-center">
              <span className="text-stone-500">專案編號</span>
              <span className="font-mono text-amber-900 font-bold">LY-202608-AI01</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-500">報價日期</span>
              <span className="font-medium text-stone-900">2026 年 08 月 02 日</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-500">規劃執行單位</span>
              <span className="font-bold text-[#5C504A]">奕暢創新設計工作室</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Slide 1: Pain Point Transformation (Editorial Comparison Slide Layout)
  const slide1PainPoints = (
    <div className="w-full my-auto space-y-5">
      <div className="border-b border-stone-200 pb-3">
        <span className="text-[10px] font-mono font-bold tracking-widest text-[#8C6D46] uppercase block">TRANSFORMATION MATRIX</span>
        <h2 className="text-xl md:text-3xl font-black font-serif text-stone-900 flex items-center gap-2 mt-0.5">
          <span>💡</span> 傳統人工痛點 vs. 24HR 智慧數位總管 (Pain Point Transformation)
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: ❌ Traditional Manual Pains */}
        <div className="bg-rose-50/80 border-2 border-rose-200/90 rounded-3xl p-6 space-y-4 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center border-b border-rose-200 pb-3">
            <h4 className="font-black text-rose-950 text-base flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center text-xs font-bold">✕</span>
              傳統人工營運痛點
            </h4>
            <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full">高耗時 / 低效率</span>
          </div>

          <div className="space-y-3">
            {[
              { num: "01", title: "課後訊息私訊洗板", desc: "每天下班後還要花 2~3 小時逐一核對 LINE 訊息處理預約、請假與補課。" },
              { num: "02", title: "手動算效期與堂數糾紛", desc: "多堂方案、體驗課與期課過期日繁瑣，手動計算容易漏算並引發學員糾紛。" },
              { num: "03", title: "外包小編成本居高不下", desc: "每月花上萬元外包社群小編，產出的貼文圖片往往不符合瑜伽質感。" },
              { num: "04", title: "資料被第三方平台扣留", desc: "使用一般第三方預約平台，顧客資料在別人池子裡，無法建立品牌黏性。" },
            ].map((item, idx) => (
              <div key={idx} className="bg-white/80 border border-rose-100 rounded-2xl p-3.5 flex items-start gap-3 shadow-2xs">
                <span className="font-mono text-sm font-black text-rose-400 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">{item.num}</span>
                <div>
                  <h5 className="font-bold text-rose-900 text-xs md:text-sm">{item.title}</h5>
                  <p className="text-[11px] text-rose-700 leading-snug mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: ✨ Lanny Intelligent Manager */}
        <div className="bg-[#FAF6F0] border-2 border-[#D8C7B0] rounded-3xl p-6 space-y-4 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center border-b border-[#E3D5C3] pb-3">
            <h4 className="font-black text-[#3D332A] text-base flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#5C504A] text-amber-50 flex items-center justify-center text-xs font-bold">✓</span>
              Lanny 智慧總管對應解方
            </h4>
            <span className="text-[10px] font-bold bg-[#EFE6D8] text-[#8C6D46] px-2.5 py-1 rounded-full border border-[#D8C7B0]">24H 自動運作</span>
          </div>

          <div className="space-y-3">
            {[
              { num: "01", title: "LIFF 官網學員秒預約", desc: "免下載 App，學員直接開啟 LINE 點擊預約，開課前 2 小時自動發送提醒。" },
              { num: "02", title: "後五碼自動核對算效期", desc: "學員填寫匯款後五碼，後台一鍵確認即自動精算效期發券，自動傳送 LINE 憑證。" },
              { num: "03", title: "Gemini AI 雙向行銷小編", desc: "內建 AI 行銷大腦，常駐莫蘭迪/日光/極簡 5 大風格自動生成 HD 高畫質行銷圖文。" },
              { num: "04", title: "100% 獨立品牌雲端資產", desc: "擁有一切獨立 Supabase 資料庫與專屬網域，學員資料 100% 掌握在自己手中。" },
            ].map((item, idx) => (
              <div key={idx} className="bg-white/90 border border-[#EADCC9] rounded-2xl p-3.5 flex items-start gap-3 shadow-2xs hover-float">
                <span className="font-mono text-sm font-black text-[#8C6D46] bg-[#EFE6D8] px-2 py-0.5 rounded-lg border border-[#D8C7B0]">{item.num}</span>
                <div>
                  <h5 className="font-bold text-[#3D332A] text-xs md:text-sm">{item.title}</h5>
                  <p className="text-[11px] text-[#706256] leading-snug mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Slide 2: 8 Core System Feature Modules (Magazine Feature Tile Grid Layout)
  const slide2Modules = (
    <div className="w-full my-auto space-y-4">
      <div className="border-b border-stone-200 pb-2">
        <span className="text-[10px] font-mono font-bold tracking-widest text-[#8C6D46] uppercase block">SYSTEM ARCHITECTURE</span>
        <h2 className="text-xl md:text-3xl font-black font-serif text-stone-900 flex items-center gap-2 mt-0.5">
          <span>🚀</span> 專案建置 8 大核心系統功能模組 (Scope & Deliverables)
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {[
          { num: "01", icon: "👥", pill: "CRM", title: "學員與課券 CRM 中心", desc: "學員歷程卡、真實有效堂數精算 (自動過濾過期)、`repair_credits` 校正與 LINE 廣播。" },
          { num: "02", icon: "📅", pill: "點名", title: "多模式課表與點名系統", desc: "月曆/週曆/單日視窗、人數上限控管 (Capacity)、3天保護期點名與簽到扣券。" },
          { num: "03", icon: "💳", pill: "財務", title: "方案訂單與財務對帳", desc: "轉帳後五碼對帳、一鍵「確認收款」自動呼叫 `grant_credit_lot()` 發券與發收條。" },
          { num: "04", icon: "📊", pill: "報表", title: "營運分析與時段熱力圖", desc: "預估/預約/實現三口徑營收分析、過去 6 個月熱門時段熱力圖與 12 個月比較圖表。" },
          { num: "05", icon: "🛍️", pill: "商城", title: "嚴選商城與實體訂單", desc: "瑜伽輔具商品目錄管理 (多圖、庫存、上下架開關)、訂單處理與出貨單號追蹤。" },
          { num: "06", icon: "🖼️", pill: "內容", title: "網站內容模組化維護", desc: "品牌簡介 (受保護銀行帳號管理)、老師經歷形象照、課程類型與難度星等設定。" },
          { num: "07", icon: "🤖", pill: "AI", title: "LINE 與 AI 助手全方位整合", desc: "富選單對接、Gemini AI 行銷文案、常駐 5 大視覺風格 HD 配圖小編與 8 項叮咚推播。" },
          { num: "08", icon: "📮", pill: "邀約", title: "合作邀約與企業包班", desc: "網站訪客與企業包班/品牌合作表單收件匣、處理進度標記與備忘追蹤筆記。" },
        ].map((mod, idx) => (
          <div key={idx} className="bg-white border border-[#E3D5C3] rounded-2xl p-4 shadow-2xs hover-float flex flex-col justify-between space-y-2 relative overflow-hidden">
            <div className="flex justify-between items-center border-b border-stone-100 pb-2">
              <span className="text-xl">{mod.icon}</span>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 bg-[#EFE6D8] text-[9px] font-bold text-[#8C6D46] rounded-md">{mod.pill}</span>
                <span className="font-mono text-xs font-black text-stone-300">{mod.num}</span>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-xs md:text-sm">{mod.title}</h3>
              <p className="text-[11px] text-stone-600 leading-tight mt-1">{mod.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Slide 3: Dual Plan Comparison Matrix (High-End Pitch Cards Layout)
  const slide3Plans = (
    <div className="w-full my-auto space-y-4">
      <div className="border-b border-stone-200 pb-2">
        <span className="text-[10px] font-mono font-bold tracking-widest text-[#8C6D46] uppercase block">PLANS MATRIX</span>
        <h2 className="text-xl md:text-3xl font-black font-serif text-stone-900 flex items-center gap-2 mt-0.5">
          <span>⚖️</span> 雙建置方案功能規格比較 (Dual Plan Matrix)
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Starter Plan Card */}
        <div
          onClick={() => setSelectedPlan("starter")}
          className={`cursor-pointer rounded-3xl p-6 border-2 transition-all hover-float flex flex-col justify-between ${
            selectedPlan === "starter"
              ? "bg-[#FAF6F0] border-amber-600 ring-4 ring-amber-600/10 shadow-xl"
              : "bg-white border-stone-200 hover:border-stone-300 shadow-sm"
          }`}
        >
          <div className="space-y-3">
            <div className="flex justify-between items-start border-b border-stone-200 pb-3">
              <div>
                <span className="px-2.5 py-0.5 bg-stone-100 text-stone-700 text-[10px] font-bold rounded-full">基礎首選</span>
                <h3 className="font-black text-stone-900 text-lg md:text-xl mt-1">精緻單店專屬版</h3>
                <p className="text-xs text-stone-500">適合獨立老師 / 個人預約工作室</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-stone-400 block">建置總額</span>
                <span className="text-xl md:text-2xl font-black font-mono text-stone-900">NT$ 38,800</span>
              </div>
            </div>

            <ul className="text-xs text-stone-700 space-y-2.5 pt-1">
              <li className="flex items-center gap-2"><span className="text-emerald-600 font-bold">✓</span> 100% 獨立專屬網域與 Supabase 資料庫</li>
              <li className="flex items-center gap-2"><span className="text-emerald-600 font-bold">✓</span> LINE BOT ＋ LIFF 官網預約系統</li>
              <li className="flex items-center gap-2"><span className="text-emerald-600 font-bold">✓</span> 學員 CRM 與轉帳自動對帳算效期</li>
              <li className="flex items-center gap-2"><span className="text-emerald-600 font-bold">✓</span> 基礎 LINE 富選單圖文設計</li>
              <li className="flex items-center gap-2"><span className="text-emerald-600 font-bold">✓</span> 基礎 8 項叮咚推播設定</li>
            </ul>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-200 text-center">
            <span className={`text-xs font-bold ${selectedPlan === "starter" ? "text-amber-800 font-black" : "text-stone-400"}`}>
              {selectedPlan === "starter" ? "✓ 已選擇精緻版" : "點擊切換此方案"}
            </span>
          </div>
        </div>

        {/* Flagship Plan Card */}
        <div
          onClick={() => setSelectedPlan("flagship")}
          className={`cursor-pointer rounded-3xl p-6 border-2 transition-all relative overflow-hidden hover-float flex flex-col justify-between ${
            selectedPlan === "flagship"
              ? "bg-[#FAF6F0] border-amber-800 ring-4 ring-amber-800/15 shadow-xl animate-glow"
              : "bg-white border-stone-200 hover:border-stone-300 shadow-sm"
          }`}
        >
          <div className="absolute top-0 right-0 bg-[#5C504A] text-amber-100 text-[11px] font-black px-4 py-1.5 rounded-bl-2xl shadow-sm flex items-center gap-1">
            <span>👑</span> 官方強力推薦 👑
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-start border-b border-stone-200 pb-3">
              <div>
                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold rounded-full border border-amber-200">尊榮 AI 旗艦</span>
                <h3 className="font-black text-stone-900 text-lg md:text-xl mt-1">品牌旗艦 AI 尊榮全功能版</h3>
                <p className="text-xs text-stone-500">適合瑜伽館 / 美業沙龍 / 師資團隊</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-stone-400 block">建置總額</span>
                <span className="text-xl md:text-2xl font-black font-mono text-amber-900">NT$ 58,800</span>
              </div>
            </div>

            <ul className="text-xs text-stone-800 space-y-2.5 pt-1 font-medium">
              <li className="flex items-center gap-2"><span className="text-amber-800 font-bold">★</span> 包含精緻版全部功能</li>
              <li className="flex items-center gap-2"><span className="text-amber-800 font-bold">★</span> <b>Gemini AI 雙向行銷小編</b> (IG貼文 + 課程簡介)</li>
              <li className="flex items-center gap-2"><span className="text-amber-800 font-bold">★</span> <b>常駐 5 大美業/瑜伽視覺風格</b> (莫蘭迪/極簡...)</li>
              <li className="flex items-center gap-2"><span className="text-amber-800 font-bold">★</span> <b>AI 高清圖片生成與實體預覽視窗</b></li>
              <li className="flex items-center gap-2"><span className="text-amber-800 font-bold">★</span> 嚴選商城與實體商品訂單模組</li>
              <li className="flex items-center gap-2"><span className="text-amber-800 font-bold">★</span> 營運分析與過去 6 個月時段熱力圖</li>
              <li className="flex items-center gap-2"><span className="text-amber-800 font-bold">★</span> 1 對 1 教務實機培訓與優先技術支援</li>
            </ul>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-200 text-center">
            <span className={`text-xs font-bold ${selectedPlan === "flagship" ? "text-amber-900 font-black" : "text-stone-400"}`}>
              {selectedPlan === "flagship" ? "★ 已選擇旗艦 AI 尊榮版" : "點擊切換此方案"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  // Slide 4: Interactive Pricing Breakdown (Executive Summary Financial Slide)
  const slide4Pricing = (
    <div className="w-full my-auto space-y-5">
      <div className="border-b border-stone-200 pb-2">
        <span className="text-[10px] font-mono font-bold tracking-widest text-[#8C6D46] uppercase block">FINANCIAL SUMMARY</span>
        <h2 className="text-xl md:text-3xl font-black font-serif text-stone-900 flex items-center gap-2 mt-0.5">
          <span>💰</span> 建置費用試算與結算條款 (Pricing Breakdown)
        </h2>
        <p className="text-xs text-stone-500 mt-1">目前選取方案：<b className="text-amber-900 font-bold">{selectedPlan === "flagship" ? "品牌旗艦 AI 尊榮全功能版 ($58,800)" : "精緻單店專屬版 ($38,800)"}</b></p>
      </div>

      <div className="bg-white border-2 border-[#E3D5C3] rounded-3xl p-6 space-y-5 shadow-sm">
        {/* KPI Callout Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-[#FAF6F0] p-4 rounded-2xl border border-[#EADCC9] shadow-2xs hover-float">
            <span className="text-[10px] text-stone-500 uppercase font-bold block mb-1">專案建置總額</span>
            <span className="text-xl md:text-2xl font-black font-mono text-stone-900">NT$ {basePrice.toLocaleString()}</span>
          </div>
          <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200 shadow-2xs hover-float">
            <span className="text-[10px] text-amber-800 uppercase font-bold block mb-1">首期 50% 訂金</span>
            <span className="text-xl md:text-2xl font-black font-mono text-amber-900">NT$ {depositAmount.toLocaleString()}</span>
          </div>
          <div className="bg-[#FAF6F0] p-4 rounded-2xl border border-[#EADCC9] shadow-2xs hover-float">
            <span className="text-[10px] text-stone-500 uppercase font-bold block mb-1">尾款 50% (線上驗收後)</span>
            <span className="text-xl md:text-2xl font-black font-mono text-stone-700">NT$ {balanceAmount.toLocaleString()}</span>
          </div>
          <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200 shadow-2xs hover-float">
            <span className="text-[10px] text-emerald-800 uppercase font-bold block mb-1">含 5% 營業稅 (訂金)</span>
            <span className="text-xl md:text-2xl font-black font-mono text-emerald-900">NT$ {Math.round(depositTaxed).toLocaleString()}</span>
          </div>
        </div>

        {/* Tabular SaaS Monthly Item Table */}
        <div className="bg-[#FAF6F0]/60 rounded-2xl p-5 border border-[#EADCC9] text-xs text-stone-700 space-y-3">
          <div className="flex justify-between border-b border-stone-200/80 pb-2.5 font-bold text-stone-900 text-xs md:text-sm">
            <span>營運與維護託管月費包含項目 (SaaS Monthly Service)</span>
            <span>月費金額</span>
          </div>
          <div className="flex justify-between items-center">
            <span>☁️ Supabase 獨立雲端資料庫託管 ＋ 每日自動備份 ＋ SSL 證書</span>
            <span className="font-semibold text-emerald-700">包含於月費內</span>
          </div>
          <div className="flex justify-between items-center">
            <span>🤖 Gemini AI 雙向文字與 5 大視覺風格高清圖片生成用量</span>
            <span className="font-semibold text-emerald-700">包含於月費內</span>
          </div>
          <div className="flex justify-between items-center border-t border-stone-200/80 pt-2.5 font-bold text-[#8C6D46] text-xs md:text-sm">
            <span>合計營運與 AI 雲端月費 (年繳折抵享 NT$ 12,000 / 年)</span>
            <span className="font-mono text-base text-amber-900">NT$ 1,200 / 月</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Slide 5: Remittance & Signature (Checkout Slide Layout)
  const slide5Checkout = (
    <div className="w-full my-auto space-y-5">
      <div className="border-b border-stone-200 pb-2">
        <span className="text-[10px] font-mono font-bold tracking-widest text-[#8C6D46] uppercase block">CHECKOUT & SIGNATURE</span>
        <h2 className="text-xl md:text-3xl font-black font-serif text-stone-900 flex items-center gap-2 mt-0.5">
          <span>💳</span> 匯款對帳帳戶與線上簽章 (Remittance & E-Signature)
        </h2>
      </div>

      <FraudAlertAndDomainVerifier />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Passbook Bank Card */}
        <div className="bg-gradient-to-br from-[#FAF6F0] to-[#EFE6D8] border-2 border-[#D8C7B0] rounded-3xl p-6 space-y-4 shadow-sm hover-float">
          <div className="flex justify-between items-center border-b border-[#D8C7B0] pb-3">
            <h3 className="font-black text-[#3D332A] text-base flex items-center gap-2">
              <span>🏦</span> 指定匯款銀行帳戶 (BANK ACCOUNT)
            </h3>
            <span className="px-2 py-0.5 bg-[#5C504A] text-amber-50 text-[10px] font-bold rounded">認證帳戶</span>
          </div>

          <div className="space-y-3 text-xs md:text-sm text-stone-800">
            <div className="flex justify-between">
              <span className="text-stone-500">銀行名稱</span>
              <span className="font-bold text-stone-900">國泰世華銀行 (代碼 013)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">分行名稱</span>
              <span className="font-medium">館前分行</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">戶名全銜</span>
              <span className="font-bold text-stone-900">奕暢數位創意有限公司</span>
            </div>
            <div className="flex justify-between items-center border-t border-[#D8C7B0] pt-3">
              <span className="text-stone-600 font-bold">匯款帳號</span>
              <span className="font-mono font-black text-amber-900 text-base md:text-lg tracking-wider bg-white/80 px-3 py-1 rounded-xl border border-amber-200 shadow-2xs">013-03-500888-9</span>
            </div>
          </div>
        </div>

        {/* E-Signature & Invoice Form */}
        <form onSubmit={handleSaveInvoiceInfo} className="bg-white border-2 border-stone-200 rounded-3xl p-6 space-y-3.5 shadow-sm">
          <h3 className="font-black text-stone-900 text-sm border-b border-stone-100 pb-2 flex items-center gap-1.5">
            <span>📝</span> 線上對帳與發票資料登記
          </h3>
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">開票抬頭 (公司/教室全銜)</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 outline-none focus:border-amber-600 focus:bg-white transition"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">統一編號</label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="例: 88888888"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 outline-none focus:border-amber-600 focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">匯款帳號後五碼</label>
              <input
                type="text"
                value={remittanceBank5}
                onChange={(e) => setRemittanceBank5(e.target.value)}
                placeholder="例: 12345"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-stone-800 outline-none focus:border-amber-600 focus:bg-white transition"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting || isSaved}
            className="w-full py-3 bg-[#5C504A] hover:bg-[#4A403B] disabled:bg-stone-300 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer active:scale-98"
          >
            {isSaved ? "✅ 對帳與開票資訊已確認送出" : isSubmitting ? "確認中..." : "送出對帳與開票資訊"}
          </button>
        </form>
      </div>

      <PrintSignatureSection proposalTitle="Lanny Yoga Studio 瑜伽教室 — 【LINE 官方帳號 ＋ LINE BOT ＋ LIFF 獨立官網】數位品牌建置案" />
    </div>
  );

  const slides = [slide0Cover, slide1PainPoints, slide2Modules, slide3Plans, slide4Pricing, slide5Checkout];
  const slideTitles = ["專案總覽", "痛點解方", "8大功能", "方案比較", "價格試算", "對帳簽署"];

  // Progress Bar Percentage
  const progressPercent = ((currentSlide + 1) / slides.length) * 100;

  // Format Presenter Timer MM:SS
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <ProposalEditableProvider slug="lanny-yoga">
      <div className="min-h-screen bg-[#F5EFE6] text-[#3D332A] font-sans relative selection:bg-[#D4A373] selection:text-white flex flex-col justify-between p-3 md:p-6 transition-colors duration-500">
        {/* Security Overlays */}
        <SecurityWatermarkOverlay />
        {isAdminBypass && <OwnerBypassBanner />}

        {/* Lock Screen Modal */}
        {!isUnlocked && (
          <div className="fixed inset-0 z-[999] bg-stone-900/70 backdrop-blur-md flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white border border-stone-200 rounded-3xl p-8 shadow-2xl text-center">
              <div className="w-16 h-16 bg-amber-50 text-amber-800 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 border border-amber-100 shadow-sm">
                🧘
              </div>
              <h2 className="text-2xl font-bold font-serif text-stone-900 mb-1">Lanny Yoga Studio — 數位簡報</h2>
              <p className="text-xs text-stone-500 mb-6 leading-relaxed">
                【LINE 官方帳號 ＋ LINE BOT ＋ LIFF 獨立官網】數位品牌升級建置案
              </p>
              <form onSubmit={handleUnlock} className="space-y-4">
                <input
                  type="password"
                  placeholder="請輸入解鎖密碼 (本日日期)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-center text-lg focus:outline-none focus:border-amber-600 focus:bg-white text-stone-800 placeholder-stone-400 transition"
                  autoFocus
                />
                {errorMsg && <p className="text-xs text-rose-500 font-medium">{errorMsg}</p>}
                <button
                  type="submit"
                  className="w-full py-3 bg-[#5C504A] hover:bg-[#4A403B] text-white font-bold rounded-xl shadow-md transition cursor-pointer"
                >
                  解鎖進入簡報報價單
                </button>
              </form>
              <p className="text-[10px] text-stone-400 mt-4">提示：本日日期 20260802 或 0802</p>
            </div>
          </div>
        )}

        {/* HTML-PPT Top Progress Indicator Line */}
        <div className="fixed top-0 left-0 right-0 h-1.5 bg-stone-300/30 z-50">
          <div
            className="h-full bg-[#5C504A] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Presenter Mode Overlay (html-ppt-skill Signature Feature) */}
        {isPresenterMode && (
          <div className="fixed bottom-20 right-6 z-[90] max-w-sm w-full bg-stone-900/95 text-white border border-stone-700 rounded-2xl p-4 shadow-2xl backdrop-blur-lg animate-fade-in-up">
            <div className="flex items-center justify-between border-b border-stone-700 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-amber-600 text-[10px] font-bold rounded-md">🎙️ 演講者模式</span>
                <span className="text-xs font-mono text-stone-300">⏱️ {formatTimer(presenterTimer)}</span>
              </div>
              <button
                onClick={() => setIsPresenterMode(false)}
                className="text-xs text-stone-400 hover:text-white px-2 py-0.5 rounded hover:bg-stone-800 cursor-pointer"
              >
                ✕ 關閉
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">簡報講稿 (Speaker Notes)</span>
                <p className="text-xs text-stone-200 leading-relaxed bg-stone-800/80 p-2.5 rounded-xl border border-stone-700 font-sans">
                  {SPEAKER_NOTES[currentSlide]}
                </p>
              </div>
              {currentSlide < slides.length - 1 && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">下一頁預覽</span>
                  <div className="text-xs text-stone-300 font-medium bg-stone-800/50 p-2 rounded-lg border border-stone-700/60">
                    Slide {currentSlide + 2}: {slideTitles[currentSlide + 1]}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Top Header Bar */}
        <header className="max-w-6xl w-full mx-auto mb-3">
          <div className="bg-white/95 backdrop-blur-xl border border-[#E3D5C3] rounded-2xl px-5 py-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🧘</span>
              <div>
                <h1 className="font-black text-xs md:text-sm text-[#3D332A] font-serif flex items-center gap-2">
                  Lanny Yoga Studio 專案數位簡報
                  <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-[#EFE6D8] border border-[#D8C7B0] text-[#8C6D46]">
                    EDITORIAL DECK
                  </span>
                </h1>
              </div>
            </div>

            {/* Slide Navigation Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {slideTitles.map((title, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`px-3 py-1.5 text-xs rounded-xl font-bold transition cursor-pointer ${
                    currentSlide === idx
                      ? "bg-[#5C504A] text-amber-50 shadow-xs"
                      : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/50"
                  }`}
                >
                  {idx + 1}. {title}
                </button>
              ))}
            </div>

            {/* Presenter & Fullscreen Tools */}
            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={() => setIsPresenterMode((prev) => !prev)}
                title="切換演講者模式 [P]"
                className={`px-3 py-1.5 rounded-xl font-bold border transition flex items-center gap-1 cursor-pointer ${
                  isPresenterMode
                    ? "bg-amber-600 border-amber-600 text-white shadow-sm"
                    : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
                }`}
              >
                🎙️ <span className="hidden md:inline">演講模式 [P]</span>
              </button>

              <button
                onClick={toggleFullscreen}
                title="全螢幕展示 [F]"
                className="px-3 py-1.5 rounded-xl border font-bold transition flex items-center gap-1 cursor-pointer bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
              >
                {isFullscreen ? "↙ 退出" : "⛶ 全螢幕 [F]"}
              </button>
            </div>
          </div>
        </header>

        {/* 🔥 HIGH-IMPACT EDITORIAL PPT SLIDE CANVAS STAGE */}
        <main className="max-w-6xl w-full mx-auto flex-1 flex flex-col justify-center my-2">
          <div className="w-full min-h-[520px] bg-white/95 backdrop-blur-xl border-2 border-[#E3D5C3] shadow-[0_25px_60px_rgba(92,80,74,0.12)] rounded-3xl p-6 md:p-10 relative overflow-hidden transition-all duration-300 flex flex-col justify-between">
            
            {/* Top Slide Header Badge & Progress Indicators */}
            <div className="flex items-center justify-between border-b border-stone-200/60 pb-3.5 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold font-mono px-3 py-1 rounded-full bg-[#EFE6D8] border border-[#D8C7B0] text-[#8C6D46]">
                  SLIDE 0{currentSlide + 1} / 0{slides.length}
                </span>
                <span className="text-xs font-black text-stone-800">
                  {slideTitles[currentSlide]}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {slideTitles.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2.5 rounded-full transition-all cursor-pointer ${
                      currentSlide === idx
                        ? "w-8 bg-[#5C504A]"
                        : "w-2.5 bg-stone-200 hover:bg-stone-400"
                    }`}
                    title={slideTitles[idx]}
                  />
                ))}
              </div>
            </div>

            {/* Dynamic Editorial Slide Content */}
            <div key={currentSlide} className="flex-1 flex flex-col justify-center animate-slide-in-right">
              {slides[currentSlide]}
            </div>

            {/* Bottom Inner Deck Footer */}
            <div className="flex justify-between items-center border-t border-stone-200/60 pt-3 mt-5 text-[11px] text-stone-500 font-medium">
              <span>奕暢創新設計工作室 ｜ Editorial PPT Presentation Deck</span>
              <span className="font-mono">Lanny Yoga Studio Spec v3.0</span>
            </div>
          </div>
        </main>

        {/* Bottom Slide Controller Dock */}
        <footer className="max-w-6xl w-full mx-auto mt-3 pt-3 border-t border-stone-300/40 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-600">
          <div className="flex items-center gap-2">
            <span>⌨️ 方向鍵 `[← / →]` 切換 ｜ `[P]` 演講講稿 ｜ `[F]` 全螢幕</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentSlide((prev) => Math.max(prev - 1, 0))}
              disabled={currentSlide === 0}
              className="px-4 py-2 bg-white border border-stone-200 rounded-xl font-bold disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer text-stone-800 hover:bg-stone-50 shadow-2xs"
            >
              ◀ 上一頁 Slide
            </button>
            <span className="font-mono font-bold text-sm text-stone-900">
              0{currentSlide + 1} / 0{slides.length}
            </span>
            <button
              onClick={() => setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1))}
              disabled={currentSlide === slides.length - 1}
              className="px-5 py-2 bg-[#5C504A] text-white rounded-xl font-bold disabled:opacity-40 disabled:cursor-not-allowed transition shadow-md cursor-pointer hover:bg-[#4A403B]"
            >
              下一頁 Slide ▶
            </button>
          </div>
        </footer>
      </div>
    </ProposalEditableProvider>
  );
}
