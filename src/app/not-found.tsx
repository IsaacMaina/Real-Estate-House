// src/app/not-found.tsx
'use client';

import { FaHome, FaSearch } from 'react-icons/fa';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="bg-indigo-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaHome className="w-12 h-12 text-indigo-600" />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
        <p className="text-gray-600 mb-8">
          Sorry, we couldn't find the page you're looking for. The property might have been sold or the URL might be incorrect.
        </p>
        
        <div className="space-y-4">
          <Link 
            href="/" 
            className="block px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Return Home
          </Link>
          
          <Link 
            href="/properties" 
            className="block px-6 py-3 bg-white text-indigo-600 font-medium rounded-lg border border-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            Browse Properties
          </Link>
        </div>
      </div>
    </div>
  );
}