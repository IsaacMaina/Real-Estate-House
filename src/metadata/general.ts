// src/app/metadata/general.ts
import { Metadata } from 'next';

export const getGeneralMetadata = (title: string, description: string): Metadata => {
  return {
    title: `${title} | Luxury Kenya Real Estate`,
    description,
    keywords: 'luxury real estate kenya, premium properties kenya, kenya real estate, high-end homes kenya',
    openGraph: {
      title: `${title} | Luxury Kenya Real Estate`,
      description,
      type: 'website',
      locale: 'en_KE', // Kenyan locale
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Luxury Kenya Real Estate`,
      description,
    },
  };
};