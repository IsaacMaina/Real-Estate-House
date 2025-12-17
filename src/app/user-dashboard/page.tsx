// src/app/user-dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const [savedProperties, setSavedProperties] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      fetchDashboardData();
    }
  }, [status, session]);

  const fetchDashboardData = async () => {
    try {
      // Fetch user's saved properties
      const savedPropsResponse = await fetch(`/api/user/saved-properties`);
      if (savedPropsResponse.ok) {
        const savedPropsData = await savedPropsResponse.json();
        setSavedProperties(savedPropsData);
      }

      // Fetch user's appointments
      const appointmentsResponse = await fetch(`/api/user/appointments`);
      if (appointmentsResponse.ok) {
        const appointmentsData = await appointmentsResponse.json();
        setAppointments(appointmentsData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoadingDashboard(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">Please log in to access your dashboard</p>
          <Link href="/login" className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Welcome, {session?.user?.name}</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Stats cards */}
            <div className="bg-indigo-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-indigo-800">Saved Properties</h3>
              <p className="text-3xl font-bold text-indigo-600 mt-2">{savedProperties.length}</p>
            </div>

            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-green-800">Appointments</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">{appointments.length}</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-purple-800">Account Status</h3>
              <p className="text-xl font-bold text-purple-600 mt-2 capitalize">{session?.user?.role}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Saved Properties Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Saved Properties</h2>
              {savedProperties.length > 0 ? (
                <div className="space-y-4">
                  {savedProperties.map((property) => (
                    <div key={property.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <h3 className="font-medium text-gray-900">{property.title}</h3>
                      <p className="text-gray-600">{property.location}</p>
                      <p className="text-indigo-600 font-semibold">KSh {property.price?.toLocaleString()}</p>
                      <div className="mt-2 flex space-x-2">
                        <Link
                          href={`/properties/${property.id}`}
                          className="text-sm text-indigo-600 hover:text-indigo-800"
                        >
                          View Details
                        </Link>
                        <button className="text-sm text-red-600 hover:text-red-800"
                                onClick={() => removeFavorite(property.id)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">You haven't saved any properties yet.</p>
              )}
              <Link href="/properties" className="mt-4 inline-block text-indigo-600 hover:text-indigo-800">
                Browse Properties &rarr;
              </Link>
            </div>

            {/* Appointments Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Appointments</h2>
              {appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <h3 className="font-medium text-gray-900">{appointment.property?.title || 'Property View'}</h3>
                      <p className="text-gray-600">{appointment.property?.location}</p>
                      <p className="text-gray-600">
                        {new Date(appointment.appointment_date).toLocaleDateString()}
                        {' at '}
                        {appointment.appointment_time}
                      </p>
                      <p className="text-sm mt-1 capitalize">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {appointment.status}
                        </span>
                      </p>
                      <button className="mt-2 text-sm text-indigo-600 hover:text-indigo-800">
                        Cancel Appointment
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">You don't have any appointments scheduled.</p>
              )}
              <Link href="/properties" className="mt-4 inline-block text-indigo-600 hover:text-indigo-800">
                Schedule Appointment &rarr;
              </Link>
            </div>
          </div>

          {/* Account Settings */}
          <div className="mt-8 border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Settings</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                Update Profile
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                Change Password
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                Notification Preferences
              </button>
              {session?.user?.role === 'admin' && (
                <Link
                  href="/admin"
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-center"
                >
                  Admin Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Function to remove a favorite property
async function removeFavorite(propertyId: string) {
  try {
    const response = await fetch(`/api/user/remove-favorite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ propertyId }),
    });

    if (response.ok) {
      // Refresh the page or update the state to remove the property from the list
      window.location.reload();
    }
  } catch (error) {
    console.error('Error removing favorite:', error);
  }
}