import axios from 'axios';

export interface ForexData {
    from: string;
    to: string;
    rate: number;
    amount: number;
    result: number;
    date: string;
}

export class ForexService {
    private static BASE_URL = 'https://open.er-api.com/v6/latest/USD';

    static async getLatestRate(from: string = 'USD', to: string = 'TWD', amount: number = 1): Promise<ForexData | null> {
        try {
            const res = await axios.get(this.BASE_URL);
            const data = res.data;
            if (!data || !data.rates || !data.rates[to]) return null;

            const rate = data.rates[to];
            return {
                from,
                to,
                rate: rate,
                amount,
                result: rate * amount,
                date: data.time_last_update_utc || new Date().toISOString()
            };
        } catch (error) {
            console.error('ForexService Error:', error);
            return null;
        }
    }
}
