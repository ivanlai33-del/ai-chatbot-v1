import { Metadata } from 'next';
import IndustrySolutionLayout from '@/components/landing/IndustrySolutionLayout';

export const metadata: Metadata = {
    title: "餐飲業 LINE AI 客服與自動接單｜自動回覆菜單、訂位與營業資訊",
    description: "適合餐廳、飲料店、小吃店與外帶外送品牌的 LINE AI 客服工具。可自動回覆菜單、營業時間、訂位方式、外帶外送與常見問題，幫助餐飲店家 24 小時接住顧客詢問與商機。",
};

export default function RestaurantSolutionPage() {
    return (
        <IndustrySolutionLayout 
            title="餐飲業專用 LINE AI 客服與自動接單助手"
            subtitle="餐飲業"
            backgroundImage="/images/backgrounds/bg-restaurant-service.svg"
            description="餐飲店家最怕的不是沒客人，而是顧客想問菜單、訂位、外帶、營業時間時沒人回。AI 智能店長可讓 LINE 官方帳號 24 小時接住所有詢問。"
            painPoints={[
                { title: '營業時間與店休查詢', desc: '今天有沒有開？最後收客到幾點？這些問題反覆詢問頻率極高。' },
                { title: '菜單內容與推薦', desc: '顧客想看完整菜單，或詢問哪些是店內推薦、是否有素食等。' },
                { title: '訂位方式諮詢', desc: '詢問如何訂位、幾人可以訂位、可否外帶等流程。' },
                { title: '外帶外送資訊', desc: '有沒有搭配外送平台？外帶多少錢？有哪些優惠活動？' },
                { title: '特殊需求溝通', desc: '分開結帳、能否帶寵物、自備容器等瑣碎細節詢問。' }
            ]}
            benefits={[
                '顧客詢問集中在營業尖峰與休息時段，AI 完美補位',
                '現場店員忙線中無法即時回訊，AI 可先穩定顧客',
                '多數餐飲問題皆為高重複標準答案，AI 準確率極高'
            ]}
            scenarios={[
                { title: '回覆菜單與營業資訊', desc: 'AI 自動遞送最新菜單與今日營業狀態，不漏接任何意願。' },
                { title: '引導預約/訂位流程', desc: '說明訂位規範，並引導至店家的指定訂位系統。' },
                { title: '提供外帶/外送資訊', desc: '主動說明外送區間、平台連結或店內自取優惠。' },
                { title: '將複雜訂單導向真人', desc: '針對大型包場、特殊訂單，即時提醒老闆親自處理。' }
            ]}
            beforeAfter={{
                before: '尖峰時段顧不到 LINE，容易漏掉晚上和週末的貴重訂位詢問',
                after: 'AI 先回覆基本資訊，店員與老闆專心現場出餐與服務'
            }}
            faqs={[
                { q: '餐飲店可以放菜單給 AI 學嗎？', a: '可以，支援 PDF 或圖片連結，讓 AI 熟記每道菜色的內容與特色。' },
                { q: '可以處理訂位或外帶詢問嗎？', a: '可以，AI 可引導顧客遵循流程，大幅減少電話查詢的頻率。' },
                { q: '如果顧客問題超出範圍怎麼辦？', a: '系統提供真人切換機制，針對特殊要求可即時推播給老闆。' },
                { q: '適合單店還是連鎖店？', a: '皆適合。連鎖店更可透過「成長方案」統一管理各分店的 AI 回覆。' }
            ]}
        />
    );
}
