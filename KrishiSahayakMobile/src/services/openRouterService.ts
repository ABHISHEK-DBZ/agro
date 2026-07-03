/**
 * OpenRouter AI Service — Mobile Version
 *
 * Uses the OpenRouter API (https://openrouter.ai) to access free/open LLM models
 * via an OpenAI-compatible chat-completions endpoint.
 *
 * Set EXPO_PUBLIC_OPENROUTER_API_KEY in .env
 * Default model: openrouter/free
 */

import storageService, { KEYS } from './storage';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'openrouter/free';
const APP_NAME = 'Krishi Sahayak';

const SYSTEM_PROMPT = (language: string) => {
  const langName: Record<string, string> = {
    en: 'English',
    hi: 'Hindi (Devanagari script)',
    bn: 'Bengali',
    mr: 'Marathi',
    gu: 'Gujarati',
    ta: 'Tamil',
    te: 'Telugu',
    pa: 'Punjabi (Gurmukhi script)',
    kn: 'Kannada',
    ml: 'Malayalam',
    or: 'Odia',
    ur: 'Urdu',
  };
  const lang = langName[language] ?? 'English';
  return `You are "Krishi Sahayak", a friendly and practical agriculture advisor for Indian farmers.

Always answer in ${lang}. Be specific to Indian agricultural conditions, climates, and crops. Keep answers concise (2-4 short paragraphs) and actionable. Do NOT use markdown or special formatting — just plain text.

You can help with:
- Crop selection, sowing schedules, and rotations
- Soil health, fertilizers, and organic amendments
- Pest and disease identification and treatment
- Irrigation, water management, and weather impact
- Market prices, government schemes (PM-KISAN, PMFBY, KCC, etc.)
- Organic / natural farming, soil testing, equipment
- Livestock, dairy, and integrated farming

If you don't know, say so and recommend the user contact a local Krishi Vigyan Kendra (KVK) or the Kisan Call Centre (1551). Never invent specific subsidy amounts or scheme deadlines.`;
};

export interface OpenRouterResponse {
  text: string;
  category?: string;
  suggestions?: string[];
}

const CATEGORY_KEYWORDS: Array<[RegExp, string]> = [
  [/fertilizer|urea|compost|manure|npk/i, 'soilHealth'],
  [/pest|insect|larva|blight|rust|wilt|fungus/i, 'pestControl'],
  [/water|irrigat|drip|sprinkler|rain/i, 'irrigation'],
  [/weather|rainfall|monsoon|climate/i, 'weatherImpact'],
  [/price|market|mandi|rate|quintal|kg/i, 'marketPrices'],
  [/scheme|pm-kisan|pmfby|kyc|loan|subsid/i, 'governmentSchemes'],
  [/wheat|rice|cotton|sugarcane|maize|soybean|chickpea/i, 'cropManagement'],
  [/organic|vermicompost|bio|natural/i, 'organicFarming'],
];

const SUGGESTIONS: Record<string, string> = {
  cropManagement: 'Best crop for my soil?',
  pestControl: 'How to identify pests?',
  soilHealth: 'How to improve soil fertility?',
  irrigation: 'How much water does wheat need?',
  weatherImpact: 'Will it rain this week?',
  marketPrices: 'Current tomato mandi rate?',
  governmentSchemes: 'How to apply for PMFBY?',
  organicFarming: 'Vermicompost preparation steps?',
};

function detectCategory(text: string): string {
  const lower = text.toLowerCase();
  for (const [pattern, cat] of CATEGORY_KEYWORDS) {
    if (pattern.test(lower)) return cat;
  }
  return 'cropManagement';
}

class OpenRouterService {
  private apiKey: string = '';
  private model: string = DEFAULT_MODEL;
  private history: { role: 'user' | 'assistant'; content: string }[] = [];

  async initialize() {
    // Try env first, then storage
    const envKey = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;
    const storedKey = await storageService.getItem<string>('openrouter_api_key');
    this.apiKey = storedKey || envKey || '';
    this.model = process.env.EXPO_PUBLIC_OPENROUTER_MODEL || DEFAULT_MODEL;
  }

