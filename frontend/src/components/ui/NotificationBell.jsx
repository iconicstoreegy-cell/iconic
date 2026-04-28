import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiX, FiShoppingBag, FiPackage, FiCheck } from 'react-icons/fi';

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationBell({ notifications, unreadCount, markAllRead, markRead, clearAll, isAdmin }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    setOpen(o => !o);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative p-2 text-primary-600 hover:text-primary-950 transition-colors"
        aria-label="Notifications"
      >
        <FiBell size={20} />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-primary-100 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-primary-100">
              <div className="flex items-center gap-2">
                <FiBell size={15} className="text-primary-500" />
                <span className="text-sm font-semibold text-primary-950">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">{unreadCount} new</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-primary-400 hover:text-primary-950 transition-colors flex items-center gap-1">
                    <FiCheck size={12} /> Mark all read
                  </button>
                )}
                {notifications.length > 0 && clearAll && (
                  <button onClick={clearAll} className="text-xs text-primary-300 hover:text-red-500 transition-colors">
                    <FiX size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-primary-50">
              {notifications.length === 0 ? (
                <div className="py-10 text-center">
                  <FiBell size={28} className="mx-auto text-primary-200 mb-2" />
                  <p className="text-sm text-primary-400">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const Icon = n.type === 'new_order' ? FiShoppingBag : FiPackage;
                  const linkTo = isAdmin ? `/admin/orders/${n.orderId}` : `/profile`;
                  return (
                    <Link
                      key={n.id}
                      to={linkTo}
                      onClick={() => { markRead(n.id); setOpen(false); }}
                      className={`flex items-start gap-3 px-4 py-3 hover:bg-primary-50 transition-colors ${!n.read ? 'bg-blue-50/50' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        n.type === 'new_order' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        <Icon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-primary-950">{n.title}</p>
                          {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-primary-500 mt-0.5 truncate">{n.message}</p>
                        <p className="text-[10px] text-primary-300 mt-1">{timeAgo(n.createdAt)}</p>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
