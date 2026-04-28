import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import PageTransition from '../components/ui/PageTransition';
import { FiTrash2, FiArrowRight } from 'react-icons/fi';

export default function Cart() {
  const { t } = useTranslation();
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <PageTransition>
        <div className="pt-24 min-h-screen flex flex-col items-center justify-center text-center px-4">
          <div className="text-6xl mb-6">🛍️</div>
          <h2 className="font-display text-3xl font-bold mb-4">{t('cart.empty')}</h2>
          <Link to="/shop" className="btn-primary inline-block mt-4">{t('cart.continue_shopping')}</Link>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="pt-20 md:pt-24">
        <div className="container-custom py-10">
          <h1 className="section-title mb-10">{t('cart.title')}</h1>

          <div className="grid lg:grid-cols-3 gap-10">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {cartItems.map((item) => (
                  <motion.div
                    key={item.key}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex gap-4 border border-primary-100 p-4"
                  >
                    <img
                      src={item.image || 'https://placehold.co/100x133/f5f5f5/a3a3a3?text=IMG'}
                      alt={item.name?.en}
                      className="w-24 h-32 object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm mb-1 truncate">{item.name?.en}</h3>
                      <p className="text-xs text-primary-500 mb-3">
                        {item.size} / {item.color}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-primary-200">
                          <button onClick={() => updateQuantity(item.key, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-primary-50 text-sm">−</button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.key, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-primary-50 text-sm">+</button>
                        </div>
                        <span className="font-semibold text-sm">{item.price * item.quantity} {t('common.egp')}</span>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.key)} className="text-primary-400 hover:text-red-500 transition-colors self-start">
                      <FiTrash2 size={16} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="border border-primary-100 p-6 sticky top-24">
                <h2 className="font-medium tracking-widest uppercase text-sm mb-6">{t('checkout.order_summary')}</h2>
                <div className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between">
                    <span className="text-primary-500">{t('cart.subtotal')}</span>
                    <span>{cartTotal} {t('common.egp')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary-500">{t('cart.shipping')}</span>
                    <span className="text-green-600">{t('common.free')}</span>
                  </div>
                  <div className="border-t border-primary-100 pt-3 flex justify-between font-semibold text-base">
                    <span>{t('cart.total')}</span>
                    <span>{cartTotal} {t('common.egp')}</span>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/checkout')}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {t('cart.checkout')} <FiArrowRight size={16} />
                </motion.button>
                <Link to="/shop" className="block text-center text-xs tracking-widest uppercase text-primary-500 hover:text-primary-950 mt-4 transition-colors">
                  {t('cart.continue_shopping')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
