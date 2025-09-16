import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Send, 
  User, 
  Loader, 
  BrainCircuit, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Trash2,
  Lightbulb,
  Clock,
  MapPin,
  Sprout
} from 'lucide-react';
import geminiAiService from '../services/geminiAiService';
import { locationService } from '../services/locationService';

// Extend the Window interface for speech recognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isTyping?: boolean;
  category?: string;
  confidence?: number;
  suggestions?: string[];
}

interface ChatState {
  isListening: boolean;
  isSpeaking: boolean;
  isLoading: boolean;
  speechEnabled: boolean;
  showSuggestions: boolean;
}

interface CategoryProps {
  icon: React.ReactNode;
  title: string;
  questions: string[];
  color: string;
}

const QuickSuggestions: React.FC<{ onSelect: (suggestion: string) => void }> = ({ onSelect }) => {
  const { i18n, t } = useTranslation();
  
  // Debug translation function
  console.log('🎯 AiAgent Language Debug:', {
    currentLanguage: i18n.language,
    title: t('aiagent.title'),
    cropManagement: t('aiagent.categories.cropManagement'),
    availableResources: Object.keys(i18n.getResourceBundle(i18n.language, 'translation') || {}),
    sampleTranslation: i18n.getResourceBundle(i18n.language, 'translation')?.aiagent
  });
  
  // Get localized questions based on current language
  const getLocalizedQuestions = (category: string) => {
    const questionSets: Record<string, Record<string, string[]>> = {
      crop: {
        hi: [
          "मेरी मिट्टी के लिए कौन सी फसल उपयुक्त है?",
          "गेहूं के बाद कौन सी फसल लें?",
          "अभी कौन सी फसल फायदेमंद है?"
        ],
        mr: [
          "माझ्या मातीसाठी कोणते पीक योग्य आहे?",
          "गहूनंतर कोणते पीक घ्यावे?",
          "आता कोणते पीक फायदेशीर आहे?"
        ],
        gu: [
          "મારી માટી માટે કયો પાક યોગ્ય છે?",
          "ઘઉં પછી કયો પાક લેવો?",
          "હવે કયો પાક ફાયદાકારક છે?"
        ],
        ta: [
          "என் மண்ணுக்கு எந்த பயிர் ஏற்றது?",
          "கோதுமைக்கு பிறகு எந்த பயிர் போடலாம்?",
          "இப்போது எந்த பயிர் லாபகரமானது?"
        ],
        te: [
          "నా మట్టికి ఏ పంట అనుకూలం?",
          "గోధుమల తర్వాత ఏ పంట వేయాలి?",
          "ఇప్పుడు ఏ పంట లాభదాయకం?"
        ],
        pa: [
          "ਮੇਰੀ ਮਿੱਟੀ ਲਈ ਕਿਹੜੀ ਫਸਲ ਢੁਕਵੀਂ ਹੈ?",
          "ਕਣਕ ਤੋਂ ਬਾਅਦ ਕਿਹੜੀ ਫਸਲ ਲਓ?",
          "ਹੁਣ ਕਿਹੜੀ ਫਸਲ ਫਾਇਦੇਮੰਦ ਹੈ?"
        ],
        bn: [
          "আমার মাটির জন্য কোন ফসল উপযুক্ত?",
          "গমের পর কোন ফসল নেব?",
          "এখন কোন ফসল লাভজনক?"
        ],
        kn: [
          "ನನ್ನ ಮಣ್ಣಿಗೆ ಯಾವ ಬೆಳೆ ಸೂಕ್ತ?",
          "ಗೋಧಿ ನಂತರ ಯಾವ ಬೆಳೆ ತೆಗೆದುಕೊಳ್ಳಬೇಕು?",
          "ಈಗ ಯಾವ ಬೆಳೆ ಲಾಭದಾಯಕ?"
        ],
        ml: [
          "എന്റെ മണ്ണിന് ഏത് വിളയാണ് യോജിച്ചത്?",
          "ഗോതമ്പിന് ശേഷം ഏത് വിള എടുക്കണം?",
          "ഇപ്പോൾ ഏത് വിള ലാഭകരമാണ്?"
        ],
        or: [
          "ମୋ ମାଟି ପାଇଁ କେଉଁ ଫସଲ ଉପଯୁକ୍ତ?",
          "ଗହମ ପରେ କେଉଁ ଫସଲ ନେବ?",
          "ବର୍ତ୍ତମାନ କେଉଁ ଫସଲ ଲାଭଜନକ?"
        ],
        ur: [
          "میری مٹی کے لیے کون سی فصل موزوں ہے؟",
          "گندم کے بعد کون سی فصل لیں؟",
          "اب کون سی فصل فائدہ مند ہے؟"
        ],
        en: [
          "Which crop suits my soil type?",
          "What to plant after wheat harvest?",
          "Best crop rotation practices?"
        ]
      },
      pest: {
        hi: [
          "टमाटर में कीड़े लग गए हैं कैसे छुटकारा पाएं?",
          "कपास की फसल में रोग दिख रहा है क्या करें?",
          "प्राकृतिक कीटनाशक कैसे बनाएं?"
        ],
        mr: [
          "टोमॅटोमध्ये कीड लागली आहे कसा छुटकारा मिळवावा?",
          "कापसाच्या पिकात रोग दिसत आहे काय करावे?",
          "नैसर्गिक कीटकनाशक कसे बनवावे?"
        ],
        gu: [
          "ટામેટાંમાં કીડા લાગ્યા છે કેવી રીતે છુટકારો મેળવવો?",
          "કપાસની ખેતીમાં રોગ દેખાય છે શું કરવું?",
          "કુદરતી જંતુનાશક કેવી રીતે બનાવવું?"
        ],
        ta: [
          "தக்காளியில் பூச்சிகள் தாக்கியுள்ளன எப்படி கட்டுப்படுத்துவது?",
          "பருத்தி பயிரில் நோய் தென்படுகிறது என்ன செய்வது?",
          "இயற்கை பூச்சிக்கொல்லி எப்படி தயாரிப்பது?"
        ],
        te: [
          "టమాటాలో పురుగులు వచ్చాయి ఎలా తొలగించాలి?",
          "పత్తి పంటలో వ్యాధి కనిపిస్తోంది ఏమి చేయాలి?",
          "సహజ పురుగుమందు ఎలా తయారు చేయాలి?"
        ],
        pa: [
          "ਟਮਾਟਰ ਵਿੱਚ ਕੀੜੇ ਲੱਗ ਗਏ ਹਨ ਕਿਵੇਂ ਛੁਟਕਾਰਾ ਪਾਈਏ?",
          "ਕਪਾਹ ਦੀ ਫਸਲ ਵਿੱਚ ਰੋਗ ਦਿਖ ਰਿਹਾ ਹੈ ਕੀ ਕਰੀਏ?",
          "ਕੁਦਰਤੀ ਕੀੜੇਮਾਰ ਕਿਵੇਂ ਬਣਾਈਏ?"
        ],
        bn: [
          "টমেটোতে পোকা লেগেছে কিভাবে দূর করব?",
          "তুলার ফসলে রোগ দেখা দিয়েছে কী করব?",
          "প্রাকৃতিক কীটনাশক কিভাবে তৈরি করব?"
        ],
        kn: [
          "ಟೊಮೇಟೊದಲ್ಲಿ ಕೀಟಗಳು ಬಂದಿವೆ ಹೇಗೆ ತೊಡೆದುಹಾಕುವುದು?",
          "ಹತ್ತಿ ಬೆಳೆಯಲ್ಲಿ ರೋಗ ಕಾಣುತ್ತಿದೆ ಏನು ಮಾಡಬೇಕು?",
          "ನೈಸರ್ಗಿಕ ಕೀಟನಾಶಕ ಹೇಗೆ ತಯಾರಿಸುವುದು?"
        ],
        ml: [
          "തക്കാളിയിൽ കീടങ്ങൾ വന്നിട്ടുണ്ട് എങ്ങനെ നീക്കം ചെയ്യും?",
          "പഞ്ഞി വിളയിൽ രോഗം കാണുന്നു എന്തു ചെയ്യണം?",
          "പ്രകൃതിദത്ത കീടനാശിനി എങ്ങനെ ഉണ്ടാക്കാം?"
        ],
        or: [
          "ଟମାଟୋରେ କୀଟ ଲାଗିଛି କିପରି ଦୂର କରିବ?",
          "କପା ଫସଲରେ ରୋଗ ଦେଖାଯାଉଛି କଣ କରିବ?",
          "ପ୍ରାକୃତିକ କୀଟନାଶକ କିପରି ତିଆରି କରିବ?"
        ],
        ur: [
          "ٹماٹر میں کیڑے لگ گئے ہیں کیسے چھٹکارا پائیں؟",
          "کپاس کی فصل میں بیماری نظر آ رہی ہے کیا کریں؟",
          "قدرتی کیڑے مار کیسے بنائیں؟"
        ],
        en: [
          "How to control pests in tomatoes?",
          "Cotton crop disease management?",
          "Natural pesticide preparation?"
        ]
      }
    };
    
    return questionSets[category]?.[i18n.language] || questionSets[category]?.en || [];
  };
  
  const categories: CategoryProps[] = [
    {
      icon: "🌱",
      title: t('aiagent.categories.cropManagement'),
      questions: getLocalizedQuestions('crop'),
      color: "from-green-500 to-green-600"
    },
    {
      icon: "🐛",
      title: t('aiagent.categories.pestControl'),
      questions: getLocalizedQuestions('pest'),
      color: "from-red-500 to-red-600"
    },
    {
      icon: "🧪",
      title: t('aiagent.categories.soilHealth'),
      questions: i18n.language === 'hi' ? [
        "मेरी मिट्टी की जांच रिपोर्ट का क्या मतलब है?",
        "धान के लिए कौन सा उर्वरक सही है?",
        "मिट्टी को जैविक तरीके से कैसे सुधारें?"
      ] : [
        "How to interpret soil test results?",
        "Best fertilizers for rice",
        "Organic soil improvement methods"
      ],
      color: "from-yellow-500 to-yellow-600"
    },
    {
      icon: "💧",
      title: t('aiagent.categories.irrigation'),
      questions: i18n.language === 'hi' ? [
        "गेहूं को कितना पानी चाहिए?",
        "मिर्च के लिए ड्रिप इरिगेशन सही है?",
        "पानी कैसे बचाएं?"
      ] : [
        "Water requirements for wheat",
        "Is drip irrigation good for chilies?",
        "Water conservation methods"
      ],
      color: "from-cyan-500 to-cyan-600"
    },
    {
      icon: "🌦",
      title: t('aiagent.categories.weatherImpact'),
      questions: i18n.language === 'hi' ? [
        "इस हफ्ते का मौसम कैसा रहेगा?",
        "क्या कल बारिश होगी?",
        "क्या अभी बुवाई का समय सही है?"
      ] : [
        "Weather impact on crops",
        "Best time for sowing",
        "Protecting crops from weather"
      ],
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: "💰",
      title: t('aiagent.categories.marketPrices'),
      questions: i18n.language === 'hi' ? [
        "टमाटर का मंडी भाव क्या है?",
        "जैविक सब्जियां कहां बेचें?",
        "प्याज के लिए खरीददार कहां मिलेंगे?"
      ] : [
        "Current market prices",
        "Where to sell organic produce?",
        "Best time to sell crops"
      ],
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: "🏛",
      title: t('aiagent.categories.governmentSchemes'),
      questions: i18n.language === 'hi' ? [
        "फसल बीमा के लिए क्या करें?",
        "PM-KISAN के फायदे कैसे लें?",
        "सोलर पंप पर सब्सिडी मिलेगी?"
      ] : [
        "How to get crop insurance?",
        "PM-KISAN benefits guide",
        "Available farming subsidies"
      ],
      color: "from-indigo-500 to-indigo-600"
    },
    {
      icon: "🧑‍🌾",
      title: t('aiagent.categories.organicFarming'),
      questions: i18n.language === 'hi' ? [
        "जैविक खेती कैसे शुरू करें?",
        "प्राकृतिक कीटनाशक कैसे बनाएं?",
        "जैविक प्रमाणन कैसे प्राप्त करें?"
      ] : [
        "How to start organic farming?",
        "Natural pesticide recipes",
        "Organic certification process"
      ],
      color: "from-emerald-500 to-emerald-600"
    }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center">
        <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
        {t('suggestions.title')}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((category, idx) => (
          <div key={idx} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{category.icon}</span>
              <h4 className="font-semibold text-gray-800">{category.title}</h4>
            </div>
            
            <div className="space-y-2">
              {category.questions.map((question, qIdx) => (
                <button
                  key={qIdx}
                  onClick={() => onSelect(question)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200
                    bg-gradient-to-r ${category.color} text-white opacity-90
                    hover:opacity-100 hover:shadow-md hover:transform hover:scale-[1.02]`}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MessageComponent: React.FC<{ 
  message: Message; 
  onSpeak: (text: string) => void;
  isSpeechSupported: boolean;
}> = ({ message, onSpeak, isSpeechSupported }) => {
  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'cropManagement': return '🌱';
      case 'pestControl': return '🐛';
      case 'soilHealth': return '🧪';
      case 'irrigation': return '💧';
      case 'weatherImpact': return '🌦';
      case 'marketPrices': return '💰';
      case 'governmentSchemes': return '🏛';
      case 'organicFarming': return '🧑‍🌾';
      default: return '🌾';
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'cropManagement': return 'text-green-600';
      case 'pestControl': return 'text-red-600';
      case 'soilHealth': return 'text-yellow-600';
      case 'irrigation': return 'text-cyan-600';
      case 'weatherImpact': return 'text-blue-600';
      case 'marketPrices': return 'text-purple-600';
      case 'governmentSchemes': return 'text-indigo-600';
      case 'organicFarming': return 'text-emerald-600';
      default: return 'text-orange-600';
    }
  };

  return (
    <div className={`flex items-end gap-3 ${message.isUser ? 'justify-end' : 'justify-start'}`}>
      {!message.isUser && (
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white flex-shrink-0 shadow-lg`}>
          {getCategoryIcon(message.category)}
        </div>
      )}
      
      <div className={`max-w-lg ${message.isUser ? 'order-last' : ''}`}>
        <div className={`px-4 py-3 rounded-2xl shadow-sm ${
          message.isUser 
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none' 
            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
        }`}>
          {!message.isUser && message.category && (
            <div className={`flex items-center text-xs font-medium mb-1 ${getCategoryColor(message.category)}`}>
              {getCategoryIcon(message.category)}
              <span className="ml-1 capitalize">{message.category}</span>
              {message.confidence && (
                <span className="ml-2 bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
                  {Math.round(message.confidence * 100)}%
                </span>
              )}
            </div>
          )}
          
          <p className="whitespace-pre-wrap">{message.text}</p>
          
          <div className="flex items-center justify-between mt-2">
            <span className={`text-xs ${message.isUser ? 'text-blue-100' : 'text-gray-500'}`}>
              <Clock className="w-3 h-3 inline mr-1" />
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            
            {!message.isUser && isSpeechSupported && (
              <button
                onClick={() => onSpeak(message.text)}
                className="p-1 text-gray-400 hover:text-orange-600 transition-colors rounded"
                title="Speak this message"
              >
                <Volume2 size={14} />
              </button>
            )}
          </div>
        </div>
        
        {message.suggestions && message.suggestions.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.suggestions.map((suggestion, index) => (
              <button
                key={index}
                className="block w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors"
              >
                💡 {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {message.isUser && (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white flex-shrink-0 shadow-lg">
          <User size={20} />
        </div>
      )}
    </div>
  );
};

const AiAgent: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [chatState, setChatState] = useState<ChatState>({
    isListening: false,
    isSpeaking: false,
    isLoading: false,
    speechEnabled: true,
    showSuggestions: true
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      
      const langMap: { [key: string]: string } = {
        'en': 'en-US',
        'hi': 'hi-IN',
        'mr': 'mr-IN',
        'gu': 'gu-IN',
        'ta': 'ta-IN',
        'te': 'te-IN',
        'pa': 'pa-IN'
      };
      
      recognitionInstance.lang = langMap[i18n.language] || 'en-US';

      recognitionInstance.onstart = () => {
        setChatState(prev => ({ ...prev, isListening: true }));
      };

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setChatState(prev => ({ ...prev, isListening: false }));
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setChatState(prev => ({ ...prev, isListening: false }));
      };

      recognitionInstance.onend = () => {
        setChatState(prev => ({ ...prev, isListening: false }));
      };

      recognitionRef.current = recognitionInstance;
    }
  }, [i18n.language]);
  
  // Initialize with personalized greeting and location-based recommendations
  useEffect(() => {
    const initializeChat = async () => {
      try {
        const location = locationService.getCurrentLocation();
        let greeting = await geminiAiService.getAgricultureResponse("", i18n.language, location);
        
        // Add location-specific information if available
        if (location) {
          const zone = locationService.getAgroClimaticZone(location.state);
    // const recommendations = locationService.getLocalizedRecommendations();
    // const seasonalCrops = locationService.getCropRecommendations();
          
          const locationInfo = i18n.language === 'hi'
            ? `\n\nमैं देख रहा हूं कि आप ${location.district}, ${location.state} से हैं।`
            : `\n\nI see you're from ${location.district}, ${location.state}.`;
            
          const zoneInfo = zone 
            ? (i18n.language === 'hi'
              ? `\nआपका क्षेत्र ${zone.name} में आता है, जहाँ ${zone.characteristics.majorCrops.join(', ')} जैसी फसलें अच्छी होती हैं।`
              : `\nYour area falls in the ${zone.name}, which is great for crops like ${zone.characteristics.majorCrops.join(', ')}.`)
            : '';
            
          greeting.text += locationInfo + zoneInfo;
        }

        const initialMessage: Message = {
          id: Date.now().toString(),
          text: greeting.text,
          isUser: false,
          timestamp: new Date(),
          category: greeting.category || 'general',
          suggestions: greeting.suggestions || (location ? locationService.getLocalizedRecommendations() : undefined)
        };
        setMessages([initialMessage]);
      } catch (error) {
        // Fallback greeting
        const fallbackGreeting = i18n.language === 'hi' 
          ? "नमस्ते! मैं आपका उन्नत AI कृषि सहायक हूं। मैं फसलों, मौसम, बीमारियों और सरकारी योजनाओं के बारे में विस्तृत जानकारी दे सकता हूं।"
          : "Hello! I'm your advanced AI Agriculture Assistant. I can provide detailed information about crops, weather, diseases, and government schemes.";
        
        const fallbackMessage: Message = {
          id: Date.now().toString(),
          text: fallbackGreeting,
          isUser: false,
          timestamp: new Date(),
          category: 'general'
        };
        setMessages([fallbackMessage]);
      }
    };

    initializeChat();
  }, [i18n.language]);

  const startListening = () => {
    if (recognitionRef.current && !chatState.isListening) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && chatState.isListening) {
      recognitionRef.current.stop();
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      const voiceLangMap: { [key: string]: string } = {
        'en': 'en-US',
        'hi': 'hi-IN',
        'mr': 'mr-IN',
        'gu': 'gu-IN',
        'ta': 'ta-IN',
        'te': 'te-IN',
        'pa': 'pa-IN'
      };
      
      utterance.lang = voiceLangMap[i18n.language] || 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      utterance.onstart = () => setChatState(prev => ({ ...prev, isSpeaking: true }));
      utterance.onend = () => setChatState(prev => ({ ...prev, isSpeaking: false }));
      utterance.onerror = () => setChatState(prev => ({ ...prev, isSpeaking: false }));
      
      speechSynthesis.speak(utterance);
      synthesisRef.current = utterance;
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setChatState(prev => ({ ...prev, isSpeaking: false }));
    }
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (textToSend === '' || chatState.isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setChatState(prev => ({ ...prev, isLoading: true }));

    try {
      const location = locationService.getCurrentLocation();
      let response = await geminiAiService.getAgricultureResponse(textToSend, i18n.language, location);
      
      // Enhance response with location-specific information
      if (location && (
        textToSend.toLowerCase().includes('crop') ||
        textToSend.toLowerCase().includes('weather') ||
        textToSend.toLowerCase().includes('soil') ||
        textToSend.toLowerCase().includes('फसल') ||
        textToSend.toLowerCase().includes('मौसम') ||
        textToSend.toLowerCase().includes('मिट्टी')
      )) {
        const zone = locationService.getAgroClimaticZone(location.state);
  // ...existing code...

        if (zone) {
          const locationContext = i18n.language === 'hi'
            ? `\n\nआपके क्षेत्र ${location.district}, ${location.state} के लिए विशेष जानकारी:\n`
            : `\n\nSpecific information for your area ${location.district}, ${location.state}:\n`;

          response.text += locationContext;

          if (textToSend.toLowerCase().includes('crop') || textToSend.toLowerCase().includes('फसल')) {
            response.text += i18n.language === 'hi'
              ? `• इस क्षेत्र की प्रमुख फसलें: ${zone.characteristics.majorCrops.join(', ')}\n`
              : `• Major crops for this region: ${zone.characteristics.majorCrops.join(', ')}\n`;
          }

          if (textToSend.toLowerCase().includes('weather') || textToSend.toLowerCase().includes('मौसम')) {
            response.text += i18n.language === 'hi'
              ? `• सामान्य वर्षा: ${zone.characteristics.rainfall}\n• तापमान: ${zone.characteristics.temperature}\n`
              : `• Typical rainfall: ${zone.characteristics.rainfall}\n• Temperature: ${zone.characteristics.temperature}\n`;
          }

          if (textToSend.toLowerCase().includes('soil') || textToSend.toLowerCase().includes('मिट्टी')) {
            response.text += i18n.language === 'hi'
              ? `• मिट्टी के प्रकार: ${zone.characteristics.soilTypes.join(', ')}\n`
              : `• Soil types: ${zone.characteristics.soilTypes.join(', ')}\n`;

            // Add soil-specific recommendations
            const soilType = zone.characteristics.soilTypes[0]?.toLowerCase();
            const soilInfo = locationService.getSoilType(soilType);
            if (soilInfo) {
              response.text += i18n.language === 'hi'
                ? `\nमिट्टी प्रबंधन सुझाव:\n${soilInfo.management.map(tip => `• ${tip}`).join('\n')}`
                : `\nSoil management tips:\n${soilInfo.management.map(tip => `• ${tip}`).join('\n')}`;
            }
          }
        }
      }
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        isUser: false,
        timestamp: new Date(),
        category: response.category || 'general',
        confidence: response.confidence,
        suggestions: response.suggestions || (location ? locationService.getLocalizedRecommendations() : undefined)
      };
      
  setMessages(prev => [...prev, botMessage]);

      // Auto-speak if not already speaking
      if (!chatState.isSpeaking && chatState.speechEnabled) {
        speakText(response.text);
      }

    } catch (error) {
      const errorText = i18n.language === 'hi' 
        ? "माफ करें, मुझे अभी समस्या हो रही है। कृपया फिर से कोशिश करें।"
        : "Sorry, I'm having trouble right now. Please try again.";
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorText,
        isUser: false,
        timestamp: new Date(),
        category: 'error'
      };
      
      setMessages(prev => [...prev, errorMessage]);
      console.error("Error fetching AI response:", error);
    } finally {
      setChatState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const clearConversation = () => {
    setMessages([]);
    // Clear Gemini AI service history
    geminiAiService.clearHistory();
  };

  const isVoiceSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  const isSpeechSupported = 'speechSynthesis' in window;

  return (
    <div className="ai-chat-container">
      {/* Header */}
      <div className="ai-chat-header">
        <div className="flex items-center">
          <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-3 rounded-2xl mr-4 shadow-lg">
            <BrainCircuit className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              {t('aiagent.title')} Advanced
            </h1>
            <p className="text-gray-600">{t('aiagent.subtitle')} - Enhanced Intelligence</p>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={clearConversation}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
            title="Clear conversation"
          >
            <Trash2 size={18} />
          </button>
          
          <button
            onClick={() => setChatState(prev => ({ ...prev, showSuggestions: !prev.showSuggestions }))}
            className="p-2 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
            title="Toggle suggestions"
          >
            <Lightbulb size={18} />
          </button>
          
          {isSpeechSupported && (
            <button
              onClick={chatState.isSpeaking ? stopSpeaking : () => {}}
              disabled={!chatState.isSpeaking}
              className={`p-2 rounded-xl transition-colors ${
                chatState.isSpeaking 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              title={chatState.isSpeaking ? 'Stop speaking' : 'Not speaking'}
            >
              {chatState.isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="ai-chat-messages">
        {/* Quick suggestions */}
        {chatState.showSuggestions && messages.length <= 1 && (
          <QuickSuggestions onSelect={handleSend} />
        )}

        {/* AI Status */}
        <div className="bg-white/60 backdrop-blur-sm border border-white/30 rounded-xl p-4 shadow-sm mb-4">
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <BrainCircuit className="text-green-600 mr-2" size={20} />
              <div>
                <h3 className="font-semibold text-green-800">Advanced AI Agriculture Assistant</h3>
                <p className="text-green-700 text-sm">
                  Powered by GPT with specialized agriculture knowledge base
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Location Context Card */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 shadow-sm mb-6 border border-green-100">
          <div className="flex flex-col space-y-4">
            {/* Location Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="text-emerald-600" size={20} />
                <h3 className="font-semibold text-emerald-800">
                  {t('aiagent.locationContext.title')}
                </h3>
              </div>
              <div className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">
                {locationService.getCurrentLocation()?.state || t('aiagent.locationContext.locationNotFound')}
              </div>
            </div>

            {/* Current Season */}
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="text-amber-600" size={16} />
              <span className="text-gray-700">
                {(() => {
                  const month = new Date().getMonth();
                  if (month >= 5 && month <= 9) {
                    return t('aiagent.locationContext.kharifSeason');
                  } else if (month >= 9 || month <= 2) {
                    return t('aiagent.locationContext.rabiSeason');
                  } else {
                    return t('aiagent.locationContext.zaidSeason');
                  }
                })()}
              </span>
            </div>

            {/* Agro-Climatic Info */}
            {locationService.getCurrentLocation() && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {/* Zone Info */}
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-green-100">
                  <h4 className="font-medium text-sm text-gray-700 mb-2">
                    {t('aiagent.locationContext.agroClimaticZone')}
                  </h4>
                  {(() => {
                    const zone = locationService.getAgroClimaticZone(
                      locationService.getCurrentLocation()?.state || ''
                    );
                    return zone ? (
                      <div className="space-y-1 text-sm">
                        <p className="text-emerald-700">{zone.name}</p>
                        <p className="text-gray-600 text-xs">
                          {t('aiagent.locationContext.rainfall')}: {zone.characteristics.rainfall}
                        </p>
                        <p className="text-gray-600 text-xs">
                          {t('aiagent.locationContext.temperature')}: {zone.characteristics.temperature}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">{t('aiagent.locationContext.zoneNotFound')}</p>
                    );
                  })()}
                </div>

                {/* Current Recommendations */}
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-green-100">
                  <h4 className="font-medium text-sm text-gray-700 mb-2">
                    <Sprout className="inline-block mr-1 text-green-600" size={16} />
                    {t('aiagent.locationContext.seasonalCrops')}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {locationService.getCropRecommendations()
                      .slice(1) // Skip the first item which is the heading
                      .map((crop, index) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full"
                        >
                          {crop}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions: Only Live Weather button shown as requested */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleSend(t('aiagent.locationContext.queries.weather'))}
                className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                🌤️ {t('aiagent.locationContext.actions.checkWeather')}
              </button>
            </div>
          </div>
        </div>

        {/* Message list */}
        {messages.map((message) => (
          <MessageComponent
            key={message.id}
            message={message}
            onSpeak={speakText}
            isSpeechSupported={isSpeechSupported}
          />
        ))}
        
        {/* Loading indicator */}
        {chatState.isLoading && (
          <div className="flex items-end gap-3 justify-start">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white flex-shrink-0 shadow-lg">
              <Loader className="animate-spin" size={20} />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-500">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="ai-chat-input">
        <div className="ai-input-container">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t('aiagent.placeholder') + ' (Advanced AI)'}
              className="ai-input-field bg-white text-gray-800 placeholder-gray-400"
            disabled={chatState.isLoading}
          />
          
          {isVoiceSupported && (
            <button
              onClick={chatState.isListening ? stopListening : startListening}
              disabled={chatState.isLoading}
              className={`p-2 rounded-xl mr-2 transition-all duration-200 ${
                chatState.isListening 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200 animate-pulse shadow-lg' 
                  : 'bg-blue-100 text-blue-600 hover:bg-blue-200 hover:shadow-md'
              }`}
              title={chatState.isListening ? 'Stop listening' : 'Start voice input'}
            >
              {chatState.isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
          )}
          
          <button
            onClick={() => handleSend()}
            disabled={input.trim() === '' || chatState.isLoading}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl p-2 disabled:from-orange-300 disabled:to-orange-400 disabled:cursor-not-allowed hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Send size={20} />
          </button>
        </div>
        
        {chatState.isListening && (
          <div className="mt-3 text-center">
            <div className="inline-flex items-center space-x-2 bg-blue-100 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-700 font-medium">
                🎤 Listening... Speak now!
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiAgent;
