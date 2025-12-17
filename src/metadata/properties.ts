// src/metadata/properties.ts
import { Metadata } from 'next';

export async function getPropertiesMetadata(params: { location?: string; type?: string }): Promise<Metadata> {
  const { location, type } = params;

  let title = 'Premium Properties in Kenya | Luxury Kenya Real Estate';
  let description = 'Browse our collection of premium luxury properties across Kenya. Find your dream home with our sophisticated real estate platform.';

  if (location && type) {
    title = `Luxury ${type} in ${location}, Kenya | Premium Properties`;
    description = `Browse our collection of luxury ${type} in ${location}, Kenya. Find your dream home with our sophisticated real estate platform.`;
  } else if (location) {
    title = `Luxury Properties in ${location}, Kenya | Premium Real Estate`;
    description = `Browse our collection of luxury properties in ${location}, Kenya. Find your dream home with our sophisticated real estate platform.`;
  } else if (type) {
    title = `Premium ${type} in Kenya | Luxury Kenya Real Estate`;
    description = `Browse our collection of premium ${type} across Kenya. Find your dream home with our sophisticated real estate platform.`;
  }

  return {
    title,
    description,
    keywords: `luxury ${type || ''} kenya, premium properties ${location || ''}, ${location || 'kenya'} real estate, kenya real estate, high-end homes`,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'en_KE', // Kenyan locale
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
};