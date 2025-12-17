'use client';

import HeroSection from '@/components/HeroSection';
import PropertyGrid from '@/components/PropertyGrid';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import Navigation from '@/components/Navigation';
import { useState, useEffect } from 'react';

interface Property {
  id: string;
  title: string;
  location: string;
  price: string;
  beds: number;
  baths: number;
  sqft: number;
  parking: number;
  image: string;
  description: string;
  propertyType?: string;
  featured: boolean;
}

interface HomePageProps {
  heroData?: {
    heroTitle: string;
    heroSubtitle: string;
    heroDescription?: string;
    heroImageUrl: string;
  } | null;
  featuredProperties?: Property[];
}

export default function ClientHomePage({ heroData, featuredProperties }: HomePageProps) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check initial online status
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // If offline and no data was provided from the server, show offline message
  if (!isOnline && (!featuredProperties || featuredProperties.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="pt-24">
          <div className="container mx-auto px-4 py-16">
            <div className="flex flex-col items-center justify-center min-h-96 py-20">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 mx-auto mb-4 text-indigo-500">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">No Internet Connection</h2>
                <p className="text-gray-600 mb-6">
                  You are currently offline. Please connect to the internet to view property listings.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Check Connection
                </button>
              </div>
            </div>
          </div>
        </main>
        <FloatingWhatsApp />
      </div>
    );
  }

  return (
    <div className="relative">
      <Navigation />
      <main>
        <HeroSection />
                 <PropertyGrid initialProperties={featuredProperties || []} searchParams={{}} />

      </main>
      <FloatingWhatsApp />
    </div>
  );
}