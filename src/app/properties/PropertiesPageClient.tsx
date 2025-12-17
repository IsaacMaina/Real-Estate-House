// src/app/properties/PropertiesPageClient.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import PropertyFilters from '@/components/PropertyFilters';
import PropertyGrid from '@/components/PropertyGrid';

interface SearchParams {
  location?: string;
  propertyType?: string;
  minPrice?: string;
  maxPrice?: string;
  beds?: string;
  baths?: string;
}

const PropertiesPageClient = () => {
  const searchParams = useSearchParams();

  // Parse search parameters from URL
  const parsedSearchParams: SearchParams = {
    location: searchParams?.get('location') || undefined,
    propertyType: searchParams?.get('propertyType') || undefined,
    minPrice: searchParams?.get('minPrice') || undefined,
    maxPrice: searchParams?.get('maxPrice') || undefined,
    beds: searchParams?.get('beds') || undefined,
    baths: searchParams?.get('baths') || undefined,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="pt-24">
        <div className="container mx-auto px-4 py-8">
          <PropertyFilters />
          <PropertyGrid searchParams={parsedSearchParams} />
        </div>
      </main>
      <FloatingWhatsApp />
    </div>
  );
};

export default PropertiesPageClient;