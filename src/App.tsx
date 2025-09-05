import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Weather from './pages/Weather';
import LiveWeather from './pages/LiveWeather';
import MandiPrices from './pages/MandiPrices';
import LiveMarketPrices from './pages/LiveMarketPrices';
import CropInfo from './pages/CropInfo';
import AiAgent from './pages/AiAgent';
import DiseaseDetection from './pages/DiseaseDetection';
import GovernmentSchemes from './pages/GovernmentSchemes';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Setup2FA from './pages/Setup2FA';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LiveDashboard from './components/LiveDashboard';

const isAuthenticated = () => {
  // DEBUG: Always return true to bypass authentication
  return true;
};

const PrivateRoute = ({ children }: { children: React.ReactElement }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

function App() {
  console.log('🌾 Smart Krishi Sahayak App loading...');
  
  return (
    <ErrorBoundary>
      <Router basename="/smart-krishi-sahayak">
        <div className="min-h-screen bg-gray-50">
          <Navbar hideLogout={true} />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              {/* Authentication Routes Disabled */}
              {/* <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} /> */}
              {/* Main Dashboard Routes */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/live-dashboard" element={<LiveDashboard />} />
              {/* Weather Routes */}
              <Route path="/weather" element={<Weather />} />
              <Route path="/live-weather" element={<LiveWeather />} />
              {/* Market Routes */}
              <Route path="/mandi-prices" element={<MandiPrices />} />
              <Route path="/live-market" element={<LiveMarketPrices />} />
              {/* Agricultural Information Routes */}
              <Route path="/crop-info" element={<CropInfo />} />
              <Route path="/disease-detection" element={<DiseaseDetection />} />
              <Route path="/government-schemes" element={<GovernmentSchemes />} />
              {/* AI and Tools Routes */}
              <Route path="/agent" element={<AiAgent />} />
              <Route path="/ai-agent" element={<AiAgent />} />
              {/* User Routes */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/setup-2fa" element={<Setup2FA />} />
              {/* Fallback Route */}
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
