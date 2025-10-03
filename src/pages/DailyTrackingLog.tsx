import React, { useState, useEffect } from 'react';
// import { useTranslation } from 'react-i18next'; // Commented out for now
import { Calendar, Camera, Plus, TrendingUp, AlertCircle, CheckCircle, BarChart3, CloudRain, Droplets, Sun } from 'lucide-react';
import communityService, { DailyLog } from '../services/communityService';

const DailyTrackingLog: React.FC = () => {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentFarmerId] = useState('1'); // In real app, get from auth context

  // Form state
  const [formData, setFormData] = useState({
    cropType: '',
    activities: {
      watering: false,
      fertilizer: '',
      pesticide: '',
      harvesting: false,
      planting: false,
      weeding: false,
      other: ''
    },
    weather: {
      temperature: 25,
      humidity: 60,
      rainfall: 0,
      condition: 'sunny'
    },
    cropHealth: {
      overall: 'good' as 'excellent' | 'good' | 'fair' | 'poor' | 'critical',
      leafColor: 'green',
      growth: 'normal',
      diseases: [] as string[],
      pests: [] as string[]
    },
    notes: '',
    hindiNotes: ''
  });

  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  useEffect(() => {
    loadDailyLogs();
  }, []);

  const loadDailyLogs = async () => {
    setIsLoading(true);
    try {
      const farmerLogs = await communityService.getDailyLogs(currentFarmerId, 30);
      setLogs(farmerLogs);
    } catch (error) {
      console.error('Error loading daily logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files).slice(0, 5 - selectedImages.length);
      setSelectedImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Convert images to base64 URLs (in real app, upload to cloud storage)
      const imageUrls = await Promise.all(
        selectedImages.map(async (file) => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
          });
        })
      );

      const logEntry = {
        farmerId: currentFarmerId,
        date: new Date(),
        cropType: formData.cropType,
        activities: formData.activities,
        weather: formData.weather,
        cropHealth: formData.cropHealth,
        images: imageUrls,
        notes: formData.notes,
        hindiNotes: formData.hindiNotes
      };

      await communityService.addDailyLog(logEntry);
      await loadDailyLogs();
      
      // Reset form
      setShowAddForm(false);
      setFormData({
        cropType: '',
        activities: {
          watering: false,
          fertilizer: '',
          pesticide: '',
          harvesting: false,
          planting: false,
          weeding: false,
          other: ''
        },
        weather: {
          temperature: 25,
          humidity: 60,
          rainfall: 0,
          condition: 'sunny'
        },
        cropHealth: {
          overall: 'good',
          leafColor: 'green',
          growth: 'normal',
          diseases: [],
          pests: []
        },
        notes: '',
        hindiNotes: ''
      });
      setSelectedImages([]);
    } catch (error) {
      console.error('Error saving daily log:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-700 bg-green-100';
      case 'good': return 'text-green-600 bg-green-50';
      case 'fair': return 'text-yellow-600 bg-yellow-50';
      case 'poor': return 'text-orange-600 bg-orange-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return <Sun className="w-5 h-5 text-yellow-500" />;
      case 'cloudy': return <CloudRain className="w-5 h-5 text-gray-500" />;
      case 'rainy': return <CloudRain className="w-5 h-5 text-blue-500" />;
      default: return <Sun className="w-5 h-5 text-yellow-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Calendar className="text-green-600 mr-3 h-8 w-8" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Daily Tracking Log
                </h1>
                <p className="text-gray-600">दैनिक ट्रैकिंग लॉग</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Entry
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total Logs</p>
                  <p className="text-2xl font-bold text-blue-800">{logs.length}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Healthy Days</p>
                  <p className="text-2xl font-bold text-green-800">
                    {logs.filter(log => log.cropHealth.overall === 'excellent' || log.cropHealth.overall === 'good').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">Issues Detected</p>
                  <p className="text-2xl font-bold text-orange-800">
                    {logs.filter(log => log.cropHealth.diseases.length > 0 || log.cropHealth.pests.length > 0).length}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">AI Insights</p>
                  <p className="text-2xl font-bold text-purple-800">
                    {logs.reduce((sum, log) => sum + log.aiInsights.length, 0)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Add Entry Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Add Daily Log Entry</h2>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Crop Type / फसल का प्रकार
                      </label>
                      <select
                        value={formData.cropType}
                        onChange={(e) => setFormData({...formData, cropType: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Crop</option>
                        <option value="rice">Rice (धान)</option>
                        <option value="wheat">Wheat (गेहूं)</option>
                        <option value="cotton">Cotton (कपास)</option>
                        <option value="tomato">Tomato (टमाटर)</option>
                        <option value="potato">Potato (आलू)</option>
                        <option value="onion">Onion (प्याज)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Overall Health / समग्र स्वास्थ्य
                      </label>
                      <select
                        value={formData.cropHealth.overall}
                        onChange={(e) => setFormData({
                          ...formData,
                          cropHealth: {...formData.cropHealth, overall: e.target.value as any}
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="excellent">Excellent (उत्कृष्ट)</option>
                        <option value="good">Good (अच्छा)</option>
                        <option value="fair">Fair (ठीक)</option>
                        <option value="poor">Poor (खराब)</option>
                        <option value="critical">Critical (गंभीर)</option>
                      </select>
                    </div>
                  </div>

                  {/* Activities */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Today's Activities / आज की गतिविधियां</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="watering"
                          checked={formData.activities.watering}
                          onChange={(e) => setFormData({
                            ...formData,
                            activities: {...formData.activities, watering: e.target.checked}
                          })}
                          className="mr-2"
                        />
                        <label htmlFor="watering">Watering / पानी देना</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="harvesting"
                          checked={formData.activities.harvesting}
                          onChange={(e) => setFormData({
                            ...formData,
                            activities: {...formData.activities, harvesting: e.target.checked}
                          })}
                          className="mr-2"
                        />
                        <label htmlFor="harvesting">Harvesting / कटाई</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="planting"
                          checked={formData.activities.planting}
                          onChange={(e) => setFormData({
                            ...formData,
                            activities: {...formData.activities, planting: e.target.checked}
                          })}
                          className="mr-2"
                        />
                        <label htmlFor="planting">Planting / रोपण</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="weeding"
                          checked={formData.activities.weeding}
                          onChange={(e) => setFormData({
                            ...formData,
                            activities: {...formData.activities, weeding: e.target.checked}
                          })}
                          className="mr-2"
                        />
                        <label htmlFor="weeding">Weeding / निराई</label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fertilizer Used / उपयोग की गई खाद
                        </label>
                        <input
                          type="text"
                          value={formData.activities.fertilizer}
                          onChange={(e) => setFormData({
                            ...formData,
                            activities: {...formData.activities, fertilizer: e.target.value}
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="e.g., Urea 25kg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pesticide Applied / लगाया गया कीटनाशक
                        </label>
                        <input
                          type="text"
                          value={formData.activities.pesticide}
                          onChange={(e) => setFormData({
                            ...formData,
                            activities: {...formData.activities, pesticide: e.target.value}
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="e.g., Neem oil spray"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Weather */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Weather Conditions / मौसम की स्थिति</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Temperature (°C) / तापमान
                        </label>
                        <input
                          type="number"
                          value={formData.weather.temperature}
                          onChange={(e) => setFormData({
                            ...formData,
                            weather: {...formData.weather, temperature: Number(e.target.value)}
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Humidity (%) / आर्द्रता
                        </label>
                        <input
                          type="number"
                          value={formData.weather.humidity}
                          onChange={(e) => setFormData({
                            ...formData,
                            weather: {...formData.weather, humidity: Number(e.target.value)}
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rainfall (mm) / वर्षा
                        </label>
                        <input
                          type="number"
                          value={formData.weather.rainfall}
                          onChange={(e) => setFormData({
                            ...formData,
                            weather: {...formData.weather, rainfall: Number(e.target.value)}
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Condition / स्थिति
                        </label>
                        <select
                          value={formData.weather.condition}
                          onChange={(e) => setFormData({
                            ...formData,
                            weather: {...formData.weather, condition: e.target.value}
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="sunny">Sunny (धूप)</option>
                          <option value="cloudy">Cloudy (बादल)</option>
                          <option value="rainy">Rainy (बारिश)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Images */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Photos / फोटो अपलोड करें
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="imageUpload"
                      />
                      <label htmlFor="imageUpload" className="cursor-pointer">
                        <Camera className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                        <p className="text-gray-600">Click to upload crop photos</p>
                        <p className="text-sm text-gray-500">फसल की फोटो अपलोड करने के लिए क्लिक करें</p>
                      </label>
                    </div>
                    
                    {selectedImages.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {selectedImages.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes / अतिरिक्त टिप्पणियां
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Any observations, concerns, or plans for tomorrow..."
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {isLoading ? 'Saving...' : 'Save Entry'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Daily Logs List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No logs yet</h3>
              <p className="text-gray-600 mb-4">Start tracking your daily farming activities</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Add First Entry
              </button>
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-green-100 p-3 rounded-full">
                      <Calendar className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">
                        {log.date.toLocaleDateString('en-IN')} - {log.cropType}
                      </h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthColor(log.cropHealth.overall)}`}>
                          {log.cropHealth.overall}
                        </span>
                        <div className="flex items-center gap-1">
                          {getWeatherIcon(log.weather.condition)}
                          <span className="text-sm text-gray-600">
                            {log.weather.temperature}°C, {log.weather.humidity}% humidity
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Activities */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Activities</h4>
                    <div className="space-y-1 text-sm">
                      {log.activities.watering && <div className="flex items-center gap-2"><Droplets className="w-4 h-4 text-blue-500" /> Watering</div>}
                      {log.activities.fertilizer && <div>Fertilizer: {log.activities.fertilizer}</div>}
                      {log.activities.pesticide && <div>Pesticide: {log.activities.pesticide}</div>}
                      {log.activities.harvesting && <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Harvesting</div>}
                      {log.activities.planting && <div>Planting</div>}
                      {log.activities.weeding && <div>Weeding</div>}
                    </div>
                  </div>

                  {/* Health Issues */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Health Status</h4>
                    {log.cropHealth.diseases.length > 0 && (
                      <div className="text-sm">
                        <strong className="text-red-600">Diseases:</strong>
                        <ul className="list-disc list-inside ml-2">
                          {log.cropHealth.diseases.map((disease, index) => (
                            <li key={index}>{disease}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {log.cropHealth.pests.length > 0 && (
                      <div className="text-sm mt-2">
                        <strong className="text-orange-600">Pests:</strong>
                        <ul className="list-disc list-inside ml-2">
                          {log.cropHealth.pests.map((pest, index) => (
                            <li key={index}>{pest}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="text-sm text-gray-600 mt-2">
                      Growth: {log.cropHealth.growth}, Leaf Color: {log.cropHealth.leafColor}
                    </div>
                  </div>

                  {/* AI Insights */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">AI Insights</h4>
                    <div className="space-y-1 text-sm">
                      {log.aiInsights.slice(0, 3).map((insight, index) => (
                        <div key={index} className="text-blue-600">{insight}</div>
                      ))}
                    </div>
                    {log.nextActions.length > 0 && (
                      <div className="mt-2">
                        <strong className="text-green-600 text-sm">Next Actions:</strong>
                        <ul className="list-disc list-inside ml-2 text-xs text-gray-600">
                          {log.nextActions.slice(0, 2).map((action, index) => (
                            <li key={index}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Images */}
                {log.images.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Photos</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {log.images.slice(0, 4).map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Log photo ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {log.notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-1">Notes</h4>
                    <p className="text-sm text-gray-700">{log.notes}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyTrackingLog;