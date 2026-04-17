'use client';

interface SEOMetadataProps {
    jsonLd: any;
}

export default function SEOMetadata({ jsonLd }: SEOMetadataProps) {
    return (
        <>
            {/* JSON-LD Structured Data for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(jsonLd),
                }}
            />

            {/* Hidden SEO Narrative for Search Engines */}
            <section className="sr-only">
                <h2>AI 智能店長 Pro：LINE 官方帳號 API 自動客服與自動接單系統</h2>
                <p>
                    專為實體店面、個人工作室與電商品牌打造的 LINE 【官方帳號】專用 AI 智能店長輔助工具。
                    整合 GPT-4o 與 RAG 知識庫技術，提供 24 小時無間斷的自動化客服、精準商品介紹、智慧回訓與自動成交功能。
                    透過 AI 數位轉型，提升 300% 以上的溝通效率，讓您的 LINE OA 轉型為最強大的 24H 銷售員與客戶關係管理 (CRM) 中心。
                </p>
                <ul>
                    <li>24/7 全天候 LINE 自動化銷售與真人擬真客服</li>
                    <li>RAG 深度學習：一鍵匯入官網與 PDF 文件建置智庫</li>
                    <li>支援 GPT-4o 視覺辨識：精準解析客戶上傳的圖片內容</li>
                    <li>CRM 自動打標籤與精準對話數據分析</li>
                    <li>免 API Key、秒速開通的 LINE 官方帳號 AI 解決方案</li>
                </ul>
            </section>
        </>
    );
}
