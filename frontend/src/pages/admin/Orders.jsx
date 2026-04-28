import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { getAllOrders } from '../../services/orderService';
import { FiSearch, FiEye, FiShoppingBag } from 'react-icons/fi';

const ORDER_STATUS = {
  pending:   { badge: 'bg-amber-100 text-amber-800',   dot: 'bg-amber-400',   label: 'Pending' },
  confirmed: { badge: 'bg-blue-100 text-blue-800',     dot: 'bg-blue-400',    label: 'Confirmed' },
  shipped:   { badge: 'bg-violet-100 text-violet-800', dot: 'bg-violet-400',  label: 'Shipped' },
  delivered: { badge: 'bg-emerald-100 text-emerald-800',dot: 'bg-emerald-400',label: 'Delivered' },
  cancelled: { badge: 'bg-red-100 text-red-800',       dot: 'bg-red-400',     label: 'Cancelled' },
};

const PAYMENT_STATUS = {
  pending:            'bg-gray-100 text-gray-600',
  transfer_submitted: 'bg-amber-100 text-amber-700',
  paid:               'bg-emerald-100 text-emerald-700',
  failed:             'bg-red-100 text-red-700',
  refunded:           'bg-orange-100 text-orange-700',
};

const PAYMENT_METHOD = {
  cash:   { label: 'Cash', icon: '💵' },
  stripe: { label: 'Stripe', icon: '💳' },
  paymob: { label: 'Paymob', icon: '🏦' },
};

export default function AdminOrders() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['adminOrders', page, statusFilter],
    queryFn: () => getAllOrders({ page, limit: 15, status: statusFilter }),
    refetchInterval: 30000
  });

  const statuses = [
    { value: '', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const filtered = search
    ? data?.orders?.filter(o =>
        o.customerInfo?.name?.toLowerCase().includes(search.toLowerCase()) ||
        o.customerInfo?.phone?.includes(search) ||
        o._id.includes(search)
      )
    : data?.orders;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-950">Orders</h1>
          <p className="text-sm text-primary-400 mt-0.5">{data?.total || 0} total orders</p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {statuses.map((s) => (
          <button
            key={s.value}
            onClick={() => { setStatusFilter(s.value); setPage(1); }}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
              statusFilter === s.value
                ? 'bg-primary-950 text-white shadow-sm'
                : 'bg-white border border-primary-200 text-primary-600 hover:border-primary-400'
            }`}
          >
            {s.label}
            {s.value === '' && data?.total ? ` (${data.total})` : ''}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <FiSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
        <input
          value={searchInput}
          onChange={(e) => { setSearchInput(e.target.value); setSearch(e.target.value); }}
          placeholder="Search by name, phone, or order ID..."
          className="input-field pl-9 py-2.5 text-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-primary-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array(6).fill(0).map((_, i) => <div key={i} className="h-14 bg-primary-100 animate-pulse rounded" />)}
          </div>
        ) : filtered?.length === 0 ? (
          <div className="py-20 text-center">
            <FiShoppingBag size={40} className="mx-auto text-primary-200 mb-3" />
            <p className="text-primary-400 text-sm">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primary-50 border-b border-primary-100">
                  {['Order ID', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', ''].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-medium tracking-widest uppercase text-primary-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-50">
                {filtered?.map((order, i) => {
                  const os = ORDER_STATUS[order.orderStatus] || ORDER_STATUS.pending;
                  const pm = PAYMENT_METHOD[order.paymentMethod] || { label: order.paymentMethod, icon: '💰' };
                  return (
                    <motion.tr
                      key={order._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="hover:bg-primary-50/50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <Link to={`/admin/orders/${order._id}`} className="font-mono text-xs font-semibold hover:underline text-primary-950">
                          #{order._id.slice(-8).toUpperCase()}
                        </Link>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium">{order.customerInfo?.name}</p>
                        <p className="text-xs text-primary-400">{order.customerInfo?.phone}</p>
                        <p className="text-xs text-primary-300">{order.customerInfo?.city}</p>
                      </td>
                      <td className="px-5 py-4 text-primary-500 text-xs">
                        {order.orderItems?.length} item(s)
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold">{order.totalPrice?.toLocaleString()} EGP</p>
                        <p className="text-xs text-primary-400">{pm.icon} {pm.label}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${PAYMENT_STATUS[order.paymentStatus] || 'bg-gray-100 text-gray-600'}`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${os.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${os.dot}`} />
                          {os.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-primary-400 text-xs">
                        {new Date(order.createdAt).toLocaleDateString()}
                        <br />
                        <span className="text-primary-300">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          to={`/admin/orders/${order._id}`}
                          className="inline-flex items-center gap-1.5 text-xs text-primary-500 hover:text-primary-950 transition-colors font-medium"
                        >
                          <FiEye size={14} /> View
                        </Link>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {data && data.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-primary-100">
            <p className="text-xs text-primary-400">Page {page} of {data.pages}</p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-xs border border-primary-200 rounded hover:border-primary-950 disabled:opacity-40 transition-colors">Prev</button>
              {Array.from({ length: Math.min(data.pages, 7) }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 text-xs rounded transition-colors ${page === p ? 'bg-primary-950 text-white' : 'border border-primary-200 hover:border-primary-950'}`}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(data.pages, p + 1))} disabled={page === data.pages} className="px-3 py-1.5 text-xs border border-primary-200 rounded hover:border-primary-950 disabled:opacity-40 transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
