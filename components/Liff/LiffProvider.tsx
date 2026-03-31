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
        await liff.init({ liffId });
        setLiffInstance(liff);
        
        const loggedIn = liff.isLoggedIn();
        setIsLoggedIn(loggedIn);

        if (loggedIn) {
          const userProfile = await liff.getProfile();
          setProfile(userProfile);
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
