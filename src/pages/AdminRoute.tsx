import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminPanel from '../components/admin/AdminPanel';

const AdminRoute: React.FC = () => {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!userProfile || userProfile.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <Routes>
      <Route path="/*" element={<AdminPanel />} />
    </Routes>
  );
};

export default AdminRoute;