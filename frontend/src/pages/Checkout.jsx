import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/orderService';
import api from '../services/api';
import PageTransition from '../components/ui/PageTransition';
import { FiUpload, FiX, FiCheckCircle, FiTruck, FiSmartphone } from 'react-icons/fi';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(10, 'Valid phone required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  notes: z.string().optional()
});

// Payment method config
const PAYMENT_METHODS = [
  {
    value: 'cash',
    label: 'Cash on Delivery',
    labelAr: 'الدفع عند الاستلام',
    icon: FiTruck,
    desc: 'Pay when your order arrives',
    descAr: 'ادفع عند وصول طلبك',
    requiresReceipt: false,
    color: 'emerald'
  },
  {
    value: 'instapay',
    label: 'InstaPay',
    labelAr: 'إنستاباي',
    icon: FiSmartphone,
    desc: 'Transfer to our InstaPay account, then upload receipt',
    descAr: 'حوّل على حساب إنستاباي ثم ارفع إيصال التحويل',
    requiresReceipt: true,
    color: 'blue',
    accountInfo: {
      label: 'InstaPay Account',
      value: '01500543388' 
    }
  },
  {
    value: 'vodafone_cash',
    label: 'Vodafone Cash',
    labelAr: 'فودافون كاش',
    icon: FiSmartphone,
    desc: 'Transfer to our Vodafone Cash number, then upload receipt',
    descAr: 'حوّل على رقم فودافون كاش ثم ارفع إيصال التحويل',
    requiresReceipt: true,
    color: 'red',
    accountInfo: {
      label: 'Vodafone Cash Number',
      value: '01500543388'
    }
  }
];

