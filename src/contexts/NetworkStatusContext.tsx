// src/contexts/NetworkStatusContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface NetworkStatusContextType {
  isOnline: boolean;
  isChecking: boolean;
}

const NetworkStatusContext = createContext<NetworkStatusContextType | undefined>(undefined);

export function NetworkStatusProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  useEffect(() => {
    // Check initial network status
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);

    const handleOnline = () => {
      setIsOnline(true);
      setIsChecking(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    const handleBeforeUnload = () => {
      // Set a flag to indicate we're navigating away
      sessionStorage.setItem('isNavigating', 'true');
    };

    // Listen to online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Check network status periodically in case events don't fire correctly
    const interval = setInterval(async () => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setIsOnline(false);
        return;
      }
      
      try {
        setIsChecking(true);
        const response = await fetch('/api/ping', { method: 'HEAD' });
        setIsOnline(response.ok);
      } catch (error) {
        setIsOnline(false);
      } finally {
        setIsChecking(false);
      }
    }, 5000); // Check every 5 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(interval);
    };
  }, []);

  return (
    <NetworkStatusContext.Provider value={{ isOnline, isChecking }}>
      {children}
    </NetworkStatusContext.Provider>
  );
}

export function useNetworkStatus() {
  const context = useContext(NetworkStatusContext);
  if (context === undefined) {
    // This can happen during SSR or if component is not wrapped in provider
    // For our use case, we'll return safe defaults
    return { isOnline: true, isChecking: false };
  }
  return context;
}