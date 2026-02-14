import { IntentInterceptor } from './lib/services/IntentInterceptor.ts';
import { StockService } from './lib/services/StockService.ts';

async function test() {
    console.log("--- Testing IntentInterceptor ---");
    const queries = ["hi~明天天氣如何？", "請問鴻海股票代碼？", "美金匯率"];
    for (const q of queries) {
        const res = await IntentInterceptor.intercept(q);
        console.log(`Query: ${q} => Intent: ${res.intent}, Data Present: ${!!res.data}`);
    }

    console.log("\n--- Testing Stock Fuzzy Search ---");
    const stockQuery = "鴻海股票代碼";
    const res = await StockService.getTaiwanStockData(stockQuery);
    console.log(`Stock Query: ${stockQuery} => Result: ${res ? res.name + " (" + res.symbol + ")" : "Failed"}`);
}

test();
