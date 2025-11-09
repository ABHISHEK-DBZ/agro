import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import grievanceService, { Grievance, GrievanceCategory, GrievanceStatus } from '../services/grievanceService';
import toast from 'react-hot-toast';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  FileText, 
  MessageSquare, 
  Filter,
  Search,
  TrendingUp,
  Users,
  BarChart3,
  PieChart,
  Edit,
  Trash2,
  X,
  Save
} from 'lucide-react';

const AdminGrievances: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [filteredGrievances, setFilteredGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<GrievanceStatus | 'All'>('All');
  const [categoryFilter, setCategoryFilter] = useState<GrievanceCategory | 'All'>('All');
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [grievanceToDelete, setGrievanceToDelete] = useState<string | null>(null);
  
  // Modal form state
  const [adminResponse, setAdminResponse] = useState('');
  const [newStatus, setNewStatus] = useState<GrievanceStatus>('Pending');
  const [assignedTo, setAssignedTo] = useState('');

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'Other' as GrievanceCategory,
    description: '',
    location: {
      village: '',
      district: '',
      state: '',
    },
  });

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    reopened: 0,
    byCategory: {} as Record<GrievanceCategory, number>,
    byState: {} as Record<string, number>,
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
    loadGrievances();
    loadStats();
  }, []);

  useEffect(() => {
    filterGrievances();
  }, [grievances, searchTerm, statusFilter, categoryFilter]);

  const loadGrievances = async () => {
    try {
      setLoading(true);
      const data = await grievanceService.getAllGrievances();
      setGrievances(data);
    } catch (error) {
      console.error('Error loading grievances:', error);
      toast.error(i18n.language === 'hi' ? 'शिकायतें लोड करने में त्रुटि' : 'Error loading grievances');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await grievanceService.getGrievanceStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const filterGrievances = () => {
    let filtered = [...grievances];

    if (statusFilter !== 'All') {
      filtered = filtered.filter(g => g.status === statusFilter);
    }

    if (categoryFilter !== 'All') {
      filtered = filtered.filter(g => g.category === categoryFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(g => 
        g.complaint_id.toLowerCase().includes(term) ||
        g.name.toLowerCase().includes(term) ||
        g.description.toLowerCase().includes(term) ||
        g.location.village?.toLowerCase().includes(term) ||
        g.location.district?.toLowerCase().includes(term) ||
        g.location.state?.toLowerCase().includes(term)
      );
    }

    setFilteredGrievances(filtered);
  };

  const handleUpdateGrievance = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedGrievance) return;

    try {
      setLoading(true);
      
      await grievanceService.updateGrievanceStatus(
        selectedGrievance.complaint_id,
        newStatus,
        adminResponse,
        assignedTo
      );

      toast.success(
        i18n.language === 'hi' 
          ? 'शिकायत सफलतापूर्वक अपडेट हुई!' 
          : 'Grievance updated successfully!'
      );

      setShowModal(false);
      setSelectedGrievance(null);
      setAdminResponse('');
      setAssignedTo('');
      
      await loadGrievances();
      await loadStats();
    } catch (error) {
      console.error('Error updating grievance:', error);
      toast.error(i18n.language === 'hi' ? 'अपडेट करने में त्रुटि' : 'Error updating grievance');
    } finally {
      setLoading(false);
    }
  };

  const openUpdateModal = (grievance: Grievance) => {
    setSelectedGrievance(grievance);
    setNewStatus(grievance.status);
    setAdminResponse(grievance.admin_response || '');
    setAssignedTo(grievance.assigned_to || '');
    setShowModal(true);
  };

  const openEditModal = (grievance: Grievance) => {
    setSelectedGrievance(grievance);
    setEditForm({
      name: grievance.name,
      email: grievance.email || '',
      phone: grievance.phone || '',
      category: grievance.category,
      description: grievance.description,
      location: {
        village: grievance.location.village || '',
        district: grievance.location.district || '',
        state: grievance.location.state || '',
      },
    });
    setShowEditModal(true);
  };

  const handleEditGrievance = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedGrievance) return;

    try {
      setLoading(true);
      
      await grievanceService.updateGrievance(selectedGrievance.complaint_id, {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        category: editForm.category,
        description: editForm.description,
        location: editForm.location,
      });

      toast.success(
        i18n.language === 'hi' 
          ? 'शिकायत सफलतापूर्वक संपादित हुई!' 
          : 'Grievance edited successfully!'
      );

      setShowEditModal(false);
      setSelectedGrievance(null);
      
      await loadGrievances();
      await loadStats();
    } catch (error) {
      console.error('Error editing grievance:', error);
      toast.error(i18n.language === 'hi' ? 'संपादन में त्रुटि' : 'Error editing grievance');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (complaintId: string) => {
    setGrievanceToDelete(complaintId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteGrievance = async () => {
    if (!grievanceToDelete) return;

    try {
      setLoading(true);
      
      await grievanceService.deleteGrievance(grievanceToDelete);

      toast.success(
        i18n.language === 'hi' 
          ? 'शिकायत सफलतापूर्वक हटाई गई!' 
          : 'Grievance deleted successfully!'
      );

      setShowDeleteConfirm(false);
      setGrievanceToDelete(null);
      
      await loadGrievances();
      await loadStats();
    } catch (error) {
      console.error('Error deleting grievance:', error);
      toast.error(i18n.language === 'hi' ? 'हटाने में त्रुटि' : 'Error deleting grievance');
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

  const calculateResolutionTime = (createdAt: Date, resolvedAt: Date) => {
    const diff = resolvedAt.getTime() - createdAt.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    return days > 0 ? `${days} days` : `${hours} hours`;
  };

  if (loading && grievances.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{i18n.language === 'hi' ? 'लोड हो रहा है...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            {i18n.language === 'hi' ? '🎯 शिकायत प्रबंधन - एडमिन डैशबोर्ड' : '🎯 Grievance Management - Admin Dashboard'}
          </h1>
          <p className="text-gray-600 mt-2">
            {i18n.language === 'hi' 
              ? 'सभी शिकायतों को देखें, प्रबंधित करें और हल करें' 
              : 'View, manage, and resolve all grievances'}
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">{i18n.language === 'hi' ? 'कुल शिकायतें' : 'Total Complaints'}</p>
                <p className="text-3xl font-bold mt-2">{stats.total}</p>
              </div>
              <FileText className="w-12 h-12 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">{i18n.language === 'hi' ? 'लंबित' : 'Pending'}</p>
                <p className="text-3xl font-bold mt-2">{stats.pending}</p>
              </div>
              <Clock className="w-12 h-12 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">{i18n.language === 'hi' ? 'प्रगति में' : 'In Progress'}</p>
                <p className="text-3xl font-bold mt-2">{stats.inProgress}</p>
              </div>
              <AlertCircle className="w-12 h-12 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">{i18n.language === 'hi' ? 'हल हुए' : 'Resolved'}</p>
                <p className="text-3xl font-bold mt-2">{stats.resolved}</p>
              </div>
              <CheckCircle className="w-12 h-12 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">{i18n.language === 'hi' ? 'पुनः खोले गए' : 'Reopened'}</p>
                <p className="text-3xl font-bold mt-2">{stats.reopened}</p>
              </div>
              <TrendingUp className="w-12 h-12 opacity-80" />
            </div>
          </div>
        </div>

        {/* Category Analytics */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <PieChart className="w-6 h-6 text-green-600" />
            {i18n.language === 'hi' ? 'श्रेणी के अनुसार शिकायतें' : 'Complaints by Category'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(stats.byCategory).map(([category, count]) => (
              <div key={category} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600">
                  {categoryTranslations[category as GrievanceCategory][i18n.language as 'hi' | 'en']}
                </p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{count}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-2" />
                {i18n.language === 'hi' ? 'खोजें' : 'Search'}
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={i18n.language === 'hi' ? 'ID, नाम, या स्थान खोजें...' : 'Search by ID, name, or location...'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-2" />
                {i18n.language === 'hi' ? 'स्थिति' : 'Status'}
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as GrievanceStatus | 'All')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="All">{i18n.language === 'hi' ? 'सभी स्थिति' : 'All Status'}</option>
                {Object.keys(statusTranslations).map((status) => (
                  <option key={status} value={status}>
                    {statusTranslations[status as GrievanceStatus][i18n.language as 'hi' | 'en']}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <BarChart3 className="w-4 h-4 inline mr-2" />
                {i18n.language === 'hi' ? 'श्रेणी' : 'Category'}
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as GrievanceCategory | 'All')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="All">{i18n.language === 'hi' ? 'सभी श्रेणियाँ' : 'All Categories'}</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {categoryTranslations[cat][i18n.language as 'hi' | 'en']}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Grievances List */}
        <div className="space-y-4">
          {filteredGrievances.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {i18n.language === 'hi' ? 'कोई शिकायत नहीं मिली' : 'No Complaints Found'}
              </h3>
              <p className="text-gray-500">
                {i18n.language === 'hi' 
                  ? 'चयनित फ़िल्टर के लिए कोई शिकायत नहीं है' 
                  : 'No complaints match the selected filters'}
              </p>
            </div>
          ) : (
            filteredGrievances.map((grievance) => (
              <div key={grievance.complaint_id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-lg font-bold text-gray-800">
                        {grievance.complaint_id}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${getStatusColor(grievance.status)}`}>
                        {getStatusIcon(grievance.status)}
                        {statusTranslations[grievance.status][i18n.language as 'hi' | 'en']}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        {categoryTranslations[grievance.category][i18n.language as 'hi' | 'en']}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{formatDate(grievance.created_at)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openUpdateModal(grievance)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      {i18n.language === 'hi' ? 'प्रतिक्रिया दें' : 'Respond'}
                    </button>
                    <button
                      onClick={() => openEditModal(grievance)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      {i18n.language === 'hi' ? 'संपादित' : 'Edit'}
                    </button>
                    <button
                      onClick={() => confirmDelete(grievance.complaint_id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      {i18n.language === 'hi' ? 'हटाएं' : 'Delete'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-600">{i18n.language === 'hi' ? 'किसान का नाम:' : 'Farmer Name:'}</p>
                    <p className="text-sm text-gray-800">{grievance.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">{i18n.language === 'hi' ? 'संपर्क:' : 'Contact:'}</p>
                    <p className="text-sm text-gray-800">{grievance.phone || grievance.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">{i18n.language === 'hi' ? 'स्थान:' : 'Location:'}</p>
                    <p className="text-sm text-gray-800">
                      {[grievance.location.village, grievance.location.district, grievance.location.state]
                        .filter(Boolean)
                        .join(', ') || 'N/A'}
                    </p>
                  </div>
                  {grievance.assigned_to && (
                    <div>
                      <p className="text-sm font-semibold text-gray-600">{i18n.language === 'hi' ? 'आवंटित:' : 'Assigned To:'}</p>
                      <p className="text-sm text-gray-800">{grievance.assigned_to}</p>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-600 mb-1">{i18n.language === 'hi' ? 'विवरण:' : 'Description:'}</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{grievance.description}</p>
                </div>

                {grievance.admin_response && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
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
                  <div className="mt-4 text-sm text-green-600 font-medium">
                    ✓ {i18n.language === 'hi' ? 'हल हुआ: ' : 'Resolved: '}{formatDate(grievance.resolved_at)}
                    {' '}({calculateResolutionTime(grievance.created_at, grievance.resolved_at)})
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Update Modal */}
      {showModal && selectedGrievance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {i18n.language === 'hi' ? 'शिकायत प्रबंधित करें' : 'Manage Complaint'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>{i18n.language === 'hi' ? 'शिकायत ID:' : 'Complaint ID:'}</strong> {selectedGrievance.complaint_id}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>{i18n.language === 'hi' ? 'किसान:' : 'Farmer:'}</strong> {selectedGrievance.name}
                </p>
              </div>

              <form onSubmit={handleUpdateGrievance} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {i18n.language === 'hi' ? 'स्थिति *' : 'Status *'}
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as GrievanceStatus)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  >
                    {Object.keys(statusTranslations).map((status) => (
                      <option key={status} value={status}>
                        {statusTranslations[status as GrievanceStatus][i18n.language as 'hi' | 'en']}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {i18n.language === 'hi' ? 'आवंटित करें' : 'Assign To'}
                  </label>
                  <input
                    type="text"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    placeholder={i18n.language === 'hi' ? 'विशेषज्ञ या टीम का नाम' : 'Expert or team name'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {i18n.language === 'hi' ? 'प्रशासन की प्रतिक्रिया *' : 'Admin Response *'}
                  </label>
                  <textarea
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder={i18n.language === 'hi' ? 'किसान को प्रतिक्रिया लिखें...' : 'Write response to farmer...'}
                    required
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
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
                      ? (i18n.language === 'hi' ? 'सेव हो रहा है...' : 'Saving...') 
                      : (i18n.language === 'hi' ? 'अपडेट करें' : 'Update')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedGrievance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Edit className="w-6 h-6 text-green-600" />
                  {i18n.language === 'hi' ? 'शिकायत संपादित करें' : 'Edit Complaint'}
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>{i18n.language === 'hi' ? 'शिकायत ID:' : 'Complaint ID:'}</strong> {selectedGrievance.complaint_id}
                </p>
              </div>

              <form onSubmit={handleEditGrievance} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {i18n.language === 'hi' ? 'किसान का नाम *' : 'Farmer Name *'}
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
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
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {i18n.language === 'hi' ? 'फोन' : 'Phone'}
                    </label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {i18n.language === 'hi' ? 'श्रेणी *' : 'Category *'}
                    </label>
                    <select
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value as GrievanceCategory })}
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {i18n.language === 'hi' ? 'विवरण *' : 'Description *'}
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
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
                      value={editForm.location.village}
                      onChange={(e) => setEditForm({ 
                        ...editForm, 
                        location: { ...editForm.location, village: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {i18n.language === 'hi' ? 'जिला' : 'District'}
                    </label>
                    <input
                      type="text"
                      value={editForm.location.district}
                      onChange={(e) => setEditForm({ 
                        ...editForm, 
                        location: { ...editForm.location, district: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {i18n.language === 'hi' ? 'राज्य' : 'State'}
                    </label>
                    <input
                      type="text"
                      value={editForm.location.state}
                      onChange={(e) => setEditForm({ 
                        ...editForm, 
                        location: { ...editForm.location, state: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    {i18n.language === 'hi' ? 'रद्द करें' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {loading 
                      ? (i18n.language === 'hi' ? 'सेव हो रहा है...' : 'Saving...') 
                      : (i18n.language === 'hi' ? 'सहेजें' : 'Save')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  {i18n.language === 'hi' ? 'शिकायत हटाएं?' : 'Delete Complaint?'}
                </h2>
              </div>

              <p className="text-gray-600 mb-6">
                {i18n.language === 'hi' 
                  ? 'क्या आप वाकई इस शिकायत को हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।' 
                  : 'Are you sure you want to delete this complaint? This action cannot be undone.'}
              </p>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setGrievanceToDelete(null);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {i18n.language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  onClick={handleDeleteGrievance}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {loading 
                    ? (i18n.language === 'hi' ? 'हटा रहे हैं...' : 'Deleting...') 
                    : (i18n.language === 'hi' ? 'हटाएं' : 'Delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGrievances;
