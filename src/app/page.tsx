// src/app/page.tsx
import { getHomeMetadata } from '@/metadata/home';
import ClientHomePage from './ClientHomePage'; // Separate client component
import { getHomeHeroContent, getFeaturedProperties } from '@/lib/db-actions';
import MainLayout from '@/layouts/MainLayout';

export async function generateMetadata() {
  return getHomeMetadata();
}

export default async function Home() {
  // Fetch data from database with error handling
  let heroData = null;
  let featuredProperties = [];

  try {
    heroData = await getHomeHeroContent();
  } catch (error) {
    console.error('Error fetching hero data:', error);
    // Use default values or null to let client handle offline state
    heroData = null;
  }

  try {
    featuredProperties = await getFeaturedProperties();
  } catch (error) {
    console.error('Error fetching featured properties:', error);
    // Use default values or empty array to let client handle offline state
    featuredProperties = [];
  }

  return (
    <MainLayout>
      <ClientHomePage heroData={heroData} featuredProperties={featuredProperties} />
    </MainLayout>
  );
}