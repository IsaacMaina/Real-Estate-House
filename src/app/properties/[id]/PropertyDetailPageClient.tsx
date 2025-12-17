// src/app/properties/[id]/PropertyDetailPageClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { FaBed, FaBath, FaRulerCombined, FaCar, FaMapMarkerAlt, FaHeart, FaRegHeart, FaShareAlt, FaWhatsapp, FaEnvelope, FaPhone, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Navigation from '@/components/Navigation';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import { getWhatsAppNumber, getDisplayPhone } from '@/lib/contact-config';

interface Agent {
  id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  bio: string;
  avatar_url: string;
  specializations: string[];
  years_experience: number;
}

interface Property {
  id: string;
  title: string;
  location: string;
  price: string;
  beds: number;
  baths: number;
  sqft: number;
  parking: number;
  image: string;
  images: Array<{
    id: string;
    url: string;
    alt_text: string;
  }>;
  description: string;
  propertyType: string;
  status: string;
  featured: boolean;
  agent?: Agent;
  amenities: string[];
  features: string[];
  nearByLandmarks: string[];
  details: {
    bedrooms?: number;
    bathrooms?: number;
    parking?: number;
    landSize?: string;
    yearBuilt?: number;
    propertyType?: string;
    furnishing?: string;
    utilities?: string[];
    propertyStatus?: string;
    propertyAge?: string;
    floor?: string;
    totalFloors?: string;
    facing?: string;
    nearByLandmarks?: string[];
    amenities?: string[];
    features?: string[];
    sqft?: number;
  };
}

interface PropertyDetailPageClientProps {
  property: Property;
}

