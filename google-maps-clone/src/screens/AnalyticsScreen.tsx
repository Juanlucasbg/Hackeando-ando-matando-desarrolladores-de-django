import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const AnalyticsScreen: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <Button variant="outline">Export Data</Button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <h3 className="text-lg font-semibold mb-2">Total Searches</h3>
              <p className="text-3xl font-bold text-blue-600">1,234</p>
              <p className="text-sm text-gray-500 mt-1">+12% from last month</p>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold mb-2">Route Plans Created</h3>
              <p className="text-3xl font-bold text-green-600">567</p>
              <p className="text-sm text-gray-500 mt-1">+8% from last month</p>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold mb-2">Active Users</h3>
              <p className="text-3xl font-bold text-purple-600">89</p>
              <p className="text-sm text-gray-500 mt-1">+23% from last month</p>
            </Card>

            <Card className="md:col-span-2 lg:col-span-3">
              <h3 className="text-lg font-semibold mb-4">Popular Destinations</h3>
              <div className="space-y-3">
                {['Times Square, New York', 'Central Park, New York', 'Golden Gate Bridge, San Francisco'].map((destination, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-700">{destination}</span>
                    <span className="text-sm text-gray-500">{Math.floor(Math.random() * 100) + 20} searches</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AnalyticsScreen;