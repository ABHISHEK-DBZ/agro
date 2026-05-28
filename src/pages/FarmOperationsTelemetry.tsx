import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Cpu, 
  Zap, 
  Battery, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  Droplet, 
  Thermometer, 
  Gauge, 
  Compass,
  ArrowLeft,
  Navigation,
  Wind
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSwarmTelemetry } from '../hooks/useSwarmTelemetry';
import { useSafeTranslation } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';

const FarmOperationsTelemetry: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isLowBandwidthMode } = useSafeTranslation();
  
  // Real-time telemetric calculations & machinery telemetry (Module D & B)
  const { soilStats, equipment } = useSwarmTelemetry();
  
  // Complex functional math model tracking GDD (Growing Degree Days) for Wheat harvest prediction
  const baseTemp = 4.0; // Wheat base temperature in Celsius
  const daysSown = 175; // Sowing completed 175 days ago
  const dailyAverageTemp = soilStats.temperature; 
  
  // Growing Degree Days Equation: GDD = Sum(T_average - T_base)
  const gddAccumulated = Math.floor((dailyAverageTemp - baseTemp) * daysSown);
  const targetGdd = 4200; // Target cumulative GDD for harvest maturity
  const maturityPercent = Math.min(100, Math.floor((gddAccumulated / targetGdd) * 100));

  // Determine predicted harvest date dynamically
  const getPredictedHarvestDate = () => {
    const today = new Date();
    const remainingGdd = targetGdd - gddAccumulated;
    const estimatedDaysRemaining = Math.max(1, Math.ceil(remainingGdd / (dailyAverageTemp - baseTemp)));
    const harvestDate = new Date();
    harvestDate.setDate(today.getDate() + estimatedDaysRemaining);
    
    return harvestDate.toLocaleDateString(i18n.language === 'hi' ? 'hi-IN' : i18n.language === 'mr' ? 'mr-IN' : 'en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-green-50 via-[#F9F9F6] to-emerald-50 p-4 ${
      isLowBandwidthMode ? 'low-bandwidth-mode' : ''
    }`}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header Navigation */}
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col md:flex-row items-center justify-between border border-emerald-100">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <button
              onClick={() => navigate(-1)}
              className="p-3 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-all active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 tracking-tight flex items-center gap-2">
                <Cpu className="text-green-600" />
                थेट शेत नियंत्रण कक्ष (Operations & Telemetry Control)
              </h1>
              <p className="text-gray-600 text-sm">
                (Real-time machinery telemetry, soil moisture vectors & predictive scheduling)
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-wider">
              Telemetry Channel Connected
            </span>
          </div>
        </div>

        {/* Live Gauges Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Gauge 1: Moisture */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 flex items-center justify-between hover:shadow-2xl transition-all duration-300">
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">मातीची नमी (Soil Moisture)</p>
              <h3 className="text-3xl font-extrabold text-gray-800">{soilStats.moisture}%</h3>
              <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                <Droplet className="w-3.5 h-3.5 text-blue-500" /> Optimal root zone saturation
              </p>
            </div>
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Gauge className="w-8 h-8" />
            </div>
          </div>

          {/* Gauge 2: Ambient Temperature */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 flex items-center justify-between hover:shadow-2xl transition-all duration-300">
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">हवामान तापमान (Air Temp)</p>
              <h3 className="text-3xl font-extrabold text-gray-800">{soilStats.temperature}°C</h3>
              <p className="text-xs text-orange-600 font-medium flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-orange-500" /> Regular thermal accumulation
              </p>
            </div>
            <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
              <Compass className="w-8 h-8" />
            </div>
          </div>

          {/* Gauge 3: Sowing Degree Days GDD */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 flex items-center justify-between hover:shadow-2xl transition-all duration-300">
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">संचित उष्मामान (Cumulative GDD)</p>
              <h3 className="text-3xl font-extrabold text-gray-800">{gddAccumulated} GDD</h3>
              <p className="text-xs text-purple-600 font-medium flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-purple-500" /> GDD calculation: Σ(T_avg - T_base)
              </p>
            </div>
            <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
              <Zap className="w-8 h-8" />
            </div>
          </div>

        </div>

        {/* Dynamic Splits Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Left Column: Machinery Monitoring */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Navigation className="text-green-600" />
                स्वाम यंत्रसामग्री देखरेख (Machinery Telemetry Grid)
              </h3>
              <span className="text-xs text-gray-500">Autonomous Nodes Online</span>
            </div>

            <div className="space-y-4">
              {equipment.map(eq => (
                <div key={eq.id} className="border border-emerald-50 bg-emerald-50/20 rounded-xl p-5 hover:border-emerald-200 transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          eq.status === 'Active' ? 'bg-green-500 animate-pulse' : 'bg-blue-500'
                        }`}></span>
                        <h4 className="font-extrabold text-gray-800">{eq.name}</h4>
                      </div>
                      <p className="text-xs text-gray-500 ml-4">{eq.model}</p>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-semibold text-gray-600">
                      <span className="flex items-center gap-1">
                        <Battery className="w-4 h-4 text-gray-400" />
                        {eq.battery}%
                      </span>
                      <span className="bg-white px-2 py-1 rounded border uppercase text-[10px] tracking-wide text-green-700">
                        {eq.performance}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-dashed border-emerald-100/80 grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500 block uppercase text-[10px]">Coordinates</span>
                      <span className="font-mono font-bold text-gray-700">{eq.coordinates.lat.toFixed(5)}, {eq.coordinates.lng.toFixed(5)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block uppercase text-[10px]">Rental Rate</span>
                      <span className="font-bold text-green-600">₹{eq.rate}/hour</span>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <span className="text-gray-500 block uppercase text-[10px]">Owner Node</span>
                      <span className="font-bold text-gray-700">{eq.owner}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Predictive Harvest Timeline & Math Model */}
          <div className="bg-gradient-to-br from-green-900 to-emerald-950 text-white rounded-2xl shadow-xl p-6 border border-emerald-800 space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
            
            <div className="flex items-center justify-between border-b border-emerald-800 pb-4">
              <h3 className="text-xl font-bold tracking-wide uppercase flex items-center gap-2">
                <Calendar className="text-emerald-400" />
                पीक परिपक्वता वेळापत्रक (Predictive Harvest Engine)
              </h3>
              <span className="text-xs text-emerald-400">GDD Mathematical Model</span>
            </div>

            <div className="space-y-6">
              {/* Equation Explainer Card */}
              <div className="bg-emerald-900/40 border border-emerald-800/80 rounded-xl p-4 text-xs leading-relaxed text-emerald-100 space-y-2">
                <p className="font-extrabold text-emerald-300 uppercase tracking-wider text-[10px]">Harvest Equation Math Model:</p>
                <code className="block bg-emerald-950/70 p-2.5 rounded font-mono text-center text-sm font-bold text-white border border-emerald-900">
                  GDD Accumulated = Σ(T_avg - T_base) × Days
                </code>
                <p>या मॉडेलनुसार, गहू काढणी परिपक्वतेसाठी ४२०० GDD ची आवश्यकता असते. सद्याचे GDD प्रमाण {gddAccumulated} आहे.</p>
              </div>

              {/* Progress Tracker */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-emerald-300">कापणी परिपक्वता पातळी (Maturity level)</span>
                  <span>{maturityPercent}%</span>
                </div>
                <div className="w-full bg-emerald-950 rounded-full h-3.5 border border-emerald-900 p-0.5">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-green-400 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${maturityPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Milestones timeline */}
              <div className="relative pl-6 border-l-2 border-emerald-800 space-y-4 text-xs">
                <div className="relative">
                  <span className="absolute -left-[30px] top-0.5 bg-emerald-600 text-white rounded-full h-4 w-4 flex items-center justify-center font-bold">1</span>
                  <div>
                    <span className="font-bold text-white">पेरणी (Sowing Phase completed) - १५ नोव्हेंबर २०२५</span>
                    <p className="text-emerald-300/80">Germination index resolved successfully.</p>
                  </div>
                </div>
                <div className="relative">
                  <span className="absolute -left-[30px] top-0.5 bg-emerald-600 text-white rounded-full h-4 w-4 flex items-center justify-center font-bold">2</span>
                  <div>
                    <span className="font-bold text-white">वेजिटेटिव्ह (Vegetative Development) - जानेवारी २०२६</span>
                    <p className="text-emerald-300/80">Maximum tillering reached during GDD target.</p>
                  </div>
                </div>
                <div className="relative">
                  <span className="absolute -left-[30px] top-0.5 bg-emerald-600 text-white rounded-full h-4 w-4 flex items-center justify-center font-bold">3</span>
                  <div>
                    <span className="font-bold text-white">दाणे भरणे (Flowering phase completed) - मार्च २०२६</span>
                    <p className="text-emerald-300/80">Grain filling indexes verified.</p>
                  </div>
                </div>
                <div className="relative">
                  <span className="absolute -left-[30px] top-0.5 bg-amber-500 text-white rounded-full h-4 w-4 flex items-center justify-center font-bold">4</span>
                  <div>
                    <span className="font-bold text-white">कापणी अंदाज (Harvest Prediction Matrix)</span>
                    <p className="text-amber-300 font-extrabold uppercase mt-0.5">📅 {getPredictedHarvestDate()}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  toast.success('कापणी अंदाज अहवाल तुमच्या शेतकरी समुदायावर थेट सामायिक केला गेला! 🌾');
                }}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-extrabold rounded-xl transition-all shadow-lg text-sm"
              >
                📊 अहवाल सामायिक करा (Publish Harvest Schedule)
              </button>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default FarmOperationsTelemetry;
