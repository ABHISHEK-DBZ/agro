import React from 'react';

const VerifyEmail: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded shadow w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-green-700 dark:text-green-400">Verify Your Email</h2>
        <p className="mb-4 text-gray-700 dark:text-gray-200">A verification link has been sent to your email address. Please verify your email to continue using Smart Krishi Sahayak.</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Didn't receive the email? Check your spam folder or <span className="text-blue-600 dark:text-blue-400 underline cursor-pointer">resend verification</span>.</p>
      </div>
    </div>
  );
};

export default VerifyEmail;
