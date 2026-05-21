# 📐 AI 店長 — 元件化架構規範 (Component Architecture Rules)

> **本檔案是本專案的開發強制規範。所有新增或修改的程式碼都必須遵守以下規則。**

---

## 🛡️ 核心原則

1. **每個 `.tsx` 元件最多 200 行** — 超過就必須再拆分
2. **每個元件只接收 props，不直接呼叫 API** — API 邏輯必須放在 `hooks/`
3. **每個功能區塊都必須用 `ErrorBoundary` 包裹** — 確保局部故障不影響整頁
4. **禁止在頁面層 (`app/**/page.tsx`) 撰寫 UI 細節** — 頁面只負責組裝元件
5. **修改任何元件前，確認影響範圍只在該元件的 props 邊界內**

---

## 🗂️ 目錄結構規範

```
app/
├── dashboard/
│   ├── page.tsx              ← 🔴 只負責組裝，不寫 UI 細節
│   └── connect/page.tsx
├── page.tsx                  ← 首頁（Landing）
└── chat/page.tsx

components/
├── dashboard/                ← Dashboard 積木
│   ├── TopNav.tsx
│   ├── KnowledgeBasePanel.tsx
│   ├── AISandboxChat.tsx     ← ★ AI 聊天視窗（獨立積木）
│   ├── UpgradeBanner.tsx
│   └── tabs/                 ← 六個標籤各自獨立
│       ├── BrandDNATab.tsx
│       ├── OfferingsTab.tsx
│       ├── FAQTab.tsx
│       ├── LogicTab.tsx
│       ├── ContactTab.tsx
│       └── RAGTab.tsx
│
├── chat/                     ← 聊天介面積木
│   ├── ChatMessageList.tsx
│   ├── ChatInputBar.tsx
│   └── ChatBotAvatar.tsx     ← ★ LINE 頭像在這裡，改這裡不影響其他
│
├── landing/                  ← 首頁積木
│   ├── HeroSection.tsx
│   ├── PricingSection.tsx
│   └── FeatureGrid.tsx
│
└── ui/                       ← 共用 UI 積木（最小單位）
    ├── InputField.tsx
    ├── TextareaField.tsx
    ├── LockedFeature.tsx
    ├── PlanBadge.tsx
    └── MotionCard.tsx

hooks/
├── useDashboardConfig.ts     ← storeConfig 讀寫邏輯
├── useBotList.ts             ← bot 列表管理
├── useChatSandbox.ts         ← 沙盒聊天狀態
└── useLineAuth.ts            ← LINE 登入狀態
```

---

## 📋 重構優先順序（Backlog）

| 優先 | 狀態 | 任務 |
|---|---|---|
| 🔴 P0 | `[ ]` | 拆 `AISandboxChat.tsx`（含 `ChatBotAvatar.tsx`） |
| 🔴 P0 | `[ ]` | 拆 Dashboard 六個 Tab 元件 |
| 🟠 P1 | `[ ]` | 拆 `KnowledgeBasePanel.tsx` + `useDashboardConfig` hook |
| 🟠 P1 | `[ ]` | 拆 `TopNav.tsx` |
| 🟡 P2 | `[ ]` | 拆 `ChatInterface.tsx`（目前 207KB，最大技術債） |
| 🟡 P2 | `[ ]` | 拆首頁 Landing 各區塊 |
| 🟢 P3 | `[ ]` | 建立 `components/ui/` 共用庫 |
| 🟢 P3 | `[ ]` | 建立 `hooks/` 業務邏輯層 |

---

## ✅ 修改前確認清單

新增或修改任何功能時，請確認：

- [ ] 我的修改是否在一個單一元件的邊界內？
- [ ] 這個元件超過 200 行嗎？如果是，需要先拆分
- [ ] 新功能是否涉及 API 呼叫？如果是，要放在 `hooks/` 而不是元件內
- [ ] 是否已有同功能的共用元件在 `components/ui/` 可以重用？
- [ ] 修改後是否執行過本地建置確認沒有報錯？

---

## 🚫 禁止事項

- 禁止在 `app/**/page.tsx` 寫超過 50 行的 JSX UI 程式碼
- 禁止在元件內直接使用 `fetch()`，必須抽到 hooks 或 `lib/api.ts`
- 禁止在同一個檔案內混合多個不相關的功能邏輯
- 禁止為了快速修改而在已存在的大型元件末尾「追加」程式碼

---

*最後更新：2026-03-20 | 此規範由 AI 與產品負責人共同確認*
