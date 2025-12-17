// src/app/properties/PropertiesPageContentWrapper.tsx
'use client';

import { useState, useEffect } from 'react';
import PropertiesPageContent from './PropertiesPageContent';

interface SearchParams {
  location?: string;
  propertyType?: string;
  minPrice?: string;
  maxPrice?: string;
  beds?: string;
  baths?: string;
}

const PropertiesPageContentWrapper = ({ searchParams }: { searchParams: SearchParams }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render a loading state on the server
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="pt-24">
          <div className="container mx-auto px-4 py-8">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-64" />
          </div>
        </div>
      </div>
    );
  }

  return <PropertiesPageContent searchParams={searchParams} />;
};

export default PropertiesPageContentWrapper;