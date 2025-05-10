import React from 'react';
import Dashboard from '../../components/admin/Dashboard';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminDashboardPage: React.FC = () => {
    return (
        <AdminLayout>
            <Dashboard />
        </AdminLayout>
    );
};

export default AdminDashboardPage;