/**
 * OpenRouter AI Service
 *
 * Uses the OpenRouter API (https://openrouter.ai) — an open-source LLM router
 * that supports many models via a single OpenAI-compatible chat-completions
 * endpoint. The user has provisioned:
 *   - key: sk-or-v1-... (configured in .env / .env.example)
 *   - model: google/gemma-4-26b-a4b-it:free
 *
 * Set `VITE_OPENROUTER_API_KEY` and `VITE_OPENROUTER_MODEL` in your .env.
 * If the key is missing, requests throw a clear, recoverable error.
 */

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'openrouter/free';
const APP_NAME = 'Smart Krishi Sahayak';

const SYSTEM_PROMPT = (language: string) => {
  const langName: Record<string, string> = {
    en: 'English',
    hi: 'Hindi (Devanagari script)',
    mr: 'Marathi (Devanagari script)',
    gu: 'Gujarati',
    ta: 'Tamil',
    te: 'Telugu',
    pa: 'Punjabi (Gurmukhi script)',
    bn: 'Bengali',
    kn: 'Kannada',
    ml: 'Malayalam',
    or: 'Odia',
    ur: 'Urdu',
  };
  const lang = langName[language] ?? 'English';
  return `You are "Smart Krishi Sahayak", a friendly and practical agriculture advisor for Indian farmers.

Always answer in ${lang}. Be specific to Indian agricultural conditions, climates, and crops. Keep answers concise (2–4 short paragraphs or bullet points) and actionable. Do NOT use markdown, asterisks, or any special formatting — just plain text.

You can help with:
- Crop selection, sowing schedules, and rotations
- Soil health, fertilizers, and organic amendments
- Pest and disease identification and treatment
- Irrigation, water management, and weather impact
- Market prices, government schemes (PM-KISAN, PMFBY, KCC, etc.), subsidies
- Organic / natural farming, soil testing, equipment
- Livestock, dairy, and integrated farming

If you don't know, say so and recommend the user contact a local Krishi Vigyan Kendra (KVK) or the Kisan Call Centre (1551). Never invent specific subsidy amounts or scheme deadlines.`;
};

export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OpenRouterChatResponse {
  text: string;
  category?: string;
  confidence?: number;
  suggestions?: string[];
  raw?: any;
}

const CATEGORY_KEYWORDS: Array<[string, string]> = [
  ['fertilizer|urea|compost|manure|npk', 'soilHealth'],
  ['pest|insect|larva|blight|rust|wilt|fungus', 'pestControl'],
  ['water|irrigat|drip|sprinkler|rain', 'irrigation'],
  ['weather|rainfall|monsoon|climate', 'weatherImpact'],
  ['price|market|mandi|rate|quintal|kg', 'marketPrices'],
  ['scheme|pm-kisan|pmfby|kyc|loan|subsid', 'governmentSchemes'],
  ['wheat|rice|cotton|sugarcane|maize|soybean|chickpea', 'cropManagement'],
  ['organic|vermicompost|bio|natural', 'organicFarming'],
];

const SUGGESTION_KEYWORDS: Record<string, string> = {
  cropManagement: 'Best crop for my soil?',
  pestControl: 'How to identify pests on my crop?',
  soilHealth: 'How to improve soil fertility organically?',
  irrigation: 'How much water does wheat need?',
  weatherImpact: 'Will it rain this week?',
  marketPrices: 'Current tomato mandi rate?',
  governmentSchemes: 'How to apply for PMFBY?',
  organicFarming: 'Vermicompost preparation steps?',
};

function detectCategory(text: string): string {
  const lower = text.toLowerCase();
  for (const [pattern, cat] of CATEGORY_KEYWORDS) {
    if (new RegExp(pattern).test(lower)) return cat;
  }
  return 'cropManagement';
}

class OpenRouterService {
  private apiKey: string;
  private model: string;
  private history: { role: 'user' | 'assistant'; content: string }[] = [];

  constructor() {
    const envKey = import.meta.env.VITE_OPENROUTER_API_KEY as string | undefined;
    this.model =
      (import.meta.env.VITE_OPENROUTER_MODEL as string | undefined) || DEFAULT_MODEL;
    this.apiKey = envKey || '';
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('openrouter:apiKey');
      if (stored) this.apiKey = stored;
    }
  }

  clearHistory() {
    this.history = [];
  }

  /** Allow the user to set the API key from the UI at runtime. */
  updateKey(key: string | undefined) {
    if (key) {
      this.apiKey = key;
    } else {
      const envKey = import.meta.env.VITE_OPENROUTER_API_KEY as string | undefined;
      this.apiKey = envKey || '';
    }
  }

  /** Bootstrap: if the user previously saved a key in localStorage, use it. */
  hydrate() {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('openrouter:apiKey');
      if (stored) this.apiKey = stored;
    }
  }

  async chat(
    prompt: string,
    language: string = 'en',
  ): Promise<OpenRouterChatResponse> {
    if (!this.apiKey) {
      throw new Error(
        'VITE_OPENROUTER_API_KEY is not configured. Add it in your .env file or go to Settings to set your API key.',
      );
    }
    const body = {
      model: this.model,
      messages: [
        { role: 'system' as const, content: SYSTEM_PROMPT(language) },
        ...this.history,
        { role: 'user' as const, content: prompt },
      ],
      max_tokens: 800,
      temperature: 0.5,
    };

    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://smart-krishi.app',
        'X-Title': APP_NAME,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(
        `OpenRouter request failed (${response.status}): ${errText.slice(0, 200)}`,
      );
    }

    const data = await response.json();
    const text: string =
      data?.choices?.[0]?.message?.content?.trim() ||
      'I could not generate a response right now. Please try again.';

    this.history.push({ role: 'user', content: prompt });
    this.history.push({ role: 'assistant', content: text });
    // Keep history bounded.
    if (this.history.length > 20) {
      this.history = this.history.slice(-20);
    }

    const category = detectCategory(prompt);
    return {
      text,
      category,
      confidence: 0.85,
      suggestions: [SUGGESTION_KEYWORDS[category] || SUGGESTION_KEYWORDS.cropManagement],
      raw: data,
    };
  }

  async getAgricultureResponse(
    prompt: string,
    language: string = 'en',
    _location?: any,
  ): Promise<OpenRouterChatResponse> {
    return this.chat(prompt, language);
  }
}

const openRouterService = new OpenRouterService();
openRouterService.hydrate();

/**
 * Allow the user to set the API key from the UI (Settings page). The key is
 * stored in localStorage so the user doesn't have to set an env var. If the
 * caller never calls this, the service falls back to the env var.
 */
const STORAGE_KEY = 'openrouter:apiKey';
export const setOpenRouterKey = (key: string) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, key);
  }
  openRouterService.updateKey(key);
};
export const clearOpenRouterKey = () => {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
  openRouterService.updateKey(import.meta.env.VITE_OPENROUTER_API_KEY as string | undefined);
};

export default openRouterService;
