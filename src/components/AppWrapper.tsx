// src/components/AppWrapper.tsx
'use client';

import { ReactNode } from 'react';
import { NetworkStatusProvider } from '@/contexts/NetworkStatusContext';
import NetworkErrorBoundary from '@/components/NetworkErrorBoundary';

const AppWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <NetworkStatusProvider>
      <NetworkErrorBoundary>
        {children}
      </NetworkErrorBoundary>
    </NetworkStatusProvider>
  );
};

export default AppWrapper;