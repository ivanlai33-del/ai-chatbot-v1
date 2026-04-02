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
                <h2>LINE 智能店長 Pro：您的最佳 AI 官方帳號輔助方案</h2>
                <p>
                    專為個人工作室與企業打造的 LINE 【官方帳號】專用 AI 智能店長。
                    整合最新 AI 技術，提供 24 小時無間斷的自動化客服、商品導購、智庫學習與自動成交功能。
                    提升 3 倍以上的客服效率，讓您的 LINE 帳號成為最強大的金牌銷售員與自動化行銷中心。
                </p>
                <ul>
                    <li>24/7 全天候自動化銷售與服務</li>
                    <li>精準 AI 語意辨識與智庫擬真回覆</li>
                    <li>秒速成交的導購與變現流程</li>
                    <li>無縫整合 LINE 【官方帳號】生態</li>
                </ul>
            </section>
        </>
    );
}
