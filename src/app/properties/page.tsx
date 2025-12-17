// src/app/properties/page.tsx
import Navigation from '@/components/Navigation';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import PropertyFilters from '@/components/PropertyFilters';
import PropertyGridWrapper from './PropertyGridWrapper';
import { getAllProperties } from '@/lib/db-actions';
import MainLayout from '@/layouts/MainLayout';

export const metadata = {
  title: 'Premium Properties in Kenya | Luxury Kenya Real Estate',
  description: 'Browse our collection of premium luxury properties across Kenya. Find your dream home with our sophisticated real estate platform.',
  keywords: 'luxury properties kenya, premium real estate kenya, nairobi properties, mombasa properties, high-end homes kenya',
  openGraph: {
    title: 'Premium Properties in Kenya | Luxury Kenya Real Estate',
    description: 'Browse our collection of premium luxury properties across Kenya. Find your dream home with our sophisticated real estate platform.',
    type: 'website',
    locale: 'en_KE', // Kenyan locale
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Premium Properties in Kenya | Luxury Kenya Real Estate',
    description: 'Browse our collection of premium luxury properties across Kenya.',
  },
};

interface SearchParams {
  location?: string;
  propertyType?: string;
  minPrice?: string;
  maxPrice?: string;
  beds?: string;
  baths?: string;
}

export default async function PropertiesPage({ searchParams }: { searchParams: SearchParams }) {
  let properties = [];

  try {
    // Pass search parameters to filter the properties
    properties = await getAllProperties(searchParams);
  } catch (error) {
    console.error('Error fetching properties:', error);
    // If there's an error (e.g. database connection issue), we'll pass an empty array
    // The client wrapper will show an appropriate message when offline
    properties = [];
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="container mx-auto px-4 py-8">
          <PropertyFilters />
          <PropertyGridWrapper initialProperties={properties} searchParamsFromProps={searchParams} />
        </div>
      </div>
      <FloatingWhatsApp />
    </MainLayout>
  );
}