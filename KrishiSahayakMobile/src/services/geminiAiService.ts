// Gemini AI Service for Mobile — uses REST API directly (no SDK dependency)
// Uses a demo key or user-provided key. Falls back to offline responses.

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

interface GeminiResponse {
  text: string;
  category: string;
  suggestions: string[];
}

class GeminiAiServiceMobile {
  private conversationHistory: { role: string; text: string }[] = [];

  private getSystemPrompt(language: string): string {
    return language === 'hi'
      ? 'आप एक विशेषज्ञ भारतीय कृषि सलाहकार हैं। सरल, व्यावहारिक सलाह दें। फसलों, मौसम, कीट नियंत्रण, मिट्टी, सिंचाई, सरकारी योजनाओं और जैविक खेती के बारे में जानकारी दें। केवल कृषि संबंधित प्रश्नों का उत्तर दें। हिंदी में जवाब दें।'
      : 'You are an expert Indian Agriculture Advisor. Give simple, practical advice. Provide information about crops, weather, pest control, soil, irrigation, government schemes, and organic farming. Only answer agriculture-related questions. Respond in English.';
  }

  private categorizeQuery(query: string): string {
    const keywords: Record<string, string[]> = {
      crop: ['crop', 'sow', 'harvest', 'seed', 'variety', 'plant', 'growing', 'cultivation', 'फसल', 'बुवाई', 'कटाई', 'बीज'],
      pest: ['pest', 'disease', 'insect', 'fungus', 'weed', 'treatment', 'कीट', 'रोग', 'बीमारी', 'कीड़े'],
      soil: ['soil', 'fertilizer', 'compost', 'manure', 'npk', 'ph', 'मिट्टी', 'खाद', 'उर्वरक'],
      irrigation: ['water', 'irrigation', 'drip', 'sprinkler', 'rain', 'पानी', 'सिंचाई'],
      weather: ['weather', 'temperature', 'climate', 'rainfall', 'मौसम', 'बारिश', 'तापमान'],
      market: ['price', 'market', 'sell', 'mandi', 'rate', 'भाव', 'मंडी', 'कीमत', 'बेचना'],
      scheme: ['scheme', 'government', 'subsidy', 'pm-kisan', 'insurance', 'योजना', 'सरकार', 'सब्सिडी'],
      organic: ['organic', 'natural', 'bio', 'जैविक', 'प्राकृतिक'],
    };

    const q = query.toLowerCase();
    for (const [category, words] of Object.entries(keywords)) {
      if (words.some(w => q.includes(w))) return category;
    }
    return 'general';
  }

  private generateSuggestions(category: string, lang: string): string[] {
    const all: Record<string, string[]> = {
      crop: lang === 'hi'
        ? ['इस मौसम में कौन सी फसल उगाएं?', 'गेहूं की बुवाई का सही समय?', 'फसल चक्र क्या है?']
        : ['Which crop to grow this season?', 'Best time to sow wheat?', 'What is crop rotation?'],
      pest: lang === 'hi'
        ? ['प्राकृतिक कीटनाशक कैसे बनाएं?', 'टमाटर के कीट नियंत्रण?', 'फसल रोग की पहचान?']
        : ['How to make natural pesticides?', 'Tomato pest control?', 'Identify crop diseases?'],
      soil: lang === 'hi'
        ? ['मिट्टी की जांच कैसे करें?', 'सबसे अच्छा उर्वरक कौन सा?', 'जैविक खाद कैसे बनाएं?']
        : ['How to test soil?', 'Which fertilizer is best?', 'How to make compost?'],
      irrigation: lang === 'hi'
        ? ['ड्रिप सिंचाई कैसे करें?', 'पानी बचाने के तरीके?', 'गेहूं की सिंचाई कब करें?']
        : ['How to set up drip irrigation?', 'Water saving techniques?', 'When to irrigate wheat?'],
      weather: lang === 'hi'
        ? ['मौसम का फसल पर प्रभाव?', 'गर्मी में फसल सुरक्षा?', 'बारिश से फसल बचाव?']
        : ['Weather impact on crops?', 'Protect crops in heat?', 'Save crops from rain?'],
      market: lang === 'hi'
        ? ['आज के मंडी भाव?', 'अपनी फसल कब बेचें?', 'सबसे अच्छा बाजार कौन सा?']
        : ['Today\'s mandi prices?', 'When to sell my crop?', 'Best market for selling?'],
      scheme: lang === 'hi'
        ? ['PM-KISAN योजना क्या है?', 'फसल बीमा कैसे लें?', 'KCC के लिए आवेदन कैसे करें?']
        : ['What is PM-KISAN?', 'How to get crop insurance?', 'How to apply for KCC?'],
      organic: lang === 'hi'
        ? ['जैविक खेती कैसे शुरू करें?', 'प्राकृतिक कीटनाशक रेसिपी?', 'जैविक प्रमाणीकरण कैसे लें?']
        : ['How to start organic farming?', 'Natural pesticide recipe?', 'How to get organic certification?'],
    };
    return all[category] || all.crop;
  }

