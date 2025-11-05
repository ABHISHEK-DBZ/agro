import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  FileText, 
  Activity, 
  TrendingUp, 
  Eye, 
  CheckCircle, 
  XCircle,
  BarChart3,
  Settings,
  Shield,
  Database,
  Camera,
  RefreshCw
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalPosts: number;
  pendingPosts: number;
  totalComments: number;
  todayVisitors: number;
  systemHealth: {
    database: boolean;
    storage: boolean;
    auth: boolean;
  };
}

const AdminDashboard: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'posts' | 'analytics' | 'settings'>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Check if user is admin
  const isAdmin = userProfile?.role === 'admin' || user?.email === 'admin@smartkrishisahayak.com';

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      await loadStats();
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Mock data for now
      setStats({
        totalUsers: 150,
        activeUsers: 45,
        totalPosts: 89,
        pendingPosts: 12,
        totalComments: 234,
        todayVisitors: 67,
        systemHealth: {
          database: true,
          storage: true,
          auth: true,
        },
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadAdminData();
    setRefreshing(false);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 text-green-500 animate-spin mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage Smart Krishi Sahayak system</p>
            </div>
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              <RefreshCw className={`-ml-1 mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'posts', label: 'Posts', icon: FileText },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats?.totalUsers || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Activity className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats?.activeUsers || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Posts</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats?.totalPosts || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Eye className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Today's Visitors</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats?.todayVisitors || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* System Health */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">System Health</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: 'Database', status: stats?.systemHealth.database, icon: Database },
                  { name: 'Storage', status: stats?.systemHealth.storage, icon: Camera },
                  { name: 'Authentication', status: stats?.systemHealth.auth, icon: Shield },
                ].map((service) => (
                  <div key={service.name} className="flex items-center p-4 border rounded-lg">
                    <service.icon className="h-5 w-5 text-gray-500 mr-3" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{service.name}</p>
                      <div className="flex items-center mt-1">
                        {service.status ? (
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span className={`text-sm ${service.status ? 'text-green-600' : 'text-red-600'}`}>
                          {service.status ? 'Healthy' : 'Issues Detected'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Approvals */}
            {stats?.pendingPosts && stats.pendingPosts > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Pending Approvals</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    {stats.pendingPosts} pending
                  </span>
                </div>
                <p className="text-gray-600">
                  There are {stats.pendingPosts} posts waiting for your review.
                </p>
                <button
                  onClick={() => setActiveTab('posts')}
                  className="mt-3 text-green-600 hover:text-green-700 font-medium text-sm"
                >
                  Review Posts →
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">User Management</h3>
            <p className="text-gray-600">User management features will be available here.</p>
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Post Management</h3>
            <p className="text-gray-600">Post management features will be available here.</p>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Analytics</h3>
            <p className="text-gray-600">Analytics dashboard will be available here.</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">System Settings</h3>
            <p className="text-gray-600">System configuration options will be available here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;