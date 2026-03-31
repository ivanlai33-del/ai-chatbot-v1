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
    prompt: string;
}
