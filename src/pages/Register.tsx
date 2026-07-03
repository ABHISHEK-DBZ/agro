import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Sprout,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { Button, Input, Select, FormField, Alert } from '../components/ui';

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

const INDIAN_STATES = [
  'आंध्र प्रदेश', 'अरुणाचल प्रदेश', 'असम', 'बिहार', 'छत्तीसगढ़', 'गोवा', 'गुजरात',
  'हरियाणा', 'हिमाचल प्रदेश', 'झारखंड', 'कर्नाटक', 'केरल', 'मध्य प्रदेश', 'महाराष्ट्र',
  'मणिपुर', 'मेघालय', 'मिजोरम', 'नागालैंड', 'ओडिशा', 'पंजाब', 'राजस्थान', 'सिक्किम',
  'तमिलनाडु', 'तेलंगाना', 'त्रिपुरा', 'उत्तर प्रदेश', 'उत्तराखंड', 'पश्चिम बंगाल',
];

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    if (error) setError('');
  };

  const validateStep1 = () => {
    if (!formData.displayName.trim()) return t('register.nameRequired', 'कृपया अपना नाम दर्ज करें');
    if (!formData.email.trim()) return t('register.emailRequired', 'कृपया ईमेल पता दर्ज करें');
    if (!/\S+@\S+\.\S+/.test(formData.email)) return t('register.invalidEmail', 'कृपया एक वैध ईमेल पता दर्ज करें');
    return '';
  };

  const validateStep2 = () => {
    if (!formData.password) return t('register.passwordRequired', 'कृपया पासवर्ड दर्ज करें');
    if (formData.password.length < 6) return t('register.passwordMinLength', 'पासवर्ड कम से कम 6 अक्षर का होना चाहिए');
    if (formData.password !== formData.confirmPassword) return t('register.passwordMismatch', 'पासवर्ड मेल नहीं खाते');
    if (!formData.acceptTerms) return t('register.acceptTermsRequired', 'कृपया नियम और शर्तों को स्वीकार करें');
    return '';
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError('');
    setStep(2);
  };

  const handleBack = () => { setError(''); setStep(1); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateStep2();
    if (err) { setError(err); return; }
    setError('');
    try {
      await register(formData.email, formData.password, {
        displayName: formData.displayName,
        location: formData.village || formData.district || formData.state ? {
          village: formData.village,
          district: formData.district,
          state: formData.state,
        } : undefined,
        phoneNumber: formData.phone,
        role: 'farmer',
      });
      navigate('/verify-email');
    } catch (err: any) {
      setError(err.message || t('register.error', 'रजिस्ट्रेशन में त्रुटि हुई'));
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setError('');
    try {
      if (provider === 'google') await loginWithGoogle();
      else await loginWithGitHub();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || t('register.socialError', 'सोशल लॉगिन में त्रुटि हुई'));
    }
  };

  // Password strength (0-4)
  const strength = (() => {
    let s = 0;
    if (formData.password.length >= 6) s++;
    if (formData.password.length >= 8) s++;
    if (/[A-Z]/.test(formData.password)) s++;
    if (/[0-9]/.test(formData.password)) s++;
    if (/[^A-Za-z0-9]/.test(formData.password)) s++;
    return Math.min(s, 4);
  })();
  const strengthTone = strength <= 1 ? 'danger' : strength <= 2 ? 'harvest' : 'success';
  const strengthLabel = strength <= 1 ? t('register.weak', 'कमजोर') : strength <= 2 ? t('register.medium', 'मध्यम') : t('register.strong', 'मजबूत');

  return (
    <div className="min-h-screen bg-canvas flex">
      {/* Brand panel */}
      <aside
        className="hidden lg:flex lg:w-[40%] xl:w-[36%] relative overflow-hidden flex-col justify-between p-10 xl:p-14"
        style={{
          background: 'linear-gradient(180deg, #2f4328 0%, #39542f 50%, #476a39 100%)',
          color: '#f1efe9',
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(115deg, transparent 0 80px, rgba(255,255,255,0.4) 80px 81px)',
          }}
        />
        <Link to="/" className="relative flex items-center gap-2.5 z-10">
          <div className="w-9 h-9 rounded-md bg-white/10 flex items-center justify-center">
            <Sprout className="w-5 h-5 text-leaf-200" />
          </div>
          <span className="text-base font-semibold tracking-tight">Smart Krishi Sahayak</span>
        </Link>

        <div className="relative z-10 max-w-md">
          <h1 className="text-3xl xl:text-4xl font-semibold leading-tight tracking-tight mb-3"
            dangerouslySetInnerHTML={{ __html: t('register.brandTitle', 'किसान समुदाय में<br />शामिल हों') }}
          />
          <p className="text-leaf-200/70 text-sm leading-relaxed mb-8">
            {t('register.brandDesc', 'मुफ्त में अपना किसान खाता बनाएं और स्मार्ट खेती की ओर पहला कदम बढ़ाएं।')}
          </p>
          <ul className="space-y-2.5 text-sm text-leaf-100/90">
            {[
              t('register.feature1', 'मुफ्त मौसम और बाजार अपडेट'),
              t('register.feature2', 'AI फसल रोग पहचान स्कैनर'),
              t('register.feature3', 'सरकारी योजनाओं की पूरी जानकारी'),
              t('register.feature4', 'स्थानीय किसान समूह से जुड़ें'),
            ].map((line) => (
              <li key={line} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-leaf-300 flex-shrink-0 mt-0.5" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 text-xs text-leaf-200/50">
          {t('register.freeCancel', 'मुफ्त · किसी भी समय रद्द करें')}
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-[480px]">
            {/* Mobile brand */}
            <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
              <div className="w-10 h-10 rounded-md bg-leaf-700 text-white flex items-center justify-center">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <div className="text-base font-semibold text-strong">{t('app.title')}</div>
                <div className="text-xs text-muted">{t('app.subtitle')}</div>
              </div>
            </Link>

            {/* Step indicator */}
            <div className="flex items-center gap-3 mb-7">
              {[1, 2].map((n, idx) => (
                <React.Fragment key={n}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      step >= n ? 'bg-leaf-700 text-white' : 'bg-sunken text-muted border border-subtle'
                    }`}
                  >
                    {n}
                  </div>
                  {idx === 0 && <div className={`flex-1 h-px transition-colors ${step >= 2 ? 'bg-leaf-700' : 'bg-default'}`} />}
                </React.Fragment>
              ))}
              <div className="text-sm text-muted ml-1">{t('register.step', 'चरण')} {step} / 2</div>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-strong tracking-tight">
                {step === 1 ? t('register.step1Title', 'खाता बनाएं') : t('register.step2Title', 'पासवर्ड सेट करें')}
              </h2>
              <p className="text-sm text-muted mt-1.5">
                {step === 1 ? t('register.step1Desc', 'अपनी जानकारी दर्ज करें') : t('register.step2Desc', 'अपना खाता सुरक्षित करें')}
              </p>
            </div>

            {error && <div className="mb-5"><Alert tone="danger" title={error} /></div>}

            {step === 1 && (
              <>
                <div className="grid grid-cols-2 gap-2.5 mb-5">
                  <Button type="button" variant="secondary" onClick={() => handleSocialLogin('google')} disabled={loading}>
                    <FcGoogle className="w-4 h-4" /> Google
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => handleSocialLogin('github')} disabled={loading}>
                    <FaGithub className="w-4 h-4" /> GitHub
                  </Button>
                </div>

                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-subtle" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 bg-canvas text-xs text-muted uppercase tracking-wider">{t('register.or', 'या')}</span>
                  </div>
                </div>

                <form onSubmit={handleNext} className="space-y-4" noValidate>
                  <FormField label={t('register.fullName', 'पूरा नाम')} htmlFor="displayName" required>
                    <Input
                      id="displayName"
                      name="displayName"
                      type="text"
                      required
                      value={formData.displayName}
                      onChange={handleChange}
                      leftIcon={<User className="w-4 h-4" />}
                      placeholder={t('register.fullNamePlaceholder', 'आपका पूरा नाम')}
                    />
                  </FormField>

                  <FormField label={t('auth.email', 'ईमेल पता')} htmlFor="email" required>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      leftIcon={<Mail className="w-4 h-4" />}
                      placeholder={t('auth.emailPlaceholder', 'आपका ईमेल पता')}
                    />
                  </FormField>

                  <FormField label={t('register.phone', 'मोबाइल नंबर')} htmlFor="phone" hint={t('register.phoneHint', 'वैकल्पिक — OTP सत्यापन के लिए')}>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      leftIcon={<Phone className="w-4 h-4" />}
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </FormField>

                  <FormField label={t('register.state', 'राज्य')} htmlFor="state">
                    <Select
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                    >
                      <option value="">{t('register.selectState', 'राज्य चुनें')}</option>
                      {INDIAN_STATES.map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </Select>
                  </FormField>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField label={t('register.district', 'जिला')} htmlFor="district">
                      <Input
                        id="district"
                        name="district"
                        type="text"
                        value={formData.district}
                        onChange={handleChange}
                        placeholder={t('register.districtPlaceholder', 'आपका जिला')}
                      />
                    </FormField>
                    <FormField label={t('register.village', 'गांव/शहर')} htmlFor="village">
                      <Input
                        id="village"
                        name="village"
                        type="text"
                        value={formData.village}
                        onChange={handleChange}
                        placeholder={t('register.villagePlaceholder', 'आपका गांव')}
                      />
                    </FormField>
                  </div>

                  <Button type="submit" variant="primary" block size="lg" className="mt-2">
                    {t('register.next', 'आगे बढ़ें')} <ArrowRight className="w-4 h-4" />
                  </Button>
                </form>
              </>
            )}

            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <FormField label={t('auth.password', 'पासवर्ड')} htmlFor="password" required hint={t('register.passwordHint', 'कम से कम 6 अक्षर')}>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    leftIcon={<Lock className="w-4 h-4" />}
                    placeholder={t('register.newPassword', 'नया पासवर्ड')}
                    rightSlot={
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="text-ink-400 hover:text-ink-700 p-1"
                        aria-label="Toggle password"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                  />
                </FormField>

                {formData.password && (
                  <div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            level <= strength
                              ? strengthTone === 'danger' ? 'bg-danger-500'
                              : strengthTone === 'harvest' ? 'bg-harvest-500'
                              : 'bg-success-500'
                              : 'bg-sunken'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted mt-1.5">{strengthLabel}</p>
                  </div>
                )}

                <FormField label={t('register.confirmPassword', 'पासवर्ड की पुष्टि')} htmlFor="confirmPassword" required>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    leftIcon={<Lock className="w-4 h-4" />}
                    placeholder={t('register.confirmPasswordPlaceholder', 'पासवर्ड दोबारा दर्ज करें')}
                    rightSlot={
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="text-ink-400 hover:text-ink-700 p-1"
                        aria-label="Toggle confirm password"
                      >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                  />
                </FormField>

                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-danger">{t('register.passwordMismatch', 'पासवर्ड मेल नहीं खाते')}</p>
                )}

                <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                    className="mt-0.5 rounded"
                  />
                  <span className="text-sm text-ink-700 leading-relaxed">
                    {t('register.iAgree', 'मैं')}{' '}
                    <Link to="/terms" className="text-leaf font-medium hover:underline">{t('register.termsLink', 'नियम और शर्तों')}</Link>
                    {' '}{t('register.and', 'और')}{' '}
                    <Link to="/privacy" className="text-leaf font-medium hover:underline">{t('register.privacyLink', 'प्राइवेसी पॉलिसी')}</Link>
                    {' '}{t('register.agreeSuffix', 'से सहमत हूं।')}
                  </span>
                </label>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button type="button" variant="secondary" onClick={handleBack} className="sm:w-1/3">
                    <ArrowLeft className="w-4 h-4" /> {t('register.back', 'वापस')}
                  </Button>
                  <Button type="submit" variant="primary" loading={loading} className="sm:flex-1">
                    {t('register.createAccount', 'खाता बनाएं')}
                  </Button>
                </div>
              </form>
            )}

            <p className="text-center text-sm text-muted mt-6">
              {t('register.haveAccount', 'पहले से खाता है?')}{' '}
              <Link to="/login" className="text-leaf font-medium hover:underline">
                {t('register.loginHere', 'यहां लॉगिन करें')}
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;
