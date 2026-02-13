import yahooFinance from 'yahoo-finance2';

async function testFinal() {
    console.log("🚀 Testing new (yahooFinance as any)()...");
    try {
        // @ts-ignore
        const yf = new (yahooFinance as any)();
        console.log("✅ Instantiated successfully!");
        const quote = await yf.quote('AAPL');
        console.log("✅ Quote success! Price:", quote.regularMarketPrice);
    } catch (err: any) {
        console.log("❌ Failed:", err.message);
    }
}

testFinal();
