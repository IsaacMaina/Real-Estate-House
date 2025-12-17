// src/app/admin/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaCog } from 'react-icons/fa';
import { loadContactInfo, updateContactInfo, getContactInfo } from '@/lib/contact-config';

export default function ContactSettingsPage() {
  const [contactInfo, setContactInfo] = useState({
    phone: '',
    displayPhone: '',
    whatsappNumber: '',
    email: '',
    officeAddress: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await loadContactInfo();
      setContactInfo(data);
    } catch (error) {
      console.error('Error loading contact settings:', error);
      setMessage('Error loading contact settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await updateContactInfo(contactInfo);
      setMessage('Settings saved successfully!');
      // Reload settings to ensure cache is updated
      await loadContactInfo();
    } catch (error) {
      console.error('Error saving contact settings:', error);
      setMessage('Error saving contact settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <FaCog className="text-indigo-600 mr-2" />
            <h1 className="text-xl font-semibold text-gray-800">Contact Settings</h1>
          </div>
          <button
            onClick={loadSettings}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </header>

      <main className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Contact Information Settings</h2>

            {message && (
              <div className={`mb-6 p-4 rounded-lg ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number (Internal)
                  </label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={contactInfo.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
                    placeholder="e.g., 254758302725"
                  />
                  <p className="mt-1 text-xs text-gray-500">Internal format for database (no spaces/dashes)</p>
                </div>

                <div>
                  <label htmlFor="displayPhone" className="block text-sm font-medium text-gray-700 mb-1">
                    Display Phone
                  </label>
                  <input
                    type="text"
                    id="displayPhone"
                    name="displayPhone"
                    value={contactInfo.displayPhone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
                    placeholder="e.g., +254 758 302 725"
                  />
                  <p className="mt-1 text-xs text-gray-500">How the phone number appears to users</p>
                </div>

                <div>
                  <label htmlFor="whatsappNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    type="text"
                    id="whatsappNumber"
                    name="whatsappNumber"
                    value={contactInfo.whatsappNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
                    placeholder="e.g., 254758302725"
                  />
                  <p className="mt-1 text-xs text-gray-500">Phone number used for WhatsApp links</p>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={contactInfo.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
                    placeholder="e.g., info@luxurykenyarealestate.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="officeAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  Office Address
                </label>
                <textarea
                  id="officeAddress"
                  name="officeAddress"
                  value={contactInfo.officeAddress}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
                  placeholder="e.g., 123 Westlands Road, 5th Floor\nNairobi, Kenya"
                ></textarea>
              </div>

              <div className="flex items-center space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className={`flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors ${saving ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  <FaSave className="mr-2" />
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>

                <button
                  type="button"
                  onClick={loadSettings}
                  className="flex items-center px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <FaTimes className="mr-2" />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}