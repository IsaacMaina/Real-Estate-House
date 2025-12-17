// src/app/properties/[id]/page.tsx
import { notFound } from 'next/navigation';
import { getPropertyDetailMetadata } from '@/metadata/property-detail';
import PropertyDetailPageClient from './PropertyDetailPageClient';
import { getPropertyById } from '@/lib/db-actions';

interface Params {
  id: string;
}

export async function generateMetadata({ params }: { params: Params }) {
  const property = await getPropertyById(params.id);
  if (!property) {
    return {};
  }
  return getPropertyDetailMetadata(property);
}

export default async function PropertyDetailPage({ params }: { params: Params }) {
  try {
    const property = await getPropertyById(params.id);

    if (!property) {
      console.error(`Property with ID ${params.id} not found in database`);
      notFound();
    }

    return <PropertyDetailPageClient property={property} />;
  } catch (error) {
    console.error(`Error fetching property with ID ${params.id}:`, error);
    notFound();
  }
}