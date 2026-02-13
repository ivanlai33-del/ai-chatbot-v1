import yahooFinance from 'yahoo-finance2';

async function testProperty() {
    console.log("🚀 Testing yahooFinance.YahooFinance...");
    try {
        // @ts-ignore
        if (yahooFinance.YahooFinance) {
            console.log("✅ Found YahooFinance class on default export!");
            // @ts-ignore
            const yf = new yahooFinance.YahooFinance();
            const quote = await yf.quote('2330.TW');
            console.log("✅ Success with new yahooFinance.YahooFinance()!");
        } else {
            console.log("❌ yahooFinance.YahooFinance is undefined.");
            console.log("Let's try to check the prototype of yahooFinance...");
            // @ts-ignore
            console.log("Constructor name:", yahooFinance.constructor?.name);
        }
    } catch (err: any) {
        console.log("💥 Error:", err.message);
    }
}

testProperty();
