import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

const BAD_USER_AGENTS = [
    'HTTrack',
    'python-requests',
    'wget',
    'curl',
    'urllib',
    'libwww-perl',
    'MauiBot',
    'Scrapy',
    'PostmanRuntime',
];

export async function middleware(request: NextRequest) {
    const userAgent = request.headers.get('user-agent') || '';
    const ip = request.headers.get('x-forwarded-for') || request.ip || 'anonymous';
    const path = request.nextUrl.pathname;
    
    // 1. User-Agent Blocklist (Anti-Scraping)
    const isBadBot = BAD_USER_AGENTS.some(agent => 
        userAgent.toLowerCase().includes(agent.toLowerCase())
    );

    if (isBadBot) {
        return new NextResponse('Forbidden: Access Denied for security reasons.', {
            status: 403,
            headers: { 'Content-Type': 'text/plain' },
        });
    }

    // 2. Rate Limiting for Sensitive APIs (防範惡意刷流量或打包資料)
    if (path.startsWith('/api/console') || path.startsWith('/api/platform')) {
        const limiter = await rateLimit(`ip:${ip}`, 60, 60); // 60 requests per minute per IP
        if (!limiter.success) {
            return new NextResponse('Too Many Requests: 您操作過於頻繁，請稍候再試。', {
                status: 429,
                headers: { 'Content-Type': 'text/plain' },
            });
        }
    }

    const response = NextResponse.next();
    
    // 3. Anti-Framing & Security Headers
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Content-Security-Policy', "frame-ancestors 'none'");
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

    return response;
}

export const config = {
    // Run on all paths except static assets
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.svg|.*\\.mp4|.*\\.png|.*\\.jpg).*)',
    ],
};
