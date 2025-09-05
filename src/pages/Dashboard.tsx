import React from 'react';
import AiAgent from './AiAgent';
import LiveWeather from './LiveWeather';
import LiveMarketPrices from './LiveMarketPrices';
import Profile from './Profile';
import { Sprout, ListChecks, Wifi, TrendingUp, Bug, Bot } from 'lucide-react';


const guideSteps = [
  {
    title: 'अपना स्थान चुनें',
    description: 'अपने गाँव या शहर का चयन करें या "Use Current Location" बटन दबाएँ।',
    english: 'Select your village/city or use the "Use Current Location" button.',
  },
  {
    title: 'मौसम देखें',
    description: 'मौसम कार्ड में तापमान, वर्षा, और अन्य जानकारी देखें।',
    english: 'View temperature, rainfall, and other weather info in the weather card.',
  },
  {
    title: 'मंडी भाव जानें',
    description: 'Market Prices सेक्शन में ताज़ा मंडी भाव देखें।',
    english: 'Check latest market prices in the Market Prices section.',
  },
  {
    title: 'AI Agent से पूछें',
    description: 'किसी भी कृषि सवाल के लिए AI Agent से बात करें।',
    english: 'Ask any farming question to the AI Agent.',
  }
];

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-emerald-100 p-0">
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto py-10 px-4 text-center">
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="p-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg mb-2">
            <Sprout className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-green-700 mb-2">🌾 Smart Krishi Sahayak</h1>
          <h2 className="text-xl text-green-900 font-semibold mb-2">स्मार्ट कृषि सहायक</h2>
          <p className="text-lg text-green-800 mb-4">India's smartest agriculture assistant for farmers</p>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 px-4">
        <a href="/live-weather" className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center hover:bg-green-50 transition">
          <Wifi className="h-8 w-8 text-blue-500 mb-2" />
          <span className="font-bold text-green-700 mb-1">Live Weather</span>
          <span className="text-xs text-gray-500">Current weather updates</span>
        </a>
        <a href="/mandi-prices" className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center hover:bg-green-50 transition">
          <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
          <span className="font-bold text-green-700 mb-1">Mandi Prices</span>
          <span className="text-xs text-gray-500">Latest market rates</span>
        </a>
        <a href="/crop-info" className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center hover:bg-green-50 transition">
          <Sprout className="h-8 w-8 text-emerald-500 mb-2" />
          <span className="font-bold text-green-700 mb-1">Crop Info</span>
          <span className="text-xs text-gray-500">Indian crop details</span>
        </a>
        <a href="/disease-detection" className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center hover:bg-green-50 transition">
          <Bug className="h-8 w-8 text-red-500 mb-2" />
          <span className="font-bold text-green-700 mb-1">Disease Detection</span>
          <span className="text-xs text-gray-500">Detect crop diseases</span>
        </a>
        <a href="/agent" className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center hover:bg-green-50 transition sm:col-span-2 lg:col-span-4">
          <Bot className="h-8 w-8 text-purple-500 mb-2" />
          <span className="font-bold text-green-700 mb-1">AI Agent</span>
          <span className="text-xs text-gray-500">Ask farming questions</span>
        </a>
      </div>

      {/* Step-by-step Guide */}
      <div className="max-w-3xl mx-auto bg-white/80 rounded-2xl shadow-xl p-8 mb-12">
        <div className="flex items-center mb-6">
          <ListChecks className="h-8 w-8 text-green-600 mr-2" />
          <span className="text-2xl font-bold text-green-700">कृषि ऐप उपयोग गाइड</span>
        </div>
        <ol className="space-y-6">
          {guideSteps.map((step, idx) => (
            <li key={idx} className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center text-white font-bold text-lg mr-4 shadow-md">
                {idx + 1}
              </div>
              <div>
                <div className="text-lg font-semibold text-green-700 mb-1">{step.title}</div>
                <div className="text-base text-green-600 mb-1">{step.description}</div>
                <div className="text-sm text-gray-500 italic">{step.english}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default Dashboard;
