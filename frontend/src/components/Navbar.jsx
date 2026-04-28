import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useUserNotifications } from '../hooks/useNotifications';
import NotificationBell from './ui/NotificationBell';
import { FiShoppingBag, FiUser, FiMenu, FiX, FiSearch } from 'react-icons/fi';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const { notifications, unreadCount, markAllRead, markRead } = useUserNotifications();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleLang = () => {
    const next = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(next);
    localStorage.setItem('al-shaer-lang', next);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const navLinks = [
    { to: '/', label: t('nav.home'), end: true },
    { to: '/shop', label: t('nav.shop') }
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-sm' : 'bg-white/95 backdrop-blur-sm'
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <motion.div whileHover={{ scale: 1.02 }} className="text-center">
              <span className="font-display text-xl md:text-2xl font-bold tracking-widest text-primary-950">
                TreVero
              </span>
              <span className="block text-xs tracking-widest text-primary-500">
                تريفيرو
              </span>
            </motion.div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `text-sm tracking-widest uppercase transition-colors ${
                    isActive ? 'text-primary-950 font-medium' : 'text-primary-500 hover:text-primary-950'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Language */}
            <button
              onClick={toggleLang}
              className="text-xs tracking-widest uppercase text-primary-500 hover:text-primary-950 transition-colors font-medium"
            >
              {i18n.language === 'ar' ? 'EN' : 'عر'}
            </button>

            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-primary-700 hover:text-primary-950 transition-colors"
            >
              <FiSearch size={20} />
            </button>

            {/* Cart */}
            <Link to="/cart" className="relative text-primary-700 hover:text-primary-950 transition-colors">
              <FiShoppingBag size={20} />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-primary-950 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center"
                >
                  {cartCount}
                </motion.span>
              )}
            </Link>

            {/* Notifications — logged-in non-admin users */}
            {user && !isAdmin && (
              <NotificationBell
                notifications={notifications}
                unreadCount={unreadCount}
                markAllRead={markAllRead}
                markRead={markRead}
                isAdmin={false}
              />
            )}

            {/* User dropdown (desktop) */}
            {user ? (
              <div className="relative group hidden md:block">
                <button className="text-primary-700 hover:text-primary-950 transition-colors">
                  <FiUser size={20} />
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white shadow-lg border border-primary-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  {isAdmin && (
                    <Link to="/admin" className="block px-4 py-3 text-sm hover:bg-primary-50 transition-colors">
                      {t('nav.admin')}
                    </Link>
                  )}
                  <Link to="/profile" className="block px-4 py-3 text-sm hover:bg-primary-50 transition-colors">
                    {t('nav.profile')}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-3 text-sm hover:bg-primary-50 transition-colors text-red-600"
                  >
                    {t('nav.logout')}
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:block text-sm tracking-widest uppercase text-primary-700 hover:text-primary-950 transition-colors"
              >
                {t('nav.login')}
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-primary-700"
            >
              {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>

        {/* Search bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-primary-100"
            >
              <form onSubmit={handleSearch} className="py-4">
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('nav.search') + '...'}
                  className="w-full text-sm border-b border-primary-300 pb-2 focus:outline-none focus:border-primary-950 bg-transparent"
                />
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-white border-t border-primary-100 px-6 py-4 space-y-4"
          >
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className="block text-sm tracking-widest uppercase text-primary-700 hover:text-primary-950"
              >
                {label}
              </Link>
            ))}
            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setMenuOpen(false)} className="block text-sm tracking-widest uppercase text-primary-700">
                    {t('nav.admin')}
                  </Link>
                )}
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="block text-sm tracking-widest uppercase text-primary-700">
                  {t('nav.profile')}
                </Link>
                <button
                  onClick={() => { handleLogout(); setMenuOpen(false); }}
                  className="block text-sm tracking-widest uppercase text-red-600"
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)} className="block text-sm tracking-widest uppercase text-primary-700">
                {t('nav.login')}
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
