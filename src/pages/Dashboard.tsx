import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sprout, 
  Wifi, 
  TrendingUp, 
  Bug, 
  Bot, 
  Settings, 
  Calendar, 
  Cpu, 
  Users, 
  Shield, 
  Activity, 
  Layers, 
  Battery, 
  CloudRain, 
  Gauge, 
  MapPin, 
  CornerDownRight, 
  IndianRupee,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useSafeTranslation } from '../contexts/LanguageContext';
import { useSwarmTelemetry } from '../hooks/useSwarmTelemetry';
import { pageVariants, cardVariants, staggerContainerVariants } from '../utils/animations';

const dashboardTranslations: Record<string, Record<string, string>> = {
  en: {
    welcome: "Enterprise Agri-Tech Platform",
    subtitle: "Smart Krishi Sahayak - Autonomous Swarm & Telemetry Control",
    description: "Sensing soil biochemistry, autonomous machinery coordinates, and weather vectors in real-time.",
    weatherAlert: "🔴 Weather Alert: Heavy precipitation forecasted in your micro-region.",
    soilAlert: "🟢 Soil Health: pH 6.5 & NPK levels optimized for sowing.",
    quickActions: "Operations & Telemetry Control",
    liveWeather: "Live Micro-Weather",
    liveWeatherDesc: "Real-time weather station streams",
    marketPrices: "Mandi Intelligence",
    marketPricesDesc: "Live commodity price charts & arbitrage",
    cropManagement: "Crop Lifecycle Control",
    cropManagementDesc: "Sowing timelines & botanical guides",
    diseaseDetection: "AI Plant Diagnostics",
    diseaseDetectionDesc: "Spectral disease identification scanner",
    settings: "System Calibration",
    settingsDesc: "Nodes config & network bandwidth throttle",
    farmTelemetry: "Live Telemetry Control",
    farmTelemetryDesc: "GPS machinery tracking & GDD calculations",
    community: "Swarm Cooperative",
    communityDesc: "Cooperative renting & peer-to-peer chat",
    grievances: "Grievance Registry",
    grievancesDesc: "SLA-tracked support & grievance tickets",
    recentTelemetry: "Active Telemetry Stream",
    machineryOnline: "Machinery Fleet Online",
    soilNPK: "Soil Organic Chemistry",
    predictedHarvest: "Predictive Harvest Forecast",
    activeUsers: "Active Swarm Nodes",
    tickerWheat: "Wheat (गहू)",
    tickerRice: "Rice (तांदूळ)",
    tickerCotton: "Cotton (कापूस)",
    tickerSoy: "Soybean (सोयाबीन)",
    tickerMustard: "Mustard (मोहरी)"
  },
  hi: {
    welcome: "एंटरप्राइज एग्रो-टेक प्लेटफॉर्म",
    subtitle: "स्मार्ट कृषि सहायक - स्वायत्त स्वाम और टेलीमेट्री नियंत्रण कक्ष",
    description: "मृदा जैव रसायन, स्वायत्त मशीनरी निर्देशांक, और मौसम वैक्टर की रीयल-टाइम निगरानी।",
    weatherAlert: "🔴 मौसम चेतावनी: आपके क्षेत्र में भारी वर्षा का पूर्वानुमान है।",
    soilAlert: "🟢 मृदा स्वास्थ्य: बुवाई के लिए pH 6.5 और NPK स्तर अनुकूल हैं।",
    quickActions: "संचालन और टेलीमेट्री नियंत्रण कक्ष",
    liveWeather: "थेट मौसम नियंत्रण",
    liveWeatherDesc: "रीयल-टाइम मौसम स्टेशन डेटा स्ट्रीम",
    marketPrices: "मंडी भाव खुफिया जानकारी",
    marketPricesDesc: "लाइव जिंस मूल्य चार्ट और बाजार बुद्धि",
    cropManagement: "फसल जीवनचक्र प्रबंधन",
    cropManagementDesc: "बुवाई की समयसीमा और वानस्पतिक मार्गदर्शिका",
    diseaseDetection: "AI संयंत्र निदान",
    diseaseDetectionDesc: "स्पेक्ट्रल रोग पहचान स्कैनर",
    settings: "सिस्टम अंशांकन",
    settingsDesc: "नोड्स कॉन्फ़िगरेशन और 2G/3G नेटवर्क थ्रॉटल",
    farmTelemetry: "थेट शेत नियंत्रण",
    farmTelemetryDesc: "GPS मशीनरी ट्रैकिंग और GDD गणना",
    community: "स्वाम सहकारी मंच",
    communityDesc: "सहकारी किराया और पीयर-टू-पीयर चैट",
    grievances: "शिकायत पंजीकरण",
    grievancesDesc: "SLA-ट्रैक्ड सपोर्ट और शिकायत टिकट",
    recentTelemetry: "सक्रिय टेलीमेट्री स्ट्रीम",
    machineryOnline: "मशीनरी बेड़ा सक्रिय",
    soilNPK: "मृदा कार्बनिक रसायन शास्त्र",
    predictedHarvest: "पूर्वानुमानित फसल कटाई",
    activeUsers: "सक्रिय स्वाम नोड्स",
    tickerWheat: "गेहूं",
    tickerRice: "धान",
    tickerCotton: "कपास",
    tickerSoy: "सोयाबीन",
    tickerMustard: "सरसों"
  },
  mr: {
    welcome: "एंटरप्राइझ ॲग्रो-टेक प्लॅटफॉर्म",
    subtitle: "स्मार्ट कृषी सहाय्यक - स्वायत्त स्वाम आणि टेलीमेट्री नियंत्रण कक्ष",
    description: "मातीचे बायोकेमिस्ट्री, स्वायत्त यंत्रसामग्रीचे जीपीएस निर्देशांक आणि हवामान वेक्टर्सचे थेट मॉनिटरिंग.",
    weatherAlert: "🔴 हवामान इशारा: तुमच्या सूक्ष्म-प्रदेशात मुसळधार पावसाचा अंदाज.",
    soilAlert: "🟢 मातीचे आरोग्य: पेरणीसाठी pH ६.५ आणि NPK पातळी उत्तम आहे.",
    quickActions: "ऑपरेशन्स आणि टेलीमेट्री नियंत्रण कक्ष",
    liveWeather: "थेट हवामान अंदाज",
    liveWeatherDesc: "रीयल-टाइम हवामान केंद्र डेटा प्रवाह",
    marketPrices: "मंडी बाजार भाव",
    marketPricesDesc: "थेट शेतमाल बाजार भाव आणि विश्लेषण",
    cropManagement: "पीक जीवनचक्र व्यवस्थापन",
    cropManagementDesc: "पेरणीचे वेळापत्रक आणि वनस्पती मार्गदर्शिका",
    diseaseDetection: "AI वनस्पती निदान",
    diseaseDetectionDesc: "स्पेक्ट्रल रोग ओळख स्कॅनर",
    settings: "सिस्टम कॅलिब्रेशन",
    settingsDesc: "नोड्स कॉन्फिगरेशन आणि नेटवर्क बँडविड्थ थ्रॉटल",
    farmTelemetry: "थेट शेत नियंत्रण कक्ष",
    farmTelemetryDesc: "जीपीएस मशिनरी ट्रॅकिंग आणि GDD गणना",
    community: "स्वाम सहकारी मंच",
    communityDesc: "सहकारी भाडेतत्व आणि पीअर-टू-पीअर चॅट",
    grievances: "तक्रार नोंदणी कक्ष",
    grievancesDesc: "SLA-ट्रॅक सपोर्ट आणि तक्रार निवारण",
    recentTelemetry: "सक्रिय टेलीमेट्री प्रवाह",
    machineryOnline: "यंत्रसामग्रीचा ताफा सक्रिय",
    soilNPK: "मातीचे सेंद्रिय रसायनशास्त्र",
    predictedHarvest: "अंदाजित पीक काढणी",
    activeUsers: "सक्रिय स्वाम नोड्स",
    tickerWheat: "गहू",
    tickerRice: "तांदूळ",
    tickerCotton: "कापूस",
    tickerSoy: "सोयाबीन",
    tickerMustard: "मोहरी"
  }
};

