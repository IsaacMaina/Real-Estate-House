// src/app/properties/metadata.tsx
import { getPropertiesMetadata } from '@/metadata/properties';

interface SearchParams {
  location?: string;
  type?: string;
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }) {
  return getPropertiesMetadata({
    location: searchParams.location,
    type: searchParams.type,
  });
}