import { WeatherData } from '../types/weather';

interface ProactiveRecommendation {
  type: 'crop' | 'weather' | 'pest' | 'market' | 'alert';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  actionItems: string[];
  validUntil: Date;
}

interface CropCalendar {
  [month: number]: {
    kharif: string[];
    rabi: string[];
    zaid: string[];
  };
}

interface CropData {
  name: string;
  season: 'kharif' | 'rabi' | 'zaid';
  soilTypes: string[];
  waterRequirement: 'low' | 'medium' | 'high';
  temperatureRange: {
    min: number;
    max: number;
  };
  profitabilityScore: number;
}

class ProactiveRecommendationService {
  private cropCalendar: CropCalendar = {
    0: { // January
      kharif: [],
      rabi: ['wheat', 'mustard', 'peas'],
      zaid: ['watermelon', 'muskmelon', 'cucumber']
    },
    1: { // February
      kharif: [],
      rabi: ['wheat', 'mustard'],
      zaid: ['watermelon', 'muskmelon', 'cucumber']
    },
    // Add more months...
    5: { // June
      kharif: ['rice', 'maize', 'cotton', 'sugarcane'],
      rabi: [],
      zaid: []
    },
    6: { // July
      kharif: ['rice', 'maize', 'cotton', 'sugarcane', 'groundnut'],
      rabi: [],
      zaid: []
    }
    // Complete the calendar...
  };

  private cropDatabase: { [key: string]: CropData } = {
    rice: {
      name: 'Rice',
      season: 'kharif',
      soilTypes: ['clay', 'clay loam'],
      waterRequirement: 'high',
      temperatureRange: { min: 20, max: 35 },
      profitabilityScore: 0.8
    },
    wheat: {
      name: 'Wheat',
      season: 'rabi',
      soilTypes: ['loam', 'clay loam'],
      waterRequirement: 'medium',
      temperatureRange: { min: 15, max: 25 },
      profitabilityScore: 0.75
    }
    // Add more crops...
  };

  private currentRecommendations: ProactiveRecommendation[] = [];

  public generateWeatherBasedRecommendations(weather: WeatherData): ProactiveRecommendation[] {
    const recommendations: ProactiveRecommendation[] = [];

    // Temperature based recommendations
  if (weather.main.temp > 35) {
      recommendations.push({
        type: 'weather',
        priority: 'high',
        title: 'High Temperature Alert',
        description: 'Temperature exceeding optimal range for most crops',
        actionItems: [
          'Increase irrigation frequency',
          'Apply mulching to reduce soil temperature',
          'Create temporary shade for sensitive crops',
          'Water plants during early morning or evening'
        ],
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      });
    }

    // Humidity based recommendations
  if (weather.main.humidity > 80) {
      recommendations.push({
        type: 'pest',
        priority: 'medium',
        title: 'High Humidity Alert',
        description: 'Conditions favorable for fungal diseases',
        actionItems: [
          'Monitor crops for disease symptoms',
          'Ensure proper ventilation',
          'Consider preventive fungicide application',
          'Reduce irrigation frequency'
        ],
        validUntil: new Date(Date.now() + 12 * 60 * 60 * 1000) // 12 hours
      });
    }

    return recommendations;
  }

  public generateSeasonalRecommendations(): ProactiveRecommendation[] {
    const currentMonth = new Date().getMonth();
    const recommendations: ProactiveRecommendation[] = [];

    // Get current season crops
    const seasonalCrops = this.cropCalendar[currentMonth];
    if (seasonalCrops) {
      const allCrops = [
        ...seasonalCrops.kharif,
        ...seasonalCrops.rabi,
        ...seasonalCrops.zaid
      ].filter(crop => this.cropDatabase[crop]);

      // Sort by profitability
      const profitableCrops = allCrops
        .sort((a, b) => 
          (this.cropDatabase[b].profitabilityScore || 0) - 
          (this.cropDatabase[a].profitabilityScore || 0)
        )
        .slice(0, 3);

      if (profitableCrops.length > 0) {
        recommendations.push({
          type: 'crop',
          priority: 'medium',
          title: 'Seasonal Crop Recommendations',
          description: 'Based on current season and market trends',
          actionItems: profitableCrops.map(crop => 
            `Consider planting ${crop}: High profit potential`
          ),
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });
      }
    }

    return recommendations;
  }

  public generateMarketBasedRecommendations(): ProactiveRecommendation[] {
    // This would typically fetch real market data
    // For now, using mock data
    return [{
      type: 'market',
      priority: 'medium',
      title: 'Market Price Trends',
      description: 'Recent changes in crop prices',
      actionItems: [
        'Cotton prices expected to rise in next 2 weeks',
        'Consider storing wheat for better prices',
        'High demand for organic vegetables in nearby markets'
      ],
      validUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days
    }];
  }

  public generatePestAndDiseaseAlerts(weather: WeatherData): ProactiveRecommendation[] {
    const recommendations: ProactiveRecommendation[] = [];

    // Check conditions favorable for pests/diseases
    const isHighRiskCondition = 
      weather.main.temp > 25 && 
      weather.main.humidity > 70;

    if (isHighRiskCondition) {
      recommendations.push({
        type: 'pest',
        priority: 'high',
        title: 'Pest Risk Alert',
        description: 'Current conditions are favorable for pest infestation',
        actionItems: [
          'Monitor crops daily for pest symptoms',
          'Apply neem-based organic pesticides preventively',
          'Maintain field hygiene',
          'Consider trap crops'
        ],
        validUntil: new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours
      });
    }

    return recommendations;
  }

  public getAllRecommendations(weather: WeatherData): ProactiveRecommendation[] {
    this.currentRecommendations = [
      ...this.generateWeatherBasedRecommendations(weather),
      ...this.generateSeasonalRecommendations(),
      ...this.generateMarketBasedRecommendations(),
      ...this.generatePestAndDiseaseAlerts(weather)
    ].sort((a, b) => {
      const priorityScore = { high: 3, medium: 2, low: 1 };
      return priorityScore[b.priority] - priorityScore[a.priority];
    });

    return this.currentRecommendations;
  }

  public getActiveRecommendations(): ProactiveRecommendation[] {
    const now = new Date();
    return this.currentRecommendations.filter(rec => rec.validUntil > now);
  }
}

export const proactiveRecommendationService = new ProactiveRecommendationService();
