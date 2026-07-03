import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, ArrowLeft, Sprout } from 'lucide-react';
import { Button, Input, FormField, Alert } from '../components/ui';

const ForgotPassword: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { sendPasswordResetEmail } = await import('firebase/auth');
      const { auth } = await import('../config/firebase');
      await sendPasswordResetEmail(auth, email);
      setMessage(t('auth.resetEmailSent', 'Password reset link sent to your email.'));
    } catch (err: any) {
      setMessage(t('auth.resetError', 'Error sending reset link.'));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-md bg-leaf-700 text-white flex items-center justify-center">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-semibold text-strong">{t('app.title')}</div>
            <div className="text-xs text-muted">{t('app.subtitle')}</div>
          </div>
        </Link>

        <div className="card card-padded">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-1 text-sm text-ink-600 hover:text-ink-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> {t('auth.backToLogin', 'Back to Login')}
          </button>

          <h2 className="text-2xl font-semibold text-strong tracking-tight mb-1">{t('auth.forgotPassword', 'Forgot Password')}</h2>
          <p className="text-sm text-muted mb-5">{t('auth.enterEmailReset', 'Enter your email and we\'ll send you a reset link.')}</p>

          {message && (
            <div className="mb-4">
              <Alert tone={message.includes('Error') ? 'danger' : 'success'} title={message} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label={t('auth.email', 'Email Address')} htmlFor="reset-email">
              <Input
                id="reset-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                placeholder={t('auth.emailPlaceholder', 'Your email address')}
              />
            </FormField>
            <Button type="submit" variant="primary" block size="lg" loading={loading}>
              {loading ? t('common.sending', 'Sending...') : t('auth.sendResetLink', 'Send Reset Link')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
