import axios from 'axios';

export interface StockData {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    supportLevel: string;
    resistanceLevel: string;
    trend: string;
    currency: string;
}

export class StockService {
    private static FINMIND_URL = 'https://api.finmindtrade.com/api/v4/data';
    private static TOKEN = process.env.FINMIND_TOKEN;

    static async getTaiwanStockData(symbolOrName: string): Promise<StockData | null> {
        try {
            let symbol = symbolOrName;

            // If it's not a 4-digit code, try to find the code by name
            if (!/^\d{4}$/.test(symbolOrName)) {
                const searchRes = await axios.get(this.FINMIND_URL, {
                    params: { dataset: 'TaiwanStockInfo', token: this.TOKEN }
                });
                const allInfo = searchRes.data.data || [];
                // Clean the search query
                const cleanQuery = symbolOrName.replace(/[股份有限公代碼股票行情]/g, '').trim().replace(/台/g, '臺');

                const match = allInfo.find((s: any) => {
                    const normalizedName = s.stock_name.replace(/台/g, '臺');
                    return normalizedName === cleanQuery ||
                        normalizedName.includes(cleanQuery) ||
                        s.stock_id === symbolOrName
                });

                if (match) {
                    symbol = match.stock_id;
                } else {
                    return null;
                }
            }

            // 1. Get Real-time Price (TaiwanStockPrice)
            const priceRes = await axios.get(this.FINMIND_URL, {
                params: {
                    dataset: 'TaiwanStockPrice',
                    data_id: symbol,
                    token: this.TOKEN,
                    start_date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                }
            });

            // 2. Get Info (TaiwanStockInfo) to get the name
            const infoRes = await axios.get(this.FINMIND_URL, {
                params: {
                    dataset: 'TaiwanStockInfo',
                    data_id: symbol,
                    token: this.TOKEN
                }
            });

            const priceData = priceRes.data.data;
            const infoData = infoRes.data.data;

            if (!priceData || priceData.length === 0) return null;

            const latest = priceData[priceData.length - 1];
            const prev = priceData.length > 1 ? priceData[priceData.length - 2] : latest;
            const name = infoData && infoData.length > 0 ? infoData[0].stock_name : "未知公司";

            // Simple Technical Analysis (Last 30 entries)
            const last30 = priceData.slice(-30);
            const low30 = Math.min(...last30.map((d: any) => d.low));
            const high30 = Math.max(...last30.map((d: any) => d.high));
            const sma20 = last30.slice(-20).reduce((acc: number, d: any) => acc + d.close, 0) / 20;

            return {
                symbol,
                name,
                price: latest.close,
                change: latest.close - prev.close,
                changePercent: Number(((latest.close - prev.close) / prev.close * 100).toFixed(2)),
                supportLevel: low30.toFixed(2),
                resistanceLevel: high30.toFixed(2),
                trend: latest.close > sma20 ? "多頭" : "空頭",
                currency: "TWD"
            };
        } catch (error) {
            console.error('StockService Error:', error);
            return null;
        }
    }
}
