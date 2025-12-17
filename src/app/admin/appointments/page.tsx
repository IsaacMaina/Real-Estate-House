// src/app/admin/appointments/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaCalendarAlt, FaClock, FaUser, FaMapMarkerAlt, FaCheck, FaTimes, FaEye, FaTrash, FaSearch, FaFilter } from 'react-icons/fa';

// Mock data for appointments
const mockAppointments = [
  { id: 1, customerName: 'John Doe', customerEmail: 'john@example.com', property: 'Luxury Villa in Karen', date: '2023-05-25', time: '10:00 AM', status: 'Confirmed', agent: 'James Wilson' },
  { id: 2, customerName: 'Jane Smith', customerEmail: 'jane@example.com', property: 'Penthouse in Upper Hill', date: '2023-05-26', time: '2:00 PM', status: 'Pending', agent: 'James Wilson' },
  { id: 3, customerName: 'Mike Johnson', customerEmail: 'mike@example.com', property: 'Estate Home in Mombasa Road', date: '2023-05-27', time: '11:30 AM', status: 'Cancelled', agent: 'Mary Davis' },
  { id: 4, customerName: 'Sarah Williams', customerEmail: 'sarah@example.com', property: 'Modern Apartment in Westlands', date: '2023-05-28', time: '3:00 PM', status: 'Confirmed', agent: 'Robert Taylor' },
  { id: 5, customerName: 'Robert Brown', customerEmail: 'robert@example.com', property: 'Beach House in Mombasa', date: '2023-05-29', time: '9:00 AM', status: 'Completed', agent: 'James Wilson' },
];

export default function AppointmentsManagement() {
  const [appointments, setAppointments] = useState(mockAppointments);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch =
      appointment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.property.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'All' || appointment.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id: number) => {
    setAppointments(appointments.filter(appointment => appointment.id !== id));
  };

  const updateStatus = (id: number, newStatus: string) => {
    setAppointments(appointments.map(appointment =>
      appointment.id === id ? { ...appointment, status: newStatus } : appointment
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Appointments Management</h1>
            <p className="text-gray-600">Manage property viewing appointments</p>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative w-full md:w-1/3">
              <input
                type="text"
                placeholder="Search appointments..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>

            <div className="flex space-x-2">
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All" className="text-gray-900">All Statuses</option>
                <option value="Pending" className="text-gray-900">Pending</option>
                <option value="Confirmed" className="text-gray-900">Confirmed</option>
                <option value="Completed" className="text-gray-900">Completed</option>
                <option value="Cancelled" className="text-gray-900">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <FaUser className="text-indigo-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{appointment.customerName}</div>
                          <div className="text-sm text-gray-500">{appointment.customerEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{appointment.property}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <FaCalendarAlt className="mr-1 text-gray-400" />
                        {appointment.date}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <FaClock className="mr-1 text-gray-400" />
                        {appointment.time}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{appointment.agent}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={appointment.status}
                        onChange={(e) => updateStatus(appointment.id, e.target.value)}
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${appointment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                            appointment.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 
                            appointment.status === 'Completed' ? 'bg-blue-100 text-blue-800' : 
                            'bg-red-100 text-red-800'}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <button className="text-indigo-600 hover:text-indigo-900">
                          <FaEye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(appointment.id)} className="text-red-600 hover:text-red-900">
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredAppointments.length}</span> of{' '}
                  <span className="font-medium">{appointments.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <a href="#" className="relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    Previous
                  </a>
                  <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                    1
                  </a>
                  <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                    2
                  </a>
                  <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                    3
                  </a>
                  <a href="#" className="relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    Next
                  </a>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}