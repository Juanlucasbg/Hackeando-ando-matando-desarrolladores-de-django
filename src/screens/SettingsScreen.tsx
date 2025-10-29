import React from 'react';
import {
  Map,
  Navigation,
  Bell,
  Shield,
  Palette,
  Globe,
  Volume2,
  Download,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import { useThemeStore } from '../stores/themeStore';

export const SettingsScreen: React.FC = () => {
  const { theme, setTheme } = useThemeStore();

  const settingsSections = [
    {
      title: 'Map Preferences',
      icon: Map,
      items: [
        { label: 'Default Map View', value: 'Satellite', type: 'select' },
        { label: 'Traffic Layer', value: 'Enabled', type: 'toggle' },
        { label: 'Public Transport', value: 'Enabled', type: 'toggle' },
        { label: 'Bike Lanes', value: 'Disabled', type: 'toggle' },
        { label: 'Map Zoom Controls', value: 'Enabled', type: 'toggle' }
      ]
    },
    {
      title: 'Navigation',
      icon: Navigation,
      items: [
        { label: 'Voice Navigation', value: 'Enabled', type: 'toggle' },
        { label: 'Default Transport Mode', value: 'Driving', type: 'select' },
        { label: 'Avoid Tolls', value: 'Disabled', type: 'toggle' },
        { label: 'Avoid Highways', value: 'Disabled', type: 'toggle' },
        { label: 'Auto-reroute', value: 'Enabled', type: 'toggle' }
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      items: [
        { label: 'Traffic Alerts', value: 'Enabled', type: 'toggle' },
        { label: 'Route Updates', value: 'Enabled', type: 'toggle' },
        { label: 'Location Reminders', value: 'Disabled', type: 'toggle' },
        { label: 'Promotional Offers', value: 'Disabled', type: 'toggle' },
        { label: 'Sound Effects', value: 'Enabled', type: 'toggle' }
      ]
    },
    {
      title: 'Privacy & Security',
      icon: Shield,
      items: [
        { label: 'Location History', value: 'Enabled', type: 'toggle' },
        { label: 'Data Sharing', value: 'Limited', type: 'select' },
        { label: 'Personalized Ads', value: 'Disabled', type: 'toggle' },
        { label: 'Two-Factor Auth', value: 'Enabled', type: 'toggle' },
        { label: 'Privacy Dashboard', value: 'View', type: 'action' }
      ]
    },
    {
      title: 'Appearance',
      icon: Palette,
      items: [
        { label: 'Theme', value: theme, type: 'theme' },
        { label: 'Map Style', value: 'Standard', type: 'select' },
        { label: 'Text Size', value: 'Medium', type: 'select' },
        { label: 'High Contrast', value: 'Disabled', type: 'toggle' }
      ]
    },
    {
      title: 'Language & Region',
      icon: Globe,
      items: [
        { label: 'Language', value: 'English', type: 'select' },
        { label: 'Distance Units', value: 'Kilometers', type: 'select' },
        { label: 'Voice Language', value: 'English', type: 'select' },
        { label: 'Region', value: 'United States', type: 'select' }
      ]
    }
  ];

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme as 'light' | 'dark' | 'system');
  };

  const renderSettingItem = (item: any, sectionTitle: string) => {
    const baseClasses = "flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0";

    if (item.type === 'toggle') {
      return (
        <div key={`${sectionTitle}-${item.label}`} className={baseClasses}>
          <span className="text-gray-700">{item.label}</span>
          <button
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              item.value === 'Enabled' ? 'bg-blue-500' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                item.value === 'Enabled' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      );
    }

    if (item.type === 'select') {
      return (
        <div key={`${sectionTitle}-${item.label}`} className={baseClasses}>
          <span className="text-gray-700">{item.label}</span>
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">{item.value}</span>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      );
    }

    if (item.type === 'theme') {
      return (
        <div key={`${sectionTitle}-${item.label}`} className={baseClasses}>
          <span className="text-gray-700">{item.label}</span>
          <select
            value={theme}
            onChange={(e) => handleThemeChange(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>
      );
    }

    if (item.type === 'action') {
      return (
        <div key={`${sectionTitle}-${item.label}`} className={baseClasses}>
          <span className="text-gray-700">{item.label}</span>
          <div className="flex items-center space-x-2">
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Customize your app experience and preferences</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Settings Sections */}
        <div className="space-y-6">
          {settingsSections.map((section, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <section.icon className="h-5 w-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-1">
                  {section.items.map((item) => renderSettingItem(item, section.title))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Settings */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Storage & Data</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <Download className="h-5 w-5 text-gray-600" />
                  <div>
                    <div className="text-gray-700">Offline Maps</div>
                    <div className="text-sm text-gray-500">Manage downloaded maps for offline use</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <Volume2 className="h-5 w-5 text-gray-600" />
                  <div>
                    <div className="text-gray-700">Audio Files</div>
                    <div className="text-sm text-gray-500">Manage cached navigation audio</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center space-x-3">
                  <HelpCircle className="h-5 w-5 text-gray-600" />
                  <div>
                    <div className="text-gray-700">Help & Support</div>
                    <div className="text-sm text-gray-500">Get help and contact support</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* App Version */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Google Maps Clone v1.0.0</p>
          <p className="mt-1">© 2024 Movility AI. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;