'use client';

interface SEOMetadataProps {
    jsonLd: any;
}

export default function SEOMetadata({ jsonLd }: SEOMetadataProps) {
    return (
        <>
            {/* JSON-LD Structured Data for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(jsonLd),
                }}
            />
        </>
    );
}
