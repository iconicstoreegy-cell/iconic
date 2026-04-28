import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { getOrderById, updateOrderStatus } from '../../services/orderService';
import { motion } from 'framer-motion';
import {
  FiArrowLeft, FiCheckCircle, FiClock, FiTruck,
  FiPackage, FiXCircle, FiPhone, FiMapPin, FiMessageSquare,
  FiCreditCard, FiRefreshCw
} from 'react-icons/fi';

const TIMELINE_STEPS = [
  { key: 'pending',   label: 'Order Placed',  icon: FiClock,        desc: 'Order received and awaiting confirmation' },
  { key: 'confirmed', label: 'Confirmed',      icon: FiCheckCircle,  desc: 'Order confirmed and being prepared' },
  { key: 'shipped',   label: 'Shipped',        icon: FiTruck,        desc: 'Order has been shipped' },
  { key: 'delivered', label: 'Delivered',      icon: FiPackage,      desc: 'Order delivered to customer' },
];

const STATUS_ORDER = ['pending', 'confirmed', 'shipped', 'delivered'];

const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_STATUSES = ['pending', 'transfer_submitted', 'paid', 'failed', 'refunded'];

const PAYMENT_METHOD_LABELS = { cash: '💵 Cash on Delivery', stripe: '💳 Stripe', paymob: '🏦 Paymob' };

const PAYMENT_COLORS = {
  pending:  'bg-gray-100 text-gray-700',
  paid:     'bg-emerald-100 text-emerald-700',
  failed:   'bg-red-100 text-red-700',
  refunded: 'bg-orange-100 text-orange-700',
};

