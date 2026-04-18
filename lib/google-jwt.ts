import crypto from 'crypto';
import axios from 'axios';

/**
 * 手動實作 Google Service Account JWT 認證
 * 避免依賴 googleapis 套件（防止網路環境安裝失敗）
 */
export async function getGoogleAccessToken(
    clientEmail: string,
    privateKey: string,
    scopes: string[]
): Promise<string> {
    const header = {
        alg: 'RS256',
        typ: 'JWT',
    };

    const now = Math.floor(Date.now() / 1000);
    const claimSet = {
        iss: clientEmail,
        scope: scopes.join(' '),
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + 3600,
        iat: now,
    };

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedClaimSet = Buffer.from(JSON.stringify(claimSet)).toString('base64url');
    const signatureInput = `${encodedHeader}.${encodedClaimSet}`;

    const sign = crypto.createSign('RSA-SHA256');
    sign.update(signatureInput);
    
    // 🚀 使用 KeyObject 並讓 Node.js 自動偵測格式 (PKCS#1 或 PKCS#8)
    const key = crypto.createPrivateKey({
        key: privateKey,
        format: 'pem'
    });
    const signature = sign.sign(key, 'base64url');

    const jwt = `${signatureInput}.${signature}`;

    const res = await axios.post('https://oauth2.googleapis.com/token', 
        new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: jwt
        }).toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    return res.data.access_token;
}
