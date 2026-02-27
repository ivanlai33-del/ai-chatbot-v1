import axios from 'axios';

export interface StockData {
    symbol: string;
    name: string;
    price: number;
    change: string | number;
    changePercent: string;
    trend: string;
    rsi: string;
    advice: string;
    lastUpdate: string;
}

export class StockService {
    // Point to the StockRadar External API (assuming local development port 3133)
    private static STOCK_RADAR_API = 'http://localhost:3133/api/ai/v1/stock';

    static async getTaiwanStockData(symbol: string): Promise<StockData | null> {
        try {
            console.log(`[StockService] Redirecting query to StockRadar: ${symbol}`);
            const response = await axios.get(this.STOCK_RADAR_API, {
                params: { symbol }
            });

            if (response.data && response.data.status === 'success') {
                const d = response.data.data;
                return {
                    symbol: d.symbol,
                    name: d.name,
                    price: d.price,
                    change: d.change,
                    changePercent: d.changePercent,
                    trend: d.analysis.trend,
                    rsi: d.analysis.rsi,
                    advice: d.analysis.advice,
                    lastUpdate: d.lastUpdate
                };
            }
            return null;
        } catch (error) {
            console.error('StockService Redirect Error:', error);
            return null;
        }
    }
}
