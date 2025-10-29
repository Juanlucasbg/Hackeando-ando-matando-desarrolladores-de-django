import React from 'react';
import {
  MapPin,
  Route,
  Clock,
  TrendingUp,
  Users,
  Navigation,
  Activity,
  Zap
} from 'lucide-react';

export const AnalyticsScreen: React.FC = () => {
  // Mock data for demonstration
  const analyticsData = {
    overview: {
      totalRoutes: 156,
      totalDistance: '2,847 km',
      totalTime: '67h 23m',
      avgSpeed: '42.3 km/h',
      co2Saved: '127 kg',
      caloriesBurned: '8,942 kcal'
    },
    weeklyStats: [
      { day: 'Mon', routes: 12, distance: 45, time: 67 },
      { day: 'Tue', routes: 18, distance: 62, time: 89 },
      { day: 'Wed', routes: 24, distance: 78, time: 112 },
      { day: 'Thu', routes: 15, distance: 51, time: 74 },
      { day: 'Fri', routes: 31, distance: 98, time: 145 },
      { day: 'Sat', routes: 28, distance: 87, time: 128 },
      { day: 'Sun', routes: 28, distance: 87, time: 128 }
    ],
    transportModes: [
      { mode: 'Driving', count: 89, percentage: 57, color: 'bg-blue-500' },
      { mode: 'Walking', count: 34, percentage: 22, color: 'bg-green-500' },
      { mode: 'Transit', count: 25, percentage: 16, color: 'bg-purple-500' },
      { mode: 'Cycling', count: 8, percentage: 5, color: 'bg-orange-500' }
    ],
    recentRoutes: [
      {
        id: 1,
        from: 'Home',
        to: 'Office',
        distance: '12.5 km',
        time: '28 min',
        mode: 'Driving',
        date: '2024-01-15'
      },
      {
        id: 2,
        from: 'Office',
        to: 'Gym',
        distance: '3.2 km',
        time: '15 min',
        mode: 'Walking',
        date: '2024-01-15'
      },
      {
        id: 3,
        from: 'Home',
        to: 'Airport',
        distance: '45.8 km',
        time: '52 min',
        mode: 'Transit',
        date: '2024-01-14'
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your mobility patterns and environmental impact</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Routes</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.totalRoutes}</p>
              </div>
              <Route className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Distance</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.totalDistance}</p>
              </div>
              <MapPin className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Time</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.totalTime}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">CO₂ Saved</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.co2Saved}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Calories Burned</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.caloriesBurned}</p>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Speed</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.avgSpeed}</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Weekly Activity Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Activity</h2>
            <div className="space-y-3">
              {analyticsData.weeklyStats.map((stat, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-12 text-sm font-medium text-gray-600">{stat.day}</div>
                  <div className="flex-1">
                    <div className="relative">
                      <div className="w-full bg-gray-200 rounded-full h-6">
                        <div
                          className="bg-blue-500 h-6 rounded-full flex items-center justify-center text-xs text-white font-medium"
                          style={{ width: `${(stat.routes / 35) * 100}%` }}
                        >
                          {stat.routes} routes
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 w-20 text-right">
                    {stat.distance}km
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transport Mode Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Transport Mode Distribution</h2>
            <div className="space-y-4">
              {analyticsData.transportModes.map((mode, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${mode.color}`}></div>
                    <span className="text-sm font-medium text-gray-700">{mode.mode}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className={`${mode.color} h-2 rounded-full`}
                        style={{ width: `${mode.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{mode.count}</span>
                    <span className="text-sm text-gray-500 w-10 text-right">{mode.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Routes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Routes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Distance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analyticsData.recentRoutes.map((route) => (
                  <tr key={route.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Navigation className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {route.from} → {route.to}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {route.distance}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {route.time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {route.mode}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {route.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsScreen;