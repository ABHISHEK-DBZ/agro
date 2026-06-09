// Gemini AI Service - v2.4 - Added REST API fallback with Gemini 2.0
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

interface GeminiResponse {
  text: string;
  category: string;
  confidence: number;
  suggestions: string[];
}

class GeminiAiService {
  private genAI: GoogleGenerativeAI;
  private primaryModel: any;
  private fallbackModel: any;
  private conversationHistory: any[] = [];

  constructor() {
    // Gemini API Key must be provided via env var. No hardcoded fallback.
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
    if (!API_KEY) {
      throw new Error(
        'VITE_GEMINI_API_KEY is not configured. Please set it in your .env file to use the AI assistant.',
      );
    }
    if (API_KEY === 'your_api_key_here') {
      throw new Error('VITE_GEMINI_API_KEY is set to a placeholder. Replace it with a real key.');
    }

    this.genAI = new GoogleGenerativeAI(API_KEY);
    
    // Primary model - Gemini 2.5 Flash (latest)
    this.primaryModel = this.genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      systemInstruction: "You are an expert agricultural advisor for Indian farmers called 'Smart Krishi Sahayak AI'. Provide helpful, practical advice about farming, crops, weather, soil, pests, government schemes, and organic farming. Always respond in the user's preferred language (Hindi or English) with simple, actionable guidance suited to Indian agricultural conditions.",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    // Fallback model - Gemini Pro
    this.fallbackModel = this.genAI.getGenerativeModel({ 
      model: 'gemini-pro',
      systemInstruction: "You are an expert agricultural advisor for Indian farmers called 'Smart Krishi Sahayak AI'. Provide helpful, practical advice about farming, crops, weather, soil, pests, government schemes, and organic farming. Always respond in the user's preferred language (Hindi or English) with simple, actionable guidance suited to Indian agricultural conditions.",
    });
  }

  // Note: System prompt is now handled in model constructor
  // private getAgricultureSystemPrompt method removed as it's integrated into systemInstruction

  private categorizeQuery(query: string, _language: string): string {
    const hindiCategories = {
      'cropManagement': ['फसल', 'बुवाई', 'कटाई', 'किस्म', 'बीज', 'crop', 'seed', 'variety'],
      'pestControl': ['कीट', 'रोग', 'बीमारी', 'कीड़े', 'pest', 'disease', 'insect', 'fungus'],
      'soilHealth': ['मिट्टी', 'खाद', 'उर्वरक', 'soil', 'fertilizer', 'compost', 'manure'],
      'irrigation': ['पानी', 'सिंचाई', 'water', 'irrigation', 'drip', 'sprinkler'],
      'weatherImpact': ['मौसम', 'बारिश', 'तापमान', 'weather', 'rain', 'temperature'],
      'marketPrices': ['भाव', 'मंडी', 'कीमत', 'बेचना', 'price', 'market', 'selling'],
      'governmentSchemes': ['योजना', 'सरकार', 'सब्सिडी', 'scheme', 'government', 'subsidy'],
      'organicFarming': ['जैविक', 'प्राकृतिक', 'organic', 'natural', 'bio']
    };

    const queryLower = query.toLowerCase();
    
    for (const [category, keywords] of Object.entries(hindiCategories)) {
      if (keywords.some(keyword => queryLower.includes(keyword))) {
        return category;
      }
    }
    
    return 'general';
  }

  private generateSuggestions(category: string, language: string): string[] {
    const suggestions: { [key: string]: { [key: string]: string[] } } = {
      cropManagement: {
        hi: [
          "इस मौसम में कौन सी फसल उगानी चाहिए?",
          "बीज की मात्रा कितनी रखें?",
          "फसल की देखभाल कैसे करें?"
        ],
        en: [
          "Which crop should I grow this season?",
          "How much seed quantity is needed?",
          "How to take care of crops?"
        ]
      },
      pestControl: {
        hi: [
          "प्राकृतिक कीटनाशक कैसे बनाएं?",
          "इस रोग का इलाज क्या है?",
          "कीड़ों से कैसे बचाव करें?"
        ],
        en: [
          "How to make natural pesticides?",
          "What is the treatment for this disease?",
          "How to protect from insects?"
        ]
      },
      soilHealth: {
        hi: [
          "मिट्टी की जांच कैसे करें?",
          "कौन सा उर्वरक सबसे अच्छा है?",
          "मिट्टी को उपजाऊ कैसे बनाएं?"
        ],
        en: [
          "How to test soil?",
          "Which fertilizer is best?",
          "How to make soil fertile?"
        ]
      }
    };

    return suggestions[category]?.[language] || suggestions['cropManagement'][language] || [];
  }

