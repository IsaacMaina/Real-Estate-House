// src/components/Navigation.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut, useSession } from 'next-auth/react';
import { FaCog, FaUser, FaSignInAlt, FaSignOutAlt } from 'react-icons/fa';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const navbarRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  // Function to check if a link is active
  const isActiveLink = (linkPath: string) => {
    if (linkPath === '/') return pathname === '/';
    return pathname.startsWith(linkPath);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10); // Changed threshold to prevent flickering
    };

    window.addEventListener('scroll', handleScroll);
    // Set initial scroll state to prevent layout shift
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && isMenuOpen && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Fetch property types and locations from the database
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        // Fetch property types
        const typesResponse = await fetch('/api/admin/property-types');
        if (typesResponse.ok) {
          const typesData = await typesResponse.json();
          // Only include unique property types that have properties
          setPropertyTypes(typesData);
        } else {
          // Fallback to default types if API fails
          setPropertyTypes([
            'House',
            'Apartment',
            'Penthouse',
            'Villa',
            'Commercial',
            'Land',
            'Estate Home',
            'Beach House',
            'Detached House'
          ]);
        }

        // Fetch locations where properties exist
        const locationsResponse = await fetch('/api/admin/property-locations');
        if (locationsResponse.ok) {
          const locationsData = await locationsResponse.json();
          setLocations(locationsData);
        } else {
          // Fallback to default locations
          setLocations([
            'Nairobi',
            'Mombasa',
            'Kisumu',
            'Eldoret',
            'Nakuru',
            'Thika',
            'Kikuyu',
            'Kiambu'
          ]);
        }
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
        // Set fallback values
        setPropertyTypes([
          'House',
          'Apartment',
          'Penthouse',
          'Villa',
          'Commercial',
          'Land',
          'Estate Home',
          'Beach House',
          'Detached House'
        ]);
        setLocations([
          'Nairobi',
          'Mombasa',
          'Kisumu',
          'Eldoret',
          'Nakuru',
          'Thika',
          'Kikuyu',
          'Kiambu'
        ]);
      }
    };

    fetchDropdownData();
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
        setIsLocationDropdownOpen(false);
        setIsTypeDropdownOpen(false);
      }

      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const mobileUserDropdownRef = useRef<HTMLDivElement>(null);

  // Close mobile user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileUserDropdownRef.current && !mobileUserDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserDropdownOpen]);

  return (
    <header
      ref={navbarRef}
      className="fixed w-full z-50 bg-white py-4 shadow-sm transition-all duration-300"
    >
      <nav className="container mx-auto px-4 flex justify-between items-center">

        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-gray-900">
          LUX<span className="text-indigo-600">RE</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-8 items-center">
          <div className="relative" onMouseEnter={() => setIsLocationDropdownOpen(true)} onMouseLeave={() => setIsLocationDropdownOpen(false)}>
            <button className={`flex items-center relative pb-1 ${isActiveLink('/properties') || isActiveLink('/locations') ? 'text-indigo-600' : 'text-gray-700'} hover:text-indigo-600 transition-colors`}>
              Locations
              {isActiveLink('/properties') || isActiveLink('/locations') ? (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-full"></span>
              ) : null}
              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <AnimatePresence>
              {isLocationDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-100"
                >
                  {locations.map((location, index) => (
                    <Link
                      key={index}
                      href={`/properties?location=${location}`}
                      className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                      {location}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative" onMouseEnter={() => setIsTypeDropdownOpen(true)} onMouseLeave={() => setIsTypeDropdownOpen(false)}>
            <button className={`flex items-center relative pb-1 ${isActiveLink('/properties') ? 'text-indigo-600' : 'text-gray-700'} hover:text-indigo-600 transition-colors`}>
              Properties
              {isActiveLink('/properties') ? (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-full"></span>
              ) : null}
              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <AnimatePresence>
              {isTypeDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-100"
                >
                  {propertyTypes.map((type, index) => (
                    <Link
                      key={index}
                      href={type.toLowerCase() === 'any' ? '/properties' : `/properties?propertyType=${encodeURIComponent(type)}`}
                      className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                      {type}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link href="/services" className={`relative pb-1 ${isActiveLink('/services') ? 'text-indigo-600' : 'text-gray-700'} hover:text-indigo-600 transition-colors`}>
            Services
            {isActiveLink('/services') ? (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-full"></span>
            ) : null}
          </Link>

          <Link href="/about" className={`relative pb-1 ${isActiveLink('/about') ? 'text-indigo-600' : 'text-gray-700'} hover:text-indigo-600 transition-colors`}>
            About
            {isActiveLink('/about') ? (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-full"></span>
            ) : null}
          </Link>
          <Link href="/contact" className={`relative pb-1 ${isActiveLink('/contact') ? 'text-indigo-600' : 'text-gray-700'} hover:text-indigo-600 transition-colors`}>
            Contact
            {isActiveLink('/contact') ? (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-full"></span>
            ) : null}
          </Link>

          {/* User Profile with Dropdown */}
          <div className="relative">
            {status === 'authenticated' && session?.user ? (
              <>
                <button
                  className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 transition-colors"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                >
                  {/* Avatar with Initials */}
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                    {session.user.name ? session.user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium">{session.user.name || session.user.email.split('@')[0]}</div>
                    <div className="text-xs text-gray-500">{session.user.email}</div>
                  </div>
                  <svg className={`w-4 h-4 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div
                    ref={userDropdownRef}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200"
                  >
                    {session?.user?.role === 'admin' && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        <FaCog className="w-4 h-4 inline mr-2" /> Admin Dashboard
                      </Link>
                    )}
                    <Link
                      href="/user-dashboard"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsUserDropdownOpen(false)}
                    >
                      <FaUser className="w-4 h-4 inline mr-2" /> My Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
                    >
                      <FaSignOutAlt className="w-4 h-4 inline mr-2" /> Logout
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link href="/login" className="text-gray-700 hover:text-indigo-600 transition-colors flex items-center">
                <FaSignInAlt className="w-5 h-5 mr-1" /> Login
              </Link>
            )}
          </div>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-gray-700 focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Menu with modern design and animations */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            ref={mobileMenuRef}
            className="md:hidden bg-gradient-to-b from-white to-gray-100 shadow-2xl fixed top-0 right-0 h-screen w-3/4 max-w-sm z-50 overflow-y-auto"
          >
            <div className="container mx-auto px-6 py-8 flex flex-col min-h-screen">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Menu</h3>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                  aria-label="Close menu"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mb-6">
                <button
                  className="flex items-center justify-between w-full text-lg font-medium text-gray-800 hover:text-indigo-600 transition-colors py-4 px-2 border-b border-gray-200"
                  onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                >
                  <span>🌍 Locations</span>
                  <svg
                    className={`w-5 h-5 transition-transform ${isLocationDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isLocationDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 space-y-1 pl-4"
                  >
                    {locations.map((location, index) => (
                      <Link
                        key={index}
                        href={`/properties?location=${location}`}
                        className="block py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors rounded-lg px-4"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setIsLocationDropdownOpen(false);
                        }}
                      >
                        {location}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </div>

              <div className="mb-6">
                <button
                  className="flex items-center justify-between w-full text-lg font-medium text-gray-800 hover:text-indigo-600 transition-colors py-4 px-2 border-b border-gray-200"
                  onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                >
                  <span>🏠 Properties</span>
                  <svg
                    className={`w-5 h-5 transition-transform ${isTypeDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isTypeDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 space-y-1 pl-4"
                  >
                    {propertyTypes.map((type, index) => (
                      <Link
                        key={index}
                        href={type.toLowerCase() === 'any' ? '/properties' : `/properties?propertyType=${encodeURIComponent(type)}`}
                        className="block py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors rounded-lg px-4"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setIsTypeDropdownOpen(false);
                        }}
                      >
                        {type}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </div>

              <Link
                href="/services"
                className="text-lg font-medium py-4 px-2 text-gray-800 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Services
              </Link>

              <Link
                href="/about"
                className="text-lg font-medium py-4 px-2 text-gray-800 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                About Us
              </Link>
              <Link
                href="/contact"
                className="text-lg font-medium py-4 px-2 text-gray-800 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact
              </Link>

              {/* Mobile User Section - moved to the bottom */}
              <div className="mt-auto pt-8 border-t border-gray-200">
                {status === 'authenticated' ? (
                  <div className="relative">
                    <div
                      className="flex items-center p-4 bg-indigo-50 rounded-xl cursor-pointer shadow-sm"
                      onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    >
                      {/* Mobile Avatar with Initials */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white font-medium mr-4">
                        {session.user.name ? session.user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{session.user.name || session.user.email.split('@')[0]}</div>
                        <div className="text-sm text-gray-600">{session.user.email}</div>
                      </div>
                      <svg
                        className={`w-5 h-5 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>

                    {/* Dropdown Menu */}
                    {isUserDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden"
                      >
                        <div className="py-2">
                          {session?.user?.role === 'admin' && (
                            <Link
                              href="/admin"
                              className="flex items-center px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                              onClick={() => {
                                setIsMenuOpen(false);
                                setIsUserDropdownOpen(false);
                              }}
                            >
                              <FaCog className="w-5 h-5 mr-3" />
                              Admin Dashboard
                            </Link>
                          )}
                          <Link
                            href="/user-dashboard"
                            className="flex items-center px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                            onClick={() => {
                              setIsMenuOpen(false);
                              setIsUserDropdownOpen(false);
                            }}
                          >
                            <FaUser className="w-5 h-5 mr-3" />
                            My Dashboard
                          </Link>
                          <button
                            onClick={() => {
                              handleLogout();
                              setIsMenuOpen(false);
                              setIsUserDropdownOpen(false);
                            }}
                            className="w-full text-left flex items-center px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                          >
                            <FaSignOutAlt className="w-5 h-5 mr-3" />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center justify-center py-4 px-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaSignInAlt className="w-5 h-5 mr-3" />
                    <span className="text-lg font-medium">Login</span>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navigation;