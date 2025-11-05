import React from 'react';
import { Sprout } from 'lucide-react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg">
            <Sprout className="w-10 h-10 text-green-600 animate-pulse" />
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Smart Krishi Sahayak</h2>
            <p className="text-gray-600">कृपया प्रतीक्षा करें...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;