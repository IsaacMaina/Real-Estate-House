// src/layouts/MainLayout.tsx
'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Footer from '@/components/Footer';
import Navigation from '@/components/Navigation';

const FOOTER_EXCLUDED_PATHS = ['/login', '/register', '/auth'];

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const pathname = usePathname();
  
  // Check if we're on a page where footer should be excluded
  const shouldHideFooter = FOOTER_EXCLUDED_PATHS.some(path => pathname?.startsWith(path));

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow">
        {children}
      </main>
      {!shouldHideFooter && <Footer />}
    </div>
  );
};

export default MainLayout;