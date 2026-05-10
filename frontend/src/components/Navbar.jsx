import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on navigation
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

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
  const categoryLinks = [
  { to: '/shop?category=Hoodies', label: t('nav.Hoodies') },
  { to: '/shop?category=T-Shirts', label: t('nav.T-Shirts') },
  { to: '/shop?category=Shirts', label: t('nav.Shirts') },
  { to: '/shop?category=Pants', label: t('nav.Pants') },
  { to: '/shop?category=Polo-Shirts', label: t('nav.Polo-Shirts') },
];

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-4 left-4 right-4 md:top-6 md:left-12 md:right-12 z-50 transition-all duration-500 rounded-full border ${
          scrolled ? 'bg-white/90 backdrop-blur-xl border-white/20 shadow-md py-1' : 'bg-white/70 backdrop-blur-md border-white/30 shadow-soft py-2'
        }`}
      >
        <div className="px-6 md:px-10">
          <div className="flex items-center justify-between h-14 md:h-16">

            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                <span className="font-display text-xl md:text-2xl font-bold tracking-tight text-primary-950">
                  Iconic<span className="text-accent-500">.</span>
                </span>
              </motion.div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
              {navLinks.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `relative text-sm font-medium tracking-wide transition-colors py-2 ${
                      isActive ? 'text-primary-950' : 'text-neutral-500 hover:text-primary-950'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {label}
                      {isActive && (
                        <motion.div
                          layoutId="navbar-indicator"
                          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent-500 rounded-full"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4 md:gap-5">
              {/* Language */}
              <button
                onClick={toggleLang}
                className="text-xs font-semibold tracking-wider uppercase text-neutral-500 hover:text-primary-950 transition-colors"
              >
                {i18n.language === 'ar' ? 'EN' : 'عر'}
              </button>

              {/* Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="text-neutral-500 hover:text-primary-950 transition-colors hover:scale-110 transform duration-200"
              >
                <FiSearch size={20} />
              </button>

              {/* Cart */}
              <Link to="/cart" className="relative text-neutral-500 hover:text-primary-950 transition-colors hover:scale-110 transform duration-200">
                <FiShoppingBag size={20} />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -top-1.5 -right-2 bg-accent-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-glow"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
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
                  <button className="text-neutral-500 hover:text-primary-950 transition-colors hover:scale-110 transform duration-200">
                    <FiUser size={20} />
                  </button>
                  <div className="absolute right-0 top-full mt-4 w-48 bg-white/90 backdrop-blur-md rounded-2xl shadow-soft border border-neutral-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 overflow-hidden transform translate-y-2 group-hover:translate-y-0">
                    {isAdmin && (
                      <Link to="/admin" className="block px-5 py-3 text-sm font-medium hover:bg-neutral-50 transition-colors">
                        {t('nav.admin')}
                      </Link>
                    )}
                    <Link to="/profile" className="block px-5 py-3 text-sm font-medium hover:bg-neutral-50 transition-colors">
                      {t('nav.profile')}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-5 py-3 text-sm font-medium hover:bg-red-50 text-red-600 transition-colors"
                    >
                      {t('nav.logout')}
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden md:block btn-primary px-5 py-2 text-xs"
                >
                  {t('nav.login')}
                </Link>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden text-primary-950 hover:scale-110 transition-transform"
              >
                {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-4 right-4 md:left-auto md:right-12 md:w-96 z-40 bg-white/90 backdrop-blur-xl rounded-3xl shadow-soft border border-neutral-100 overflow-hidden p-2"
          >
            <form onSubmit={handleSearch} className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('nav.search') + '...'}
                className="w-full bg-neutral-100 rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-accent-500/20 transition-all"
              />
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-30 flex items-center justify-center bg-white/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col items-center justify-center gap-8 text-center p-8 w-full mt-16">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="text-3xl font-display font-medium text-primary-950 hover:text-accent-500 transition-colors"
                >
                  {label}
                </Link>
              ))}
              {categoryLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="text-lg font-medium text-neutral-500 hover:text-accent-500 transition-colors"
                >
                  {label}
                </Link>
              ))}
              <div className="w-16 h-px bg-neutral-200 my-4" />
              
              {user ? (
                <>
                  {isAdmin && (
                    <Link to="/admin" className="text-xl font-medium text-neutral-600">
                      {t('nav.admin')}
                    </Link>
                  )}
                  <Link to="/profile" className="text-xl font-medium text-neutral-600">
                    {t('nav.profile')}
                  </Link>
                  <button onClick={handleLogout} className="text-xl font-medium text-red-600">
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <Link to="/login" className="btn-primary w-full max-w-xs text-center py-4 text-lg">
                  {t('nav.login')}
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
