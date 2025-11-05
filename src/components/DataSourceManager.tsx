import React, { useState, useEffect } from 'react';
import { 
  Database, Wifi, WifiOff, Settings, AlertCircle, 
  CheckCircle, Clock, TrendingUp, BarChart3, 
  Cloud, Newspaper, Activity, RefreshCw,
  Eye, EyeOff, Key, Server, Globe
} from 'lucide-react';
import realTimeDataService from '../services/realTimeDataService';
import type { DataSourceConfig } from '../services/realTimeDataService';

interface DataSourceStatus {
  status: 'online' | 'offline' | 'degraded';
  lastCheck: string;
  responseTime?: number;
}

const DataSourceManager: React.FC = () => {
  const [dataSources, setDataSources] = useState<Map<string, DataSourceConfig>>(new Map());
  const [healthStatus, setHealthStatus] = useState<Map<string, DataSourceStatus>>(new Map());
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [cacheStats, setCacheStats] = useState<any>(null);

  useEffect(() => {
    loadDataSources();
    checkHealthStatus();
    loadCacheStats();
    
    // Auto-refresh health status every 30 seconds
    const interval = setInterval(checkHealthStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDataSources = () => {
    const sources = realTimeDataService.getDataSources();
    setDataSources(sources);
  };

  const checkHealthStatus = async () => {
    setIsCheckingHealth(true);
    try {
      const health = await realTimeDataService.getDataSourcesHealth();
      setHealthStatus(health);
    } catch (error) {
      console.error('Error checking health status:', error);
    } finally {
      setIsCheckingHealth(false);
    }
  };

  const loadCacheStats = () => {
    const stats = realTimeDataService.getCacheStats();
    setCacheStats(stats);
  };

  const toggleDataSource = (key: string) => {
    const source = dataSources.get(key);
    if (source) {
      const updatedSource = { ...source, enabled: !source.enabled };
      realTimeDataService.configureDataSource(key, updatedSource);
      setDataSources(new Map(dataSources.set(key, updatedSource)));
    }
  };

  const updateApiKey = (key: string, apiKey: string) => {
    realTimeDataService.configureDataSource(key, { apiKey });
    loadDataSources();
  };

  const clearCache = (dataType?: string) => {
    realTimeDataService.clearCache(dataType);
    loadCacheStats();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'offline':
        return <WifiOff className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSourceIcon = (key: string) => {
    if (key.includes('weather')) return <Cloud className="w-5 h-5" />;
    if (key.includes('news')) return <Newspaper className="w-5 h-5" />;
    if (key.includes('market') || key.includes('commodity')) return <TrendingUp className="w-5 h-5" />;
    if (key.includes('gov')) return <Globe className="w-5 h-5" />;
    return <Database className="w-5 h-5" />;
  };

  const formatResponseTime = (time?: number) => {
    if (!time) return 'N/A';
    if (time < 1000) return `${time}ms`;
    return `${(time / 1000).toFixed(1)}s`;
  };

  const getSourceCategory = (key: string) => {
    if (key.includes('weather') || key.includes('imd')) return 'Weather';
    if (key.includes('news')) return 'News';
    if (key.includes('market') || key.includes('commodity') || key.includes('mcx') || key.includes('ncdex')) return 'Market Data';
    if (key.includes('gov') || key.includes('agmark')) return 'Government';
    return 'Other';
  };

  const sourcesByCategory = Array.from(dataSources.entries()).reduce((acc, [key, source]) => {
    const category = getSourceCategory(key);
    if (!acc[category]) acc[category] = [];
    acc[category].push([key, source]);
    return acc;
  }, {} as Record<string, Array<[string, DataSourceConfig]>>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl">
                <Database className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Real-Time Data Sources</h1>
                <p className="text-gray-600 mt-1">Manage and monitor live agricultural data connections</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowApiKeys(!showApiKeys)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  showApiKeys
                    ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {showApiKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{showApiKeys ? 'Hide' : 'Show'} API Keys</span>
              </button>
              
              <button
                onClick={checkHealthStatus}
                disabled={isCheckingHealth}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isCheckingHealth ? 'animate-spin' : ''}`} />
                <span>Check Health</span>
              </button>
            </div>
          </div>
        </div>

        {/* Cache Statistics */}
        {cacheStats && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Activity className="w-6 h-6 mr-2 text-purple-500" />
                Cache Statistics
              </h2>
              <button
                onClick={() => clearCache()}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                Clear All Cache
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-700">{cacheStats.total}</div>
                <div className="text-blue-600">Cached Items</div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-700">
                  {(cacheStats.size / 1024).toFixed(1)}KB
                </div>
                <div className="text-green-600">Cache Size</div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
                <div className="text-sm font-bold text-purple-700">
                  {cacheStats.oldest ? new Date(cacheStats.oldest).toLocaleTimeString() : 'N/A'}
                </div>
                <div className="text-purple-600">Oldest Entry</div>
              </div>
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
                <div className="text-sm font-bold text-orange-700">
                  {cacheStats.newest ? new Date(cacheStats.newest).toLocaleTimeString() : 'N/A'}
                </div>
                <div className="text-orange-600">Newest Entry</div>
              </div>
            </div>
          </div>
        )}

        {/* Data Sources by Category */}
        {Object.entries(sourcesByCategory).map(([category, sources]) => (
          <div key={category} className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <BarChart3 className="w-6 h-6 mr-2 text-green-500" />
              {category} Sources
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {sources.map(([key, source]) => {
                const status = healthStatus.get(key);
                
                return (
                  <div
                    key={key}
                    className={`border-2 rounded-xl p-4 transition-all cursor-pointer ${
                      selectedSource === key
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedSource(selectedSource === key ? null : key)}
                  >
                    {/* Source Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${source.enabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                          {getSourceIcon(key)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{source.name}</h3>
                          <p className="text-sm text-gray-600">Priority: {source.priority}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {status && getStatusIcon(status.status)}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDataSource(key);
                          }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            source.enabled ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              source.enabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Source Details */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">URL:</span>
                        <span className="text-gray-800 font-mono text-xs">{source.url}</span>
                      </div>
                      
                      {status && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Status:</span>
                            <span className={`font-semibold ${
                              status.status === 'online' ? 'text-green-600' :
                              status.status === 'degraded' ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {status.status.toUpperCase()}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Response Time:</span>
                            <span className="text-gray-800">{formatResponseTime(status.responseTime)}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Last Check:</span>
                            <span className="text-gray-800">
                              {new Date(status.lastCheck).toLocaleTimeString()}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* API Key Configuration */}
                    {selectedSource === key && source.apiKey !== undefined && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <Key className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">API Key</span>
                        </div>
                        
                        <div className="flex space-x-2">
                          <input
                            type={showApiKeys ? 'text' : 'password'}
                            value={source.apiKey || ''}
                            onChange={(e) => updateApiKey(key, e.target.value)}
                            placeholder="Enter API key..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            onClick={() => updateApiKey(key, '')}
                            className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Expanded Details */}
                    {selectedSource === key && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Enabled:</span>
                            <span className={`ml-2 ${source.enabled ? 'text-green-600' : 'text-red-600'}`}>
                              {source.enabled ? 'Yes' : 'No'}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Priority:</span>
                            <span className="ml-2 text-gray-800">{source.priority}</span>
                          </div>
                        </div>
                        
                        {source.headers && (
                          <div className="mt-3">
                            <span className="font-medium text-gray-700">Headers:</span>
                            <pre className="mt-1 text-xs bg-gray-100 p-2 rounded">
                              {JSON.stringify(source.headers, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Settings className="w-6 h-6 mr-2 text-blue-500" />
            Quick Actions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => clearCache('market_prices')}
              className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
            >
              <TrendingUp className="w-6 h-6 mx-auto mb-2" />
              <div className="font-semibold">Clear Market Cache</div>
              <div className="text-sm opacity-90">Reset market price data</div>
            </button>
            
            <button
              onClick={() => clearCache('weather')}
              className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
            >
              <Cloud className="w-6 h-6 mx-auto mb-2" />
              <div className="font-semibold">Clear Weather Cache</div>
              <div className="text-sm opacity-90">Reset weather data</div>
            </button>
            
            <button
              onClick={() => clearCache('news')}
              className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all"
            >
              <Newspaper className="w-6 h-6 mx-auto mb-2" />
              <div className="font-semibold">Clear News Cache</div>
              <div className="text-sm opacity-90">Reset news data</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSourceManager;