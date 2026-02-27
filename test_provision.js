const fetch = require('node-fetch');

const API_KEY = "13cdff30-6ecc-410c-b2d9-99bdc77d77cf"; // StockRadar-main key

async function testProvisioning() {
    console.log("Testing Provisioning API for StockRadar...");
    try {
        const response = await fetch('http://localhost:3000/api/partner/provision', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                store_name: "StockRadar 股友專屬助理 - 王大明的帳號",
                system_prompt: "你是 StockRadar 的專屬股市助理，專注於台股技術分析。",
                industry: "Financial/StockRadar"
            })
        });

        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Response:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Test failed:", e);
    }
}

testProvisioning();
