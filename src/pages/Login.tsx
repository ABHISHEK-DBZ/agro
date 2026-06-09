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
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { Button, Input, FormField, Alert } from '../components/ui';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle, loginWithGitHub, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('कृपया सभी फ़ील्ड भरें');
      return;
    }
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'लॉगिन में त्रुटि हुई');
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    try {
      await login('demo@example.com', 'password123');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'डेमो लॉगिन में त्रुटि हुई');
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setError('');
    try {
      const isDev = import.meta.env.MODE === 'development';
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if ((isDev || isLocal) && provider === 'google') {
        toast('Development mode: Google login will redirect...', { duration: 3000, icon: 'ℹ️' });
      }
      if (provider === 'google') await loginWithGoogle();
      else await loginWithGitHub();
      navigate('/dashboard');
    } catch (err: any) {
      let msg = `${provider === 'google' ? 'Google' : 'GitHub'} साइन-इन में त्रुटि हुई।`;
      if (err.code === 'auth/popup-closed-by-user') msg = 'साइन-इन रद्द किया गया।';
      else if (err.code === 'auth/operation-not-allowed') msg = `${provider === 'google' ? 'Google' : 'GitHub'} साइन-इन सक्षम नहीं है।`;
      else if (err.code === 'auth/unauthorized-domain') msg = 'यह डोमेन साइन-इन के लिए अधिकृत नहीं है।';
      else if (err.message) msg = err.message;
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex">
      {/* Brand panel (≥ lg) */}
      <aside
        className="hidden lg:flex lg:w-[44%] xl:w-[40%] relative overflow-hidden flex-col justify-between p-10 xl:p-14"
        style={{
          background: 'linear-gradient(180deg, #2f4328 0%, #39542f 50%, #476a39 100%)',
          color: '#f1efe9',
        }}
      >
        {/* Subtle field-line texture */}
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(115deg, transparent 0 80px, rgba(255,255,255,0.4) 80px 81px)',
          }}
        />

        <Link to="/" className="relative flex items-center gap-2.5 z-10">
          <div className="w-9 h-9 rounded-md bg-white/10 flex items-center justify-center">
            <Sprout className="w-5 h-5 text-leaf-200" />
          </div>
          <span className="text-base font-semibold tracking-tight">Smart Krishi Sahayak</span>
        </Link>

        <div className="relative z-10 max-w-md">
          <h1 className="text-3xl xl:text-4xl font-semibold leading-tight tracking-tight mb-3">
            आधुनिक कृषि के लिए<br />एक स्मार्ट सहायक
          </h1>
          <p className="text-leaf-200/70 text-sm leading-relaxed mb-8">
            मौसम, मंडी भाव, फसल रोग पहचान, और किसान समुदाय — सब एक ही जगह।
            अपनी खेती को डेटा-संचालित निर्णयों से बेहतर बनाएं।
          </p>

          <ul className="space-y-2.5 text-sm text-leaf-100/90">
            {[
              'रियल-टाइम मौसम और कृषि सलाह',
              'लाइव मंडी भाव — 500+ बाज़ार',
              'AI से तुरंत फसल रोग पहचान',
              'सरकारी योजनाओं की पूरी जानकारी',
            ].map((line) => (
              <li key={line} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-leaf-300 flex-shrink-0 mt-0.5" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 text-xs text-leaf-200/50">
          © {new Date().getFullYear()} Smart Krishi Sahayak · भारत सरकार के किसानों के लिए
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-[400px]">
            {/* Mobile brand */}
            <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
              <div className="w-10 h-10 rounded-md bg-leaf-700 text-white flex items-center justify-center">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <div className="text-base font-semibold text-strong">Smart Krishi Sahayak</div>
                <div className="text-xs text-muted">किसान सहायक</div>
              </div>
            </Link>

            <div className="mb-7">
              <h2 className="text-2xl font-semibold text-strong tracking-tight">वापस स्वागत है</h2>
              <p className="text-sm text-muted mt-1.5">अपने खाते में लॉगिन करें और खेती जारी रखें।</p>
            </div>

            {error && (
              <div className="mb-5">
                <Alert tone="danger" title={error} />
              </div>
            )}

            <div className="space-y-2.5 mb-5">
              <Button type="button" variant="primary" block onClick={handleDemoLogin} loading={loading}>
                🔐 त्वरित डेमो लॉगिन
              </Button>
              <div className="grid grid-cols-2 gap-2.5">
                <Button type="button" variant="secondary" onClick={() => handleSocialLogin('google')} disabled={loading}>
                  <FcGoogle className="w-4 h-4" /> Google
                </Button>
                <Button type="button" variant="secondary" onClick={() => handleSocialLogin('github')} disabled={loading}>
                  <FaGithub className="w-4 h-4" /> GitHub
                </Button>
              </div>
            </div>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-subtle" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-canvas text-xs text-muted uppercase tracking-wider">या ईमेल से</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <FormField label="ईमेल पता" htmlFor="email">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4" />}
                  placeholder="आपका ईमेल पता"
                />
              </FormField>

              <FormField label="पासवर्ड" htmlFor="password">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  placeholder="आपका पासवर्ड"
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="text-ink-400 hover:text-ink-700 p-1"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
              </FormField>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-ink-700">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="rounded"
                  />
                  मुझे याद रखें
                </label>
                <Link to="/forgot-password" className="text-sm text-leaf hover:underline">
                  पासवर्ड भूल गए?
                </Link>
              </div>

              <Button type="submit" variant="primary" block size="lg" loading={loading}>
                लॉगिन करें
              </Button>
            </form>

            <p className="text-center text-sm text-muted mt-6">
              कोई खाता नहीं है?{' '}
              <Link to="/register" className="text-leaf font-medium hover:underline">
                अभी रजिस्टर करें
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
