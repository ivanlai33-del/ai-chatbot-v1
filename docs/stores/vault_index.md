# AGI 多店家資料隔離與備份規範 (Data Isolation Policy)

為了確保多店家管理的安全與準確性，系統執行以下隔離準則：

## 1. 物理路徑隔離 (Physical Path)
每間官方帳號擁有獨立的備份目錄，AGI 必須根據 `oa_id` 將對應的 PRD、工作日誌與素材存檔至以下路徑：

- **美業預約 (Beauty Salon)**: `/docs/stores/beauty_salon/`
- **服飾電商 (Fashion E-com)**: `/docs/stores/fashion_eco/`
- **在地餐飲 (Restaurant)**: `/docs/stores/restaurant/`
- **B2B 顧問 (B2B Consulting)**: `/docs/stores/b2b_consulting/`
- **社區學院 (Learning Hub)**: `/docs/stores/learning_hub/`

## 2. 資料庫邏輯隔離 (Logical Isolation)
所有 API 請求必須攜帶 `active_oa_id` 標籤：
- **查詢過濾**: `SELECT * FROM members WHERE oa_id = $ACTIVE_ID;`
- **寫入標記**: `INSERT INTO visual_assets (oa_id, ...) VALUES ($ACTIVE_ID, ...);`

## 3. AGI 記憶防混淆 (Context Protection)
- **場景重置**: 每當使用者在頂部切換帳號，系統會向 AGI 發送 `RESET_CONTEXT` 指令。
- **元數據檢核**: AGI 在調用任何「積木資料」前，必須比對 `metadata.oa_id` 是否與當前 `active_oa_id` 一致。

---
*本規範由 AGI 指揮中心自動執行，確保 100% 數據純淨度。*
