// Enhanced Farming AI Agent - v2.1 - With fallback support
import geminiAiService from './geminiAiService';

interface FarmingQuery {
  id: string;
  query: string;
  hindiQuery: string;
  category: 'crop-selection' | 'disease-treatment' | 'fertilizer' | 'irrigation' | 'pest-control' | 'weather' | 'market' | 'government-schemes' | 'soil-health' | 'general';
  location?: {
    state: string;
    district: string;
    climate: string;
  };
  cropType?: string;
  season?: string;
  farmSize?: number;
  userId: string;
  timestamp: Date;
  urgency: 'low' | 'medium' | 'high';
}

interface FarmingAnswer {
  id: string;
  queryId: string;
  answer: string;
  hindiAnswer: string;
  confidence: number;
  sources: string[];
  relatedTopics: string[];
  actionItems: string[];
  hindiActionItems: string[];
  followUpQuestions: string[];
  hindiFollowUpQuestions: string[];
  estimatedCost?: {
    min: number;
    max: number;
    currency: string;
    description: string;
    hindiDescription: string;
  };
  timeline?: {
    immediate: string[];
    short_term: string[]; // 1-2 weeks
    medium_term: string[]; // 1-3 months
    long_term: string[]; // 3+ months
  };
  hindiTimeline?: {
    immediate: string[];
    short_term: string[];
    medium_term: string[];
    long_term: string[];
  };
  success_rate?: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  season_specific?: boolean;
  location_specific?: boolean;
}

class EnhancedFarmingAI {
  private farmingKnowledgeBase = {
    // Comprehensive crop information
    crops: {
      rice: {
        hindi: 'धान/चावल',
        varieties: ['Basmati', 'IR-64', 'Swarna', 'Sona Mahsuri'],
        seasons: ['Kharif', 'Rabi'],
        soil_ph: { min: 5.5, max: 7.0 },
        water_requirement: 'High (1200-1800mm)',
        fertilizer: 'NPK 120:60:40 kg/ha',
        common_diseases: ['Blast', 'Brown Spot', 'Sheath Blight'],
        pests: ['Brown Plant Hopper', 'Stem Borer', 'Leaf Folder'],
        market_price_range: { min: 2000, max: 3500, unit: 'per quintal' }
      },
      wheat: {
        hindi: 'गेहूं',
        varieties: ['HD-2967', 'PBW-725', 'DBW-187', 'WH-1105'],
        seasons: ['Rabi'],
        soil_ph: { min: 6.0, max: 7.5 },
        water_requirement: 'Medium (450-650mm)',
        fertilizer: 'NPK 150:60:40 kg/ha',
        common_diseases: ['Yellow Rust', 'Brown Rust', 'Loose Smut'],
        pests: ['Aphids', 'Termites', 'Cut Worm'],
        market_price_range: { min: 2100, max: 2700, unit: 'per quintal' }
      },
      cotton: {
        hindi: 'कपास',
        varieties: ['Bt Cotton', 'Desi Cotton', 'American Cotton'],
        seasons: ['Kharif'],
        soil_ph: { min: 5.8, max: 8.2 },
        water_requirement: 'Medium (600-1200mm)',
        fertilizer: 'NPK 150:75:75 kg/ha',
        common_diseases: ['Fusarium Wilt', 'Bacterial Blight'],
        pests: ['Bollworm', 'Whitefly', 'Thrips'],
        market_price_range: { min: 5500, max: 7000, unit: 'per quintal' }
      },
      tomato: {
        hindi: 'टमाटर',
        varieties: ['Pusa Ruby', 'Arka Rakshak', 'Himsona'],
        seasons: ['Year-round'],
        soil_ph: { min: 6.0, max: 7.0 },
        water_requirement: 'Medium (600-800mm)',
        fertilizer: 'NPK 200:100:100 kg/ha',
        common_diseases: ['Early Blight', 'Late Blight', 'Mosaic Virus'],
        pests: ['Fruit Borer', 'Whitefly', 'Aphids'],
        market_price_range: { min: 1000, max: 4000, unit: 'per quintal' }
      }
    },

    // Government schemes information
    government_schemes: {
      'PM-KISAN': {
        hindi: 'प्रधानमंत्री किसान सम्मान निधि',
        benefit: '₹6000 per year in 3 installments',
        eligibility: 'All landholding farmers',
        application: 'Online at pmkisan.gov.in',
        documents: ['Aadhaar', 'Bank Account', 'Land Records']
      },
      'PMFBY': {
        hindi: 'प्रधानमंत्री फसल बीमा योजना',
        benefit: 'Crop insurance coverage',
        eligibility: 'All farmers',
        premium: '1.5-5% of sum insured',
        coverage: 'Natural calamities, pest attacks'
      },
      'KCC': {
        hindi: 'किसान क्रेडिट कार्ड',
        benefit: 'Agricultural credit up to ₹3 lakh',
        interest_rate: '4% (with subsidy)',
        eligibility: 'Farmers with land ownership',
        validity: '5 years'
      }
    },

    // Seasonal farming calendar
    seasonal_calendar: {
      kharif: {
        hindi: 'खरीफ',
        months: 'June-October',
        sowing: 'May-July',
        harvesting: 'September-November',
        crops: ['Rice', 'Cotton', 'Sugarcane', 'Pulses'],
        weather: 'Monsoon dependent'
      },
      rabi: {
        hindi: 'रबी',
        months: 'November-April',
        sowing: 'October-December',
        harvesting: 'March-May',
        crops: ['Wheat', 'Barley', 'Peas', 'Mustard'],
        weather: 'Winter crops'
      },
      zaid: {
        hindi: 'जायद',
        months: 'April-June',
        sowing: 'March-April',
        harvesting: 'May-July',
        crops: ['Watermelon', 'Fodder', 'Vegetables'],
        weather: 'Summer irrigation dependent'
      }
    },

    // Soil health management
    soil_management: {
      testing_parameters: ['pH', 'Organic Carbon', 'Nitrogen', 'Phosphorus', 'Potassium', 'Sulfur', 'Zinc', 'Iron'],
      improvement_methods: {
        low_ph: 'Apply lime 2-4 quintals per hectare',
        high_ph: 'Apply gypsum 2-5 quintals per hectare',
        low_organic_matter: 'Add compost, farmyard manure 10-15 tonnes per hectare',
        nutrient_deficiency: 'Apply specific fertilizers based on soil test report'
      }
    }
  };

