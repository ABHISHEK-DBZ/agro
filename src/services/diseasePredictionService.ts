import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

interface PredictionResult {
  disease: string;
  confidence: number;
  recommendations: string[];
}

class DiseasePredictionService {
  private model: tf.LayersModel | null = null;
  private isModelLoading = false;
  private diseaseClasses: string[] = [
    'Apple___Apple_scab',
    'Apple___Black_rot',
    'Apple___Cedar_apple_rust',
    'Apple___healthy',
    'Corn___Cercospora_leaf_spot Gray_leaf_spot',
    'Corn___Common_rust',
    'Corn___Northern_Leaf_Blight',
    'Corn___healthy',
    'Potato___Early_blight',
    'Potato___Late_blight',
    'Potato___healthy',
    'Rice___Bacterial leaf blight',
    'Rice___Brown spot',
    'Rice___Leaf smut',
    'Rice___healthy',
    'Tomato___Bacterial_spot',
    'Tomato___Early_blight',
    'Tomato___Late_blight',
    'Tomato___Leaf_Mold',
    'Tomato___Septoria_leaf_spot',
    'Tomato___Spider_mites Two-spotted_spider_mite',
    'Tomato___Target_Spot',
    'Tomato___Tomato_Yellow_Leaf_Curl_Virus',
    'Tomato___Tomato_mosaic_virus',
    'Tomato___healthy'
  ];

  // Recommendations have been removed as they were unused.

  constructor() {
    this.initializeModel();
  }

  private async initializeModel() {
    if (this.model || this.isModelLoading) return;

    try {
      this.isModelLoading = true;
      // Load the model from your hosted location
      // Example: this.model = await tf.loadLayersModel('https://your-model-url/model.json');
      this.model = await tf.loadLayersModel('/models/plant_disease_model/model.json');
      console.log('Disease detection model loaded successfully');
    } catch (error) {
      console.error('Error loading disease detection model:', error);
    } finally {
      this.isModelLoading = false;
    }
  }

  private preprocessImage(imageData: ImageData): tf.Tensor {
    // Convert ImageData to tensor
    const tensor = tf.browser.fromPixels(imageData)
      .resizeNearestNeighbor([224, 224]) // Resize to model input size
      .toFloat()
      .expandDims();
    
    // Normalize the tensor
    return tensor.div(255.0);
  }

  private getDiseaseInfo(diseaseClass: string): {
    name: string;
    description: string;
    symptoms: string[];
    preventiveMeasures: string[];
    treatments: string[];
  } {
    const diseaseInfo = {
      'Apple___Apple_scab': {
        name: 'Apple Scab',
        description: 'A serious fungal disease that affects apple trees, causing dark spots on leaves and fruit.',
        symptoms: [
          'Olive green to brown spots on leaves',
          'Dark, scabby lesions on fruit',
          'Deformed fruit',
          'Premature leaf drop'
        ],
        preventiveMeasures: [
          'Plant resistant varieties',
          'Maintain good air circulation',
          'Remove fallen leaves in autumn',
          'Apply preventive fungicides'
        ],
        treatments: [
          'Apply appropriate fungicides',
          'Remove infected plant parts',
          'Improve orchard sanitation',
          'Manage irrigation to reduce leaf wetness'
        ]
      },
      'Rice___Bacterial leaf blight': {
        name: 'Bacterial Leaf Blight',
        description: 'A serious bacterial disease affecting rice crops worldwide.',
        symptoms: [
          'Water-soaked lesions on leaves',
          'Yellow to white streaks',
          'Wilting of seedlings',
          'Greyish-white lesions'
        ],
        preventiveMeasures: [
          'Use resistant varieties',
          'Practice crop rotation',
          'Maintain proper spacing',
          'Avoid excess nitrogen'
        ],
        treatments: [
          'Remove infected plants',
          'Apply copper-based bactericides',
          'Maintain field sanitation',
          'Adjust water management'
        ]
      }
      // Add more disease information
    };

    return diseaseInfo[diseaseClass as keyof typeof diseaseInfo] || {
      name: diseaseClass.replace(/_/g, ' '),
      description: 'Information not available',
      symptoms: [],
      preventiveMeasures: [],
      treatments: []
    };
  }

  public async predictDisease(image: File): Promise<PredictionResult | null> {
    if (!this.model) {
      await this.initializeModel();
      if (!this.model) return null;
    }

    try {
      // Create an image element
      const img = new Image();
      img.src = URL.createObjectURL(image);
      await new Promise(resolve => img.onload = resolve);

      // Create a canvas to get image data
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Preprocess the image
      const tensor = this.preprocessImage(imageData);

      // Make prediction
      const predictions = await this.model.predict(tensor) as tf.Tensor;
      const scores = await predictions.data();

      // Get the highest confidence prediction
      const maxScore = Math.max(...Array.from(scores));
      const predictedIndex = Array.from(scores).indexOf(maxScore);
      const predictedClass = this.diseaseClasses[predictedIndex];

      // Get disease information
      const diseaseInfo = this.getDiseaseInfo(predictedClass);

      // Clean up
      tensor.dispose();
      if (typeof (predictions as any).dispose === 'function') {
        (predictions as any).dispose();
      }
      URL.revokeObjectURL(img.src);

      return {
        disease: diseaseInfo.name,
        confidence: maxScore,
        recommendations: [
          ...diseaseInfo.symptoms.map(s => `Symptom: ${s}`),
          ...diseaseInfo.preventiveMeasures.map(p => `Prevention: ${p}`),
          ...diseaseInfo.treatments.map(t => `Treatment: ${t}`)
        ]
      };
    } catch (error) {
      console.error('Error predicting disease:', error);
      return null;
    }
  }

  public isReady(): boolean {
    return this.model !== null;
  }

  public isLoading(): boolean {
    return this.isModelLoading;
  }
}

export const diseasePredictionService = new DiseasePredictionService();
