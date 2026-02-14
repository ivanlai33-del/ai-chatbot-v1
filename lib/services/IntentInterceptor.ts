import { StockService } from './StockService';
import { WeatherService } from './WeatherService';
import { ForexService } from './ForexService';

export interface InterceptedContext {
    intent: 'stock' | 'weather' | 'forex' | 'chat';
    data: any;
}

export class IntentInterceptor {
    static async intercept(text: string): Promise<InterceptedContext> {
        const normalized = text.replace(/台/g, '臺');

        // 1. Stock Detection (Any 4-digit sequence OR keywords with name)
        const stockMatch = normalized.match(/(\d{4})/);
        const hasStockKeyword = ["股價", "分析", "股票", "行情"].some(k => normalized.includes(k));

        if (stockMatch) {
            const stockData = await StockService.getTaiwanStockData(stockMatch[1]);
            if (stockData) return { intent: 'stock', data: stockData };
        } else if (hasStockKeyword) {
            // Try to use the text before/after keyword as a name
            const searchName = normalized.replace(/[請問幫我查看看的行情股價分析?？\s]/g, '');
            if (searchName.length >= 2) {
                const stockData = await StockService.getTaiwanStockData(searchName);
                if (stockData) return { intent: 'stock', data: stockData };
            }
        }

        // 2. Weather Detection
        const counties = ["基隆", "臺北", "新北", "桃園", "新竹", "苗栗", "臺中", "彰化", "南投", "雲林", "嘉義", "臺南", "高雄", "屏東", "宜蘭", "花蓮", "臺東", "澎湖", "金門", "連江", "板橋", "淡水", "三重", "中永和"];
        const weatherKeywords = ["天氣", "下雨", "氣溫", "溫度", "氣象", "冷嗎", "熱嗎", "太陽", "陰天", "降雨", "預報"];

        const foundCounty = counties.find(c => normalized.includes(c));
        const hasWeatherKeyword = weatherKeywords.some(k => normalized.includes(k));

        if (foundCounty || hasWeatherKeyword) {
            const county = foundCounty || "臺北";
            const fullCountyName = county.endsWith("市") || county.endsWith("縣")
                ? county
                : county + (["臺北", "臺中", "臺南", "高雄", "新北", "桃園"].includes(county) ? "市" : "縣");

            try {
                const weatherData = await WeatherService.getCountyForecast(fullCountyName);
                return { intent: 'weather', data: weatherData };
            } catch (e) {
                return { intent: 'weather', data: { status: "ready_for_tool_call" } };
            }
        }

        // 3. Forex Detection
        const forexKeywords = ["匯率", "美金", "台幣", "幣值", "換錢", "USD", "TWD", "兌換", "美金多少", "價格"];
        if (forexKeywords.some(k => normalized.toUpperCase().includes(k.toUpperCase()))) {
            try {
                const forexData = await ForexService.getLatestRate('USD', 'TWD', 1);
                return { intent: 'forex', data: forexData };
            } catch (e) {
                return { intent: 'forex', data: { status: "ready_for_tool_call" } };
            }
        }

        return { intent: 'chat', data: null };
    }
}
