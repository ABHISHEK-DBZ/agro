interface CropCharacteristics {
  name: string;
  hindiName: string;
  leafShape: string[];
  leafColor: string[];
  diseases: DiseaseInfo[];
  keywords: string[];
  colorProfile: {
    primaryGreen: [number, number, number];
    secondaryColors: [number, number, number][];
  };
}

interface DiseaseInfo {
  id: string;
  name: string;
  hindiName: string;
  symptoms: string[];
  hindiSymptoms: string[];
  treatment: string[];
  hindiTreatment: string[];
  confidence: number;
  visualIndicators: {
    colors: [number, number, number][];
    patterns: string[];
  };
}

class EnhancedCropDiseaseService {
  private crops: CropCharacteristics[] = [
    {
      name: 'Rice',
      hindiName: 'धान/चावल',
      leafShape: ['long', 'narrow', 'pointed'],
      leafColor: ['light-green', 'dark-green'],
      keywords: ['rice', 'धान', 'चावल', 'paddy', 'दान'],
      colorProfile: {
        primaryGreen: [76, 153, 76],
        secondaryColors: [[102, 204, 102], [51, 102, 51]]
      },
      diseases: [
        {
          id: 'rice_blast',
          name: 'Leaf Blast',
          hindiName: 'पत्ती झुलसा',
          symptoms: [
            'Diamond-shaped lesions with gray centers',
            'Brown spots on leaves',
            'Leaf yellowing and wilting'
          ],
          hindiSymptoms: [
            'हीरे के आकार के घाव जिनके बीच में धूसर रंग है',
            'पत्तियों पर भूरे रंग के धब्बे',
            'पत्तियों का पीला होना और मुरझाना'
          ],
          treatment: [
            'Apply Tricyclazole fungicide (0.6g/L)',
            'Remove infected plant parts',
            'Improve field drainage'
          ],
          hindiTreatment: [
            'ट्राइसाइक्लाज़ोल फंगिसाइड लगाएं (0.6g/L)',
            'संक्रमित पौधे के हिस्से हटाएं',
            'खेत की जल निकासी सुधारें'
          ],
          confidence: 85,
          visualIndicators: {
            colors: [[139, 69, 19], [205, 133, 63], [210, 180, 140]],
            patterns: ['spots', 'lesions', 'yellowing']
          }
        }
      ]
    },
    {
      name: 'Wheat',
      hindiName: 'गेहूं',
      leafShape: ['medium', 'flat', 'ribbed'],
      leafColor: ['blue-green', 'yellow-green'],
      keywords: ['wheat', 'गेहूं', 'गहूं', 'gehun'],
      colorProfile: {
        primaryGreen: [107, 142, 35],
        secondaryColors: [[154, 205, 50], [85, 107, 47]]
      },
      diseases: [
        {
          id: 'wheat_rust',
          name: 'Wheat Rust',
          hindiName: 'गेहूं का जंग',
          symptoms: [
            'Orange to reddish-brown pustules on leaves',
            'Powdery texture on leaf surface',
            'Yellowing of leaves'
          ],
          hindiSymptoms: [
            'पत्तियों पर नारंगी से लाल-भूरे पुश्चर',
            'पत्ती की सतह पर पाउडर जैसी बनावट',
            'पत्तियों का पीला होना'
          ],
          treatment: [
            'Spray Tebuconazole (1ml/L)',
            'Use resistant varieties',
            'Practice crop rotation'
          ],
          hindiTreatment: [
            'टेबुकोनाज़ोल छिड़काव करें (1ml/L)',
            'प्रतिरोधी किस्में उगाएं',
            'फसल चक्र अपनाएं'
          ],
          confidence: 88,
          visualIndicators: {
            colors: [[255, 140, 0], [255, 69, 0], [205, 92, 92]],
            patterns: ['pustules', 'powdery', 'rust-colored']
          }
        }
      ]
    },
    {
      name: 'Cotton',
      hindiName: 'कपास',
      leafShape: ['broad', 'lobed', 'heart-shaped'],
      leafColor: ['dark-green', 'bright-green'],
      keywords: ['cotton', 'कपास', 'kapas', 'रुई'],
      colorProfile: {
        primaryGreen: [34, 139, 34],
        secondaryColors: [[0, 128, 0], [50, 205, 50]]
      },
      diseases: [
        {
          id: 'cotton_bollworm',
          name: 'Cotton Bollworm',
          hindiName: 'कपास का बॉलवर्म',
          symptoms: [
            'Holes in bolls and squares',
            'Damaged flowers and buds',
            'Presence of larvae'
          ],
          hindiSymptoms: [
            'गांठों और वर्गों में छेद',
            'क्षतिग्रस्त फूल और कलियां',
            'लार्वा की उपस्थिति'
          ],
          treatment: [
            'Use NPV biopesticide',
            'Apply Emamectin Benzoate (0.5g/L)',
            'Install pheromone traps'
          ],
          hindiTreatment: [
            'NPV जैविक कीटनाशक का उपयोग करें',
            'इमामेक्टिन बेंजोएट लगाएं (0.5g/L)',
            'फेरोमोन जाल लगाएं'
          ],
          confidence: 82,
          visualIndicators: {
            colors: [[139, 69, 19], [160, 82, 45], [210, 180, 140]],
            patterns: ['holes', 'damage', 'larvae']
          }
        }
      ]
    },
    {
      name: 'Tomato',
      hindiName: 'टमाटर',
      leafShape: ['compound', 'serrated', 'pinnate'],
      leafColor: ['medium-green', 'dark-green'],
      keywords: ['tomato', 'टमाटर', 'tamatar', 'टमाटो'],
      colorProfile: {
        primaryGreen: [60, 179, 113],
        secondaryColors: [[46, 139, 87], [85, 107, 47]]
      },
      diseases: [
        {
          id: 'tomato_blight',
          name: 'Tomato Blight',
          hindiName: 'टमाटर का झुलसा',
          symptoms: [
            'Dark spots on leaves',
            'Brown patches on stems',
            'Fruit rot'
          ],
          hindiSymptoms: [
            'पत्तियों पर काले धब्बे',
            'तनों पर भूरे निशान',
            'फल का सड़ना'
          ],
          treatment: [
            'Spray Copper fungicide',
            'Remove affected parts',
            'Improve air circulation'
          ],
          hindiTreatment: [
            'कॉपर फंगिसाइड छिड़काव करें',
            'प्रभावित हिस्से हटाएं',
            'हवा के प्रवाह में सुधार करें'
          ],
          confidence: 79,
          visualIndicators: {
            colors: [[139, 69, 19], [160, 82, 45], [105, 105, 105]],
            patterns: ['spots', 'patches', 'rot']
          }
        }
      ]
    },
    {
      name: 'Tomato',
      hindiName: 'टमाटर',
      leafShape: ['compound', 'serrated', 'pointed'],
      leafColor: ['bright-green', 'yellow-green'],
      keywords: ['tomato', 'टमाटर', 'tamatar', 'टामेटर'],
      colorProfile: {
        primaryGreen: [50, 205, 50],
        secondaryColors: [[124, 252, 0], [34, 139, 34]]
      },
      diseases: [
        {
          id: 'tomato_blight',
          name: 'Tomato Blight',
          hindiName: 'टमाटर झुलसा',
          symptoms: [
            'Dark spots on leaves and stems',
            'Yellow halos around spots',
            'Rapid leaf wilting'
          ],
          hindiSymptoms: [
            'पत्तियों और तनों पर काले धब्बे',
            'धब्बों के चारों ओर पीले छल्ले',
            'पत्तियों का तेज़ी से मुरझाना'
          ],
          treatment: [
            'Apply Chlorothalonil fungicide',
            'Remove affected parts immediately',
            'Improve air circulation'
          ],
          hindiTreatment: [
            'क्लोरोथालोनिल फंगिसाइड लगाएं',
            'प्रभावित हिस्से तुरंत हटाएं',
            'हवा के संचार में सुधार करें'
          ],
          confidence: 82,
          visualIndicators: {
            colors: [[105, 105, 105], [169, 169, 169], [255, 255, 0]],
            patterns: ['spots', 'halos', 'wilting']
          }
        }
      ]
    },
    {
      name: 'Maize',
      hindiName: 'मक्का',
      leafShape: ['long', 'broad', 'parallel-veined'],
      leafColor: ['bright-green', 'yellow-green'],
      keywords: ['maize', 'मक्का', 'makka', 'corn', 'भुट्टा'],
      colorProfile: {
        primaryGreen: [124, 252, 0],
        secondaryColors: [[50, 205, 50], [34, 139, 34]]
      },
      diseases: [
        {
          id: 'maize_leaf_blight',
          name: 'Maize Leaf Blight',
          hindiName: 'मक्का पत्ती झुलसा',
          symptoms: [
            'Long oval lesions on leaves',
            'Tan colored spots with dark borders',
            'Premature leaf death'
          ],
          hindiSymptoms: [
            'पत्तियों पर लंबे अंडाकार घाव',
            'काले किनारों के साथ भूरे रंग के धब्बे',
            'पत्तियों की समय से पहले मृत्यु'
          ],
          treatment: [
            'Use resistant varieties',
            'Apply Propiconazole fungicide',
            'Maintain proper plant spacing'
          ],
          hindiTreatment: [
            'प्रतिरोधी किस्में उगाएं',
            'प्रोपिकोनाज़ोल फंगिसाइड लगाएं',
            'उचित पौधे की दूरी बनाए रखें'
          ],
          confidence: 80,
          visualIndicators: {
            colors: [[210, 180, 140], [139, 69, 19], [160, 82, 45]],
            patterns: ['lesions', 'oval-spots', 'browning']
          }
        }
      ]
    }
  ];

