interface Location {
  latitude: number;
  longitude: number;
  state: string;
  district: string;
  locality: string;
  pincode: string;
}

interface AgroClimaticZone {
  name: string;
  states: string[];
  characteristics: {
    rainfall: string;
    temperature: string;
    soilTypes: string[];
    majorCrops: string[];
  };
  recommendations: string[];
}

interface SoilType {
  name: string;
  characteristics: string[];
  suitableCrops: string[];
  recommendedFertilizers: string[];
  management: string[];
}

class LocationService {
  private currentLocation: Location | null = null;
  private watchId: number | null = null;

  private agroClimaticZones: AgroClimaticZone[] = [
    {
      name: "Western Himalayan Region",
      states: ["Jammu & Kashmir", "Himachal Pradesh", "Uttarakhand", "Ladakh"],
      characteristics: {
        rainfall: "1000-2500mm",
        temperature: "Cool (5-25°C)",
        soilTypes: ["Mountain soil", "Forest soil", "Brown soil"],
        majorCrops: ["Apple", "Rice", "Wheat", "Maize", "Barley", "Potato"]
      },
      recommendations: [
        "Focus on temperate fruits",
        "Use terrace farming",
        "Practice soil conservation",
        "Implement protected cultivation",
        "Use cold-resistant crop varieties"
      ]
    },
    {
      name: "Indo-Gangetic Plains",
      states: ["Punjab", "Haryana", "Uttar Pradesh", "Bihar", "West Bengal"],
      characteristics: {
        rainfall: "600-1000mm",
        temperature: "Hot summer (35-45°C), Cool winter (5-25°C)",
        soilTypes: ["Alluvial soil"],
        majorCrops: ["Rice", "Wheat", "Sugarcane", "Maize", "Cotton", "Jute"]
      },
      recommendations: [
        "Practice crop rotation",
        "Use modern irrigation methods",
        "Implement integrated farming",
        "Follow rice-wheat cropping pattern",
        "Use zero tillage in wheat"
      ]
    },
    {
      name: "Eastern Plateau and Hills",
      states: ["Jharkhand", "Odisha", "Chhattisgarh", "Eastern Madhya Pradesh"],
      characteristics: {
        rainfall: "1300-1600mm",
        temperature: "Hot (25-40°C)",
        soilTypes: ["Red soil", "Laterite soil"],
        majorCrops: ["Rice", "Maize", "Pulses", "Oilseeds", "Niger"]
      },
      recommendations: [
        "Use drought-resistant varieties",
        "Practice water conservation",
        "Implement agroforestry",
        "Use integrated farming systems",
        "Focus on soil moisture conservation"
      ]
    },
    {
      name: "Central Plateau and Hills",
      states: ["Madhya Pradesh", "Rajasthan", "Western Maharashtra"],
      characteristics: {
        rainfall: "800-1300mm",
        temperature: "Hot (30-45°C)",
        soilTypes: ["Black soil", "Red soil"],
        majorCrops: ["Cotton", "Soybean", "Sorghum", "Pulses"]
      },
      recommendations: [
        "Practice moisture conservation",
        "Use drought-tolerant crops",
        "Implement watershed management",
        "Focus on soil health management",
        "Use intercropping systems"
      ]
    },
    {
      name: "Western Plateau and Hills",
      states: ["Maharashtra", "Western Madhya Pradesh"],
      characteristics: {
        rainfall: "800-1000mm",
        temperature: "Hot (25-40°C)",
        soilTypes: ["Black soil", "Medium black soil"],
        majorCrops: ["Cotton", "Sugarcane", "Sorghum", "Groundnut"]
      },
      recommendations: [
        "Use drip irrigation",
        "Practice conservation agriculture",
        "Implement integrated nutrient management",
        "Focus on soil moisture conservation",
        "Use drought-resistant varieties"
      ]
    },
    {
      name: "Southern Peninsula",
      states: ["Tamil Nadu", "Karnataka", "Kerala", "Andhra Pradesh", "Telangana"],
      characteristics: {
        rainfall: "600-1000mm",
        temperature: "Hot and Humid (25-35°C)",
        soilTypes: ["Red soil", "Black soil", "Laterite soil"],
        majorCrops: ["Rice", "Coconut", "Spices", "Cotton", "Sugarcane"]
      },
      recommendations: [
        "Practice water conservation",
        "Use integrated pest management",
        "Implement precision farming",
        "Focus on horticultural crops",
        "Use climate-resilient varieties"
      ]
    },
    {
      name: "Gujarat Plains and Hills",
      states: ["Gujarat"],
      characteristics: {
        rainfall: "400-800mm",
        temperature: "Hot (30-45°C)",
        soilTypes: ["Alluvial soil", "Black soil", "Sandy soil"],
        majorCrops: ["Cotton", "Groundnut", "Wheat", "Bajra", "Castor"]
      },
      recommendations: [
        "Practice water harvesting",
        "Use micro-irrigation systems",
        "Implement salt-tolerant varieties",
        "Focus on oilseed crops",
        "Use crop diversification"
      ]
    },
    {
      name: "North-Eastern Region",
      states: ["Assam", "Meghalaya", "Nagaland", "Manipur", "Tripura", "Mizoram", "Arunachal Pradesh", "Sikkim"],
      characteristics: {
        rainfall: "2000-4000mm",
        temperature: "Warm and Humid (20-30°C)",
        soilTypes: ["Red soil", "Laterite soil", "Forest soil"],
        majorCrops: ["Rice", "Tea", "Jute", "Pineapple", "Citrus fruits"]
      },
      recommendations: [
        "Practice terrace farming",
        "Use organic farming methods",
        "Implement agroforestry",
        "Focus on horticultural crops",
        "Use soil conservation measures"
      ]
    }
    // End of zones
  ];