  // Process farming query with enhanced AI
  async processFarmingQuery(query: FarmingQuery): Promise<FarmingAnswer> {
    try {
      // Analyze query and determine category if not provided
      const analyzedCategory = await this.analyzeQueryCategory(query.query);
      const finalCategory = query.category || analyzedCategory;

      // Generate comprehensive answer
      const baseAnswer = await this.generateBaseAnswer(query, finalCategory);
      const enhancedAnswer = await this.enhanceAnswer(baseAnswer, query, finalCategory);
      
      return {
        id: Date.now().toString(),
        queryId: query.id,
        answer: enhancedAnswer.answer,
        hindiAnswer: enhancedAnswer.hindiAnswer,
        confidence: enhancedAnswer.confidence,
        sources: enhancedAnswer.sources,
        relatedTopics: enhancedAnswer.relatedTopics,
        actionItems: enhancedAnswer.actionItems,
        hindiActionItems: enhancedAnswer.hindiActionItems,
        followUpQuestions: enhancedAnswer.followUpQuestions,
        hindiFollowUpQuestions: enhancedAnswer.hindiFollowUpQuestions,
        estimatedCost: enhancedAnswer.estimatedCost,
        timeline: enhancedAnswer.timeline,
        hindiTimeline: enhancedAnswer.hindiTimeline,
        success_rate: enhancedAnswer.success_rate,
        difficulty_level: enhancedAnswer.difficulty_level,
        season_specific: enhancedAnswer.season_specific,
        location_specific: enhancedAnswer.location_specific
      };
    } catch (error) {
      console.error('Enhanced farming AI error:', error);
      return this.getDefaultAnswer(query);
    }
  }

