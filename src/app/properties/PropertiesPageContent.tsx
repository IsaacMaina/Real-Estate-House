// src/app/properties/PropertiesPageContent.tsx
'use client';

import { useState, useEffect } from 'react';
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

const PropertiesPageContent = () => {
  const searchParams = useSearchParams();
  
  // Convert URLSearchParams to our object structure with state
  const [params, setParams] = useState<SearchParams>({
    location: undefined,
    propertyType: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    beds: undefined,
    baths: undefined,
  });
  
  useEffect(() => {
    const location = searchParams?.get('location') || undefined;
    const propertyType = searchParams?.get('propertyType') || undefined;
    const minPrice = searchParams?.get('minPrice') || undefined;
    const maxPrice = searchParams?.get('maxPrice') || undefined;
    const beds = searchParams?.get('beds') || undefined;
    const baths = searchParams?.get('baths') || undefined;

    setParams({
      location,
      propertyType,
      minPrice,
      maxPrice,
      beds,
      baths,
    });
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="pt-24">
        <div className="container mx-auto px-4 py-8">
          <PropertyFilters />
          <PropertyGrid searchParams={params} />
        </div>
      </main>
      <FloatingWhatsApp />
    </div>
  );
};

export default PropertiesPageContent;