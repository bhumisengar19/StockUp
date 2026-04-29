import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { Bell, Search, ChevronDown, CheckCircle2, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useState } from 'react';

/**
 * Global Header Component.
 * Simplified for a single-admin system, displaying unified search and profile info.
 */
export default function Header() {
  const { user } = useAuthStore();
  const { notifications, unreadCount, markAllAsRead, clearAll } = useNotificationStore();
  const [showNotif, setShowNotif] = useState(false);

  return (
    <header
      className="h-16 flex items-center justify-between px-8 sticky top-0 z-30 transition-all"
      style={{
        background: 'var(--header)',
        borderBottom: '1.5px solid var(--border)',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
      }}
    >
      {/* Search Bar */}
      <div className="flex-1 max-w-md relative hidden md:block">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
          style={{ color: 'var(--text-muted)' }}
        />
        <input
          type="text"
          placeholder="Search inventory, orders…"
          className="input-field pl-10 text-sm"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 ml-auto">

        {/* Animated Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotif(!showNotif); markAllAsRead(); }}
            className="relative p-2 rounded-xl transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'var(--card)',
              border: '1.5px solid var(--border)',
              color: 'var(--text)',
            }}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full border-2 bg-red-500 text-[10px] text-white flex items-center justify-center font-bold animate-bounce"
                style={{ borderColor: 'var(--header)' }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {showNotif && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotif(false)} />
              <div className="absolute right-0 mt-3 w-80 max-h-[480px] overflow-y-auto bg-white dark:bg-secondary-900 border border-secondary-100 dark:border-secondary-800 rounded-2xl shadow-2xl z-50 animate-slide-in">
                <div className="p-4 border-b border-secondary-50 dark:border-secondary-800 flex items-center justify-between">
                  <h3 className="font-bold text-sm">Notifications</h3>
                  <button onClick={clearAll} className="text-[10px] font-bold text-primary uppercase hover:underline">Clear All</button>
                </div>
                <div className="py-2">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                       <Bell className="w-8 h-8 text-secondary-200 mx-auto mb-2" />
                       <p className="text-xs text-secondary-400 font-medium italic">No new alerts</p>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="px-4 py-3 hover:bg-secondary-50 dark:hover:bg-secondary-800/50 transition-colors border-b border-secondary-50 dark:border-secondary-800 last:border-0">
                         <div className="flex gap-3">
                           <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${n.type === 'low_stock' ? 'bg-status-error' : n.type === 'new_order' ? 'bg-status-success' : 'bg-primary'}`} />
                           <div>
                             <p className="text-xs font-medium text-secondary-700 dark:text-secondary-300 leading-relaxed">{n.message}</p>
                             <p className="text-[10px] text-secondary-400 mt-1.5 flex items-center gap-1">
                               <Clock className="w-2.5 h-2.5" />
                               {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </p>
                           </div>
                         </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Divider */}
        <div className="h-8 w-px mx-1" style={{ background: 'var(--border)' }} />

        {/* User Profile */}
        <Link to="/settings">
          <button
            className="flex items-center gap-3 px-3 py-1.5 rounded-xl transition-all hover:scale-[1.02] active:scale-95"
            style={{
              background: 'var(--card)',
              border: '1.5px solid var(--border)',
              backdropFilter: 'blur(8px)',
            }}
          >
            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold overflow-hidden"
              style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}
            >
              {user?.profileImage ? (
                <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.username?.[0]?.toUpperCase() ?? 'U'
              )}
            </div>

          <div className="text-left hidden lg:block">
            <p className="text-sm font-bold leading-none" style={{ color: 'var(--text)' }}>
              {user?.username}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color: 'var(--text-muted)' }}>
              Administrator
            </p>
          </div>

          <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        </button>
      </Link>
      </div>
    </header>
  );
}

