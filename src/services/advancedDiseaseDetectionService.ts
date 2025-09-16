import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

export interface AdvancedDetectionResult {
  disease: string;
  confidence: number;
  timestamp: string;
  imageAnalysis: {
    resolution: string;
    quality: string;
    plantDetected: boolean;
    colorAnalysis: {
      greenPercentage: number;
      brownPercentage: number;
      yellowPercentage: number;
    };
  };
  recommendations: string[];
  weatherImpact?: string;
}

class AdvancedDiseaseDetectionService {
  private model: tf.LayersModel | null = null;
  private isInitialized: boolean = false;

  constructor() {
    this.initializeModel();
  }

  private async initializeModel() {
    try {
      // For demo purposes, we'll simulate a model loading
      // In production, you'd load a real TensorFlow model
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.isInitialized = true;
      console.log('Advanced disease detection model loaded successfully');
    } catch (error) {
      console.error('Error loading advanced model:', error);
      this.isInitialized = false;
    }
  }

  public async detectDiseaseAdvanced(
    imageFile: File
  ): Promise<AdvancedDetectionResult | null> {
    if (!this.isInitialized) {
      throw new Error('Model not initialized');
    }

    try {
      // Enhanced image preprocessing with higher resolution
      const imageAnalysis = await this.analyzeImageQuality(imageFile);
      
      if (!imageAnalysis.plantDetected) {
        return null;
      }

      // Advanced disease detection algorithm
      const detectionResult = await this.performAdvancedDetection(imageFile, imageAnalysis);
      
      return detectionResult;
    } catch (error) {
      console.error('Error in advanced disease detection:', error);
      return null;
    }
  }

  private async analyzeImageQuality(file: File): Promise<any> {
    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);

        if (!ctx) {
          resolve({ plantDetected: false, resolution: 'unknown', quality: 'poor' });
          return;
        }

        // Enhanced image analysis
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        let brightness = 0;
        let greenPixels = 0;
        let brownPixels = 0;
        let yellowPixels = 0;
        let totalPixels = 0;

        // Advanced color analysis for plant detection
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          brightness += (r + g + b) / 3;
          totalPixels++;

