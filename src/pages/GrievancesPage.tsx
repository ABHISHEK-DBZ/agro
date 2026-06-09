import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import grievanceService, { Grievance, GrievanceCategory, GrievanceStatus } from '../services/grievanceService';
import profileService from '../services/profileService';
import toast from 'react-hot-toast';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  FileText, 
  MessageSquare, 
  Upload,
  X,
  Filter,
  Search
} from 'lucide-react';

const GrievancesPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [filteredGrievances, setFilteredGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<GrievanceStatus | 'All'>('All');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'Other' as GrievanceCategory,
    description: '',
    village: '',
    district: '',
    state: '',
    imageFile: null as File | null,
  });

  const categories: GrievanceCategory[] = [
    'Crop Disease',
    'Market Price',
    'Government Scheme',
    'Weather Information',
    'Irrigation',
    'Pest Control',
    'Seed Quality',
    'App Issue',
    'Other',
  ];

  const categoryTranslations: Record<GrievanceCategory, { hi: string; en: string }> = {
    'Crop Disease': { hi: 'फसल रोग', en: 'Crop Disease' },
    'Market Price': { hi: 'बाजार मूल्य', en: 'Market Price' },
    'Government Scheme': { hi: 'सरकारी योजना', en: 'Government Scheme' },
    'Weather Information': { hi: 'मौसम जानकारी', en: 'Weather Information' },
    'Irrigation': { hi: 'सिंचाई', en: 'Irrigation' },
    'Pest Control': { hi: 'कीट नियंत्रण', en: 'Pest Control' },
    'Seed Quality': { hi: 'बीज गुणवत्ता', en: 'Seed Quality' },
    'App Issue': { hi: 'ऐप समस्या', en: 'App Issue' },
    'Other': { hi: 'अन्य', en: 'Other' },
  };

  const statusTranslations: Record<GrievanceStatus, { hi: string; en: string }> = {
    'Pending': { hi: 'लंबित', en: 'Pending' },
    'In Progress': { hi: 'प्रगति में', en: 'In Progress' },
    'Resolved': { hi: 'हल हो गया', en: 'Resolved' },
    'Reopened': { hi: 'पुनः खोला गया', en: 'Reopened' },
  };

  useEffect(() => {
    let mounted = true;

    if (user) {
      loadUserProfile();
      
      // Subscribe to grievances with cleanup
      try {
        const unsubscribe = grievanceService.subscribeToUserGrievances(user.uid, (data) => {
          if (mounted) {
            setGrievances(data);
            setLoading(false);
          }
        });

        return () => {
          mounted = false;
          unsubscribe();
        };
      } catch (error) {
        console.error('Error subscribing to grievances:', error);
        if (mounted) {
          setLoading(false);
          toast.error(i18n.language === 'hi' ? 'शिकायतें लोड करने में त्रुटि' : 'Error loading grievances');
        }
      }
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    filterGrievances();
  }, [grievances, searchTerm, statusFilter]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    try {
      const profile = await profileService.getUserProfile(user.uid);
      if (profile) {
        setFormData(prev => ({
          ...prev,
          name: profile.name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          village: profile.village || '',
          district: profile.district || '',
          state: profile.state || '',
        }));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const filterGrievances = () => {
    let filtered = [...grievances];

    if (statusFilter !== 'All') {
      filtered = filtered.filter(g => g.status === statusFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(g => 
        g.complaint_id.toLowerCase().includes(term) ||
        g.category.toLowerCase().includes(term) ||
        g.description.toLowerCase().includes(term)
      );
    }

    setFilteredGrievances(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error(i18n.language === 'hi' ? 'कृपया पहले लॉगिन करें' : 'Please login first');
      return;
    }

    if (!formData.description.trim()) {
      toast.error(i18n.language === 'hi' ? 'कृपया शिकायत का विवरण दें' : 'Please provide complaint description');
      return;
    }

    try {
      setLoading(true);

      const complaintId = await grievanceService.submitGrievance(user.uid, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        category: formData.category,
        description: formData.description,
        location: {
          village: formData.village,
          district: formData.district,
          state: formData.state,
        },
      });

      toast.success(
        i18n.language === 'hi' 
          ? `शिकायत सफलतापूर्वक दर्ज हुई! शिकायत ID: ${complaintId}` 
          : `Complaint registered successfully! Complaint ID: ${complaintId}`
      );

      // Reset form
      setFormData(prev => ({
        ...prev,
        category: 'Other',
        description: '',
        imageFile: null,
      }));
      setShowForm(false);
    } catch (error) {
      console.error('Error submitting grievance:', error);
      toast.error(i18n.language === 'hi' ? 'शिकायत दर्ज करने में त्रुटि' : 'Error submitting complaint');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: GrievanceStatus) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Resolved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Reopened':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: GrievanceStatus) => {
    switch (status) {
      case 'Pending':
        return <Clock className="w-4 h-4" />;
      case 'In Progress':
        return <AlertCircle className="w-4 h-4" />;
      case 'Resolved':
        return <CheckCircle className="w-4 h-4" />;
      case 'Reopened':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(i18n.language === 'hi' ? 'hi-IN' : 'en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading && grievances.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-[#F9F9F6] to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-950 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">{i18n.language === 'hi' ? 'लोड हो रहा है...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-[#F9F9F6] to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-950 py-8 px-4 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="card light-mode dark-mode bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/40 dark:border-slate-700/50">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                {i18n.language === 'hi' ? '🎯 शिकायत प्रबंधन' : '🎯 Grievance Management'}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                {i18n.language === 'hi' 
                  ? 'अपनी शिकायतें दर्ज करें और उनकी स्थिति ट्रैक करें' 
                  : 'Register your complaints and track their status'}
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition shadow-md"
            >
              {showForm 
                ? (i18n.language === 'hi' ? '✕ बंद करें' : '✕ Close')
                : (i18n.language === 'hi' ? '+ नई शिकायत' : '+ New Complaint')}
            </button>
          </div>
        </div>

        {/* New Complaint Form */}
        {showForm && (
          <div className="card light-mode dark-mode bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/40 dark:border-slate-700/50">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              {i18n.language === 'hi' ? '📝 नई शिकायत दर्ज करें' : '📝 Register New Complaint'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {i18n.language === 'hi' ? 'नाम *' : 'Name *'}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {i18n.language === 'hi' ? 'ईमेल' : 'Email'}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {i18n.language === 'hi' ? 'फोन' : 'Phone'}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {i18n.language === 'hi' ? 'श्रेणी *' : 'Category *'}
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as GrievanceCategory })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {categoryTranslations[cat][i18n.language as 'hi' | 'en']}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {i18n.language === 'hi' ? 'शिकायत का विवरण *' : 'Complaint Description *'}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder={i18n.language === 'hi' ? 'अपनी शिकायत का विस्तार से वर्णन करें...' : 'Describe your complaint in detail...'}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {i18n.language === 'hi' ? 'गाँव' : 'Village'}
                  </label>
                  <input
                    type="text"
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {i18n.language === 'hi' ? 'जिला' : 'District'}
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {i18n.language === 'hi' ? 'राज्य' : 'State'}
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {i18n.language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50"
                >
                  {loading 
                    ? (i18n.language === 'hi' ? 'सबमिट हो रहा है...' : 'Submitting...') 
                    : (i18n.language === 'hi' ? 'शिकायत दर्ज करें' : 'Submit Complaint')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="card light-mode dark-mode bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/40 dark:border-slate-700/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Search className="w-4 h-4 inline mr-2" />
                {i18n.language === 'hi' ? 'खोजें' : 'Search'}
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={i18n.language === 'hi' ? 'शिकायत ID या विवरण खोजें...' : 'Search by ID or description...'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Filter className="w-4 h-4 inline mr-2" />
                {i18n.language === 'hi' ? 'स्थिति फ़िल्टर' : 'Status Filter'}
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as GrievanceStatus | 'All')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-transparent"
              >
                <option value="All">{i18n.language === 'hi' ? 'सभी' : 'All'}</option>
                <option value="Pending">{statusTranslations['Pending'][i18n.language as 'hi' | 'en']}</option>
                <option value="In Progress">{statusTranslations['In Progress'][i18n.language as 'hi' | 'en']}</option>
                <option value="Resolved">{statusTranslations['Resolved'][i18n.language as 'hi' | 'en']}</option>
                <option value="Reopened">{statusTranslations['Reopened'][i18n.language as 'hi' | 'en']}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Grievances List */}
        <div className="space-y-4">
          {filteredGrievances.length === 0 ? (
            <div className="card light-mode dark-mode bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-xl p-12 text-center border border-white/40 dark:border-slate-700/50">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
                {i18n.language === 'hi' ? 'कोई शिकायत नहीं मिली' : 'No Complaints Found'}
              </h3>
              <p className="text-gray-500">
                {i18n.language === 'hi' 
                  ? 'अपनी पहली शिकायत दर्ज करने के लिए ऊपर "नई शिकायत" बटन पर क्लिक करें' 
                  : 'Click on "New Complaint" button above to register your first complaint'}
              </p>
            </div>
          ) : (
            filteredGrievances.map((grievance) => (
              <div key={grievance.complaint_id} className="card light-mode dark-mode bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-xl p-6 hover:shadow-2xl transition border border-white/40 dark:border-slate-700/50">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                      {i18n.language === 'hi' ? 'शिकायत ID: ' : 'Complaint ID: '}{grievance.complaint_id}
                    </h3>
                    <p className="text-sm text-gray-500">{formatDate(grievance.created_at)}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold border flex items-center gap-2 ${getStatusColor(grievance.status)}`}>
                    {getStatusIcon(grievance.status)}
                    {statusTranslations[grievance.status][i18n.language as 'hi' | 'en']}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-600">
                      {i18n.language === 'hi' ? 'श्रेणी:' : 'Category:'}
                    </span>
                    <span className="text-sm text-gray-800">
                      {categoryTranslations[grievance.category][i18n.language as 'hi' | 'en']}
                    </span>
                  </div>

                  <div>
                    <span className="text-sm font-semibold text-gray-600">
                      {i18n.language === 'hi' ? 'विवरण:' : 'Description:'}
                    </span>
                    <p className="text-sm text-gray-700 mt-1">{grievance.description}</p>
                  </div>

                  {grievance.location && (grievance.location.village || grievance.location.district || grievance.location.state) && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-600">
                        {i18n.language === 'hi' ? 'स्थान:' : 'Location:'}
                      </span>
                      <span className="text-sm text-gray-800">
                        {[grievance.location.village, grievance.location.district, grievance.location.state]
                          .filter(Boolean)
                          .join(', ')}
                      </span>
                    </div>
                  )}

                  {grievance.admin_response && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-5 h-5 text-blue-600 mt-1" />
                        <div>
                          <p className="text-sm font-semibold text-blue-900">
                            {i18n.language === 'hi' ? 'प्रशासन की प्रतिक्रिया:' : 'Admin Response:'}
                          </p>
                          <p className="text-sm text-blue-800 mt-1">{grievance.admin_response}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {grievance.resolved_at && (
                    <div className="text-sm text-green-600 font-medium">
                      {i18n.language === 'hi' ? '✓ हल हुआ: ' : '✓ Resolved: '}{formatDate(grievance.resolved_at)}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default GrievancesPage;
