import axios from 'axios';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testWeather() {
    console.log("\n--- Testing CWA Weather API ---");
    const CWA_API_KEY = process.env.CWA_API_KEY;
    try {
        const res = await axios.get(`https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001`, {
            params: { Authorization: CWA_API_KEY, locationName: '臺北市', format: 'JSON' }
        });
        console.log("CWA Status:", res.status);
        console.log("CWA Data Preview:", JSON.stringify(res.data?.records?.location?.[0]?.weatherElement?.[0]?.time?.[0], null, 2));
    } catch (e: any) {
        console.error("CWA Error:", e.response?.status, e.response?.data || e.message);
    }
}

async function testStock() {
    console.log("\n--- Testing FinMind Stock API ---");
    const FINMIND_TOKEN = process.env.FINMIND_TOKEN;
    try {
        const res = await axios.get(`https://api.finmindtrade.com/api/v4/data`, {
            params: { dataset: 'TaiwanStockPrice', data_id: '2330', token: FINMIND_TOKEN, start_date: '2026-02-01' }
        });
        console.log("FinMind Status:", res.status);
        console.log("FinMind Data Count:", res.data?.data?.length);
    } catch (e: any) {
        console.error("FinMind Error:", e.response?.status, e.response?.data || e.message);
    }
}

async function testForex() {
    console.log("\n--- Testing Forex API (Stable Endpoint) ---");
    try {
        // Using ExchangeRate-API v4 (Very stable free tier)
        const res = await axios.get(`https://api.exchangerate-api.com/v4/latest/USD`);
        console.log("Forex Status:", res.status);
        console.log("USD to TWD:", res.data?.rates?.TWD);
    } catch (e: any) {
        console.error("Forex Error:", e.response?.status, e.response?.data || e.message);
    }
}

async function main() {
    await testWeather();
    await testStock();
    await testForex();
}

main().catch(console.error);
