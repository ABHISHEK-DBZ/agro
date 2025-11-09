import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load all page components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Weather = lazy(() => import('./pages/Weather'));
const MarketPrices = lazy(() => import('./pages/MarketPrices'));
const CropManagement = lazy(() => import('./pages/CropManagement'));
const AiAgent = lazy(() => import('./pages/AiAgent'));
const DiseaseDetection = lazy(() => import('./pages/DiseaseDetection'));
const EnhancedDiseaseDetection = lazy(() => import('./pages/EnhancedDiseaseDetection'));
const GovernmentSchemes = lazy(() => import('./pages/GovernmentSchemes'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const EnhancedSettings = lazy(() => import('./pages/EnhancedSettings'));
const CommunityDashboard = lazy(() => import('./pages/CommunityDashboard'));
const GroupsPage = lazy(() => import('./pages/GroupsPage'));
const GroupDetailPage = lazy(() => import('./pages/GroupDetailPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const PollsPage = lazy(() => import('./pages/PollsPage'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
const MessagesPage = lazy(() => import('./pages/MessagesPage'));
const MapViewPage = lazy(() => import('./pages/MapViewPage'));
const EnhancedProfilePage = lazy(() => import('./pages/EnhancedProfilePage'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const RealTimeDashboard = lazy(() => import('./components/RealTimeDashboard'));
const DataSourceManager = lazy(() => import('./components/DataSourceManager'));
const GovernmentAPITest = lazy(() => import('./components/GovernmentAPITest'));
const AuthTester = lazy(() => import('./components/AuthTester'));
const LiveWeather = lazy(() => import('./pages/LiveWeather'));
const Analytics = lazy(() => import('./pages/Analytics'));
const GrievancesPage = lazy(() => import('./pages/GrievancesPage'));
const AdminGrievances = lazy(() => import('./pages/AdminGrievances'));
// New Features
const CropCalendar = lazy(() => import('./pages/CropCalendar'));
const LoanCalculator = lazy(() => import('./pages/LoanCalculator'));
const SoilTesting = lazy(() => import('./pages/SoilTesting'));

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// Main App Layout Component
const AppLayout: React.FC = () => {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  
  // Get base path based on deployment platform
  const getBasePath = () => {
    const hostname = window.location.hostname;
    
    // GitHub Pages
    if (hostname.includes('github.io')) {
      return '/smart-krishi-sahayak';
    }
    
    // All other platforms (Vercel, Netlify, Firebase, Surge, Railway) use root
    return '';
  };
  
  const basename = getBasePath();
  
  return (
    <Router 
      basename={basename}
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <div key={i18n.language} className="router-wrapper min-h-screen bg-gray-50 w-full overflow-x-hidden">{/* Add key to force re-render on language change */}
        {user && <Navbar />}
        <main className={`w-full ${user ? 'container mx-auto px-4 py-8' : ''}`}>
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <LoadingSpinner />
            </div>
          }>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              <Route path="/register" element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } />
            {/* <Route path="/forgot-password" element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            } />
            <Route path="/verify-email" element={<VerifyEmail />} /> */}
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            {/* <Route path="/live-dashboard" element={
              <ProtectedRoute>
                <LiveDashboard />
              </ProtectedRoute>
            } /> */}
            
            {/* Weather Routes */}
            <Route path="/weather" element={
              <ProtectedRoute>
                <Weather />
              </ProtectedRoute>
            } />
            <Route path="/live-weather" element={
              <ProtectedRoute>
                <LiveWeather />
              </ProtectedRoute>
            } />
            
            {/* Market Routes */}
            <Route path="/market-prices" element={
              <ProtectedRoute>
                <MarketPrices />
              </ProtectedRoute>
            } />
            
            {/* Real-time Data Routes */}
            <Route path="/real-time-dashboard" element={
              <ProtectedRoute>
                <RealTimeDashboard />
              </ProtectedRoute>
            } />
            <Route path="/data-sources" element={
              <ProtectedRoute>
                <DataSourceManager />
              </ProtectedRoute>
            } />
            <Route path="/gov-api-test" element={
              <ProtectedRoute>
                <GovernmentAPITest />
              </ProtectedRoute>
            } />
            <Route path="/auth-test" element={
              <AuthTester />
            } />
            
            {/* Agricultural Information Routes */}
            <Route path="/crop-management" element={
              <ProtectedRoute>
                <CropManagement />
              </ProtectedRoute>
            } />
            <Route path="/disease-detection" element={
              <ProtectedRoute>
                <DiseaseDetection />
              </ProtectedRoute>
            } />
            <Route path="/disease-detection-ai" element={
              <ProtectedRoute>
                <EnhancedDiseaseDetection />
              </ProtectedRoute>
            } />
            <Route path="/government-schemes" element={
              <ProtectedRoute>
                <GovernmentSchemes />
              </ProtectedRoute>
            } />
            
            {/* AI and Tools Routes */}
            <Route path="/ai-agent" element={
              <ProtectedRoute>
                <AiAgent />
              </ProtectedRoute>
            } />
            
            {/* New Features */}
            <Route path="/crop-calendar" element={
              <ProtectedRoute>
                <CropCalendar />
              </ProtectedRoute>
            } />
            <Route path="/loan-calculator" element={
              <ProtectedRoute>
                <LoanCalculator />
              </ProtectedRoute>
            } />
            <Route path="/soil-testing" element={
              <ProtectedRoute>
                <SoilTesting />
              </ProtectedRoute>
            } />
            
            {/* Community and Tracking Routes */}
            <Route path="/community" element={
              <ProtectedRoute>
                <CommunityDashboard />
              </ProtectedRoute>
            } />
            <Route path="/groups" element={
              <ProtectedRoute>
                <GroupsPage />
              </ProtectedRoute>
            } />
            <Route path="/groups/:groupId" element={
              <ProtectedRoute>
                <GroupDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            } />
            <Route path="/polls" element={
              <ProtectedRoute>
                <PollsPage />
              </ProtectedRoute>
            } />
            <Route path="/leaderboard" element={
              <ProtectedRoute>
                <LeaderboardPage />
              </ProtectedRoute>
            } />
            <Route path="/messages" element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            } />
            <Route path="/map" element={
              <ProtectedRoute>
                <MapViewPage />
              </ProtectedRoute>
            } />
            <Route path="/profile/:userId" element={
              <ProtectedRoute>
                <EnhancedProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } />
            {/* <Route path="/daily-tracking" element={
              <ProtectedRoute>
                <DailyTrackingLog />
              </ProtectedRoute>
            } /> */}
            
            {/* Grievances Routes */}
            <Route path="/grievances" element={
              <ProtectedRoute>
                <GrievancesPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/grievances" element={
              <ProtectedRoute>
                <AdminGrievances />
              </ProtectedRoute>
            } />
            
            {/* User Routes */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <EnhancedSettings />
              </ProtectedRoute>
            } />
            <Route path="/settings-old" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            
            {/* Admin Dashboard */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
          </Routes>
          </Suspense>
        </main>
        
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#333',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            },
            success: {
              style: {
                border: '1px solid #10B981',
              },
            },
            error: {
              style: {
                border: '1px solid #EF4444',
              },
            },
          }}
        />
      </div>
    </Router>
  );
};

function App() {
  console.log('🌾 Smart Krishi Sahayak App loading...');
  console.log('Environment:', import.meta.env.MODE);
  console.log('Current URL:', window.location.href);
  
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SettingsProvider>
          <AppLayout />
        </SettingsProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
