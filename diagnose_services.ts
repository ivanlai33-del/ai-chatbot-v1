import { WeatherService } from './lib/services/WeatherService.ts';
import { ForexService } from './lib/services/ForexService.ts';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function diagnose() {
    console.log("--- WeatherService Test ---");
    const weather = await WeatherService.getCountyForecast("臺南市");
    console.log("Weather in Tainan:", JSON.stringify(weather, null, 2));

    console.log("\n--- ForexService Test ---");
    const forex = await ForexService.getLatestRate('USD', 'TWD', 1);
    console.log("USD to TWD Rate:", JSON.stringify(forex, null, 2));
}

diagnose().catch(console.error);
