// src/components/PropertyCard.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { FaBed, FaBath, FaHeart, FaRegHeart, FaRulerCombined, FaCar } from 'react-icons/fa';
import Link from 'next/link';
import { getWhatsAppNumber } from '@/lib/contact-config';

interface Agent {
  name: string;
  phone: string;
  email: string;
  company?: string;
}

interface Property {
  id: string;
  title: string;
  location: string;
  price: string;
  beds: number;
  baths: number;
  sqft: number;
  parking: number;  // Add parking field
  image: string;
  description: string;
  propertyType?: string;
  featured?: boolean;
  agent?: Agent; // Add agent information
}

interface PropertyCardProps {
  property: Property;
  isLarge?: boolean;
  onClick?: () => void;
}

const PropertyCard = ({ property, isLarge = false, onClick }: PropertyCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [savedProperties, setSavedProperties] = useState<string[]>([]);

  useEffect(() => {
    // Load saved properties from localStorage on component mount
    const saved = localStorage.getItem('savedProperties');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure all IDs are strings (handle legacy number IDs if any)
      const stringIds = parsed.map((id: string | number) => String(id));
      setSavedProperties(stringIds);
    }
  }, []);

  const toggleSave = (propertyId: string) => {
    const updatedSavedProperties = savedProperties.includes(propertyId)
      ? savedProperties.filter(id => id !== propertyId)
      : [...savedProperties, propertyId];

    setSavedProperties(updatedSavedProperties);
    localStorage.setItem('savedProperties', JSON.stringify(updatedSavedProperties));
  };

  return (
    <div className={`relative rounded-2xl overflow-hidden shadow-lg cursor-pointer property-card ${isLarge ? 'h-[600px]' : 'h-[400px]'} flex flex-col`}>
      {/* Fullscreen background image */}
      <div className="absolute inset-0">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-0"></div>

      {/* Property details at bottom */}
      <div className="relative z-10 p-4 flex flex-col justify-end h-full">
        <div className="pb-4"> {/* Reduced padding to bring content closer to WhatsApp button */}
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-lg font-bold text-white line-clamp-1">{property.title}</h3>
              <p className="text-indigo-200 text-sm flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                </svg>
                {property.location}
              </p>
            </div>
            <span className="text-lg font-bold text-white">{property.price}</span>
          </div>

          <div className="flex flex-wrap gap-3 mb-2"> {/* Reduced margin-bottom */}
            <div className="flex items-center">
              <FaBed className="w-4 h-4 mr-1 text-white/80" />
              <span className="text-sm text-white">{Math.round(property.beds)} beds</span>
            </div>
            <div className="flex items-center">
              <FaBath className="w-4 h-4 mr-1 text-white/80" />
              <span className="text-sm text-white">{Math.round(property.baths)} baths</span>
            </div>
          </div>
        </div>

        {/* WhatsApp Contact Button - positioned at the bottom */}
        <div className="mt-2">
          <Link
            href={
              property.agent?.phone
                ? `https://wa.me/${property.agent.phone.replace(/\D/g, '')}?text=Hi,%20I'm%20interested%20in%20the%20property%20"${encodeURIComponent(property.title)}"%20located%20at%20${encodeURIComponent(property.location)}.`
                : `https://wa.me/${getWhatsAppNumber()}?text=Hi,%20I'm%20interested%20in%20the%20property%20"${encodeURIComponent(property.title)}"%20located%20at%20${encodeURIComponent(property.location)}.`
            }
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation(); // Prevent opening the property page when clicking the WhatsApp button
            }}
            className="inline-flex items-center justify-center w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
          >
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.087 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.89-9.885 9.89z" />
            </svg>
            <span>WhatsApp</span>
          </Link>
        </div>
      </div>
      
      
      {/* Property Type badge - displayed in top-left corner of property card */}
      {property.propertyType && (
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-800 px-2.5 py-1 rounded-full text-xs font-medium z-10">
          <Link href={`/properties?propertyType=${encodeURIComponent(property.propertyType)}`} className="hover:text-indigo-600 transition-colors">
            {property.propertyType}
          </Link>
        </div>
      )}

      {/* Save/Like button */}
      <div className="absolute top-3 right-3 z-10">
        <button
          className="bg-white/90 backdrop-blur-sm text-gray-800 rounded-full p-2 hover:bg-red-500 hover:text-white transition-colors"
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering the card click
            toggleSave(property.id);
          }}
          aria-label={savedProperties.includes(property.id) ? "Remove from saved" : "Save property"}
        >
          {savedProperties.includes(property.id) ? (
            <FaHeart className="w-4 h-4 text-red-500" />
          ) : (
            <FaRegHeart className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};

export default PropertyCard;