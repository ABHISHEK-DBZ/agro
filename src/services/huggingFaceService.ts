const HF_API_URL = 'https://api-inference.huggingface.co/models';
const DEFAULT_MODEL = 'HuggingFaceH4/zephyr-7b-beta';

interface HFResponse {
  text: string;
  category?: string;
  suggestions?: string[];
}

const CATEGORY_KEYWORDS: Array<[RegExp, string]> = [
  [/fertilizer|urea|compost|manure|npk|soil|मिट्टी|खाद/, 'soilHealth'],
  [/pest|insect|larva|blight|rust|wilt|fungus|कीट|रोग/, 'pestControl'],
  [/water|irrigat|drip|sprinkler|rain|पानी|सिंचाई/, 'irrigation'],
  [/weather|rainfall|monsoon|climate|मौसम|बारिश/, 'weatherImpact'],
  [/price|market|mandi|rate|quintal|भाव|मंडी/, 'marketPrices'],
  [/scheme|pm.kisan|pmfby|loan|subsid|योजना|पीएम/, 'governmentSchemes'],
  [/wheat|rice|cotton|sugarcane|maize|soybean|गेहूं|धान|कपास/, 'cropManagement'],
  [/organic|vermicompost|bio|natural|जैविक/, 'organicFarming'],
];

function detectCategory(text: string): string {
  const lower = text.toLowerCase();
  for (const [pattern, cat] of CATEGORY_KEYWORDS) {
    if (pattern.test(lower)) return cat;
  }
  return 'cropManagement';
}

class HuggingFaceService {
  private model: string;

  constructor() {
    this.model = DEFAULT_MODEL;
  }

  async query(prompt: string, language: string = 'en'): Promise<HFResponse> {
    const langInstruction = language === 'hi'
      ? 'हमेशा हिंदी में जवाब दें। किसानों के लिए सरल, व्यावहारिक सलाह दें। कोई markdown या asterisk (*) फॉर्मेटिंग का उपयोग न करें - सिर्फ सादा टेक्स्ट।'
      : 'Always answer in English. Give simple, practical farming advice for Indian farmers. Do NOT use markdown, asterisks, or any special formatting - just plain text.';

    const fullPrompt = `${langInstruction}\n\nQuestion: ${prompt}\n\nAnswer:`;

    const response = await fetch(`${HF_API_URL}/${this.model}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inputs: fullPrompt,
        parameters: {
          max_new_tokens: 300,
          temperature: 0.3,
          top_p: 0.9,
          do_sample: true,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`HuggingFace API error (${response.status}): ${errText.slice(0, 200)}`);
    }

    const data = await response.json();
    const text = data?.[0]?.generated_text?.replace(fullPrompt, '').trim() || '';

    return {
      text: text || 'I could not generate a response. Please try again.',
      category: detectCategory(prompt),
      suggestions: [],
    };
  }
}

const huggingFaceService = new HuggingFaceService();
export default huggingFaceService;
