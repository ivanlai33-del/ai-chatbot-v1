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
    private static BASE_URL = 'https://api.frankfurter.dev/v1';

    static async getLatestRate(from: string = 'USD', to: string = 'TWD', amount: number = 1): Promise<ForexData | null> {
        try {
            const res = await axios.get(`${this.BASE_URL}/latest`, {
                params: {
                    from,
                    to,
                    amount
                }
            });

            const data = res.data;
            if (!data || !data.rates || !data.rates[to]) return null;

            return {
                from,
                to,
                rate: data.rates[to],
                amount,
                result: data.rates[to] * amount,
                date: data.date
            };
        } catch (error) {
            console.error('ForexService Error:', error);
            return null;
        }
    }
}
