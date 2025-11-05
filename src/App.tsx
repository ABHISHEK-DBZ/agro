import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import Weather from './pages/Weather';
import MarketPrices from './pages/MarketPrices';
import CropManagement from './pages/CropManagement';
import AiAgent from './pages/AiAgent';
import DiseaseDetection from './pages/DiseaseDetection';
import GovernmentSchemes from './pages/GovernmentSchemes';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import CommunityDashboard from './pages/CommunityDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';
import RealTimeDashboard from './components/RealTimeDashboard';
import DataSourceManager from './components/DataSourceManager';
import GovernmentAPITest from './components/GovernmentAPITest';
import AuthTester from './components/AuthTester';
import LiveWeather from './pages/LiveWeather';
import Analytics from './pages/Analytics';

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
      <div className="router-wrapper min-h-screen bg-gray-50 w-full overflow-x-hidden">
        {user && <Navbar />}
        <main className={`w-full ${user ? 'container mx-auto px-4 py-8' : ''}`}>
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
            
            {/* Community and Tracking Routes */}
            <Route path="/community" element={
              <ProtectedRoute>
                <CommunityDashboard />
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
            
            {/* User Routes */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
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
        <AppLayout />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
