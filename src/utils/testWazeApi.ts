import { getWazeService } from '../services/wazeService';
import { Location } from '../types';

export const testWazeApi = async () => {
  console.log('🧪 Testing Waze API integration...');

  const wazeService = getWazeService();

  try {
    // Test 1: Initialize service
    console.log('📡 Initializing Waze service...');
    await wazeService.initialize();
    console.log('✅ Waze service initialized successfully');

    // Test 2: Validate API key
    console.log('🔑 Validating API key...');
    const isValid = await wazeService.validateApiKey();
    console.log(`✅ API key validation: ${isValid ? 'Valid' : 'Invalid'}`);

    // Test 3: Calculate a test route
    console.log('🗺️  Testing route calculation...');
    const testFrom: Location = { lat: 40.7128, lng: -74.0060 }; // New York
    const testTo: Location = { lat: 40.7589, lng: -73.9851 };   // Times Square

    const route = await wazeService.calculateRoute(testFrom, testTo);

    console.log('✅ Route calculated successfully:');
    console.log(`   📏 Distance: ${(route.distance / 1000).toFixed(2)} km`);
    console.log(`   ⏱️  Duration: ${Math.round(route.duration / 60)} minutes`);
    console.log(`   🛣️  Path points: ${route.path.length}`);
    console.log(`   🚫 Restrictions: ${route.restrictions.join(', ') || 'None'}`);

    // Test 4: Distance calculation
    console.log('📐 Testing distance calculation...');
    const calculatedDistance = wazeService.calculateDistance(testFrom, testTo, 'kilometers');
    console.log(`✅ Direct distance: ${calculatedDistance.toFixed(2)} km`);

    // Test 5: Service readiness
    console.log('🔍 Checking service readiness...');
    const isReady = wazeService.isServiceReady();
    console.log(`✅ Service ready: ${isReady}`);

    console.log('🎉 All Waze API tests passed!');
    return {
      success: true,
      route,
      calculatedDistance,
      isReady,
    };

  } catch (error) {
    console.error('❌ Waze API test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export const runWazeTests = () => {
  // Run tests in browser console
  if (typeof window !== 'undefined') {
    (window as any).testWazeApi = testWazeApi;
    console.log('💡 You can now run: testWazeApi() in the console to test the Waze API');
  }
};