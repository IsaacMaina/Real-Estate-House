// src/components/PropertyGrid.tsx
'use client';

import { useState } from 'react';
import type { FC } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import PropertyCard from './PropertyCard';

interface SearchParams {
  location?: string;
  propertyType?: string;
  minPrice?: string;
  maxPrice?: string;
  beds?: string;
  parking?: string;
  baths?: string;
  sqm?: string;
}

interface Property {
  id: string;
  title: string;
  location: string;
  price: string;
  beds: number;
  baths: number;
  parking:number;
  sqft: number;
  image: string;
  description: string;
  propertyType?: string;
  featured: boolean;
}

interface PropertyGridProps {
  searchParams?: SearchParams;
  initialProperties?: Property[];
}

const PropertyGrid: React.FC<PropertyGridProps> = ({ searchParams = {}, initialProperties = [] }) => {
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);

  // Filter properties based on search parameters
  const filteredProperties = initialProperties.filter(property => {
    const matchesLocation = !searchParams.location ||
      property.location.toLowerCase().includes(searchParams.location.toLowerCase());

    const matchesPropertyType = !searchParams.propertyType ||
      searchParams.propertyType.toLowerCase() === 'any' ||
      property.propertyType?.toLowerCase() === searchParams.propertyType.toLowerCase();

    const matchesBeds = !searchParams.beds ||
      property.beds >= parseInt(searchParams.beds || '0');

    const matchesBaths = !searchParams.baths ||
      property.baths >= parseInt(searchParams.baths || '0');

    const matchesParking = !searchParams.parking ||
      property.parking >= parseInt(searchParams.parking || '0');

    const matchesSqm = !searchParams.sqm ||
      property.sqft >= parseInt(searchParams.sqm || '0'); // Using sqft directly since property.sqft is already in sqft

    return matchesLocation && matchesPropertyType && matchesBeds && matchesBaths && matchesParking && matchesSqm;
  });

  // Filter featured properties from filtered results
  const featuredProperties = filteredProperties.filter(property => property.featured);

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured <span className="text-indigo-600">Properties</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our handpicked selection of premium properties in Kenya that exemplify luxury living
          </p>
        </div>

        {/* Featured property section */}
        {featuredProperties.length > 0 && (
          <div className="mb-16 overflow-hidden">
            <motion.div
              className="w-full h-full rounded-2xl overflow-hidden shadow-xl bg-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Link href={`/properties/${featuredProperties[0].id}`} className="block">
                <PropertyCard
                  property={featuredProperties[0]}
                  onClick={() => setSelectedProperty(featuredProperties[0].id)}
                />
              </Link>
            </motion.div>
          </div>
        )}

        {/* Grid of properties - visible on all screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProperties.map((property, index) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={`/properties/${property.id}`} className="block">
                <PropertyCard
                  property={property}
                  onClick={() => setSelectedProperty(property.id)}
                />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View More Button */}
        <div className="text-center mt-12">
          <Link href="/properties">
            <motion.button
              className="px-8 py-3 bg-white text-indigo-600 font-medium rounded-lg border-2 border-indigo-600 hover:bg-indigo-50 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View All Properties
            </motion.button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PropertyGrid;