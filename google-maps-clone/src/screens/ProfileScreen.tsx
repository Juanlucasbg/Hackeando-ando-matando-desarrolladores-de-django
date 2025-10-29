import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useUserStore } from '../stores/userStore';

const ProfileScreen: React.FC = () => {
  const { user, updateUser } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    updateUser(formData);
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      bio: user?.bio || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            <div className="space-x-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                  <Button onClick={handleSave}>Save</Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Overview */}
            <div className="lg:col-span-1">
              <Card>
                <div className="text-center">
                  <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-3xl text-gray-600">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {user?.name || 'User Name'}
                  </h2>
                  <p className="text-gray-500">{user?.email || 'user@example.com'}</p>
                  <div className="mt-4 text-sm text-gray-500">
                    <p>Member since {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </Card>

              <Card className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Searches</span>
                    <span className="font-semibold">1,234</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Routes Planned</span>
                    <span className="font-semibold">567</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Places Saved</span>
                    <span className="font-semibold">89</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Profile Details */}
            <div className="lg:col-span-2">
              <Card>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h3>

                {isEditing ? (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Name</h4>
                      <p className="text-gray-900">{user?.name || 'Not provided'}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Email</h4>
                      <p className="text-gray-900">{user?.email || 'Not provided'}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Bio</h4>
                      <p className="text-gray-900">
                        {user?.bio || 'No bio provided yet. Click Edit Profile to add your bio.'}
                      </p>
                    </div>
                  </div>
                )}
              </Card>

              <Card className="mt-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <h4 className="font-medium text-gray-900">Default Map Type</h4>
                      <p className="text-sm text-gray-500">Your preferred map view</p>
                    </div>
                    <select className="p-2 border border-gray-300 rounded-md">
                      <option>Roadmap</option>
                      <option>Satellite</option>
                      <option>Terrain</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <h4 className="font-medium text-gray-900">Default Zoom Level</h4>
                      <p className="text-sm text-gray-500">Initial map zoom when searching</p>
                    </div>
                    <select className="p-2 border border-gray-300 rounded-md">
                      <option>City (10)</option>
                      <option>Street (15)</option>
                      <option>Building (20)</option>
                    </select>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfileScreen;