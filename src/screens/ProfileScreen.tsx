import React from 'react';
import {
  User,
  MapPin,
  Route,
  Award,
  TrendingUp,
  Settings,
  Camera,
  Mail,
  Phone,
  Calendar,
  Shield,
  Star,
  Clock
} from 'lucide-react';

export const ProfileScreen: React.FC = () => {
  // Mock user data
  const userData = {
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    phone: '+1 (555) 123-4567',
    memberSince: 'January 2023',
    avatar: null, // Could be a URL
    level: 'Gold',
    points: 2,847,
    completedRoutes: 156,
    totalDistance: '2,847 km',
    co2Saved: '127 kg',
    favoritePlaces: 23,
    achievements: [
      { id: 1, name: 'Early Bird', description: '5 routes before 6 AM', icon: '🌅', unlocked: true },
      { id: 2, name: 'Explorer', description: 'Visit 50 different places', icon: '🗺️', unlocked: true },
      { id: 3, name: 'Eco Warrior', description: 'Save 100kg CO2', icon: '🌱', unlocked: true },
      { id: 4, name: 'Speed Demon', description: 'Complete route in record time', icon: '⚡', unlocked: false },
      { id: 5, name: 'Marathon Runner', description: 'Travel 1000km total', icon: '🏃', unlocked: true },
      { id: 6, name: 'Night Owl', description: '10 routes after 10 PM', icon: '🦉', unlocked: false }
    ],
    recentActivity: [
      { id: 1, type: 'route', description: 'Completed route: Home → Office', time: '2 hours ago', icon: Route },
      { id: 2, type: 'achievement', description: 'Unlocked: Explorer Achievement', time: '1 day ago', icon: Award },
      { id: 3, type: 'place', description: 'Added new favorite place', time: '2 days ago', icon: MapPin },
      { id: 4, type: 'route', description: 'Completed route: Office → Gym', time: '3 days ago', icon: Route }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center space-x-6">
            {/* Avatar */}
            <div className="relative">
              {userData.avatar ? (
                <img
                  src={userData.avatar}
                  alt={userData.name}
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-white/20 flex items-center justify-center">
                  <User className="w-12 h-12 text-white" />
                </div>
              )}
              <button className="absolute bottom-0 right-0 bg-white text-blue-500 p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{userData.name}</h1>
              <div className="flex items-center space-x-4 mt-2 text-blue-100">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Member since {userData.memberSince}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Shield className="w-4 h-4" />
                  <span className="font-semibold">{userData.level}</span>
                </div>
              </div>
            </div>

            {/* Points */}
            <div className="text-center">
              <div className="text-3xl font-bold">{userData.points.toLocaleString()}</div>
              <div className="text-blue-100">Points</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
                <Route className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{userData.completedRoutes}</div>
                <div className="text-sm text-gray-600">Routes</div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
                <MapPin className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{userData.totalDistance}</div>
                <div className="text-sm text-gray-600">Distance</div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
                <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{userData.co2Saved}</div>
                <div className="text-sm text-gray-600">CO₂ Saved</div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
                <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{userData.favoritePlaces}</div>
                <div className="text-sm text-gray-600">Favorites</div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{userData.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{userData.phone}</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {userData.recentActivity.map((activity) => (
                  <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <activity.icon className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.description}</p>
                        <div className="flex items-center space-x-1 mt-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{activity.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Achievements */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Achievements</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {userData.achievements.filter(a => a.unlocked).length} of {userData.achievements.length} unlocked
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-3">
                  {userData.achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`text-center p-3 rounded-lg border ${
                        achievement.unlocked
                          ? 'bg-yellow-50 border-yellow-200'
                          : 'bg-gray-50 border-gray-200 opacity-60'
                      }`}
                    >
                      <div className="text-2xl mb-1">{achievement.icon}</div>
                      <div className="text-xs font-medium text-gray-900">{achievement.name}</div>
                      <div className="text-xs text-gray-600 mt-1">{achievement.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-6 space-y-3">
                <button className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <Settings className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700">Account Settings</span>
                  </div>
                  <span className="text-gray-400">→</span>
                </button>

                <button className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700">Manage Favorite Places</span>
                  </div>
                  <span className="text-gray-400">→</span>
                </button>

                <button className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700">View Detailed Stats</span>
                  </div>
                  <span className="text-gray-400">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;