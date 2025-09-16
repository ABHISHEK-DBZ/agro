import axios from 'axios';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

export interface Disease {
  name: string;
  scientificName: string;
  crop: string;
  symptoms: string[];
  causes: string[];
  treatment: string[];
  prevention: string[];
  images: string[];
  severity: 'low' | 'medium' | 'high';
  spreadRate: 'slow' | 'moderate' | 'rapid';
  economicImpact: 'low' | 'medium' | 'high';
  organicTreatments: string[];
  chemicalTreatments: string[];
  environmentalConditions: {
    temperature: {
      min: number;
      max: number;
      unit: 'C' | 'F';
    };
    humidity: {
      min: number;
      max: number;
      unit: '%';
    };
    rainfall: {
      min: number;
      max: number;
      unit: 'mm';
    };
  };
  seasonalPrevalence: string[];
  hostPlants: string[];
  naturalEnemies: string[];
  resistantVarieties: string[];
}

export interface DetectionResult {
  disease: Disease;
  confidence: number;
  timestamp: string;
  imageUrl?: string;
  recommendations: string[];
  urgency: 'low' | 'medium' | 'high';
  spreadRisk: 'low' | 'medium' | 'high';
  weatherImpact?: string;
}

interface ModelMetadata {
  name: string;
  version: string;
  accuracy: number;
  lastUpdated: string;
  supportedCrops: string[];
}

class DiseaseDetectionService {
  private model: tf.LayersModel | null = null;
  private readonly modelPath: string;
  private diseaseDatabase: Map<string, Disease>;
  private metadata: ModelMetadata | null = null;
  private isInitialized: boolean = false;

  constructor() {
    this.modelPath = 'models/plant-disease-model/model.json';
    this.diseaseDatabase = new Map();
    this.loadModel();
  }

  private async loadModel() {
    try {
      // Load model metadata
      const metadataResponse = await fetch('models/plant-disease-model/metadata.json');
      this.metadata = await metadataResponse.json();

      // Load disease database
      const databaseResponse = await fetch('models/plant-disease-model/disease-database.json');
      const diseases = await databaseResponse.json();
      diseases.forEach((disease: Disease) => {
        this.diseaseDatabase.set(disease.name, disease);
      });

      // Load TensorFlow.js model
      this.model = await tf.loadLayersModel(this.modelPath);
      console.log('Disease detection model loaded successfully');
      this.isInitialized = true;
    } catch (error) {
      console.error('Error loading disease detection model:', error);
      this.isInitialized = false;
    }
  }

  public async detectDisease(
    imageData: string | File,
    weatherData?: any,
    location?: { lat: number; lon: number }
  ): Promise<DetectionResult | null> {
    if (!this.isInitialized || !this.model) {
      throw new Error('Model not initialized');
    }

    try {
      // Process image
      const tensor = await this.preprocessImage(imageData);
      
      // Get model prediction
      const predictions = await this.model.predict(tensor) as tf.Tensor;
      const results = Array.from(await predictions.data());
      const maxIndex = results.indexOf(Math.max(...results));
      const confidence = results[maxIndex];

      // Get disease details
      const disease = Array.from(this.diseaseDatabase.values())[maxIndex];
      if (!disease) return null;

      // Calculate urgency and spread risk
      const urgency = this.calculateUrgency(disease, confidence);
      const spreadRisk = this.calculateSpreadRisk(disease, weatherData);

      // Generate recommendations
      const recommendations = await this.generateRecommendations(
        disease,
        weatherData,
        location
      );

      // Weather impact analysis
      const weatherImpact = weatherData ? 
        this.analyzeWeatherImpact(disease, weatherData) : undefined;

      // Create result
      const result: DetectionResult = {
        disease,
        confidence,
        timestamp: new Date().toISOString(),
        recommendations,
        urgency,
        spreadRisk,
        weatherImpact
      };

      // Clean up
      tf.dispose([tensor, predictions]);

      return result;
    } catch (error) {
      console.error('Error during disease detection:', error);
      return null;
    }
  }

  private async preprocessImage(imageData: string | File): Promise<tf.Tensor> {
    try {
      let img: HTMLImageElement;

      if (imageData instanceof File) {
        img = await this.loadImageFile(imageData);
      } else {
        img = await this.loadImageUrl(imageData);
      }

      // Convert image to tensor with higher resolution for better accuracy
      const tensor = tf.browser.fromPixels(img)
        .resizeNearestNeighbor([512, 512]) // Increased from 224x224 to 512x512 for much better accuracy
        .toFloat()
        .expandDims();

      // Normalize the tensor
      return tensor.div(255.0);
    } catch (error) {
      console.error('Error preprocessing image:', error);
      throw error;
    }
  }

