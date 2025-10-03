// Farmer Community Service - Real-time farmer to farmer communication
// import { locationService } from './locationService'; // Commented out for now

export interface FarmerProfile {
  id: string;
  name: string;
  hindiName: string;
  location: {
    latitude: number;
    longitude: number;
    village: string;
    district: string;
    state: string;
    pincode: string;
  };
  crops: string[];
  farmSize: number;
  experience: number;
  phone: string;
  verified: boolean;
  joinedDate: Date;
  lastActive: Date;
  reputation: number;
  helpfulAnswers: number;
}

export interface CommunityPost {
  id: string;
  farmerId: string;
  farmerName: string;
  title: string;
  hindiTitle: string;
  description: string;
  hindiDescription: string;
  category: 'pest-alert' | 'disease' | 'weather' | 'advice' | 'success-story' | 'market-price' | 'question';
  images: string[];
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  tags: string[];
  urgency: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  likes: number;
  comments: CommunityComment[];
  views: number;
  solved: boolean;
  aiSuggestion?: string;
  hindiAiSuggestion?: string;
}

export interface CommunityComment {
  id: string;
  postId: string;
  farmerId: string;
  farmerName: string;
  comment: string;
  hindiComment: string;
  timestamp: Date;
  likes: number;
  helpful: boolean;
  images?: string[];
  aiGenerated: boolean;
}

export interface PestAlert {
  id: string;
  farmerId: string;
  pestName: string;
  hindiPestName: string;
  cropAffected: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: {
    latitude: number;
    longitude: number;
    radius: number; // in kilometers
  };
  description: string;
  hindiDescription: string;
  images: string[];
  treatment: string[];
  hindiTreatment: string[];
  alertTime: Date;
  expiryTime: Date;
  affectedFarmers: string[];
  verified: boolean;
  aiConfidence: number;
}

export interface DailyLog {
  id: string;
  farmerId: string;
  date: Date;
  cropType: string;
  activities: {
    watering: boolean;
    fertilizer: string;
    pesticide: string;
    harvesting: boolean;
    planting: boolean;
    weeding: boolean;
    other: string;
  };
  weather: {
    temperature: number;
    humidity: number;
    rainfall: number;
    condition: string;
  };
  cropHealth: {
    overall: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    leafColor: string;
    growth: string;
    diseases: string[];
    pests: string[];
  };
  images: string[];
  notes: string;
  hindiNotes: string;
  aiInsights: string[];
  hindiAiInsights: string[];
  nextActions: string[];
  hindiNextActions: string[];
}

class CommunityService {
  private posts: CommunityPost[] = [];
  private farmers: FarmerProfile[] = [];
  private pestAlerts: PestAlert[] = [];
  private dailyLogs: DailyLog[] = [];

