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

// Theme configuration inspired by html-ppt-skill
type PPTTheme = "morandi" | "forest" | "glass" | "cyber";

interface ThemeStyle {
  name: string;
  icon: string;
  bg: string;
  deckCanvasBg: string;
  deckBorder: string;
  deckShadow: string;
  cardBg: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentBg: string;
  accentBorder: string;
  highlight: string;
  progressColor: string;
}

const PPT_THEMES: Record<PPTTheme, ThemeStyle> = {
  morandi: {
    name: "莫蘭迪溫暖 (Morandi Warm)",
    icon: "🧘",
    bg: "bg-[#F5EFE6]",
    deckCanvasBg: "bg-white/95 backdrop-blur-xl",
    deckBorder: "border-[#E3D5C3]",
    deckShadow: "shadow-[0_20px_50px_rgba(92,80,74,0.12)]",
    cardBg: "bg-[#FAF6F0]/90",
    cardBorder: "border-[#EADCC9]",
    textPrimary: "text-[#3D332A]",
    textSecondary: "text-[#706256]",
    accent: "text-[#5C504A]",
    accentBg: "bg-[#EFE6D8]",
    accentBorder: "border-[#D8C7B0]",
    highlight: "text-[#8C6D46]",
    progressColor: "bg-[#5C504A]",
  },
  forest: {
    name: "靜謐森林 (Zen Forest)",
    icon: "🌿",
    bg: "bg-[#E6F0EB]",
    deckCanvasBg: "bg-white/95 backdrop-blur-xl",
    deckBorder: "border-[#C2DFC3]",
    deckShadow: "shadow-[0_20px_50px_rgba(15,118,110,0.15)]",
    cardBg: "bg-[#F2F7F4]",
    cardBorder: "border-[#D1E7DD]",
    textPrimary: "text-[#133E35]",
    textSecondary: "text-[#2D6A5D]",
    accent: "text-[#0F766E]",
    accentBg: "bg-[#D8EFE9]",
    accentBorder: "border-[#B2DFD6]",
    highlight: "text-[#047857]",
    progressColor: "bg-[#0F766E]",
  },
  glass: {
    name: "極光冰藍 (Modern Light)",
    icon: "💎",
    bg: "bg-gradient-to-br from-[#E2E8F0] via-[#EBF8FF] to-[#DBEAFE]",
    deckCanvasBg: "bg-white/90 backdrop-blur-2xl",
    deckBorder: "border-blue-200",
    deckShadow: "shadow-[0_20px_50px_rgba(0,102,255,0.15)]",
    cardBg: "bg-blue-50/50",
    cardBorder: "border-blue-100",
    textPrimary: "text-slate-900",
    textSecondary: "text-slate-600",
    accent: "text-blue-900",
    accentBg: "bg-blue-100/70",
    accentBorder: "border-blue-300",
    highlight: "text-blue-600",
    progressColor: "bg-[#0066FF]",
  },
  cyber: {
    name: "深夜奢華 (Cyber Dark)",
    icon: "🌙",
    bg: "bg-[#0B0F19]",
    deckCanvasBg: "bg-[#161F33]/95 backdrop-blur-2xl",
    deckBorder: "border-[#2E3D5C]",
    deckShadow: "shadow-[0_20px_50px_rgba(0,0,0,0.6)]",
    cardBg: "bg-[#1E293B]/80",
    cardBorder: "border-[#334155]",
    textPrimary: "text-slate-100",
    textSecondary: "text-slate-400",
    accent: "text-teal-300",
    accentBg: "bg-teal-950/70",
    accentBorder: "border-teal-700",
    highlight: "text-teal-400",
    progressColor: "bg-teal-400",
  },
};

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

  // html-ppt-skill Advanced Features: Theme Switcher, Presenter Mode, Timer & Fullscreen
  const [theme, setTheme] = useState<PPTTheme>("morandi");
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

  // Security & Slide Switch Keyboard Listener (HTML-PPT Shortcuts)
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

  const currentThemeStyle = PPT_THEMES[theme];

  // Slide 0: Cover Header (html-ppt-skill Design Architecture)
  const slide0Cover = (
    <div className="w-full my-auto space-y-6">
      <div className={`${currentThemeStyle.cardBg} rounded-2xl p-6 md:p-8 border ${currentThemeStyle.cardBorder} shadow-xs relative overflow-hidden`}>
        <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-xs font-semibold ${currentThemeStyle.accent} ${currentThemeStyle.accentBg} ${currentThemeStyle.accentBorder} mb-3 shadow-2xs`}>
          <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
          <EditableText id="client_tag" defaultText="Lanny Yoga Studio ｜ Lanny 老師專屬客製" />
        </div>
        <h1 className={`text-2xl md:text-4xl font-extrabold font-serif ${currentThemeStyle.textPrimary} tracking-tight leading-tight mb-3`}>
          <EditableText id="proposal_title" defaultText="【LINE 官方帳號 ＋ LINE BOT ＋ LIFF 獨立官網】數位品牌建置案" />
        </h1>
        <p className={`text-xs md:text-sm ${currentThemeStyle.textSecondary} leading-relaxed max-w-2xl`}>
          <EditableText
            id="proposal_subtitle"
            defaultText="專為 Lanny Yoga Studio 瑜伽教室量身打造！結合 LINE 富選單、LIFF 免下載預約官網、自動算效期課券對帳系統，以及 Gemini AI 雙向文案與 5 大視覺風格 HD 配圖小編。"
          />
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`${currentThemeStyle.cardBg} border ${currentThemeStyle.cardBorder} rounded-xl p-5 shadow-2xs hover-float`}>
          <h3 className={`text-xs uppercase font-bold ${currentThemeStyle.highlight} tracking-wider mb-3 flex items-center gap-2`}>
            <span>🏢</span> 客戶對象資訊 (CLIENT)
          </h3>
          <div className={`space-y-2 text-xs md:text-sm ${currentThemeStyle.textSecondary}`}>
            <div className="flex justify-between border-b border-stone-200/50 pb-1.5">
              <span className="opacity-70">教室名稱</span>
              <span className={`font-semibold ${currentThemeStyle.textPrimary}`}><EditableText id="client_name" defaultText="Lanny Yoga Studio 瑜伽教室" /></span>
            </div>
            <div className="flex justify-between border-b border-stone-200/50 pb-1.5">
              <span className="opacity-70">代表人物</span>
              <span className={`font-medium ${currentThemeStyle.textPrimary}`}><EditableText id="client_owner" defaultText="Lanny 老師" /></span>
            </div>
            <div className="flex justify-between border-b border-stone-200/50 pb-1.5">
              <span className="opacity-70">獨立網域定位</span>
              <span className={`font-mono font-medium ${currentThemeStyle.highlight}`}>booking.lanny-yoga.com</span>
            </div>
          </div>
        </div>

        <div className={`${currentThemeStyle.cardBg} border ${currentThemeStyle.cardBorder} rounded-xl p-5 shadow-2xs hover-float`}>
          <h3 className={`text-xs uppercase font-bold ${currentThemeStyle.highlight} tracking-wider mb-3 flex items-center gap-2`}>
            <span>📑</span> 報價與專案資訊 (PROPOSAL)
          </h3>
          <div className={`space-y-2 text-xs md:text-sm ${currentThemeStyle.textSecondary}`}>
            <div className="flex justify-between border-b border-stone-200/50 pb-1.5">
              <span className="opacity-70">專案編號</span>
              <span className={`font-mono font-medium ${currentThemeStyle.highlight}`}>LY-202608-AI01</span>
            </div>
            <div className="flex justify-between border-b border-stone-200/50 pb-1.5">
              <span className="opacity-70">建置預算區間</span>
              <span className="font-bold text-amber-600">NT$ 38,800 ~ 58,800</span>
            </div>
            <div className="flex justify-between border-b border-stone-200/50 pb-1.5">
              <span className="opacity-70">預估建置工期</span>
              <span>1 ~ 2 週 (包含驗收上線與教培)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Slide 1: Pain Point Transformation
  const slide1PainPoints = (
    <div className="w-full my-auto space-y-4">
      <div className="border-b border-stone-200/60 pb-3">
        <h2 className={`text-lg md:text-2xl font-bold font-serif ${currentThemeStyle.textPrimary} flex items-center gap-2`}>
          <span>💡</span> 營運痛點對照與系統解決方案 (Pain Point Transformation)
        </h2>
        <p className={`text-xs ${currentThemeStyle.textSecondary} mt-1`}>從傳統人工訊息洗板，升級為 24HR 全自動化 LINE 智慧數位總管</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-5 space-y-3 hover-float">
          <h4 className="font-bold text-rose-900 text-sm flex items-center gap-2 border-b border-rose-200 pb-2">
            <span>❌</span> 傳統人工經營痛點
          </h4>
          <ul className="text-xs text-rose-800 space-y-2.5 leading-relaxed">
            <li>• 每天下班還要花 2~3 小時在 LINE 訊息私訊裡處理學員預約與請假</li>
            <li>• 手動對帳易錯漏，多堂方案與體驗課的到期日計算複雜易生糾紛</li>
            <li>• 每月花上萬元請外包小編，還常常找不到貼合教室溫暖質感的照片</li>
            <li>• 第三方平台網址缺乏專屬感，學員資料被扣在別人平台池子裡</li>
          </ul>
        </div>

        <div className={`${currentThemeStyle.cardBg} border ${currentThemeStyle.cardBorder} rounded-xl p-5 space-y-3 hover-float`}>
          <h4 className={`font-bold ${currentThemeStyle.accent} text-sm flex items-center gap-2 border-b ${currentThemeStyle.accentBorder} pb-2`}>
            <span>✨</span> Lanny 智慧總管解決方案
          </h4>
          <ul className={`text-xs ${currentThemeStyle.textSecondary} space-y-2.5 leading-relaxed`}>
            <li>• LIFF 官網學員免下載即可預約，開課前 2 小時 LINE 自動叮咚提醒</li>
            <li>• 轉帳後五碼即時核對，一鍵確認自動發算 1 個月/3 個月效期憑證</li>
            <li>• 內建 Gemini AI 行銷小編，常駐 5 大風格（莫蘭迪柔和/極簡日光/日系唯美...）自動畫 HD 配圖</li>
            <li>• 100% 獨立專屬網域與獨立 Supabase 雲端資料庫，顧客資產 100% 掌握</li>
          </ul>
        </div>
      </div>
    </div>
  );

  // Slide 2: Core System Modules
  const slide2Modules = (
    <div className="w-full my-auto space-y-3">
      <div className="border-b border-stone-200/60 pb-2">
        <h2 className={`text-lg md:text-2xl font-bold font-serif ${currentThemeStyle.textPrimary} flex items-center gap-2`}>
          <span>🚀</span> 專案建置 8 大核心系統功能模組 (Scope & Deliverables)
        </h2>
        <p className={`text-xs ${currentThemeStyle.textSecondary}`}>完整複製 Lanny Yoga Studio 頂級營運架構，一站式搞定教務、財務與 AI 行銷</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[
          { title: "1. 👥 學員與課券 CRM 中心", desc: "學員歷程卡、真實有效堂數精算 (過期自動過濾)、`repair_credits` 校正、手動撥補發券、LINE 私訊與課堂廣播。" },
          { title: "2. 📅 多模式課表與點名系統", desc: "月曆/週曆/單日視窗、名額上限控管 (Capacity)、3 天保護期內課堂點名與出席狀態標記、簽到自動扣券。" },
          { title: "3. 💳 方案訂單與財務對帳", desc: "學員轉帳後五碼即時核對、一鍵「確認收款」自動呼叫 `grant_credit_lot()` 算效期發券，自動傳送 LINE 收條憑證。" },
          { title: "4. 📊 營運分析與時段熱力圖", desc: "預估/預約/實現三口徑營收分析、過去 6 個月熱門時段熱力圖、12 個月歷史比較 (手刻輕量化 SVG 圖表)。" },
          { title: "5. 🛍️ 嚴選商城與實體訂單", desc: "瑜伽輔具商品目錄管理 (多圖、價格、庫存、上下架開關)、購物訂單處理與出貨物流單號追蹤。" },
          { title: "6. 🖼️ 網站內容模組化維護", desc: "教室與品牌簡介 (受保護銀行帳號管理)、老師經歷與形象照網址設定、課程類型 (難度星等/預設時長/簡介)。" },
          { title: "7. 🤖 LINE 與 AI 助手全方位整合", desc: "富選單對接、Gemini AI 行銷文案、常駐 5 大視覺風格 (莫蘭迪/極簡/日系...) HD 配圖小編、8 項實體叮咚推播。" },
          { title: "8. 📮 合作邀約與企業包班", desc: "網站訪客與企業包班/品牌合作表單收件匣、處理進度標記與備忘追蹤筆記。" },
        ].map((mod, idx) => (
          <div key={idx} className={`${currentThemeStyle.cardBg} border ${currentThemeStyle.cardBorder} rounded-xl p-3 shadow-2xs hover-float`}>
            <h3 className={`font-bold ${currentThemeStyle.textPrimary} text-xs md:text-sm`}>{mod.title}</h3>
            <p className={`text-[11px] ${currentThemeStyle.textSecondary} leading-tight mt-1`}>{mod.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );

  // Slide 3: Scope & Plan Comparison
  const slide3Plans = (
    <div className="w-full my-auto space-y-4">
      <div className="border-b border-stone-200/60 pb-2">
        <h2 className={`text-lg md:text-2xl font-bold font-serif ${currentThemeStyle.textPrimary} flex items-center gap-2`}>
          <span>⚖️</span> 雙建置方案功能規格比較 (Dual Plan Matrix)
        </h2>
        <p className={`text-xs ${currentThemeStyle.textSecondary}`}>依據貴教室規模與需求，靈活選擇最合適的方案（點擊卡片可切換選擇）：</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div
          onClick={() => setSelectedPlan("starter")}
          className={`cursor-pointer rounded-xl p-5 border transition-all hover-float ${
            selectedPlan === "starter"
              ? `${currentThemeStyle.accentBg} border-amber-600 ring-2 ring-amber-600/30 shadow-md`
              : `${currentThemeStyle.cardBg} ${currentThemeStyle.cardBorder}`
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className={`font-bold ${currentThemeStyle.textPrimary} text-base`}>精緻單店專屬版</h3>
              <p className={`text-xs ${currentThemeStyle.textSecondary}`}>適合獨立老師 / 個人預約工作室</p>
            </div>
            <span className={`text-lg font-bold font-mono ${currentThemeStyle.textPrimary}`}>NT$ 38,800</span>
          </div>
          <ul className={`text-xs ${currentThemeStyle.textSecondary} space-y-2 border-t border-stone-200/60 pt-3`}>
            <li>✔ 100% 獨立專屬網域與 Supabase 資料庫</li>
            <li>✔ LINE BOT ＋ LIFF 官網預約系統</li>
            <li>✔ 學員 CRM 與轉帳自動對帳算效期</li>
            <li>✔ 基礎 LINE 富選單圖文設計</li>
            <li>✔ 基礎 8 項叮咚推播設定</li>
          </ul>
        </div>

        <div
          onClick={() => setSelectedPlan("flagship")}
          className={`cursor-pointer rounded-xl p-5 border transition-all relative overflow-hidden hover-float ${
            selectedPlan === "flagship"
              ? `${currentThemeStyle.accentBg} border-amber-700 ring-2 ring-amber-700/40 shadow-md animate-glow`
              : `${currentThemeStyle.cardBg} ${currentThemeStyle.cardBorder}`
          }`}
        >
          <div className="absolute top-0 right-0 bg-amber-700 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-xs">
            官方推薦 👑
          </div>
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className={`font-bold ${currentThemeStyle.textPrimary} text-base`}>品牌旗艦 AI 尊榮全功能版</h3>
              <p className={`text-xs ${currentThemeStyle.textSecondary}`}>適合瑜伽館 / 美業沙龍 / 師資團隊</p>
            </div>
            <span className="text-lg font-bold font-mono text-amber-600">NT$ 58,800</span>
          </div>
          <ul className={`text-xs ${currentThemeStyle.textPrimary} space-y-2 border-t border-stone-200/60 pt-3 font-medium`}>
            <li>★ 包含精緻版全部功能</li>
            <li>★ **Gemini AI 雙向行銷小編** (IG貼文 + 課程簡介)</li>
            <li>★ **常駐 5 大美業/瑜伽視覺風格** (莫蘭迪/極簡...)</li>
            <li>★ **AI 高清圖片生成與實體預覽視窗**</li>
            <li>★ 嚴選商城與實體商品訂單模組</li>
            <li>★ 營運分析與過去 6 個月時段熱力圖</li>
            <li>★ 1 對 1 教務實機培訓與優先技術支援</li>
          </ul>
        </div>
      </div>
    </div>
  );

  // Slide 4: Interactive Price Breakdown
  const slide4Pricing = (
    <div className="w-full my-auto space-y-4">
      <div className="border-b border-stone-200/60 pb-2">
        <h2 className={`text-lg md:text-2xl font-bold font-serif ${currentThemeStyle.textPrimary} flex items-center gap-2`}>
          <span>💰</span> 建置費用試算與結算條款 (Pricing Breakdown)
        </h2>
        <p className={`text-xs ${currentThemeStyle.textSecondary}`}>已切換方案：<b>{selectedPlan === "flagship" ? "品牌旗艦 AI 尊榮版" : "精緻單店專屬版"}</b></p>
      </div>

      <div className={`${currentThemeStyle.cardBg} border ${currentThemeStyle.cardBorder} rounded-xl p-6 space-y-4 shadow-xs`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className={`${currentThemeStyle.accentBg} p-4 rounded-xl border ${currentThemeStyle.cardBorder} shadow-2xs hover-float`}>
            <span className={`text-xs ${currentThemeStyle.textSecondary} block mb-1`}>專案建置總額</span>
            <span className={`text-lg font-bold font-mono ${currentThemeStyle.textPrimary}`}>NT$ {basePrice.toLocaleString()}</span>
          </div>
          <div className={`${currentThemeStyle.accentBg} p-4 rounded-xl border ${currentThemeStyle.cardBorder} shadow-2xs hover-float`}>
            <span className={`text-xs ${currentThemeStyle.textSecondary} block mb-1`}>首期 50% 訂金</span>
            <span className="text-lg font-bold font-mono text-amber-700">NT$ {depositAmount.toLocaleString()}</span>
          </div>
          <div className={`${currentThemeStyle.accentBg} p-4 rounded-xl border ${currentThemeStyle.cardBorder} shadow-2xs hover-float`}>
            <span className={`text-xs ${currentThemeStyle.textSecondary} block mb-1`}>尾款 50% (驗收後)</span>
            <span className={`text-lg font-bold font-mono ${currentThemeStyle.textSecondary}`}>NT$ {balanceAmount.toLocaleString()}</span>
          </div>
          <div className={`${currentThemeStyle.accentBg} p-4 rounded-xl border ${currentThemeStyle.cardBorder} shadow-2xs hover-float`}>
            <span className={`text-xs ${currentThemeStyle.textSecondary} block mb-1`}>含 5% 營業稅 (訂金)</span>
            <span className={`text-lg font-bold font-mono ${currentThemeStyle.textPrimary}`}>NT$ {Math.round(depositTaxed).toLocaleString()}</span>
          </div>
        </div>

        <div className={`rounded-xl p-4 border ${currentThemeStyle.cardBorder} text-xs ${currentThemeStyle.textSecondary} space-y-2`}>
          <div className={`flex justify-between border-b border-stone-200/50 pb-2 font-bold ${currentThemeStyle.textPrimary}`}>
            <span>維護與託管月費項目</span>
            <span>月費金額</span>
          </div>
          <div className="flex justify-between">
            <span>☁️ Supabase 獨立雲端資料庫託管 ＋ 每日自動備份</span>
            <span>包含於月費</span>
          </div>
          <div className="flex justify-between">
            <span>🤖 Gemini AI 文字與高清圖片生成用量</span>
            <span>包含於月費</span>
          </div>
          <div className={`flex justify-between border-t border-stone-200/50 pt-2 font-bold ${currentThemeStyle.highlight}`}>
            <span>合計營運與 AI 雲端月費 (年繳折抵享 NT$ 12,000 / 年)</span>
            <span className="font-mono text-sm">NT$ 1,200 / 月</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Slide 5: Remittance & Signature
  const slide5Checkout = (
    <div className="w-full my-auto space-y-4">
      <div className="border-b border-stone-200/60 pb-2">
        <h2 className={`text-lg md:text-2xl font-bold font-serif ${currentThemeStyle.textPrimary} flex items-center gap-2`}>
          <span>💳</span> 匯款對帳帳戶與線上簽章 (Remittance & E-Signature)
        </h2>
        <p className={`text-xs ${currentThemeStyle.textSecondary}`}>請於匯款首期訂金後填寫下方資訊，專案團隊將即時進行對帳確認。</p>
      </div>

      <FraudAlertAndDomainVerifier />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`${currentThemeStyle.accentBg} border ${currentThemeStyle.accentBorder} rounded-xl p-5 space-y-3 hover-float`}>
          <h3 className={`font-bold ${currentThemeStyle.accent} text-xs md:text-sm border-b ${currentThemeStyle.accentBorder} pb-2`}>
            🏦 指定匯款銀行帳戶
          </h3>
          <div className={`space-y-2 text-xs ${currentThemeStyle.textSecondary}`}>
            <div className="flex justify-between">
              <span className="opacity-70">銀行名稱</span>
              <span className={`font-bold ${currentThemeStyle.textPrimary}`}>國泰世華銀行 (013)</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-70">分行名稱</span>
              <span>館前分行</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-70">戶名</span>
              <span className={`font-bold ${currentThemeStyle.textPrimary}`}>奕暢數字創意有限公司</span>
            </div>
            <div className={`flex justify-between border-t ${currentThemeStyle.accentBorder} pt-2`}>
              <span className="opacity-70">匯款帳號</span>
              <span className={`font-mono font-bold ${currentThemeStyle.highlight} text-sm tracking-wider`}>013-03-500888-9</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveInvoiceInfo} className="space-y-3">
          <div>
            <label className={`block text-xs font-bold ${currentThemeStyle.textPrimary} mb-1`}>開票抬頭 (公司/教室全銜)</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className={`w-full px-3 py-2 ${currentThemeStyle.cardBg} border ${currentThemeStyle.cardBorder} rounded-xl text-xs ${currentThemeStyle.textPrimary} outline-none`}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={`block text-xs font-bold ${currentThemeStyle.textPrimary} mb-1`}>統一編號</label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="例: 88888888"
                className={`w-full px-3 py-2 ${currentThemeStyle.cardBg} border ${currentThemeStyle.cardBorder} rounded-xl text-xs ${currentThemeStyle.textPrimary} outline-none`}
              />
            </div>
            <div>
              <label className={`block text-xs font-bold ${currentThemeStyle.textPrimary} mb-1`}>匯款帳號後五碼</label>
              <input
                type="text"
                value={remittanceBank5}
                onChange={(e) => setRemittanceBank5(e.target.value)}
                placeholder="例: 12345"
                className={`w-full px-3 py-2 ${currentThemeStyle.cardBg} border ${currentThemeStyle.cardBorder} rounded-xl text-xs font-mono ${currentThemeStyle.textPrimary} outline-none`}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting || isSaved}
            className={`w-full py-2.5 ${currentThemeStyle.progressColor} text-white font-bold text-xs rounded-xl shadow-md transition hover:opacity-90 disabled:opacity-50`}
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
      <div className={`min-h-screen ${currentThemeStyle.bg} ${currentThemeStyle.textPrimary} font-sans relative selection:bg-[#D4A373] selection:text-white flex flex-col justify-between p-3 md:p-6 transition-colors duration-500`}>
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
                  className="w-full py-3 bg-[#5C504A] hover:bg-[#4A403B] text-white font-bold rounded-xl shadow-md transition"
                >
                  解鎖進入簡報簡報
                </button>
              </form>
              <p className="text-[10px] text-stone-400 mt-4">提示：本日日期 20260802 或 0802</p>
            </div>
          </div>
        )}

        {/* HTML-PPT Top Progress Indicator Line */}
        <div className="fixed top-0 left-0 right-0 h-1.5 bg-stone-300/30 z-50">
          <div
            className={`h-full ${currentThemeStyle.progressColor} transition-all duration-300`}
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
                className="text-xs text-stone-400 hover:text-white px-2 py-0.5 rounded hover:bg-stone-800"
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

        {/* Top Header & Visual Theme Quick-Selector Bar */}
        <header className="max-w-6xl w-full mx-auto mb-3">
          <div className={`${currentThemeStyle.deckCanvasBg} border ${currentThemeStyle.deckBorder} rounded-2xl px-4 py-2.5 shadow-sm flex flex-wrap items-center justify-between gap-3`}>
            <div className="flex items-center gap-2">
              <span className="text-xl">{currentThemeStyle.icon}</span>
              <div>
                <h1 className={`font-bold text-xs md:text-sm ${currentThemeStyle.textPrimary} font-serif flex items-center gap-2`}>
                  Lanny Yoga Studio 專案數位簡報
                  <span className={`px-2 py-0.5 text-[10px] font-mono rounded-md border ${currentThemeStyle.accentBg} ${currentThemeStyle.accentBorder} ${currentThemeStyle.highlight}`}>
                    HTML-PPT DECK
                  </span>
                </h1>
              </div>
            </div>

            {/* Prominent Visual Theme Switcher Buttons (莫蘭迪 / 靜謐森林 / 極光冰藍 / 深夜暗黑) */}
            <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 p-1 rounded-xl">
              {(Object.keys(PPT_THEMES) as PPTTheme[]).map((tKey) => {
                const tObj = PPT_THEMES[tKey];
                const isActive = theme === tKey;
                return (
                  <button
                    key={tKey}
                    onClick={() => setTheme(tKey)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                      isActive
                        ? `${tObj.progressColor} text-white shadow-md scale-105`
                        : `${currentThemeStyle.textSecondary} hover:${currentThemeStyle.textPrimary} hover:bg-white/40`
                    }`}
                  >
                    <span>{tObj.icon}</span>
                    <span className="hidden sm:inline">{tObj.name.split(" ")[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* Presenter & Fullscreen Tools */}
            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={() => setIsPresenterMode((prev) => !prev)}
                title="切換演講者模式 [P]"
                className={`px-3 py-1 rounded-xl font-bold border transition flex items-center gap-1 cursor-pointer ${
                  isPresenterMode
                    ? "bg-amber-600 border-amber-600 text-white shadow-sm"
                    : `${currentThemeStyle.cardBg} ${currentThemeStyle.cardBorder} ${currentThemeStyle.textSecondary} hover:${currentThemeStyle.textPrimary}`
                }`}
              >
                🎙️ <span className="hidden md:inline">演講模式 [P]</span>
              </button>

              <button
                onClick={toggleFullscreen}
                title="全螢幕展示 [F]"
                className={`px-2.5 py-1 rounded-xl border font-bold transition flex items-center gap-1 cursor-pointer ${currentThemeStyle.cardBg} ${currentThemeStyle.cardBorder} ${currentThemeStyle.textSecondary} hover:${currentThemeStyle.textPrimary}`}
              >
                {isFullscreen ? "↙ 退出" : "⛶ 全螢幕"}
              </button>
            </div>
          </div>
        </header>

        {/* 🔥 HIGH-IMPACT PPT SLIDE STAGE CANVAS FRAME (16:9 Deck Framing) */}
        <main className="max-w-6xl w-full mx-auto flex-1 flex flex-col justify-center my-2">
          <div className={`w-full min-h-[500px] ${currentThemeStyle.deckCanvasBg} border-2 ${currentThemeStyle.deckBorder} ${currentThemeStyle.deckShadow} rounded-3xl p-6 md:p-10 relative overflow-hidden transition-all duration-300 flex flex-col justify-between`}>
            
            {/* Top Slide Header Indicator */}
            <div className="flex items-center justify-between border-b border-stone-200/40 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold font-mono px-2.5 py-0.5 rounded-full ${currentThemeStyle.accentBg} ${currentThemeStyle.accentBorder} ${currentThemeStyle.highlight}`}>
                  SLIDE 0{currentSlide + 1} / 0{slides.length}
                </span>
                <span className={`text-xs font-bold ${currentThemeStyle.textSecondary}`}>
                  {slideTitles[currentSlide]}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {slideTitles.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      currentSlide === idx
                        ? `w-6 ${currentThemeStyle.progressColor}`
                        : "w-2 bg-stone-300/60 hover:bg-stone-400"
                    }`}
                    title={slideTitles[idx]}
                  />
                ))}
              </div>
            </div>

            {/* Dynamic Slide Content with Right-Slide Animation */}
            <div key={currentSlide} className="flex-1 flex flex-col justify-center animate-slide-in-right">
              {slides[currentSlide]}
            </div>

            {/* Bottom Inner Deck Watermark */}
            <div className="flex justify-between items-center border-t border-stone-200/40 pt-3 mt-4 text-[11px] opacity-60">
              <span>奕暢創新設計工作室 ｜ HTML-PPT Presentation Deck System</span>
              <span className="font-mono">Lanny Yoga Studio Spec v2.0</span>
            </div>
          </div>
        </main>

        {/* Bottom Slide Controller Dock */}
        <footer className={`max-w-6xl w-full mx-auto mt-3 pt-3 border-t border-stone-300/40 flex flex-wrap items-center justify-between gap-2 text-xs ${currentThemeStyle.textSecondary}`}>
          <div className="flex items-center gap-2">
            <span>⌨️ 方向鍵 `[← / →]` 切換 ｜ `[P]` 演講者講稿 ｜ `[F]` 全螢幕</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentSlide((prev) => Math.max(prev - 1, 0))}
              disabled={currentSlide === 0}
              className={`px-4 py-2 rounded-xl border font-bold disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer ${currentThemeStyle.cardBg} ${currentThemeStyle.cardBorder} ${currentThemeStyle.textPrimary} hover:shadow-xs`}
            >
              ◀ 上一頁 Slide
            </button>
            <span className="font-mono font-bold text-sm">
              0{currentSlide + 1} / 0{slides.length}
            </span>
            <button
              onClick={() => setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1))}
              disabled={currentSlide === slides.length - 1}
              className={`px-5 py-2 ${currentThemeStyle.progressColor} text-white rounded-xl font-bold disabled:opacity-40 disabled:cursor-not-allowed transition shadow-md cursor-pointer hover:opacity-90`}
            >
              下一頁 Slide ▶
            </button>
          </div>
        </footer>
      </div>
    </ProposalEditableProvider>
  );
}