  private loadImageFile(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private loadImageUrl(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  private calculateUrgency(disease: Disease, confidence: number): 'low' | 'medium' | 'high' {
    if (confidence > 0.9 && disease.severity === 'high') return 'high';
    if (confidence > 0.7 && disease.severity === 'medium') return 'medium';
    return 'low';
  }

  private calculateSpreadRisk(disease: Disease, weatherData?: any): 'low' | 'medium' | 'high' {
    if (!weatherData) return disease.spreadRate === 'rapid' ? 'high' : 'medium';

    const { temperature, humidity } = weatherData.current;
    const idealConditions = disease.environmentalConditions;

    // Check if current conditions are favorable for disease spread
    const tempInRange = temperature >= idealConditions.temperature.min && 
                       temperature <= idealConditions.temperature.max;
    const humidityInRange = humidity >= idealConditions.humidity.min && 
                           humidity <= idealConditions.humidity.max;

    if (tempInRange && humidityInRange) return 'high';
    if (tempInRange || humidityInRange) return 'medium';
    return 'low';
  }

  private async generateRecommendations(
    disease: Disease,
    weatherData?: any,
    location?: { lat: number; lon: number }
  ): Promise<string[]> {
    const recommendations: string[] = [];

    // Add immediate treatment recommendations
    recommendations.push(...disease.treatment.map(t => `Treatment: ${t}`));

    // Add prevention measures
    recommendations.push(...disease.prevention.map(p => `Prevention: ${p}`));

    // Weather-based recommendations
    if (weatherData) {
      const { temperature, humidity, rainfall } = weatherData.current;
      
      if (temperature > disease.environmentalConditions.temperature.max) {
        recommendations.push('High temperature may increase disease stress. Consider providing shade.');
      }
      
      if (humidity > disease.environmentalConditions.humidity.max) {
        recommendations.push('High humidity favors disease development. Improve air circulation.');
      }
      
      if (rainfall > 0) {
        recommendations.push('Recent rainfall may increase disease spread. Monitor closely.');
      }
    }

    // Location-based recommendations
    if (location) {
      try {
        // Get nearby agricultural supply stores
        const response = await axios.get(
          `https://api.opencagedata.com/geocode/v1/json?q=${location.lat}+${location.lon}&key=${import.meta.env.VITE_GEOCODING_API_KEY}`
        );
        
        if (response.data.results && response.data.results.length > 0) {
          const address = response.data.results[0].formatted;
          recommendations.push(`Nearest agricultural supply stores in ${address}`);
        }
      } catch (error) {
        console.error('Error getting location-based recommendations:', error);
      }
    }

    // Add organic alternatives
    if (disease.organicTreatments.length > 0) {
      recommendations.push('Organic treatment options:');
      recommendations.push(...disease.organicTreatments.map(t => `- ${t}`));
    }

    // Add resistant varieties
    if (disease.resistantVarieties.length > 0) {
      recommendations.push('Consider these resistant varieties for future planting:');
      recommendations.push(...disease.resistantVarieties.map(v => `- ${v}`));
    }

    return recommendations;
  }

  private analyzeWeatherImpact(disease: Disease, weatherData: any): string {
    const conditions = disease.environmentalConditions;
    const current = weatherData.current;

    const impacts: string[] = [];

    // Temperature impact
    if (current.temperature > conditions.temperature.max) {
      impacts.push('High temperature may increase disease severity');
    } else if (current.temperature < conditions.temperature.min) {
      impacts.push('Low temperature may slow disease development');
    }

    // Humidity impact
    if (current.humidity > conditions.humidity.max) {
      impacts.push('High humidity creates favorable conditions for disease spread');
    } else if (current.humidity < conditions.humidity.min) {
      impacts.push('Low humidity may help control disease spread');
    }

    // Rainfall impact
    if (current.rainfall > conditions.rainfall.max) {
      impacts.push('Heavy rainfall may increase disease pressure');
    }

    return impacts.join('. ') || 'Current weather conditions have minimal impact on disease development.';
  }

  public async getSimilarCases(diseaseResult: DetectionResult): Promise<Disease[]> {
    return Array.from(this.diseaseDatabase.values())
      .filter(d => d.crop === diseaseResult.disease.crop)
      .filter(d => d.name !== diseaseResult.disease.name)
      .slice(0, 3);
  }

  public getModelInfo(): ModelMetadata | null {
    return this.metadata;
  }

  public isModelReady(): boolean {
    return this.isInitialized;
  }
}

export default new DiseaseDetectionService();
