import { Metadata } from 'next';
import IndustrySolutionLayout from '@/components/landing/IndustrySolutionLayout';

export const metadata: Metadata = {
    title: "美容店 LINE 官方帳號 AI 客服｜自動回覆預約、療程與價格問題",
    description: "專為美容工作室、美甲、美睫、護膚與個人品牌設計的 LINE 官方帳號 AI 客服。可自動回覆療程介紹、價目表、預約方式與常見問題，減少重複客服並提高非營業時間預約機會。",
};

export default function BeautySolutionPage() {
    return (
        <IndustrySolutionLayout 
            title="美容店專用 LINE 官方帳號 AI 客服"
            subtitle="美容產業"
            description="如果您的美容工作室每天都在回覆療程差異、價格、可預約時段、注意事項與地址資訊，AI 智能店長可以先替您接住這些高重複訊息。"
            painPoints={[
                { title: '療程差異詢問', desc: '顧客常問「XX 療程跟 YY 療程差在哪？」需要詳盡解釋。' },
                { title: '價目表索取', desc: '重複發送價目表圖片或文字，耗費人工時。' },
                { title: '可預約時段查詢', desc: '半夜或忙碌中無法即時回覆顧客想預約的時間。' },
                { title: '術前術後注意事項', desc: '需要反覆叮嚀顧客注意事項，容易漏掉。' },
                { title: '交通與付款資訊', desc: '詢問店面在哪裡、有沒有刷卡等基本問題。' }
            ]}
            benefits={[
                '詢問高度重複，AI 回覆率高',
                '顧客常在下班後才詢問，AI 24H 接單',
                '預約與成交往往發生在訊息對談中'
            ]}
            scenarios={[
                { title: '回覆療程 FAQ', desc: 'AI 根據智庫內容，專業解釋各項療程特色。' },
                { title: '引導選擇適合方案', desc: '詢問顧客需求並推薦最適合的療程項目。' },
                { title: '提供預約前資訊', desc: '在轉接預約前，先讓顧客了解時段與流程。' },
                { title: '視情況轉真人', desc: '複雜或客製化諮詢由 AI 導流給老師處理。' }
            ]}
            beforeAfter={{
                before: '每天重複回覆療程內容和價錢，佔用現場服務時間',
                after: 'AI 處理 70% 常見問題，老師專心進行療程與高價值成交'
            }}
            faqs={[
                { q: '美容店適合哪個方案？', a: '初級工作室可從入門方案開始，有建立智庫需求建議選擇單店方案。' },
                { q: 'AI 能回答療程差異嗎？', a: '可以。只要上傳療程說明或官網網址，AI 就能學習並準確回答。' },
                { q: '顧客如果要真人諮詢怎麼辦？', a: '系統提供聯絡窗口按鈕，點擊後可將對話標記並引導至真人。' },
                { q: '可以學習我的價目表與活動資訊嗎？', a: '可以，支援 PDF、圖文或網頁一鍵學習。' }
            ]}
        />
    );
}
