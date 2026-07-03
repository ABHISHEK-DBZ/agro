// Navigation Type Definitions
export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  MainTabs: undefined;
  Weather: undefined;
  MarketPrices: undefined;
  CropInfo: undefined;
  DiseaseDetection: undefined;
  Profile: undefined;
  Settings: undefined;
  Schemes: undefined;
  SoilTesting: undefined;
  CropCalendar: undefined;
  CommunityFeed: undefined;
  AiAssistant: undefined;
  LoanCalculator: undefined;
  Grievances: undefined;
  Groups: undefined;
  GroupDetail: { groupId: string };
  Messages: { userId?: string; userName?: string };
  Notifications: undefined;
  Polls: undefined;
  CropManagement: undefined;
  DailyTrackingLog: undefined;
  Analytics: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Weather: undefined;
  Market: undefined;
  Crops: undefined;
  More: undefined;
};

export type TabIcon = 'home' | 'weather' | 'market' | 'crops' | 'more';
