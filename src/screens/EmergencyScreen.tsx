import React, { useState } from 'react';
import {
  Phone,
  MapPin,
  Shield,
  AlertTriangle,
  Users,
  Car,
  Heart,
  Flashlight,
  Navigation,
  Clock,
  CheckCircle,
  AlertCircle,
  Ambulance,
  FireTruck,
  PoliceCar
} from 'lucide-react';

export const EmergencyScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'contacts' | 'services' | 'location'>('contacts');
  const [isLocationSharing, setIsLocationSharing] = useState(false);

  const emergencyContacts = [
    {
      id: 1,
      name: 'Emergency Services',
      number: '911',
      type: 'emergency',
      icon: Phone,
      color: 'bg-red-500',
      description: 'Police, Fire, Medical'
    },
    {
      id: 2,
      name: 'Roadside Assistance',
      number: '1-800-AAA-HELP',
      type: 'roadside',
      icon: Car,
      color: 'bg-blue-500',
      description: 'Towing, Tire Change, Fuel'
    },
    {
      id: 3,
      name: 'Poison Control',
      number: '1-800-222-1222',
      type: 'medical',
      icon: Heart,
      color: 'bg-green-500',
      description: '24/7 Poison Emergency'
    },
    {
      id: 4,
      name: 'Crisis Hotline',
      number: '988',
      type: 'mental',
      icon: Users,
      color: 'bg-purple-500',
      description: 'Mental Health Support'
    }
  ];

  const emergencyServices = [
    {
      id: 1,
      name: 'Nearest Hospital',
      distance: '0.8 miles',
      address: '123 Medical Center Dr',
      icon: Heart,
      color: 'bg-red-500',
      estimatedTime: '3 min drive',
      phone: '(555) 123-4567'
    },
    {
      id: 2,
      name: 'Police Station',
      distance: '1.2 miles',
      address: '456 Safety Ave',
      icon: Shield,
      color: 'bg-blue-500',
      estimatedTime: '5 min drive',
      phone: '(555) 234-5678'
    },
    {
      id: 3,
      name: 'Fire Department',
      distance: '1.5 miles',
      address: '789 Emergency Blvd',
      icon: AlertTriangle,
      color: 'bg-orange-500',
      estimatedTime: '6 min drive',
      phone: '(555) 345-6789'
    },
    {
      id: 4,
      name: 'Urgent Care',
      distance: '0.5 miles',
      address: '321 Quick Care Ln',
      icon: Heart,
      color: 'bg-green-500',
      estimatedTime: '2 min drive',
      phone: '(555) 456-7890'
    }
  ];

  const quickActions = [
    {
      id: 1,
      title: 'Share Location',
      description: 'Send your current location to emergency contacts',
      icon: MapPin,
      action: () => setIsLocationSharing(!isLocationSharing),
      isActive: isLocationSharing
    },
    {
      id: 2,
      title: 'Flashlight',
      description: 'Turn on device flashlight',
      icon: Flashlight,
      action: () => console.log('Toggle flashlight')
    },
    {
      id: 3,
      title: 'Navigate to Help',
      description: 'Get directions to nearest emergency service',
      icon: Navigation,
      action: () => console.log('Navigate to help')
    },
    {
      id: 4,
      title: 'Emergency Info',
      description: 'Display medical information and emergency contacts',
      icon: AlertCircle,
      action: () => console.log('Show emergency info')
    }
  ];

  const handleEmergencyCall = (number: string) => {
    // In a real app, this would initiate a phone call
    window.open(`tel:${number}`);
  };

  const handleLocationSharing = () => {
    setIsLocationSharing(!isLocationSharing);
    // In a real app, this would share location with emergency contacts
  };

  return (
    <div className="min-h-screen bg-red-50">
      {/* Emergency Header */}
      <div className="bg-red-600 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Emergency Assistance</h1>
              <p className="text-red-100">Quick access to emergency services and help</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Emergency Call Button */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-red-600 text-white rounded-lg shadow-lg p-6 text-center">
          <Phone className="w-12 h-12 mx-auto mb-3" />
          <h2 className="text-xl font-bold mb-2">Emergency Services</h2>
          <p className="text-red-100 mb-4">Call 911 for immediate assistance</p>
          <button
            onClick={() => handleEmergencyCall('911')}
            className="bg-white text-red-600 px-8 py-3 rounded-lg font-bold text-lg hover:bg-red-50 transition-colors"
          >
            Call 911 Now
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-4xl mx-auto px-4 pb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              className={`p-4 rounded-lg border-2 transition-all ${
                action.isActive
                  ? 'bg-red-100 border-red-500 text-red-700'
                  : 'bg-white border-gray-200 hover:border-red-300 hover:shadow-md'
              }`}
            >
              <action.icon className="w-6 h-6 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-900">{action.title}</div>
              <div className="text-xs text-gray-600 mt-1">{action.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4 pb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('contacts')}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === 'contacts'
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Emergency Contacts
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === 'services'
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Nearby Services
            </button>
            <button
              onClick={() => setActiveTab('location')}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === 'location'
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Location Info
            </button>
          </div>

          <div className="p-6">
            {/* Emergency Contacts Tab */}
            {activeTab === 'contacts' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact Numbers</h3>
                {emergencyContacts.map((contact) => (
                  <div key={contact.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`${contact.color} p-3 rounded-full text-white`}>
                        <contact.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{contact.name}</h4>
                        <p className="text-sm text-gray-600">{contact.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleEmergencyCall(contact.number)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                    >
                      <Phone className="w-4 h-4" />
                      <span>{contact.number}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Nearby Services Tab */}
            {activeTab === 'services' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Nearby Emergency Services</h3>
                {emergencyServices.map((service) => (
                  <div key={service.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`${service.color} p-3 rounded-full text-white`}>
                          <service.icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{service.name}</h4>
                          <p className="text-sm text-gray-600">{service.address}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm">
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">{service.distance}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">{service.estimatedTime}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => handleEmergencyCall(service.phone)}
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors text-sm flex items-center space-x-1"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Call</span>
                        </button>
                        <button className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors text-sm flex items-center space-x-1">
                          <Navigation className="w-3 h-3" />
                          <span>Navigate</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Location Info Tab */}
            {activeTab === 'location' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Location</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <MapPin className="w-5 h-5 text-red-600" />
                      <span className="font-medium text-gray-900">Location Sharing</span>
                      <button
                        onClick={handleLocationSharing}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          isLocationSharing ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            isLocationSharing ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600">
                      {isLocationSharing
                        ? 'Your location is being shared with your emergency contacts.'
                        : 'Location sharing is disabled. Enable to share with emergency contacts.'}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Location Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Latitude:</span>
                      <span className="font-mono text-gray-900">40.7128° N</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Longitude:</span>
                      <span className="font-mono text-gray-900">74.0060° W</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Accuracy:</span>
                      <span className="text-gray-900">±5 meters</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Last Updated:</span>
                      <span className="text-gray-900">Just now</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Address:</span>
                      <span className="text-gray-900">123 Current St, City, State 12345</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-blue-900">Emergency Location Sharing</h5>
                      <p className="text-sm text-blue-800 mt-1">
                        In an emergency, your precise location can be automatically shared with first responders
                        when you call emergency services, even if you can't speak.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyScreen;