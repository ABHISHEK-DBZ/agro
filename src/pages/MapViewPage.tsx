import React, { useState, useEffect } from 'react';
import { MapPin, Users, AlertCircle, TrendingUp, Navigation, Filter } from 'lucide-react';

const MapViewPage: React.FC = () => {
  const [mapCenter, setMapCenter] = useState({ lat: 28.6139, lng: 77.2090 }); // Delhi default
  const [radius, setRadius] = useState(5); // km
  const [filterType, setFilterType] = useState<'all' | 'farmers' | 'posts' | 'groups' | 'alerts'>('all');

  // Mock data for demonstration
  const markers = [
    { id: 1, type: 'farmer', lat: 28.6139, lng: 77.2090, name: 'Farmer 1', online: true },
    { id: 2, type: 'post', lat: 28.6239, lng: 77.2190, name: 'Wheat Disease Help', urgency: 'high' },
    { id: 3, type: 'group', lat: 28.6039, lng: 77.1990, name: 'Wheat Farmers Delhi', members: 45 },
    { id: 4, type: 'alert', lat: 28.6339, lng: 77.2290, name: 'Pest Alert', severity: 'high' },
  ];

  const getMarkerColor = (type: string) => {
    switch (type) {
      case 'farmer': return 'bg-green-500';
      case 'post': return 'bg-blue-500';
      case 'group': return 'bg-purple-500';
      case 'alert': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getMarkerIcon = (type: string) => {
    switch (type) {
      case 'farmer': return '👨‍🌾';
      case 'post': return '💬';
      case 'group': return '👥';
      case 'alert': return '🚨';
      default: return '📍';
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          alert('Location updated! 📍');
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Could not get your location. Please enable location services.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-6 shadow-lg z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <MapPin className="w-8 h-8" />
                Map View
              </h1>
              <p className="text-purple-100 mt-1">
                Discover farmers, posts, and groups near you
              </p>
            </div>
            <button
              onClick={handleGetCurrentLocation}
              className="bg-white text-purple-600 px-6 py-3 rounded-full font-semibold hover:bg-purple-50 transition-all flex items-center gap-2 shadow-lg"
            >
              <Navigation className="w-5 h-5" />
              My Location
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-semibold text-gray-700">Show:</span>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  filterType === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('farmers')}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  filterType === 'farmers'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                👨‍🌾 Farmers
              </button>
              <button
                onClick={() => setFilterType('posts')}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  filterType === 'posts'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                💬 Posts
              </button>
              <button
                onClick={() => setFilterType('groups')}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  filterType === 'groups'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                👥 Groups
              </button>
              <button
                onClick={() => setFilterType('alerts')}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  filterType === 'alerts'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🚨 Alerts
              </button>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-gray-600">Radius:</span>
              <select
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
              >
                <option value={2}>2 km</option>
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={25}>25 km</option>
                <option value={50}>50 km</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        {/* Placeholder Map */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
          <div className="text-center p-8">
            <MapPin className="w-20 h-20 text-purple-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Interactive Map Coming Soon!</h2>
            <p className="text-gray-600 mb-6 max-w-md">
              Full Google Maps / Mapbox integration will show:
              <br />• Nearby farmers with real-time locations
              <br />• Community posts pinned to locations
              <br />• Farmer groups in your area
              <br />• Emergency pest alerts on map
              <br />• Cluster markers for dense areas
              <br />• Interactive info windows
            </p>
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
              <h3 className="font-bold text-lg mb-4">Sample Markers (Demo Data)</h3>
              <div className="grid grid-cols-2 gap-4">
                {markers.map((marker) => (
                  <div
                    key={marker.id}
                    className={`p-4 rounded-lg border-2 ${
                      filterType === 'all' || filterType === marker.type
                        ? 'border-purple-300 bg-purple-50'
                        : 'border-gray-200 bg-gray-50 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">{getMarkerIcon(marker.type)}</span>
                      <div>
                        <p className="font-semibold text-gray-800">{marker.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{marker.type}</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600">
                      📍 {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex gap-4 justify-center">
              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <div className="text-3xl mb-2">👨‍🌾</div>
                <div className="font-bold text-2xl text-green-600">24</div>
                <div className="text-sm text-gray-600">Farmers Nearby</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <div className="text-3xl mb-2">💬</div>
                <div className="font-bold text-2xl text-blue-600">12</div>
                <div className="text-sm text-gray-600">Recent Posts</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <div className="text-3xl mb-2">👥</div>
                <div className="font-bold text-2xl text-purple-600">8</div>
                <div className="text-sm text-gray-600">Active Groups</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <div className="text-3xl mb-2">🚨</div>
                <div className="font-bold text-2xl text-red-600">3</div>
                <div className="text-sm text-gray-600">Active Alerts</div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 z-10">
          <h3 className="font-bold text-sm mb-3">Legend</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-xl">👨‍🌾</span>
              <span className="text-gray-700">Farmers</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">💬</span>
              <span className="text-gray-700">Community Posts</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">👥</span>
              <span className="text-gray-700">Farmer Groups</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🚨</span>
              <span className="text-gray-700">Pest Alerts</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-10">
          <div className="flex items-center gap-2 text-purple-600 mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="font-bold">Within {radius} km</span>
          </div>
          <div className="text-sm text-gray-600">
            Real-time location tracking
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapViewPage;
