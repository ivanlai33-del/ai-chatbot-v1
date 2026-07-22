export interface SEOGEOEngineConfig {
    botId: string;
    storeName: string;
    industry: string;
    targetKeywords: string[];
    isAutoPublishThreads: boolean;
    isAutoSubmitGoogleIndex: boolean;
    threadsAccessToken?: string;
    threadsUserId?: string;
    lineOAUri?: string;
}

export interface IndustryContentMatrix {
    industry: string;
    seoTitle: string;
    seoMetaDescription: string;
    slug: string;
    jsonLdSchema: Record<string, any>;
    articleBodyMarkdown: string;
    threadsPostContent: string;
    threadsReplyScript: string;
    geoCitationSummary: string;
}

export interface PublishResult {
    success: boolean;
    slug?: string;
    pageUrl?: string;
    threadsPostId?: string;
    indexingSubmitted?: boolean;
    error?: string;
}

export interface KeywordRankingItem {
    keyword: string;
    rank: number | null;
    pageUrl: string;
    updatedAt: string;
}

export interface SEOGEOPerformanceMetrics {
    totalArticlesGenerated: number;
    totalThreadsPosts: number;
    estimatedImpressions: number;
    lineLeadConversions: number;
    keywordsCount: number;
    rankings: KeywordRankingItem[];
    aiCitationStatus: 'INDEXED' | 'PENDING' | 'SEARCHING';
}
