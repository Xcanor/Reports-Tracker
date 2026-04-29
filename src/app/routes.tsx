import { createBrowserRouter, Navigate } from 'react-router';
import type { ReactNode } from 'react';
import { useApp } from './context/AppContext';
import LoginPage from './pages/LoginPage';
import AppLayout from './components/AppLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import Templates from './pages/admin/Templates';
import TemplateEditor from './pages/admin/TemplateEditor';
import SubmissionsPage from './pages/admin/SubmissionsPage';
import SubmissionsManagementPage from './pages/admin/SubmissionsManagementPage';
import UsersPage from './pages/admin/UsersPage';
import UsersEditPage from './pages/admin/UsersEditPage';
import ExcelUploadPage from './pages/admin/ExcelUploadPage';
import SettingsPage from './pages/admin/SettingsPage';
import UserDashboard from './pages/user/UserDashboard';
import ReportsListPage from './pages/user/ReportsListPage';
import ReportSubmission from './pages/user/ReportSubmission';

// Protect admin routes
function AdminGuard({ children }: { children: ReactNode }) {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/" replace />;
  if (currentUser.role !== 'admin') return <Navigate to="/user/dashboard" replace />;
  return <>{children}</>;
}

// Protect user routes
function UserGuard({ children }: { children: ReactNode }) {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/" replace />;
  if (currentUser.role !== 'user') return <Navigate to="/admin/dashboard" replace />;
  return <>{children}</>;
}

function AdminLayoutGuard() {
  return (
    <AdminGuard>
      <AppLayout />
    </AdminGuard>
  );
}

function UserLayoutGuard() {
  return (
    <UserGuard>
      <AppLayout />
    </UserGuard>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: LoginPage,
  },
  {
    path: '/admin',
    Component: AdminLayoutGuard,
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', Component: AdminDashboard },
      { path: 'templates', Component: Templates },
      { path: 'templates/new', Component: TemplateEditor },
      { path: 'templates/:id', Component: TemplateEditor },
      { path: 'submissions', Component: SubmissionsPage },
      { path: 'submissions/manage', Component: SubmissionsManagementPage },
      { path: 'users', Component: UsersPage },
      { path: 'users/edit', Component: UsersEditPage },
      { path: 'upload', Component: ExcelUploadPage },
      { path: 'settings', Component: SettingsPage },
    ],
  },
  {
    path: '/user',
    Component: UserLayoutGuard,
    children: [
      { index: true, element: <Navigate to="/user/dashboard" replace /> },
      { path: 'dashboard', Component: UserDashboard },
      { path: 'reports', Component: ReportsListPage },
      { path: 'reports/:templateId', Component: ReportSubmission },
    ],
  },
]);