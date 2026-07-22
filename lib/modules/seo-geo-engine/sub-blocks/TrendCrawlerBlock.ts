import { CrawlerService } from '@/lib/services/CrawlerService';

export class TrendCrawlerBlock {
    /**
     * 根據產業名稱自動挖掘最新的關鍵字與顧客痛點
     */
    static async mineIndustryTrends(industry: string): Promise<{ keywords: string[]; painPoints: string[] }> {
        try {
            console.log(`[TrendCrawlerBlock] Mining trends for industry: ${industry}`);
            
            // 預設常見產業長尾關鍵字 mapping (高速備援)
            const fallbackMap: Record<string, { keywords: string[]; painPoints: string[] }> = {
                '美業': {
                    keywords: ['LINE 自動預約', '美睫美甲 價目秒回', '美業排班 機器人', '半夜預約 不漏單'],
                    painPoints: ['半夜客人訊息沒人回', '常見價目與注意事項重複打字', '來回溝通空檔時間浪費時間']
                },
                '餐飲': {
                    keywords: ['餐飲 LINE 秒回菜單', '外帶訂位 自動客服', '火鍋燒肉 尖峰接單', '餐廳 導購 機器人'],
                    painPoints: ['餐期手忙腳亂沒空回 LINE', '外帶菜單與營業時間重複發問', '尖峰時間客人等太久轉頭吃別家']
                },
                '服飾': {
                    keywords: ['女裝選物 LINE 導購', '服飾尺寸 自動建議', '現貨庫存 24H 回覆', '服飾店 轉單 機器人'],
                    painPoints: ['天天回答 160/55 要穿什麼尺寸', '現貨跟追加時間重複說明', '問一問就消失無法臨門一腳轉單']
                },
                '寵物': {
                    keywords: ['寵物用品 LINE 客服', '寵物醫院 門市地圖', '處方飼料 購買卡片', '寵物店 導購 機器人'],
                    painPoints: ['客人詢問附近哪裡有合作販售據點', '飼料與保健品成分與適用犬貓問題', '半夜急問營業時間與看診須知']
                }
            };

            const matchedKey = Object.keys(fallbackMap).find(k => industry.includes(k));
            if (matchedKey) {
                return fallbackMap[matchedKey];
            }

            // 預設通用關鍵字
            return {
                keywords: [`${industry} LINE 客服`, `${industry} 自動回覆 推薦`, `${industry} 24H 接單`, `${industry} 轉單 機器人`],
                painPoints: ['訊息太慢回導致顧客流失', '常見問題重複回覆耗費人力', '非營業時間無法即時接單']
            };
        } catch (error) {
            console.error('[TrendCrawlerBlock] Error:', error);
            return {
                keywords: [`${industry} LINE 自動客服`, `${industry} 導購機器人`],
                painPoints: ['訊息回覆不及時', '重複問題處理耗時']
            };
        }
    }
}