  // Initialize with sample data
  constructor() {
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample farmers
    this.farmers = [
      {
        id: '1',
        name: 'Ramesh Kumar',
        hindiName: 'रमेश कुमार',
        location: {
          latitude: 28.6139,
          longitude: 77.2090,
          village: 'Khera Kalan',
          district: 'Delhi',
          state: 'Delhi',
          pincode: '110001'
        },
        crops: ['rice', 'wheat'],
        farmSize: 5.5,
        experience: 15,
        phone: '+91-9876543210',
        verified: true,
        joinedDate: new Date('2024-01-15'),
        lastActive: new Date(),
        reputation: 85,
        helpfulAnswers: 23
      },
      {
        id: '2',
        name: 'Sunita Devi',
        hindiName: 'सुनीता देवी',
        location: {
          latitude: 28.7041,
          longitude: 77.1025,
          village: 'Mundka',
          district: 'Delhi',
          state: 'Delhi',
          pincode: '110041'
        },
        crops: ['tomato', 'potato', 'onion'],
        farmSize: 3.2,
        experience: 12,
        phone: '+91-9876543211',
        verified: true,
        joinedDate: new Date('2024-02-10'),
        lastActive: new Date(),
        reputation: 92,
        helpfulAnswers: 31
      }
    ];

    // Sample posts
    this.posts = [
      {
        id: '1',
        farmerId: '1',
        farmerName: 'Ramesh Kumar',
        title: 'Yellowing in Rice Leaves - Need Urgent Help',
        hindiTitle: 'धान की पत्तियों में पीलापन - तुरंत मदद चाहिए',
        description: 'My rice crop is showing yellow leaves in patches. The plants are 45 days old. What could be the reason?',
        hindiDescription: 'मेरी धान की फसल में धब्बों में पीली पत्तियां दिख रही हैं। पौधे 45 दिन पुराने हैं। क्या कारण हो सकता है?',
        category: 'disease',
        images: ['/images/rice-yellowing.jpg'],
        location: {
          latitude: 28.6139,
          longitude: 77.2090,
          address: 'Khera Kalan, Delhi'
        },
        tags: ['rice', 'yellowing', 'disease', 'urgent'],
        urgency: 'high',
        timestamp: new Date('2024-12-15T08:30:00'),
        likes: 5,
        comments: [
          {
            id: '1',
            postId: '1',
            farmerId: '2',
            farmerName: 'Sunita Devi',
            comment: 'This looks like nitrogen deficiency. Apply urea fertilizer immediately.',
            hindiComment: 'यह नाइट्रोजन की कमी लगती है। तुरंत यूरिया खाद डालें।',
            timestamp: new Date('2024-12-15T09:15:00'),
            likes: 3,
            helpful: true,
            aiGenerated: false
          }
        ],
        views: 45,
        solved: false,
        aiSuggestion: 'Based on the image and description, this appears to be nitrogen deficiency. Recommend applying 25kg urea per acre and monitoring for 7 days.',
        hindiAiSuggestion: 'तस्वीर और विवरण के आधार पर, यह नाइट्रोजन की कमी लगती है। प्रति एकड़ 25 किलो यूरिया डालने और 7 दिनों तक निगरानी करने की सिफारिश।'
      }
    ];

    // Sample pest alerts
    this.pestAlerts = [
      {
        id: '1',
        farmerId: '1',
        pestName: 'Brown Plant Hopper',
        hindiPestName: 'भूरा प्लांट हॉपर',
        cropAffected: 'Rice',
        severity: 'high',
        location: {
          latitude: 28.6139,
          longitude: 77.2090,
          radius: 5
        },
        description: 'Heavy infestation of brown plant hopper observed in rice fields. Immediate action required.',
        hindiDescription: 'धान के खेतों में भूरे प्लांट हॉपर का भारी संक्रमण देखा गया। तत्काल कार्रवाई आवश्यक।',
        images: ['/images/brown-plant-hopper.jpg'],
        treatment: [
          'Spray Imidacloprid 17.8% SL @ 0.3ml/L',
          'Drain water from fields for 2-3 days',
          'Apply yellow sticky traps'
        ],
        hindiTreatment: [
          'इमिडाक्लोप्रिड 17.8% SL @ 0.3ml/L का छिड़काव करें',
          'खेतों से 2-3 दिन पानी निकालें',
          'पीले चिपचिपे जाल लगाएं'
        ],
        alertTime: new Date('2024-12-15T06:00:00'),
        expiryTime: new Date('2024-12-22T06:00:00'),
        affectedFarmers: ['1', '2'],
        verified: true,
        aiConfidence: 88
      }
    ];
  }

  // Get nearby farmers within radius
  async getNearbyFarmers(latitude: number, longitude: number, radiusKm: number = 5): Promise<FarmerProfile[]> {
    return this.farmers.filter(farmer => {
      const distance = this.calculateDistance(
        latitude, longitude,
        farmer.location.latitude, farmer.location.longitude
      );
      return distance <= radiusKm;
    });
  }

  // Calculate distance between two coordinates
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  // Create new community post
  async createPost(post: Omit<CommunityPost, 'id' | 'timestamp' | 'likes' | 'comments' | 'views' | 'solved'>): Promise<string> {
    const newPost: CommunityPost = {
      ...post,
      id: Date.now().toString(),
      timestamp: new Date(),
      likes: 0,
      comments: [],
      views: 0,
      solved: false
    };

    // Generate AI suggestion for the post
    const aiSuggestion = await this.generateAISuggestion(post.description, post.category);
    newPost.aiSuggestion = aiSuggestion.english;
    newPost.hindiAiSuggestion = aiSuggestion.hindi;

    this.posts.unshift(newPost);

    // If it's a pest alert, create alert notification
    if (post.category === 'pest-alert') {
      await this.createPestAlert(newPost);
    }

    return newPost.id;
  }