const Dashboard: React.FC = () => {
  const { currentLanguage, isLowBandwidthMode } = useSafeTranslation();
  const { soilStats, equipment, peers } = useSwarmTelemetry();
  const [timeStr, setTimeStr] = useState('');

  // Localized dictionary selector
  const dict = dashboardTranslations[currentLanguage] || dashboardTranslations['hi'];

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTimeStr(d.toLocaleTimeString(currentLanguage === 'hi' ? 'hi-IN' : currentLanguage === 'mr' ? 'mr-IN' : 'en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [currentLanguage]);

  return (
    <motion.div 
      className={`min-h-screen bg-gradient-to-br from-green-50 via-[#F9F9F6] to-emerald-50 p-4 lg:p-6 ${
        isLowBandwidthMode ? 'low-bandwidth-mode' : ''
      }`}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      
      {/* 📈 REAL-TIME TICKER: Mandi Price Arbitrage Stream */}
      <div className="w-full bg-white/70 backdrop-blur-md border border-emerald-100 rounded-2xl p-3 overflow-hidden shadow-sm mb-6 relative">
        <div className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#F9F9F6] to-transparent w-10 z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-[#F9F9F6] to-transparent w-10 z-10 pointer-events-none"></div>
        
        <div className="flex animate-marquee whitespace-nowrap gap-8 text-xs font-bold text-gray-700">
          <span className="flex items-center gap-1.5 text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-100">
            🌾 {dict.tickerWheat}: ₹2,450/Q <span className="text-xs text-green-600">▲ +1.2%</span>
          </span>
          <span className="flex items-center gap-1.5 text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
            🌾 {dict.tickerRice}: ₹3,100/Q <span className="text-xs text-green-600">▲ +0.8%</span>
          </span>
          <span className="flex items-center gap-1.5 text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
            🌱 {dict.tickerCotton}: ₹7,200/Q <span className="text-xs text-red-600">▼ -0.3%</span>
          </span>
          <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
            🌱 {dict.tickerSoy}: ₹4,850/Q <span className="text-xs text-green-600">▲ +1.5%</span>
          </span>
          <span className="flex items-center gap-1.5 text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
            🌿 {dict.tickerMustard}: ₹5,600/Q <span className="text-xs text-green-600">▲ +2.1%</span>
          </span>
        </div>
      </div>

      {/* 🌾 ENTERPRISE HEADER SECTION */}
      <div className="max-w-7xl mx-auto mb-8 bg-white rounded-3xl shadow-xl overflow-hidden border border-emerald-100/50">
        <div className="bg-gradient-to-r from-green-900 to-emerald-950 px-6 py-10 lg:px-12 text-white relative">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial-gradient from-emerald-500/20 to-transparent blur-2xl"></div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 text-center md:text-left">
              <span className="px-3.5 py-1 bg-green-500/20 text-green-300 font-extrabold rounded-full text-xs uppercase tracking-widest border border-green-500/30">
                {dict.welcome}
              </span>
              <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight">{dict.subtitle}</h1>
              <p className="text-green-100/80 text-sm max-w-2xl font-medium">{dict.description}</p>
            </div>

            <div className="flex flex-col items-center bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center min-w-[12rem] shadow-lg">
              <Clock className="text-green-400 mb-1.5" size={24} />
              <p className="text-[10px] text-green-300 uppercase tracking-widest font-extrabold">Telemetry Time</p>
              <p className="text-xl font-mono font-bold tracking-wider mt-0.5">{timeStr || "LOADING..."}</p>
            </div>
          </div>

          {/* Scrolling System Notifications */}
          <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold">
            <div className="flex items-center gap-2 text-amber-300 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping"></span>
              {dict.weatherAlert}
            </div>
            <div className="flex items-center gap-2 text-green-300 bg-green-500/10 p-2.5 rounded-lg border border-green-500/20">
              <span className="h-2 w-2 rounded-full bg-green-400"></span>
              {dict.soilAlert}
            </div>
          </div>
        </div>
      </div>

      {/* 📊 TELEMETRY REAL-TIME DASH SUMMARY */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 flex items-center justify-between hover:shadow-lg transition-shadow">
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-extrabold">{dict.activeUsers}</p>
            <h4 className="text-2xl font-extrabold text-gray-800 mt-1">{peers.length + 1} Nodes</h4>
            <span className="text-xs text-green-600 font-semibold">📡 Cross-tab telemetry active</span>
          </div>
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
            <Users size={24} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 flex items-center justify-between hover:shadow-lg transition-shadow">
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-extrabold">{dict.machineryOnline}</p>
            <h4 className="text-2xl font-extrabold text-gray-800 mt-1">{equipment.filter(e => e.status === 'Active').length} Active</h4>
            <span className="text-xs text-blue-600 font-semibold">🚜 Drones & tractors dispatched</span>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <Cpu size={24} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 flex items-center justify-between hover:shadow-lg transition-shadow">
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-extrabold">{dict.soilNPK}</p>
            <h4 className="text-2xl font-extrabold text-gray-800 mt-1">pH {soilStats.ph || 6.5}</h4>
            <span className="text-xs text-emerald-600 font-semibold">🧪 Nitrogen: {soilStats.nitrogen || 140} mg/kg</span>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <Layers size={24} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 flex items-center justify-between hover:shadow-lg transition-shadow">
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-extrabold">{dict.predictedHarvest}</p>
            <h4 className="text-2xl font-extrabold text-gray-800 mt-1">94% GDD</h4>
            <span className="text-xs text-amber-600 font-semibold">🌾 Harvesting window optimal</span>
          </div>
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
            <Sprout size={24} />
          </div>
        </div>

      </div>

      {/* 🚀 QUICK ACTIONS GRID: Operations Control */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <Activity className="text-green-600" />
          <h3 className="text-xl font-bold text-gray-800">{dict.quickActions}</h3>
        </div>

        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={staggerContainerVariants}
          initial="initial"
          animate="animate"
        >
          {/* Card 1: Micro-Weather */}
          <motion.div variants={cardVariants} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="active-scale">
            <Link to="/live-weather" className="enhanced-card p-6 flex flex-col hover:border-blue-200 smooth-transition block h-full group">
              <div className="p-3.5 rounded-2xl bg-blue-50 text-blue-600 w-fit mb-4 group-hover:scale-110 smooth-transition">
                <CloudRain size={24} />
              </div>
              <h4 className="font-extrabold text-gray-800 text-lg mb-1">{dict.liveWeather}</h4>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">{dict.liveWeatherDesc}</p>
              <span className="text-xs font-bold text-blue-600 flex items-center gap-1 mt-auto">
                {dict.liveWeather} <CornerDownRight size={14} />
              </span>
            </Link>
          </motion.div>

          {/* Card 2: Mandi Price Intelligence */}
          <motion.div variants={cardVariants} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="active-scale">
            <Link to="/market-prices" className="enhanced-card p-6 flex flex-col hover:border-green-200 smooth-transition block h-full group">
              <div className="p-3.5 rounded-2xl bg-green-50 text-green-600 w-fit mb-4 group-hover:scale-110 smooth-transition">
                <TrendingUp size={24} />
              </div>
              <h4 className="font-extrabold text-gray-800 text-lg mb-1">{dict.marketPrices}</h4>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">{dict.marketPricesDesc}</p>
              <span className="text-xs font-bold text-green-600 flex items-center gap-1 mt-auto">
                {dict.marketPrices} <CornerDownRight size={14} />
              </span>
            </Link>
          </motion.div>

          {/* Card 3: Live Farm Telemetry */}
          <motion.div variants={cardVariants} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="active-scale">
            <Link to="/farm-telemetry" className="enhanced-card p-6 flex flex-col hover:border-emerald-200 smooth-transition block h-full group">
              <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600 w-fit mb-4 group-hover:scale-110 smooth-transition">
                <Cpu size={24} />
              </div>
              <h4 className="font-extrabold text-gray-800 text-lg mb-1">{dict.farmTelemetry}</h4>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">{dict.farmTelemetryDesc}</p>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-auto">
                {dict.farmTelemetry} <CornerDownRight size={14} />
              </span>
            </Link>
          </motion.div>

          {/* Card 4: Swarm Cooperative */}
          <motion.div variants={cardVariants} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="active-scale">
            <Link to="/community" className="enhanced-card p-6 flex flex-col hover:border-purple-200 smooth-transition block h-full group">
              <div className="p-3.5 rounded-2xl bg-purple-50 text-purple-600 w-fit mb-4 group-hover:scale-110 smooth-transition">
                <Users size={24} />
              </div>
              <h4 className="font-extrabold text-gray-800 text-lg mb-1">{dict.community}</h4>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">{dict.communityDesc}</p>
              <span className="text-xs font-bold text-purple-600 flex items-center gap-1 mt-auto">
                {dict.community} <CornerDownRight size={14} />
              </span>
            </Link>
          </motion.div>

          {/* Card 5: AI Botanical Advisor */}
          <motion.div variants={cardVariants} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="active-scale">
            <Link to="/ai-agent" className="enhanced-card p-6 flex flex-col hover:border-purple-200 smooth-transition block h-full group">
              <div className="p-3.5 rounded-2xl bg-purple-50 text-purple-700 w-fit mb-4 group-hover:scale-110 smooth-transition">
                <Bot size={24} />
              </div>
              <h4 className="font-extrabold text-purple-700 text-lg mb-1">AI Botanist</h4>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">Chat with enterprise-level botanical agronomy AI</p>
              <span className="text-xs font-bold text-purple-700 flex items-center gap-1 mt-auto">
                AI Botanist <CornerDownRight size={14} />
              </span>
            </Link>
          </motion.div>

          {/* Card 6: AI Diagnostics Scanner */}
          <motion.div variants={cardVariants} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="active-scale">
            <Link to="/disease-detection" className="enhanced-card p-6 flex flex-col hover:border-red-200 smooth-transition block h-full group">
              <div className="p-3.5 rounded-2xl bg-red-50 text-red-600 w-fit mb-4 group-hover:scale-110 smooth-transition">
                <Bug size={24} />
              </div>
              <h4 className="font-extrabold text-gray-800 text-lg mb-1">{dict.diseaseDetection}</h4>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">{dict.diseaseDetectionDesc}</p>
              <span className="text-xs font-bold text-red-600 flex items-center gap-1 mt-auto">
                {dict.diseaseDetection} <CornerDownRight size={14} />
              </span>
            </Link>
          </motion.div>

          {/* Card 7: Grievances Registry */}
          <motion.div variants={cardVariants} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="active-scale">
            <Link to="/grievances" className="enhanced-card p-6 flex flex-col hover:border-orange-200 smooth-transition block h-full group">
              <div className="p-3.5 rounded-2xl bg-orange-50 text-orange-600 w-fit mb-4 group-hover:scale-110 smooth-transition">
                <Shield size={24} />
              </div>
              <h4 className="font-extrabold text-gray-800 text-lg mb-1">{dict.grievances}</h4>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">{dict.grievancesDesc}</p>
              <span className="text-xs font-bold text-orange-600 flex items-center gap-1 mt-auto">
                {dict.grievances} <CornerDownRight size={14} />
              </span>
            </Link>
          </motion.div>

          {/* Card 8: System Calibration */}
          <motion.div variants={cardVariants} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="active-scale">
            <Link to="/settings" className="enhanced-card p-6 flex flex-col hover:border-slate-300 smooth-transition block h-full group">
              <div className="p-3.5 rounded-2xl bg-slate-50 text-slate-600 w-fit mb-4 group-hover:scale-110 smooth-transition">
                <Settings size={24} />
              </div>
              <h4 className="font-extrabold text-gray-800 text-lg mb-1">{dict.settings}</h4>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">{dict.settingsDesc}</p>
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1 mt-auto">
                {dict.settings} <CornerDownRight size={14} />
              </span>
            </Link>
          </motion.div>
        </motion.div>
      </div>

    </motion.div>
  );
};

export default Dashboard;