  private getLocalResponse(query: string, lang: string): string | null {
    const q = query.toLowerCase();

    // PM-KISAN
    if (q.includes('pm-kisan') || q.includes('kisan samman') || q.includes('पीएम-किसान') || q.includes('किसान सम्मान')) {
      return lang === 'hi'
        ? '🇮🇳 **PM-KISAN योजना (प्रधानमंत्री किसान सम्मान निधि)**\n\n✅ हर साल ₹6,000 (3 किस्तों में ₹2,000 प्रति किस्त)\n✅ सीधे बैंक खाते में DBT\n✅ पात्रता: सभी भूमिधारक किसान\n✅ आधार कार्ड अनिवार्य\n✅ ऑनलाइन आवेदन: pmkisan.gov.in\n\nCSC केंद्र पर जाकर भी आवेदन कर सकते हैं।'
        : '🇮🇳 **PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)**\n\n✅ ₹6,000/year in 3 installments of ₹2,000\n✅ Direct Benefit Transfer to bank account\n✅ Eligibility: All landholding farmer families\n✅ Aadhaar card mandatory\n✅ Apply online: pmkisan.gov.in\n\nYou can also apply at your nearest CSC center.';
    }

    // Wheat
    if (q.includes('wheat') || q.includes('गेहूं') || q.includes('गेहूँ')) {
      return lang === 'hi'
        ? '🌾 **गेहूं की खेती**\n\n🌱 बुवाई: अक्टूबर-दिसंबर (रबी मौसम)\n🌡️ तापमान: 10-25°C\n🏜️ मिट्टी: दोमट मिट्टी, pH 6.0-7.5\n💧 सिंचाई: 4-6 बार (बुवाई के बाद, कल्ले निकलते समय, बाली निकलते समय, दूध पड़ने पर)\n🧪 खाद: DAP 50kg/एकड़, यूरिया 65kg/एकड़ (दो बार)\n📅 कटाई: मार्च-अप्रैल\n\nउन्नत किस्में: HD 2967, PBW 343, DBW 187 (बायोफोर्टिफाइड)'
        : '🌾 **Wheat Cultivation**\n\n🌱 Sowing: October-December (Rabi season)\n🌡️ Temperature: 10-25°C\n🏜️ Soil: Loamy, pH 6.0-7.5\n💧 Irrigation: 4-6 times (after sowing, tillering, heading, milking)\n🧪 Fertilizer: DAP 50kg/acre, Urea 65kg/acre (split)\n📅 Harvest: March-April\n\nImproved varieties: HD 2967, PBW 343, DBW 187 (biofortified)';
    }

    // Rice
    if (q.includes('rice') || q.includes('धान') || q.includes('चावल')) {
      return lang === 'hi'
        ? '🌾 **धान की खेती**\n\n🌱 बुवाई: जून-जुलाई (खरीफ मौसम)\n🌡️ तापमान: 20-35°C\n🏜️ मिट्टी: चिकनी मिट्टी, pH 5.5-7.0\n💧 पानी: 3-5 सेमी खड़ा पानी जरूरी\n🧪 खाद: नर्सरी में DAP, मुख्य खेत में यूरिया 3 बार\n📅 कटाई: अक्टूबर-नवंबर\n\nउन्नत किस्में: Pusa 44, PB 1121 (बासमती), DRR Dhan 45'
        : '🌾 **Rice Cultivation**\n\n🌱 Sowing: June-July (Kharif season)\n🌡️ Temperature: 20-35°C\n🏜️ Soil: Clayey, pH 5.5-7.0\n💧 Water: 3-5 cm standing water needed\n🧪 Fertilizer: DAP in nursery, Urea in main field (3 splits)\n📅 Harvest: October-November\n\nImproved varieties: Pusa 44, PB 1121 (Basmati), DRR Dhan 45';
    }

    // Tomato pest control
    if ((q.includes('tomato') || q.includes('टमाटर')) && (q.includes('pest') || q.includes('कीट') || q.includes('disease') || q.includes('रोग'))) {
      return lang === 'hi'
        ? '🍅 **टमाटर के कीट एवं रोग नियंत्रण**\n\n🐛 **फल छेदक कीट**: नीम तेल 5ml/लीटर छिड़काव\n🍂 **झुलसा रोग**: बोर्डो मिश्रण 1% का छिड़काव\n🌿 **मोज़ेक वायरस**: प्रभावित पौधे हटाएं\n🕷️ **मकड़ी**: सल्फर 2g/लीटर\n\n✅ रोकथाम: फसल चक्र अपनाएं, संक्रमित पौधे हटाएं, जैविक कीटनाशकों का उपयोग करें'
        : '🍅 **Tomato Pest & Disease Control**\n\n🐛 **Fruit Borer**: Spray neem oil 5ml/liter\n🍂 **Blight**: Spray 1% Bordeaux mixture\n🌿 **Mosaic Virus**: Remove infected plants\n🕷️ **Red Spider Mite**: Sulfur 2g/liter\n\n✅ Prevention: Practice crop rotation, remove infected plants, use organic pesticides';
    }

    // Soil testing
    if ((q.includes('soil test') || q.includes('मिट्टी जांच') || q.includes('मिट्टी परीक्षण')) && (q.includes('how') || q.includes('कैसे'))) {
      return lang === 'hi'
        ? '🧪 **मिट्टी परीक्षण कैसे करें?**\n\n1. अपने खेत के अलग-अलग हिस्सों से मिट्टी के नमूने लें\n2. 6-8 इंच गहराई से नमूना लें\n3. सभी नमूनों को मिलाकर 500g मिट्टी तैयार करें\n4. नजदीकी कृषि विज्ञान केंद्र (KVK) या मिट्टी जांच प्रयोगशाला में जमा करें\n5. 2 सप्ताह में रिपोर्ट मिल जाएगी\n\n💰 मृदा स्वास्थ्य कार्ड योजना के तहत मुफ्त मिट्टी जांच हर 2 साल में उपलब्ध है।'
        : '🧪 **How to Test Soil?**\n\n1. Collect soil samples from different parts of your field\n2. Dig 6-8 inches deep for the sample\n3. Mix all samples and prepare 500g of soil\n4. Submit at nearest KVK or soil testing lab\n5. Get report within 2 weeks\n\n💰 Free soil testing every 2 years under Soil Health Card scheme.';
    }

    // Default
    return null;
  }

