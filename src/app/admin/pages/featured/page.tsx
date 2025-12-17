// src/app/admin/pages/featured/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaHome, FaStar, FaRegStar, FaSave, FaTimes, FaSearch } from 'react-icons/fa';

// Mock data for demonstration - in a real app, this would come from your API
const mockProperties = [
  { id: '1', title: 'Luxury Villa in Karen', location: 'Nairobi, Kenya', price: 'KSh 50,000,000', beds: 4, baths: 4, sqft: 4500, propertyType: 'Villa', status: 'Available', featured: false },
  { id: '2', title: 'Penthouse in Upper Hill', location: 'Nairobi, Kenya', price: 'KSh 35,000,000', beds: 3, baths: 3, sqft: 3200, propertyType: 'Apartment', status: 'Available', featured: false },
  { id: '3', title: 'Estate Home in Mombasa Rd', location: 'Nairobi, Kenya', price: 'KSh 25,000,000', beds: 5, baths: 4, sqft: 5200, propertyType: 'House', status: 'Available', featured: false },
  { id: '4', title: 'Modern Apartment in Westlands', location: 'Nairobi, Kenya', price: 'KSh 18,000,000', beds: 2, baths: 2, sqft: 1800, propertyType: 'Apartment', status: 'Sold', featured: false },
  { id: '5', title: 'Beach Front Property', location: 'Mombasa, Kenya', price: 'KSh 80,000,000', beds: 6, baths: 5, sqft: 8000, propertyType: 'Villa', status: 'Available', featured: false },
  { id: '6', title: 'Commercial Building', location: 'CBD, Nairobi', price: 'KSh 150,000,000', beds: 0, baths: 0, sqft: 12000, propertyType: 'Commercial', status: 'Available', featured: false },
  { id: '7', title: 'Townhouse in Gigiri', location: 'Nairobi, Kenya', price: 'KSh 45,000,000', beds: 4, baths: 3, sqft: 3800, propertyType: 'Townhouse', status: 'Available', featured: false },
  { id: '8', title: 'Farm House in Limuru', location: 'Kiambu, Kenya', price: 'KSh 30,000,000', beds: 3, baths: 2, sqft: 3000, propertyType: 'House', status: 'Reserved', featured: false },
  { id: '9', title: 'Office Complex', location: 'Westlands, Nairobi', price: 'KSh 200,000,000', beds: 0, baths: 0, sqft: 15000, propertyType: 'Commercial', status: 'Available', featured: false },
  { id: '10', title: 'Contemporary Home', location: 'Runda, Nairobi', price: 'KSh 75,000,000', beds: 5, baths: 5, sqft: 7000, propertyType: 'House', status: 'Available', featured: false },
];

const FeaturedPropertiesManagement = () => {
  const router = useRouter();
  const [allProperties, setAllProperties] = useState<any[]>([]);
  const [featuredProperties, setFeaturedProperties] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch('/api/admin/featured-properties');
        if (response.ok) {
          const data = await response.json();
          setAllProperties(Array.isArray(data.allProperties) ? data.allProperties : []);

          // Set featured properties based on the data
          const featuredIds = Array.isArray(data.featuredProperties)
            ? data.featuredProperties?.map((prop: any) => prop.id) || []
            : [];
          setFeaturedProperties(featuredIds);
        } else {
          console.error('Error fetching properties:', await response.text());
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const toggleFeaturedProperty = (propertyId: string) => {
    setFeaturedProperties(prev => {
      if (prev.includes(propertyId)) {
        // Remove from featured
        return prev.filter(id => id !== propertyId);
      } else {
        // Add to featured (limit to 3)
        if (prev.length >= 3) {
          alert('You can only select up to 3 featured properties');
          return prev;
        }
        return [...prev, propertyId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/admin/featured-properties', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          featuredPropertyIds: featuredProperties
        }),
      });

      if (response.ok) {
        alert('Featured properties updated successfully!');
        router.push('/admin/pages');
      } else {
        const errorData = await response.json();
        alert(`Failed to update featured properties: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating featured properties:', error);
      alert('An error occurred while updating featured properties');
    } finally {
      setSaving(false);
    }
  };

  const filteredProperties = allProperties.filter(property =>
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.propertyType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Homepage Featured Properties</h1>
              <p className="text-gray-600">Select up to 3 properties to feature on the homepage</p>
            </div>
            <button
              onClick={() => router.push('/admin/pages')}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <FaTimes className="mr-2" />
              Back to Pages
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Featured Properties Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FaHome className="text-indigo-600 mr-2" />
                  Current Featured Properties
                  <span className="ml-2 text-sm bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                    {featuredProperties.length}/3
                  </span>
                </h2>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 min-h-[150px]">
                {featuredProperties.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {featuredProperties.map(propertyId => {
                      const property = allProperties.find(p => p.id === propertyId);
                      return property ? (
                        <div
                          key={property.id}
                          className="flex items-center p-3 bg-white rounded-lg border border-indigo-300 cursor-pointer hover:bg-indigo-50"
                          onClick={() => toggleFeaturedProperty(property.id)}
                        >
                          <span className="text-indigo-600 mr-2">
                            <FaStar />
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{property.title}</p>
                            <p className="text-sm text-gray-500 truncate">{property.location}</p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFeaturedProperty(property.id);
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      ) : null;
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No properties currently featured</p>
                  </div>
                )}
              </div>
            </div>

            {/* Available Properties */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Available Properties</h2>
                <div className="relative w-64">
                  <input
                    type="text"
                    placeholder="Search properties..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Featured</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredProperties.map(property => (
                        <tr 
                          key={property.id} 
                          className={`cursor-pointer hover:bg-gray-50 ${
                            featuredProperties.includes(property.id) 
                              ? 'bg-indigo-50 border-l-4 border-indigo-500' 
                              : ''
                          }`}
                          onClick={() => toggleFeaturedProperty(property.id)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-md overflow-hidden bg-gray-200">
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="text-gray-500 text-xs">No img</span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{property.title}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{property.location}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-medium">{property.price}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{property.propertyType}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                              ${property.status === 'Available' ? 'bg-green-100 text-green-800' :
                                property.status === 'Sold' ? 'bg-red-100 text-red-800' :
                                property.status === 'Reserved' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'}`}>
                              {property.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFeaturedProperty(property.id);
                              }}
                              className={`${
                                featuredProperties.includes(property.id)
                                  ? 'text-indigo-600 hover:text-indigo-900'
                                  : 'text-gray-400 hover:text-gray-600'
                              }`}
                            >
                              {featuredProperties.includes(property.id) ? (
                                <FaStar className="text-lg" />
                              ) : (
                                <FaRegStar className="text-lg" />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className={`flex items-center px-6 py-3 rounded-lg ${
                  saving ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
                } text-white`}
              >
                <FaSave className="mr-2" />
                {saving ? 'Saving...' : 'Save Featured Properties'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FeaturedPropertiesManagement;