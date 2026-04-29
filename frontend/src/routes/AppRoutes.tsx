import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// Layout & Auth
import Layout from '../layouts/Layout';
import Login from '../pages/Login';

// Pages
import Dashboard from '../pages/Dashboard';
import Products from '../pages/Products';
import Orders from '../pages/Orders';
import Reports from '../pages/Reports';
import Warehouses from '../pages/Warehouses';
import Suppliers from '../pages/Suppliers';
import Customers from '../pages/Customers';
import Activities from '../pages/Activities';
import Users from '../pages/Users';
import PurchaseOrders from '../pages/PurchaseOrders';
import StockTransfers from '../pages/StockTransfers';
import AdminSettings from '../pages/AdminSettings';

/**
 * Higher-order component to protect routes based on authentication.
 * Redirects to login if not authenticated.
 */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-colors">
        <div
          className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: '#3b82f6', borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

/**
 * Main application routing configuration.
 * Simplified for a single-admin system where authenticated users have full access.
 */
export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Dashboard Shell */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        
        {/* Inventory & Products */}
        <Route path="products" element={<Products />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="warehouses" element={<Warehouses />} />
        <Route path="transfers" element={<StockTransfers />} />
        <Route path="activities" element={<Activities />} />

        {/* Sales & Orders */}
        <Route path="orders" element={<Orders />} />
        <Route path="purchase-orders" element={<PurchaseOrders />} />
        <Route path="customers" element={<Customers />} />

        {/* Intelligence & Analytics */}
        <Route path="reports" element={<Reports />} />

        {/* Management & Administration */}
        <Route path="users" element={<Users />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Catch-all Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

