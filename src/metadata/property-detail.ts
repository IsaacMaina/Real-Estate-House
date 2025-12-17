// src/metadata/property-detail.ts
import { Metadata } from 'next';

export const getPropertyDetailMetadata = (property: any): Metadata => {
  if (!property) {
    return {
      title: 'Property Details | Luxury Kenya Real Estate',
      description: 'View details of premium luxury properties in Kenya on our sophisticated real estate platform.',
    };
  }

  return {
    title: `${property.title} | ${property.price} | Kenya Luxury Real Estate`,
    description: property.description || `View details of this premium ${property.propertyType} in ${property.location}, Kenya.`,
    keywords: `luxury ${property.propertyType} kenya, premium property ${property.location}, ${property.location} real estate, kenya real estate, high-end home, ${property.beds} beds, ${property.baths} baths`,
    openGraph: {
      title: `${property.title} | ${property.price}`,
      description: property.description || `View details of this premium ${property.propertyType} in ${property.location}, Kenya.`,
      type: 'website',
      locale: 'en_KE', // Kenyan locale
      images: [
        {
          url: property.image || '/default-property-image.jpg',
          width: 1200,
          height: 630,
          alt: property.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${property.title} | ${property.price}`,
      description: property.description || `Premium ${property.propertyType} in ${property.location}, Kenya.`,
    },
  };
};