import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { getDashboardStats } from '../../services/orderService';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  FiDollarSign, FiShoppingBag, FiPackage, FiTrendingUp,
  FiClock, FiCheckCircle, FiTruck, FiXCircle
} from 'react-icons/fi';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const STATUS_COLORS = {
  pending:   { bg: 'bg-amber-50',   text: 'text-amber-700',   badge: 'bg-amber-100 text-amber-800',   dot: 'bg-amber-400' },
  confirmed: { bg: 'bg-blue-50',    text: 'text-blue-700',    badge: 'bg-blue-100 text-blue-800',     dot: 'bg-blue-400' },
  shipped:   { bg: 'bg-violet-50',  text: 'text-violet-700',  badge: 'bg-violet-100 text-violet-800', dot: 'bg-violet-400' },
  delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-800',dot: 'bg-emerald-400' },
  cancelled: { bg: 'bg-red-50',     text: 'text-red-700',     badge: 'bg-red-100 text-red-800',       dot: 'bg-red-400' },
};

const PIE_COLORS = ['#f59e0b','#3b82f6','#8b5cf6','#10b981','#ef4444'];

const StatusIcon = ({ status }) => {
  const icons = { pending: FiClock, confirmed: FiCheckCircle, shipped: FiTruck, delivered: FiCheckCircle, cancelled: FiXCircle };
  const Icon = icons[status] || FiClock;
  return <Icon size={14} />;
};

export default function Dashboard() {
  const { t } = useTranslation();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
    refetchInterval: 60000
  });

  const chartData = stats?.monthlyRevenue?.map((m) => ({
    name: MONTHS[m._id.month - 1],
    revenue: m.revenue,
    orders: m.orders
  })) || [];

  const pieData = stats?.ordersByStatus?.map((s) => ({
    name: s._id,
    value: s.count
  })) || [];

  const statCards = [
    {
      label: 'Total Revenue',
      value: `${(stats?.totalRevenue || 0).toLocaleString()} EGP`,
      icon: FiDollarSign,
      color: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      change: '+12%'
    },
    {
      label: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: FiShoppingBag,
      color: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      change: '+8%'
    },
    {
      label: 'Pending Orders',
      value: stats?.ordersByStatus?.find(s => s._id === 'pending')?.count || 0,
      icon: FiClock,
      color: 'from-amber-500 to-amber-600',
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      change: 'needs action'
    },
    {
      label: 'Delivered',
      value: stats?.ordersByStatus?.find(s => s._id === 'delivered')?.count || 0,
      icon: FiTrendingUp,
      color: 'from-violet-500 to-violet-600',
      bg: 'bg-violet-50',
      text: 'text-violet-600',
      change: '+5%'
    }
  ];

  if (isLoading) return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array(4).fill(0).map((_, i) => <div key={i} className="h-28 bg-white rounded-xl" />)}
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-72 bg-white rounded-xl" />
        <div className="h-72 bg-white rounded-xl" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-950">Dashboard</h1>
          <p className="text-sm text-primary-400 mt-0.5">Welcome back, Admin</p>
        </div>
        <Link to="/admin/products/new" className="btn-primary text-sm flex items-center gap-2">
          <FiPackage size={15} /> Add Product
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, bg, text, change }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white p-5 rounded-xl border border-primary-100 shadow-sm"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bg} ${text}`}>
                <Icon size={20} />
              </div>
              <span className="text-xs text-primary-400">{change}</span>
            </div>
            <p className="text-2xl font-bold text-primary-950 mb-0.5">{value}</p>
            <p className="text-xs text-primary-500 tracking-wide">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-primary-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-primary-950">Revenue Overview</h2>
            <span className="text-xs text-primary-400">Last 6 months</span>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#171717" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#171717" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#a3a3a3' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#a3a3a3' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e5e5', fontSize: 12 }} />
                <Area type="monotone" dataKey="revenue" stroke="#171717" fill="url(#revGrad)" strokeWidth={2} dot={{ r: 3, fill: '#171717' }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-primary-300 text-sm">No data yet</div>
          )}
        </div>

        {/* Orders by Status Pie */}
        <div className="bg-white p-6 rounded-xl border border-primary-100 shadow-sm">
          <h2 className="text-sm font-semibold text-primary-950 mb-6">Orders by Status</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="45%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-primary-300 text-sm">No data yet</div>
          )}
        </div>
      </div>

      {/* Orders Bar Chart */}
      {chartData.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-primary-100 shadow-sm">
          <h2 className="text-sm font-semibold text-primary-950 mb-6">Orders per Month</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#a3a3a3' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#a3a3a3' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e5e5', fontSize: 12 }} />
              <Bar dataKey="orders" fill="#171717" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-primary-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-primary-100">
          <h2 className="text-sm font-semibold text-primary-950">Recent Orders</h2>
          <Link to="/admin/orders" className="text-xs text-primary-400 hover:text-primary-950 transition-colors tracking-widest uppercase">
            View All →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary-50 border-b border-primary-100">
                {['Order', 'Customer', 'Items', 'Total', 'Status', 'Date'].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-medium tracking-widest uppercase text-primary-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-50">
              {stats?.recentOrders?.length ? stats.recentOrders.map((order) => {
                const sc = STATUS_COLORS[order.orderStatus] || STATUS_COLORS.pending;
                return (
                  <tr key={order._id} className="hover:bg-primary-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <Link to={`/admin/orders/${order._id}`} className="font-mono text-xs font-medium hover:underline">
                        #{order._id.slice(-8).toUpperCase()}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-sm">{order.customerInfo?.name}</p>
                      <p className="text-xs text-primary-400">{order.customerInfo?.phone}</p>
                    </td>
                    <td className="px-6 py-4 text-primary-500 text-xs">{order.orderItems?.length} item(s)</td>
                    <td className="px-6 py-4 font-semibold">{order.totalPrice?.toLocaleString()} EGP</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${sc.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-primary-400 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-primary-300 text-sm">No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
