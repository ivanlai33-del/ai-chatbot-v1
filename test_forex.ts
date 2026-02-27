import axios from 'axios';

async function test() {
    console.log("Testing open.er-api.com...");
    try {
        const res = await axios.get('https://open.er-api.com/v6/latest/USD');
        console.log("USD rates sample:", Object.keys(res.data.rates).slice(0, 10));
        console.log("USD to TWD:", res.data.rates['TWD']);
        console.log("USD to XAU:", res.data.rates['XAU']);
        console.log("USD to XAG:", res.data.rates['XAG']);

        console.log("\nTrying XAU as base...");
        try {
            const xauRes = await axios.get('https://open.er-api.com/v6/latest/XAU');
            console.log("XAU to TWD:", xauRes.data.rates['TWD']);
        } catch (e) {
            console.log("XAU as base failed (likely unsupported by free API)");
        }
    } catch (e) {
        console.error(e);
    }
}

test();
