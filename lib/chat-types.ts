export type Message = {
    id: string;
    role: 'ai' | 'user';
    content: string;
    type?: 'text' | 'pricing' | 'checkout' | 'setup' | 'success' | 'recovery' | 'saas_partner' | 'enterprise' | 'requirement_form' | 'contact_cta' | 'member_greeting';
};

export interface ChatPlan {
    name: string;
    price: string;
}

export interface IndustryTemplate {
    id: string;
    title: string;
    desc: string;
    icon: any;
    color: string;
}

export interface StoreConfig {
    brand_dna: { 
        name: string; 
        tone: string; 
        tone_prompt: string;
        tagline: string; 
        introduction: string;
        services: string;
        industry: string;
        target_audience: string;
        welcome_message: string;
        closing_phrase: string;
        forbidden_topics: string;
        human_trigger_keywords: string;
    };
    offerings: { 
        name: string; 
        price: string; 
        description: string;
        size: string;
        url: string;
        ai_context: string;
        category: string;
        duration: string;
        target_audience_item: string;
        customization_note: string;
        caution_note: string;
        booking_url: string;
    }[];
    faq_base: { q: string; a: string; tags: string[] }[];
    logic_rules: string;
    contact_info: { 
        line_id: string; 
        phone: string; 
        hours: string;
        platforms: string[];
        branches: string[];
        map_url: string;
        foodpanda_url: string;
        ubereats_url: string;
        parking_info: string;
        instagram: string;
        facebook: string;
        booking_method: string;
        closed_days: string;
    };
    completion_pct: number;
}
