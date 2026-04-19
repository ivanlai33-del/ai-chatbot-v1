import { Metadata } from 'next';
import IndustrySolutionLayout from '@/components/landing/IndustrySolutionLayout';

export const metadata: Metadata = {
    title: "零售品牌 LINE AI 客服機器人｜自動回覆商品、尺寸、出貨與導購問題",
    description: "專為服飾、選物、電商品牌與零售店家打造的 LINE AI 客服機器人。可自動回覆商品資訊、尺寸、顏色、價格、出貨與退換貨問題，讓 LINE 官方帳號成為 24 小時導購與客服入口。",
};

export default function RetailSolutionPage() {
    return (
        <IndustrySolutionLayout 
            title="零售品牌專用 LINE AI 客服與導購機器人"
            subtitle="零售品牌"
            description="對零售品牌來說，LINE 官方帳號不只是客服工具，更是成交入口。AI 智能店長能幫您自動回覆商品規格、尺寸建議與運送規則。"
            painPoints={[
                { title: '尺寸選購建議', desc: '顧客常問「我身高 160 體重 50 要穿幾號？」需要即時回應。' },
                { title: '庫存與顏色查詢', desc: '詢問特定商品是否有貨，或有哪些款式選擇。' },
                { title: '商品差異比較', desc: '顧客猶豫不決時，AI 輔助說明兩款產品的優劣。' },
                { title: '出貨進度詢問', desc: '「我前天訂的什麼時候會到？」等物流重複問題。' },
                { title: '退換貨政策詳解', desc: '反覆解釋退換貨流程、時間與注意事項。' }
            ]}
            benefits={[
                '成交前問題集中在 LINE，AI 可縮短決策時間',
                '顧客想要快速知道商品差異，提高點擊率',
                '回覆速度直接影響訂單轉化率'
            ]}
            scenarios={[
                { title: '根據智庫回覆商品', desc: 'AI 自動抓取最新的產品詳細手冊進行回覆。' },
                { title: '引導比較品項', desc: '提供兩款商品的規格對比，加速顧客下單。' },
                { title: '推薦適合商品', desc: '根據顧客描述的需求（如送禮），推薦合適單品。' },
                { title: '高意圖客人轉真人', desc: '當顧客展現強烈購買意願時，即時通知真人業務。' }
            ]}
            beforeAfter={{
                before: '小編忙於回覆運費和尺寸，沒時間優化行銷策略',
                after: 'AI 處理 85% 重複詢問，小編專注於新品開發與 CRM 經營'
            }}
            faqs={[
                { q: '可以學習商品資料與 FAQ 嗎？', a: '可以，您可以上傳商品規格表或 PDF，AI 能快速掌握成千上萬的 SKU 資訊。' },
                { q: '適合有很多 SKU 的品牌嗎？', a: '非常適合，這正是 AI 強大的地方，不用怕小編記不起來商品細節。' },
                { q: '可以導到官網或結帳頁嗎？', a: '可以，AI 可在回覆中精準帶入商品結帳連結。' },
                { q: '需要自己維護 API 嗎？', a: '不需要，這是一站式管理平台，對一般電商經營者非常友善。' }
            ]}
        />
    );
}
