import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Logo from './Logo';
import {
  LayoutDashboard, Package, ShoppingCart, BarChart2,
  LogOut, Settings, Users, Truck, Database, Activity,
  ArrowRightLeft, ShoppingBag
} from 'lucide-react';

/**
 * Sidebar Navigation Component.
 * Displays all administrative routes in a consistent layout for the single-admin system.
 */
export default function Sidebar() {
  const { logout } = useAuthStore();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard',  icon: LayoutDashboard, path: '/' },
    { name: 'Products',   icon: Package,         path: '/products' },
    { name: 'Orders',     icon: ShoppingCart,    path: '/orders' },
    { name: 'Purchases',  icon: ShoppingBag,     path: '/purchase-orders' },
    { name: 'Customers',  icon: Users,           path: '/customers' },
    { name: 'Suppliers',  icon: Truck,           path: '/suppliers' },
    { name: 'Warehouses', icon: Database,        path: '/warehouses' },
    { name: 'Transfers',  icon: ArrowRightLeft,  path: '/transfers' },
    { name: 'Activities', icon: Activity,        path: '/activities' },
    { name: 'Reports',    icon: BarChart2,       path: '/reports' },
    { name: 'Users',      icon: Settings,        path: '/users' },
  ];

  return (
    <aside
      className="w-64 flex flex-col h-screen fixed left-0 top-0 z-40 transition-all"
      style={{
        background: 'var(--sidebar)',
        borderRight: '1.5px solid var(--border)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      }}
    >
      {/* Logo Area */}
      <div
        className="h-20 flex items-center gap-3.5 px-6 group cursor-pointer"
        style={{ borderBottom: '1.5px solid var(--border)' }}
      >
        <div className="transition-transform duration-500 group-hover:scale-110">
          <Logo size={40} />
        </div>
        <div>
          <span
            className="text-2xl font-black tracking-tighter"
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 2px 4px rgba(59,130,246,0.1))'
            }}
          >
            StockUp
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
            <p className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
              Enterprise
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-1 custom-scrollbar">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{item.name}</span>
              {isActive && (
                <span
                  className="ml-auto w-1.5 h-1.5 rounded-full"
                  style={{ background: '#3b82f6', boxShadow: '0 0 6px #3b82f6' }}
                />
              )}
            </NavLink>
          );
        })}
      </div>

      {/* User Actions Footer */}
      <div className="p-3" style={{ borderTop: '1.5px solid var(--border)' }}>
        <NavLink to="/settings" className="sidebar-link mb-1">
          <Settings className="w-5 h-5" />
          <span className="text-sm">Settings</span>
        </NavLink>
        
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-bold transition-all hover:scale-[1.02]"
          style={{
            color: '#ef4444',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.15)',
          }}
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

