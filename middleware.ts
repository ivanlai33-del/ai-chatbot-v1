import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

export function middleware(request: NextRequest) {
    const userAgent = request.headers.get('user-agent') || '';
    
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

    const response = NextResponse.next();
    
    // 2. Anti-Framing (X-Frame-Options & CSP) to prevent clickjacking & fake clones
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Content-Security-Policy', "frame-ancestors 'none'");
    
    // 3. Prevent MIME-sniffing
    response.headers.set('X-Content-Type-Options', 'nosniff');

    // 4. Strict Transport Security
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

    return response;
}

export const config = {
    // Run on all paths except static assets
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.svg|.*\\.mp4|.*\\.png|.*\\.jpg).*)',
    ],
};