  // Direct REST API call as ultimate fallback
  private async generateWithRestAPI(prompt: string): Promise<string> {
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;    try {
      console.log('🌐 Trying direct REST API call...');
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          systemInstruction: {
            parts: [{
              text: "You are an expert agricultural advisor for Indian farmers called 'Smart Krishi Sahayak AI'. Provide helpful, practical advice about farming, crops, weather, soil, pests, government schemes, and organic farming. Always respond in the user's preferred language (Hindi or English) with simple, actionable guidance suited to Indian agricultural conditions."
            }]
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates[0]?.content?.parts[0]?.text || 'Sorry, I could not generate a response.';
      
    } catch (error) {
      console.error('REST API call failed:', error);
      throw error;
    }
  }

  private async generateWithRetry(prompt: string, maxRetries: number): Promise<string> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🤖 Gemini API attempt ${attempt}/${maxRetries}`);
        
        // Try primary model first
        const result = await this.primaryModel.generateContent(prompt);
        const response = await result.response;
        return response.text();
        
      } catch (error: any) {
        lastError = error;
        console.warn(`⚠️ Attempt ${attempt} failed:`, error.message);
        
        // If it's a 404, 503 (overloaded) error, or model not found, try fallback model
        if (error.message.includes('503') || error.message.includes('overloaded') || 
            error.message.includes('404') || error.message.includes('not found')) {
          try {
            console.log(`🔄 Trying fallback model...`);
            const fallbackResult = await this.fallbackModel.generateContent(prompt);
            const fallbackResponse = await fallbackResult.response;
            return fallbackResponse.text();
          } catch (fallbackError: any) {
            console.warn(`⚠️ Fallback model also failed:`, fallbackError.message);
          }
        }
        
        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Max 10 seconds
          console.log(`⏳ Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    // Ultimate fallback: Try direct REST API call
    try {
      console.log('🔄 Attempting direct REST API as final fallback...');
      return await this.generateWithRestAPI(prompt);
    } catch (restError: any) {
      console.warn('⚠️ REST API fallback also failed:', restError.message);
    }
    
    // If all retries failed, throw the last error
    throw lastError;
  }

