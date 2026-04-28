import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { FiUsers, FiSearch, FiMail, FiPhone } from 'react-icons/fi';

export default function AdminCustomers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['adminCustomers', page],
    queryFn: () => api.get(`/users?page=${page}&limit=15`).then((r) => r.data)
  });

  const filtered = search
    ? data?.users?.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.phone?.includes(search)
      )
    : data?.users;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-950">Customers</h1>
          <p className="text-sm text-primary-400 mt-0.5">{data?.total || 0} registered customers</p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <FiSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email or phone..."
          className="input-field pl-9 py-2.5 text-sm"
        />
      </div>

      <div className="bg-white rounded-xl border border-primary-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array(6).fill(0).map((_, i) => <div key={i} className="h-14 bg-primary-100 animate-pulse rounded" />)}
          </div>
        ) : filtered?.length === 0 ? (
          <div className="py-20 text-center">
            <FiUsers size={40} className="mx-auto text-primary-200 mb-3" />
            <p className="text-primary-400 text-sm">No customers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primary-50 border-b border-primary-100">
                  {['Customer', 'Contact', 'Role', 'Joined'].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-medium tracking-widest uppercase text-primary-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-50">
                {filtered?.map((user, i) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-primary-50/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold text-sm flex-shrink-0">
                          {user.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <p className="font-medium text-primary-950">{user.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs text-primary-500">
                          <FiMail size={12} /> {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-primary-400">
                            <FiPhone size={12} /> {user.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        user.role === 'admin'
                          ? 'bg-primary-950 text-white'
                          : 'bg-primary-100 text-primary-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-primary-400 text-xs">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && data.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-primary-100">
            <p className="text-xs text-primary-400">Page {page} of {data.pages}</p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-xs border border-primary-200 rounded hover:border-primary-950 disabled:opacity-40 transition-colors">Prev</button>
              {Array.from({ length: Math.min(data.pages, 5) }, (_, i) => i + 1).map((p) => (
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
