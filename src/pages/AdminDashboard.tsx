import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { collection, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
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
  RefreshCw,
  Mail,
  Calendar,
  UserCheck,
  Clock
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

interface UserData {
  id: string;
  email: string;
  displayName?: string;
  createdAt: any;
  lastLoginAt?: any;
  role?: string;
  photoURL?: string;
}

const AdminDashboard: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'posts' | 'analytics' | 'settings'>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is admin
  const isAdmin = userProfile?.role === 'admin' || user?.email === 'admin@smartkrishi.com';

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([loadStats(), loadUsers()]);
    } catch (error) {
      console.error('Error loading admin data:', error);
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      const usersData: UserData[] = [];
      usersSnapshot.forEach((doc) => {
        usersData.push({
          id: doc.id,
          ...doc.data()
        } as UserData);
      });
      
      // Sort by creation date (newest first)
      usersData.sort((a, b) => {
        const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return dateB - dateA;
      });
      
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadStats = async () => {
    try {
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      const totalUsers = usersSnapshot.size;
      
      // Calculate active users (logged in within last 24 hours)
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      let activeUsers = 0;
      
      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        const lastLogin = userData.lastLoginAt?.toMillis ? userData.lastLoginAt.toMillis() : 0;
        if (lastLogin > oneDayAgo) {
          activeUsers++;
        }
      });
      
      // Try to get posts/comments count (if collections exist)
      let totalPosts = 0;
      let pendingPosts = 0;
      let totalComments = 0;
      
      try {
        const postsRef = collection(db, 'posts');
        const postsSnapshot = await getDocs(postsRef);
        totalPosts = postsSnapshot.size;
        
        postsSnapshot.forEach((doc) => {
          if (doc.data().status === 'pending') {
            pendingPosts++;
          }
        });
        
        const commentsRef = collection(db, 'comments');
        const commentsSnapshot = await getDocs(commentsRef);
        totalComments = commentsSnapshot.size;
      } catch (err) {
        // Collections might not exist yet
        console.log('Posts/Comments collections not found, using default values');
      }
      
      setStats({
        totalUsers,
        activeUsers,
        totalPosts,
        pendingPosts,
        totalComments,
        todayVisitors: activeUsers,
        systemHealth: {
          database: true,
          storage: true,
          auth: true,
        },
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      // Set default stats on error
      setStats({
        totalUsers: 0,
        activeUsers: 0,
        totalPosts: 0,
        pendingPosts: 0,
        totalComments: 0,
        todayVisitors: 0,
        systemHealth: {
          database: false,
          storage: true,
          auth: true,
        },
      });
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
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <XCircle className="h-5 w-5 text-red-500 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error Loading Data</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
        
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
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">User Management</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Total {users.length} registered users
                  </p>
                </div>
              </div>
            </div>
            
            {users.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No users yet</h3>
                <p className="text-gray-600">Users will appear here once they register.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Login
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((userData) => {
                      const createdDate = userData.createdAt?.toDate ? 
                        userData.createdAt.toDate() : new Date();
                      const lastLoginDate = userData.lastLoginAt?.toDate ? 
                        userData.lastLoginAt.toDate() : null;
                      
                      const isActive = lastLoginDate && 
                        (Date.now() - lastLoginDate.getTime()) < (24 * 60 * 60 * 1000);
                      
                      return (
                        <tr key={userData.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                {userData.photoURL ? (
                                  <img 
                                    className="h-10 w-10 rounded-full" 
                                    src={userData.photoURL} 
                                    alt="" 
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                    <span className="text-green-600 font-medium text-sm">
                                      {userData.displayName?.charAt(0).toUpperCase() || 
                                       userData.email?.charAt(0).toUpperCase() || '?'}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {userData.displayName || 'No name'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              <Mail className="h-4 w-4 text-gray-400 mr-2" />
                              {userData.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              userData.role === 'admin' 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {userData.role || 'user'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                              {createdDate.toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {lastLoginDate ? (
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 text-gray-400 mr-2" />
                                {lastLoginDate.toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short'
                                })}
                              </div>
                            ) : (
                              <span className="text-gray-400">Never</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {isActive ? (
                                <>
                                  <UserCheck className="h-3 w-3 mr-1" />
                                  Active
                                </>
                              ) : (
                                'Inactive'
                              )}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Post Management</h3>
            <p className="text-gray-600">Post management features will be available here.</p>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Analytics Dashboard</h3>
              
              {/* User Growth */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">User Statistics</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600 font-medium">Total Users</p>
                        <p className="text-2xl font-bold text-blue-900 mt-1">{stats?.totalUsers || 0}</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600 font-medium">Active Today</p>
                        <p className="text-2xl font-bold text-green-900 mt-1">{stats?.activeUsers || 0}</p>
                      </div>
                      <Activity className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-600 font-medium">Engagement Rate</p>
                        <p className="text-2xl font-bold text-purple-900 mt-1">
                          {stats?.totalUsers ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Recent Activity */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Recent User Activity</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-3">
                    {users.slice(0, 5).map((userData, index) => {
                      const lastLogin = userData.lastLoginAt?.toDate ? 
                        userData.lastLoginAt.toDate() : null;
                      
                      return (
                        <div key={userData.id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                              <span className="text-green-600 font-medium text-xs">
                                {userData.displayName?.charAt(0).toUpperCase() || 
                                 userData.email?.charAt(0).toUpperCase() || '?'}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {userData.displayName || userData.email}
                              </p>
                              <p className="text-xs text-gray-500">
                                {lastLogin ? `Last active: ${lastLogin.toLocaleDateString('en-IN')}` : 'Never logged in'}
                              </p>
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${
                            lastLogin && (Date.now() - lastLogin.getTime()) < (24 * 60 * 60 * 1000)
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {lastLogin && (Date.now() - lastLogin.getTime()) < (24 * 60 * 60 * 1000) ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      );
                    })}
                    
                    {users.length === 0 && (
                      <p className="text-center text-gray-500 py-4">No user activity yet</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* User Roles Distribution */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">User Roles</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Admin Users</span>
                      <span className="text-lg font-bold text-gray-900">
                        {users.filter(u => u.role === 'admin').length}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Regular Users</span>
                      <span className="text-lg font-bold text-gray-900">
                        {users.filter(u => u.role !== 'admin').length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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