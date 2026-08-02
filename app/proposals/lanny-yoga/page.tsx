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
  const [currentSlide, setCurrentSlide] = useState(0);

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

  // Security & Slide Switch Keyboard Listener
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

      // Keyboard Slide Navigation
      if (isUnlocked) {
        if (e.key === "ArrowRight" || e.key === " ") {
          setCurrentSlide((prev) => Math.min(prev + 1, 5));
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

  // Slide 0: Cover Header
  const slide0Cover = (
    <div className="w-full my-auto space-y-6">
      <div className="bg-gradient-to-br from-white via-[#FDFBF7] to-[#F5EFE6] rounded-3xl p-6 md:p-8 border border-stone-200 shadow-xs relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/90 rounded-full border border-stone-300 text-xs font-semibold text-amber-900 mb-3 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
          <EditableText id="client_tag" defaultText="Lanny Yoga Studio ｜ Lanny 老師專屬客製" />
        </div>
        <h1 className="text-2xl md:text-4xl font-extrabold font-serif text-stone-900 tracking-tight leading-tight mb-3">
          <EditableText id="proposal_title" defaultText="【LINE 官方帳號 ＋ LINE BOT ＋ LIFF 獨立官網】數位品牌建置案" />
        </h1>
        <p className="text-xs md:text-sm text-stone-600 leading-relaxed max-w-2xl">
          <EditableText
            id="proposal_subtitle"
            defaultText="專為 Lanny Yoga Studio 瑜伽教室量身打造！結合 LINE 富選單、LIFF 免下載預約官網、自動算效期課券對帳系統，以及 Gemini AI 雙向文案與 5 大視覺風格 HD 配圖小編。"
          />
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-2xs">
          <h3 className="text-xs uppercase font-bold text-amber-800 tracking-wider mb-3 flex items-center gap-2">
            <span>🏢</span> 客戶對象資訊 (CLIENT)
          </h3>
          <div className="space-y-2 text-xs md:text-sm text-stone-700">
            <div className="flex justify-between border-b border-stone-100 pb-1.5">
              <span className="text-stone-500">教室名稱</span>
              <span className="font-semibold text-stone-900"><EditableText id="client_name" defaultText="Lanny Yoga Studio 瑜伽教室" /></span>
            </div>
            <div className="flex justify-between border-b border-stone-100 pb-1.5">
              <span className="text-stone-500">代表人物</span>
              <span className="font-medium text-stone-900"><EditableText id="client_owner" defaultText="Lanny 老師" /></span>
            </div>
            <div className="flex justify-between border-b border-stone-100 pb-1.5">
              <span className="text-stone-500">獨立網域定位</span>
              <span className="font-mono text-amber-800 font-medium">booking.lanny-yoga.com</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-2xs">
          <h3 className="text-xs uppercase font-bold text-amber-800 tracking-wider mb-3 flex items-center gap-2">
            <span>📑</span> 報價與專案資訊 (PROPOSAL)
          </h3>
          <div className="space-y-2 text-xs md:text-sm text-stone-700">
            <div className="flex justify-between border-b border-stone-100 pb-1.5">
              <span className="text-stone-500">專案編號</span>
              <span className="font-mono text-amber-800 font-medium">LY-202608-AI01</span>
            </div>
            <div className="flex justify-between border-b border-stone-100 pb-1.5">
              <span className="text-stone-500">建置預算區間</span>
              <span className="font-bold text-amber-700">NT$ 38,800 ~ 58,800</span>
            </div>
            <div className="flex justify-between border-b border-stone-100 pb-1.5">
              <span className="text-stone-500">預估建置工期</span>
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
      <div className="border-b border-stone-200 pb-3">
        <h2 className="text-lg md:text-2xl font-bold font-serif text-stone-900 flex items-center gap-2">
          <span>💡</span> 營運痛點對照與系統解決方案 (Pain Point Transformation)
        </h2>
        <p className="text-xs text-stone-500 mt-1">從傳統人工訊息洗板，升級為 24HR 全自動化 LINE 智慧數位總管</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-5 space-y-3">
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

        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 space-y-3">
          <h4 className="font-bold text-amber-900 text-sm flex items-center gap-2 border-b border-amber-200 pb-2">
            <span>✨</span> Lanny 智慧總管解決方案
          </h4>
          <ul className="text-xs text-amber-800 space-y-2.5 leading-relaxed">
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
      <div className="border-b border-stone-200 pb-2">
        <h2 className="text-lg md:text-2xl font-bold font-serif text-stone-900 flex items-center gap-2">
          <span>🚀</span> 專案建置 8 大核心系統功能模組 (Scope & Deliverables)
        </h2>
        <p className="text-xs text-stone-500">完整複製 Lanny Yoga Studio 頂級營運架構，一站式搞定教務、財務與 AI 行銷</p>
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
          <div key={idx} className="bg-white border border-stone-200/80 rounded-xl p-3 shadow-2xs">
            <h3 className="font-bold text-stone-900 text-xs md:text-sm">{mod.title}</h3>
            <p className="text-[11px] text-stone-600 leading-tight mt-1">{mod.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );

  // Slide 3: Scope & Plan Comparison
  const slide3Plans = (
    <div className="w-full my-auto space-y-4">
      <div className="border-b border-stone-200 pb-2">
        <h2 className="text-lg md:text-2xl font-bold font-serif text-stone-900 flex items-center gap-2">
          <span>⚖️</span> 雙建置方案功能規格比較 (Dual Plan Matrix)
        </h2>
        <p className="text-xs text-stone-500">依據貴教室規模與需求，靈活選擇最合適的方案（點擊卡片可切換選擇）：</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div
          onClick={() => setSelectedPlan("starter")}
          className={`cursor-pointer rounded-2xl p-5 border transition-all ${
            selectedPlan === "starter"
              ? "bg-amber-50/50 border-amber-600 ring-2 ring-amber-600/20 shadow-md"
              : "bg-white border-stone-200 hover:border-stone-300"
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-bold text-stone-900 text-base">精緻單店專屬版</h3>
              <p className="text-xs text-stone-500">適合獨立老師 / 個人預約工作室</p>
            </div>
            <span className="text-lg font-bold font-mono text-stone-900">NT$ 38,800</span>
          </div>
          <ul className="text-xs text-stone-600 space-y-2 border-t border-stone-200/60 pt-3">
            <li>✔ 100% 獨立專屬網域與 Supabase 資料庫</li>
            <li>✔ LINE BOT ＋ LIFF 官網預約系統</li>
            <li>✔ 學員 CRM 與轉帳自動對帳算效期</li>
            <li>✔ 基礎 LINE 富選單圖文設計</li>
            <li>✔ 基礎 8 項叮咚推播設定</li>
          </ul>
        </div>

        <div
          onClick={() => setSelectedPlan("flagship")}
          className={`cursor-pointer rounded-2xl p-5 border transition-all relative overflow-hidden ${
            selectedPlan === "flagship"
              ? "bg-[#FAF6F0] border-amber-700 ring-2 ring-amber-700/20 shadow-md"
              : "bg-white border-stone-200 hover:border-stone-300"
          }`}
        >
          <div className="absolute top-0 right-0 bg-amber-700 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">
            官方推薦 👑
          </div>
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-bold text-stone-900 text-base">品牌旗艦 AI 尊榮全功能版</h3>
              <p className="text-xs text-stone-500">適合瑜伽館 / 美業沙龍 / 師資團隊</p>
            </div>
            <span className="text-lg font-bold font-mono text-amber-800">NT$ 58,800</span>
          </div>
          <ul className="text-xs text-stone-700 space-y-2 border-t border-stone-200/60 pt-3 font-medium">
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
      <div className="border-b border-stone-200 pb-2">
        <h2 className="text-lg md:text-2xl font-bold font-serif text-stone-900 flex items-center gap-2">
          <span>💰</span> 建置費用試算與結算條款 (Pricing Breakdown)
        </h2>
        <p className="text-xs text-stone-500">已切換方案：<b>{selectedPlan === "flagship" ? "品牌旗艦 AI 尊榮版" : "精緻單店專屬版"}</b></p>
      </div>

      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
            <span className="text-xs text-stone-500 block mb-1">專案建置總額</span>
            <span className="text-lg font-bold font-mono text-stone-900">NT$ {basePrice.toLocaleString()}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
            <span className="text-xs text-stone-500 block mb-1">首期 50% 訂金</span>
            <span className="text-lg font-bold font-mono text-amber-800">NT$ {depositAmount.toLocaleString()}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
            <span className="text-xs text-stone-500 block mb-1">尾款 50% (驗收後)</span>
            <span className="text-lg font-bold font-mono text-stone-700">NT$ {balanceAmount.toLocaleString()}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
            <span className="text-xs text-stone-500 block mb-1">含 5% 營業稅 (訂金)</span>
            <span className="text-lg font-bold font-mono text-stone-800">NT$ {Math.round(depositTaxed).toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-stone-200 text-xs text-stone-600 space-y-2">
          <div className="flex justify-between border-b border-stone-100 pb-2 font-bold text-stone-800">
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
          <div className="flex justify-between border-t border-stone-100 pt-2 font-bold text-amber-900">
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
      <div className="border-b border-stone-200 pb-2">
        <h2 className="text-lg md:text-2xl font-bold font-serif text-stone-900 flex items-center gap-2">
          <span>💳</span> 匯款對帳帳戶與線上簽章 (Remittance & E-Signature)
        </h2>
        <p className="text-xs text-stone-500">請於匯款首期訂金後填寫下方資訊，專案團隊將即時進行對帳確認。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bank Info Box */}
        <div className="bg-[#FAF6F0] border border-amber-200 rounded-2xl p-5 space-y-3">
          <h3 className="font-bold text-amber-900 text-xs md:text-sm border-b border-amber-200/80 pb-2">
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

        {/* Invoice Form */}
        <form onSubmit={handleSaveInvoiceInfo} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">開票抬頭 (公司/教室全銜)</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 outline-none"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">統一編號</label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="例: 88888888"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">匯款帳號後五碼</label>
              <input
                type="text"
                value={remittanceBank5}
                onChange={(e) => setRemittanceBank5(e.target.value)}
                placeholder="例: 12345"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-stone-800 outline-none"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting || isSaved}
            className="w-full py-2.5 bg-[#5C504A] hover:bg-[#4A403B] disabled:bg-stone-300 text-white font-bold text-xs rounded-xl shadow-md transition"
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

  return (
    <ProposalEditableProvider slug="lanny-yoga">
      <div className="min-h-screen bg-[#FAF6F0] text-stone-800 font-sans relative selection:bg-[#D4A373] selection:text-white flex flex-col justify-between p-4 md:p-8">
        {/* Security Overlays */}
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
                  解鎖進入報價簡報
                </button>
              </form>
              <p className="text-[10px] text-stone-400 mt-4">提示：本日日期 20260802 或 0802</p>
            </div>
          </div>
        )}

        {/* Top Header Navigation Tabs */}
        <header className="max-w-5xl w-full mx-auto mb-4">
          <div className="flex items-center justify-between bg-white border border-stone-200/80 rounded-2xl px-4 py-2 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="text-lg">🧘</span>
              <span className="font-bold text-xs md:text-sm text-stone-900 font-serif">Lanny Yoga Studio 專案簡報</span>
            </div>

            {/* Slide Tabs Navigation */}
            <div className="flex items-center gap-1 overflow-x-auto">
              {slideTitles.map((title, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                    currentSlide === idx
                      ? "bg-[#5C504A] text-white font-bold"
                      : "text-stone-500 hover:text-stone-900 hover:bg-stone-100"
                  }`}
                >
                  {idx + 1}. {title}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Slide Main Presentation Area */}
        <main className="max-w-5xl w-full mx-auto flex-1 flex flex-col justify-center my-2">
          {slides[currentSlide]}
        </main>

        {/* Bottom Slide Controller Footer */}
        <footer className="max-w-5xl w-full mx-auto mt-4 pt-3 border-t border-stone-200/80 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span>可使用 ⌨️ 鍵盤左右方向鍵切換頁面</span>
            <span className="hidden md:inline text-stone-300">|</span>
            <span className="hidden md:inline font-mono">Page {currentSlide + 1} / {slides.length}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentSlide((prev) => Math.max(prev - 1, 0))}
              disabled={currentSlide === 0}
              className="px-3 py-1.5 bg-white border border-stone-200 rounded-xl font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50 transition text-stone-800"
            >
              ◀ 上一頁
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1))}
              disabled={currentSlide === slides.length - 1}
              className="px-4 py-1.5 bg-[#5C504A] text-white rounded-xl font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#4A403B] transition shadow-xs"
            >
              下一頁 ▶
            </button>
          </div>
        </footer>
      </div>
    </ProposalEditableProvider>
  );
}
