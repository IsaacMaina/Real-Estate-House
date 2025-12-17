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

    // Update URL with search parameters
    const searchParams = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, val]) => {
      // Don't add 'Any' to the URL parameters since it means 'no filter'
      if (val && val !== '' && val !== 'Any' && val !== 'any') {
        if (Array.isArray(val) && val.length > 0) {
          searchParams.set(key, val.join(','));
        } else if (!Array.isArray(val)) {
          searchParams.set(key, String(val));
        }
      }
    });

    // Only update URL if there are changes
    if (typeof window !== 'undefined' && window.history) {
      const newUrl = searchParams.toString()
        ? `/properties?${searchParams.toString()}`
        : '/properties';
      window.history.replaceState(null, '', newUrl);
    }

    if (onFilterChange) {
      onFilterChange(updatedFilters);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h3 className="text-xl font-bold text-gray-900">Find Your Dream Home</h3>
        
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by location..."
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          
          <div className="min-w-[150px]">
            <select
              value={filters.propertyType}
              onChange={(e) => handleFilterChange('propertyType', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {propertyTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
          >
            More Filters
            <svg 
              className={`ml-2 w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
      
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 pt-6 border-t border-gray-200"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
                <select
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">No min</option>
                  <option value="5000000">KSh 5M</option>
                  <option value="10000000">KSh 10M</option>
                  <option value="20000000">KSh 20M</option>
                  <option value="50000000">KSh 50M</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
                <select
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">No max</option>
                  <option value="10000000">KSh 10M</option>
                  <option value="20000000">KSh 20M</option>
                  <option value="50000000">KSh 50M</option>
                  <option value="100000000">KSh 100M</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Beds</label>
                <select
                  value={filters.beds}
                  onChange={(e) => handleFilterChange('beds', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                  <option value="5">5+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Baths</label>
                <select
                  value={filters.baths}
                  onChange={(e) => handleFilterChange('baths', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Area (sqm)</label>
                <input
                  type="number"
                  placeholder="Min area in sqm"
                  value={filters.sqm}
                  onChange={(e) => handleFilterChange('sqm', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {features.map((feature) => (
                    <div key={feature} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`feature-${feature}`}
                        checked={filters.features.includes(feature)}
                        onChange={(e) => {
                          const updatedFeatures = e.target.checked
                            ? [...filters.features, feature]
                            : filters.features.filter(f => f !== feature);
                          handleFilterChange('features', updatedFeatures);
                        }}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <label htmlFor={`feature-${feature}`} className="ml-2 text-sm text-gray-700">
                        {feature}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button 
                onClick={() => {
                  setFilters({
                    location: '',
                    propertyType: '',
                    minPrice: '',
                    maxPrice: '',
                    beds: '',
                    baths: '',
                    sqm: '',  // Changed from 'sqm' to 'sqm' as per the actual field
                    features: [],
                  });
                  if (onFilterChange) {
                    onFilterChange({
                      location: '',
                      propertyType: '',
                      minPrice: '',
                      maxPrice: '',
                      beds: '',
                      baths: '',
                      sqm: '',
                      features: [],
                    });
                  }
                }}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 mr-4"
              >
                Clear All
              </button>
              <button 
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                onClick={() => setShowFilters(false)}
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PropertyFilters;