export default function Checkout() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const selectedMethod = PAYMENT_METHODS.find(m => m.value === paymentMethod);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || ''
    }
  });

  const handleReceiptChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('File too large (max 5MB)'); return; }
    setReceiptFile(file);
    setReceiptPreview(URL.createObjectURL(file));
  };

  const uploadReceipt = async () => {
    if (!receiptFile) return null;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('images', receiptFile);
      const { data } = await api.post('/upload/receipt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return data[0]?.url || null;
    } catch {
      toast.error('Failed to upload receipt');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data) => {
    if (cartItems.length === 0) { toast.error('Cart is empty'); return; }

    if (selectedMethod.requiresReceipt && !receiptFile) {
      toast.error('Please upload your transfer receipt');
      return;
    }

    setLoading(true);
    try {
      let transferReceiptUrl = null;
      if (selectedMethod.requiresReceipt) {
        transferReceiptUrl = await uploadReceipt();
        if (!transferReceiptUrl) { setLoading(false); return; }
      }

      const order = await createOrder({
        customerInfo: { ...data },
        orderItems: cartItems.map((i) => ({
          product: i._id,
          name: i.name,
          image: i.image,
          price: i.price,
          quantity: i.quantity,
          size: i.size,
          color: i.color
        })),
        totalPrice: cartTotal,
        paymentMethod,
        transferReceiptUrl
      });

      clearCart();
      navigate(`/order-success/${order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="pt-20 md:pt-24">
        <div className="container-custom py-10">
          <h1 className="section-title mb-10">{t('checkout.title')}</h1>

          <div className="grid lg:grid-cols-3 gap-10">
            {/* Left: Form */}
            <div className="lg:col-span-2 space-y-6">
              {!user && (
                <div className="bg-primary-50 border border-primary-100 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-primary-950">Checkout as a Guest</h3>
                    <p className="text-xs text-primary-500 mt-1">Already have an account? Login for faster checkout.</p>
                  </div>
                  <Link to="/login?redirect=/checkout" className="btn-primary text-xs px-5 py-2.5 whitespace-nowrap">
                    Login
                  </Link>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {/* Delivery Info */}
                <div className="bg-white border border-primary-100 rounded-xl p-6 space-y-4">
                  <h2 className="text-xs font-semibold tracking-widest uppercase text-primary-500">Delivery Information</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs tracking-widest uppercase mb-2">{t('checkout.name')}</label>
                      <input {...register('name')} className="input-field" />
                      {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs tracking-widest uppercase mb-2">Email Address</label>
                      <input {...register('email')} type="email" className="input-field" />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs tracking-widest uppercase mb-2">{t('checkout.phone')}</label>
                      <input {...register('phone')} className="input-field" />
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs tracking-widest uppercase mb-2">{t('checkout.city')}</label>
                      <input {...register('city')} className="input-field" />
                      {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs tracking-widest uppercase mb-2">{t('checkout.address')}</label>
                    <input {...register('address')} className="input-field" />
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs tracking-widest uppercase mb-2">{t('checkout.notes')}</label>
                    <textarea {...register('notes')} rows={2} className="input-field resize-none" placeholder="Any special instructions..." />
                  </div>
                </div>

              {/* Payment Method */}
              <div className="bg-white border border-primary-100 rounded-xl p-6 space-y-4">
                <h2 className="text-xs font-semibold tracking-widest uppercase text-primary-500">{t('checkout.payment_method')}</h2>

                <div className="space-y-3">
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon;
                    const isSelected = paymentMethod === method.value;
                    return (
                      <label
                        key={method.value}
                        className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          isSelected ? 'border-primary-950 bg-primary-50' : 'border-primary-100 hover:border-primary-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method.value}
                          checked={isSelected}
                          onChange={() => { setPaymentMethod(method.value); setReceiptFile(null); setReceiptPreview(null); }}
                          className="mt-1 accent-primary-950"
                        />
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          method.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                          method.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          <Icon size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{lang === 'ar' ? method.labelAr : method.label}</p>
                          <p className="text-xs text-primary-400 mt-0.5">{lang === 'ar' ? method.descAr : method.desc}</p>
                        </div>
                        {isSelected && <FiCheckCircle size={18} className="text-primary-950 mt-1 flex-shrink-0" />}
                      </label>
                    );
                  })}
                </div>

                {/* Transfer Instructions + Receipt Upload */}
                <AnimatePresence>
                  {selectedMethod.requiresReceipt && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      {/* Account Info */}
                      <div className="bg-primary-950 text-white rounded-xl p-5 mb-4">
                        <p className="text-xs tracking-widest uppercase text-primary-400 mb-2">Transfer To</p>
                        <p className="text-sm font-medium mb-1">{selectedMethod.accountInfo?.label}</p>
                        <p className="text-2xl font-bold font-mono tracking-widest">{selectedMethod.accountInfo?.value}</p>
                        <p className="text-xs text-primary-400 mt-3">
                          Amount: <span className="text-white font-semibold">{cartTotal} EGP</span>
                        </p>
                      </div>

                      {/* Receipt Upload */}
                      <div>
                        <p className="text-xs font-semibold tracking-widest uppercase text-primary-500 mb-3">
                          Upload Transfer Receipt *
                        </p>

                        {!receiptPreview ? (
                          <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-primary-200 rounded-xl p-8 cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-all">
                            <FiUpload size={24} className="text-primary-400" />
                            <div className="text-center">
                              <p className="text-sm font-medium text-primary-700">Click to upload screenshot</p>
                              <p className="text-xs text-primary-400 mt-0.5">PNG, JPG up to 5MB</p>
                            </div>
                            <input type="file" accept="image/*" onChange={handleReceiptChange} className="hidden" />
                          </label>
                        ) : (
                          <div className="relative inline-block">
                            <img src={receiptPreview} alt="Receipt" className="max-h-64 rounded-xl border border-primary-200 object-contain" />
                            <button
                              type="button"
                              onClick={() => { setReceiptFile(null); setReceiptPreview(null); }}
                              className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                            >
                              <FiX size={14} />
                            </button>
                            <div className="mt-2 flex items-center gap-2 text-xs text-emerald-600">
                              <FiCheckCircle size={14} /> Receipt uploaded
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <motion.button
                type="submit"
                disabled={loading || uploading}
                whileTap={{ scale: 0.97 }}
                className="btn-primary w-full disabled:opacity-60 flex items-center justify-center gap-2 py-4 text-base"
              >
                {loading || uploading ? (
                  <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {uploading ? 'Uploading receipt...' : 'Placing order...'}</>
                ) : t('checkout.place_order')}
              </motion.button>
              </form>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-primary-100 rounded-xl p-6 sticky top-24">
                <h2 className="font-medium tracking-widest uppercase text-sm mb-5">{t('checkout.order_summary')}</h2>

                <div className="space-y-3 mb-5 max-h-72 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.key} className="flex gap-3">
                      <img
                        src={item.image || 'https://placehold.co/56x72/f5f5f5/a3a3a3?text=IMG'}
                        alt=""
                        className="w-14 h-[72px] object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{item.name?.en}</p>
                        <p className="text-xs text-primary-400">{item.size} / {item.color}</p>
                        <p className="text-xs text-primary-400">Qty: {item.quantity}</p>
                        <p className="text-xs font-semibold mt-1">{item.price * item.quantity} {t('common.egp')}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-primary-100 pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-primary-500">
                    <span>Subtotal</span>
                    <span>{cartTotal} EGP</span>
                  </div>
                  <div className="flex justify-between text-sm text-primary-500">
                    <span>Shipping</span>
                    <span className="text-emerald-600">{t('common.free')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-primary-950 pt-2 border-t border-primary-100">
                    <span>{t('cart.total')}</span>
                    <span>{cartTotal} {t('common.egp')}</span>
                  </div>
                </div>

                {/* Payment badge */}
                <div className="mt-4 pt-4 border-t border-primary-100">
                  <p className="text-xs text-primary-400">Payment via</p>
                  <p className="text-sm font-medium mt-0.5">
                    {lang === 'ar' ? selectedMethod.labelAr : selectedMethod.label}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