  // Generate AI suggestions for posts
  private async generateAISuggestion(_description: string, category: string): Promise<{english: string, hindi: string}> {
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    const suggestions = {
      'pest-alert': {
        english: 'Based on your description, immediate pest control measures are recommended. Apply organic neem oil spray and monitor closely for 3-5 days.',
        hindi: 'आपके विवरण के आधार पर, तत्काल कीट नियंत्रण उपाय की सिफारिश की जाती है। जैविक नीम तेल का छिड़काव करें और 3-5 दिनों तक बारीकी से निगरानी करें।'
      },
      'disease': {
        english: 'This appears to be a fungal disease. Remove affected parts, improve ventilation, and apply appropriate fungicide. Monitor weather conditions.',
        hindi: 'यह एक फंगल रोग लगता है। प्रभावित भागों को हटाएं, वेंटिलेशन में सुधार करें, और उपयुक्त फंगिसाइड लगाएं। मौसम की स्थिति पर नजर रखें।'
      },
      'weather': {
        english: 'Weather patterns suggest adjusting irrigation schedule. Consider protective measures for upcoming weather changes.',
        hindi: 'मौसम के पैटर्न से सिंचाई कार्यक्रम में समायोजन का सुझाव है। आने वाले मौसम परिवर्तन के लिए सुरक्षात्मक उपाय पर विचार करें।'
      },
      'default': {
        english: 'Thank you for sharing. Based on agricultural best practices, consider consulting with local agricultural extension officer for detailed guidance.',
        hindi: 'साझा करने के लिए धन्यवाद। कृषि सर्वोत्तम प्रथाओं के आधार पर, विस्तृत मार्गदर्शन के लिए स्थानीय कृषि विस्तार अधिकारी से सलाह लेने पर विचार करें।'
      }
    };

    return suggestions[category as keyof typeof suggestions] || suggestions.default;
  }

  // Create pest alert from community post
  private async createPestAlert(post: CommunityPost): Promise<void> {
    if (post.urgency === 'high' || post.urgency === 'critical') {
      const pestAlert: PestAlert = {
        id: Date.now().toString(),
        farmerId: post.farmerId,
        pestName: post.title.split('-')[0].trim(),
        hindiPestName: post.hindiTitle.split('-')[0].trim(),
        cropAffected: post.tags.find(tag => ['rice', 'wheat', 'cotton', 'tomato'].includes(tag)) || 'Unknown',
        severity: post.urgency as 'high' | 'critical',
        location: {
          latitude: post.location.latitude,
          longitude: post.location.longitude,
          radius: 5
        },
        description: post.description,
        hindiDescription: post.hindiDescription,
        images: post.images,
        treatment: [post.aiSuggestion || 'Consult agricultural expert'],
        hindiTreatment: [post.hindiAiSuggestion || 'कृषि विशेषज्ञ से सलाह लें'],
        alertTime: new Date(),
        expiryTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        affectedFarmers: [],
        verified: false,
        aiConfidence: 75
      };

      this.pestAlerts.unshift(pestAlert);

      // Notify nearby farmers
      await this.notifyNearbyFarmers(pestAlert);
    }
  }

  // Notify nearby farmers about pest alerts
  private async notifyNearbyFarmers(alert: PestAlert): Promise<void> {
    const nearbyFarmers = await this.getNearbyFarmers(
      alert.location.latitude,
      alert.location.longitude,
      alert.location.radius
    );

    alert.affectedFarmers = nearbyFarmers.map(farmer => farmer.id);

    // In a real app, this would send push notifications, SMS, etc.
    console.log(`Alert sent to ${nearbyFarmers.length} farmers within ${alert.location.radius}km radius`);
  }

