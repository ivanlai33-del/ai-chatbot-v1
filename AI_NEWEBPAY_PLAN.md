# 藍新金流模組化與訂閱自動化串接計畫 (6種方案校準版)

因為系統框架的暫時性限制，我改將完整藍圖輸出於此供您檢視。

## 📍 核心架構分為四大模組：

### 1. 方案配置中心 (Pricing Config)
我們將建立嚴謹的 6 大定價模型。以下為實際更新後的配置：

```typescript
export const NEWEBPAY_PRICING_PLANS = {
  level_1: {
    id: "level_1", name: "入門嚐鮮", quota: 500, 
    pricing: {
      monthlyOriginal: 249,
      monthlyDiscount: 199,    // 月繳實付
      yearlyOriginal: 2988,
      yearlyDiscount: 2189,    // 年繳實付 (省 199)
    }
  },
  level_2: {
    id: "level_2", name: "單店主力", quota: 2000, 
    pricing: {
      monthlyOriginal: 629,
      monthlyDiscount: 499,
      yearlyOriginal: 7548,
      yearlyDiscount: 5489, 
    }
  },
  level_3: {
    id: "level_3", name: "成長多店", quota: 5000, 
    pricing: {
      monthlyOriginal: 1649,
      monthlyDiscount: 1299,
      yearlyOriginal: 19788,
      yearlyDiscount: 14289, 
    }
  },
  level_4: {
    id: "level_4", name: "連鎖專業", quota: 10000, 
    pricing: {
      monthlyOriginal: 3090,
      monthlyDiscount: 2490,
      yearlyOriginal: 37080,
      yearlyDiscount: 27390, 
    }
  },
  level_5: {
    id: "level_5", name: "旗艦 Lite", quota: -1, 
    pricing: {
      monthlyOriginal: 6290,
      monthlyDiscount: 4990,
      yearlyOriginal: 75480,
      yearlyDiscount: 54890, 
    }
  },
  level_6: {
    id: "level_6", name: "旗艦 Pro", quota: -1, 
    pricing: {
      monthlyOriginal: 9990,
      monthlyDiscount: 7990,
      yearlyOriginal: 119880,
      yearlyDiscount: 87890, 
    }
  }
}
```

### 2. 藍新加密引擎 (NewebPay Crypto Engine)
負責 `AES-256-CBC` 與 `SHA256` 加密。

### 3. 動態結帳路由器 (Checkout API)
自動判定這 6 種方案是該送往「單筆」還是「定期定額」。

### 4. Webhook 接收與授權器 (Webhook API)
成功扣款後自動呼叫 Supabase 將設定寫入。

---
❓最後確認：
您是否已經向藍新勾選開通「信用卡定期定額」API？
