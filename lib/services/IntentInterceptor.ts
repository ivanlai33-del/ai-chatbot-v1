import { StockService } from './StockService';
import { WeatherService } from './WeatherService';
import { ForexService } from './ForexService';

export interface InterceptedContext {
    intent: 'stock' | 'weather' | 'forex' | 'chat';
    data: any;
}

export class IntentInterceptor {
    static async intercept(text: string): Promise<InterceptedContext> {
        // Character Normalization: Traditional/Simplified and Typo handling
        const normalized = text.toLowerCase().trim().replace(/台/g, '臺');

        // 1. Stock Detection
        const stockMatch = normalized.match(/(\d{4})/);
        const stockKeywords = ["股價", "分析", "股票", "行情", "代碼", "財報", "台積電", "鴻海", "聯發科", "長榮", "陽明", "萬海", "中鋼", "富邦金", "國泰金", "廣達", "緯創"];
        const hasStockKeyword = stockKeywords.some(k => normalized.includes(k.replace(/台/g, '臺')));

        if (stockMatch || hasStockKeyword) {
            const query = stockMatch ? stockMatch[1] : normalized.replace(/[請問幫我查看看的行情股價分析?？\s代碼股票]/g, '');
            const stockData = await StockService.getTaiwanStockData(query);
            return { intent: 'stock', data: stockData || { status: "ready_for_tool_call" } };
        }

        // 2. Weather Detection
        const counties = ["基隆", "臺北", "新北", "桃園", "新竹", "苗栗", "臺中", "彰化", "南投", "雲林", "嘉義", "臺南", "高雄", "屏東", "宜蘭", "花蓮", "臺東", "澎湖", "金門", "連江", "板橋", "淡水", "三重", "中永和"];
        const weatherKeywords = ["天氣", "下雨", "氣溫", "溫度", "氣象", "冷嗎", "熱嗎", "太陽", "陰天", "降雨", "預報", "幾度", "冷不冷", "熱不熱"];

        const foundCounty = counties.find(c => normalized.includes(c));
        const hasWeatherKeyword = weatherKeywords.some(k => normalized.includes(k));

        if (foundCounty || hasWeatherKeyword) {
            const county = foundCounty || "臺北";
            const fullCountyName = county.endsWith("市") || county.endsWith("運") || county.endsWith("縣")
                ? county
                : county + (["臺北", "臺中", "臺南", "高雄", "新北", "桃園"].includes(county) ? "市" : "縣");

            try {
                const weatherData = await WeatherService.getCountyForecast(fullCountyName);
                return { intent: 'weather', data: weatherData || { status: "ready_for_tool_call" } };
            } catch (e) {
                return { intent: 'weather', data: { status: "ready_for_tool_call" } };
            }
        }

        // 3. Forex Detection
        const forexKeywords = ["匯率", "美金", "台幣", "幣值", "換錢", "USD", "TWD", "兌換", "美金多少", "價格", "黃金", "gold", "日幣", "jpy", "匯率多少"];
        if (forexKeywords.some(k => normalized.includes(k.replace(/台/g, '臺')))) {
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