  private soilTypes: { [key: string]: SoilType } = {
    "alluvial": {
      name: "Alluvial Soil",
      characteristics: [
        "Rich in humus and nutrients",
        "Good water retention",
        "High fertility",
        "pH range 6.5-7.5",
        "Deep soil profile"
      ],
      suitableCrops: [
        "Rice",
        "Wheat",
        "Sugarcane",
        "Cotton",
        "Maize",
        "Jute",
        "Oilseeds"
      ],
      recommendedFertilizers: [
        "NPK 120:60:40",
        "Zinc sulfate",
        "Organic manure",
        "Vermicompost",
        "Bio-fertilizers"
      ],
      management: [
        "Regular irrigation",
        "Crop rotation",
        "Green manuring",
        "Integrated nutrient management",
        "Conservation tillage"
      ]
    },
    "black": {
      name: "Black Cotton Soil",
      characteristics: [
        "High clay content",
        "Good moisture retention",
        "Rich in calcium and magnesium",
        "Self-ploughing nature",
        "Poor drainage"
      ],
      suitableCrops: [
        "Cotton",
        "Soybean",
        "Groundnut",
        "Pulses",
        "Wheat",
        "Jowar",
        "Sunflower"
      ],
      recommendedFertilizers: [
        "DAP",
        "Potash",
        "Sulfur",
        "Zinc",
        "Farm yard manure"
      ],
      management: [
        "Deep ploughing",
        "Proper drainage",
        "Conservation tillage",
        "Ridge and furrow method",
        "Mulching"
      ]
    },
    "red": {
      name: "Red Soil",
      characteristics: [
        "Rich in iron oxides",
        "Poor in nitrogen",
        "Low water retention",
        "Well-drained",
        "pH range 6.0-6.5"
      ],
      suitableCrops: [
        "Groundnut",
        "Millets",
        "Pulses",
        "Cotton",
        "Tobacco",
        "Potato"
      ],
      recommendedFertilizers: [
        "NPK 90:45:45",
        "Organic matter",
        "Bio-fertilizers",
        "Micronutrients",
        "Green manure"
      ],
      management: [
        "Frequent irrigation",
        "Organic matter addition",
        "Mulching",
        "Soil moisture conservation",
        "Contour bunding"
      ]
    },
    "laterite": {
      name: "Laterite Soil",
      characteristics: [
        "Rich in iron and aluminum",
        "Poor in organic matter",
        "Acidic in nature",
        "Well-drained",
        "Low fertility"
      ],
      suitableCrops: [
        "Cashew",
        "Rubber",
        "Tea",
        "Coffee",
        "Coconut",
        "Tapioca"
      ],
      recommendedFertilizers: [
        "NPK 60:30:30",
        "Lime",
        "Organic manure",
        "Rock phosphate",
        "Micronutrients"
      ],
      management: [
        "Liming",
        "Organic matter addition",
        "Terracing",
        "Contour bunding",
        "Cover cropping"
      ]
    },
    "desert": {
      name: "Desert Soil",
      characteristics: [
        "Sandy texture",
        "Poor in organic matter",
        "Low water retention",
        "High infiltration rate",
        "Low fertility"
      ],
      suitableCrops: [
        "Pearl millet",
        "Cluster bean",
        "Moth bean",
        "Sesame",
        "Cumin"
      ],
      recommendedFertilizers: [
        "NPK 40:20:20",
        "Organic manure",
        "Gypsum",
        "Sulfur",
        "Zinc"
      ],
      management: [
        "Mulching",
        "Drip irrigation",
        "Wind breaks",
        "Soil stabilization",
        "Conservation agriculture"
      ]
    },
    "forest": {
      name: "Forest Soil",
      characteristics: [
        "Rich in organic matter",
        "Good structure",
        "High water retention",
        "Acidic to neutral pH",
        "High fertility"
      ],
      suitableCrops: [
        "Tea",
        "Coffee",
        "Spices",
        "Fruits",
        "Vegetables"
      ],
      recommendedFertilizers: [
        "NPK 80:40:40",
        "Organic manure",
        "Bio-fertilizers",
        "Vermicompost",
        "Green manure"
      ],
      management: [
        "Soil conservation",
        "Organic farming",
        "Agroforestry",
        "Terrace farming",
        "Mulching"
      ]
    },
    "coastal": {
      name: "Coastal Soil",
      characteristics: [
        "Sandy texture",
        "Saline in nature",
        "Poor water retention",
        "High pH",
        "Poor fertility"
      ],
      suitableCrops: [
        "Coconut",
        "Betel nut",
        "Rice",
        "Cashew",
        "Vegetables"
      ],
      recommendedFertilizers: [
        "NPK 100:50:50",
        "Gypsum",
        "Organic manure",
        "Zinc sulfate",
        "Bio-fertilizers"
      ],
      management: [
        "Salt management",
        "Drainage improvement",
        "Raised bed cultivation",
        "Organic matter addition",
        "Salt-tolerant varieties"
      ]
    }
    // End of soil types
  };

