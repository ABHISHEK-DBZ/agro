import React from 'react';
import { RefreshCw } from 'lucide-react';

const Weather: React.FC = () => {



  return (
    <div className="flex flex-col justify-center items-center h-64 text-center p-4">
      <RefreshCw className="animate-spin text-green-600" size={48} />
      <span className="ml-2 text-lg mt-4">Loading...</span>
    </div>
  );
};

export default Weather;
