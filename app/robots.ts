import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/webhook/'],
        },
        sitemap: 'https://bot.ycideas.com/sitemap.xml',
    }
}
