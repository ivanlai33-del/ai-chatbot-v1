import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { PRICING_PLANS, PlanId } from '@/lib/config/pricing';
import { SAAS_PARTNER_PLANS, PartnerPlanId } from '@/lib/config/partner_pricing';
import { 
    getNewebPayConfig, 
    createMpgAesEncrypt, 
    createMpgShaEncrypt, 
    genDataChain, 
    generateMerchantOrderNo 
} from '@/lib/newebpay';

/**
 * 藍新金流結帳引導 API
 */

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('Authorization');
        const token = authHeader?.split(' ')[1] || '';
        const { data: { user } } = await supabase.auth.getUser(token);
        
        const userId = user?.id || 'MOCK_USER_ID';
        const userEmail = user?.email || 'test@example.com';

        const { planId, cycle, isPartner } = await req.json() as { planId: any; cycle: 'monthly' | 'yearly'; isPartner?: boolean };
        
        let amount = 0;
        let itemDesc = '';

        if (planId === 'butter_toast_managed' || planId === 'managed_service') {
            // 生乳/奶霜專賣店 AI店長全代營運月費: $4,800 + 5% 稅 = 含稅 NT$ 5,040 /月
            amount = 5040;
            itemDesc = '生乳/奶霜專賣店 AI店長全代營運月費';
        } else if (isPartner) {
            const plan = SAAS_PARTNER_PLANS[planId as PartnerPlanId];
            if (!plan) return NextResponse.json({ error: '找不到指定的合作夥伴方案' }, { status: 404 });
            amount = cycle === 'yearly' ? plan.pricing.annual : plan.pricing.monthly;
            itemDesc = `Partner ${plan.name} (${cycle})`;
        } else {
            const plan = PRICING_PLANS[planId as PlanId];
            if (!plan) return NextResponse.json({ error: '找不到指定的方案' }, { status: 404 });
            amount = cycle === 'yearly' ? plan.pricing.annual : plan.pricing.monthly;
            itemDesc = `Standard ${plan.name} (${cycle})`;
        }

        const config = getNewebPayConfig();
        const merchantOrderNo = generateMerchantOrderNo('BTS'); 
        const isYearly = cycle === 'yearly';

        const timeStamp = Math.floor(Date.now() / 1000).toString();

        const tradeInfoObj: any = {
            MerchantID: config.merchantId,
            RespondType: 'JSON',
            TimeStamp: timeStamp,
            Version: config.version,
            MerchantOrderNo: merchantOrderNo,
            Amt: amount,
            ItemDesc: itemDesc,
            Email: userEmail,
            LoginType: 0,
            ReturnURL: `${config.baseUrl}/api/payment/return`,
            NotifyURL: config.notifyUrl,
            ClientBackURL: `${process.env.NEXT_PUBLIC_APP_URL || 'https://bot.ycideas.com'}/proposals/butter-toast`,
            CREDIT: 1,
            ANDROIDPAY: 1,
            APPLEPAY: 1,
        };

        if (!isYearly) {
            Object.assign(tradeInfoObj, {
                PeriodAmt: amount,
                PeriodType: 'M',
                PeriodPoint: '01',
                PeriodStartType: 1,
                PeriodTimes: 99
            });
        }

        const tradeInfoChain = genDataChain(tradeInfoObj);
        const aesEncrypt = createMpgAesEncrypt(tradeInfoChain, config.hashKey, config.hashIV);
        const shaEncrypt = createMpgShaEncrypt(aesEncrypt, config.hashKey, config.hashIV);

        return NextResponse.json({
            success: true,
            data: {
                MerchantID: config.merchantId,
                TradeInfo: aesEncrypt,
                TradeSha: shaEncrypt,
                Version: config.version,
                RespondType: 'JSON',
                TimeStamp: timeStamp,
                TargetUrl: config.backendUrl,
                OrderNo: merchantOrderNo,
                Amount: amount
            }
        }, {
            headers: {
                'Cache-Control': 'no-store, max-age=0',
                'Pragma': 'no-cache'
            }
        });

    } catch (error: any) {
        console.error('[Checkout API Error]:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
