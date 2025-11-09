import React, { useState } from 'react';
import { Calendar as CalendarIcon, Plus, AlertCircle, Sun, CloudRain, Sprout } from 'lucide-react';

interface CropEvent {
  id: string;
  crop: string;
  activity: string;
  date: string;
  season: 'kharif' | 'rabi' | 'zaid';
  status: 'pending' | 'completed' | 'missed';
  notes?: string;
}

const CropCalendar: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [events, setEvents] = useState<CropEvent[]>([
    {
      id: '1',
      crop: 'धान (Rice)',
      activity: 'बुवाई (Sowing)',
      date: '2025-06-15',
      season: 'kharif',
      status: 'pending'
    },
    {
      id: '2',
      crop: 'गेहूं (Wheat)',
      activity: 'कटाई (Harvesting)',
      date: '2025-04-10',
      season: 'rabi',
      status: 'completed'
    },
    {
      id: '3',
      crop: 'मक्का (Maize)',
      activity: 'खाद डालना (Fertilization)',
      date: '2025-07-20',
      season: 'kharif',
      status: 'pending'
    }
  ]);

  const months = [
    'जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
    'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
  ];

  const seasons = {
    kharif: { name: 'खरीफ (Monsoon)', icon: CloudRain, color: 'bg-blue-100 text-blue-700' },
    rabi: { name: 'रबी (Winter)', icon: Sun, color: 'bg-yellow-100 text-yellow-700' },
    zaid: { name: 'जायद (Summer)', icon: Sprout, color: 'bg-green-100 text-green-700' }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-8 h-8 text-green-600" />
              <h1 className="text-3xl font-bold text-gray-800">फसल कैलेंडर</h1>
            </div>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition">
              <Plus className="w-5 h-5" />
              नई गतिविधि
            </button>
          </div>
          <p className="text-gray-600">अपनी फसलों की बुवाई, देखभाल और कटाई की योजना बनाएं</p>
        </div>

        {/* Month Selector */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">महीना चुनें</h2>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          {/* Season Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(seasons).map(([key, season]) => {
              const Icon = season.icon;
              return (
                <div key={key} className={`${season.color} rounded-lg p-4`}>
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5" />
                    <span className="font-semibold">{season.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Events List */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">आगामी गतिविधियां</h2>
          
          <div className="space-y-4">
            {events.map((event) => {
              const season = seasons[event.season];
              const Icon = season.icon;
              
              return (
                <div
                  key={event.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-5 h-5 text-green-600" />
                        <h3 className="text-lg font-semibold text-gray-800">{event.crop}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${season.color}`}>
                          {season.name}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-2">{event.activity}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>📅 {new Date(event.date).toLocaleDateString('hi-IN')}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          event.status === 'completed' ? 'bg-green-100 text-green-700' :
                          event.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {event.status === 'completed' ? '✅ पूर्ण' :
                           event.status === 'pending' ? '⏳ लंबित' : '❌ छूटा'}
                        </span>
                      </div>
                    </div>
                    
                    <button className="text-green-600 hover:text-green-700">
                      विवरण →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {events.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">कोई गतिविधि नहीं है</p>
              <button className="mt-4 text-green-600 hover:text-green-700 font-semibold">
                + नई गतिविधि जोड़ें
              </button>
            </div>
          )}
        </div>

        {/* Tips Section */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-lg p-6 mt-6 text-white">
          <h3 className="text-xl font-semibold mb-3">💡 सुझाव</h3>
          <ul className="space-y-2">
            <li>✓ खरीफ फसल (जून-नवंबर): धान, मक्का, ज्वार, बाजरा, कपास</li>
            <li>✓ रबी फसल (नवंबर-अप्रैल): गेहूं, जौ, चना, सरसों, आलू</li>
            <li>✓ जायद फसल (मार्च-जून): तरबूज, खीरा, ककड़ी, भिंडी</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CropCalendar;
