// src/app/metadata/home.ts
import { Metadata } from 'next';

// Define the structure for homepage hero content
interface HeroContent {
  headline: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage: string;
  backgroundColor: string; // For fade overlays
}

// Define the structure for the homepage data
interface HomePageContent {
  hero: HeroContent;
  // Add other sections as needed
  title: string;
  description: string;
  keywords: string;
  openGraph: any;
  twitter: any;
}

// Default content
const DEFAULT_HOME_CONTENT: HomePageContent = {
  title: 'Luxury Kenya Real Estate | Premium Properties Across Kenya',
  description: 'Discover premium luxury properties across Kenya with our sophisticated real estate platform.',
  keywords: 'luxury real estate kenya, premium properties kenya, luxury homes kenya, real estate listings kenya',
  hero: {
    headline: 'Discover Premium Kenyan Properties',
    subtitle: 'Premium properties across Kenya curated for the discerning homeowner. Experience elegance, comfort, and sophistication in every detail.',
    ctaText: 'Explore Properties',
    ctaLink: '/properties',
    backgroundImage: '/hero-bg.jpg', // default background
    backgroundColor: 'from-black/70 to-black/30' // default gradient
  },
  openGraph: {
    title: 'Luxury Kenya Real Estate | Premium Properties Across Kenya',
    description: 'Discover premium luxury properties across Kenya with our sophisticated real estate platform. Browse high-end homes with beautiful imagery and smooth animations.',
    type: 'website',
    locale: 'en_KE', // Kenyan locale
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Luxury Kenya Real Estate | Premium Properties Across Kenya',
    description: 'Discover premium luxury properties across Kenya with our sophisticated real estate platform.',
  }
};

let homeContent: HomePageContent = DEFAULT_HOME_CONTENT;

// Function to get homepage content
export const getHomeContent = (): HomePageContent => {
  // In a real app, this would fetch from a CMS or database
  return homeContent;
};

// Function to get homepage metadata
export const getHomeMetadata = (): Metadata => {
  const content = getHomeContent();
  
  return {
    title: content.title,
    description: content.description,
    keywords: content.keywords,
    openGraph: content.openGraph,
    twitter: content.twitter,
  };
};

// Function to update homepage content (would be called from admin panel)
export const updateHomeContent = (newContent: Partial<HomePageContent>) => {
  homeContent = { ...homeContent, ...newContent };
  // In a real app, this would update a database
  console.log('Home content updated:', newContent);
};

// Function to get hero section content specifically
export const getHeroContent = () => {
  return getHomeContent().hero;
};

// Function to update hero section specifically
export const updateHeroContent = (newHero: Partial<HeroContent>) => {
  const current = getHomeContent();
  updateHomeContent({ hero: { ...current.hero, ...newHero } });
};