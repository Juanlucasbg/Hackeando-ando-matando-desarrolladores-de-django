import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Home,
  Search,
  ArrowLeft,
  Navigation,
  Compass
} from 'lucide-react';

export const NotFoundScreen: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const quickLinks = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Route Planning', icon: Navigation, path: '/route' },
    { name: 'Analytics', icon: Compass, path: '/analytics' },
    { name: 'Settings', icon: Search, path: '/settings' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={handleGoBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Go Back</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full text-center">
          {/* 404 Icon */}
          <div className="mb-8">
            <div className="relative inline-block">
              <div className="bg-gray-100 rounded-full p-8">
                <MapPin className="w-24 h-24 text-gray-400" />
              </div>
              <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                404
              </div>
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h1>

          <p className="text-lg text-gray-600 mb-8">
            Oops! The page you're looking for seems to have wandered off the map.
            Let's help you get back on track.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={handleGoHome}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Home className="w-5 h-5" />
              <span>Go Home</span>
            </button>

            <button
              onClick={handleGoBack}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Go Back</span>
            </button>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Maybe you were looking for:
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {quickLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className="flex items-center space-x-3 p-3 text-left rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-blue-300 transition-colors"
                >
                  <link.icon className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">{link.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-8 text-sm text-gray-600">
            <p>If you believe this is an error, please contact our support team.</p>
            <div className="mt-2">
              <span>Error Code: </span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">404_PAGE_NOT_FOUND</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="text-sm text-gray-600 mb-2 sm:mb-0">
              © 2024 Google Maps Clone. All rights reserved.
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <a href="/help" className="hover:text-gray-900 transition-colors">
                Help Center
              </a>
              <a href="/contact" className="hover:text-gray-900 transition-colors">
                Contact Us
              </a>
              <a href="/feedback" className="hover:text-gray-900 transition-colors">
                Send Feedback
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundScreen;