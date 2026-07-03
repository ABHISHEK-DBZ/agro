// ===== User & Auth Types =====
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  role: 'farmer' | 'expert' | 'admin';
  location?: UserLocation;
  farmInfo?: FarmInfo;
  preferences: UserPreferences;
  stats: UserStats;
  verified: boolean;
  createdAt: Date;
}

export interface UserLocation {
  state: string;
  district: string;
  village?: string;
  latitude?: number;
  longitude?: number;
}

export interface FarmInfo {
  farmSize: number; // acres
  experience: number; // years
  primaryCrops: string[];
  farmingType: 'organic' | 'conventional' | 'mixed';
  irrigationType: 'drip' | 'sprinkler' | 'flood' | 'rainfed';
  soilType?: 'clay' | 'loamy' | 'sandy' | 'black' | 'red' | 'laterite';
}

export interface UserPreferences {
  language: 'en' | 'hi' | 'mr' | 'gu' | 'ta' | 'te' | 'kn' | 'ml' | 'or' | 'pa' | 'bn' | 'ur';
  theme: 'light' | 'dark' | 'auto';
  notifications: NotificationPreferences;
}

export interface NotificationPreferences {
  weather: boolean;
  prices: boolean;
  schemes: boolean;
  community: boolean;
  disease: boolean;
}

export interface UserStats {
  postsCount: number;
  questionsCount: number;
  answersCount: number;
  helpfulVotes: number;
  joinDate: Date;
  lastActive: Date;
}

// ===== Weather Types =====
export interface WeatherData {
  location: LocationInfo;
  current: CurrentWeather;
  hourly: HourlyWeather[];
  daily: DailyWeather[];
  alerts: WeatherAlert[];
  agricultural: AgriculturalData;
}

export interface LocationInfo {
  name: string;
  country: string;
  region: string;
  lat: number;
  lon: number;
  timezone: string;
}

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  cloudCover: number;
  condition: WeatherCondition;
  icon: string;
  rainfall: number;
  heatIndex: number;
  dewPoint: number;
}

export interface WeatherCondition {
  code: number;
  description: string;
  main: string;
}

export interface HourlyWeather {
  time: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  chanceOfRain: number;
  condition: WeatherCondition;
  icon: string;
  windSpeed: number;
}

export interface DailyWeather {
  date: string;
  tempMax: number;
  tempMin: number;
  humidity: number;
  rainfall: number;
  chanceOfRain: number;
  condition: WeatherCondition;
  icon: string;
  sunrise: string;
  sunset: string;
}

export interface WeatherAlert {
  event: string;
  description: string;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  start: number;
  end: number;
}

export interface AgriculturalData {
  soilMoisture: number;
  soilTemperature: number;
  evapotranspiration: number;
  growingDegreeDay: number;
  frostRisk: boolean;
  heatStress: boolean;
  irrigationAdvice: string;
  sprayingConditions: 'excellent' | 'good' | 'fair' | 'poor' | 'not_recommended';
}

// ===== Market Types =====
export interface MarketPrice {
  id: string;
  commodity: string;
  variety: string;
  market: string;
  state: string;
  district: string;
  price: PriceBreakdown;
  unit: 'Quintal' | 'Kg' | 'Ton';
  arrivalDate: string;
  trend: PriceTrend;
  volume: MarketVolume;
  quality: 'Premium' | 'Good' | 'Average' | 'Below Average';
  marketStatus: 'Open' | 'Closed' | 'Holiday';
}

export interface PriceBreakdown {
  min: number;
  max: number;
  modal: number;
  average: number;
}

export interface PriceTrend {
  change: number;
  percentage: number;
  direction: 'up' | 'down' | 'stable';
}

export interface MarketVolume {
  arrival: number;
  sold: number;
  unsold: number;
}

// ===== Crop Types =====
export interface Crop {
  id: string;
  name: CropName;
  season: CropSeason;
  duration: string;
  soilType: string;
  climate: string;
  temperature: string;
  rainfall: string;
  majorStates: string[];
  bestPractices: BilingualContent;
  diseases: string[];
  avgYield: string;
  varieties: CropVariety[];
  irrigation: string;
  fertilizer: string;
}

export interface CropName {
  en: string;
  hi: string;
}

export interface BilingualContent {
  en: string[];
  hi: string[];
}

export type CropSeason = 'Kharif' | 'Rabi' | 'Zaid';

export interface CropVariety {
  name: string;
  duration: string;
  yield: string;
  features: string[];
}

// ===== Disease Types =====
export interface DiseaseDetectionResult {
  diseaseName: string;
  confidence: number;
  severity: DiseaseSeverity;
  cropName: string;
  description: string;
  symptoms: string[];
  causes: string[];
  treatment: BilingualContent;
  prevention: string[];
  affectedParts: string[];
  organicControl: string[];
  chemicalControl: string[];
  imageUrl?: string;
}

export type DiseaseSeverity = 'low' | 'moderate' | 'high' | 'critical';

// ===== Community Types =====
export interface CommunityPost {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerAvatar?: string;
  title: string;
  description: string;
  category: PostCategory;
  tags: string[];
  urgency: 'low' | 'medium' | 'high';
  timestamp: Date;
  likes: number;
  replies: number;
  views: number;
  solved: boolean;
  imageUrls?: string[];
  location?: UserLocation;
}

export type PostCategory = 'question' | 'tip' | 'success_story' | 'problem' | 'market_info' | 'alert';

// ===== UI Types =====
export interface Option {
  label: string;
  value: string;
  icon?: string;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

// ===== Misc =====
export interface GovernmentScheme {
  id: string;
  name: BilingualContent;
  description: BilingualContent;
  benefits: BilingualContent;
  eligibility: BilingualContent;
  documents: string[];
  applicationProcess: string;
  ministry: string;
  budget: string;
  website?: string;
  helpline?: string;
}
