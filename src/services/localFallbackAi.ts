/**
 * Local Fallback AI — Offline-first response engine
 *
 * Provides instant, practical farming answers when API services are unavailable.
 * Covers all major Indian agriculture topics with Hindi and English responses.
 * Includes a universal catch-all so users NEVER see an empty response.
 */

interface FallbackEntry {
  pattern: RegExp;
  en: string;
  hi: string;
}

const localResponses: FallbackEntry[] = [
  // ── Greetings ─────────────────────────────────────────────
  {
    pattern: /^(hi|hello|hey|namaste|namaskar|pranam|good morning|good evening|kaise ho|kya hal|shubh)\b/i,
    en: "Hello! I'm your agriculture assistant. You can ask me about crops, pests, soil health, irrigation, weather, mandi prices, government schemes, and more. How can I help you today?",
    hi: "नमस्ते! मैं आपका कृषि सहायक हूं। आप मुझसे फसलों, कीटों, मिट्टी, सिंचाई, मौसम, मंडी भाव, सरकारी योजनाओं और खेती से जुड़े किसी भी सवाल पूछ सकते हैं। कैसे मदद करूं?",
  },

  // ── Major Crops ───────────────────────────────────────────
  {
    pattern: /wheat|गेहूं|gehun/i,
    en: "Wheat is a Rabi crop sown in Nov-Dec. Use certified seeds (100-125 kg/hectare). Apply NPK fertilizer (120:60:40 kg/ha). Irrigate at CRI, tillering, jointing, flowering, and grain-filling stages. Harvest when grains are hard and golden. Major producing states: Punjab, Haryana, UP, MP.",
    hi: "गेहूं रबी की फसल है जिसे नवंबर-दिसंबर में बोया जाता है। प्रमाणित बीज (100-125 किग्रा/हेक्टेयर) का उपयोग करें। NPK उर्वरक (120:60:40 किग्रा/हेक्टेयर) डालें। CRI, कल्ले, जोड़, फूल और दाना भरने की अवस्था में सिंचाई करें। दाने कठोर और सुनहरे होने पर कटाई करें।",
  },
  {
    pattern: /rice|धान|paddy|chawal/i,
    en: "Rice is a Kharif crop requiring hot & humid climate (20-35°C). Prepare nursery beds, transplant 20-30 day old seedlings, maintain 2-5cm water level. Apply NPK (100:50:50 kg/ha). Harvest at 80% maturity when grains turn golden. Major states: West Bengal, Punjab, UP, AP.",
    hi: "धान खरीफ की फसल है जिसके लिए गर्म और आर्द्र जलवायु (20-35°C) चाहिए। नर्सरी तैयार करें, 20-30 दिन पुराने पौधे रोपें, 2-5 सेमी पानी रखें। NPK (100:50:50 किग्रा/हेक्टेयर) डालें। 80% परिपक्वता पर कटाई करें।",
  },
  {
    pattern: /cotton|कपास|kapas/i,
    en: "Cotton is a Kharif cash crop. Use Bt varieties for bollworm resistance. Maintain 60x30cm spacing. Apply balanced NPK (80:40:40 kg/ha). Control bollworms with integrated pest management. Pick when bolls are fully opened. Major states: Gujarat, Maharashtra, Telangana, Rajasthan.",
    hi: "कपास खरीफ की नकदी फसल है। बॉलवर्म प्रतिरोध के लिए Bt किस्मों का उपयोग करें। 60x30 सेमी दूरी रखें। NPK (80:40:40 किग्रा/हेक्टेयर) डालें। एकीकृत कीट प्रबंधन से गुलाबी सुंडी नियंत्रित करें। पूरी खिलने पर तोड़ें।",
  },
  {
    pattern: /sugarcane|गन्ना|ganna/i,
    en: "Sugarcane is a long-duration crop (10-12 months). Plant setts in Feb-Mar or Sep-Oct. Requires heavy irrigation and fertilizer (150:60:60 NPK kg/ha). Earthing up at 3-4 months is crucial. Harvest when lower leaves dry and brix reads 18+. Major states: UP, Maharashtra, Karnataka.",
    hi: "गन्ना 10-12 महीने की फसल है। फरवरी-मार्च या सितंबर-अक्टूबर में टुकड़े लगाएं। भरपूर सिंचाई और खाद (150:60:60 NPK किग्रा/हेक्टेयर) दें। 3-4 महीने में मिट्टी चढ़ाना जरूरी है। निचली पत्तियां सूखने और ब्रिक्स 18+ होने पर कटाई करें।",
  },
  {
    pattern: /maize|corn|मक्का|makka/i,
    en: "Maize is grown in both Kharif and Rabi seasons. Use hybrid seeds (20-25 kg/ha). Plant with 60x25cm spacing. Apply NPK (120:60:40 kg/ha). Critical irrigation at tasseling and grain-filling stages. Harvest when husks turn brown. Major states: Karnataka, MP, Bihar, Rajasthan.",
    hi: "मक्का खरीफ और रबी दोनों मौसम में उगाई जाती है। हाइब्रिड बीज (20-25 किग्रा/हेक्टेयर) लगाएं। 60x25 सेमी दूरी रखें। NPK (120:60:40 किग्रा/हेक्टेयर) डालें। झंडा निकलने और दाना भरने पर सिंचाई जरूरी है।",
  },
  {
    pattern: /soybean|सोयाबीन|soya/i,
    en: "Soybean is a Kharif oilseed crop. Sow in June-July with 30-40 cm row spacing. Use 70-80 kg seed/ha. Apply rhizobium culture and 20:80:20 NPK kg/ha. Avoid waterlogging. Harvest at 95% pod maturity. Major states: MP, Maharashtra, Rajasthan.",
    hi: "सोयाबीन खरीफ की तिलहन फसल है। जून-जुलाई में 30-40 सेमी कतार दूरी पर बुवाई करें। 70-80 किग्रा बीज/हेक्टेयर लगाएं। राइजोबियम कल्चर और NPK (20:80:20 किग्रा/हेक्टेयर) डालें। जलभराव से बचें।",
  },
  {
    pattern: /tomato|टमाटर|tamatar/i,
    en: "Tomato grows well in 20-30°C. Transplant 25-30 day seedlings at 60x45cm spacing. Apply NPK (120:80:80 kg/ha). Support plants with stakes. Watch for early blight, late blight, and fruit borer. Harvest when fruits turn red. Yield: 25-40 ton/ha.",
    hi: "टमाटर 20-30°C में अच्छा होता है। 25-30 दिन की पौध 60x45 सेमी दूरी पर लगाएं। NPK (120:80:80 किग्रा/हेक्टेयर) डालें। पौधों को सहारा दें। अर्ली ब्लाइट, लेट ब्लाइट और फल छेदक से बचाव करें। लाल होने पर तोड़ें।",
  },
  {
    pattern: /onion|प्याज|pyaj|pyaz/i,
    en: "Onion is grown in Rabi (main) and Kharif seasons. Transplant 6-8 week seedlings at 15x10cm spacing. Apply 100:50:50 NPK kg/ha. Stop irrigation 10 days before harvest. Cure bulbs in shade for 7-10 days before storage. Major states: Maharashtra, Karnataka, MP.",
    hi: "प्याज मुख्यतः रबी में उगाई जाती है। 6-8 सप्ताह की पौध 15x10 सेमी पर लगाएं। NPK (100:50:50 किग्रा/हेक्टेयर) डालें। कटाई से 10 दिन पहले सिंचाई बंद करें। छाया में 7-10 दिन सुखाकर भंडारण करें।",
  },

  // ── Pest Control ──────────────────────────────────────────
  {
    pattern: /pest|कीट|insect|keeta|bug/i,
    en: "For pest control: Use neem oil spray (5ml/L water) as a first defense. Introduce beneficial insects like ladybugs. Practice crop rotation. Remove and destroy infected plants. Set up yellow sticky traps. For specific pesticide recommendations, consult your local KVK or call Kisan Call Centre at 1551.",
    hi: "कीट नियंत्रण: पहले बचाव के लिए नीम तेल स्प्रे (5ml/L पानी) करें। लेडीबग जैसे लाभकारी कीट छोड़ें। फसल चक्र अपनाएं। संक्रमित पौधे हटाकर नष्ट करें। पीला चिपचिपा जाल लगाएं। विशिष्ट कीटनाशकों के लिए KVK या किसान कॉल सेंटर (1551) पर संपर्क करें।",
  },
  {
    pattern: /disease|blight|rust|wilt|fungus|रोग|ब्लाइट|फफूंद/i,
    en: "Common crop diseases: Early Blight (brown spots with rings), Late Blight (water-soaked lesions), Rust (orange pustules), and Wilt (drooping plants). Use fungicides like Mancozeb (2.5g/L) for blight, Propiconazole (1ml/L) for rust. Remove infected parts immediately. Maintain proper spacing for air circulation.",
    hi: "आम फसल रोग: अर्ली ब्लाइट (छल्लेदार भूरे धब्बे), लेट ब्लाइट (पानी जैसे घाव), रस्ट (नारंगी फफोले), और विल्ट (मुरझाना)। ब्लाइट के लिए मैंकोजेब (2.5g/L), रस्ट के लिए प्रोपिकोनाजोल (1ml/L) का छिड़काव करें। संक्रमित भाग तुरंत हटाएं।",
  },

  // ── Soil Health ───────────────────────────────────────────
  {
    pattern: /soil|मिट्टी|mitti/i,
    en: "Improve soil health: Add organic compost or FYM (10-15 ton/hectare). Use green manure crops like dhaincha or sunhemp. Get soil tested annually at your nearest soil testing lab (free). Apply lime if pH < 6, gypsum if pH > 8. Rotate with legumes to fix nitrogen naturally.",
    hi: "मिट्टी सुधार: जैविक खाद या गोबर की खाद (10-15 टन/हेक्टेयर) डालें। ढैंचा या सनई जैसी हरी खाद उगाएं। हर साल नजदीकी मृदा परीक्षण केंद्र (मुफ्त) में मिट्टी जांच कराएं। pH<6 हो तो चूना, pH>8 हो तो जिप्सम डालें। दलहन के साथ फसल चक्र अपनाएं।",
  },

  // ── Irrigation ────────────────────────────────────────────
  {
    pattern: /water|पानी|irrigation|सिंचाई|sinchai|drip/i,
    en: "Save water with smart irrigation: Drip irrigation gives 90% efficiency (best for vegetables, orchards). Sprinkler saves 30-40% water. Irrigate at critical crop stages only. Mulch with straw to reduce evaporation by 25-30%. Rainwater harvesting in farm ponds. For wheat: 4-5 irrigations. For rice: maintain 2-5cm standing water.",
    hi: "स्मार्ट सिंचाई से पानी बचाएं: ड्रिप सिंचाई 90% दक्षता देती है (सब्जियों, बागवानी के लिए सर्वोत्तम)। स्प्रिंकलर से 30-40% पानी बचता है। केवल महत्वपूर्ण चरणों पर सिंचाई करें। पराली से मल्चिंग करें (25-30% वाष्पीकरण कम)। खेत तालाब में वर्षा जल संचयन करें।",
  },

  // ── Fertilizers ───────────────────────────────────────────
  {
    pattern: /fertilizer|खाद|urea|यूरिया|npk|dap/i,
    en: "Use fertilizers based on soil test results. General guidelines — Wheat: 120:60:40 NPK kg/ha. Rice: 100:50:50 NPK. Apply organic manure (FYM 10-15 ton/ha) before planting. Split nitrogen into 3 doses (basal, tillering, heading) for better efficiency. Don't over-apply urea — it harms soil in the long run.",
    hi: "मिट्टी जांच के अनुसार खाद डालें। सामान्य मार्गदर्शन — गेहूं: 120:60:40 NPK किग्रा/हेक्टेयर। धान: 100:50:50 NPK। बुवाई से पहले गोबर खाद (10-15 टन/हेक्टेयर) डालें। नाइट्रोजन 3 बार में दें (बेसल, कल्ले, बाली)। यूरिया अधिक न डालें — लंबे समय में मिट्टी खराब होती है।",
  },

  // ── Market Prices ─────────────────────────────────────────
  {
    pattern: /price|भाव|mandi|मंडी|market|rate|quintal|बाजार/i,
    en: "Check market prices at your local mandi or APMC. Compare rates across 2-3 nearby mandis before selling. Know the MSP (Minimum Support Price) for major crops. For real-time prices, use our Market Prices section in the app or visit agmarknet.gov.in. Consider aggregating with neighbors for better rates.",
    hi: "स्थानीय मंडी या APMC में भाव देखें। बेचने से पहले 2-3 आस-पास की मंडियों के भाव तुलना करें। प्रमुख फसलों का MSP (न्यूनतम समर्थन मूल्य) जानें। रियल-टाइम भाव के लिए ऐप का मार्केट प्राइस सेक्शन या agmarknet.gov.in देखें।",
  },

  // ── Government Schemes ────────────────────────────────────
  {
    pattern: /scheme|योजना|pm.kisan|pmfby|subsid|loan|ऋण|kcc|किसान/i,
    en: "Key government schemes: PM-KISAN gives Rs 6000/year in 3 installments directly to bank. PMFBY provides crop insurance at just 2% premium for Kharif, 1.5% for Rabi. KCC (Kisan Credit Card) offers loans up to Rs 3 lakh at 7% interest (4% with timely repayment). Apply at your nearest bank branch or Common Service Centre (CSC).",
    hi: "प्रमुख सरकारी योजनाएं: PM-KISAN से सालाना ₹6000 तीन किस्तों में सीधे बैंक में। PMFBY से फसल बीमा सिर्फ 2% प्रीमियम (खरीफ), 1.5% (रबी) पर। KCC से ₹3 लाख तक लोन 7% ब्याज (समय पर चुकाने पर 4%) पर। नजदीकी बैंक शाखा या CSC में आवेदन करें।",
  },

  // ── Organic Farming ───────────────────────────────────────
  {
    pattern: /organic|जैविक|jaivik|vermicompost|natural farming/i,
    en: "Start organic farming: Begin with a 1-acre test plot. Use vermicompost (2-3 ton/ha), neem cake, and bio-fertilizers (Rhizobium, Azotobacter). Switch to bio-pesticides (Trichoderma, Beauveria). Get certification from APEDA or PGS-India (free). Expect 20-40% premium prices after certification. Transition takes 2-3 years.",
    hi: "जैविक खेती: 1 एकड़ से शुरू करें। वर्मीकम्पोस्ट (2-3 टन/हेक्टेयर), नीम खली, जैव उर्वरक (राइजोबियम, एजोटोबैक्टर) का उपयोग करें। जैव कीटनाशक (ट्राइकोडर्मा, ब्यूवेरिया) अपनाएं। APEDA या PGS-India (मुफ्त) से प्रमाणन लें। प्रमाणन के बाद 20-40% अधिक मूल्य मिलेगा।",
  },

  // ── Weather ───────────────────────────────────────────────
  {
    pattern: /weather|मौसम|barish|बारिश|rain|monsoon/i,
    en: "Check daily weather forecast before farm operations. Protect crops from frost (use mulch, smoke), heatwave (irrigation, shade nets), and heavy rain (drainage). Monitor IMD forecasts at mausam.imd.gov.in. For current weather details, check the Weather section in this app.",
    hi: "खेत के काम से पहले रोज मौसम पूर्वानुमान देखें। फसलों को पाला (मल्च, धुआं), लू (सिंचाई, शेड नेट), और भारी बारिश (जल निकासी) से बचाएं। IMD पूर्वानुमान mausam.imd.gov.in पर देखें। ऐप के मौसम सेक्शन में विस्तृत जानकारी देखें।",
  },

  // ── Crop Rotation ─────────────────────────────────────────
  {
    pattern: /rotation|चक्र|crop.?cycle/i,
    en: "Crop rotation improves soil health and breaks pest cycles. Good rotations: Rice-Wheat (most common in North India), Cotton-Wheat, Soybean-Wheat, Rice-Pulse, Maize-Mustard. Always include a legume crop (moong, masoor, chickpea) to fix nitrogen naturally. Avoid growing the same crop family back-to-back.",
    hi: "फसल चक्र मिट्टी स्वास्थ्य सुधारता है और कीट चक्र तोड़ता है। अच्छे चक्र: धान-गेहूं (उत्तर भारत में सबसे आम), कपास-गेहूं, सोयाबीन-गेहूं, धान-दलहन, मक्का-सरसों। नाइट्रोजन स्थिरीकरण के लिए हमेशा एक दलहन फसल (मूंग, मसूर, चना) शामिल करें।",
  },

  // ── Seed Selection ────────────────────────────────────────
  {
    pattern: /seed|बीज|beej|variety|किस्म/i,
    en: "Always use certified seeds from government agencies or authorized dealers. Check seed certification tag (blue for certified, white for truthful). Treat seeds with Thiram (2g/kg) before sowing. For your region's best varieties, contact your local KVK or visit seednet.gov.in.",
    hi: "हमेशा सरकारी एजेंसियों या अधिकृत डीलरों से प्रमाणित बीज लें। बीज प्रमाणन टैग जांचें (नीला = प्रमाणित, सफेद = ट्रुथफुल)। बुवाई से पहले बीज को थीरम (2g/kg) से उपचारित करें। अपने क्षेत्र की सर्वोत्तम किस्मों के लिए स्थानीय KVK से संपर्क करें।",
  },

  // ── Livestock / Dairy ─────────────────────────────────────
  {
    pattern: /cow|buffalo|dairy|दूध|गाय|भैंस|cattle|livestock|पशु/i,
    en: "Dairy farming tips: Feed balanced ration — 1 kg concentrate per 2.5 liters milk. Ensure clean drinking water (40-60 L/day for cattle). Vaccinate against FMD, HS, BQ regularly. Maintain clean sheds. Crossbred cows give 8-15 L/day; Murrah buffalo gives 8-12 L/day. Contact NABARD for dairy subsidy schemes.",
    hi: "डेयरी फार्मिंग: संतुलित राशन दें — 2.5 लीटर दूध के लिए 1 किलो दाना। साफ पीने का पानी (40-60 लीटर/दिन) दें। FMD, HS, BQ का नियमित टीकाकरण कराएं। शेड साफ रखें। क्रॉसब्रेड गाय 8-15 लीटर/दिन; मुर्रा भैंस 8-12 लीटर/दिन देती है। NABARD से डेयरी सब्सिडी योजनाएं जानें।",
  },

  // ── Harvesting ────────────────────────────────────────────
  {
    pattern: /harvest|कटाई|katai|threshing/i,
    en: "Harvest at the right time for maximum yield and quality. Wheat: when grains are hard, moisture 14-16%. Rice: 80% maturity, golden color. Don't delay harvest — reduces quality and attracts pests. Use combine harvesters for large areas. Dry grains to 12% moisture before storage.",
    hi: "अधिकतम उपज और गुणवत्ता के लिए सही समय पर कटाई करें। गेहूं: दाने कठोर, नमी 14-16%। धान: 80% परिपक्वता, सुनहरा रंग। कटाई में देरी न करें — गुणवत्ता गिरती है और कीट आते हैं। बड़े क्षेत्र के लिए कंबाइन हार्वेस्टर उपयोग करें। भंडारण से पहले 12% नमी तक सुखाएं।",
  },

  // ── Storage ───────────────────────────────────────────────
  {
    pattern: /storage|भंडारण|bhandaran|store|godown/i,
    en: "Proper grain storage: Dry grains to 12% moisture. Clean and disinfect storage area. Use moisture-proof containers or metal bins. Keep grains away from walls and floor (use pallets). Apply neem leaves or Aluminium Phosphide tablets for pest protection. Check regularly for moisture and insects.",
    hi: "अनाज भंडारण: 12% नमी तक सुखाएं। भंडारण क्षेत्र साफ और कीटाणुरहित करें। नमीरोधक बर्तन या धातु के डिब्बे इस्तेमाल करें। दीवार और फर्श से दूर रखें (पैलेट पर)। नीम की पत्तियां या एल्युमीनियम फॉस्फाइड गोली लगाएं। नियमित जांच करें।",
  },
];

