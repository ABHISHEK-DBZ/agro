import React, { useState } from 'react';
import { Sprout, Calendar, Droplets, Sun, Thermometer, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CropInfo {
  id: string;
  name: string;
  nameHindi: string;
  season: string;
  sowingMonths: string[];
  harvestMonths: string[];
  waterRequirement: string;
  soilType: string;
  climate: string;
  yield: string;
  marketPrice: string;
  description: string;
}

const CropManagement: React.FC = () => {
  const { t } = useTranslation();
  const [selectedSeason, setSelectedSeason] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const crops: CropInfo[] = [
    {
      id: '1',
      name: 'Wheat',
      nameHindi: 'गेहूं',
      season: 'Rabi',
      sowingMonths: ['November', 'December'],
      harvestMonths: ['April', 'May'],
      waterRequirement: 'Medium (450-650mm)',
      soilType: 'Loamy, Well-drained',
      climate: 'Cool, Dry',
      yield: '25-30 quintals/hectare',
      marketPrice: '₹2,100-2,300/quintal',
      description: 'Major cereal crop grown in northern India during winter season.'
    },
    {
      id: '2',
      name: 'Rice',
      nameHindi: 'चावल',
      season: 'Kharif',
      sowingMonths: ['June', 'July'],
      harvestMonths: ['October', 'November'],
      waterRequirement: 'High (1000-1200mm)',
      soilType: 'Clay, Waterlogged',
      climate: 'Hot, Humid',
      yield: '35-40 quintals/hectare',
      marketPrice: '₹3,000-3,500/quintal',
      description: 'Staple food crop requiring abundant water and warm climate.'
    },
    {
      id: '3',
      name: 'Cotton',
      nameHindi: 'कपास',
      season: 'Kharif',
      sowingMonths: ['May', 'June'],
      harvestMonths: ['October', 'November'],
      waterRequirement: 'Medium (500-800mm)',
      soilType: 'Black Cotton Soil',
      climate: 'Warm, Moderate rainfall',
      yield: '15-20 quintals/hectare',
      marketPrice: '₹5,500-6,000/quintal',
      description: 'Cash crop grown primarily for fiber production.'
    },
    {
      id: '4',
      name: 'Sugarcane',
      nameHindi: 'गन्ना',
      season: 'Both',
      sowingMonths: ['February', 'March', 'October'],
      harvestMonths: ['December', 'January'],
      waterRequirement: 'Very High (1500-2500mm)',
      soilType: 'Rich Loamy, Well-drained',
      climate: 'Hot, Humid',
      yield: '700-900 quintals/hectare',
      marketPrice: '₹320-350/quintal',
      description: 'Industrial crop used for sugar and jaggery production.'
    },
    {
      id: '5',
      name: 'Maize',
      nameHindi: 'मक्का',
      season: 'Both',
      sowingMonths: ['June', 'July', 'February'],
      harvestMonths: ['September', 'October', 'May'],
      waterRequirement: 'Medium (500-750mm)',
      soilType: 'Well-drained Loamy',
      climate: 'Warm, Moderate rainfall',
      yield: '30-35 quintals/hectare',
      marketPrice: '₹1,800-2,000/quintal',
      description: 'Versatile crop used for food, feed, and industrial purposes.'
    },
    {
      id: '6',
      name: 'Potato',
      nameHindi: 'आलू',
      season: 'Rabi',
      sowingMonths: ['October', 'November'],
      harvestMonths: ['February', 'March'],
      waterRequirement: 'Medium (400-600mm)',
      soilType: 'Sandy Loam, Well-drained',
      climate: 'Cool, Dry',
      yield: '200-250 quintals/hectare',
      marketPrice: '₹1,000-1,500/quintal',
      description: 'Important vegetable crop rich in carbohydrates.'
    }
  ];

  const filteredCrops = crops.filter(crop => {
    const matchesSearch = crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         crop.nameHindi.includes(searchTerm);
    const matchesSeason = selectedSeason === 'all' || 
                         crop.season.toLowerCase() === selectedSeason.toLowerCase() ||
                         crop.season === 'Both';
    return matchesSearch && matchesSeason;
  });

  const seasons = ['all', 'Kharif', 'Rabi'];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Crop Management</h1>
          <p className="text-gray-600 mt-2">फसल प्रबंधन - Complete guide for Indian crops</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Crop / फसल खोजें
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by crop name..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Season / मौसम
              </label>
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Seasons</option>
                <option value="kharif">Kharif (खरीफ)</option>
                <option value="rabi">Rabi (रबी)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Season Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-green-50 rounded-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center gap-2 mb-3">
              <Sun className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-green-800">Kharif Season (खरीफ)</h3>
            </div>
            <p className="text-green-700 text-sm mb-2">
              <strong>Sowing:</strong> June-July (monsoon arrival)
            </p>
            <p className="text-green-700 text-sm mb-2">
              <strong>Harvesting:</strong> September-October
            </p>
            <p className="text-green-700 text-sm">
              <strong>Crops:</strong> Rice, Cotton, Sugarcane, Maize, Jowar
            </p>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center gap-2 mb-3">
              <Thermometer className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-800">Rabi Season (रबी)</h3>
            </div>
            <p className="text-blue-700 text-sm mb-2">
              <strong>Sowing:</strong> October-December (winter)
            </p>
            <p className="text-blue-700 text-sm mb-2">
              <strong>Harvesting:</strong> April-June
            </p>
            <p className="text-blue-700 text-sm">
              <strong>Crops:</strong> Wheat, Barley, Peas, Gram, Mustard
            </p>
          </div>
        </div>

        {/* Crop Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCrops.map((crop) => (
            <div key={crop.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sprout className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{crop.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{crop.nameHindi}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  crop.season === 'Kharif' 
                    ? 'bg-green-100 text-green-800'
                    : crop.season === 'Rabi'
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {crop.season}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <span className="font-medium">Sowing:</span> {crop.sowingMonths.join(', ')}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <span className="font-medium">Harvest:</span> {crop.harvestMonths.join(', ')}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  <div>
                    <span className="font-medium">Water:</span> {crop.waterRequirement}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-brown-500" />
                  <div>
                    <span className="font-medium">Soil:</span> {crop.soilType}
                  </div>
                </div>

                <div className="border-t pt-3 mt-3">
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Yield:</span> {crop.yield}
                  </div>
                  <div className="text-sm text-green-600 font-medium">
                    <span className="font-medium">Price:</span> {crop.marketPrice}
                  </div>
                </div>

                <p className="text-xs text-gray-500 border-t pt-2">
                  {crop.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* No results */}
        {filteredCrops.length === 0 && (
          <div className="text-center py-12">
            <Sprout className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No crops found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}

        {/* Farming Tips */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Farming Tips / कृषि सुझाव
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-medium text-yellow-800 mb-2">Soil Testing</h3>
              <p className="text-sm text-yellow-700">
                Test your soil pH and nutrients before sowing for better yield.
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Water Management</h3>
              <p className="text-sm text-blue-700">
                Use drip irrigation to save water and improve crop quality.
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">Crop Rotation</h3>
              <p className="text-sm text-green-700">
                Rotate crops to maintain soil fertility and reduce pests.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropManagement;