import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
    const rawKey = process.env.GSC_PRIVATE_KEY || '';
    
    // 🚀 手動模擬清理邏輯
    const base64Body = rawKey
        .replace(/-----BEGIN PRIVATE KEY-----/g, '')
        .replace(/-----END PRIVATE KEY-----/g, '')
        .replace(/\\n/g, '')
        .replace(/\s+/g, '')
        .replace(/"/g, '')
        .trim();

    const formattedKey = `-----BEGIN PRIVATE KEY-----\n${base64Body.match(/.{1,64}/g)?.join('\n')}\n-----END PRIVATE KEY-----\n`;

    let pkcs8Error = 'NONE';
    let autoError = 'NONE';

    // 測試 1: PKCS#8
    try {
        crypto.createPrivateKey({
            key: formattedKey,
            format: 'pem',
            type: 'pkcs8'
        });
    } catch (e: any) {
        pkcs8Error = e.message;
    }

    // 測試 2: Auto
    try {
        crypto.createPrivateKey(formattedKey);
    } catch (e: any) {
        autoError = e.message;
    }

    return NextResponse.json({
        rawLength: rawKey.length,
        base64Length: base64Body.length,
        pkcs8Error,
        autoError,
        firstChars: formattedKey.substring(0, 50),
        lastChars: formattedKey.substring(formattedKey.length - 50),
        serverTime: new Date().toISOString()
    });
}
