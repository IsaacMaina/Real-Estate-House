// src/app/metadata/contact.ts
import { Metadata } from 'next';

export const getContactMetadata = (): Metadata => {
  return {
    title: 'Contact Us | Kenya Luxury Real Estate Team',
    description: 'Get in touch with our luxury real estate team in Kenya. We are here to help you find your dream property across Kenya.',
    keywords: 'contact real estate kenya, luxury real estate kenya contact, real estate agents kenya, property inquiry kenya',
    openGraph: {
      title: 'Contact Us | Kenya Luxury Real Estate Team',
      description: 'Get in touch with our luxury real estate team in Kenya. We are here to help you find your dream property across Kenya.',
      type: 'website',
      locale: 'en_KE', // Kenyan locale
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Contact Us | Kenya Luxury Real Estate Team',
      description: 'Get in touch with our luxury real estate team.',
    },
  };
};