/**
 * Try to match the user's query against known patterns.
 * If no pattern matches, return a helpful catch-all response.
 */
export function getLocalFallback(query: string, lang: string): string | null {
  const lower = query.toLowerCase().trim();

  // Try pattern matching
  for (const entry of localResponses) {
    if (entry.pattern.test(lower)) {
      return lang === 'hi' ? entry.hi : entry.en;
    }
  }

  // No match — return null so the AI services can try
  return null;
}

/**
 * Universal catch-all. Called when ALL services fail.
 * Always returns a helpful response — never leaves the user hanging.
 */
export function getCatchAllResponse(lang: string): string {
  if (lang === 'hi') {
    return "मैं अभी ऑफलाइन मोड में हूं, लेकिन फिर भी मदद कर सकता हूं। आप ये सवाल पूछ सकते हैं:\n\n• फसल प्रबंधन — गेहूं, धान, कपास, मक्का, सोयाबीन, गन्ना\n• कीट नियंत्रण और रोग पहचान\n• मिट्टी स्वास्थ्य और खाद\n• सिंचाई और पानी प्रबंधन\n• मंडी भाव और बाजार\n• सरकारी योजनाएं (PM-KISAN, PMFBY, KCC)\n• जैविक खेती\n• मौसम और डेयरी\n\nकृपया इनमें से कोई विषय पूछें, या विशेष सहायता के लिए किसान कॉल सेंटर (1551) पर कॉल करें।";
  }
  return "I'm currently in offline mode, but I can still help! Try asking about:\n\n• Crop management — wheat, rice, cotton, maize, soybean, sugarcane\n• Pest control and disease identification\n• Soil health and fertilizers\n• Irrigation and water management\n• Mandi prices and market info\n• Government schemes (PM-KISAN, PMFBY, KCC)\n• Organic farming\n• Weather and dairy farming\n\nPlease ask about any of these topics, or call the Kisan Call Centre at 1551 for specialized help.";
}
