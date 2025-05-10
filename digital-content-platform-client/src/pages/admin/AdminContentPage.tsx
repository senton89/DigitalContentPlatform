import React from 'react';
import ContentManagement from '../../components/admin/ContentManagement';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminContentPage: React.FC = () => {
    return (
        <AdminLayout>
            <ContentManagement />
        </AdminLayout>
    );
};

export default AdminContentPage;