  // Get community posts with filters
  async getPosts(filters?: {
    category?: string;
    urgency?: string;
    location?: {latitude: number, longitude: number, radius: number};
    farmerId?: string;
  }): Promise<CommunityPost[]> {
    let filteredPosts = [...this.posts];

    if (filters) {
      if (filters.category) {
        filteredPosts = filteredPosts.filter(post => post.category === filters.category);
      }

      if (filters.urgency) {
        filteredPosts = filteredPosts.filter(post => post.urgency === filters.urgency);
      }

      if (filters.location) {
        filteredPosts = filteredPosts.filter(post => {
          const distance = this.calculateDistance(
            filters.location!.latitude, filters.location!.longitude,
            post.location.latitude, post.location.longitude
          );
          return distance <= filters.location!.radius;
        });
      }

      if (filters.farmerId) {
        filteredPosts = filteredPosts.filter(post => post.farmerId === filters.farmerId);
      }
    }

    return filteredPosts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Get pest alerts for location
  async getPestAlerts(latitude: number, longitude: number, radiusKm: number = 10): Promise<PestAlert[]> {
    return this.pestAlerts.filter(alert => {
      const distance = this.calculateDistance(
        latitude, longitude,
        alert.location.latitude, alert.location.longitude
      );
      return distance <= radiusKm && alert.expiryTime > new Date();
    }).sort((a, b) => b.alertTime.getTime() - a.alertTime.getTime());
  }

  // Add comment to post
  async addComment(postId: string, comment: Omit<CommunityComment, 'id' | 'timestamp' | 'likes' | 'helpful'>): Promise<string> {
    const post = this.posts.find(p => p.id === postId);
    if (!post) throw new Error('Post not found');

    const newComment: CommunityComment = {
      ...comment,
      id: Date.now().toString(),
      timestamp: new Date(),
      likes: 0,
      helpful: false
    };

    post.comments.push(newComment);
    return newComment.id;
  }

  // Like post
  async likePost(postId: string): Promise<void> {
    const post = this.posts.find(p => p.id === postId);
    if (post) {
      post.likes++;
    }
  }

  // Mark comment as helpful
  async markCommentHelpful(postId: string, commentId: string): Promise<void> {
    const post = this.posts.find(p => p.id === postId);
    if (post) {
      const comment = post.comments.find(c => c.id === commentId);
      if (comment) {
        comment.helpful = true;
        comment.likes++;
      }
    }
  }

  // Daily logging functionality
  async addDailyLog(log: Omit<DailyLog, 'id' | 'aiInsights' | 'hindiAiInsights' | 'nextActions' | 'hindiNextActions'>): Promise<string> {
    const aiInsights = await this.generateDailyLogInsights(log);
    
    const newLog: DailyLog = {
      ...log,
      id: Date.now().toString(),
      aiInsights: aiInsights.insights,
      hindiAiInsights: aiInsights.hindiInsights,
      nextActions: aiInsights.nextActions,
      hindiNextActions: aiInsights.hindiNextActions
    };

    this.dailyLogs.unshift(newLog);
    return newLog.id;
  }

  // Generate AI insights for daily logs
  private async generateDailyLogInsights(log: Omit<DailyLog, 'id' | 'aiInsights' | 'hindiAiInsights' | 'nextActions' | 'hindiNextActions'>): Promise<{
    insights: string[];
    hindiInsights: string[];
    nextActions: string[];
    hindiNextActions: string[];
  }> {
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 800));

    const insights = [];
    const hindiInsights = [];
    const nextActions = [];
    const hindiNextActions = [];

    // Weather-based insights
    if (log.weather.rainfall > 50) {
      insights.push('Heavy rainfall detected. Monitor for waterlogging and fungal diseases.');
      hindiInsights.push('भारी बारिश का पता चला। जलभराव और फंगल रोगों की निगरानी करें।');
      nextActions.push('Check drainage systems and apply preventive fungicide if needed.');
      hindiNextActions.push('जल निकासी प्रणाली की जांच करें और आवश्यकता पड़ने पर निवारक फंगिसाइड लगाएं।');
    }

    if (log.weather.temperature > 35) {
      insights.push('High temperature stress observed. Increase irrigation frequency.');
      hindiInsights.push('उच्च तापमान तनाव देखा गया। सिंचाई की आवृत्ति बढ़ाएं।');
      nextActions.push('Provide shade during peak hours and ensure adequate water supply.');
      hindiNextActions.push('चरम घंटों के दौरान छाया प्रदान करें और पर्याप्त पानी की आपूर्ति सुनिश्चित करें।');
    }

