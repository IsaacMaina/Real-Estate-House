// src/components/HeroSection.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface HeroData {
  heroTitle: string;
  heroSubtitle: string;
  heroDescription?: string;
  heroImageUrl: string;
}

const HeroSection: React.FC = () => {
  const [heroData, setHeroData] = useState<HeroData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [availableImages, setAvailableImages] = useState<string[]>([]);

  // Fetch available images from public folder
  useEffect(() => {
    const fetchAvailableImages = async () => {
      // Check if we're online (browser check)
      const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

      if (!isOnline) {
        setAvailableImages(['/img16.jpg']);
        return;
      }

      try {
        // Fetch all images from public folder without specifying a subfolder
        const response = await fetch('/api/admin/pages/images/upload');
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data.images) && data.images.length > 0) {
            setAvailableImages(data.images);
          } else {
            // Fallback to a default image if no images are available
            setAvailableImages(['/img16.jpg']);
          }
        } else {
          // If the API fails, use default images
          const fallbackImages = ['/img16.jpg']; // Default fallback
          setAvailableImages(fallbackImages);
        }
      } catch (error) {
        console.error('Error fetching available images:', error);
        // Fallback to default images
        setAvailableImages(['/img16.jpg']);
      }
    };

    fetchAvailableImages();
  }, []);

  // Fetch hero data
  useEffect(() => {
    const fetchHeroData = async () => {
      // Check if we're online (browser check)
      const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

      // If offline, use default data immediately
      if (!isOnline) {
        setHeroData({
          heroTitle: 'Discover Premium Kenyan Properties',
          heroSubtitle: 'Experience elegance, comfort, and sophistication in every detail',
          heroDescription: 'Premium properties across Kenya curated for the discerning homeowner. Experience elegance, comfort, and sophistication in every detail.',
          heroImageUrl: '/img16.jpg'
        });
        setAvailableImages(['/img16.jpg']);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/admin/pages/hero?pageSlug=/');
        if (response.ok) {
          const data = await response.json();
          setHeroData({
            heroTitle: data.hero_title || data.heroTitle || 'Discover Premium Kenyan Properties',
            heroSubtitle: data.hero_subtitle || data.heroSubtitle || 'Experience elegance, comfort, and sophistication in every detail',
            heroDescription: data.hero_description || data.heroDescription || 'Premium properties across Kenya curated for the discerning homeowner. Experience elegance, comfort, and sophistication in every detail.',
            heroImageUrl: data.hero_image_url || data.heroImageUrl || '/img16.jpg'
          });
        } else {
          console.error('Failed to fetch hero data:', response.statusText);
          // Set default values if API fails
          setHeroData({
            heroTitle: 'Discover Premium Kenyan Properties',
            heroSubtitle: 'Experience elegance, comfort, and sophistication in every detail',
            heroDescription: 'Premium properties across Kenya curated for the discerning homeowner. Experience elegance, comfort, and sophistication in every detail.',
            heroImageUrl: '/img16.jpg'
          });
        }
      } catch (error) {
        console.error('Error fetching hero data:', error);
        // Set default values in case of error
        setHeroData({
          heroTitle: 'Discover Premium Kenyan Properties',
          heroSubtitle: 'Experience elegance, comfort, and sophistication in every detail',
          heroDescription: 'Premium properties across Kenya curated for the discerning homeowner. Experience elegance, comfort, and sophistication in every detail.',
          heroImageUrl: '/img16.jpg'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHeroData();
  }, []);

  // Cycle through available images with animation
  useEffect(() => {
    // Check if we're online (browser check)
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

    if (availableImages.length <= 1 || !isOnline) return; // Don't cycle if there's only one image or offline

    const interval = setInterval(() => {
      setCurrentImageIndex(prevIndex =>
        prevIndex === availableImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [availableImages]);

  const currentImage = availableImages[currentImageIndex] || heroData?.heroImageUrl || '/img16.jpg';

  const handleScheduleViewing = async () => {
    try {
      // Get contact information from the API
      const response = await fetch('/api/admin/settings/contact');
      if (response.ok) {
        const contactInfo = await response.json();
        const phoneNumber = contactInfo.whatsappNumber || contactInfo.phone || '254758302725';

        // Clean the phone number by removing non-numeric characters
        const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');

        // Create a personalized message
        const message = encodeURIComponent(
          `Hello, I'm interested in scheduling a viewing for a property. ` +
          `Could you please help me set up a time that works for both of us? ` +
          `Thank you!`
        );

        // Open WhatsApp with the pre-filled message
        const whatsappUrl = `https://wa.me/${cleanPhoneNumber}?text=${message}`;
        window.open(whatsappUrl, '_blank');
      } else {
        // If API fails, use the default number
        const message = encodeURIComponent(
          `Hello, I'm interested in scheduling a viewing for a property. ` +
          `Could you please help me set up a time that works for both of us? ` +
          `Thank you!`
        );
        const defaultNumber = '254758302725';
        const whatsappUrl = `https://wa.me/${defaultNumber}?text=${message}`;
        window.open(whatsappUrl, '_blank');
      }
    } catch (error) {
      console.error('Error getting contact information:', error);

      // Fallback to default number if API fails
      const message = encodeURIComponent(
        `Hello, I'm interested in scheduling a viewing for a property. ` +
        `Could you please help me set up a time that works for both of us? ` +
        `Thank you!`
      );
      const defaultNumber = '254758302725';
      const whatsappUrl = `https://wa.me/${defaultNumber}?text=${message}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  // Show nothing while loading, or fallback if data couldn't be loaded
  if (loading || !heroData) {
    return (
      <section className="relative h-screen w-full overflow-hidden">
        {/* Fullscreen background image with fallback */}
        <div className="absolute inset-0">
          <img
            src="/img16.jpg"
            alt="Luxury Property Background"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30"></div>

        {/* Animated content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl"
            >
              <motion.h1
                className="text-4xl md:text-6xl font-bold text-white mb-2 leading-tight"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.7 }}
              >
                Discover Premium Kenyan Properties
              </motion.h1>

              <motion.p
                className="text-xl text-indigo-200 mb-2 leading-tight"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.7 }}
              >
                Premium Properties Across Kenya
              </motion.p>

              <motion.p
                className="text-xl text-gray-200 mb-8 max-w-lg"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.7 }}
              >
                Premium properties across Kenya curated for the discerning homeowner. Experience elegance, comfort, and sophistication in every detail.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.7 }}
                className="flex flex-wrap gap-4"
              >
                <Link
                  href="/properties"
                  className="px-8 py-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
                >
                  Explore Properties
                </Link>
                <button
                  onClick={() => handleScheduleViewing()}
                  className="px-8 py-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.485 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Schedule via WhatsApp
                </button>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Animated floating elements */}
        <motion.div
          className="absolute top-1/4 left-10 w-16 h-16 rounded-full bg-indigo-500/20 blur-xl"
          animate={{
            y: [0, -20, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/3 right-20 w-24 h-24 rounded-full bg-purple-500/20 blur-xl"
          animate={{
            y: [0, 20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <span className="mb-2 text-sm">Explore</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Fullscreen background image with carousel */}
      <div className="absolute inset-0">
        {availableImages.map((image, index) => (
          <motion.img
            key={index}
            src={image}
            alt={`Luxury Property Background ${index + 1}`}
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{
              opacity: index === currentImageIndex ? 1 : 0,
              scale: index === currentImageIndex ? 1 : 1.05
            }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30 z-10"></div>

      {/* Animated content */}
      <div className="relative z-20 h-full flex items-center">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <motion.h1
              className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-4 leading-tight"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
            >
              {heroData.heroTitle}
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl text-indigo-200 mb-4 leading-tight"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
            >
              {heroData.heroSubtitle}
            </motion.p>

            <motion.p
              className="text-xl text-gray-200 mb-8 max-w-lg hidden md:block"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
            >
              {heroData.heroDescription}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 mt-6 md:mt-8"
            >
              <Link
                href="/properties"
                className="px-6 py-3 md:px-8 md:py-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-lg text-center"
              >
                Explore Properties
              </Link>
              <button
                onClick={() => handleScheduleViewing()}
                className="px-6 py-3 md:px-8 md:py-4 bg-transparent border-2 border-green-500 text-green-500 font-medium rounded-lg hover:bg-green-50 hover:border-green-600 hover:text-green-600 transition-colors text-center flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.485 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Schedule via WhatsApp
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Image counter for carousel */}
      <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
        {availableImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`w-3 h-3 rounded-full ${
              index === currentImageIndex ? 'bg-white' : 'bg-white/50'
            }`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>

      {/* Animated floating elements */}
      <motion.div
        className="absolute top-1/4 left-10 w-16 h-16 rounded-full bg-indigo-500/20 blur-xl z-10"
        animate={{
          y: [0, -20, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-1/3 right-20 w-24 h-24 rounded-full bg-purple-500/20 blur-xl z-10"
        animate={{
          y: [0, 20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white flex flex-col items-center z-30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <span className="mb-2 text-sm">Explore</span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;