  async getAgricultureResponse(
    query: string,
    language: string = 'en',
  ): Promise<GeminiResponse> {
    // Trim
    const trimmed = query.trim();
    if (!trimmed) {
      return {
        text: language === 'hi'
          ? 'नमस्ते! 🙏 मैं आपका कृषि सहायक हूं। फसलों, मौसम, कीट नियंत्रण और सरकारी योजनाओं के बारे में पूछें।'
          : 'Hello! 🙏 I\'m your Krishi Sahayak AI. Ask me about crops, weather, pest control, and government schemes.',
        category: 'general',
        suggestions: this.generateSuggestions('crop', language),
      };
    }

    const category = this.categorizeQuery(trimmed);

    // Try local response first (instant + works offline)
    const local = this.getLocalResponse(trimmed, language);
    if (local) {
      return {
        text: local,
        category,
        suggestions: this.generateSuggestions(category, language),
      };
    }

    // Try Gemini API if key is configured
    if (GEMINI_API_KEY && GEMINI_API_KEY.length > 10) {
      try {
        const prompt = `${this.getSystemPrompt(language)}
        
User question: ${trimmed}

Provide a detailed, practical answer suitable for Indian farmers. Include specific crop names, regional info, and actionable steps. Keep it concise (under 300 words).`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.5,
                maxOutputTokens: 600,
                topP: 0.9,
              },
            }),
          },
        );

        if (!response.ok) {
          throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (text) {
          // Add to history
          this.conversationHistory.push({ role: 'user', text: trimmed });
          this.conversationHistory.push({ role: 'model', text });

          return {
            text,
            category,
            suggestions: this.generateSuggestions(category, language),
          };
        }
      } catch (err) {
        console.warn('[GeminiService] API call failed:', err);
      }
    }

    // Fallback — provide helpful info
    return {
      text: language === 'hi'
        ? `मैंने आपका प्रश्न नोट किया: "${trimmed}"\n\nमैं इन विषयों पर आपकी मदद कर सकता हूं:\n\n🌾 फसल प्रबंधन — बुवाई, खाद, सिंचाई, कटाई\n🐛 कीट नियंत्रण — प्राकृतिक और रासायनिक उपाय\n🧪 मिट्टी — जांच, उर्वरक, जैविक खाद\n💧 सिंचाई — पानी बचाने के तरीके\n💰 बाजार भाव — मंडी दर और बिक्री\n🏛️ सरकारी योजनाएं — PM-KISAN, बीमा, KCC\n\nAI सेवा कनेक्ट करने के लिए VITE_GEMINI_API_KEY को .env में सेट करें। तब तक मैं सीमित जानकारी दे सकता हूं।`
        : `I noted your question: "${trimmed}"\n\nI can help you with these topics:\n\n🌾 Crop Management — sowing, fertilizer, irrigation, harvest\n🐛 Pest Control — natural and chemical solutions\n🧪 Soil Health — testing, fertilizers, compost\n💧 Irrigation — water saving techniques\n💰 Market Prices — mandi rates, selling tips\n🏛️ Government Schemes — PM-KISAN, insurance, KCC\n\nTo connect AI, set VITE_GEMINI_API_KEY in your .env file. Until then I can provide limited info.`,
      category,
      suggestions: this.generateSuggestions(category, language),
    };
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }
}

export const geminiAiService = new GeminiAiServiceMobile();
export default geminiAiService;
