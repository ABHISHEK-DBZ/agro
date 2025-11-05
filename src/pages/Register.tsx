import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User,
  Phone,
  MapPin,
  Sprout,
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';

interface FormData {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  village: string;
  district: string;
  state: string;
  acceptTerms: boolean;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, loginWithGoogle, loginWithGitHub, loading } = useAuth();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    village: '',
    district: '',
    state: '',
    acceptTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateStep1 = () => {
    if (!formData.displayName.trim()) {
      setError('कृपया अपना नाम दर्ज करें');
      return false;
    }
    if (!formData.email.trim()) {
      setError('कृपया ईमेल पता दर्ज करें');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('कृपया एक वैध ईमेल पता दर्ज करें');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.password) {
      setError('कृपया पासवर्ड दर्ज करें');
      return false;
    }
    if (formData.password.length < 6) {
      setError('पासवर्ड कम से कम 6 अक्षर का होना चाहिए');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('पासवर्ड मेल नहीं खाते');
      return false;
    }
    if (!formData.acceptTerms) {
      setError('कृपया नियम और शर्तों को स्वीकार करें');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateStep2()) return;
    
    try {
      const userData = {
        displayName: formData.displayName,
        location: formData.village || formData.district || formData.state ? {
          village: formData.village,
          district: formData.district,
          state: formData.state,
        } : undefined,
        phoneNumber: formData.phone,
        role: 'farmer' as const,
      };
      
      await register(formData.email, formData.password, userData);
      navigate('/verify-email');
    } catch (error: any) {
      setError(error.message || 'रजिस्ट्रेशन में त्रुटि हुई');
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setError('');
    try {
      if (provider === 'google') {
        await loginWithGoogle();
      } else {
        await loginWithGitHub();
      }
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.message || 'सोशल लॉगिन में त्रुटि हुई');
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const indianStates = [
    'आंध्र प्रदेश', 'अरुणाचल प्रदेश', 'असम', 'बिहार', 'छत्तीसगढ़', 'गोवा', 'गुजरात',
    'हरियाणा', 'हिमाचल प्रदेश', 'झारखंड', 'कर्नाटक', 'केरल', 'मध्य प्रदेश', 'महाराष्ट्र',
    'मणिपुर', 'मेघालय', 'मिजोरम', 'नागालैंड', 'ओडिशा', 'पंजाब', 'राजस्थान', 'सिक्किम',
    'तमिलनाडु', 'तेलंगाना', 'त्रिपुरा', 'उत्तर प्रदेश', 'उत्तराखंड', 'पश्चिम बंगाल'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 to-green-700 p-12 items-center justify-center">
        <div className="text-center text-white">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 rounded-full backdrop-blur-sm">
              <Sprout className="w-12 h-12" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Smart Krishi Sahayak</h1>
          <p className="text-xl opacity-90 mb-8">किसान समुदाय में शामिल हों</p>
          <div className="text-left space-y-4">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-green-300" />
              <span>मुफ्त मौसम की जानकारी</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-green-300" />
              <span>रियल-टाइम बाजार की कीमतें</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-green-300" />
              <span>AI फसल सलाहकार</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-green-300" />
              <span>किसान समुदाय सपोर्ट</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-green-300" />
              <span>सरकारी योजनाओं की जानकारी</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Sprout className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Smart Krishi Sahayak</h1>
            <p className="text-gray-600">किसान समुदाय में शामिल हों</p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <div className={`w-12 h-1 ${step >= 2 ? 'bg-green-600' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">
              {step === 1 ? 'खाता बनाएं' : 'पासवर्ड सेट करें'}
            </h2>
            <p className="text-center text-gray-600">
              {step === 1 ? 'अपनी जानकारी दर्ज करें' : 'अपना खाता सुरक्षित करें'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {step === 1 && (
            <>
              {/* Social Login Buttons */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  disabled={loading}
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FcGoogle className="w-5 h-5 mr-3" />
                  Google से साइन अप करें
                </button>
                
                <button
                  type="button"
                  onClick={() => handleSocialLogin('github')}
                  disabled={loading}
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaGithub className="w-5 h-5 mr-3" />
                  GitHub से साइन अप करें
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

              {/* Step 1 Form */}
              <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-4">
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                    पूरा नाम *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="displayName"
                      name="displayName"
                      type="text"
                      required
                      value={formData.displayName}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      placeholder="आपका पूरा नाम"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    ईमेल पता *
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
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    मोबाइल नंबर
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                      राज्य
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      >
                        <option value="">राज्य चुनें</option>
                        {indianStates.map((state) => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-2">
                      जिला
                    </label>
                    <input
                      id="district"
                      name="district"
                      type="text"
                      value={formData.district}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      placeholder="आपका जिला"
                    />
                  </div>

                  <div>
                    <label htmlFor="village" className="block text-sm font-medium text-gray-700 mb-2">
                      गांव/शहर
                    </label>
                    <input
                      id="village"
                      name="village"
                      type="text"
                      value={formData.village}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      placeholder="आपका गांव/शहर"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 font-medium transition-colors"
                >
                  आगे बढ़ें
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  पासवर्ड *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    placeholder="कम से कम 6 अक्षर का पासवर्ड"
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
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded ${
                            level <= passwordStrength
                              ? passwordStrength <= 2
                                ? 'bg-red-500'
                                : passwordStrength <= 3
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {passwordStrength <= 2 && 'कमजोर'}
                      {passwordStrength === 3 && 'मध्यम'}
                      {passwordStrength >= 4 && 'मजबूत'}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  पासवर्ड की पुष्टि करें *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    placeholder="पासवर्ड दोबारा दर्ज करें"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-red-600 mt-1">पासवर्ड मेल नहीं खाते</p>
                )}
              </div>

              <div className="flex items-start">
                <input
                  id="acceptTerms"
                  name="acceptTerms"
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-1"
                />
                <label htmlFor="acceptTerms" className="ml-3 block text-sm text-gray-700">
                  मैं{' '}
                  <Link to="/terms" className="text-green-600 hover:text-green-500 font-medium">
                    नियम और शर्तों
                  </Link>{' '}
                  और{' '}
                  <Link to="/privacy" className="text-green-600 hover:text-green-500 font-medium">
                    प्राइवेसी पॉलिसी
                  </Link>{' '}
                  से सहमत हूं।
                </label>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 font-medium transition-colors"
                >
                  वापस
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      रजिस्टर हो रहे हैं...
                    </>
                  ) : (
                    'खाता बनाएं'
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="text-center">
            <p className="text-sm text-gray-600">
              पहले से खाता है?{' '}
              <Link
                to="/login"
                className="font-medium text-green-600 hover:text-green-500"
              >
                यहां लॉगिन करें
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;