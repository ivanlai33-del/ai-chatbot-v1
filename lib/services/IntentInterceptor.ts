import { StockService } from './StockService';
import { WeatherService } from './WeatherService';
import { ForexService } from './ForexService';

export interface InterceptedContext {
    intent: 'stock' | 'weather' | 'forex' | 'chat';
    data: any;
}

export class IntentInterceptor {
    static async intercept(text: string): Promise<InterceptedContext> {
        // 基本清理，但不隨便全域替換「台」，因為股市通常用「台積電」，而氣象局用「臺北」
        const cleanText = text.toLowerCase().trim();

        // 1. Stock Detection (Stricter)
        const stockMatch = cleanText.match(/\b(\d{4})\b/);
        const stockKeywords = ["股價", "分析", "股票", "行情", "代碼", "財報", "台積電", "臺積電", "鴻海", "聯發科", "長榮", "陽明", "萬海", "中鋼", "富邦金", "國泰金", "廣達", "緯創"];
        const hasStockKeyword = stockKeywords.some(k => cleanText.includes(k));

        if (stockMatch || hasStockKeyword) {
            const isPureSymbol = cleanText.length === 4 && stockMatch;
            
            if (hasStockKeyword || isPureSymbol) {
                // 萃取關鍵字，針對台積電等名字做保留
                let query = stockMatch ? stockMatch[1] : cleanText.replace(/[請問幫我查看看的行情股價分析?？\s代碼股票]/g, '');
                // 確保股市查詢時把「臺」轉回「台」，因為 STOCK_NAMES 定義的是「台積電」
                query = query.replace(/臺/g, '台');
                const stockData = await StockService.getTaiwanStockData(query);
                return { intent: 'stock', data: stockData || { status: "ready_for_tool_call" } };
            }
        }

        // 2. Weather Detection
        const weatherKeywords = ["天氣", "下雨", "氣溫", "溫度", "氣象", "冷嗎", "熱嗎", "太陽", "陰天", "降雨", "預報", "幾度", "冷不冷", "熱不熱"];
        const hasWeatherKeyword = weatherKeywords.some(k => cleanText.includes(k));

        if (hasWeatherKeyword) {
            // 氣象局 API 嚴格要求「臺」字，且只接受 22 個縣市
            const weatherText = cleanText.replace(/台/g, '臺');
            
            // 建立常見鄉鎮市區對應到縣市的字典 (可處理林口天氣等需求)
            const districtToCounty: Record<string, string> = {
                '林口': '新北市', '板橋': '新北市', '三重': '新北市', '中永和': '新北市', '新莊': '新北市', '淡水': '新北市',
                '信義區': '臺北市', '內湖': '臺北市', '大安區': '臺北市', '天母': '臺北市',
                '中壢': '桃園市', '青埔': '桃園市',
                '竹北': '新竹縣',
                '台中': '臺中市', '臺中': '臺中市', '台南': '臺南市', '臺南': '臺南市',
                '台北': '臺北市', '臺北': '臺北市', '新北': '新北市', '桃園': '桃園市', '高雄': '高雄市'
            };

            let targetCounty = "臺北市"; // 預設
            for (const [district, county] of Object.entries(districtToCounty)) {
                if (weatherText.includes(district) || cleanText.includes(district)) {
                    targetCounty = county;
                    break;
                }
            }

            // 如果沒從 mapping 抓到，嘗試直接找主要縣市名
            const majorCounties = ["基隆", "臺北", "新北", "桃園", "新竹", "苗栗", "臺中", "彰化", "南投", "雲林", "嘉義", "臺南", "高雄", "屏東", "宜蘭", "花蓮", "臺東", "澎湖", "金門", "連江"];
            if (targetCounty === "臺北市") {
                const found = majorCounties.find(c => weatherText.includes(c));
                if (found) {
                    targetCounty = found.endsWith("市") || found.endsWith("縣") ? found : found + (["臺北", "臺中", "臺南", "高雄", "新北", "桃園", "基隆", "新竹", "嘉義"].includes(found) ? "市" : "縣");
                }
            }

            try {
                const weatherData = await WeatherService.getCountyForecast(targetCounty);
                // 附上原始查詢的地區，幫助 AI 釐清 (例如: 查詢林口 -> 回傳新北市資料)
                return { intent: 'weather', data: weatherData ? { ...weatherData, _targetCounty: targetCounty } : { status: "ready_for_tool_call" } };
            } catch (e) {
                return { intent: 'weather', data: { status: "ready_for_tool_call" } };
            }
        }

        // 3. Forex Detection (Refined)
        const currencyKeywords = ["美金", "台幣", "幣值", "usd", "twd", "日幣", "jpy"];
        const explicitForexKeywords = ["匯率", "換錢", "兌換", "匯率多少"];
        
        const hasCurrency = currencyKeywords.some(k => cleanText.includes(k.replace(/台/g, '臺')) || cleanText.includes(k));
        const hasExplicitForex = explicitForexKeywords.some(k => cleanText.includes(k));
        
        // "黃金" or "價格" should only trigger if combined with "查" or "多少" or "匯率"
        const isCheckingGold = (cleanText.includes("黃金") || cleanText.includes("gold")) && 
                               (cleanText.includes("價格") || cleanText.includes("多少") || cleanText.includes("查") || cleanText.includes("值"));

        if (hasExplicitForex || (hasCurrency && (cleanText.includes("多少") || cleanText.includes("查") || cleanText.includes("價格"))) || isCheckingGold) {
            try {
                const forexData = await ForexService.getLatestRate('USD', 'TWD', 1);
                return { intent: 'forex', data: forexData || { status: "ready_for_tool_call" } };
            } catch (e) {
                return { intent: 'forex', data: { status: "ready_for_tool_call" } };
            }
        }

        return { intent: 'chat', data: null };
    }
}
