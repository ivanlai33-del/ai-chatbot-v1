"use client";

import React, { useState, useEffect } from "react";

export default function ButterToastProposalPage() {
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  // Today's date password (e.g., 20260723 or 0723)
  const VALID_PASSWORDS = ["20260723", "0723"];

  useEffect(() => {
    // Check if previously unlocked in this session
    const unlocked = sessionStorage.getItem("proposal_unlocked_butter_toast");
    if (unlocked === "true") {
      setIsUnlocked(true);
    }
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (VALID_PASSWORDS.includes(password.trim())) {
      setIsUnlocked(true);
      sessionStorage.setItem("proposal_unlocked_butter_toast", "true");
      setErrorMsg("");
    } else {
      setErrorMsg("密碼不正確，請重新輸入（提示：本日日期 8 碼或 4 碼）");
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isUnlocked) return;
    if (e.key === "ArrowRight" || e.key === " ") {
      setCurrentSlide((prev) => Math.min(prev + 1, 6));
    } else if (e.key === "ArrowLeft") {
      setCurrentSlide((prev) => Math.max(prev - 1, 0));
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isUnlocked]);

  // Password Input Screen (Japanese Minimalist Style)
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[#F7F3ED] text-[#382D24] flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md bg-[#FFFDF9] border border-[#E6DDCF] rounded-3xl p-8 shadow-xl text-center backdrop-blur-md">
          <div className="w-16 h-16 bg-[#EFE7DA] text-[#B26A27] rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-[#D6A86E]">
            🔒
          </div>
          <h1 className="text-2xl font-bold font-serif mb-2 text-[#382D24]">
            【奶油吐司】AI 店長服務提案
          </h1>
          <p className="text-sm text-[#7C6E62] mb-6">
            本專案報價為受保護內容，請輸入授權瀏覽密碼以檢視專案細節。
          </p>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="請輸入瀏覽密碼 (如: 20260723)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#F7F3ED] border border-[#E6DDCF] rounded-xl text-center text-lg focus:outline-none focus:border-[#B26A27] text-[#382D24] placeholder-[#A39587]"
                autoFocus
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-red-600 font-medium">{errorMsg}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-[#B26A27] hover:bg-[#8F521B] text-[#FFFDF9] font-bold rounded-xl shadow-md transition-all duration-200"
            >
              解鎖檢視報價提案
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#E6DDCF] text-xs text-[#A39587]">
            bot.ycideas.com 專屬安全加密報價系統
          </div>
        </div>
      </div>
    );
  }

  // Interactive Slides (Rendered when Unlocked)
  const slides = [
    // Slide 1: Cover
    {
      badge: "🍞 奶油吐司 AI 店長提案",
      content: (
        <div className="text-center py-6">
          <h1 className="text-4xl md:text-5xl font-extrabold font-serif mb-4 leading-tight text-[#382D24]">
            LINE 官方帳號全包建置<br />
            <span className="text-[#B26A27]">✕ AI 智慧店長服務</span>
          </h1>
          <p className="text-lg text-[#7C6E62] max-w-xl mx-auto mb-8">
            0 到 1 打造 5,000 會員自動化點餐算錢與全代營運閉環
          </p>
          <span className="inline-block px-6 py-2 bg-[#B26A27] text-[#FFFDF9] rounded-full text-sm font-bold shadow-md">
            工作室模式 / 現金面交 / 無小編最佳解答
          </span>
        </div>
      ),
    },
    // Slide 2: Challenges
    {
      badge: "5,000人規模規劃",
      title: "工作室現況與核心痛點",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-[#E6DDCF] rounded-2xl p-5 shadow-sm hover:border-[#D6A86E] transition">
            <div className="text-2xl mb-1">🏠</div>
            <h3 className="font-serif font-bold text-lg text-[#B26A27] mb-1">痛點 1：無實體內用店面</h3>
            <p className="text-sm text-[#7C6E62]">中央廚房工作室模式，缺乏門市接待。需 24hr 自動指引「指定地址面交」與「取餐導航」。</p>
          </div>
          <div className="bg-white border border-[#E6DDCF] rounded-2xl p-5 shadow-sm hover:border-[#D6A86E] transition">
            <div className="text-2xl mb-1">🧮</div>
            <h3 className="font-serif font-bold text-lg text-[#B26A27] mb-1">痛點 2：現金面交，人工算錢耗時</h3>
            <p className="text-sm text-[#7C6E62]">無線上刷卡，需人工計算多品項數量金額。AI 店長需具備精確自動算錢與生成訂單明細能力。</p>
          </div>
          <div className="bg-white border border-[#E6DDCF] rounded-2xl p-5 shadow-sm hover:border-[#D6A86E] transition">
            <div className="text-2xl mb-1">👥</div>
            <h3 className="font-serif font-bold text-lg text-[#B26A27] mb-1">痛點 3：團隊內部無 LINE 小編</h3>
            <p className="text-sm text-[#7C6E62]">缺乏視覺設計與運營人力。需要全權委外進行 0 到 1 官方帳號視覺包裝與每月代營運。</p>
          </div>
          <div className="bg-white border border-[#E6DDCF] rounded-2xl p-5 shadow-sm hover:border-[#D6A86E] transition">
            <div className="text-2xl mb-1">📈</div>
            <h3 className="font-serif font-bold text-lg text-[#B26A27] mb-1">痛點 4：5,000 會員流量負擔</h3>
            <p className="text-sm text-[#7C6E62]">每日約 50 人對話詢問。需要高容量 AI 大腦穩定接單與限量預購推播導購。</p>
          </div>
        </div>
      ),
    },
    // Slide 3: Core Modules
    {
      badge: "奶油吐司客製化",
      title: "四大專屬 AI 服務模組",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-[#E6DDCF] rounded-2xl p-5 shadow-sm hover:border-[#D6A86E] transition">
            <div className="text-2xl mb-1">🎨</div>
            <h3 className="font-serif font-bold text-lg text-[#B26A27] mb-1">01. LINE 0 到 1 品牌視覺包裝</h3>
            <p className="text-sm text-[#7C6E62]">官方帳號申請、品牌 Banner 設計，以及專屬 6 格高質感圖文選單 (Rich Menu)。</p>
          </div>
          <div className="bg-white border border-[#E6DDCF] rounded-2xl p-5 shadow-sm hover:border-[#D6A86E] transition">
            <div className="text-2xl mb-1">🤖</div>
            <h3 className="font-serif font-bold text-lg text-[#B26A27] mb-1">02. AI 點餐與金額試算系統</h3>
            <p className="text-sm text-[#7C6E62]">辨識品項與數量（生吐司x2+布丁x3）➔ 自動試算總金額 ➔ 產出現金面交訂單明細 ＋ Notify 通知。</p>
          </div>
          <div className="bg-white border border-[#E6DDCF] rounded-2xl p-5 shadow-sm hover:border-[#D6A86E] transition">
            <div className="text-2xl mb-1">📚</div>
            <h3 className="font-serif font-bold text-lg text-[#B26A27] mb-1">03. 無內用導覽與 FAQ 知識庫</h3>
            <p className="text-sm text-[#7C6E62]">24/7 自動解答無內用說明、面交地址導航，以及生吐司/甜點冷凍重烤教學。</p>
          </div>
          <div className="bg-white border border-[#E6DDCF] rounded-2xl p-5 shadow-sm hover:border-[#D6A86E] transition">
            <div className="text-2xl mb-1">🚀</div>
            <h3 className="font-serif font-bold text-lg text-[#B26A27] mb-1">04. 5,000 會員 CRM 與代營運</h3>
            <p className="text-sm text-[#7C6E62]">每月 2 次限量預購圖文推播設計與發送 ＋ 每週 AI 菜單優化與未解答巡檢。</p>
          </div>
        </div>
      ),
    },
    // Slide 4: Pricing & Payment
    {
      badge: "5% 營業稅標註",
      title: "專案報價與發票稅金明細",
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border-2 border-[#D6A86E] rounded-2xl p-4 shadow-sm">
              <h4 className="font-bold text-[#B26A27]">🛠️ 【一次性】建置與開發費</h4>
              <div className="text-2xl font-extrabold text-[#B26A27] my-1">
                NT$ 28,000 <span className="text-xs text-[#7C6E62] font-normal">(未稅)</span>
              </div>
              <p className="text-xs text-[#7C6E62] mb-2">🧾 加 5% 營業稅 ($1,400) ＝ <b>含稅總額 NT$ 29,400</b></p>
              <ul className="text-xs text-[#382D24] space-y-1">
                <li>✓ LINE 官方帳號 0 到 1 品牌視覺設計</li>
                <li>✓ 專屬 6 格圖文選單 (Rich Menu) 開發</li>
                <li>✓ AI 多品項點餐算錢引擎與 Notify 串接</li>
                <li>✓ 奶油吐司專屬 RAG 知識庫深度訓練</li>
              </ul>
            </div>

            <div className="bg-white border-2 border-[#D6A86E] rounded-2xl p-4 shadow-sm">
              <h4 className="font-bold text-[#B26A27]">💳 【每月】代營運與 AI 系統費</h4>
              <div className="text-2xl font-extrabold text-[#B26A27] my-1">
                NT$ 4,800 <span className="text-xs text-[#7C6E62] font-normal">/ 月 (未稅)</span>
              </div>
              <p className="text-xs text-[#7C6E62] mb-2">🧾 加 5% 營業稅 ($240) ＝ <b>含稅 NT$ 5,040 /月</b></p>
              <ul className="text-xs text-[#382D24] space-y-1">
                <li>✓ 5,000 會員 AI 流量 (上限 20,000 則/月)</li>
                <li>✓ 每月 2 次限量預購圖文推播設計發送</li>
                <li>✓ 每週 AI 菜單更新與未解答對話優化</li>
                <li>✓ 每月對話與點餐數據戰情月報</li>
              </ul>
            </div>
          </div>

          <div className="bg-[#EFE7DA] border border-dashed border-[#D6A86E] rounded-xl p-3 flex flex-wrap justify-around text-center text-xs">
            <div>
              <span className="text-[#7C6E62] block">第一期：簽約訂金 (50%)</span>
              <span className="font-bold text-[#B26A27] text-sm">NT$ 14,000 (含稅$14,700)</span>
              <span className="block text-[10px] text-[#B26A27] font-semibold bg-[#FFFDF9] px-2 py-0.5 rounded mt-0.5">🏦 銀行轉帳/匯款</span>
            </div>
            <div className="self-center text-[#D6A86E] font-bold text-base">➔</div>
            <div>
              <span className="text-[#7C6E62] block">第二期：交案尾款 (50%)</span>
              <span className="font-bold text-[#B26A27] text-sm">NT$ 14,000 (含稅$14,700)</span>
              <span className="block text-[10px] text-[#B26A27] font-semibold bg-[#FFFDF9] px-2 py-0.5 rounded mt-0.5">🏦 銀行轉帳/匯款</span>
            </div>
            <div className="self-center text-[#D6A86E] font-bold text-base">➔</div>
            <div>
              <span className="text-[#7C6E62] block">每月代營運系統費</span>
              <span className="font-bold text-[#B26A27] text-sm">NT$ 4,800 (含稅$5,040/月)</span>
              <span className="block text-[10px] text-[#B26A27] font-semibold bg-[#FFFDF9] px-2 py-0.5 rounded mt-0.5">💳 藍新定期定額扣款</span>
            </div>
          </div>

          {/* NewebPay Security Disclaimer Box */}
          <div className="bg-white border border-[#E6DDCF] rounded-xl p-3 text-[11px] text-[#7C6E62] leading-relaxed flex items-start gap-2">
            <span className="text-base text-[#B26A27]">🛡️</span>
            <div>
              <strong className="text-[#B26A27] block mb-0.5">藍新金流 (NewebPay) 安全防護與定期定額宣告：</strong>
              本公司採用『藍新金流 (NewebPay) 第三方支付平台』辦理信用卡定期定額交易，全站傳輸採用最高等級 256-bit SSL 加密安全防護，並通過 PCI-DSS 國際卡隊安全認證。本公司絕不會儲存您的完整信用卡號碼。每月扣款完成後將由藍新金流系統自動開立電子發票發送至您的 Email，提供您最安全、透明、無虞的交易環境。
            </div>
          </div>
        </div>
      ),
    },
    // Slide 5: Timeline
    {
      badge: "共計 3 週上線",
      title: "專案製作時間與交案流程",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-[#E6DDCF] rounded-2xl p-5 shadow-sm">
            <span className="inline-block px-2.5 py-0.5 bg-[#B26A27] text-[#FFFDF9] rounded-full text-xs font-bold mb-2">PHASE 1 (Week 1)</span>
            <h4 className="font-serif font-bold text-[#B26A27] mb-2">素材收集與專案啟動</h4>
            <ul className="text-xs text-[#7C6E62] space-y-1.5">
              <li>✓ 簽訂合約並<b>轉帳付訂金 $14,000 (含稅$14,700)</b></li>
              <li>✓ 收集菜單品項、價格、面交地址與門檻</li>
              <li>✓ 開通 LINE 官方帳號管理權限並開立發票</li>
            </ul>
          </div>
          <div className="bg-white border border-[#E6DDCF] rounded-2xl p-5 shadow-sm">
            <span className="inline-block px-2.5 py-0.5 bg-[#B26A27] text-[#FFFDF9] rounded-full text-xs font-bold mb-2">PHASE 2 (Week 2)</span>
            <h4 className="font-serif font-bold text-[#B26A27] mb-2">視覺設計與 AI 開發</h4>
            <ul className="text-xs text-[#7C6E62] space-y-1.5">
              <li>✓ 6格 Rich Menu 圖文選單視覺設計</li>
              <li>✓ AI 點餐算錢引擎與 Notify 通知串接</li>
              <li>✓ 載入 50+ 題問答與保存重烤知識庫</li>
            </ul>
          </div>
          <div className="bg-white border border-[#E6DDCF] rounded-2xl p-5 shadow-sm">
            <span className="inline-block px-2.5 py-0.5 bg-[#B26A27] text-[#FFFDF9] rounded-full text-xs font-bold mb-2">PHASE 3 (Week 3)</span>
            <h4 className="font-serif font-bold text-[#B26A27] mb-2">測試驗收與正式交案</h4>
            <ul className="text-xs text-[#7C6E62] space-y-1.5">
              <li>✓ 雙方進行點餐算錢與接管流程實測</li>
              <li>✓ 驗收通過<b>轉帳付尾款 $14,000 (含稅$14,700)</b></li>
              <li>✓ 設定藍新定期定額 ($5,040/月含稅)，正式上線！</li>
            </ul>
          </div>
        </div>
      ),
    },
    // Slide 6: Checklist
    {
      badge: "完整交付項目",
      title: "詳細服務與交付對照表",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-[#E6DDCF] rounded-2xl p-5 shadow-sm">
            <h4 className="font-bold text-[#B26A27] mb-2">📌 建置期交付項目 (一次性)</h4>
            <ul className="text-xs text-[#382D24] space-y-1.5">
              <li>✓ LINE 帳號權限與主頁 Banner 包裝</li>
              <li>✓ 6格 Rich Menu (點餐/面交/保存/預購/小編/會員)</li>
              <li>✓ AI 語意點餐算錢與單價加總邏輯</li>
              <li>✓ 現金面交訂單明細 Flex Message 生成</li>
              <li>✓ 備貨小編 LINE Notify 訊息推播串接</li>
            </ul>
          </div>
          <div className="bg-white border border-[#E6DDCF] rounded-2xl p-5 shadow-sm">
            <h4 className="font-bold text-[#B26A27] mb-2">🔄 代營運交付項目 (每月持續)</h4>
            <ul className="text-xs text-[#382D24] space-y-1.5">
              <li>✓ 每月 2 次限量預購 Banner 設計與發送</li>
              <li>✓ 每週巡檢 AI 未解答對話並補充知識庫</li>
              <li>✓ 季節甜點上架與價格即時調整</li>
              <li>✓ 5,000 會員偏好標籤維護與數據月報</li>
            </ul>
          </div>
        </div>
      ),
    },
    // Slide 7: ROI
    {
      badge: "商業價值總結",
      title: "核心效益與 ROI 評估",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-[#E6DDCF] rounded-2xl p-5 shadow-sm">
            <div className="text-2xl mb-1">💰</div>
            <h3 className="font-serif font-bold text-[#B26A27] mb-1">節省 85% 人力費用</h3>
            <p className="text-xs text-[#7C6E62]">聘請專職小編月薪至少 NT$ 30,000+；全包方案每月僅 $4,800 (含稅$5,040)，省下龐大固定成本。</p>
          </div>
          <div className="bg-white border border-[#E6DDCF] rounded-2xl p-5 shadow-sm">
            <div className="text-2xl mb-1">⏱️</div>
            <h3 className="font-serif font-bold text-[#B26A27] mb-1">每日省 3.3 小時接單時間</h3>
            <p className="text-xs text-[#7C6E62]">AI 24 小時精確算錢與出單，每天處理 50 人對話，讓老闆專心做甜點。</p>
          </div>
          <div className="bg-white border border-[#E6DDCF] rounded-2xl p-5 shadow-sm">
            <div className="text-2xl mb-1">📈</div>
            <h3 className="font-serif font-bold text-[#B26A27] mb-1">推播輕鬆賺回月費</h3>
            <p className="text-xs text-[#7C6E62]">每月 2 次限量預購推播帶動 10 筆生吐司訂單，即可完全覆蓋每月營運費用。</p>
          </div>
          <div className="bg-white border border-[#E6DDCF] rounded-2xl p-5 shadow-sm">
            <div className="text-2xl mb-1">🤝</div>
            <h3 className="font-serif font-bold text-[#B26A27] mb-1">開箱即用，零學習負擔</h3>
            <p className="text-xs text-[#7C6E62]">完全不需要學習複雜的後台操作，從視覺設計到 AI 維護全包服務。</p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F3ED] text-[#382D24] flex flex-col justify-between items-center p-4 md:p-8 font-sans">
      {/* Top Header */}
      <header className="w-full max-w-5xl flex justify-between items-center pb-4 border-b border-[#E6DDCF]">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-[#EFE7DA] border border-[#D6A86E] text-[#B26A27] rounded-full text-xs font-bold">
            {slides[currentSlide].badge}
          </span>
        </div>
        <div className="text-xs text-[#7C6E62] font-mono">
          bot.ycideas.com / proposals / butter-toast
        </div>
      </header>

      {/* Main Slide Card */}
      <main className="w-full max-w-5xl flex-1 my-6 bg-[#FFFDF9] border border-[#E6DDCF] rounded-3xl p-6 md:p-10 shadow-xl flex flex-col justify-between backdrop-blur-md">
        {slides[currentSlide].title && (
          <h2 className="text-2xl md:text-3xl font-bold font-serif text-[#382D24] mb-6">
            {slides[currentSlide].title}
          </h2>
        )}

        <div className="flex-1 flex flex-col justify-center">
          {slides[currentSlide].content}
        </div>
      </main>

      {/* Bottom Controls */}
      <footer className="w-full max-w-5xl flex justify-between items-center">
        <div className="text-xs font-mono font-bold text-[#7C6E62]">
          SLIDE {currentSlide + 1} / {slides.length}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentSlide((prev) => Math.max(prev - 1, 0))}
            disabled={currentSlide === 0}
            className="px-5 py-2 bg-white border border-[#E6DDCF] rounded-full text-sm font-bold text-[#382D24] hover:bg-[#B26A27] hover:text-[#FFFDF9] disabled:opacity-30 transition shadow-sm"
          >
            ← 上一頁
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1))}
            disabled={currentSlide === slides.length - 1}
            className="px-5 py-2 bg-white border border-[#E6DDCF] rounded-full text-sm font-bold text-[#382D24] hover:bg-[#B26A27] hover:text-[#FFFDF9] disabled:opacity-30 transition shadow-sm"
          >
            下一頁 →
          </button>
          <button
            onClick={() => window.print()}
            className="px-5 py-2 bg-[#EFE7DA] border border-[#D6A86E] text-[#B26A27] rounded-full text-sm font-bold hover:bg-[#B26A27] hover:text-[#FFFDF9] transition shadow-sm"
          >
            🖨️ 列印 / PDF
          </button>
        </div>
      </footer>
    </div>
  );
}
