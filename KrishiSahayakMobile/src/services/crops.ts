// Crop Information Service
import { Crop, CropVariety } from '../types';

class CropService {
  private crops: Crop[] = [
    {
      id: 'wheat',
      name: { en: 'Wheat', hi: 'गेहूं' },
      season: 'Rabi',
      duration: '120-150 days',
      soilType: 'Well-drained loamy soil',
      climate: 'Cool and dry climate',
      temperature: '15-25°C',
      rainfall: '50-75 cm annually',
      majorStates: ['Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh', 'Rajasthan'],
      bestPractices: {
        en: [
          'Sow in November-December (Rabi season)',
          'Use certified seeds (100-125 kg/hectare)',
          'Apply NPK fertilizer (120:60:40 kg/hectare)',
          'Irrigate at Crown Root Initiation (CRI) stage',
          'Control weeds within 30 days of sowing',
          'Harvest when grains are hard and golden',
        ],
        hi: [
          'नवंबर-दिसंबर में बुवाई करें',
          'प्रमाणित बीज का उपयोग करें (100-125 किग्रा/हेक्टेयर)',
          'NPK उर्वरक डालें (120:60:40 किग्रा/हेक्टेयर)',
          'क्राउन रूट इनिशिएशन अवस्था पर सिंचाई करें',
          'बुवाई के 30 दिनों के भीतर खरपतवार नियंत्रित करें',
          'दाने सख्त और सुनहरे होने पर कटाई करें',
        ],
      },
      diseases: ['Rust (किट्ट)', 'Smut (कंडवा)', 'Blight (झुलसा)', 'Powdery Mildew'],
      avgYield: '3.5-4.5 tons/hectare',
      varieties: [
        { name: 'PBW 343', duration: '140 days', yield: '4.5 t/ha', features: ['High yield', 'Rust resistant'] },
        { name: 'HD 2967', duration: '135 days', yield: '4.2 t/ha', features: ['Wide adaptation', 'Good quality'] },
        { name: 'DBW 187', duration: '130 days', yield: '5.0 t/ha', features: ['Biofortified', 'Zinc rich'] },
      ],
      irrigation: '5-6 irrigations at CRI, tillering, jointing, flowering, milking, dough stages',
      fertilizer: 'Nitrogen: 120 kg/ha, Phosphorus: 60 kg/ha, Potash: 40 kg/ha',
    },
    {
      id: 'rice',
      name: { en: 'Rice', hi: 'धान' },
      season: 'Kharif',
      duration: '90-150 days',
      soilType: 'Clay loam with good water retention',
      climate: 'Hot and humid climate',
      temperature: '20-35°C',
      rainfall: '100-200 cm annually',
      majorStates: ['West Bengal', 'Uttar Pradesh', 'Punjab', 'Andhra Pradesh', 'Bihar'],
      bestPractices: {
        en: [
          'Prepare nursery for 25-30 days before transplanting',
          'Transplant 2-3 seedlings per hill at 20×15 cm spacing',
          'Maintain 2-5 cm water depth throughout growing period',
          'Apply nitrogen in 3 splits: basal, tillering, panicle initiation',
          'Control stem borer and leaf folder with recommended pesticides',
          'Harvest at 80% maturity when grains turn golden',
        ],
        hi: [
          'रोपाई से 25-30 दिन पहले नर्सरी तैयार करें',
          'प्रति स्थान 2-3 पौधे 20×15 सेमी की दूरी पर लगाएं',
          'पूरी अवधि में 2-5 सेमी पानी बनाए रखें',
          'नाइट्रोजन को 3 भागों में डालें',
          'तना छेदक और पत्ती लपेटक का नियंत्रण करें',
          '80% परिपक्वता पर कटाई करें',
        ],
      },
      diseases: ['Blast (झुलसा)', 'Brown Spot (भूरा धब्बा)', 'Sheath Blight (पत्ती झुलसा)', 'Bacterial Blight'],
      avgYield: '4-6 tons/hectare',
      varieties: [
        { name: 'Basmati 1121', duration: '145 days', yield: '4.5 t/ha', features: ['Premium aroma', 'Export quality'] },
        { name: 'PB 1509', duration: '120 days', yield: '5.0 t/ha', features: ['Early maturity', 'High yield'] },
        { name: 'CR Dhan 307', duration: '135 days', yield: '5.5 t/ha', features: ['Drought tolerant', 'Disease resistant'] },
      ],
      irrigation: 'Continuous flooding 2-5 cm depth; drain 2 weeks before harvest',
      fertilizer: 'Nitrogen: 100-150 kg/ha, Phosphorus: 60 kg/ha, Potash: 40 kg/ha',
    },
    {
      id: 'cotton',
      name: { en: 'Cotton', hi: 'कपास' },
      season: 'Kharif',
      duration: '150-180 days',
      soilType: 'Deep black cotton soil with good drainage',
      climate: 'Warm and sunny with long growing season',
      temperature: '21-30°C',
      rainfall: '50-100 cm annually',
      majorStates: ['Gujarat', 'Maharashtra', 'Telangana', 'Punjab', 'Rajasthan'],
      bestPractices: {
        en: [
          'Use Bt cotton hybrid seeds for bollworm resistance',
          'Maintain 90-120 cm row spacing for proper growth',
          'Apply FYM 5-10 tons/hectare before sowing',
          'Monitor for pink bollworm and spray insecticide if needed',
          'Irrigate at flowering and boll formation stages',
          'Pick cotton when bolls fully open in 2-3 pickings',
        ],
        hi: [
          'बॉलवर्म प्रतिरोध के लिए Bt कपास के बीज का उपयोग करें',
          '90-120 सेमी की कतार दूरी रखें',
          'बुवाई से पहले 5-10 टन/हेक्टेयर गोबर की खाद डालें',
          'गुलाबी सुंडी की निगरानी करें',
          'फूल और फल बनने पर सिंचाई करें',
          'गोल्ड पूरी तरह खिलने पर कपास तोड़ें',
        ],
      },
      diseases: ['Wilt (मुरझान)', 'Root Rot (जड़ गलन)', 'Leaf Curl (पत्ती मुड़न)', 'Boll Rot'],
      avgYield: '8-10 quintals/hectare (lint)',
      varieties: [
        { name: 'Bt Cotton RCH 659', duration: '165 days', yield: '10 q/ha', features: ['Bt resistant', 'High yield'] },
        { name: 'Ankur 3028', duration: '160 days', yield: '9 q/ha', features: ['Drought tolerant', 'Early maturing'] },
      ],
      irrigation: 'Light but frequent; critical at flowering and boll development',
      fertilizer: 'Nitrogen: 100 kg/ha, Phosphorus: 50 kg/ha, Potash: 50 kg/ha',
    },
    {
      id: 'sugarcane',
      name: { en: 'Sugarcane', hi: 'गन्ना' },
      season: 'Kharif',
      duration: '10-14 months',
      soilType: 'Deep loamy soil with pH 6.5-7.5',
      climate: 'Hot and humid subtropical climate',
      temperature: '20-30°C',
      rainfall: '100-175 cm annually',
      majorStates: ['Uttar Pradesh', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat'],
      bestPractices: {
        en: [
          'Plant in autumn (Sep-Oct) or spring (Feb-Mar)',
          'Use disease-free cane setts with 2-3 buds each',
          'Apply 25 tons/hectare of FYM or compost',
          'Ridges and furrows method for better drainage',
          'Earth-up 4-5 months after planting',
          'Harvest when juice attains maximum sucrose content',
        ],
        hi: [
          'शरद (सितंबर-अक्टूबर) या वसंत (फरवरी-मार्च) में लगाएं',
          '2-3 कलियों वाले रोग मुक्त बीज का उपयोग करें',
          '25 टन/हेक्टेयर गोबर की खाद डालें',
          'अच्छी निकासी के लिए मेड़ और नाली विधि का उपयोग करें',
          'रोपाई के 4-5 महीने बाद मिट्टी चढ़ाएं',
          'अधिकतम चीनी उपज पर कटाई करें',
        ],
      },
      diseases: ['Red Rot', 'Smut', 'Rust', 'Grassy Shoot'],
      avgYield: '70-80 tons/hectare',
      varieties: [
        { name: 'Co 0238', duration: '12 months', yield: '80 t/ha', features: ['High sugar', 'Red rot resistant'] },
        { name: 'Co 86032', duration: '13 months', yield: '75 t/ha', features: ['Wide adaptable', 'Good ratoon'] },
      ],
      irrigation: '7-10 irrigations; critical at tillering, grand growth, and ripening',
      fertilizer: 'Nitrogen: 250 kg/ha, Phosphorus: 100 kg/ha, Potash: 120 kg/ha',
    },
    {
      id: 'onion',
      name: { en: 'Onion', hi: 'प्याज' },
      season: 'Kharif',
      duration: '120-150 days',
      soilType: 'Well-drained loamy soil with pH 6-7',
      climate: 'Cool and dry for bulbing',
      temperature: '15-25°C',
      rainfall: '60-100 cm annually',
      majorStates: ['Maharashtra', 'Karnataka', 'Madhya Pradesh', 'Gujarat', 'Rajasthan'],
      bestPractices: {
        en: [
          'Plant in Sep-Oct (Rabi) or Jun-Jul (Kharif)',
          'Use raised beds of 15 cm height for drainage',
          'Apply well-rotted FYM 20 tons/hectare',
          'Maintain plant spacing 15×10 cm',
          'Stop irrigation 2 weeks before harvest for better storage',
          'Harvest when tops fall over and turn yellow',
        ],
        hi: [
          'सितंबर-अक्टूबर (रबी) या जून-जुलाई (खरीफ) में लगाएं',
          '15 सेमी ऊंची क्यारियां बनाएं',
          '20 टन/हेक्टेयर गोबर की खाद डालें',
          '15×10 सेमी की दूरी रखें',
          'कटाई से 2 सप्ताह पहले सिंचाई बंद करें',
          'पत्तियां पीली होने पर कटाई करें',
        ],
      },
      diseases: ['Purple Blotch', 'Downy Mildew', 'Thrips', 'Neck Rot'],
      avgYield: '20-25 tons/hectare',
      varieties: [
        { name: 'Nasik Red', duration: '135 days', yield: '22 t/ha', features: ['Dark red', 'Good storage'] },
        { name: 'Pusa Red', duration: '130 days', yield: '20 t/ha', features: ['High yield', 'Disease tolerant'] },
      ],
      irrigation: '6-8 irrigations; critical at bulb initiation and bulbing',
      fertilizer: 'Nitrogen: 100 kg/ha, Phosphorus: 50 kg/ha, Potash: 80 kg/ha',
    },
  ];

  async getAllCrops(): Promise<Crop[]> {
    return this.crops;
  }

  async getCropById(id: string): Promise<Crop | undefined> {
    return this.crops.find(c => c.id === id);
  }

  async getCropsBySeason(season: string): Promise<Crop[]> {
    return this.crops.filter(c => c.season === season);
  }

  getSeasons(): { id: string; name: { en: string; hi: string } }[] {
    return [
      { id: 'Kharif', name: { en: 'Kharif (June-October)', hi: 'खरीफ (जून-अक्टूबर)' } },
      { id: 'Rabi', name: { en: 'Rabi (November-April)', hi: 'रबी (नवंबर-अप्रैल)' } },
      { id: 'Zaid', name: { en: 'Zaid (April-June)', hi: 'ज़ायद (अप्रैल-जून)' } },
    ];
  }

  async searchCrops(query: string): Promise<Crop[]> {
    const q = query.toLowerCase();
    return this.crops.filter(
      c =>
        c.id.includes(q) ||
        c.name.en.toLowerCase().includes(q) ||
        c.name.hi.includes(q)
    );
  }
}

export const cropService = new CropService();
export default cropService;
