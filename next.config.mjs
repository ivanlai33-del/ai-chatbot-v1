/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=31536000; includeSubDomains; preload',
                    },
                    {
                        key: 'Content-Security-Policy',
                        value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.paypal.com https://www.sandbox.paypal.com https://*.paypal.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https://profile.line-scdn.net https://*.line-scdn.net https://www.paypalobjects.com https://*.paypal.com https://*.paypalobjects.com; font-src 'self' https://fonts.gstatic.com https://r2cdn.perplexity.ai; connect-src 'self' https://api-m.sandbox.paypal.com https://api-m.paypal.com https://*.paypal.com; frame-src 'self' https://www.sandbox.paypal.com https://www.paypal.com https://*.paypal.com;",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
