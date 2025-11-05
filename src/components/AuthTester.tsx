import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { User } from 'lucide-react';

const AuthTester: React.FC = () => {
  const { user, loginWithGoogle, logout, loading } = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testGoogleLogin = async () => {
    try {
      addTestResult('🔄 Starting Google login test...');
      await loginWithGoogle();
      addTestResult('✅ Google login successful!');
    } catch (error: any) {
      addTestResult(`❌ Google login failed: ${error.message}`);
    }
  };

  const testLogout = async () => {
    try {
      addTestResult('🔄 Testing logout...');
      await logout();
      addTestResult('✅ Logout successful!');
    } catch (error: any) {
      addTestResult(`❌ Logout failed: ${error.message}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <User className="h-8 w-8 text-green-600" />
        <h2 className="text-2xl font-bold text-gray-800">Authentication Test Console</h2>
      </div>

      {/* Current Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Current Status</h3>
        <div className="space-y-2">
          <p><strong>Environment:</strong> {import.meta.env.MODE}</p>
          <p><strong>Hostname:</strong> {window.location.hostname}</p>
          <p><strong>User Status:</strong> {user ? '✅ Logged In' : '❌ Not Logged In'}</p>
          <p><strong>Loading:</strong> {loading ? '🔄 Loading...' : '✅ Ready'}</p>
          {user && (
            <div className="mt-2 p-2 bg-green-50 rounded">
              <p><strong>User Email:</strong> {user.email}</p>
              <p><strong>Display Name:</strong> {user.displayName}</p>
            </div>
          )}
        </div>
      </div>

      {/* Test Controls */}
      <div className="mb-6 space-y-4">
        <h3 className="text-lg font-semibold">Test Controls</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={testGoogleLogin}
            disabled={loading || !!user}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🔐 Test Google Login
          </button>
          
          <button
            onClick={testLogout}
            disabled={loading || !user}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🚪 Test Logout
          </button>
          
          <button
            onClick={clearResults}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            🗑️ Clear Results
          </button>
        </div>
      </div>

      {/* Test Results */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Test Results</h3>
        <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
          {testResults.length === 0 ? (
            <p className="text-gray-500">No test results yet. Click a test button to start.</p>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className="mb-1">
                {result}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Development Notes */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2">Development Notes</h4>
        <ul className="text-yellow-700 text-sm space-y-1">
          <li>• In development mode, Google login uses redirect method to avoid popup issues</li>
          <li>• Cross-Origin-Opener-Policy warnings are normal for localhost development</li>
          <li>• After successful redirect, the page will automatically navigate to dashboard</li>
          <li>• For production deployment, popup method will be used as primary</li>
        </ul>
      </div>
    </div>
  );
};

export default AuthTester;