export default function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrderById(id)
  });

  const [orderStatus, setOrderStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  useEffect(() => {
    if (order) {
      setOrderStatus(order.orderStatus);
      setPaymentStatus(order.paymentStatus);
      setTrackingNumber(order.trackingNumber || '');
    }
  }, [order]);

  const mutation = useMutation({
    mutationFn: (data) => updateOrderStatus(id, data),
    onSuccess: () => {
      toast.success('Order updated successfully');
      queryClient.invalidateQueries(['order', id]);
      queryClient.invalidateQueries(['adminOrders']);
      queryClient.invalidateQueries(['dashboardStats']);
    },
    onError: () => toast.error('Failed to update order')
  });

  const handleUpdate = () => {
    mutation.mutate({ orderStatus, paymentStatus, trackingNumber });
  };

  const currentStepIndex = STATUS_ORDER.indexOf(order?.orderStatus);
  const isCancelled = order?.orderStatus === 'cancelled';

  if (isLoading) return (
    <div className="space-y-4 animate-pulse max-w-4xl">
      <div className="h-8 bg-primary-100 w-1/3 rounded" />
      <div className="h-24 bg-white rounded-xl" />
      <div className="h-64 bg-white rounded-xl" />
    </div>
  );

  if (!order) return (
    <div className="text-center py-20">
      <p className="text-primary-400">Order not found</p>
      <button onClick={() => navigate('/admin/orders')} className="btn-primary mt-4 text-sm">Back to Orders</button>
    </div>
  );

  return (
    <div className="max-w-4xl space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/orders')} className="p-2 hover:bg-primary-100 rounded-lg transition-colors">
          <FiArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-primary-950">
              Order #{order._id.slice(-8).toUpperCase()}
            </h1>
            {isCancelled ? (
              <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                <FiXCircle size={12} /> Cancelled
              </span>
            ) : (
              <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-medium">
                Active
              </span>
            )}
          </div>
          <p className="text-sm text-primary-400 mt-0.5">
            Placed on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Tracking Timeline */}
      {!isCancelled && (
        <div className="bg-white rounded-xl border border-primary-100 shadow-sm p-6">
          <h2 className="text-xs font-semibold tracking-widest uppercase text-primary-500 mb-6">Order Tracking</h2>
          <div className="relative">
            {/* Progress bar */}
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-primary-100">
              <motion.div
                className="h-full bg-primary-950"
                initial={{ width: 0 }}
                animate={{ width: currentStepIndex >= 0 ? `${(currentStepIndex / (TIMELINE_STEPS.length - 1)) * 100}%` : '0%' }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>

            <div className="grid grid-cols-4 gap-2 relative">
              {TIMELINE_STEPS.map((step, i) => {
                const isCompleted = currentStepIndex >= i;
                const isCurrent = currentStepIndex === i;
                const Icon = step.icon;
                return (
                  <div key={step.key} className="flex flex-col items-center text-center">
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: isCurrent ? 1.1 : 1 }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center z-10 border-2 transition-all ${
                        isCompleted
                          ? 'bg-primary-950 border-primary-950 text-white'
                          : 'bg-white border-primary-200 text-primary-300'
                      } ${isCurrent ? 'ring-4 ring-primary-950/10' : ''}`}
                    >
                      <Icon size={16} />
                    </motion.div>
                    <p className={`text-xs font-medium mt-2 ${isCompleted ? 'text-primary-950' : 'text-primary-300'}`}>
                      {step.label}
                    </p>
                    <p className="text-[10px] text-primary-400 mt-0.5 hidden md:block">{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {order.trackingNumber && (
            <div className="mt-5 pt-4 border-t border-primary-100 flex items-center gap-2 text-sm">
              <FiTruck size={15} className="text-primary-400" />
              <span className="text-primary-500">Tracking Number:</span>
              <span className="font-mono font-medium">{order.trackingNumber}</span>
            </div>
          )}
        </div>
      )}

      {/* Cancelled Banner */}
      {isCancelled && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <FiXCircle size={20} className="text-red-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-700">This order has been cancelled</p>
            <p className="text-xs text-red-500 mt-0.5">Payment status: {order.paymentStatus}</p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-5">
        {/* Customer Info */}
        <div className="bg-white rounded-xl border border-primary-100 shadow-sm p-6">
          <h2 className="text-xs font-semibold tracking-widest uppercase text-primary-500 mb-4">Customer</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold text-sm">
                {order.customerInfo?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-primary-950">{order.customerInfo?.name}</p>
                {order.user && <p className="text-xs text-primary-400">Registered customer</p>}
              </div>
            </div>
            <div className="space-y-2 pt-2 border-t border-primary-50">
              <div className="flex items-center gap-2 text-sm">
                <FiPhone size={14} className="text-primary-400 flex-shrink-0" />
                <span>{order.customerInfo?.phone}</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <FiMapPin size={14} className="text-primary-400 flex-shrink-0 mt-0.5" />
                <span>{order.customerInfo?.address}, {order.customerInfo?.city}</span>
              </div>
              {order.customerInfo?.notes && (
                <div className="flex items-start gap-2 text-sm">
                  <FiMessageSquare size={14} className="text-primary-400 flex-shrink-0 mt-0.5" />
                  <span className="text-primary-500 italic">"{order.customerInfo.notes}"</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-white rounded-xl border border-primary-100 shadow-sm p-6">
          <h2 className="text-xs font-semibold tracking-widest uppercase text-primary-500 mb-4">Payment</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <FiCreditCard size={14} className="text-primary-400" />
                <span>{PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}</span>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${PAYMENT_COLORS[order.paymentStatus]}`}>
                {order.paymentStatus}
              </span>
            </div>
            {order.paymentResult?.id && (
              <p className="text-xs text-primary-400 font-mono">Ref: {order.paymentResult.id}</p>
            )}
            {order.transferReceiptUrl && (
              <div className="pt-3 border-t border-primary-50">
                <p className="text-xs text-primary-500 mb-2 font-medium">Transfer Receipt</p>
                <a href={order.transferReceiptUrl} target="_blank" rel="noreferrer">
                  <img
                    src={order.transferReceiptUrl}
                    alt="Transfer receipt"
                    className="max-h-48 rounded-lg border border-primary-200 object-contain hover:opacity-90 transition-opacity cursor-zoom-in"
                  />
                </a>
                <p className="text-xs text-primary-400 mt-1">Click to open full size</p>
              </div>
            )}
            <div className="pt-3 border-t border-primary-50 space-y-1.5 text-sm">
              <div className="flex justify-between text-primary-500">
                <span>Subtotal</span>
                <span>{(order.totalPrice - (order.shippingPrice || 0)).toLocaleString()} EGP</span>
              </div>
              <div className="flex justify-between text-primary-500">
                <span>Shipping</span>
                <span>{order.shippingPrice ? `${order.shippingPrice} EGP` : 'Free'}</span>
              </div>
              <div className="flex justify-between font-bold text-primary-950 pt-1 border-t border-primary-100">
                <span>Total</span>
                <span>{order.totalPrice?.toLocaleString()} EGP</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-xl border border-primary-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-primary-100 bg-primary-50/50">
          <h2 className="text-xs font-semibold tracking-widest uppercase text-primary-500">
            Order Items ({order.orderItems?.length})
          </h2>
        </div>
        <div className="divide-y divide-primary-50">
          {order.orderItems?.map((item, i) => (
            <div key={i} className="flex gap-4 items-center px-6 py-4">
              <div className="w-16 h-20 flex-shrink-0 bg-primary-100 rounded-lg overflow-hidden">
                <img
                  src={item.image || 'https://placehold.co/64x80/f5f5f5/a3a3a3?text=IMG'}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-primary-950">{item.name?.en}</p>
                <p className="text-xs text-primary-400 mt-0.5" dir="rtl">{item.name?.ar}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  {item.size && (
                    <span className="text-xs border border-primary-200 px-2 py-0.5 rounded">{item.size}</span>
                  )}
                  {item.color && (
                    <span className="text-xs bg-primary-100 text-primary-600 px-2 py-0.5 rounded">{item.color}</span>
                  )}
                  <span className="text-xs text-primary-400">Qty: {item.quantity}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-primary-950">{(item.price * item.quantity).toLocaleString()} EGP</p>
                <p className="text-xs text-primary-400">{item.price} × {item.quantity}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Update Status */}
      <div className="bg-white rounded-xl border border-primary-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <FiRefreshCw size={15} className="text-primary-500" />
          <h2 className="text-xs font-semibold tracking-widest uppercase text-primary-500">Update Order</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-5">
          <div>
            <label className="block text-xs text-primary-500 mb-1.5">Order Status</label>
            <select
              value={orderStatus}
              onChange={(e) => setOrderStatus(e.target.value)}
              className="input-field"
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-primary-500 mb-1.5">Payment Status</label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="input-field"
            >
              {PAYMENT_STATUSES.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-primary-500 mb-1.5">Tracking Number</label>
            <input
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="input-field"
              placeholder="e.g. EG123456789"
            />
          </div>
        </div>

        {/* Preview of changes */}
        {(orderStatus !== order.orderStatus || paymentStatus !== order.paymentStatus) && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
            Unsaved changes — click "Save Changes" to apply
          </div>
        )}

        <button
          onClick={handleUpdate}
          disabled={mutation.isPending}
          className="btn-primary disabled:opacity-60 flex items-center gap-2"
        >
          {mutation.isPending ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
          ) : (
            <><FiCheckCircle size={15} /> Save Changes</>
          )}
        </button>
      </div>
    </div>
  );
}