  async setApiKey(key: string) {
    this.apiKey = key;
    await storageService.setItem('openrouter_api_key', key);
  }

  clearHistory() {
    this.history = [];
  }

  get isConfigured(): boolean {
    return !!this.apiKey;
  }

  async getAgricultureResponse(
    prompt: string,
    language: string = 'en',
    _location?: any,
  ): Promise<OpenRouterResponse> {
    return this.chat(prompt, language);
  }

  async chat(prompt: string, language: string = 'en'): Promise<OpenRouterResponse> {
    // If no API key, throw a clear error
    if (!this.apiKey) {
      return this.localFallback(prompt, language);
    }

    try {
      const body = {
        model: this.model,
        messages: [
          { role: 'system' as const, content: SYSTEM_PROMPT(language) },
          ...this.history.slice(-10),
          { role: 'user' as const, content: prompt },
        ],
        max_tokens: 800,
        temperature: 0.5,
      };

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'https://krishi-sahayak.app',
          'X-Title': APP_NAME,
        },
        body: JSON.stringify(body),
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`OpenRouter error (${response.status}): ${errText.slice(0, 200)}`);
      }

      const data = await response.json();
      const text: string =
        data?.choices?.[0]?.message?.content?.trim() ||
        'I could not generate a response right now. Please try again.';

      this.history.push({ role: 'user', content: prompt });
      this.history.push({ role: 'assistant', content: text });
      if (this.history.length > 20) {
        this.history = this.history.slice(-20);
      }

      const category = detectCategory(prompt);
      return {
        text,
        category,
        suggestions: [SUGGESTIONS[category] || SUGGESTIONS.cropManagement],
      };
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return this.localFallback(prompt, language);
      }
      return this.localFallback(prompt, language);
    }
  }

  private localFallback(prompt: string, language: string): OpenRouterResponse {
    const lower = prompt.toLowerCase();
    const isHindi = /[\u0900-\u097F]/.test(prompt);
    const category = detectCategory(prompt);

    // Local knowledge base for common farming questions
    if (lower.includes('wheat') || lower.includes('गेहूं')) {
      return {
        text: isHindi || language === 'hi'
          ? 'गेहूं की खेती के लिए: उपयुक्त तापमान 15-25°C, मिट्टी दोमट या बलुई दोमट उपयुक्त है। बुवाई का समय अक्टूबर-नवंबर, कटाई मार्च-अप्रैल। सिंचाई 4-5 बार आवश्यक है। उर्वरक: नाइट्रोजन 120 किग्रा, फास्फोरस 60 किग्रा, पोटाश 40 किग्रा प्रति हेक्टेयर। उन्नत किस्में: HD-2967, PBW-550, WH-1105। सरसों, चना, मटर के साथ मिश्रित खेती लाभदायक।'
          : 'For wheat farming: Suitable temp 15-25°C, loamy/sandy-loam soil. Sow Oct-Nov, harvest Mar-Apr. Need 4-5 irrigations. Fertilizer: N 120kg, P 60kg, K 40kg/ha. Varieties: HD-2967, PBW-550, WH-1105. Intercrop with mustard, chickpea, peas.',
      };
    }
    if (lower.includes('rice') || lower.includes('धान')) {
      return {
        text: isHindi || language === 'hi'
          ? 'धान की खेती: तापमान 25-35°C, चिकनी या दोमट मिट्टी उपयुक्त। खरीफ मौसम में जून-जुलाई में रोपाई, अक्टूबर-नवंबर में कटाई। खड़ी फसल में 5-7 सेमी पानी खड़ा रहना चाहिए। उर्वरक: N 100-120 किग्रा, P 50-60 किग्रा, K 40-50 किग्रा/हेक्टेयर। उन्नत किस्में: Pusa Basmati-1, PB-1121, IR-64, MTU-1010। सिफारिश: धान-गेहूं फसल चक्र अपनाएं।'
          : 'For rice farming: Temp 25-35°C, clay/loam soil. Transplant June-July (Kharif), harvest Oct-Nov. Maintain 5-7cm standing water. Fertilizer: N 100-120kg, P 50-60kg, K 40-50kg/ha. Varieties: Pusa Basmati-1, PB-1121, IR-64, MTU-1010. Recommend rice-wheat rotation.',
      };
    }
    if (lower.includes('pm-kisan') || lower.includes('पीएम-किसान') || (lower.includes('kisan') && lower.includes('scheme'))) {
      return {
        text: isHindi || language === 'hi'
          ? 'PM-KISAN योजना के तहत सभी भूमिधारक किसान परिवारों को ₹6,000 प्रति वर्ष तीन समान किस्तों में दिए जाते हैं। पात्रता: भूमिधारक किसान। आवेदन: अपने नजदीकी कृषि सेवा केंद्र या pmkisan.gov.in पर ऑनलाइन करें। जरूरी दस्तावेज: आधार, भूमि रिकॉर्ड, बैंक खाता। अधिक जानकारी के लिए किसान कॉल सेंटर 1551 पर संपर्क करें।'
          : 'PM-KISAN provides ₹6,000/year to landholding farmer families in 3 equal installments. Apply at pmkisan.gov.in or nearest agriculture office. Documents: Aadhaar, land records, bank account. Contact Kisan Call Centre 1551 for more info.',
      };
    }
    if (lower.includes('soil') || lower.includes('मिट्टी') || lower.includes('testing')) {
      return {
        text: isHindi || language === 'hi'
          ? 'मिट्टी परीक्षण हर 2-3 साल में करवाना चाहिए। नमूना 6-8 इंच गहराई से लें। सरकारी प्रयोगशालाओं में मुफ्त परीक्षण उपलब्ध है। आदर्श pH: 6.0-7.5। नाइट्रोजन (N): 280-560 kg/ha, फास्फोरस (P): 22-60 kg/ha, पोटैशियम (K): 140-280 kg/ha। जैविक कार्बन 0.5-0.75% से अधिक होना चाहिए। मिट्टी की सेहत सुधारने के लिए गोबर की खाद, कम्पोस्ट और हरी खाद का उपयोग करें।'
          : 'Test soil every 2-3 years. Sample from 6-8 inches depth. Free testing at govt labs. Ideal pH: 6.0-7.5. N: 280-560 kg/ha, P: 22-60 kg/ha, K: 140-280 kg/ha. Organic carbon >0.5-0.75%. Use FYM, compost, green manure to improve soil health.',
      };
    }
    if (lower.includes('tomato') || lower.includes('टमाटर')) {
      return {
        text: isHindi || language === 'hi'
          ? 'टमाटर की खेती: तापमान 20-30°C, बलुई दोमट मिट्टी उपयुक्त। रोपाई से 60-70 दिन बाद फल तैयार। सामान्य कीट: फल छेदक, सफेद मक्खी। रोग: अगेती झुलसा, पछेती झुलसा। उपचार: नीम तेल 2% का छिड़काव या कवकनाशी का प्रयोग। प्रति पौधा 3-4 किग्रा उपज। बाजार मूल्य: ₹20-60/किग्रा (मौसमानुसार)।'
          : 'Tomato farming: Temp 20-30°C, sandy loam soil. Ready 60-70 days after transplant. Pests: fruit borer, whitefly. Diseases: early/late blight. Treatment: neem oil 2% spray or fungicides. Yield: 3-4 kg/plant. Market price: ₹20-60/kg depending on season.',
      };
    }

    // Generic fallback
    return {
      text: isHindi || language === 'hi'
        ? 'मैं आपकी कृषि संबंधी सहायता के लिए यहां हूं। कृपया फसल, मौसम, मिट्टी, या किसी कृषि विषय के बारे में पूछें। अधिक जानकारी के लिए अपने नजदीकी कृषि विज्ञान केंद्र (KVK) या किसान कॉल सेंटर (1551) पर संपर्क करें।'
        : 'I\'m here to help with your agriculture questions. Ask me about crops, weather, soil, pests, government schemes, or any farming topic. For more info, contact your nearest KVK or Kisan Call Centre (1551).',
      category,
      suggestions: [SUGGESTIONS[category] || 'Best crop for my soil?'],
    };
  }
}

const openRouterService = new OpenRouterService();
export default openRouterService;
