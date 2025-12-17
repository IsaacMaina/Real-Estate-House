// src/app/properties/PropertyGridWrapper.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import PropertyGrid from '@/components/PropertyGrid';
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

interface SearchParams {
  location?: string;
  propertyType?: string;
  minPrice?: string;
  maxPrice?: string;
  beds?: string;
  baths?: string;
}

// Parse URL search params into our structure
const usePropertySearchParams = () => {
  const searchParams = useSearchParams();

  const params = {
    location: searchParams?.get('location') || undefined,
    propertyType: searchParams?.get('propertyType') || undefined,
    minPrice: searchParams?.get('minPrice') || undefined,
    maxPrice: searchParams?.get('maxPrice') || undefined,
    beds: searchParams?.get('beds') || undefined,
    baths: searchParams?.get('baths') || undefined,
    sqm: searchParams?.get('sqm') || undefined,
  };

  return params;
};

const PropertyGridWrapper = ({ initialProperties }: { initialProperties?: Property[] }) => {
  const [properties, setProperties] = useState(initialProperties || []);
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const searchParams = usePropertySearchParams();

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

  // Fetch properties based on search params when they change
  useEffect(() => {
    const fetchProperties = async () => {
      if (!isOnline) return;

      setLoading(true);
      try {
        // Construct query string from search parameters
        const queryString = new URLSearchParams(
          Object.fromEntries(
            Object.entries(searchParams).filter(([_, value]) => value !== undefined)
          )
        ).toString();

        const response = await fetch(`/api/properties${queryString ? `?${queryString}` : ''}`);
        if (response.ok) {
          const data = await response.json();
          setProperties(data);
        } else {
          console.error('Failed to fetch properties:', response.statusText);
          setProperties(initialProperties || []);
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
        setProperties(initialProperties || []);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [JSON.stringify(searchParams), isOnline]); // Convert to string to compare object values

  // If offline and no initial properties were provided, show offline message
  if (!isOnline && (!initialProperties || initialProperties.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 py-20">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 text-indigo-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Internet Connection</h2>
          <p className="text-gray-600 mb-6">
            You are currently offline. Please connect to the internet to view properties.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Check Connection
          </button>
        </div>
      </div>
    );
  }

  return <PropertyGrid searchParams={searchParams} initialProperties={properties} loading={loading} />;
};

export default PropertyGridWrapper;