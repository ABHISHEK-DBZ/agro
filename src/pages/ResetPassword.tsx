import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await axios.post('/api/reset-password', { token, password });
      setMessage('Password reset successful.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setMessage('Error resetting password.');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded shadow w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-green-700 dark:text-green-400">Reset Password</h2>
        <form onSubmit={handleSubmit}>
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">New Password</label>
          <input
            type="password"
            className="w-full p-2 mb-4 border rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">Confirm Password</label>
          <input
            type="password"
            className="w-full p-2 mb-4 border rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        {message && <p className="mt-4 text-center text-green-600 dark:text-green-400">{message}</p>}
      </div>
    </div>
  );
};

export default ResetPassword;
