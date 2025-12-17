// src/app/metadata/about.ts
import { Metadata } from 'next';

export const getAboutMetadata = (): Metadata => {
  return {
    title: 'About Us | Luxury Kenya Real Estate Platform',
    description: 'Learn more about our luxury real estate platform dedicated to connecting discerning buyers with premium properties across Kenya.',
    keywords: 'about luxury real estate kenya, kenya real estate platform, premium properties kenya, real estate company kenya',
    openGraph: {
      title: 'About Us | Luxury Kenya Real Estate Platform',
      description: 'Learn more about our luxury real estate platform dedicated to connecting discerning buyers with premium properties across Kenya.',
      type: 'website',
      locale: 'en_KE', // Kenyan locale
    },
    twitter: {
      card: 'summary_large_image',
      title: 'About Us | Luxury Kenya Real Estate Platform',
      description: 'Learn more about our luxury real estate platform.',
    },
  };
};