    // Crop health-based insights
    if (log.cropHealth.overall === 'poor' || log.cropHealth.overall === 'critical') {
      insights.push('Crop health is concerning. Immediate intervention required.');
      hindiInsights.push('फसल का स्वास्थ्य चिंताजनक है। तत्काल हस्तक्षेप आवश्यक।');
      nextActions.push('Consult agricultural expert and take soil samples for testing.');
      hindiNextActions.push('कृषि विशेषज्ञ से सलाह लें और परीक्षण के लिए मिट्टी के नमूने लें।');
    }

    if (log.cropHealth.diseases.length > 0) {
      insights.push(`Disease symptoms detected: ${log.cropHealth.diseases.join(', ')}`);
      hindiInsights.push(`रोग के लक्षण पाए गए: ${log.cropHealth.diseases.join(', ')}`);
      nextActions.push('Apply targeted treatment based on disease identification.');
      hindiNextActions.push('रोग की पहचान के आधार पर लक्षित उपचार लागू करें।');
    }

    // Activity-based insights
    if (log.activities.fertilizer) {
      insights.push(`Fertilizer applied: ${log.activities.fertilizer}. Monitor plant response over next 7 days.`);
      hindiInsights.push(`खाद डाली गई: ${log.activities.fertilizer}। अगले 7 दिनों में पौधे की प्रतिक्रिया की निगरानी करें।`);
    }

    // Default insights if none generated
    if (insights.length === 0) {
      insights.push('Crop monitoring is consistent. Continue current practices.');
      hindiInsights.push('फसल की निगरानी निरंतर है। वर्तमान प्रथाओं को जारी रखें।');
      nextActions.push('Maintain regular monitoring schedule and record observations.');
      hindiNextActions.push('नियमित निगरानी कार्यक्रम बनाए रखें और अवलोकन रिकॉर्ड करें।');
    }

    return { insights, hindiInsights, nextActions, hindiNextActions };
  }

  // Get daily logs for farmer
  async getDailyLogs(farmerId: string, limit: number = 30): Promise<DailyLog[]> {
    return this.dailyLogs
      .filter(log => log.farmerId === farmerId)
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);
  }

  // Get crop analytics from daily logs
  async getCropAnalytics(farmerId: string, cropType: string, days: number = 30): Promise<{
    healthTrend: string[];
    weatherImpact: any;
    recommendations: string[];
    hindiRecommendations: string[];
  }> {
    const logs = this.dailyLogs
      .filter(log => log.farmerId === farmerId && log.cropType === cropType)
      .filter(log => log.date > new Date(Date.now() - days * 24 * 60 * 60 * 1000))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    const healthTrend = logs.map(log => log.cropHealth.overall);
    
    const weatherImpact = {
      avgTemperature: logs.reduce((sum, log) => sum + log.weather.temperature, 0) / logs.length,
      totalRainfall: logs.reduce((sum, log) => sum + log.weather.rainfall, 0),
      avgHumidity: logs.reduce((sum, log) => sum + log.weather.humidity, 0) / logs.length
    };

    // Generate recommendations based on trends
    const recommendations = [];
    const hindiRecommendations = [];

    const recentHealth = healthTrend.slice(-7); // Last 7 days
    const poorHealthDays = recentHealth.filter(h => h === 'poor' || h === 'critical').length;

    if (poorHealthDays > 3) {
      recommendations.push('Crop health declining. Consider soil testing and expert consultation.');
      hindiRecommendations.push('फसल का स्वास्थ्य गिर रहा है। मिट्टी परीक्षण और विशेषज्ञ सलाह पर विचार करें।');
    }

    if (weatherImpact.totalRainfall > 200) {
      recommendations.push('High rainfall period. Focus on drainage and disease prevention.');
      hindiRecommendations.push('भारी बारिश की अवधि। जल निकासी और रोग रोकथाम पर ध्यान दें।');
    }

    if (weatherImpact.avgTemperature > 32) {
      recommendations.push('High temperature stress. Increase irrigation and provide shade if possible.');
      hindiRecommendations.push('उच्च तापमान तनाव। सिंचाई बढ़ाएं और संभव हो तो छाया प्रदान करें।');
    }

    return { healthTrend, weatherImpact, recommendations, hindiRecommendations };
  }
}

export default new CommunityService();