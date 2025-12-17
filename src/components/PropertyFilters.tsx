// src/components/PropertyFilters.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PropertyFilters = ({ onFilterChange }: { onFilterChange?: (filters: any) => void }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    propertyType: '',
    minPrice: '',
    maxPrice: '',
    beds: '',
    baths: '',
    sqm: '',
    features: [] as string[],
  });

  const [propertyTypes, setPropertyTypes] = useState<string[]>(['Any', 'House', 'Apartment', 'Penthouse', 'Villa', 'Condo', 'Townhouse', 'Commercial']);
  const locations = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Kisii', 'Thika', 'Naivasha'];
  const features = ['Swimming Pool', 'Garden', 'Garage', 'Balcony', 'Fireplace', 'Ocean View', 'Mountain View', 'Smart Home', 'Servants Quarters', 'Borehole', 'Solar Power'];

  // Fetch property types from the database on component mount
  useEffect(() => {
    const fetchPropertyTypes = async () => {
      try {
        const response = await fetch('/api/admin/property-types');
        if (response.ok) {
          const data = await response.json();
          // Prepend 'Any' to the list from the database
          setPropertyTypes(['Any', ...data]);
        }
      } catch (error) {
        console.error('Error fetching property types:', error);
        // Continue with default types if API fails
      }
    };

    fetchPropertyTypes();
  }, []);

  const handleFilterChange = (name: string, value: string | number | string[]) => {
    const updatedFilters = { ...filters, [name]: value };
    setFilters(updatedFilters);
  };

  const handleSearch = () => {
    // Update URL with search parameters
    const searchParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      // Don't add 'Any' to the URL parameters since it means 'no filter'
      if (val && val !== '' && val !== 'Any' && val !== 'any') {
        if (Array.isArray(val) && val.length > 0) {
          searchParams.set(key, val.join(','));
        } else if (!Array.isArray(val)) {
          searchParams.set(key, String(val));
        }
      }
    });

    // Update URL with search parameters
    if (typeof window !== 'undefined' && window.history) {
      const newUrl = searchParams.toString()
        ? `/properties?${searchParams.toString()}`
        : '/properties';
      window.history.replaceState(null, '', newUrl);
    }

    if (onFilterChange) {
      onFilterChange(filters);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900">Find Your Dream Home</h3>
        <p className="text-gray-600 mt-2">Use the filters below to find your perfect property</p>
      </div>
    </div>
  );
};

export default PropertyFilters;