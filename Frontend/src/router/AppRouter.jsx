import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import { ROLES } from '../utils/constants';

// Layout
import MainLayout from '../components/layout/MainLayout';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Dashboard & Core Pages
import Dashboard from '../pages/dashboard/Dashboard';
import VendorsList from '../pages/vendors/VendorsList';
import RFQList from '../pages/rfqs/RFQList';
import QuotationList from '../pages/quotations/QuotationList';
import ApprovalList from '../pages/approvals/ApprovalList';
import POList from '../pages/purchase-orders/POList';
import InvoiceList from '../pages/invoices/InvoiceList';
import ActivityLog from '../pages/activity/ActivityLog';
import AnalyticsDashboard from '../pages/analytics/AnalyticsDashboard';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: <Dashboard />,
          },
          {
            path: 'rfqs',
            element: <RFQList />,
          },
          {
            path: 'quotations',
            element: <QuotationList />,
          },
          {
            path: 'purchase-orders',
            element: <POList />,
          },
          {
            path: 'invoices',
            element: <InvoiceList />,
          },
          // Role Protected Routes
          {
            element: <RoleRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.PROCUREMENT_OFFICER]} />,
            children: [
              {
                path: 'vendors',
                element: <VendorsList />,
              },
            ],
          },
          {
            element: <RoleRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]} />,
            children: [
              {
                path: 'approvals',
                element: <ApprovalList />,
              },
              {
                path: 'analytics',
                element: <AnalyticsDashboard />,
              },
            ],
          },
          {
            element: <RoleRoute allowedRoles={[ROLES.ADMIN]} />,
            children: [
              {
                path: 'activity',
                element: <ActivityLog />,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
