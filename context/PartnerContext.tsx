"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface Partner {
    companyName: string;
    userName: string;
    userRole: string;
    avatarUrl: string | null;
    id?: string;
    email?: string;
    taxId?: string;
    website?: string;
    address?: string;
    phone?: string;
    orgEmail?: string;
    current_plan?: string;
}

interface OA {
    id: string;
    name: string;
    line_oa_id: string;
}

interface PartnerContextType {
    partner: Partner;
    officialAccounts: OA[];
    activeOA: OA | null;
    triggerCommand: string | null;
    updatePartner: (newData: Partial<Partner>) => Promise<void>;
    setActiveOA: (oa: OA) => void;
    setTriggerCommand: (cmd: string | null) => void;
    isLoading: boolean;
    signOut: () => Promise<void>;
}

const PartnerContext = createContext<PartnerContextType | undefined>(undefined);

export const ORG_ID = '77777777-7777-7777-7777-777777777777';

export const PartnerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [partner, setPartner] = useState<Partner>({
        companyName: '奕暢創新工作室',
        userName: 'User',
        userRole: '高級專員',
        avatarUrl: null,
    });
    const [officialAccounts, setOfficialAccounts] = useState<OA[]>([]);
    const [activeOA, setActiveOAState] = useState<OA | null>(null);
    const [triggerCommand, setTriggerCommand] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const fetchPartnerData = async (userEmail: string) => {
        try {
            console.log('--- AGI Data Sync Start ---');
            
            // 1. 抓取成員資料 (不使用 .single() 避免 406)
            const { data: membershipRows, error: mError } = await supabase
                .from('memberships')
                .select('user_name, user_role, avatar_url')
                .eq('email', userEmail);

            if (mError) console.error('Membership Fetch Error:', mError);

            // 2. 抓取組織資料
            const { data: orgRows, error: oError } = await supabase
                .from('organizations')
                .select('*')
                .eq('id', ORG_ID);

            if (oError) console.error('Org Fetch Error:', oError);

            // 3. 抓取官方帳號清單 (暫時移除 organization_id 過濾，直到確認欄位名稱)
            const { data: oaRows, error: oaError } = await supabase
                .from('official_accounts')
                .select('*');

            if (oaError) console.error('OA Fetch Error:', oaError);

            // 處理結果
            if (membershipRows && membershipRows.length > 0) {
                const m = membershipRows[0];
                setPartner(prev => ({
                    ...prev,
                    userName: m.user_name || '未命名專員',
                    userRole: m.user_role || '高級專員',
                    avatarUrl: m.avatar_url,
                }));
            }

            if (orgRows && orgRows.length > 0) {
                const org = orgRows[0];
                setPartner(prev => ({
                    ...prev,
                    companyName: org.name,
                    taxId: org.tax_id,
                    website: org.website,
                    address: org.address,
                    phone: org.phone,
                    orgEmail: org.email
                }));
            }

            if (oaRows && oaRows.length > 0) {
                setOfficialAccounts(oaRows);
                setActiveOAState(oaRows[0]);
            }

            console.log('--- AGI Data Sync Complete ---');
        } catch (error) {
            console.error('Systemic Sync Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const updatePartner = async (newData: Partial<Partner>) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.email) return;

        const { error } = await supabase
            .from('memberships')
            .upsert({
                email: session.user.email,
                organization_id: ORG_ID,
                user_name: newData.userName || partner.userName,
                user_role: newData.userRole || partner.userRole,
                avatar_url: newData.avatarUrl || partner.avatarUrl,
            }, { onConflict: 'email' });

        if (!error) {
            setPartner(prev => ({ ...prev, ...newData }));
        }
    };

    const setActiveOA = (oa: OA) => setActiveOAState(oa);

    const signOut = async () => {
        await supabase.auth.signOut();
        router.push('/auth/login');
    };

    useEffect(() => {
        let isMounted = true;

        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user?.email && isMounted) {
                await fetchPartnerData(session.user.email);
            } else if (isMounted) {
                setIsLoading(false);
                if (!window.location.pathname.includes('/auth/login')) {
                    router.push('/auth/login');
                }
            }
        };

        init();

        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user?.email && isMounted) {
                await fetchPartnerData(session.user.email);
            }
        });

        return () => {
            isMounted = false;
            authListener.subscription.unsubscribe();
        };
    }, [router]);

    return (
        <PartnerContext.Provider value={{ 
            partner, officialAccounts, activeOA, setActiveOA,
            triggerCommand, setTriggerCommand, updatePartner, 
            isLoading, signOut 
        }}>
            {children}
        </PartnerContext.Provider>
    );
};

export const usePartner = () => {
    const context = useContext(PartnerContext);
    if (context === undefined) throw new Error('usePartner must be used within a PartnerProvider');
    return context;
};
