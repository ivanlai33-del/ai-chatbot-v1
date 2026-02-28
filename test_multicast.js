const fetch = require('node-fetch');

const API_KEY = "13cdff30-6ecc-410c-b2d9-99bdc77d77cf"; // StockRadar-main key
// From previous test, the provisioned bot id was: "1b9498a4-62c0-4f9f-994a-74664a1a4d16"
// But that bot doesn't have an owner_line_id set yet since we haven't bound it.
// We will test it anyway to see the "No active bound bots found" response.

async function testMulticast() {
    console.log("Testing Multicast API for StockRadar...");
    try {
        const response = await fetch('http://localhost:3000/api/partner/multicast', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                bot_ids: ["1b9498a4-62c0-4f9f-994a-74664a1a4d16"],
                messages: [
                    {
                        type: "text",
                        text: "🚨【StockRadar 緊急警報】🚨\n\n您追蹤的「台積電 (2330)」出現大量買單，已經突破前高！請立即查看您的投資組合。"
                    }
                ]
            })
        });

        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Response:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Test failed:", e);
    }
}

testMulticast();
