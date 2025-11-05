import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ListChecks, Wifi, TrendingUp, Bug, Bot, Settings } from 'lucide-react';


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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 p-0">
      {/* Enhanced Hero Section */}
      <div className="max-w-5xl mx-auto py-10 px-4 text-center">
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="p-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg mb-2">
            <Sprout className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold high-contrast-text mb-2">🌾 Smart Krishi Sahayak</h1>
          <h2 className="text-xl text-contrast font-semibold mb-2">स्मार्ट कृषि सहायक</h2>
          <p className="text-lg text-contrast-light mb-4 font-medium">India's smartest agriculture assistant for farmers</p>
        </div>
      </div>

      {/* Enhanced Quick Access Cards */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 px-4">
        <Link to="/weather" className="enhanced-card p-6 flex flex-col items-center hover:bg-blue-50 smooth-transition group">
          <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg mb-3 group-hover:scale-110 smooth-transition">
            <Wifi className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-contrast mb-1">Live Weather</span>
          <span className="text-xs text-contrast-light text-center">Current weather updates</span>
        </Link>
        <Link to="/market-prices" className="enhanced-card p-6 flex flex-col items-center hover:bg-green-50 smooth-transition group">
          <div className="p-3 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg mb-3 group-hover:scale-110 smooth-transition">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-contrast mb-1">Market Prices</span>
          <span className="text-xs text-contrast-light text-center">Latest market rates</span>
        </Link>
        <Link to="/crop-management" className="enhanced-card p-6 flex flex-col items-center hover:bg-emerald-50 smooth-transition group">
          <div className="p-3 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg mb-3 group-hover:scale-110 smooth-transition">
            <Sprout className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-contrast mb-1">Crop Info</span>
          <span className="text-xs text-contrast-light text-center">Indian crop details</span>
        </Link>
        <Link to="/disease-detection" className="enhanced-card p-6 flex flex-col items-center hover:bg-red-50 smooth-transition group">
          <div className="p-3 rounded-full bg-gradient-to-br from-red-500 to-pink-600 shadow-lg mb-3 group-hover:scale-110 smooth-transition">
            <Bug className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-contrast mb-1">Disease Detection</span>
          <span className="text-xs text-gray-500">Detect crop diseases</span>
        </Link>
        <Link to="/settings" className="enhanced-card p-6 flex flex-col items-center hover:bg-gray-50 smooth-transition group">
          <div className="p-3 rounded-full bg-gradient-to-br from-gray-500 to-slate-600 shadow-lg mb-3 group-hover:scale-110 smooth-transition">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-contrast mb-1">Settings</span>
          <span className="text-xs text-contrast-light text-center">App preferences</span>
        </Link>
        <Link to="/ai-agent" className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center hover:bg-green-50 transition sm:col-span-2 lg:col-span-3">
          <Bot className="h-8 w-8 text-purple-500 mb-2" />
          <span className="font-bold text-green-700 mb-1">AI Agent</span>
          <span className="text-xs text-gray-500">Ask farming questions</span>
        </Link>
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