  constructor() {
    this.initializeLocation();
  }

  private initializeLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.updateLocation(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          if (error.code === 3) {
            alert('Location request timed out. Please check your internet or location settings.');
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      );

      // Start watching location
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          this.updateLocation(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error('Error watching location:', error);
          if (error.code === 3) {
            alert('Location request timed out while watching location. Please check your internet or location settings.');
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      );
    }
  }

  private async updateLocation(latitude: number, longitude: number) {
    try {
      // Reverse geocoding using Nominatim API
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const data = await response.json();

      this.currentLocation = {
        latitude,
        longitude,
        state: data.address.state || '',
        district: data.address.county || data.address.city_district || '',
        locality: data.address.suburb || data.address.village || '',
        pincode: data.address.postcode || ''
      };
    } catch (error) {
      console.error('Error updating location:', error);
    }
  }

  public getCurrentLocation(): Location | null {
    return this.currentLocation;
  }

  public getAgroClimaticZone(state: string): AgroClimaticZone | null {
    return this.agroClimaticZones.find(
      zone => zone.states.includes(state)
    ) || null;
  }

  public getSoilType(soilName: string): SoilType | null {
    return this.soilTypes[soilName.toLowerCase()] || null;
  }

  public getLocalizedRecommendations(): string[] {
    if (!this.currentLocation) return [];

    const recommendations: string[] = [];
    const zone = this.getAgroClimaticZone(this.currentLocation.state);

    if (zone) {
      recommendations.push(
        ...zone.recommendations,
        `Major crops for your region: ${zone.characteristics.majorCrops.join(', ')}`,
        `Typical rainfall: ${zone.characteristics.rainfall}`,
        `Suitable soil types: ${zone.characteristics.soilTypes.join(', ')}`
      );
    }

    return recommendations;
  }

  public stopWatching() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  public getCropRecommendations(): string[] {
    if (!this.currentLocation) return [];

    const zone = this.getAgroClimaticZone(this.currentLocation.state);
    if (!zone) return [];

    const currentMonth = new Date().getMonth();
    const seasonalRecommendations = [];

    // Kharif season (June-October)
    if (currentMonth >= 5 && currentMonth <= 9) {
      seasonalRecommendations.push(
        "Kharif season crops suitable for your region:",
        ...zone.characteristics.majorCrops
          .filter(crop => ["Rice", "Cotton", "Maize", "Soybean"].includes(crop))
      );
    }
    // Rabi season (October-March)
    else if (currentMonth >= 9 || currentMonth <= 2) {
      seasonalRecommendations.push(
        "Rabi season crops suitable for your region:",
        ...zone.characteristics.majorCrops
          .filter(crop => ["Wheat", "Barley", "Mustard"].includes(crop))
      );
    }
    // Zaid season (March-June)
    else {
      seasonalRecommendations.push(
        "Zaid season crops suitable for your region:",
        ...zone.characteristics.majorCrops
          .filter(crop => ["Watermelon", "Cucumber", "Vegetables"].includes(crop))
      );
    }

    return seasonalRecommendations;
  }
}

export const locationService = new LocationService();
