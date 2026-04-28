import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { getOrderById } from '../services/orderService';
import PageTransition from '../components/ui/PageTransition';

export default function OrderSuccess() {
  const { id } = useParams();
  const { t } = useTranslation();

  const { data: order } = useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrderById(id),
    enabled: !!id
  });

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center px-4 pt-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <span className="text-4xl">✓</span>
          </motion.div>
          <h1 className="font-display text-3xl font-bold mb-3">Order Placed!</h1>
          <p className="text-primary-500 mb-2">Thank you for your order.</p>
          {order && (
            <p className="text-xs text-primary-400 mb-8">Order ID: {order._id}</p>
          )}
          <div className="space-y-3">
            <Link to="/shop" className="btn-primary block">{t('cart.continue_shopping')}</Link>
            {order && (
              <Link to="/profile" className="btn-outline block">{t('nav.profile')}</Link>
            )}
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
