import React from 'react';
import UserManagement from '../../components/admin/UserManagement';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminUsersPage: React.FC = () => {
    return (
        <AdminLayout>
            <UserManagement />
        </AdminLayout>
    );
};

export default AdminUsersPage;