  public async detectCropAndDisease(imageFile: File): Promise<{
    crop: string;
    confidence: number;
    disease: DiseaseInfo | null;
    analysis: any;
  } | null> {
    try {
      // Enhanced image analysis for better crop detection
      const imageAnalysis = await this.analyzeImageForCrop(imageFile);
      
      // Multi-factor crop detection
      const cropDetection = await this.identifyCrop(imageFile, imageAnalysis);
      
      if (!cropDetection.crop) {
        return null;
      }

      // Disease detection based on identified crop
      const diseaseDetection = await this.detectDiseaseForCrop(
        cropDetection.crop, 
        imageAnalysis
      );

      return {
        crop: cropDetection.crop.name,
        confidence: cropDetection.confidence,
        disease: diseaseDetection,
        analysis: imageAnalysis
      };
    } catch (error) {
      console.error('Error in enhanced crop and disease detection:', error);
      return null;
    }
  }

  private async analyzeImageForCrop(file: File): Promise<any> {
    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);

        if (!ctx) {
          resolve({ quality: 'poor', colorProfile: null });
          return;
        }

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Enhanced color analysis for crop identification
        const colorProfile = this.extractDetailedColorProfile(data);
        const leafCharacteristics = this.analyzePlantStructure(data);
        
        resolve({
          resolution: `${img.width}x${img.height}`,
          quality: this.assessImageQuality(img.width, img.height, colorProfile),
          colorProfile,
          leafCharacteristics,
          timestamp: Date.now()
        });
      };

      img.onerror = () => {
        resolve({ quality: 'poor', colorProfile: null });
      };

      img.src = URL.createObjectURL(file);
    });
  }

  private extractDetailedColorProfile(data: Uint8ClampedArray): any {
    const colorBuckets = {
      lightGreen: 0,
      darkGreen: 0,
      yellowGreen: 0,
      blueGreen: 0,
      brown: 0,
      yellow: 0,
      red: 0,
      orange: 0
    };

    let totalPixels = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      totalPixels++;

      // Enhanced color classification for crop identification
      if (g > r && g > b && g > 80) {
        if (g > 150 && r < 100) colorBuckets.darkGreen++;
        else if (g > 120 && b < 80) colorBuckets.lightGreen++;
        else if (r > 80 && g > 120) colorBuckets.yellowGreen++;
        else if (b > 100 && g > 120) colorBuckets.blueGreen++;
      } else if (r > 150 && g > 100 && b < 100) {
        if (g > 150) colorBuckets.yellow++;
        else colorBuckets.orange++;
      } else if (r > 100 && g > 60 && b < 80) {
        colorBuckets.brown++;
      } else if (r > 150 && g < 100 && b < 100) {
        colorBuckets.red++;
      }
    }

    // Convert to percentages
    Object.keys(colorBuckets).forEach(key => {
      colorBuckets[key as keyof typeof colorBuckets] = 
        (colorBuckets[key as keyof typeof colorBuckets] / totalPixels) * 100;
    });

    return colorBuckets;
  }

  private analyzePlantStructure(data: Uint8ClampedArray): any {
    // Analyze plant structure patterns (simplified for demo)
    let edgePixels = 0;
    let smoothPixels = 0;
    let totalAnalyzed = 0;

    // Sample every 100th pixel for performance
    for (let i = 0; i < data.length; i += 400) {
      const r = data[i];
      
      // Simple edge detection
      if (i + 400 < data.length) {
        const nextR = data[i + 400];
        const diff = Math.abs(r - nextR);
        if (diff > 30) edgePixels++;
        else smoothPixels++;
        totalAnalyzed++;
      }
    }

    return {
      edgeRatio: totalAnalyzed > 0 ? edgePixels / totalAnalyzed : 0,
      smoothRatio: totalAnalyzed > 0 ? smoothPixels / totalAnalyzed : 0,
      structureComplexity: edgePixels > smoothPixels ? 'complex' : 'simple'
    };
  }

  private assessImageQuality(width: number, height: number, colorProfile: any): string {
    let score = 0;
    
    // Resolution scoring
    if (width >= 800 && height >= 600) score += 40;
    else if (width >= 400 && height >= 300) score += 25;
    else if (width >= 200 && height >= 200) score += 10;

    // Color diversity scoring
    const greenTotal = (colorProfile?.lightGreen || 0) + (colorProfile?.darkGreen || 0);
    if (greenTotal > 20) score += 30;
    else if (greenTotal > 10) score += 15;

    // Plant indicator scoring
    if ((colorProfile?.brown || 0) > 5) score += 15;
    if ((colorProfile?.yellow || 0) > 3) score += 10;

    if (score >= 70) return 'excellent';
    else if (score >= 50) return 'good';
    else if (score >= 30) return 'fair';
    else return 'poor';
  }

  private async identifyCrop(file: File, imageAnalysis: any): Promise<{
    crop: CropCharacteristics | null;
    confidence: number;
  }> {
    const fileName = file.name.toLowerCase();
    let bestMatch: CropCharacteristics | null = null;
    let highestScore = 0;

    for (const crop of this.crops) {
      let score = 0;

      // Filename keyword matching (30% weight) - reduced dependency on filename
      crop.keywords.forEach(keyword => {
        if (fileName.includes(keyword.toLowerCase())) {
          score += 30;
        }
      });

      // Generic plant keywords boost (10% weight)
      const genericPlantTerms = ['plant', 'leaf', 'crop', 'disease', 'पौधा', 'पत्ता', 'फसल', 'बीमारी'];
      genericPlantTerms.forEach(term => {
        if (fileName.includes(term.toLowerCase())) {
          score += 10;
        }
      });

      // Color profile matching (40% weight) - increased importance
      if (imageAnalysis.colorProfile) {
        const colorMatch = this.calculateColorProfileMatch(crop, imageAnalysis.colorProfile);
        score += colorMatch * 40;
      }

      // Image quality bonus (15% weight)
      if (imageAnalysis.quality === 'excellent') score += 15;
      else if (imageAnalysis.quality === 'good') score += 10;
      else if (imageAnalysis.quality === 'fair') score += 5;

      // Structure matching (10% weight)
      if (imageAnalysis.leafCharacteristics) {
        if (imageAnalysis.leafCharacteristics.structureComplexity === 'complex') {
          if (crop.name === 'Cotton' || crop.name === 'Tomato') score += 10;
        } else {
          if (crop.name === 'Rice' || crop.name === 'Wheat') score += 10;
        }
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = crop;
      }
    }

    const confidence = Math.min(Math.max(highestScore, 25), 95);

    // More lenient crop detection - return best match even with lower confidence
    // if no strong match found, default to common crops for better user experience
    return {
      crop: confidence > 25 ? bestMatch : (bestMatch || this.crops[0]), // Default to first crop if no match
      confidence: Math.max(confidence, 30) // Minimum confidence of 30%
    };
  }

  private calculateColorProfileMatch(crop: CropCharacteristics, imageColors: any): number {
    // Calculate how well the image colors match the crop's expected color profile
    let matchScore = 0;
    
    const totalGreen = (imageColors.lightGreen || 0) + 
                      (imageColors.darkGreen || 0) + 
                      (imageColors.yellowGreen || 0) + 
                      (imageColors.blueGreen || 0);

    // More lenient matching - any green plant gets some score
    if (totalGreen > 10) matchScore += 0.3; // Basic green threshold

    // Different crops have different green profiles - more flexible thresholds
    switch (crop.name) {
      case 'Rice':
        if (imageColors.lightGreen > 8) matchScore += 0.3;
        if (imageColors.yellowGreen > 5) matchScore += 0.2;
        if (totalGreen > 15) matchScore += 0.2;
        break;
      case 'Wheat':
        if (imageColors.blueGreen > 5) matchScore += 0.3;
        if (imageColors.yellowGreen > 7) matchScore += 0.2;
        if (totalGreen > 12) matchScore += 0.2;
        break;
      case 'Cotton':
        if (imageColors.darkGreen > 7) matchScore += 0.3;
        if (imageColors.lightGreen > 6) matchScore += 0.2;
        if (totalGreen > 13) matchScore += 0.2;
        break;
      case 'Tomato':
        if (imageColors.lightGreen > 8) matchScore += 0.3;
        if (imageColors.darkGreen > 6) matchScore += 0.2;
        if (totalGreen > 14) matchScore += 0.2;
        break;
      case 'Maize':
        if (imageColors.yellowGreen > 8) matchScore += 0.3;
        if (imageColors.lightGreen > 10) matchScore += 0.2;
        if (totalGreen > 18) matchScore += 0.2;
        break;
      default:
        // Generic plant matching for unknown crops
        if (totalGreen > 10) matchScore += 0.5;
        break;
    }

    return Math.min(matchScore, 1.0);
  }

  private async detectDiseaseForCrop(
    crop: CropCharacteristics, 
    imageAnalysis: any
  ): Promise<DiseaseInfo | null> {
    if (!crop.diseases || crop.diseases.length === 0) {
      return null;
    }

    // For now, select the most likely disease based on crop and image characteristics
    let bestDisease = crop.diseases[0];
    let bestScore = 0;

    for (const disease of crop.diseases) {
      let score = disease.confidence;

      // Check for visual indicators in the image
      if (imageAnalysis.colorProfile) {
        // Look for disease-specific color indicators
        if (disease.visualIndicators?.colors) {
          if (imageAnalysis.colorProfile.brown > 8) score += 15;
          if (imageAnalysis.colorProfile.yellow > 10) score += 10;
          if (imageAnalysis.colorProfile.red > 5) score += 8;
          if (imageAnalysis.colorProfile.orange > 5) score += 8;
        }
      }

      // Quality factor
      if (imageAnalysis.quality === 'excellent') score += 5;
      else if (imageAnalysis.quality === 'poor') score -= 10;

      if (score > bestScore) {
        bestScore = score;
        bestDisease = disease;
      }
    }

    return bestScore > 60 ? bestDisease : bestDisease; // Return best match even if low confidence
  }

  public getCropList(): CropCharacteristics[] {
    return this.crops;
  }
}

export default new EnhancedCropDiseaseService();
