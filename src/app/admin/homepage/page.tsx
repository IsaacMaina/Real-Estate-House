// src/app/admin/homepage/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaSave, FaTimes, FaHome, FaImages, FaStar } from 'react-icons/fa';

const HomepageManagement = () => {
  const router = useRouter();

  const [heroData, setHeroData] = useState({
    hero_title: '',
    hero_subtitle: '',
    hero_description: '',
    hero_image_url: ''
  });

  const [featuredProperties, setFeaturedProperties] = useState<any[]>([]);
  const [allProperties, setAllProperties] = useState<any[]>([]);
  const [availableImages, setAvailableImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch available images in the public folder
  useEffect(() => {
    const fetchAvailableImages = async () => {
      try {
        const response = await fetch('/api/admin/pages/hero/images');
        if (response.ok) {
          const data = await response.json();
          setAvailableImages(data.images);
        }
      } catch (error) {
        console.error('Error fetching available images:', error);
        // Fallback to known images
        setAvailableImages(['/img8.jpg', '/img16.jpg', '/placeholder-image.jpg']);
      }
    };

    fetchAvailableImages();
  }, []);

  // Fetch homepage content
  useEffect(() => {
    const fetchHomepageContent = async () => {
      try {
        // Fetch hero content
        const heroResponse = await fetch('/api/admin/pages/hero?pageSlug=/');
        if (heroResponse.ok) {
          const heroContent = await heroResponse.json();
          setHeroData({
            hero_title: heroContent.hero_title || '',
            hero_subtitle: heroContent.hero_subtitle || '',
            hero_description: heroContent.hero_description || '',
            hero_image_url: heroContent.hero_image_url || ''
          });
        }

        // Fetch featured properties
        const featuredResponse = await fetch('/api/admin/pages/featured');
        if (featuredResponse.ok) {
          const featuredContent = await featuredResponse.json();
          const ids = featuredContent.featuredProperties?.map((prop: any) => prop.id) || [];
          setFeaturedProperties(ids);
        }

        // Fetch all properties for selection
        const allPropertiesResponse = await fetch('/api/admin/pages/featured?all=true');
        if (allPropertiesResponse.ok) {
          const allData = await allPropertiesResponse.json();
          setAllProperties(allData.allProperties || []);
        }
      } catch (error) {
        console.error('Error fetching homepage content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomepageContent();
  }, []);

  const handleHeroChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setHeroData(prev => ({
      ...prev,
      [name]: value
    }));
  };


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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploading(true);

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'hero-images'); // Specific folder for hero images

        const response = await fetch('/api/admin/pages/images/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          setHeroData(prev => ({
            ...prev,
            hero_image_url: result.imageUrl
          }));

          // Refresh the available images list
          fetch('/api/admin/pages/images/upload?folder=hero-images')
            .then(res => res.json())
            .then(data => setAvailableImages(data.images || []));

          alert('Image uploaded successfully!');
        } else {
          const error = await response.json();
          alert(`Image upload failed: ${error.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('An error occurred while uploading the image');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleImageUploadClick = () => {
    // Trigger the hidden file input when the upload button is clicked
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleDeleteImage = async (imagePath: string) => {
    if (confirm(`Are you sure you want to delete this image: ${imagePath}?`)) {
      setDeleting(true);

      try {
        const response = await fetch(`/api/admin/pages/images/delete?imageUrl=${encodeURIComponent(imagePath)}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          // Update state to remove the deleted image
          setAvailableImages(prev => prev.filter(img => img !== imagePath));

          // If this was the current hero image, clear it
          if (heroData.hero_image_url === imagePath) {
            setHeroData(prev => ({
              ...prev,
              hero_image_url: ''
            }));
          }

          alert('Image deleted successfully!');
        } else {
          const error = await response.json();
          alert(`Image deletion failed: ${error.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error deleting image:', error);
        alert('An error occurred while deleting the image');
      } finally {
        setDeleting(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Update hero content - note: the API expects lowercase field names in some cases
      const heroResponse = await fetch('/api/admin/pages/hero', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageSlug: '/',
          heroTitle: heroData.hero_title,
          heroSubtitle: heroData.hero_subtitle,
          heroDescription: heroData.hero_description,
          heroImageUrl: heroData.hero_image_url
        }),
      });

      const heroResult = await heroResponse.json();

      if (!heroResponse.ok) {
        console.error('Hero content API error:', heroResult);
        throw new Error(heroResult.error || 'Failed to update hero content');
      } 

      // Update featured properties
      const featuredResponse = await fetch('/api/admin/pages/featured', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          featuredPropertyIds: featuredProperties
        }),
      });

      const featuredResult = await featuredResponse.json();

      if (!featuredResponse.ok) {
        console.error('Featured properties API error:', featuredResult);
        throw new Error(featuredResult.error || 'Failed to update featured properties');
      }

      alert('Homepage content updated successfully!');
      router.push('/admin/homepage');
    } catch (error: any) {
      console.error('Error updating homepage content:', error);
      alert(error.message || 'An error occurred while updating homepage content');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Homepage Management</h1>
            <button
              onClick={() => router.push('/admin')}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <FaTimes className="mr-2" />
              Back to Admin
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Hero Section */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <FaHome className="text-indigo-600 mr-2" />
                <h2 className="text-xl font-bold text-gray-900">Hero Section</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <div className="mb-6">
                    <label htmlFor="hero_title" className="block text-sm font-medium text-gray-700 mb-1">
                      Hero Title
                    </label>
                    <input
                      type="text"
                      id="hero_title"
                      name="hero_title"
                      value={heroData.hero_title}
                      onChange={handleHeroChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                      required
                    />
                  </div>

                  <div className="mb-6">
                    <label htmlFor="hero_subtitle" className="block text-sm font-medium text-gray-700 mb-1">
                      Hero Subtitle
                    </label>
                    <input
                      type="text"
                      id="hero_subtitle"
                      name="hero_subtitle"
                      value={heroData.hero_subtitle}
                      onChange={handleHeroChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                    />
                  </div>

                  <div className="mb-6">
                    <label htmlFor="hero_description" className="block text-sm font-medium text-gray-700 mb-1">
                      Hero Description
                    </label>
                    <textarea
                      id="hero_description"
                      name="hero_description"
                      value={heroData.hero_description}
                      onChange={handleHeroChange}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-6">
                    <p className="text-sm text-gray-700 mb-4">The hero section will automatically cycle through all available images in the public folder with smooth animations.</p>

                  </div>
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload New Hero Image</h3>
                <div className="flex items-center space-x-4">
                  <label className="flex flex-col items-center justify-center w-full max-w-xs px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FaImages className="w-8 h-8 text-gray-400 mb-3" />
                      <p className="text-sm text-gray-600 text-center">
                        <span className="font-semibold text-indigo-600">Click to upload</span> or drag and drop<br />
                        <span className="text-xs">PNG, JPG, GIF up to 10MB</span>
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      id="image-upload"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => document.getElementById('image-upload')?.click()}
                    disabled={uploading}
                    className={`px-4 py-2 rounded-lg ${
                      uploading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
                    } text-white`}
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </div>

              {/* Available Images Section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Available Images</h3>
                  <span className="text-sm text-gray-500">Click to select as hero image</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {availableImages.map((imagePath, index) => (
                    <div
                      key={index}
                      className={`border rounded-lg p-3 transition-all relative ${
                        heroData.hero_image_url === imagePath
                          ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                          : 'border-gray-300 hover:border-indigo-300'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setHeroData(prev => ({ ...prev, hero_image_url: imagePath }))}
                        className="w-full"
                      >
                        <div className="w-full h-24 rounded-md overflow-hidden mb-2">
                          <img
                            src={imagePath}
                            alt={`Available image ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // If the image fails to load, show a placeholder
                              const target = e.target as HTMLImageElement;
                              target.onerror = null; // Prevent infinite loop
                              target.src = '/placeholder-image.jpg';
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-700 truncate block">{imagePath.replace('/public/', '').replace('/', '')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteImage(imagePath);
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Featured Properties Section */}
            <div className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <FaHome className="text-indigo-600 mr-2" />
                  <h2 className="text-xl font-bold text-gray-900">Featured Properties</h2>
                  <p className="ml-2 text-sm text-gray-500">(Select up to 3)</p>
                </div>
                <div className="text-sm">
                  <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                    Selected: {featuredProperties.length}/3
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Currently Featured Properties */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FaStar className="text-yellow-500 mr-2" />
                    Current Featured Properties
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 min-h-[200px]">
                    {featuredProperties.length > 0 ? (
                      <div className="space-y-3">
                        {featuredProperties.map(propertyId => {
                          const property = allProperties.find(p => p.id === propertyId);
                          return property ? (
                            <div
                              key={property.id}
                              className="flex items-center p-3 bg-white rounded-lg border border-indigo-300 cursor-pointer hover:bg-indigo-50"
                              onClick={() => toggleFeaturedProperty(property.id)}
                            >
                              <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden mr-4">
                                {property.image || property.images?.[0] ? (
                                  <img
                                    src={property.image || property.images[0]}
                                    alt={property.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-500 text-xs">No image</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0 mr-2">
                                <div className="flex items-center">
                                  <span className="text-indigo-600 mr-1">
                                    <FaStar />
                                  </span>
                                  <p className="font-medium text-gray-900 truncate">{property.title}</p>
                                </div>
                                <p className="text-sm text-gray-500 truncate">{property.location}</p>
                              </div>
                              <button
                                className="text-red-500 hover:text-red-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFeaturedProperty(property.id);
                                }}
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
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Properties</h3>
                  <div className="max-h-96 overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 gap-3">
                      {allProperties
                        .filter(property => !featuredProperties.includes(property.id))
                        .map((property) => (
                          <div
                            key={property.id}
                            className={`border rounded-lg p-4 cursor-pointer transition-all ${
                              featuredProperties.includes(property.id)
                                ? 'border-indigo-500 bg-indigo-50'
                                : 'border-gray-300 hover:border-indigo-300'
                            }`}
                            onClick={() => toggleFeaturedProperty(property.id)}
                          >
                            <div className="flex items-center">
                              <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden">
                                {property.image ? (
                                  <img
                                    src={property.image}
                                    alt={property.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-500 text-xs">No image</span>
                                  </div>
                                )}
                              </div>
                              <div className="ml-4 flex-1 min-w-0">
                                <div className="flex items-center">
                                  {featuredProperties.includes(property.id) ? (
                                    <span className="text-indigo-600 mr-2">
                                      <FaStar />
                                    </span>
                                  ) : (
                                    <span className="text-gray-300 mr-2">
                                      <FaStar />
                                    </span>
                                  )}
                                  <h3 className="text-sm font-medium text-gray-900 truncate">
                                    {property.title}
                                  </h3>
                                </div>
                                <p className="text-sm text-gray-500 truncate">{property.location}</p>
                                <div className="mt-2 flex justify-between text-xs text-gray-500">
                                  <span>{property.beds || property.bedrooms || 0} beds</span>
                                  <span>{property.baths || property.bathrooms || 0} baths</span>
                                  <span>{property.sqft || 0} sqft</span>
                                </div>
                              </div>
                            </div>
                            <div className="mt-2 text-xs">
                              <span className={`px-2 py-1 rounded-full ${
                                property.status === 'available' ? 'bg-green-100 text-green-800' :
                                property.status === 'sold' ? 'bg-red-100 text-red-800' :
                                property.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {property.status || 'available'}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
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
                {saving ? 'Saving...' : 'Save All Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HomepageManagement;