import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import LoadingSpinner from './components/common/LoadingSpinner';
import ProtectedRoute from './components/auth/ProtectedRoute';
import './App.css';

// Ленивая загрузка страниц
const SharedContentUploadPage = lazy(() => import('./pages/SharedContentUploadPage'));
const SharedContentListPage = lazy(() => import('./pages/SharedContentListPage'));
const SharedContentViewPage = lazy(() => import('./pages/SharedContentViewPage'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const CatalogPage = lazy(() => import('./pages/CatalogPage'));
const SearchResultsPage = lazy(() => import('./pages/SearchResultsPage'));
const DigitalItemDetailsPage = lazy(() => import('./pages/DigitalItemDetailsPage'));
const CreateItemPage = lazy(() => import('./pages/CreateItemPage'));
const EditItemPage = lazy(() => import('./pages/EditItemPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminContentPage = lazy(() => import('./pages/admin/AdminContentPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const UnauthorizedPage = lazy(() => import('./pages/UnauthorizedPage'));


const App: React.FC = () => {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="/items/:id" element={<DigitalItemDetailsPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="/upload" element={<SharedContentUploadPage />} />
            <Route path="/shared" element={<SharedContentListPage />} />
            <Route path="/shared/:id" element={<SharedContentViewPage />}/>

            {/* Защищенные маршруты */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<UserProfilePage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/create-item" element={<CreateItemPage />} />
              <Route path="/edit-item/:id" element={<EditItemPage />} />
            </Route>

            {/* Защищенные маршруты для администраторов */}
            <Route element={<ProtectedRoute requiredRole="Admin" />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/content" element={<AdminContentPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default App;