  // Analyze query to determine category
  private async analyzeQueryCategory(query: string): Promise<FarmingQuery['category']> {
    const queryLower = query.toLowerCase();
    
    // Category keywords mapping
    const categoryKeywords = {
      'crop-selection': ['which crop', 'best crop', 'crop recommendation', 'what to grow', 'फसल चुनें', 'कौन सी फसल'],
      'disease-treatment': ['disease', 'infection', 'fungus', 'virus', 'treatment', 'cure', 'रोग', 'बीमारी', 'इलाज'],
      'fertilizer': ['fertilizer', 'manure', 'compost', 'NPK', 'urea', 'खाद', 'उर्वरक'],
      'irrigation': ['water', 'irrigation', 'drip', 'sprinkler', 'watering', 'पानी', 'सिंचाई'],
      'pest-control': ['pest', 'insect', 'bug', 'spray', 'pesticide', 'कीट', 'कीड़े'],
      'weather': ['weather', 'rain', 'temperature', 'climate', 'मौसम', 'बारिश'],
      'market': ['price', 'market', 'sell', 'cost', 'profit', 'दाम', 'बाजार', 'कीमत'],
      'government-schemes': ['scheme', 'subsidy', 'loan', 'insurance', 'government', 'योजना', 'सब्सिडी'],
      'soil-health': ['soil', 'pH', 'testing', 'nutrients', 'मिट्टी', 'भूमि']
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => queryLower.includes(keyword))) {
        return category as FarmingQuery['category'];
      }
    }

    return 'general';
  }

  // Generate base answer using knowledge base and AI
  private async generateBaseAnswer(query: FarmingQuery, category: string): Promise<any> {
    // Get relevant information from knowledge base
    const contextInfo = this.getContextualInformation(query, category);
    
    // Prepare enhanced prompt for Gemini AI
    const enhancedPrompt = this.buildEnhancedPrompt(query, category, contextInfo);
    
    try {
      // Get AI response
      const aiResponse = await geminiAiService.getAgricultureResponse(enhancedPrompt, 'hi');
      
      return {
        answer: aiResponse.text,
        hindiAnswer: aiResponse.text,
        confidence: 85,
        contextInfo
      };
    } catch (error) {
      console.warn('AI service unavailable, using fallback response:', error);
      
      // Fallback response when AI is not available
      return {
        answer: this.getFallbackResponse(query, category),
        hindiAnswer: this.getFallbackResponseHindi(query, category),
        confidence: 70,
        contextInfo
      };
    }
  }

  // Get contextual information from knowledge base
  private getContextualInformation(query: FarmingQuery, category: string): any {
    const context: any = {
      category,
      general_info: {}
    };

    // Add crop-specific information if crop is mentioned
    if (query.cropType) {
      const cropInfo = this.farmingKnowledgeBase.crops[query.cropType as keyof typeof this.farmingKnowledgeBase.crops];
      if (cropInfo) {
        context.crop_info = cropInfo;
      }
    }

    // Add seasonal information
    if (query.season) {
      const seasonInfo = this.farmingKnowledgeBase.seasonal_calendar[query.season as keyof typeof this.farmingKnowledgeBase.seasonal_calendar];
      if (seasonInfo) {
        context.season_info = seasonInfo;
      }
    }

    // Add location-specific recommendations
    if (query.location) {
      context.location_info = {
        state: query.location.state,
        climate: query.location.climate,
        suitable_crops: this.getSuitableCropsForLocation(query.location)
      };
    }

    // Add category-specific context
    switch (category) {
      case 'government-schemes':
        context.schemes = this.farmingKnowledgeBase.government_schemes;
        break;
      case 'soil-health':
        context.soil_management = this.farmingKnowledgeBase.soil_management;
        break;
      case 'crop-selection':
        context.all_crops = this.farmingKnowledgeBase.crops;
        break;
    }

    return context;
  }

  // Get suitable crops for location
  private getSuitableCropsForLocation(location: any): string[] {
    // This would be enhanced with actual geographic and climatic data
    const locationCropMap: any = {
      'punjab': ['wheat', 'rice', 'cotton'],
      'maharashtra': ['cotton', 'sugarcane', 'soybean'],
      'uttar pradesh': ['wheat', 'rice', 'sugarcane'],
      'gujarat': ['cotton', 'groundnut', 'wheat'],
      'rajasthan': ['wheat', 'barley', 'mustard']
    };

    return locationCropMap[location.state.toLowerCase()] || ['wheat', 'rice'];
  }

  // Build enhanced prompt for AI
  private buildEnhancedPrompt(query: FarmingQuery, category: string, contextInfo: any): string {
    let prompt = `
You are an expert agricultural consultant with deep knowledge of Indian farming practices. 
Answer the farming question comprehensively and practically.

Question: ${query.query}
Category: ${category}
`;

    if (query.location) {
      prompt += `Location: ${query.location.state}, ${query.location.district}\n`;
    }

    if (query.cropType) {
      prompt += `Crop: ${query.cropType}\n`;
    }

    if (query.season) {
      prompt += `Season: ${query.season}\n`;
    }

    if (contextInfo.crop_info) {
      prompt += `\nCrop Information: ${JSON.stringify(contextInfo.crop_info, null, 2)}\n`;
    }

    prompt += `
Please provide a detailed answer that includes:
1. Direct answer to the question
2. Specific actionable steps
3. Expected timeline and costs (if applicable)
4. Success rate or effectiveness
5. Potential challenges and solutions
6. Regional considerations
7. Seasonal factors
8. Government schemes or support available
9. Follow-up recommendations

Answer in both English and Hindi. Be specific, practical, and farmer-friendly.
Focus on cost-effective solutions suitable for Indian conditions.
`;

    return prompt;
  }

  // Enhance answer with additional details
  private async enhanceAnswer(baseAnswer: any, query: FarmingQuery, category: string): Promise<any> {
    const enhanced = {
      answer: baseAnswer.answer,
      hindiAnswer: baseAnswer.hindiAnswer,
      confidence: baseAnswer.confidence,
      sources: ['Agricultural Knowledge Base', 'AI Analysis', 'Best Practices'],
      relatedTopics: this.getRelatedTopics(category),
      actionItems: this.extractActionItems(baseAnswer.answer),
      hindiActionItems: this.extractActionItems(baseAnswer.hindiAnswer),
      followUpQuestions: this.generateFollowUpQuestions(category, query),
      hindiFollowUpQuestions: this.generateHindiFollowUpQuestions(category, query),
      estimatedCost: this.estimateCosts(category, query),
      timeline: this.generateTimeline(category),
      hindiTimeline: this.generateHindiTimeline(category),
      success_rate: this.estimateSuccessRate(category),
      difficulty_level: this.assessDifficultyLevel(category),
      season_specific: this.isSeasonSpecific(category),
      location_specific: this.isLocationSpecific(category)
    };

    return enhanced;
  }

  // Get related topics for category
  private getRelatedTopics(category: string): string[] {
    const relatedTopicsMap: any = {
      'crop-selection': ['Soil Testing', 'Market Prices', 'Weather Patterns', 'Government Schemes'],
      'disease-treatment': ['Pest Control', 'Organic Farming', 'Preventive Measures'],
      'fertilizer': ['Soil Health', 'Organic Manure', 'Nutrient Management'],
      'irrigation': ['Water Conservation', 'Drip Systems', 'Rainwater Harvesting'],
      'pest-control': ['Integrated Pest Management', 'Biological Control', 'Organic Pesticides'],
      'government-schemes': ['Subsidies', 'Loans', 'Insurance', 'Training Programs']
    };

    return relatedTopicsMap[category] || ['General Farming', 'Best Practices'];
  }

  // Extract action items from answer
  private extractActionItems(answer: string): string[] {
    // Simple extraction based on common patterns
    const actionWords = ['apply', 'spray', 'use', 'plant', 'harvest', 'check', 'monitor', 'test'];
    const sentences = answer.split('.');
    
    return sentences
      .filter(sentence => actionWords.some(word => sentence.toLowerCase().includes(word)))
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 10)
      .slice(0, 5);
  }

  // Generate follow-up questions
  private generateFollowUpQuestions(category: string, _query: FarmingQuery): string[] {
    const baseQuestions: any = {
      'crop-selection': [
        'What is your budget for this crop season?',
        'Do you have access to irrigation facilities?',
        'What was your previous crop yield?'
      ],
      'disease-treatment': [
        'How extensive is the infection area?',
        'Have you tried any treatments previously?',
        'What is your preferred treatment method - organic or chemical?'
      ],
      'fertilizer': [
        'Have you conducted soil testing recently?',
        'What is your current fertilizer budget?',
        'Are you interested in organic alternatives?'
      ]
    };

    return baseQuestions[category] || [
      'Do you need information about government schemes?',
      'Would you like market price information?',
      'Do you need help with farming equipment?'
    ];
  }

  // Generate Hindi follow-up questions
  private generateHindiFollowUpQuestions(category: string, _query: FarmingQuery): string[] {
    const baseQuestions: any = {
      'crop-selection': [
        'इस फसल सीज़न के लिए आपका बजट क्या है?',
        'क्या आपके पास सिंचाई की सुविधा है?',
        'आपकी पिछली फसल की उपज कितनी थी?'
      ],
      'disease-treatment': [
        'संक्रमण का क्षेत्र कितना व्यापक है?',
        'क्या आपने पहले कोई उपचार करने की कोशिश की है?',
        'आप कौन सा उपचार पसंद करते हैं - जैविक या रासायनिक?'
      ],
      'fertilizer': [
        'क्या आपने हाल ही में मिट्टी की जांच कराई है?',
        'आपका वर्तमान उर्वरक बजट क्या है?',
        'क्या आप जैविक विकल्पों में रुचि रखते हैं?'
      ]
    };

    return baseQuestions[category] || [
      'क्या आपको सरकारी योजनाओं की जानकारी चाहिए?',
      'क्या आपको बाजार मूल्य की जानकारी चाहिए?',
      'क्या आपको कृषि उपकरणों में मदद चाहिए?'
    ];
  }

  // Estimate costs based on category
  private estimateCosts(category: string, _query: FarmingQuery): any {
    const costEstimates: any = {
      'fertilizer': {
        min: 5000,
        max: 15000,
        currency: 'INR',
        description: 'Per hectare fertilizer cost for complete season',
        hindiDescription: 'पूरे सीज़न के लिए प्रति हेक्टेयर उर्वरक लागत'
      },
      'pest-control': {
        min: 2000,
        max: 8000,
        currency: 'INR',
        description: 'Pest control treatment cost per hectare',
        hindiDescription: 'प्रति हेक्टेयर कीट नियंत्रण उपचार लागत'
      },
      'disease-treatment': {
        min: 1500,
        max: 6000,
        currency: 'INR',
        description: 'Disease treatment cost per hectare',
        hindiDescription: 'प्रति हेक्टेयर रोग उपचार लागत'
      },
      'irrigation': {
        min: 15000,
        max: 50000,
        currency: 'INR',
        description: 'Irrigation system setup cost per hectare',
        hindiDescription: 'प्रति हेक्टेयर सिंचाई प्रणाली स्थापना लागत'
      }
    };

    return costEstimates[category] || null;
  }

  // Generate timeline based on category
  private generateTimeline(category: string): any {
    const timelines: any = {
      'crop-selection': {
        immediate: ['Research suitable varieties', 'Check soil condition'],
        short_term: ['Prepare land', 'Arrange seeds and inputs'],
        medium_term: ['Sowing and initial care', 'Monitor growth'],
        long_term: ['Harvesting', 'Market preparation']
      },
      'disease-treatment': {
        immediate: ['Identify disease correctly', 'Apply emergency treatment'],
        short_term: ['Monitor treatment effectiveness', 'Adjust treatment if needed'],
        medium_term: ['Preventive measures', 'Field sanitation'],
        long_term: ['Plan resistant varieties for next season']
      }
    };

    return timelines[category] || {
      immediate: ['Assess current situation'],
      short_term: ['Implement recommended actions'],
      medium_term: ['Monitor progress'],
      long_term: ['Evaluate results and plan ahead']
    };
  }

  // Generate Hindi timeline
  private generateHindiTimeline(category: string): any {
    const timelines: any = {
      'crop-selection': {
        immediate: ['उपयुक्त किस्मों का शोध करें', 'मिट्टी की स्थिति जांचें'],
        short_term: ['भूमि तैयार करें', 'बीज और आदान की व्यवस्था करें'],
        medium_term: ['बुवाई और प्रारंभिक देखभाल', 'वृद्धि की निगरानी करें'],
        long_term: ['कटाई', 'बाजार की तैयारी']
      },
      'disease-treatment': {
        immediate: ['रोग की सही पहचान करें', 'आपातकालीन उपचार करें'],
        short_term: ['उपचार की प्रभावशीलता की निगरानी करें', 'आवश्यकता अनुसार उपचार समायोजित करें'],
        medium_term: ['निवारक उपाय', 'खेत की सफाई'],
        long_term: ['अगले सीज़न के लिए प्रतिरोधी किस्मों की योजना बनाएं']
      }
    };

    return timelines[category] || {
      immediate: ['वर्तमान स्थिति का आकलन करें'],
      short_term: ['अनुशंसित कार्यों को लागू करें'],
      medium_term: ['प्रगति की निगरानी करें'],
      long_term: ['परिणामों का मूल्यांकन करें और आगे की योजना बनाएं']
    };
  }

  // Estimate success rate
  private estimateSuccessRate(category: string): number {
    const successRates: any = {
      'fertilizer': 85,
      'irrigation': 90,
      'pest-control': 75,
      'disease-treatment': 70,
      'crop-selection': 80
    };

    return successRates[category] || 75;
  }

  // Assess difficulty level
  private assessDifficultyLevel(category: string): 'beginner' | 'intermediate' | 'advanced' {
    const difficultyLevels: any = {
      'fertilizer': 'beginner',
      'irrigation': 'intermediate',
      'pest-control': 'intermediate',
      'disease-treatment': 'advanced',
      'soil-health': 'intermediate',
      'crop-selection': 'beginner'
    };

    return difficultyLevels[category] || 'intermediate';
  }

  // Check if season specific
  private isSeasonSpecific(category: string): boolean {
    return ['crop-selection', 'pest-control', 'disease-treatment'].includes(category);
  }

  // Check if location specific
  private isLocationSpecific(category: string): boolean {
    return ['crop-selection', 'market', 'government-schemes'].includes(category);
  }

  // Get default answer for errors
  private getDefaultAnswer(query: FarmingQuery): FarmingAnswer {
    return {
      id: Date.now().toString(),
      queryId: query.id,
      answer: 'I apologize, but I need more specific information to provide a detailed answer. Please provide more details about your farming query.',
      hindiAnswer: 'मुझे खुशी है कि आपने पूछा, लेकिन विस्तृत उत्तर देने के लिए मुझे अधिक विशिष्ट जानकारी की आवश्यकता है। कृपया अपने कृषि प्रश्न के बारे में अधिक विवरण प्रदान करें।',
      confidence: 60,
      sources: ['General Agricultural Knowledge'],
      relatedTopics: ['Farming Best Practices', 'Crop Management'],
      actionItems: ['Provide more specific details about your farming question'],
      hindiActionItems: ['अपने कृषि प्रश्न के बारे में अधिक विशिष्ट विवरण प्रदान करें'],
      followUpQuestions: ['What specific crop are you asking about?', 'What is your location and farm size?'],
      hindiFollowUpQuestions: ['आप किस विशिष्ट फसल के बारे में पूछ रहे हैं?', 'आपका स्थान और खेत का आकार क्या है?'],
      difficulty_level: 'beginner',
      season_specific: false,
      location_specific: false
    };
  }

  // Quick farming tips based on current season
  async getSeasonalTips(_location: string, _season: string): Promise<{ tips: string[], hindiTips: string[] }> {
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1; // 1-12

    let seasonalTips: string[] = [];
    let hindiTips: string[] = [];

    // Monsoon season tips (June-September)
    if (month >= 6 && month <= 9) {
      seasonalTips = [
        'Ensure proper drainage in fields to prevent waterlogging',
        'Monitor crops for fungal diseases due to high humidity',
        'Apply zinc and sulfur fertilizers for better disease resistance',
        'Store harvested crops in dry places to prevent spoilage'
      ];
      hindiTips = [
        'जलभराव को रोकने के लिए खेतों में उचित जल निकासी सुनिश्चित करें',
        'अधिक नमी के कारण फंगल रोगों के लिए फसलों की निगरानी करें',
        'बेहतर रोग प्रतिरोधक क्षमता के लिए जिंक और सल्फर उर्वरक लगाएं',
        'खराब होने से बचाने के लिए कटी हुई फसलों को सूखी जगह भंडारित करें'
      ];
    }
    // Winter season tips (October-February)
    else if (month >= 10 || month <= 2) {
      seasonalTips = [
        'Prepare for Rabi season sowing of wheat, barley, and mustard',
        'Apply organic manure before sowing winter crops',
        'Protect crops from frost using smoke or covering methods',
        'Plan irrigation schedule for winter crops'
      ];
      hindiTips = [
        'गेहूं, जौ और सरसों की रबी सीज़न की बुवाई की तैयारी करें',
        'सर्दियों की फसलों की बुवाई से पहले जैविक खाद डालें',
        'धुएं या आवरण विधियों का उपयोग करके फसलों को पाले से बचाएं',
        'सर्दियों की फसलों के लिए सिंचाई कार्यक्रम की योजना बनाएं'
      ];
    }
    // Summer season tips (March-May)
    else {
      seasonalTips = [
        'Focus on water conservation and efficient irrigation',
        'Plant summer vegetables in shaded or protected areas',
        'Harvest Rabi crops at optimal maturity for better quality',
        'Prepare for upcoming Kharif season by planning crop selection'
      ];
      hindiTips = [
        'जल संरक्षण और कुशल सिंचाई पर ध्यान दें',
        'छायादार या संरक्षित क्षेत्रों में गर्मियों की सब्जियां लगाएं',
        'बेहतर गुणवत्ता के लिए इष्टतम परिपक्वता पर रबी फसलों की कटाई करें',
        'फसल चयन की योजना बनाकर आगामी खरीफ सीज़न की तैयारी करें'
      ];
    }

    return { tips: seasonalTips, hindiTips };
  }

  // Generate crop recommendation based on parameters
  async generateCropRecommendation(params: {
    location: string;
    farmSize: number;
    budget: number;
    season: string;
    soilType: string;
    waterAvailability: string;
  }): Promise<{ recommendations: any[], hindiRecommendations: any[] }> {
    const crops = this.farmingKnowledgeBase.crops;
    const recommendations = [];
    const hindiRecommendations = [];

    for (const [cropName, cropInfo] of Object.entries(crops)) {
      let score = 0;
      let reasons = [];
      let hindiReasons = [];

      // Season matching
      if (cropInfo.seasons.includes(params.season)) {
        score += 25;
        reasons.push(`Suitable for ${params.season} season`);
        hindiReasons.push(`${params.season} सीज़न के लिए उपयुक्त`);
      }

      // Water requirement matching
      if (params.waterAvailability === 'high' && cropInfo.water_requirement.includes('High')) {
        score += 20;
        reasons.push('Matches high water availability');
        hindiReasons.push('उच्च पानी की उपलब्धता से मेल खाता है');
      } else if (params.waterAvailability === 'medium' && cropInfo.water_requirement.includes('Medium')) {
        score += 20;
        reasons.push('Suitable for medium water availability');
        hindiReasons.push('मध्यम पानी की उपलब्धता के लिए उपयुक्त');
      }

      // Market price consideration
      const avgPrice = (cropInfo.market_price_range.min + cropInfo.market_price_range.max) / 2;
      if (avgPrice > 3000) {
        score += 15;
        reasons.push('Good market price potential');
        hindiReasons.push('अच्छी बाजार मूल्य क्षमता');
      }

      if (score >= 40) {
        recommendations.push({
          crop: cropName,
          cropHindi: cropInfo.hindi,
          score,
          reasons,
          marketPrice: `₹${cropInfo.market_price_range.min}-${cropInfo.market_price_range.max}`,
          varieties: cropInfo.varieties.slice(0, 3),
          expectedYield: this.getExpectedYield(cropName, params.farmSize)
        });

        hindiRecommendations.push({
          crop: cropInfo.hindi,
          score,
          reasons: hindiReasons,
          marketPrice: `₹${cropInfo.market_price_range.min}-${cropInfo.market_price_range.max}`,
          varieties: cropInfo.varieties.slice(0, 3),
          expectedYield: this.getExpectedYield(cropName, params.farmSize)
        });
      }
    }

    // Sort by score
    recommendations.sort((a, b) => b.score - a.score);
    hindiRecommendations.sort((a, b) => b.score - a.score);

    return { 
      recommendations: recommendations.slice(0, 5), 
      hindiRecommendations: hindiRecommendations.slice(0, 5) 
    };
  }

  // Calculate expected yield
  private getExpectedYield(cropName: string, farmSize: number): string {
    const yieldPerHectare: any = {
      'rice': 45,
      'wheat': 35,
      'cotton': 15,
      'tomato': 250
    };

    const yield_per_hectare = yieldPerHectare[cropName] || 30;
    const totalYield = yield_per_hectare * farmSize;

    return `${totalYield} quintals`;
  }

  // Fallback response when AI is not available
  private getFallbackResponse(query: FarmingQuery, category: string): string {
    const responses: { [key: string]: string } = {
      'crop-selection': `For ${query.location?.state || 'your region'}, consider crops suitable for the current season. Popular choices include rice, wheat, and pulses based on local climate conditions.`,
      'disease-treatment': 'For crop diseases, first identify the symptoms properly. Common treatments include neem-based organic pesticides, proper field sanitation, and crop rotation.',
      'fertilizer': 'Use balanced NPK fertilizers based on soil testing. Organic options like compost and farmyard manure are also beneficial for soil health.',
      'irrigation': 'Ensure proper water management with drip irrigation or sprinkler systems. Water early morning or evening to reduce evaporation.',
      'pest-control': 'Use integrated pest management (IPM) techniques. Combine biological, cultural, and chemical controls as needed.',
      'weather': 'Monitor weather forecasts regularly and plan farming activities accordingly. Protect crops during extreme weather conditions.',
      'market': 'Check local mandi prices and government procurement rates. Consider direct marketing and farmer producer organizations.',
      'government-schemes': 'Explore schemes like PM-KISAN, PMFBY, and KCC. Contact your nearest agriculture office for more information.',
      'soil-health': 'Maintain soil health through organic matter addition, proper pH management, and regular soil testing.',
      'general': 'Smart Krishi Sahayak is here to help with all your farming needs. Please ask specific questions about crops, diseases, or farming practices.'
    };

    return responses[category] || responses['general'];
  }

  private getFallbackResponseHindi(query: FarmingQuery, category: string): string {
    const responses: { [key: string]: string } = {
      'crop-selection': `${query.location?.state || 'आपके क्षेत्र'} के लिए, मौसम के अनुसार उपयुक्त फसलों का चयन करें। धान, गेहूं, और दलहन जैसी फसलें स्थानीय जलवायु के अनुसार अच्छी हैं।`,
      'disease-treatment': 'फसल के रोगों के लिए, पहले लक्षणों की सही पहचान करें। नीम आधारित जैविक कीटनाशक, खेत की सफाई, और फसल चक्र अपनाएं।',
      'fertilizer': 'मिट्टी परीक्षण के आधार पर संतुलित NPK उर्वरक का उपयोग करें। कंपोस्ट और गोबर की खाद भी मिट्टी के स्वास्थ्य के लिए फायदेमंद है।',
      'irrigation': 'ड्रिप या स्प्रिंकलर सिस्टम से उचित जल प्रबंधन करें। सुबह या शाम को पानी दें ताकि वाष्पीकरण कम हो।',
      'pest-control': 'एकीकृत कीट प्रबंधन (IPM) तकनीक का उपयोग करें। जैविक, सांस्कृतिक और रासायनिक नियंत्रण का संयोजन करें।',
      'weather': 'मौसम पूर्वानुमान की नियमित निगरानी करें और खेती की गतिविधियों की योजना बनाएं। चरम मौसम में फसलों की सुरक्षा करें।',
      'market': 'स्थानीय मंडी भाव और सरकारी खरीद दरों की जांच करें। प्रत्यक्ष विपणन और किसान उत्पादक संगठनों पर विचार करें।',
      'government-schemes': 'PM-KISAN, PMFBY, और KCC जैसी योजनाओं का लाभ उठाएं। अधिक जानकारी के लिए अपने निकटतम कृषि कार्यालय से संपर्क करें।',
      'soil-health': 'जैविक पदार्थ मिलाकर, उचित pH बनाए रखकर, और नियमित मिट्टी परीक्षण करके मिट्टी का स्वास्थ्य बनाए रखें।',
      'general': 'स्मार्ट कृषि सहायक आपकी सभी खेती संबंधी जरूरतों में मदद के लिए यहां है। कृपया फसल, रोग, या खेती की प्रथाओं के बारे में विशिष्ट प्रश्न पूछें।'
    };

    return responses[category] || responses['general'];
  }
}

export default new EnhancedFarmingAI();
export type { FarmingQuery, FarmingAnswer };