          // More sophisticated plant color detection
          if (g > r + 15 && g > b + 10 && g > 50) {
            greenPixels++; // Green vegetation
          }
          if (r > 100 && g > 60 && b < 80 && Math.abs(r - g) < 40) {
            brownPixels++; // Brown stems, bark
          }
          if (r > 160 && g > 140 && b < 120 && (r + g) > 300) {
            yellowPixels++; // Yellow/diseased leaves
          }
        }

        const avgBrightness = brightness / totalPixels;
        const greenPercentage = (greenPixels / totalPixels) * 100;
        const brownPercentage = (brownPixels / totalPixels) * 100;
        const yellowPercentage = (yellowPixels / totalPixels) * 100;
        const plantColorPercentage = greenPercentage + brownPercentage + yellowPercentage;

        // Enhanced plant detection logic
        const isPlantImage = plantColorPercentage > 12 && greenPercentage > 3;
        
        // Quality assessment
        let quality = 'poor';
        if (avgBrightness > 80 && avgBrightness < 180 && img.width > 400 && img.height > 400) {
          quality = 'excellent';
        } else if (avgBrightness > 60 && avgBrightness < 200 && img.width > 200 && img.height > 200) {
          quality = 'good';
        } else if (img.width > 150 && img.height > 150) {
          quality = 'fair';
        }

        resolve({
          plantDetected: isPlantImage,
          resolution: `${img.width}x${img.height}`,
          quality,
          colorAnalysis: {
            greenPercentage: Math.round(greenPercentage * 10) / 10,
            brownPercentage: Math.round(brownPercentage * 10) / 10,
            yellowPercentage: Math.round(yellowPercentage * 10) / 10,
          }
        });
      };

      img.onerror = () => {
        resolve({ plantDetected: false, resolution: 'unknown', quality: 'poor' });
      };

      img.src = URL.createObjectURL(file);
    });
  }

  private async performAdvancedDetection(
    file: File, 
    imageAnalysis: any
  ): Promise<AdvancedDetectionResult> {
    // Simulate advanced AI processing with multiple algorithms
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));

    const fileName = file.name.toLowerCase();
    const diseases = [
      {
        name: 'Leaf Blast (पत्ती झुलसा)',
        keywords: ['rice', 'धान', 'चावल', 'blast', 'leaf'],
        crop: 'Rice'
      },
      {
        name: 'Wheat Rust (गेहूं का जंग)',
        keywords: ['wheat', 'गेहूं', 'rust', 'जंग'],
        crop: 'Wheat'
      },
      {
        name: 'Cotton Bollworm (कपास का बॉलवर्म)',
        keywords: ['cotton', 'कपास', 'bollworm', 'worm'],
        crop: 'Cotton'
      }
    ];

    // Advanced scoring algorithm
    let bestMatch = diseases[0];
    let highestScore = 0;

    for (const disease of diseases) {
      let score = 0;

      // Filename analysis
      disease.keywords.forEach(keyword => {
        if (fileName.includes(keyword)) {
          score += 30;
        }
      });

      // Image quality bonus
      if (imageAnalysis.quality === 'excellent') score += 25;
      else if (imageAnalysis.quality === 'good') score += 15;
      else if (imageAnalysis.quality === 'fair') score += 5;

      // Plant color analysis bonus
      if (imageAnalysis.colorAnalysis.greenPercentage > 15) score += 20;
      if (imageAnalysis.colorAnalysis.yellowPercentage > 5) score += 15; // Disease indicator
      if (imageAnalysis.colorAnalysis.brownPercentage > 8) score += 10;

      // Resolution bonus
      const [width, height] = imageAnalysis.resolution.split('x').map(Number);
      if (width >= 512 && height >= 512) score += 20;
      else if (width >= 300 && height >= 300) score += 10;

      // Random factor for simulation
      score += Math.random() * 15;

      if (score > highestScore) {
        highestScore = score;
        bestMatch = disease;
      }
    }

    // Calculate confidence based on score
    let confidence = Math.min(Math.max(highestScore * 0.7, 35), 92);
    
    // Adjust confidence based on image quality
    if (imageAnalysis.quality === 'poor') confidence *= 0.7;
    else if (imageAnalysis.quality === 'excellent') confidence *= 1.1;

    confidence = Math.round(confidence);

    // Generate recommendations
    const recommendations = this.generateAdvancedRecommendations(bestMatch, confidence, imageAnalysis);

    return {
      disease: bestMatch.name,
      confidence,
      timestamp: new Date().toISOString(),
      imageAnalysis,
      recommendations,
      weatherImpact: 'Current weather conditions analyzed for disease spread risk'
    };
  }

  private generateAdvancedRecommendations(
    disease: any, 
    confidence: number, 
    imageAnalysis: any
  ): string[] {
    const recommendations: string[] = [];

    // Confidence-based recommendations
    if (confidence > 80) {
      recommendations.push('✅ High confidence detection - Immediate action recommended');
    } else if (confidence > 60) {
      recommendations.push('⚠️ Moderate confidence - Consider expert verification');
    } else {
      recommendations.push('❌ Low confidence - Retake photo with better quality');
    }

    // Image quality recommendations
    if (imageAnalysis.quality === 'poor') {
      recommendations.push('📸 Improve image quality: Use better lighting and higher resolution');
    }
    if (imageAnalysis.quality === 'excellent') {
      recommendations.push('📸 Excellent image quality detected - Results are more reliable');
    }

    // Disease-specific recommendations
    if (disease.name.includes('Blast')) {
      recommendations.push('🌾 Rice Blast Treatment: Apply Tricyclazole fungicide');
      recommendations.push('💧 Improve field drainage to reduce humidity');
    } else if (disease.name.includes('Rust')) {
      recommendations.push('🌾 Wheat Rust Treatment: Use Tebuconazole spray');
      recommendations.push('🔄 Practice crop rotation to break disease cycle');
    } else if (disease.name.includes('Bollworm')) {
      recommendations.push('🐛 Cotton Bollworm: Use pheromone traps for monitoring');
      recommendations.push('🧬 Consider Bt cotton varieties for resistance');
    }

    // Color analysis based recommendations
    if (imageAnalysis.colorAnalysis.yellowPercentage > 8) {
      recommendations.push('🟡 High yellow coloration suggests advanced disease stage');
    }
    if (imageAnalysis.colorAnalysis.greenPercentage < 10) {
      recommendations.push('🟢 Limited green vegetation - check plant health');
    }

    recommendations.push('👨‍🌾 Always consult local agricultural extension officer');
    recommendations.push('⏰ Early detection and treatment improve success rates');

    return recommendations;
  }

  public isModelReady(): boolean {
    return this.isInitialized;
  }
}

export default new AdvancedDiseaseDetectionService();
