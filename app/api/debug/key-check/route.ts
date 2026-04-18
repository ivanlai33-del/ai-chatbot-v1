import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const rawKey = process.env.GSC_PRIVATE_KEY || '';
    
    return NextResponse.json({
        keyLength: rawKey.length,
        hasBeginMarker: rawKey.includes('-----BEGIN PRIVATE KEY-----'),
        hasEndMarker: rawKey.includes('-----END PRIVATE KEY-----'),
        hasLiteralNewlines: rawKey.includes('\n'),
        hasEscapedNewlines: rawKey.includes('\\n'),
        firstChars: rawKey.substring(0, 50),
        clientEmail: process.env.GSC_CLIENT_EMAIL || 'NOT SET',
    });
}
