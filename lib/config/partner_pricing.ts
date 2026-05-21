/**
 * ============================================================
 * 🤝 SAAS PARTNER PRICING — 合作夥伴批發定價系統
 * ============================================================
 */

export type PartnerPlanId = 'starter' | 'pro' | 'elite';

export interface PartnerPricingPlan {
    id: PartnerPlanId;
    name: string;
    pricing: {
        monthly: number;
        annual: number;
    };
    limits: {
        tenants: number;
        lineOas: number;
        events: number;
        aiTasks: number;
    };
}

export const SAAS_PARTNER_PLANS: Record<PartnerPlanId, PartnerPricingPlan> = {
    starter: {
        id: 'starter',
        name: 'Starter',
        pricing: {
            monthly: 3000,
            annual: 32400,
        },
        limits: {
            tenants: 1,
            lineOas: 3,
            events: 20000,
            aiTasks: 500,
        }
    },
    pro: {
        id: 'pro',
        name: 'Pro',
        pricing: {
            monthly: 9000,
            annual: 97200,
        },
        limits: {
            tenants: 5,
            lineOas: 25,
            events: 150000,
            aiTasks: 5000,
        }
    },
    elite: {
        id: 'elite',
        name: 'Elite',
        pricing: {
            monthly: 25000,
            annual: 270000,
        },
        limits: {
            tenants: 10,
            lineOas: 100, // Custom scaling
            events: 1000000,
            aiTasks: 20000,
        }
    }
};

export function getPartnerPlanById(id: PartnerPlanId): PartnerPricingPlan {
    return SAAS_PARTNER_PLANS[id];
}
