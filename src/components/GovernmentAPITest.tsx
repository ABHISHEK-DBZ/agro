import React, { useState } from 'react';
import { Database, Play, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import realTimeDataService from '../services/realTimeDataService';

const GovernmentAPITest: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testGovernmentAPI = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🏛️ Starting Government API test...');
      const marketData = await realTimeDataService.fetchData('market_prices', true);
      
      console.log('✅ Government API test result:', marketData);
      setResult(marketData);
    } catch (err: any) {
      console.error('❌ Government API test failed:', err);
      setError(err.message || 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <Database className="mr-3 text-blue-600" size={28} />
          Government API Test Dashboard
        </h1>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Test the integration with Government of India Market Prices API (data.gov.in)
          </p>
          
          <button
            onClick={testGovernmentAPI}
            disabled={isLoading}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader className="animate-spin mr-2" size={20} />
            ) : (
              <Play className="mr-2" size={20} />
            )}
            {isLoading ? 'Testing API...' : 'Test Government API'}
          </button>
        </div>

        {/* API Configuration */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">API Configuration</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Endpoint:</strong> https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070</p>
            <p><strong>API Key:</strong> 579b464db66ec23bdd0000015d8d13a03c6845da63e8d4bfe1ac5148</p>
            <p><strong>Format:</strong> JSON</p>
            <p><strong>Description:</strong> Current Daily Price of Various Commodities from Various Markets (Mandi)</p>
          </div>
        </div>

        {/* Results */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center text-red-700">
              <AlertCircle className="mr-2" size={20} />
              <span className="font-medium">API Test Failed</span>
            </div>
            <p className="text-red-600 mt-2">{error}</p>
          </div>
        )}

        {result && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center text-green-700 mb-3">
              <CheckCircle className="mr-2" size={20} />
              <span className="font-medium">API Test Successful</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-green-600">{result.length}</div>
                <div className="text-sm text-gray-600">Market Records</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-blue-600">
                  {new Set(result.map((r: any) => r.commodity)).size}
                </div>
                <div className="text-sm text-gray-600">Commodities</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-purple-600">
                  {new Set(result.map((r: any) => r.state)).size}
                </div>
                <div className="text-sm text-gray-600">States</div>
              </div>
            </div>

            {/* Sample Data */}
            <div className="bg-white rounded-lg border p-4">
              <h4 className="font-medium text-gray-800 mb-3">Sample Market Data</h4>
              <div className="space-y-3">
                {result.slice(0, 5).map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-800">{item.commodity}</div>
                      <div className="text-sm text-gray-600">{item.market}, {item.state}</div>
                      <div className="text-xs text-gray-500">Source: {item.source}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">₹{item.price.current.toLocaleString()}</div>
                      <div className={`text-sm ${item.price.changePercent > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.price.changePercent > 0 ? '+' : ''}{item.price.changePercent.toFixed(2)}%
                      </div>
                      <div className="text-xs text-gray-500">{item.volume} tonnes</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Data Sources Status */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Data Sources Priority</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>1. Government of India API (data.gov.in)</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Priority 1</span>
            </div>
            <div className="flex items-center justify-between">
              <span>2. AGMARKNET</span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">Priority 2</span>
            </div>
            <div className="flex items-center justify-between">
              <span>3. Enhanced Mock Data</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">Fallback</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GovernmentAPITest;