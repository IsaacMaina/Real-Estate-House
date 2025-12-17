// src/app/admin/layout.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaUser, FaSignOutAlt, FaGlobe, FaCaretDown, FaCog } from 'react-icons/fa';
import { signOut } from 'next-auth/react';

interface User {
  name: string;
  email: string;
  role: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/admin/current-user');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          // Fallback to default values if API fails
          setUser({
            name: 'Admin User',
            email: 'admin@example.com',
            role: 'Administrator'
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Fallback to default values
        setUser({
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'Administrator'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      // Close dropdown before logout
      setShowDropdown(false);
      // Sign out using next-auth
      await signOut({
        redirect: true,
        callbackUrl: '/'
      });
    } catch (error) {
      console.error('Error during logout:', error);
      // Fallback to manual redirect if signOut fails
      router.push('/');
      router.refresh();
    }
  };

  // Function to generate avatar initials from username
  const getAvatarInitials = (name: string) => {
    if (!name) return 'AU'; // Default if no name
    const names = name.split(' ');
    const initials = names
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase();
    return initials.substring(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Link href="/admin" className="text-xl font-semibold text-gray-800 hover:text-indigo-600 cursor-pointer">Admin Dashboard</Link>
            <Link href="/" className="flex items-center text-gray-600 hover:text-indigo-600 mx-auto">
              <FaGlobe className="mr-1" />
              <span>Public Website</span>
            </Link>
          </div>

          {/* User Profile with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center text-sm focus:outline-none"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="mr-2 text-right">
                {user && (
                  <>
                    <p className="text-sm font-medium text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.role}</p>
                  </>
                )}
              </div>
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-medium">
                {user ? getAvatarInitials(user.name) : 'AU'}
              </div>
              <FaCaretDown className="ml-1 text-gray-500" />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <div className="px-4 py-2 border-b">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                {user?.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    onClick={() => setShowDropdown(false)}
                  >
                    <FaCog className="mr-2" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}
                <Link
                  href="/user-dashboard"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  onClick={() => setShowDropdown(false)}
                >
                  <FaUser className="mr-2" />
                  <span>My Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  onClickCapture={() => setShowDropdown(false)}
                >
                  <FaSignOutAlt className="mr-2" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="p-4 bg-gray-50">
        {children}
      </main>
    </div>
  );
}