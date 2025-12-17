// src/app/admin/properties/[id]/edit/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaSave, FaTimes, FaImage } from 'react-icons/fa';

const EditProperty = () => {
  const { id }: { id: string } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Refs for the input fields to avoid potential issues with document.getElementById
  const newAmenityRef = useRef<HTMLInputElement>(null);
  const newFeatureRef = useRef<HTMLInputElement>(null);
  const newLandmarkRef = useRef<HTMLInputElement>(null);

  const [propertyData, setPropertyData] = useState({
    id: '',
    title: '',
    description: '',
    price: 0,
    location: '',
    bedrooms: 0,
    bathrooms: 0,
    sqft: 0, // This will store the actual sqft value
    parking: 0,
    propertyType: 'house',
    status: 'available',
    featured: false,
    details: {
      landSize: '',
      yearBuilt: 0,
      furnishing: '',
      propertyStatus: 'Ready to Move',
      propertyAge: '',
      floor: '',
      totalFloors: '',
      facing: '',
      utilities: [] as string[],
      nearByLandmarks: [] as string[],
      amenities: [] as string[],
      features: [] as string[]
    },
    images: [] as string[]
  });

  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [originalImages, setOriginalImages] = useState<string[]>([]);

  // Fetch property data
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(`/api/admin/properties/${id}`);
        if (response.ok) {
          const data = await response.json();
          const imagesUrls = data.images?.map((img: any) => img.url) || [];
          setPropertyData({
            id: data.id,
            title: data.title,
            description: data.description,
            price: typeof data.price === 'string'
              ? parseFloat(data.price.replace(/[^0-9.-]+/g,"")) || 0
              : data.price || 0,
            location: data.location,
            bedrooms: data.beds || data.bedrooms || 0,
            bathrooms: data.baths || data.bathrooms || 0,
            sqft: data.sqft || 0, // Keep the original sqft value
            parking: data.parking || 0,
            propertyType: data.propertyType || 'house',
            status: data.status || 'available',
            featured: data.featured || false,
            details: {
              landSize: data.details?.landSize || data.land_size || '',
              yearBuilt: data.details?.yearBuilt || data.year_built || 0,
              furnishing: data.details?.furnishing || data.furnishing || '',
              propertyStatus: data.details?.propertyStatus || data.property_status || 'Ready to Move',
              propertyAge: data.details?.propertyAge || data.property_age || '',
              floor: data.details?.floor || data.floor || '',
              totalFloors: data.details?.totalFloors || data.total_floors || '',
              facing: data.details?.facing || data.facing || '',
              utilities: data.details?.utilities || [],
              amenities: data.amenities || data.details?.amenities || [],
              features: data.features || data.details?.features || [],
              nearByLandmarks: data.nearby_landmarks || data.details?.nearByLandmarks || data.details?.nearby_landmarks || []
            },
            images: imagesUrls
          });

          // Store original images for comparison during save
          setOriginalImages([...imagesUrls]);
        } else {
          alert('Failed to fetch property data');
          router.push('/admin/properties');
        }
      } catch (error) {
        console.error('Error fetching property:', error);
        alert('Error fetching property data');
        router.push('/admin/properties');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (name.startsWith('details.')) {
      const detailField = name.split('.')[1];
      setPropertyData(prev => ({
        ...prev,
        details: {
          ...prev.details,
          [detailField]: type === 'number' ? parseFloat(value) || 0 : value
        }
      }));
    } else if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setPropertyData(prev => ({
        ...prev,
        [name]: target.checked
      }));
    } else {
      setPropertyData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 : value
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewImages(prev => [...prev, ...files]);

      // Create previews
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      // Revoke the object URL to free memory
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const removeExistingImage = (imageUrl: string) => {
    setPropertyData(prev => ({
      ...prev,
      images: prev.images.filter(img => img !== imageUrl)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Update property data
      const propertyUpdateResponse = await fetch(`/api/admin/properties/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: propertyData.title,
          description: propertyData.description,
          price: propertyData.price,
          location: propertyData.location,
          bedrooms: propertyData.bedrooms,
          bathrooms: propertyData.bathrooms,
          sqft: propertyData.sqft,
          parking: propertyData.parking,
          propertyType: propertyData.propertyType,
          status: propertyData.status,
          featured: propertyData.featured,
          landSize: propertyData.details.landSize,
          furnishing: propertyData.details.furnishing,
          propertyStatus: propertyData.details.propertyStatus,
          propertyAge: propertyData.details.propertyAge,
          floor: propertyData.details.floor,
          totalFloors: propertyData.details.totalFloors,
          facing: propertyData.details.facing,
          yearBuilt: propertyData.details.yearBuilt,
          amenities: propertyData.details.amenities,
          features: propertyData.details.features,
          nearbyLandmarks: propertyData.details.nearByLandmarks,
          details: propertyData.details
        }),
      });

      if (!propertyUpdateResponse.ok) {
        const errorData = await propertyUpdateResponse.json();
        alert(`Failed to update property: ${errorData.error || 'Unknown error'}`);
        setSaving(false);
        return;
      }

      // Upload new images if any
      if (newImages.length > 0) {
        const formData = new FormData();
        newImages.forEach((image) => {
          formData.append('images', image); // Append each image with the key 'images'
        });
        formData.append('propertyId', id);

        const imageResponse = await fetch('/api/admin/properties/images', {
          method: 'POST',
          body: formData,
        });

        if (!imageResponse.ok) {
          const errorData = await imageResponse.json();
          alert(`Images upload failed: ${errorData.error || 'Unknown error'}`);
          setSaving(false);
          return;
        }
      }

      // Delete removed images by comparing original and current images
      const originalImageUrls = originalImages;
      const currentImageUrls = propertyData.images;

      // Find images that were removed (in original but not in current)
      const imagesToDelete = originalImageUrls.filter(originalUrl =>
        !currentImageUrls.some(currentUrl => currentUrl === originalUrl)
      );

      if (imagesToDelete.length > 0) {
        for (const imageUrl of imagesToDelete) {
          try {
            const deleteResponse = await fetch(`/api/admin/properties/${id}/images`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ imageUrl }),
            });

            if (!deleteResponse.ok) {
              const errorData = await deleteResponse.json();
              console.error('Failed to delete image:', imageUrl, errorData);
              // Don't throw an error here, just log it - the property was still updated
            } else {
              console.log('Successfully deleted image:', imageUrl);
            }
          } catch (error) {
            console.error('Error deleting image:', imageUrl, error);
          }
        }
      }

      alert('Property updated successfully!');
      // Refetch the data to ensure the UI shows updated values
      const response = await fetch(`/api/admin/properties/${id}`);
      if (response.ok) {
        const data = await response.json();
        setPropertyData({
          id: data.id,
          title: data.title,
          description: data.description,
          price: typeof data.price === 'string'
            ? parseFloat(data.price.replace(/[^0-9.-]+/g,"")) || 0
            : data.price || 0,
          location: data.location,
          bedrooms: data.bedrooms || data.beds || 0,
          bathrooms: data.bathrooms || data.baths || 0,
          sqft: data.sqft || 0,
          parking: data.parking || 0,
          propertyType: data.propertyType || 'house',
          status: data.status || 'available',
          featured: data.featured || false,
          details: {
            landSize: data.details?.landSize || data.land_size || '',
            yearBuilt: data.details?.yearBuilt || data.year_built || 0,
            furnishing: data.details?.furnishing || data.furnishing || '',
            propertyStatus: data.details?.propertyStatus || data.property_status || 'Ready to Move',
            propertyAge: data.details?.propertyAge || data.property_age || '',
            floor: data.details?.floor || data.floor || '',
            totalFloors: data.details?.totalFloors || data.total_floors || '',
            facing: data.details?.facing || data.facing || '',
            utilities: data.details?.utilities || [],
            nearByLandmarks: data.details?.nearByLandmarks || data.details?.nearby_landmarks || [],
            amenities: data.details?.amenities || [],
            features: data.details?.features || []
          },
          images: data.images?.map((img: any) => img.url) || []
        });
      }
    } catch (error) {
      console.error('Error updating property:', error);
      alert('An error occurred while updating the property');
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
            <h1 className="text-2xl font-bold text-gray-900">Edit Property</h1>
            <button
              onClick={() => router.push('/admin/properties')}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <FaTimes className="mr-2" />
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Basic Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Property Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={propertyData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={propertyData.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                      Price (KSh)
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={propertyData.price}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">
                        Bedrooms
                      </label>
                      <input
                        type="number"
                        id="bedrooms"
                        name="bedrooms"
                        value={propertyData.bedrooms}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                        min="0"
                      />
                    </div>

                    <div>
                      <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-1">
                        Bathrooms
                      </label>
                      <input
                        type="number"
                        id="bathrooms"
                        name="bathrooms"
                        value={propertyData.bathrooms}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="sqft" className="block text-sm font-medium text-gray-700 mb-1">
                        Area (sqm)
                      </label>
                      <input
                        type="number"
                        id="sqm"
                        name="sqm"
                        value={propertyData.sqft > 0 ? Math.round(propertyData.sqft * 0.092903).toString() : 0}
                        onChange={(e) => {
                          const sqmValue = parseFloat(e.target.value) || 0;
                          const sqftValue = Math.round(sqmValue / 0.092903); // Convert sqm to sqft
                          setPropertyData(prev => ({
                            ...prev,
                            sqft: sqftValue
                          }));
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                        min="0"
                      />
                      <p className="text-xs text-gray-500 mt-1">Stored as sqft in database</p>
                    </div>

                    <div>
                      <label htmlFor="parking" className="block text-sm font-medium text-gray-700 mb-1">
                        Parking Spaces
                      </label>
                      <input
                        type="number"
                        id="parking"
                        name="parking"
                        value={propertyData.parking}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-1">
                        Property Type
                      </label>
                      <select
                        id="propertyType"
                        name="propertyType"
                        value={propertyData.propertyType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
                      >
                        <option value="house">House</option>
                        <option value="apartment">Apartment</option>
                        <option value="condo">Condo</option>
                        <option value="townhouse">Townhouse</option>
                        <option value="land">Land</option>
                        <option value="commercial">Commercial</option>
                        <option value="estate_home">Estate Home</option>
                        <option value="beach_house">Beach House</option>
                        <option value="detached_house">Detached House</option>
                        <option value="farm_house">Farm House</option>
                        <option value="bungalow">Bungalow</option>
                        <option value="mansion">Mansion</option>
                        <option value="cottage">Cottage</option>
                        <option value="duplex">Duplex</option>
                        <option value="penthouse">Penthouse</option>
                        <option value="villa">Villa</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        id="status"
                        name="status"
                        value={propertyData.status}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
                      >
                        <option value="available">Available</option>
                        <option value="sold">Sold</option>
                        <option value="pending">Pending</option>
                        <option value="leased">Leased</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="featured"
                      name="featured"
                      checked={propertyData.featured}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                      Featured Property
                    </label>
                  </div>
                </div>
              </div>

              {/* Detailed Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Detailed Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={propertyData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="details.landSize" className="block text-sm font-medium text-gray-700 mb-1">
                        Land Size
                      </label>
                      <input
                        type="text"
                        id="details.landSize"
                        name="details.landSize"
                        value={propertyData.details.landSize}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                      />
                    </div>

                    <div>
                      <label htmlFor="details.yearBuilt" className="block text-sm font-medium text-gray-700 mb-1">
                        Year Built
                      </label>
                      <input
                        type="number"
                        id="details.yearBuilt"
                        name="details.yearBuilt"
                        value={propertyData.details.yearBuilt}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                        min="1800"
                        max="2030"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="details.furnishing" className="block text-sm font-medium text-gray-700 mb-1">
                      Furnishing
                    </label>
                    <input
                      type="text"
                      id="details.furnishing"
                      name="details.furnishing"
                      value={propertyData.details.furnishing}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                    />
                  </div>

                  <div>
                    <label htmlFor="details.propertyStatus" className="block text-sm font-medium text-gray-700 mb-1">
                      Market Status
                    </label>
                    <input
                      type="text"
                      id="details.propertyStatus"
                      name="details.propertyStatus"
                      value={propertyData.details.propertyStatus}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="details.propertyAge" className="block text-sm font-medium text-gray-700 mb-1">
                        Property Age
                      </label>
                      <input
                        type="text"
                        id="details.propertyAge"
                        name="details.propertyAge"
                        value={propertyData.details.propertyAge}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                      />
                    </div>

                    <div>
                      <label htmlFor="details.facing" className="block text-sm font-medium text-gray-700 mb-1">
                        Facing Direction
                      </label>
                      <input
                        type="text"
                        id="details.facing"
                        name="details.facing"
                        value={propertyData.details.facing}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="details.floor" className="block text-sm font-medium text-gray-700 mb-1">
                        Floor
                      </label>
                      <input
                        type="text"
                        id="details.floor"
                        name="details.floor"
                        value={propertyData.details.floor}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                      />
                    </div>

                    <div>
                      <label htmlFor="details.totalFloors" className="block text-sm font-medium text-gray-700 mb-1">
                        Total Floors
                      </label>
                      <input
                        type="text"
                        id="details.totalFloors"
                        name="details.totalFloors"
                        value={propertyData.details.totalFloors}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                  </div>

                  {/* Amenities and Features Section */}
                  <div className="mb-6">
                    <h3 className="text-md font-medium text-gray-900 mb-3">Amenities & Features</h3>

                    {/* Amenities */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amenities
                      </label>
                      <div className="flex mb-2">
                        <input
                          type="text"
                          ref={newAmenityRef}
                          placeholder="Add an amenity (e.g., Swimming Pool)"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const input = e.target as HTMLInputElement;
                              const trimmedValue = input.value.trim();
                              if (trimmedValue) {
                                setPropertyData(prev => ({
                                  ...prev,
                                  details: {
                                    ...prev.details,
                                    amenities: [...prev.details.amenities, trimmedValue]
                                  }
                                }));
                                input.value = '';
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newAmenityRef.current && newAmenityRef.current.value.trim()) {
                              const trimmedValue = newAmenityRef.current.value.trim();
                              setPropertyData(prev => ({
                                ...prev,
                                details: {
                                  ...prev.details,
                                  amenities: [...prev.details.amenities, trimmedValue]
                                }
                              }));
                              newAmenityRef.current.value = '';
                            }
                          }}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700"
                        >
                          Add
                        </button>
                      </div>

                      {/* Current Amenities List */}
                      {propertyData.details.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {propertyData.details.amenities.map((amenity: string, index: number) => (
                            <div key={index} className="flex items-center bg-indigo-100 text-indigo-800 rounded-full px-3 py-1 text-sm">
                              <span>{amenity}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setPropertyData(prev => ({
                                    ...prev,
                                    details: {
                                      ...prev.details,
                                      amenities: prev.details.amenities.filter((_: string, i: number) => i !== index)
                                    }
                                  }));
                                }}
                                className="ml-2 text-indigo-600 hover:text-indigo-800"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Features */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Features
                      </label>
                      <div className="flex mb-2">
                        <input
                          type="text"
                          ref={newFeatureRef}
                          placeholder="Add a feature (e.g., Modern Kitchen)"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const input = e.target as HTMLInputElement;
                              const trimmedValue = input.value.trim();
                              if (trimmedValue) {
                                setPropertyData(prev => ({
                                  ...prev,
                                  details: {
                                    ...prev.details,
                                    features: [...prev.details.features, trimmedValue]
                                  }
                                }));
                                input.value = '';
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newFeatureRef.current && newFeatureRef.current.value.trim()) {
                              const trimmedValue = newFeatureRef.current.value.trim();
                              setPropertyData(prev => ({
                                ...prev,
                                details: {
                                  ...prev.details,
                                  features: [...prev.details.features, trimmedValue]
                                }
                              }));
                              newFeatureRef.current.value = '';
                            }
                          }}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700"
                        >
                          Add
                        </button>
                      </div>

                      {/* Current Features List */}
                      {propertyData.details.features.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {propertyData.details.features.map((feature: string, index: number) => (
                            <div key={index} className="flex items-center bg-green-100 text-green-800 rounded-full px-3 py-1 text-sm">
                              <span>{feature}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setPropertyData(prev => ({
                                    ...prev,
                                    details: {
                                      ...prev.details,
                                      features: prev.details.features.filter((_: string, i: number) => i !== index)
                                    }
                                  }));
                                }}
                                className="ml-2 text-green-600 hover:text-green-800"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Nearby Landmarks Section */}
                  <div className="mb-6">
                    <h3 className="text-md font-medium text-gray-900 mb-3">Nearby Landmarks</h3>
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Add Landmark
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          ref={newLandmarkRef}
                          placeholder="Add a nearby landmark (e.g., University of Nairobi)"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const input = e.target as HTMLInputElement;
                              const trimmedValue = input.value.trim();
                              if (trimmedValue) {
                                setPropertyData(prev => ({
                                  ...prev,
                                  details: {
                                    ...prev.details,
                                    nearByLandmarks: [...prev.details.nearByLandmarks, trimmedValue]
                                  }
                                }));
                                input.value = '';
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newLandmarkRef.current && newLandmarkRef.current.value.trim()) {
                              const trimmedValue = newLandmarkRef.current.value.trim();
                              setPropertyData(prev => ({
                                ...prev,
                                details: {
                                  ...prev.details,
                                  nearByLandmarks: [...prev.details.nearByLandmarks, trimmedValue]
                                }
                              }));
                              newLandmarkRef.current.value = '';
                            }
                          }}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Current Landmarks List */}
                    {propertyData.details.nearByLandmarks.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {propertyData.details.nearByLandmarks.map((landmark: string, index: number) => (
                          <div key={index} className="flex items-center bg-purple-100 text-purple-800 rounded-full px-3 py-1 text-sm">
                            <span>{landmark}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setPropertyData(prev => ({
                                  ...prev,
                                  details: {
                                    ...prev.details,
                                    nearByLandmarks: prev.details.nearByLandmarks.filter((_: string, i: number) => i !== index)
                                  }
                                }));
                              }}
                              className="ml-2 text-purple-600 hover:text-purple-800"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Existing Property Images
                    </label>
                    {propertyData.images.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
                        {propertyData.images.map((imgUrl, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={imgUrl} 
                              alt={`Property image ${index + 1}`}
                              className="h-24 w-full object-cover rounded border"
                            />
                            <button
                              type="button"
                              onClick={() => removeExistingImage(imgUrl)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No images uploaded yet</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Add New Images
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <div className="flex text-sm text-gray-600">
                          <label htmlFor="newImages" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                            <span>Upload files</span>
                            <input
                              id="newImages"
                              name="newImages"
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              multiple
                              onChange={handleImageChange}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                      </div>
                    </div>

                    {imagePreviews.length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">New Image Previews:</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                              <img 
                                src={preview} 
                                alt={`New preview ${index + 1}`}
                                className="h-24 w-full object-cover rounded border"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                type="submit"
                disabled={saving}
                className={`flex items-center px-6 py-3 rounded-lg ${
                  saving ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
                } text-white`}
              >
                <FaSave className="mr-2" />
                {saving ? 'Saving...' : 'Update Property'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProperty;