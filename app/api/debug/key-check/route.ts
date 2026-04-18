import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
    const b64Config = process.env.GSC_CONFIG_B64 || '';
    let b64Status = 'NOT_SET';
    let b64ParseError = 'NONE';
    let b64KeyTest = 'PENDING';

    if (b64Config) {
        b64Status = 'SET';
        try {
            const decoded = Buffer.from(b64Config, 'base64').toString('utf8');
            const gscConfig = JSON.parse(decoded);
            const privateKey = gscConfig.private_key;

            // 🚀 標準化處理
            const base64Body = privateKey
                .replace(/-----BEGIN PRIVATE KEY-----/g, '')
                .replace(/-----END PRIVATE KEY-----/g, '')
                .replace(/\\n/g, '')
                .replace(/\s+/g, '')
                .trim();

            const formattedKey = `-----BEGIN PRIVATE KEY-----\n${base64Body.match(/.{1,64}/g)?.join('\n')}\n-----END PRIVATE KEY-----\n`;

            try {
                crypto.createPrivateKey(formattedKey);
                b64KeyTest = 'SUCCESS (Parsed OK)';
            } catch (e: any) {
                b64KeyTest = 'FAILED: ' + e.message;
            }

        } catch (e: any) {
            b64ParseError = e.message;
        }
    }

    return NextResponse.json({
        b64Status,
        b64ParseError,
        b64KeyTest,
        legacyKeyLength: (process.env.GSC_PRIVATE_KEY || '').length,
        serverTime: new Date().toISOString()
    });
}
