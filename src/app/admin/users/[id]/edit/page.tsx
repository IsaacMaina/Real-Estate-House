// src/app/admin/users/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaUser, FaTimes, FaSave } from 'react-icons/fa';

const EditUser = () => {
  const { id }: { id: string } = useParams();
  const router = useRouter();
  const [userData, setUserData] = useState({
    id: 0,
    name: '',
    email: '',
    role: 'registered', // Use correct database value
    status: 'Active',
    joinDate: '',
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/admin/users/${id}`);
        if (response.ok) {
          const data = await response.json();
          setUserData({
            id: parseInt(id),
            name: data.name,
            email: data.email,
            role: data.role || 'registered',
            status: data.status,
            joinDate: data.joinDate,
          });
        } else {
          console.error('Failed to fetch user data');
          // Set default values
          setUserData({
            id: parseInt(id),
            name: '',
            email: '',
            role: 'registered', // Use correct database value
            status: 'Active',
            joinDate: '',
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Set default values
        setUserData({
          id: parseInt(id),
          name: '',
          email: '',
          role: 'registered', // Use correct database value
          status: 'Active',
          joinDate: '',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Map display role to database role if it's the role field
    if (name === 'role') {
      setUserData(prev => ({
        ...prev,
        [name]: mapDisplayRoleToDatabase(value)
      }));
    } else {
      setUserData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Mapping functions for role display
  const mapDatabaseRoleToDisplay = (dbRole: string): string => {
    switch(dbRole.toLowerCase()) {
      case 'public':
        return 'Client';
      case 'registered':
        return 'Client';
      case 'agent':
        return 'Agent';
      case 'admin':
        return 'Admin';
      default:
        return 'Client';
    }
  };

  const mapDisplayRoleToDatabase = (displayRole: string): string => {
    switch(displayRole) {
      case 'Client':
        return 'registered'; // Default for client users
      case 'Agent':
        return 'agent';
      case 'Admin':
        return 'admin';
      default:
        return 'registered';
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if password fields are filled
    if (passwordData.newPassword || passwordData.confirmPassword) {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        alert('Passwords do not match');
        return;
      }

      if (passwordData.newPassword.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
      }
    }

    try {
      // First, update user profile info
      const userResponse = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!userResponse.ok) {
        console.error('Failed to update user profile');
        alert('Failed to update user profile');
        return;
      }

      // If password fields are filled, update password separately
      if (passwordData.newPassword && passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword) {
        const passwordResponse = await fetch(`/api/admin/users/${id}/password`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password: passwordData.newPassword }),
        });

        if (!passwordResponse.ok) {
          console.error('Failed to update password');
          alert('User updated successfully but password update failed');
        }
      }

      // Redirect back to users management
      router.push('/admin/users');
      router.refresh();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('An error occurred while updating the user');
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
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
            <button
              onClick={() => router.push('/admin/users')}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <FaTimes className="mr-2" />
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={userData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={userData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={mapDatabaseRoleToDisplay(userData.role)}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
                  required
                >
                  <option value="Client" className="text-gray-900">Client</option>
                  <option value="Agent" className="text-gray-900">Agent</option>
                  <option value="Admin" className="text-gray-900">Admin</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={userData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
                >
                  <option value="Active" className="text-gray-900">Active</option>
                  <option value="Inactive" className="text-gray-900">Inactive</option>
                </select>
              </div>
            </div>

            {/* Password Change Section */}
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
                    placeholder="Enter new password (leave blank to keep current password)"
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
                    placeholder="Confirm new password (leave blank to keep current password)"
                  />
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500">Changing password is optional - leave blank to keep current password</p>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <FaSave className="mr-2" />
                Update User
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditUser;