import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useAdminNotifications } from '../hooks/useNotifications';
import NotificationBell from '../components/ui/NotificationBell';
import {
  FiGrid, FiPackage, FiShoppingBag, FiUsers,
  FiLogOut, FiMenu, FiX, FiGlobe
} from 'react-icons/fi';

export default function AdminLayout() {
  const { t, i18n } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { notifications, unreadCount, markAllRead, markRead, clearAll } = useAdminNotifications();

  const isRTL = i18n.language === 'ar';

  const toggleLang = () => {
    const next = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(next);
    localStorage.setItem('al-shaer-lang', next);
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const links = [
    { to: '/admin',           label: t('admin.dashboard'), icon: FiGrid,        end: true },
    { to: '/admin/products',  label: t('admin.products'),  icon: FiPackage },
    { to: '/admin/orders',    label: t('admin.orders'),    icon: FiShoppingBag },
    { to: '/admin/customers', label: t('admin.customers'), icon: FiUsers }
  ];

  const Sidebar = () => (
    <aside className={`w-64 bg-primary-950 text-white flex flex-col h-full`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="p-6 border-b border-primary-800">
        <h1 className="font-display text-xl font-bold tracking-widest">Iconic</h1>
        <p className="text-primary-400 text-xs mt-1 tracking-wider">
          {isRTL ? 'لوحة الإدارة' : 'ADMIN PANEL'}
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-white text-primary-950 font-semibold'
                  : 'text-primary-300 hover:bg-primary-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-primary-800 space-y-1">
        <button
          onClick={toggleLang}
          className="flex items-center gap-3 px-4 py-3 w-full text-primary-300 hover:text-white hover:bg-primary-800 rounded-lg text-sm transition-colors"
        >
          <FiGlobe size={18} />
          {i18n.language === 'ar' ? 'English' : 'العربية'}
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-primary-300 hover:text-red-400 hover:bg-primary-800 rounded-lg text-sm transition-colors"
        >
          <FiLogOut size={18} />
          {t('nav.logout')}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="flex-shrink-0"><Sidebar /></div>
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-primary-100 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-1 text-primary-700">
              {sidebarOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
            <span className="font-display font-bold text-primary-950 hidden md:block">
              {isRTL ? 'لوحة الإدارة' : 'Admin Panel'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell
              notifications={notifications}
              unreadCount={unreadCount}
              markAllRead={markAllRead}
              markRead={markRead}
              clearAll={clearAll}
              isAdmin={true}
            />
            <button
              onClick={toggleLang}
              className="hidden md:flex items-center gap-1.5 text-xs font-medium text-primary-500 hover:text-primary-950 transition-colors border border-primary-200 px-3 py-1.5 rounded-lg"
            >
              <FiGlobe size={13} />
              {i18n.language === 'ar' ? 'EN' : 'عر'}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
