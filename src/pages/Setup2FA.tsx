import React, { useState } from 'react';
import axios from 'axios';

const Setup2FA: React.FC = () => {
  const [enabled, setEnabled] = useState(false);
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');

  const handleEnable = async () => {
    try {
      await axios.post('/api/enable-2fa');
      setEnabled(true);
      setMessage('2FA enabled. Scan the QR code with your authenticator app.');
    } catch {
      setMessage('Error enabling 2FA.');
    }
  };

  const handleVerify = async () => {
    try {
      await axios.post('/api/verify-2fa', { code });
      setMessage('2FA setup complete!');
    } catch {
      setMessage('Invalid code.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded shadow w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-green-700 dark:text-green-400">Two-Factor Authentication Setup</h2>
        {!enabled ? (
          <button
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 mb-4"
            onClick={handleEnable}
          >
            Enable 2FA
          </button>
        ) : (
          <>
            <div className="mb-4">
              <img src="/api/2fa-qr" alt="2FA QR Code" className="mx-auto" />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Scan this QR code with your authenticator app.</p>
            </div>
            <input
              type="text"
              className="w-full p-2 mb-4 border rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Enter code from app"
              value={code}
              onChange={e => setCode(e.target.value)}
            />
            <button
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
              onClick={handleVerify}
            >
              Verify Code
            </button>
          </>
        )}
        {message && <p className="mt-4 text-center text-green-600 dark:text-green-400">{message}</p>}
      </div>
    </div>
  );
};

export default Setup2FA;
