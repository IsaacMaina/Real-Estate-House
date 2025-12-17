// src/app/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaHome,
  FaBuilding,
  FaUsers,
  FaImages,
  FaGlobe,
  FaChartBar,
  FaCog,
  FaDatabase,
  FaList,
  FaStar,
  FaUserShield,
  FaEnvelope,
  FaCalendarAlt,
  FaComments,
  FaBell,
  FaBook
} from 'react-icons/fa';

const AdminDashboard = () => {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalUsers: 0,
    totalLocations: 0,
    totalPropertyTypes: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats');
        if (response.ok) {
          const data = await response.json();
          setStats({
            totalProperties: data.totalProperties || 0,
            totalUsers: data.totalUsers || 0,
            totalLocations: data.totalLocations || 0,
            totalPropertyTypes: data.totalPropertyTypes || 0
          });
        } else {
          // Set default values if API fails
          setStats({
            totalProperties: 0,
            totalUsers: 0,
            totalLocations: 0,
            totalPropertyTypes: 0
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Set default values in case of error
        setStats({
          totalProperties: 0,
          totalUsers: 0,
          totalLocations: 0,
          totalPropertyTypes: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const menuItems = [
    {
      title: 'Homepage Management',
      icon: <FaHome className="text-xl" />,
      path: '/admin/homepage',
      color: 'bg-indigo-100 text-indigo-800'
    },
    {
      title: 'Properties Management',
      icon: <FaBuilding className="text-xl" />,
      path: '/admin/properties',
      color: 'bg-green-100 text-green-800'
    },
    {
      title: 'Users Management',
      icon: <FaUserShield className="text-xl" />,
      path: '/admin/users',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      title: 'Media Management',
      icon: <FaImages className="text-xl" />,
      path: '/admin/media',
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      title: 'Analytics',
      icon: <FaChartBar className="text-xl" />,
      path: '/admin/analytics',
      color: 'bg-red-100 text-red-800'
    },
    {
      title: 'Settings',
      icon: <FaCog className="text-xl" />,
      path: '/admin/settings',
      color: 'bg-gray-100 text-gray-800'
    },
    {
      title: 'Database',
      icon: <FaDatabase className="text-xl" />,
      path: '/admin/database',
      color: 'bg-teal-100 text-teal-800'
    },
    {
      title: 'Content',
      icon: <FaList className="text-xl" />,
      path: '/admin/content',
      color: 'bg-pink-100 text-pink-800'
    },
    {
      title: 'Featured Properties',
      icon: <FaStar className="text-xl" />,
      path: '/admin/pages/featured',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      title: 'Inquiries',
      icon: <FaEnvelope className="text-xl" />,
      path: '/admin/inquiries',
      color: 'bg-red-100 text-red-800'
    },
    {
      title: 'Appointments',
      icon: <FaCalendarAlt className="text-xl" />,
      path: '/admin/appointments',
      color: 'bg-pink-100 text-pink-800'
    },
    {
      title: 'Reviews',
      icon: <FaComments className="text-xl" />,
      path: '/admin/reviews',
      color: 'bg-indigo-100 text-indigo-800'
    },
    {
      title: 'Alerts',
      icon: <FaBell className="text-xl" />,
      path: '/admin/alerts',
      color: 'bg-orange-100 text-orange-800'
    },
    {
      title: 'Logs',
      icon: <FaBook className="text-xl" />,
      path: '/admin/logs',
      color: 'bg-teal-100 text-teal-800'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 md:p-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your real estate website content and settings</p>
        </div>

        {/* Stats overview - Informational display with styled background */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl shadow-inner mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center p-4">
              <div className="bg-indigo-100 p-3 rounded-full mr-4">
                <FaBuilding className="text-indigo-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-700 font-medium">
                  Total Properties
                </p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProperties}</p>
              </div>
            </div>
            <div className="flex items-center p-4">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <FaUsers className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-700 font-medium">
                  Total Users
                </p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
            <div className="flex items-center p-4">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <FaGlobe className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-700 font-medium">
                  Total Locations
                </p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalLocations}</p>
              </div>
            </div>
            <div className="flex items-center p-4">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <FaList className="text-purple-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-700 font-medium">
                  Total Property Types
                </p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPropertyTypes}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Management sections */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => router.push(item.path)}
              className="bg-white p-4 md:p-6 rounded-lg shadow hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-indigo-300 hover:-translate-y-1"
            >
              <div className="flex items-start">
                <span className={`${item.color} p-3 rounded-lg mr-4`}>
                  {item.icon}
                </span>
                <div className="flex-1 text-left">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1">
                    {item.title}
                  </h3>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;