import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { getMyOrders } from '../services/orderService';
import { useAuth } from '../context/AuthContext';
import PageTransition from '../components/ui/PageTransition';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

export default function Profile() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['myOrders'],
    queryFn: getMyOrders
  });

  return (
    <PageTransition>
      <div className="pt-20 md:pt-24">
        <div className="container-custom py-10 max-w-3xl">
          <h1 className="section-title mb-8">{t('nav.profile')}</h1>

          {/* User info */}
          <div className="border border-primary-100 p-6 mb-8">
            <h2 className="text-xs tracking-widest uppercase font-medium mb-4">Account Info</h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div><span className="text-primary-500">Name: </span>{user?.name}</div>
              <div><span className="text-primary-500">Email: </span>{user?.email}</div>
              <div><span className="text-primary-500">Phone: </span>{user?.phone || '—'}</div>
              <div><span className="text-primary-500">Role: </span>{user?.role}</div>
            </div>
          </div>

          {/* Orders */}
          <h2 className="text-xs tracking-widest uppercase font-medium mb-4">My Orders</h2>
          {isLoading ? (
            <div className="space-y-3">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-20 bg-primary-100 animate-pulse" />
              ))}
            </div>
          ) : orders?.length === 0 ? (
            <p className="text-primary-500 text-sm">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {orders?.map((order) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border border-primary-100 p-4 flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="text-xs text-primary-400 mb-1">#{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-sm font-medium">{order.totalPrice} {t('common.egp')}</p>
                    <p className="text-xs text-primary-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_COLORS[order.orderStatus] || 'bg-primary-100'}`}>
                    {t(`order.status_${order.orderStatus}`)}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
