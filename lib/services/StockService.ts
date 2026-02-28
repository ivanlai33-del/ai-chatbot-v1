/**
 * StockService — Powered by FinMind API
 * 
 * Data Source: https://finmindtrade.com/
 * Dataset:     TaiwanStockPrice (OHLC, Volume, Spread)
 * Token:       FINMIND_TOKEN environment variable
 */

export interface StockData {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: string;
    trend: string;
    supportLevel: number;
    resistanceLevel: number;
    advice: string;
    volume: number;
    lastUpdate: string;
}

// Common Taiwan stock names mapping (for display purposes)
const STOCK_NAMES: Record<string, string> = {
    '2330': '台積電',
    '2317': '鴻海精密工業',
    '2454': '聯發科',
    '2382': '廣達電腦',
    '2308': '台達電子',
    '2412': '中華電信',
    '2881': '富邦金控',
    '2882': '國泰金控',
    '2886': '兆豐金控',
    '2884': '玉山金控',
    '2891': '中信金控',
    '2303': '聯電',
    '2002': '中鋼',
    '2609': '陽明海運',
    '2615': '萬海航運',
    '2603': '長榮海運',
    '3008': '大立光',
    '6505': '台塑石化',
    '1301': '台塑',
    '1303': '南亞',
    '5871': '中租控股',
    '2395': '研華',
    '3711': '日月光投控',
    '2345': '智邦',
    '6669': '緯穎',
    '4938': '和碩',
    '2379': '瑞昱半導體',
    '3034': '聯詠',
    '6415': '矽力-KY',
    '2357': '華碩',
    '2353': '宏碁',
    '3045': '台灣大哥大',
    '2498': '宏達電',
    '2376': '技嘉',
};

// Reverse lookup: Chinese name → stock code
const NAME_TO_CODE: Record<string, string> = Object.entries(STOCK_NAMES).reduce((acc, [code, name]) => {
    acc[name] = code;
    // Also add common short forms
    const shortName = name.replace(/股份有限公司|有限公司|科技|集團|控股|電腦|精密工業|海運|金控/g, '').trim();
    if (shortName && shortName !== name) acc[shortName] = code;
    return acc;
}, {} as Record<string, string>);

export class StockService {
    private static FINMIND_API = 'https://api.finmindtrade.com/api/v4/data';
    private static TOKEN = process.env.FINMIND_TOKEN || '';

    /**
     * Fetch recent Taiwan stock price data and compute a simple technical analysis.
     */
    static async getTaiwanStockData(symbolInput: string): Promise<StockData | null> {
        try {
            let symbol = symbolInput.trim();

            // 1. Check if it's a Chinese company name → look up code
            if (NAME_TO_CODE[symbol]) {
                symbol = NAME_TO_CODE[symbol];
            } else {
                // 2. Normalize: strip .TW suffix and non-alphanumeric chars
                symbol = symbol.replace(/\.TW$/i, '').replace(/[^0-9A-Za-z]/g, '');
            }
            if (!symbol) return null;

            // Fetch last 30 days of data for trend calculation
            const today = new Date();
            const startDate = new Date(today);
            startDate.setDate(today.getDate() - 60);
            const startStr = startDate.toISOString().split('T')[0];

            const url = new URL(this.FINMIND_API);
            url.searchParams.set('dataset', 'TaiwanStockPrice');
            url.searchParams.set('data_id', symbol);
            url.searchParams.set('start_date', startStr);
            url.searchParams.set('token', this.TOKEN);

            console.log(`[StockService] Fetching FinMind data for: ${symbol}`);
            const res = await fetch(url.toString());
            if (!res.ok) throw new Error(`FinMind HTTP ${res.status}`);

            const json: any = await res.json();

            if (json.status !== 200 || !json.data || json.data.length === 0) {
                console.warn(`[StockService] No data for symbol: ${symbol}`);
                return null;
            }

            const records = json.data;
            const latest = records[records.length - 1];
            const previous = records.length > 1 ? records[records.length - 2] : null;

            // --- Technical Analysis ---
            const closes = records.map((r: any) => r.close);
            const recentCloses = closes.slice(-10);
            const avgClose = recentCloses.reduce((a: number, b: number) => a + b, 0) / recentCloses.length;

            // Support = min of recent lows, Resistance = max of recent highs
            const recentLows = records.slice(-15).map((r: any) => r.min);
            const recentHighs = records.slice(-15).map((r: any) => r.max);
            const supportLevel = Math.min(...recentLows);
            const resistanceLevel = Math.max(...recentHighs);

            // Trend determination
            const firstClose = recentCloses[0];
            const lastClose = recentCloses[recentCloses.length - 1];
            const trendPct = ((lastClose - firstClose) / firstClose) * 100;
            let trend = '🟡 盤整';
            if (trendPct > 3) trend = '🟢 上漲趨勢';
            else if (trendPct < -3) trend = '🔴 下跌趨勢';

            // Price change from previous day
            const change = previous ? latest.close - previous.close : latest.spread;
            const changePercent = previous
                ? ((change / previous.close) * 100).toFixed(2) + '%'
                : (latest.spread / (latest.close - latest.spread) * 100).toFixed(2) + '%';

            // Advice
            let advice = '觀望';
            if (latest.close <= supportLevel * 1.02) advice = '接近支撐區，可考慮買入';
            else if (latest.close >= resistanceLevel * 0.98) advice = '接近壓力區，留意賣出訊號';
            else if (trendPct > 5) advice = '強勢上漲中，趨勢投資者可持有';
            else if (trendPct < -5) advice = '趨勢偏弱，建議觀望';

            return {
                symbol,
                name: STOCK_NAMES[symbol] || `股票代號 ${symbol}`,
                price: latest.close,
                change: Number(change.toFixed(2)),
                changePercent,
                trend,
                supportLevel: Number(supportLevel.toFixed(1)),
                resistanceLevel: Number(resistanceLevel.toFixed(1)),
                advice,
                volume: latest.Trading_Volume,
                lastUpdate: latest.date,
            };

        } catch (error) {
            console.error('[StockService] FinMind API Error:', error);
            return null;
        }
    }
}
