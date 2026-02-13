import { StockService } from './StockService';
import { WeatherService } from './WeatherService';
import { ForexService } from './ForexService';

export interface InterceptedContext {
    intent: 'stock' | 'weather' | 'forex' | 'chat';
    data: any;
}

export class IntentInterceptor {
    static async intercept(text: string): Promise<InterceptedContext> {
        const trimmed = text.trim();

        // 1. Stock Detection (4 digits)
        if (/^\d{4}$/.test(trimmed)) {
            const stockData = await StockService.getTaiwanStockData(trimmed);
            if (stockData) {
                return { intent: 'stock', data: stockData };
            }
        }

        // 2. Weather Detection (Keywords + County Names)
        const counties = ["基隆", "台北", "新北", "桃園", "新竹", "苗栗", "台中", "彰化", "南投", "雲林", "嘉義", "台南", "高雄", "屏東", "宜蘭", "花蓮", "台東", "澎湖", "金門", "連江"];
        const weatherKeywords = ["天氣", "下雨", "氣溫", "溫度"];

        const foundCounty = counties.find(c => trimmed.includes(c));
        const hasWeatherKeyword = weatherKeywords.some(k => trimmed.includes(k));

        if (foundCounty || hasWeatherKeyword) {
            const county = foundCounty || "台北市"; // Default to Taipei if only "天氣" is mentioned
            const weatherData = await WeatherService.getCountyForecast(county.endsWith("市") || county.endsWith("縣") ? county : county + (county === "台北" || county === "台中" || county === "台南" || county === "高雄" || county === "新北" || county === "桃園" ? "市" : "縣"));
            if (weatherData) {
                return { intent: 'weather', data: weatherData };
            }
        }

        // 3. Forex Detection (Keywords)
        const forexKeywords = ["匯率", "美金", "台幣", "換錢"];
        if (forexKeywords.some(k => trimmed.includes(k))) {
            const forexData = await ForexService.getLatestRate('USD', 'TWD', 1);
            if (forexData) {
                return { intent: 'forex', data: forexData };
            }
        }

        return { intent: 'chat', data: null };
    }
}
