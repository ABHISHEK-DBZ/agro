
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const passwordPolicy = 'Password must be at least 8 characters, contain one uppercase letter, one lowercase letter, one number, and one special character.';

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

const Register: React.FC = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1 && (!name || !email)) {
      setError('Please fill all fields.');
      return;
    }
    setError('');
    setStep(2);
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (getPasswordStrength(password) < 5) {
      setError('Password does not meet requirements.');
      return;
    }
    setLoading(true);
    try {
      await axios.post('/api/register', { name, email, password });
      navigate('/verify-email');
    } catch (err: any) {
      setError('Registration failed. Please try again.');
    }
    setLoading(false);
  };

  // Social login handlers (dummy for now)
  const handleSocialLogin = (provider: string) => {
    window.location.href = `/api/auth/${provider}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded shadow w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-green-700 dark:text-green-400">Register</h2>
        {step === 1 ? (
          <form onSubmit={handleNext}>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">Name</label>
            <input
              type="text"
              className="w-full p-2 mb-4 border rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">Email Address</label>
            <input
              type="email"
              className="w-full p-2 mb-4 border rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
              Next
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">Password</label>
            <input
              type="password"
              className="w-full p-2 mb-2 border rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">Confirm Password</label>
            <input
              type="password"
              className="w-full p-2 mb-2 border rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
            <div className="mb-2 text-xs text-gray-600 dark:text-gray-400">{passwordPolicy}</div>
            <div className="mb-4">
              <div className="h-2 w-full bg-gray-200 rounded">
                <div
                  className={`h-2 rounded ${getPasswordStrength(password) === 0 ? 'bg-gray-200' : getPasswordStrength(password) < 3 ? 'bg-red-500' : getPasswordStrength(password) < 5 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${getPasswordStrength(password) * 20}%` }}
                ></div>
              </div>
              <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                Password strength: {['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][getPasswordStrength(password)] || 'Very Weak'}
              </div>
            </div>
            {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
        )}
        <div className="mt-6">
          <div className="flex flex-col gap-2">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border rounded py-2 hover:bg-green-100 dark:hover:bg-green-900"
              onClick={() => handleSocialLogin('google')}
            >
              <span className="icon-[lucide--circle] text-red-500" /> Google Signup
            </button>
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border rounded py-2 hover:bg-green-100 dark:hover:bg-green-900"
              onClick={() => handleSocialLogin('facebook')}
            >
              <span className="icon-[lucide--circle] text-blue-600" /> Facebook Signup
            </button>
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border rounded py-2 hover:bg-green-100 dark:hover:bg-green-900"
              onClick={() => handleSocialLogin('github')}
            >
              <span className="icon-[lucide--circle] text-black" /> GitHub Signup
            </button>
          </div>
        </div>
        <div className="mt-4 text-center">
          Already have an account? <a href="/login" className="text-green-600 dark:text-green-400 underline">Login here</a>
        </div>
      </div>
    </div>
  );
};
export default Register;
