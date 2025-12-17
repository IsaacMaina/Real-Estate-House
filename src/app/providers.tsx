// src/app/providers.tsx
'use client';

import { SessionProvider } from 'next-auth/react';
import AppWrapper from '@/components/AppWrapper';

type Props = {
  children: React.ReactNode;
};

export function Providers({ children }: Props) {
  return (
    <SessionProvider>
      <AppWrapper>
        {children}
      </AppWrapper>
    </SessionProvider>
  );
}