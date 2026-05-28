import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  Sprout,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle, loginWithGitHub, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.email || !formData.password) {
      setError('कृपया सभी फ़ील्ड भरें');
      return;
    }
    
    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.message || 'लॉगिन में त्रुटि हुई');
    }
  };

  const handleQuickDemoLogin = async () => {
    setError('');
    try {
      await login('demo@example.com', 'password123');
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.message || 'डेमो लॉगिन में त्रुटि हुई');
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setError('');
    try {
      console.log(`🔄 Attempting ${provider} login...`);
      
      // Show development message for localhost
      const isDevelopment = import.meta.env.MODE === 'development';
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      if ((isDevelopment || isLocalhost) && provider === 'google') {
        toast('Development mode: Google login will redirect to Google sign-in page...', {
          duration: 3000,
          icon: 'ℹ️',
        });
      }
      
      if (provider === 'google') {
        await loginWithGoogle();
      } else {
        await loginWithGitHub();
      }
      
      console.log(`✅ ${provider} login successful, navigating to dashboard...`);
      navigate('/dashboard');
    } catch (error: any) {
      console.error(`❌ ${provider} login failed:`, error);
      
      // Show user-friendly error message
      let errorMessage = `${provider === 'google' ? 'Google' : 'GitHub'} साइन-इन में त्रुटि हुई।`;
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'साइन-इन रद्द किया गया।';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = `${provider === 'google' ? 'Google' : 'GitHub'} साइन-इन सक्षम नहीं है।`;
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = 'यह डोमेन साइन-इन के लिए अधिकृत नहीं है।';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    }
  };

  return (
    <div className="login-container min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 to-green-700 p-12 items-center justify-center">
        <div className="text-center text-white">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 rounded-full backdrop-blur-sm">
              <Sprout className="w-12 h-12" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Smart Krishi Sahayak</h1>
          <p className="text-xl opacity-90 mb-8">आधुनिक कृषि समाधान</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="font-semibold">मौसम की जानकारी</div>
              <div className="opacity-80">रियल-टाइम अपडेट</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="font-semibold">बाजार की कीमतें</div>
              <div className="opacity-80">लाइव मंडी भाव</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="font-semibold">फसल की देखभाल</div>
              <div className="opacity-80">AI सहायता</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="font-semibold">किसान समुदाय</div>
              <div className="opacity-80">ज्ञान साझाकरण</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Sprout className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Smart Krishi Sahayak</h1>
            <p className="text-gray-600">आधुनिक कृषि समाधान</p>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">
              वापस आपका स्वागत है
            </h2>
            <p className="text-center text-gray-600">
              अपने खाते में लॉगिन करें
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 font-bold transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 active:scale-95 duration-200"
            >
              🔐 त्वरित डेमो लॉगिन (Quick Demo Login)
            </button>

            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FcGoogle className="w-5 h-5 mr-3" />
              Google से साइन इन करें
            </button>
            
            <button
              type="button"
              onClick={() => handleSocialLogin('github')}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaGithub className="w-5 h-5 mr-3" />
              GitHub से साइन इन करें
            </button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">या</span>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                ईमेल पता
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="आपका ईमेल पता"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                पासवर्ड
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="आपका पासवर्ड"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  मुझे याद रखें
                </label>
              </div>

              <Link
                to="/forgot-password"
                className="text-sm text-green-600 hover:text-green-500 font-medium"
              >
                पासवर्ड भूल गए?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  लॉगिन हो रहे हैं...
                </>
              ) : (
                'लॉगिन करें'
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              कोई खाता नहीं है?{' '}
              <Link
                to="/register"
                className="font-medium text-green-600 hover:text-green-500"
              >
                अभी रजिस्टर करें
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
