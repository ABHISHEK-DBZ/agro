import React, { useState } from 'react';
import { Droplet, TrendingUp, AlertTriangle, CheckCircle, MapPin, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { pageVariants, cardVariants } from '../utils/animations';

interface SoilTest {
  id: string;
  location: string;
  date: string;
  ph: number;
  nitrogen: 'low' | 'medium' | 'high';
  phosphorus: 'low' | 'medium' | 'high';
  potassium: 'low' | 'medium' | 'high';
  organicCarbon: number;
  recommendations: string[];
}

const SoilTesting: React.FC = () => {
  const [tests, setTests] = useState<SoilTest[]>([
    {
      id: '1',
      location: 'खेत A, गांव - रामपुर',
      date: '2025-10-15',
      ph: 6.8,
      nitrogen: 'medium',
      phosphorus: 'low',
      potassium: 'high',
      organicCarbon: 0.65,
      recommendations: [
        'फास्फोरस युक्त उर्वरक डालें',
        'जैविक खाद का प्रयोग बढ़ाएं',
        'हरी खाद (Green manure) का उपयोग करें'
      ]
    }
  ]);

  const getNutrientColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-green-600 bg-green-100';
    }
  };

  const getNutrientIcon = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low':
        return <AlertTriangle className="w-5 h-5" />;
      case 'medium':
        return <TrendingUp className="w-5 h-5" />;
      case 'high':
        return <CheckCircle className="w-5 h-5" />;
    }
  };

  const getNutrientLabel = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low':
        return 'कम';
      case 'medium':
        return 'मध्यम';
      case 'high':
        return 'उच्च';
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-8 px-4"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Droplet className="w-8 h-8 text-amber-600" />
              <h1 className="text-3xl font-bold text-gray-800">मृदा परीक्षण</h1>
            </div>
            <motion.button 
              className="bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-amber-700 transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Upload className="w-5 h-5" />
              रिपोर्ट अपलोड करें
            </motion.button>
          </div>
          <p className="text-gray-600">अपनी मिट्टी का विश्लेषण करें और बेहतर फसल के लिए सुझाव पाएं</p>
        </motion.div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">pH मान</h3>
            <p className="text-3xl font-bold">6.5 - 7.5</p>
            <p className="text-blue-100 text-sm mt-2">आदर्श रेंज</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">परीक्षण केंद्र</h3>
            <p className="text-3xl font-bold">500+</p>
            <p className="text-green-100 text-sm mt-2">पूरे भारत में</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">रिपोर्ट समय</h3>
            <p className="text-3xl font-bold">3-7 दिन</p>
            <p className="text-purple-100 text-sm mt-2">औसत समय</p>
          </div>
        </div>

        {/* Test Results */}
        <div className="space-y-6">
          {tests.map((test) => (
            <div key={test.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-6 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5" />
                  <h2 className="text-xl font-semibold">{test.location}</h2>
                </div>
                <p className="text-amber-100">परीक्षण तिथि: {new Date(test.date).toLocaleDateString('hi-IN')}</p>
              </div>

              <div className="p-6">
                {/* pH Value */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-700">pH मान</span>
                    <span className="text-2xl font-bold text-blue-600">{test.ph}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        test.ph >= 6.5 && test.ph <= 7.5
                          ? 'bg-green-500'
                          : test.ph < 6.5
                          ? 'bg-red-500'
                          : 'bg-yellow-500'
                      }`}
                      style={{ width: `${(test.ph / 14) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>अम्लीय (0)</span>
                    <span>तटस्थ (7)</span>
                    <span>क्षारीय (14)</span>
                  </div>
                </div>

                {/* Nutrients */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* Nitrogen */}
                  <div className={`rounded-lg p-4 ${getNutrientColor(test.nitrogen)}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {getNutrientIcon(test.nitrogen)}
                      <span className="font-semibold">नाइट्रोजन (N)</span>
                    </div>
                    <div className="text-2xl font-bold">{getNutrientLabel(test.nitrogen)}</div>
                  </div>

                  {/* Phosphorus */}
                  <div className={`rounded-lg p-4 ${getNutrientColor(test.phosphorus)}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {getNutrientIcon(test.phosphorus)}
                      <span className="font-semibold">फास्फोरस (P)</span>
                    </div>
                    <div className="text-2xl font-bold">{getNutrientLabel(test.phosphorus)}</div>
                  </div>

                  {/* Potassium */}
                  <div className={`rounded-lg p-4 ${getNutrientColor(test.potassium)}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {getNutrientIcon(test.potassium)}
                      <span className="font-semibold">पोटैशियम (K)</span>
                    </div>
                    <div className="text-2xl font-bold">{getNutrientLabel(test.potassium)}</div>
                  </div>
                </div>

                {/* Organic Carbon */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-green-900">जैविक कार्बन</span>
                    <span className="text-2xl font-bold text-green-600">{test.organicCarbon}%</span>
                  </div>
                  <p className="text-sm text-green-700 mt-2">
                    {test.organicCarbon >= 0.5 ? '✓ अच्छा स्तर' : '⚠ स्तर बढ़ाने की जरूरत'}
                  </p>
                </div>

                {/* Recommendations */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    सुझाव
                  </h3>
                  <ul className="space-y-2">
                    {test.recommendations.map((rec, index) => (
                      <li key={index} className="text-blue-800 flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Testing Centers */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">निकटतम परीक्षण केंद्र</h2>
          <div className="space-y-3">
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">कृषि विज्ञान केंद्र - रामपुर</h3>
                  <p className="text-gray-600 text-sm mt-1">📍 मुख्य मार्ग, रामपुर - 244901</p>
                  <p className="text-gray-600 text-sm">📞 0595-2345678</p>
                </div>
                <button className="text-amber-600 hover:text-amber-700 font-semibold">
                  दिशा →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl shadow-lg p-6 mt-6 text-white">
          <h3 className="text-xl font-semibold mb-3">💡 जरूरी जानकारी</h3>
          <ul className="space-y-2">
            <li>✓ हर 2-3 साल में मृदा परीक्षण कराएं</li>
            <li>✓ फसल बोने से पहले परीक्षण कराना सबसे अच्छा है</li>
            <li>✓ मिट्टी के नमूने 6-8 इंच गहराई से लें</li>
            <li>✓ सरकारी प्रयोगशालाओं में मुफ्त परीक्षण उपलब्ध</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default SoilTesting;