const PropertyDetailPageClient = ({ property }: PropertyDetailPageClientProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [savedProperties, setSavedProperties] = useState<string[]>([]);
  const [viewingData, setViewingData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    notes: ''
  });
  const [isViewingSubmitting, setIsViewingSubmitting] = useState(false);
  const [viewingSuccessMessage, setViewingSuccessMessage] = useState('');

  // Load saved properties from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('savedProperties');
    if (saved) {
      setSavedProperties(JSON.parse(saved));
    }
  }, []);

  // Toggle saving a property
  const toggleSave = (propertyId: string) => {
    const updatedSaved = savedProperties.includes(propertyId)
      ? savedProperties.filter(id => id !== propertyId)
      : [...savedProperties, propertyId];
    
    setSavedProperties(updatedSaved);
    localStorage.setItem('savedProperties', JSON.stringify(updatedSaved));
  };

  // Handle viewing form changes
  const handleViewingInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setViewingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle viewing form submission - open WhatsApp with pre-filled message
  const handleSubmitViewing = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsViewingSubmitting(true);

    try {
      // Get agent's phone number, fallback to default if not available
      const agentPhone = property.agent?.phone || getWhatsAppNumber();
      const cleanAgentPhone = agentPhone.replace(/\D/g, ''); // Remove all non-digit characters
      
      // Create message content
      const message = encodeURIComponent(
        `Hello, I'm interested in scheduling a viewing for:\n\n` +
        `Property: ${property.title}\n` +
        `Location: ${property.location}\n` +
        `Price: ${property.price}\n\n` +
        `My Details:\n` +
        `Name: ${viewingData.name}\n` +
        `Email: ${viewingData.email}\n` +
        `Phone: ${viewingData.phone}\n\n` +
        `Preferred Date: ${viewingData.date}\n` +
        `Preferred Time: ${viewingData.time}\n` +
        `Additional Notes: ${viewingData.notes}\n\n` +
        `Best regards,\n${viewingData.name}`
      );

      // Open WhatsApp with pre-filled message
      const whatsappUrl = `https://wa.me/${cleanAgentPhone}?text=${message}`;
      window.open(whatsappUrl, '_blank');

      // Show success message
      setViewingSuccessMessage('Your viewing request has been sent via WhatsApp! An agent will contact you shortly.');
      
      // Reset form after successful submission
      setViewingData({
        name: '',
        email: '',
        phone: '',
        date: '',
        time: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error submitting viewing request:', error);
      alert('Error submitting viewing request. Please try again.');
    } finally {
      setIsViewingSubmitting(false);
    }
  };

  // Navigate between property images
  const nextImage = () => {
    setCurrentImageIndex(prev => 
      prev === (property.images?.length || 1) - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? (property.images?.length || 1) - 1 : prev - 1
    );
  };

  const propertyImages = property.images?.length 
    ? property.images.map(img => img.url) 
    : [property.image];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="pt-24">
        {/* Property Header with Hero Image */}
        <div className="relative h-[90vh] w-full">
          <div className="absolute inset-0">
            <img
              src={propertyImages[currentImageIndex]}
              alt={`${property.title} - Image ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 text-white p-3 rounded-full hover:bg-black/50 transition-colors z-10"
            aria-label="Previous image"
          >
            <FaChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 text-white p-3 rounded-full hover:bg-black/50 transition-colors z-10"
            aria-label="Next image"
          >
            <FaChevronRight className="w-6 h-6" />
          </button>

          {/* Image Thumbnails */}
          <div className="absolute bottom-40 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
            {propertyImages.map((img, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-16 h-12 border-2 rounded-md overflow-hidden ${
                  currentImageIndex === index ? 'border-white ring-2 ring-indigo-500' : 'border-gray-300'
                }`}
                aria-label={`View image ${index + 1}`}
              >
                <img
                  src={img}
                  alt={`Property image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>

          {/* Property Info Overlaid on Image */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-20">
            <div className="container mx-auto max-w-6xl">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold">{property.title}</h1>
                  <p className="text-indigo-300 flex items-center mt-1">
                    <FaMapMarkerAlt className="mr-2" />
                    {property.location}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <button
                    className="bg-white/30 backdrop-blur-sm text-gray-800 rounded-full p-2 mb-2 hover:bg-red-500 hover:text-white transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSave(property.id);
                    }}
                    aria-label={savedProperties.includes(property.id) ? "Unsave property" : "Save property"}
                  >
                    {savedProperties.includes(property.id) ? (
                      <FaHeart className="w-5 h-5 text-red-500" />
                    ) : (
                      <FaRegHeart className="w-5 h-5" />
                    )}
                  </button>
                  <span className="text-2xl font-bold">{property.price}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-4 border-t border-white/20">
                <div className="flex items-center">
                  <FaBed className="w-5 h-5 mr-1 text-white" />
                  <span>{Math.round(property.beds)} beds</span>
                </div>
                <div className="flex items-center">
                  <FaBath className="w-5 h-5 mr-1 text-white" />
                  <span>{Math.round(property.baths)} baths</span>
                </div>
                <div className="flex items-center">
                  <FaRulerCombined className="w-5 h-5 mr-1 text-white" />
                  <span>{Math.round(property.sqft * 0.092903).toLocaleString()} sqm</span>
                </div>
                <div className="flex items-center">
                  <FaCar className="w-5 h-5 mr-1 text-white" />
                  <span>{property.parking} parking</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Property Details Content */}
        <div className="container mx-auto max-w-6xl px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Property Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Property Description */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Description</h2>
                <p className="text-gray-700 leading-relaxed">{property.description}</p>
              </div>

              {/* Property Features */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Features & Amenities</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(property.features || property.details?.features || []).map((feature, index) => (
                    <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                  {(property.amenities || property.details?.amenities || []).map((amenity, index) => (
                    <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <svg className="w-5 h-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nearby Landmarks */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Nearby Landmarks</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(property.nearByLandmarks || property.details?.nearByLandmarks || []).map((landmark, index) => (
                    <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <FaMapMarkerAlt className="w-5 h-5 text-indigo-600 mr-2" />
                      <span className="text-gray-700">{landmark}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Property Location Map */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Location</h2>
                <div className="rounded-xl overflow-hidden border-2 border-gray-200 h-96">
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(property.location)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                    allowFullScreen
                    aria-label={`Map showing property location: ${property.location}`}
                  ></iframe>
                </div>
                <p className="mt-4 text-gray-700">Located in {property.location}, this property offers convenient access to local amenities and transportation.</p>
              </div>
            </div>

            {/* Right Column - Contact Agent + Schedule Viewing */}
            <div className="space-y-6">
              {/* Schedule Viewing */}
              <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-24">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Schedule a Viewing</h3>

                <form onSubmit={handleSubmitViewing} className="space-y-4">
                  {viewingSuccessMessage && (
                    <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
                      {viewingSuccessMessage}
                    </div>
                  )}

                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={viewingData.name}
                      onChange={handleViewingInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-700"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={viewingData.email}
                      onChange={handleViewingInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-700"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={viewingData.phone}
                      onChange={handleViewingInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-700"
                      placeholder="+254 700 000 000"
                    />
                  </div>

                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      required
                      value={viewingData.date}
                      onChange={handleViewingInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-700 bg-white"
                      min={new Date().toISOString().split('T')[0]} // Prevent past dates
                    />
                  </div>

                  <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
                    <select
                      id="time"
                      name="time"
                      required
                      value={viewingData.time}
                      onChange={handleViewingInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-700 bg-white"
                    >
                      <option value="">Select a time slot</option>
                      <option value="morning">Morning (8AM - 12PM)</option>
                      <option value="afternoon">Afternoon (12PM - 5PM)</option>
                      <option value="evening">Evening (5PM - 8PM)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows={3}
                      value={viewingData.notes}
                      onChange={handleViewingInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-700"
                      placeholder="Any specific requests or questions..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isViewingSubmitting}
                    className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
                      isViewingSubmitting
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {isViewingSubmitting ? 'Sending...' : 'Schedule via WhatsApp'}
                  </button>
                </form>
              </div>

              {/* Agent Contact */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Agent</h3>
                
                {property.agent ? (
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center">
                        {property.agent.avatar_url ? (
                          <img 
                            src={property.agent.avatar_url} 
                            alt={property.agent.name} 
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <FaUser className="text-gray-500 text-xl" />
                        )}
                      </div>
                      <div className="ml-4">
                        <h4 className="font-semibold text-gray-900">{property.agent.name}</h4>
                        <p className="text-sm text-gray-600">{property.agent.company}</p>
                        <p className="text-sm text-gray-600">{property.agent.specializations?.join(', ') || ''}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <FaPhone className="w-5 h-5 text-indigo-600 mr-3" />
                        <span className="text-gray-700">{property.agent.phone}</span>
                        <a
                          href={`https://wa.me/${(property.agent.phone || getWhatsAppNumber()).replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-4 flex items-center bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700"
                        >
                          <FaWhatsapp className="mr-1" />
                          WhatsApp
                        </a>
                      </div>

                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <FaEnvelope className="w-5 h-5 text-indigo-600 mr-3" />
                        <span className="text-gray-700">{property.agent.email}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-700">Experience: {property.agent.years_experience} years</p>
                      <p className="text-sm text-gray-600 mt-2">{property.agent.bio}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600 italic">Agent information not available for this property.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <FloatingWhatsApp />
    </div>
  );
};

export default PropertyDetailPageClient;