  public async getAgricultureResponse(
    query: string, 
    language: string = 'hi',
    userLocation?: any
  ): Promise<GeminiResponse> {
    try {
      // If no query, provide welcome message
      if (!query.trim()) {
        const getWelcomeMessage = (lang: string) => {
          const messages: Record<string, string> = {
            hi: `नमस्ते! 🙏 मैं आपका Smart Krishi Sahayak AI हूं।

मैं आपकी निम्नलिखित चीजों में मदद कर सकता हूं:

🌱 **फसल प्रबंधन** - बुवाई से कटाई तक सब कुछ
🐛 **कीट और रोग नियंत्रण** - प्राकृतिक और रासायनिक दोनों उपाय  
🧪 **मिट्टी की सेहत** - मिट्टी परीक्षण और उर्वरक सलाह
💧 **सिंचाई** - पानी बचाने के तरीके
🌦️ **मौसम** - मौसम के अनुसार फसल सलाह
💰 **बाजार भाव** - कब और कहां बेचें
🏛️ **सरकारी योजनाएं** - PM-KISAN, बीमा, सब्सिडी
🧑‍🌾 **जैविक खेती** - प्राकृतिक तरीकों से खेती

मुझसे कोई भी कृषि संबंधी प्रश्न पूछें! मैं भारतीय किसानों के लिए विशेष रूप से बनाया गया हूं। 🚜🌾`,

            mr: `नमस्कार! 🙏 मी तुमचा Smart Krishi Sahayak AI आहे।

मी तुम्हाला या गोष्टींमध्ये मदत करू शकतो:

🌱 **पीक व्यवस्थापन** - बियाणे पासून कापणी पर्यंत सर्व काही
🐛 **कीटक आणि रोग नियंत्रण** - नैसर्गिक आणि रासायनिक दोन्ही उपाय
🧪 **मातीची निरोगीता** - माती चाचणी आणि खत सल्ला
💧 **सिंचन** - पाणी वाचवण्याचे मार्ग
🌦️ **हवामान** - हवामानानुसार पीक सल्ला
💰 **बाजार भाव** - कधी आणि कुठे विकावे
🏛️ **सरकारी योजना** - PM-KISAN, विमा, अनुदान
🧑‍🌾 **जैविक शेती** - नैसर्गिक पद्धतीने शेती

माझ्याकडे कोणताही कृषी संबंधी प्रश्न विचारा! मी भारतीय शेतकर्‍यांसाठी खासकरून बनविलेला आहे। 🚜🌾`,

            gu: `નમસ્તે! 🙏 હું તમારો Smart Krishi Sahayak AI છું।

હું તમને આ બાબતોમાં મદદ કરી શકું છું:

🌱 **પાક વ્યવસ્થાપન** - વાવેતરથી લણણી સુધી બધું
🐛 **જંતુ અને રોગ નિયંત્રણ** - કુદરતી અને રાસાયણિક બંને ઉપાયો
🧪 **માટીની સ્વાસ્થ્ય** - માટી પરીક્ષણ અને ખાતર સલાહ
💧 **સિંચાઈ** - પાણી બચાવવાની રીતો
🌦️ **હવામાન** - હવામાન અનુસાર પાક સલાહ
💰 **બજાર ભાવ** - ક્યારે અને ક્યાં વેચવું
🏛️ **સરકારી યોજનાઓ** - PM-KISAN, વીમો, સબસિડી
🧑‍🌾 **જૈવિક ખેતી** - કુદરતી પદ્ધતિથી ખેતી

મને કોઈપણ કૃષિ સંબંધી પ્રશ્ન પૂછો! હું ભારતીય ખેડૂતો માટે ખાસ બનાવવામાં આવ્યો છું। 🚜🌾`,

            ta: `வணக்கம்! 🙏 நான் உங்கள் Smart Krishi Sahayak AI.

நான் இந்த விஷயங்களில் உங்களுக்கு உதவ முடியும்:

🌱 **பயிர் மேலாண்மை** - விதைப்பு முதல் அறுவடை வரை அனைத்தும்
🐛 **பூச்சி மற்றும் நோய் கட்டுப்பாடு** - இயற்கை மற்றும் இரசாயன இரண்டு வழிகளும்
🧪 **மண் ஆரோக்கியம் ** - மண் பரிசோதனை மற்றும் உரம் ஆலோசனை
💧 **நீர்ப்பாசனம்** - நீர் சேமிக்கும் வழிகள்
🌦️ **வானிலை** - வானிலை அடிப்படையில் பயிர் ஆலோசனை
💰 **சந்தை விலை** - எப்போது எங்கே விற்பது
🏛️ **அரசு திட்டங்கள்** - PM-KISAN, காப்பீடு, மானியம்
🧑‍🌾 **இயற்கை விவசாயம்** - இயற்கை முறையில் விவசாயம்

என்னிடம் எந்த விவசாய தொடர்பான கேள்வியையும் கேளுங்கள்! நான் இந்திய விவசாயிகளுக்காக சிறப்பாக உருவாக்கப்பட்டேன். 🚜🌾`,

            te: `నమస్కారం! 🙏 నేను మీ Smart Krishi Sahayak AI.

నేను ఈ విషయాలలో మీకు సహాయం చేయగలను:

🌱 **పంట నిర్వహణ** - విత్తనం నుండి పంట వరకు అన్నీ
🐛 **కీటకాలు మరియు వ్యాధుల నియంత్రణ** - సహజ మరియు రసాయన రెండు మార్గాలు
🧪 **మట్టి ఆరోగ్యం** - మట్టి పరీక్ష మరియు ఎరువుల సలహా
💧 **నీటిపారుదల** - నీటిని ఆదా చేసే మార్గాలు
🌦️ **వాతావరణం** - వాతావరణ ఆధారిత పంట సలహా
💰 **మార్కెట్ ధరలు** - ఎప్పుడు ఎక్కడ అమ్మాలి
🏛️ **ప్రభుత్వ పథకాలు** - PM-KISAN, బీమా, సబ్సిడీ
🧑‍🌾 **సేంద్రీయ వ్యవసాయం** - సహజ పద్ధతులతో వ్యవసాయం

నన్ను ఏదైనా వ్యవసాయ సంబంధిత ప్రశ్న అడగండి! నేను భారతీయ రైతుల కోసం ప్రత్యేకంగా రూపొందించబడ్డాను। 🚜🌾`,

            pa: `ਸਤ ਸ੍ਰੀ ਅਕਾਲ! 🙏 ਮੈਂ ਤੁਹਾਡਾ Smart Krishi Sahayak AI ਹਾਂ।

ਮੈਂ ਤੁਹਾਨੂੰ ਇਨ੍ਹਾਂ ਚੀਜ਼ਾਂ ਵਿੱਚ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ:

🌱 **ਫਸਲ ਪ੍ਰਬੰਧਨ** - ਬੀਜਾਈ ਤੋਂ ਵਾਢੀ ਤੱਕ ਸਭ ਕੁਝ
🐛 **ਕੀੜੇ ਅਤੇ ਬਿਮਾਰੀ ਨਿਯੰਤਰਣ** - ਕੁਦਰਤੀ ਅਤੇ ਰਸਾਇਣਕ ਦੋਵੇਂ ਉਪਾਅ
🧪 **ਮਿੱਟੀ ਦੀ ਸਿਹਤ** - ਮਿੱਟੀ ਜਾਂਚ ਅਤੇ ਖਾਦ ਸਲਾਹ
💧 **ਸਿੰਚਾਈ** - ਪਾਣੀ ਬਚਾਉਣ ਦੇ ਤਰੀਕੇ
🌦️ **ਮੌਸਮ** - ਮੌਸਮ ਅਨੁਸਾਰ ਫਸਲ ਸਲਾਹ
💰 **ਮਾਰਕੀਟ ਭਾਵ** - ਕਦੋਂ ਅਤੇ ਕਿੱਥੇ ਵੇਚਣਾ
🏛️ **ਸਰਕਾਰੀ ਯੋਜਨਾਵਾਂ** - PM-KISAN, ਬੀਮਾ, ਸਬਸਿਡੀ
🧑‍🌾 **ਜੈਵਿਕ ਖੇਤੀ** - ਕੁਦਰਤੀ ਤਰੀਕਿਆਂ ਨਾਲ ਖੇਤੀ

ਮੈਨੂੰ ਕੋਈ ਵੀ ਖੇਤੀ ਨਾਲ ਜੁੜਿਆ ਸਵਾਲ ਪੁੱਛੋ! ਮੈਂ ਭਾਰਤੀ ਕਿਸਾਨਾਂ ਲਈ ਖਾਸ ਤੌਰ 'ਤੇ ਬਣਾਇਆ ਗਿਆ ਹਾਂ। 🚜🌾`,

            bn: `নমস্কার! 🙏 আমি আপনার Smart Krishi Sahayak AI।

আমি এই বিষয়গুলিতে আপনাকে সাহায্য করতে পারি:

🌱 **ফসল ব্যবস্থাপনা** - বীজ বপন থেকে ফসল কাটা পর্যন্ত সব কিছু
🐛 **পোকামাকড় ও রোগ নিয়ন্ত্রণ** - প্রাকৃতিক ও রাসায়নিক উভয় উপায়
🧪 **মাটির স্বাস্থ্য** - মাটি পরীক্ষা ও সার পরামর্শ
💧 **সেচ** - পানি সাশ্রয়ের উপায়
🌦️ **আবহাওয়া** - আবহাওয়া অনুযায়ী ফসল পরামর্শ
💰 **বাজার দর** - কখন কোথায় বিক্রয় করবেন
🏛️ **সরকারি পরিকল্পনা** - PM-KISAN, বীমা, ভর্তুকি
🧑‍🌾 **জৈব চাষাবাদ** - প্রাকৃতিক পদ্ধতিতে চাষাবাদ

আমাকে যেকোনো কৃষি সংক্রান্ত প্রশ্ন করুন! আমি ভারতীয় কৃষকদের জন্য বিশেষভাবে তৈরি। 🚜🌾`,

            kn: `ನಮಸ್ಕಾರ! 🙏 ನಾನು ನಿಮ್ಮ Smart Krishi Sahayak AI.

ನಾನು ಈ ವಿಷಯಗಳಲ್ಲಿ ನಿಮಗೆ ಸಹಾಯ ಮಾಡಬಹುದು:

🌱 **ಬೆಳೆ ನಿರ್ವಹಣೆ** - ಬಿತ್ತನೆಯಿಂದ ಸುಗ್ಗಿಯವರೆಗೆ ಎಲ್ಲವೂ
🐛 **ಕೀಟ ಮತ್ತು ರೋಗ ನಿಯಂತ್ರಣ** - ನೈಸರ್ಗಿಕ ಮತ್ತು ರಾಸಾಯನಿಕ ಎರಡೂ ಮಾರ್ಗಗಳು
🧪 **ಮಣ್ಣಿನ ಆರೋಗ್ಯ** - ಮಣ್ಣು ಪರೀಕ್ಷೆ ಮತ್ತು ಗೊಬ್ಬರ ಸಲಹೆ
💧 **ನೀರಾವರಿ** - ನೀರು ಉಳಿಸುವ ವಿಧಾನಗಳು
🌦️ **ಹವಾಮಾನ** - ಹವಾಮಾನ ಆಧಾರಿತ ಬೆಳೆ ಸಲಹೆ
💰 **ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು** - ಯಾವಾಗ ಎಲ್ಲಿ ಮಾರಾಟ ಮಾಡಬೇಕು
🏛️ **ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು** - PM-KISAN, ವಿಮೆ, ಸಬ್ಸಿಡಿ
🧑‍🌾 **ಜೈವಿಕ ಕೃಷಿ** - ನೈಸರ್ಗಿಕ ವಿಧಾನಗಳಿಂದ ಕೃಷಿ

ನನ್ನನ್ನು ಯಾವುದೇ ಕೃಷಿ ಸಂಬಂಧಿತ ಪ್ರಶ್ನೆ ಕೇಳಿ! ನಾನು ಭಾರತೀಯ ರೈತರಿಗಾಗಿ ವಿಶೇಷವಾಗಿ ತಯಾರಿಸಲ್ಪಟ್ಟಿದ್ದೇನೆ। 🚜🌾`,

            ml: `നമസ്കാരം! 🙏 ഞാൻ നിങ്ങളുടെ Smart Krishi Sahayak AI ആണ്।

ഈ വിഷയങ്ങളിൽ എനിക്ക് നിങ്ങളെ സഹായിക്കാൻ കഴിയും:

🌱 **വിള പരിപാലനം** - വിതയൽ മുതൽ വിളവെടുപ്പ് വരെ എല്ലാം
🐛 **കീടങ്ങളും രോഗങ്ങളും നിയന്ത്രണം** - പ്രകൃതിദത്തവും രാസപരവുമായ രണ്ട് മാർഗങ്ങളും
🧪 **മണ്ണിന്റെ ആരോഗ്യം** - മണ്ണ് പരിശോധന, വള ഉപദേശം
💧 **ജലസേചനം** - ജലം ലാഭിക്കാനുള്ള വഴികൾ
🌦️ **കാലാവസ്ഥ** - കാലാവസ്ഥ അടിസ്ഥാനമാക്കിയുള്ള വിള ഉപദേശം
💰 **മാർക്കറ്റ് വില** - എപ്പോൾ എവിടെ വിൽക്കണം
🏛️ **സർക്കാർ പദ്ധതികൾ** - PM-KISAN, ഇൻഷുറൻസ്, സബ്സിഡി
🧑‍🌾 **ജൈവകൃഷി** - പ്രകൃതിദത്ത രീതികളിൽ കൃഷി

എന്നോട് ഏതെങ്കിലും കൃഷി സംബന്ധമായ ചോദ്യം ചോദിക്കൂ! ഞാൻ ഇന്ത്യൻ കർഷകർക്കായി പ്രത്യേകം രൂപകൽപ്പന ചെയ്തിട്ടുള്ളതാണ്। 🚜🌾`,

            or: `ନମସ୍କାର! 🙏 ମୁଁ ଆପଣଙ୍କର Smart Krishi Sahayak AI।

ଏହି ବିଷୟଗୁଡ଼ିକରେ ମୁଁ ଆପଣଙ୍କୁ ସାହାଯ୍ୟ କରିପାରିବି:

🌱 **ଫସଲ ପରିଚାଳନା** - ବୁଣାଠାରୁ ଅମଳ ପର୍ଯ୍ୟନ୍ତ ସବୁକିଛି
🐛 **କୀଟ ଓ ରୋଗ ନିୟନ୍ତ୍ରଣ** - ପ୍ରାକୃତିକ ଓ ରାସାୟନିକ ଉଭୟ ଉପାୟ
🧪 **ମାଟିର ସ୍ୱାସ୍ଥ୍ୟ** - ମାଟି ପରୀକ୍ଷା ଓ ସାର ପରାମର୍ଶ
💧 **ଜଳସେଚନ** - ପାଣି ସଞ୍ଚୟ ପଦ୍ଧତି
🌦️ **ପାଗ** - ପାଗ ଅନୁଯାୟୀ ଫସଲ ପରାମର୍ଶ
💰 **ବଜାର ଦର** - କେବେ କେଉଁଠାରେ ବିକ୍ରୟ କରିବେ
🏛️ **ସରକାରୀ ଯୋଜନା** - PM-KISAN, ବୀମା, ସବସିଡି
🧑‍🌾 **ଜୈବିକ ଚାଷ** - ପ୍ରାକୃତିକ ପଦ୍ଧତିରେ ଚାଷ

ମୋତେ ଯେକୌଣସି କୃଷି ସମ୍ବନ୍ଧୀୟ ପ୍ରଶ୍ନ ପଚାରନ୍ତୁ! ମୁଁ ଭାରତୀୟ କୃଷକଙ୍କ ପାଇଁ ବିଶେଷଭାବେ ତିଆରି। 🚜🌾`,

            ur: `آداب! 🙏 میں آپ کا Smart Krishi Sahayak AI ہوں۔

میں ان چیزوں میں آپ کی مدد کر سکتا ہوں:

🌱 **فصل کا انتظام** - بوائی سے فصل کی کٹائی تک سب کچھ
🐛 **کیڑے اور بیماری کا کنٹرول** - قدرتی اور کیمیائی دونوں طریقے
🧪 **مٹی کی صحت** - مٹی کا ٹیسٹ اور کھاد کی تجویز
💧 **آبپاشی** - پانی بچانے کے طریقے
🌦️ **موسم** - موسم کے مطابق فصل کی تجویز
💰 **مارکیٹ کے ریٹ** - کب اور کہاں بیچنا ہے
🏛️ **سرکاری اسکیمز** - PM-KISAN، انشورنس، سبسڈی
🧑‍🌾 **آرگینک کھیتی** - قدرتی طریقوں سے کھیتی

مجھ سے کوئی بھی زراعت سے متعلق سوال پوچھیں! میں خاص طور پر ہندوستانی کسانوں کے لیے بنایا گیا ہوں۔ 🚜🌾`,

            en: `Hello! 🙏 I'm your Smart Krishi Sahayak AI.

I can help you with:

🌱 **Crop Management** - From sowing to harvesting
🐛 **Pest & Disease Control** - Natural and chemical solutions  
🧪 **Soil Health** - Soil testing and fertilizer advice
💧 **Irrigation** - Water saving techniques
🌦️ **Weather** - Weather-based crop advice
💰 **Market Prices** - When and where to sell
🏛️ **Government Schemes** - PM-KISAN, insurance, subsidies
🧑‍🌾 **Organic Farming** - Natural farming methods

Ask me any agriculture-related question! I'm specially designed for Indian farmers. 🚜🌾`
          };
          
          return messages[lang] || messages.en;
        };
        
        const welcomeMessage = getWelcomeMessage(language);

        return {
          text: welcomeMessage,
          category: 'general',
          confidence: 1.0,
          suggestions: this.generateSuggestions('cropManagement', language)
        };
      }

      // Create the full prompt
      const fullPrompt = language === 'hi' 
        ? `आप एक कृषि विशेषज्ञ हैं। भारतीय किसानों को सरल और व्यावहारिक सलाह दें।

${userLocation ? `उपयोगकर्ता का स्थान: ${userLocation.district}, ${userLocation.state}` : ''}

सवाल: ${query}

कृपया हिंदी में विस्तृत जवाब दें।`
        : `You are an agricultural expert. Provide simple and practical advice to Indian farmers.

${userLocation ? `User location: ${userLocation.district}, ${userLocation.state}` : ''}

Question: ${query}

Please provide a detailed answer in English.`;

      // Try with retry logic and fallback model
      const responseText = await this.generateWithRetry(fullPrompt, 3);

      // Add to conversation history for context
      this.conversationHistory.push({
        role: 'user',
        parts: [{ text: query }]
      });
      this.conversationHistory.push({
        role: 'model',
        parts: [{ text: responseText }]
      });

      // Categorize the query
      const category = this.categorizeQuery(query, language);
      
      // Generate suggestions
      const suggestions = this.generateSuggestions(category, language);

      return {
        text: responseText,
        category,
        confidence: 0.9,
        suggestions
      };

    } catch (error) {
      console.error('Gemini AI Error:', error);
      
      // Check if it's a 503 (overloaded) error
      const isOverloadedError = error instanceof Error && 
        (error.message.includes('503') || error.message.includes('overloaded'));
      
      // Enhanced fallback messages for all supported languages
      const getFallbackMessage = (lang: string, isOverloaded: boolean = false) => {
        const messages: Record<string, string> = {
          hi: isOverloaded 
            ? `माफ करें, AI सेवा अभी बहुत व्यस्त है। 🚀

🔄 **कुछ मिनट बाद फिर से कोशिश करें**

इस बीच आप इन विषयों पर प्रश्न तैयार कर सकते हैं:
• 🌾 फसल की बुवाई और देखभाल
• 🐛 कीट और रोग नियंत्रण
• 🧪 मिट्टी और उर्वरक परीक्षण
• 💧 सिंचाई और पानी प्रबंधन
• 🌦️ मौसम का फसल पर प्रभाव
• 🏛️ सरकारी योजनाएं और सब्सिडी

आपके धैर्य के लिए धन्यवाद! 🙏`
            : `माफ करें, AI सेवा में अभी तकनीकी समस्या है। 😔

कृपया कुछ देर बाद फिर से कोशिश करें।`,
          
          mr: isOverloaded
            ? `माफ करा, AI सेवा सध्या खूप व्यस्त आहे। �

🔄 **कृपया काही मिनिटांनी पुन्हा प्रयत्न करा**

दरम्यान तुम्ही या विषयांवर प्रश्न तयार करू शकता:
• 🌾 पीक लागवड आणि काळजी
• 🐛 कीटक आणि रोग नियंत्रण
• 🧪 माती आणि खत चाचणी
• 💧 सिंचन आणि पाणी व्यवस्थापन
• 🌦️ हवामानाचा पिकांवर परिणाम
• 🏛️ सरकारी योजना आणि अनुदान

धैर्याबद्दल धन्यवाद! 🙏`
            : `माफ करा, AI सेवेत सध्या तांत्रिक समस्या आहे। 😔

कृपया काही वेळानी पुन्हा प्रयत्न करा।`,
          
          gu: isOverloaded
            ? `માફ કરશો, AI સેવા હાલમાં ખૂબ વ્યસ્ત છે। 🚀

🔄 **કૃપા કરીને થોડી મિનિટ પછી ફરી પ્રયાસ કરો**

આ દરમિયાન તમે આ વિષયો પર પ્રશ્નો તૈયાર કરી શકો છો:
• 🌾 પાક વાવેતર અને સંભાળ
• 🐛 જંતુ અને રોગ નિયંત્રણ
• 🧪 માટી અને ખાતર પરીક્ષણ
• 💧 સિંચાઈ અને પાણી વ્યવસ્થાપન
• 🌦️ હવામાનની પાક પર અસર
• 🏛️ સરકારી યોજનાઓ અને સબસિડી

તમારા ધૈર્ય માટે આભાર! 🙏`
            : `માફ કરશો, હાલમાં AI સેવામાં તકનીકી સમસ્યા છે। 😔

કૃપા કરીને થોડી વાર પછી ફરી પ્રયાસ કરો।`,
          
          ta: isOverloaded
            ? `மன்னிக்கவும், AI சேவை தற்போது மிகவும் பிஸியாக உள்ளது। 🚀

🔄 **சில நிமிடங்கள் கழித்து மீண்டும் முயற்சிக்கவும்**

இதற்கிடையில் இந்த தலைப்புகளில் கேள்விகளை தயார் செய்யலாம்:
• 🌾 பயிர் நடவு மற்றும் பராமரிப்பு
• 🐛 பூச்சி மற்றும் நோய் கட்டுப்பாடு
• 🧪 மண் மற்றும் உரம் சோதனை
• 💧 நீர்ப்பாசனம் மற்றும் நீர் மேலாண்மை
• 🌦️ பயிர்களில் காலநிலை தாக்கம்
• 🏛️ அரசு திட்டங்கள் மற்றும் மானியங்கள்

உங்கள் பொறுமைக்கு நன்றி! 🙏`
            : `மன்னிக்கவும், தற்போது AI சேவையில் தொழில்நுட்ப பிரச்சனை உள்ளது। 😔

சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்।`,
          
          te: isOverloaded
            ? `క్షమించండి, AI సేవ ప్రస్తుతం చాలా బిజీగా ఉంది। 🚀

🔄 **దయచేసి కొన్ని నిమిషాల తర్వాత మళ్లీ ప్రయత్నించండి**

ఈ మధ్యలో మీరు ఈ అంశాలపై ప్రశ్నలు సిద్ధం చేసుకోవచ్చు:
• 🌾 పంట నాటడం మరియు సంరక్షణ
• 🐛 పురుగుల మరియు వ్యాధుల నియంత్రణ
• 🧪 మట్టి మరియు ఎరువుల పరీక్ష
• 💧 నీటిపారుదల మరియు నీటి నిర్వహణ
• 🌦️ పంటలపై వాతావరణ ప్రభావం
• 🏛️ ప్రభుత్వ పథకాలు మరియు సబ్సిడీలు

మీ సహనానికి ధన్యవాదాలు! 🙏`
            : `క్షమించండి, ప్రస్తుతం AI సేవలో సాంకేతిక సమస్య ఉంది। 😔

దయచేసి కొంత సమయం తర్వాత మళ్లీ ప్రయత్నించండి।`,
          
          pa: isOverloaded
            ? `ਮਾਫ਼ ਕਰਨਾ, AI ਸੇਵਾ ਹੁਣ ਬਹੁਤ ਰੁੱਝੀ ਹੋਈ ਹੈ। 🚀

🔄 **ਕਿਰਪਾ ਕਰਕੇ ਕੁਝ ਮਿੰਟਾਂ ਬਾਅਦ ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ**

ਇਸ ਦੌਰਾਨ ਤੁਸੀਂ ਇਨ੍ਹਾਂ ਵਿਸ਼ਿਆਂ 'ਤੇ ਸਵਾਲ ਤਿਆਰ ਕਰ ਸਕਦੇ ਹੋ:
• 🌾 ਫਸਲ ਲਗਾਉਣਾ ਅਤੇ ਦੇਖਭਾਲ
• 🐛 ਕੀੜੇ ਅਤੇ ਬਿਮਾਰੀ ਨਿਯੰਤਰਣ
• 🧪 ਮਿੱਟੀ ਅਤੇ ਖਾਦ ਜਾਂਚ
• 💧 ਸਿੰਚਾਈ ਅਤੇ ਪਾਣੀ ਪ੍ਰਬੰਧਨ
• 🌦️ ਫਸਲਾਂ 'ਤੇ ਮੌਸਮ ਦਾ ਪ੍ਰਭਾਵ
• 🏛️ ਸਰਕਾਰੀ ਯੋਜਨਾਵਾਂ ਅਤੇ ਸਬਸਿਡੀ

ਤੁਹਾਡੇ ਸਬਰ ਲਈ ਧੰਨਵਾਦ! 🙏`
            : `ਮਾਫ਼ ਕਰਨਾ, ਹੁਣ AI ਸੇਵਾ ਵਿੱਚ ਤਕਨੀਕੀ ਸਮੱਸਿਆ ਹੈ। 😔

ਕਿਰਪਾ ਕਰਕੇ ਕੁਝ ਦੇਰ ਬਾਅਦ ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ।`,
          
          bn: isOverloaded
            ? `দুঃখিত, AI সেবা এখন খুব ব্যস্ত। 🚀

🔄 **অনুগ্রহ করে কয়েক মিনিট পর আবার চেষ্টা করুন**

এই সময়ে আপনি এই বিষয়গুলিতে প্রশ্ন প্রস্তুত করতে পারেন:
• 🌾 ফসল রোপণ এবং যত্ন
• 🐛 পোকামাকড় এবং রোগ নিয়ন্ত্রণ
• 🧪 মাটি এবং সার পরীক্ষা
• 💧 সেচ এবং পানি ব্যবস্থাপনা
• 🌦️ ফসলে আবহাওয়ার প্রভাব
• 🏛️ সরকারি পরিকল্পনা এবং ভর্তুকি

আপনার ধৈর্যের জন্য ধন্যবাদ! 🙏`
            : `দুঃখিত, এখন AI সেবায় প্রযুক্তিগত সমস্যা রয়েছে। 😔

অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।`,
          
          kn: isOverloaded
            ? `ಕ್ಷಮಿಸಿ, AI ಸೇವೆ ಈಗ ತುಂಬಾ ಬ್ಯುಸಿಯಾಗಿದೆ। 🚀

🔄 **ದಯವಿಟ್ಟು ಕೆಲವು ನಿಮಿಷಗಳ ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ**

ಈ ಮಧ್ಯೆ ನೀವು ಈ ವಿಷಯಗಳಲ್ಲಿ ಪ್ರಶ್ನೆಗಳನ್ನು ತಯಾರಿಸಬಹುದು:
• 🌾 ಬೆಳೆ ನೆಡುವಿಕೆ ಮತ್ತು ಆರೈಕೆ
• 🐛 ಕೀಟ ಮತ್ತು ರೋಗ ನಿಯಂತ್ರಣ
• 🧪 ಮಣ್ಣು ಮತ್ತು ಗೊಬ್ಬರ ಪರೀಕ್ಷೆ
• 💧 ನೀರಾವರಿ ಮತ್ತು ನೀರು ನಿರ್ವಹಣೆ
• 🌦️ ಬೆಳೆಗಳ ಮೇಲೆ ಹವಾಮಾನ ಪ್ರಭಾವ
• 🏛️ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು ಮತ್ತು ಸಬ್ಸಿಡಿ

ನಿಮ್ಮ ತಾಳ್ಮೆಗೆ ಧನ್ಯವಾದಗಳು! 🙏`
            : `ಕ್ಷಮಿಸಿ, ಈಗ AI ಸೇವೆಯಲ್ಲಿ ತಾಂತ್ರಿಕ ಸಮಸ್ಯೆ ಇದೆ। 😔

ದಯವಿಟ್ಟು ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ।`,
          
          ml: isOverloaded
            ? `ക്ഷമിക്കണം, AI സേവനം ഇപ്പോൾ വളരെ തിരക്കിലാണ്। 🚀

🔄 **ദയവായി കുറച്ച് മിനിറ്റ് കഴിഞ്ഞ് വീണ്ടും ശ്രമിക്കുക**

ഈ സമയത്ത് നിങ്ങൾക്ക് ഈ വിഷയങ്ങളിൽ ചോദ്യങ്ങൾ തയ്യാറാക്കാം:
• 🌾 വിള നടീൽ മറ്റും പരിചരണം
• 🐛 കീടങ്ങളും രോഗ നിയന്ത്രണവും
• 🧪 മണ്ണും വളവും പരിശോധന
• 💧 ജലസേചനവും ജല പരിപാലനവും
• 🌦️ വിളകളിലെ കാലാവസ്ഥാ പ്രഭാവം
• 🏛️ സർക്കാർ പദ്ധതികളും സബ്സിഡിയും

നിങ്ങളുടെ ക്ഷമയ്ക്ക് നന്ദി! 🙏`
            : `ക്ഷമിക്കണം, ഇപ്പോൾ AI സേവനത്തിൽ സാങ്കേതിക പ്രശ്നമുണ്ട്। 😔

ദയവായി കുറച്ച് സമയം കഴിഞ്ഞ് വീണ്ടും ശ്രമിക്കുക।`,
          
          or: isOverloaded
            ? `କ୍ଷମା କରନ୍ତୁ, AI ସେବା ବର୍ତ୍ତମାନ ବହୁତ ବ୍ୟସ୍ତ ଅଛି। 🚀

🔄 **ଦୟାକରି କିଛି ମିନିଟ ପରେ ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ**

ଏହି ସମୟରେ ଆପଣ ଏହି ବିଷୟଗୁଡ଼ିକରେ ପ୍ରଶ୍ନ ପ୍ରସ୍ତୁତ କରିପାରିବେ:
• 🌾 ଫସଲ ରୋପଣ ଏବଂ ଯତ୍ନ
• 🐛 କୀଟ ଏବଂ ରୋଗ ନିୟନ୍ତ୍ରଣ
• 🧪 ମାଟି ଏବଂ ସାର ପରୀକ୍ଷା
• 💧 ଜଳସେଚନ ଏବଂ ଜଳ ପରିଚାଳନା
• 🌦️ ଫସଲ ଉପରେ ପାଗର ପ୍ରଭାବ
• 🏛️ ସରକାରୀ ଯୋଜନା ଏବଂ ସବସିଡି

ଆପଣଙ୍କ ଧୈର୍ଯ୍ୟ ପାଇଁ ଧନ୍ୟବାଦ! 🙏`
            : `କ୍ଷମା କରନ୍ତୁ, ବର୍ତ୍ତମାନ AI ସେବାରେ ଯାନ୍ତ୍ରିକ ସମସ୍ୟା ଅଛି। 😔

ଦୟାକରି କିଛି ସମୟ ପରେ ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।`,
          
          ur: isOverloaded
            ? `معذرت، AI سروس فی الوقت بہت مصروف ہے۔ 🚀

🔄 **براہ کرم کچھ منٹ بعد دوبارہ کوشش کریں**

اس دوران آپ ان موضوعات پر سوالات تیار کر سکتے ہیں:
• 🌾 فصل کی بوائی اور دیکھ بھال
• 🐛 کیڑے اور بیماری کا کنٹرول
• 🧪 مٹی اور کھاد کا ٹیسٹ
• 💧 آبپاشی اور پانی کا انتظام
• 🌦️ فصلوں پر موسم کا اثر
• 🏛️ سرکاری اسکیمز اور سبسڈی

آپ کے صبر کے لیے شکریہ! 🙏`
            : `معذرت، فی الوقت AI سروس میں تکنیکی مسئلہ ہے۔ 😔

براہ کرم تھوڑی دیر بعد دوبارہ کوشش کریں۔`,
          
          en: isOverloaded
            ? `Sorry, the AI service is currently very busy. 🚀

🔄 **Please try again in a few minutes**

Meanwhile, you can prepare questions about:
• 🌾 Crop planting and care
• 🐛 Pest and disease control
• 🧪 Soil and fertilizer testing
• 💧 Irrigation and water management  
• 🌦️ Weather impact on crops
• 🏛️ Government schemes and subsidies

Thank you for your patience! 🙏`
            : `Sorry, I'm experiencing technical issues right now. 😔

You can ask questions about:
• Crop planting and care
• Pest and disease control
• Soil and fertilizers
• Irrigation and water management  
• Weather and crops
• Government schemes

Please try again in a moment.`
        };
        
        return messages[lang] || messages.en;
      };

      const fallbackMessage = getFallbackMessage(language, isOverloadedError);

      return {
        text: fallbackMessage,
        category: 'error',
        confidence: 0.1,
        suggestions: this.generateSuggestions('cropManagement', language)
      };
    }
  }

  public clearHistory(): void {
    this.conversationHistory = [];
  }

  public getConversationHistory(): any[] {
    return this.conversationHistory;
  }
}

export default new GeminiAiService();
