import React, { createContext, useContext, useEffect, useState } from 'react';

declare global {
  interface Window {
    liff: any;
  }
}

interface LiffContextType {
  liff: any | null;
  profile: any | null;
  isLoggedIn: boolean;
  error: string | null;
  isLoading: boolean;
  activeBotsCount: number;
  trialMessagesUsed: number;
  isPaid: boolean;
}

const LiffContext = createContext<LiffContextType>({
  liff: null,
  profile: null,
  isLoggedIn: false,
  error: null,
  isLoading: true,
  activeBotsCount: 5,
  trialMessagesUsed: 10,
  isPaid: false,
});

export const useLiff = () => useContext(LiffContext);

export const LiffProvider = ({ 
  children, 
  liffId 
}: { 
  children: React.ReactNode;
  liffId: string;
}) => {
  const [liffInstance, setLiffInstance] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock PLG Database State
  const [activeBotsCount, setActiveBotsCount] = useState(5);
  const [trialMessagesUsed, setTrialMessagesUsed] = useState(10);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    const initLiff = async () => {
      if (!liffId) {
        console.warn('LIFF ID is missing');
        setIsLoading(false);
        return;
      }

      try {
        const liff = window.liff;
        if (!liff) {
          throw new Error('LIFF SDK not found');
        }

        console.log('[LIFF] Starting init...');
        await liff.init({ liffId });
        setLiffInstance(liff);
        
        // 1. Check Login Status
        if (!liff.isLoggedIn()) {
          console.log('[LIFF] Not logged in, triggering login...');
          liff.login({ redirectUri: window.location.href });
          return; // Redirect will happen
        }

        setIsLoggedIn(true);
        console.log('[LIFF] Logged in successfully');

        // 2. Get Profile
        const userProfile = await liff.getProfile();
        setProfile(userProfile);

        // 3. Synchronize Session with Website Backend
        // This sets the server-side cookies so the member is recognized on both LIFF and Web
        console.log('[LIFF] Synchronizing session with backend...');
        const syncRes = await fetch('/api/auth/session-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userProfile.userId,
            displayName: userProfile.displayName,
            pictureUrl: userProfile.pictureUrl
          })
        });

        const syncData = await syncRes.json();
        if (syncData.success && syncData.member) {
          console.log('[LIFF] Session sync successful');
          setIsPaid(syncData.member.plan_level > 0);
        }

      } catch (err: any) {
        console.error('LIFF init error', err);
        setError(err.message || 'LIFF Initialization failed');
      } finally {
        setIsLoading(false);
      }
    };

    initLiff();
  }, [liffId]);

  return (
    <LiffContext.Provider value={{
      liff: liffInstance,
      profile,
      isLoggedIn,
      error,
      isLoading,
      activeBotsCount,
      trialMessagesUsed,
      isPaid
    }}>
      {children}
    </LiffContext.Provider>
  );
};
