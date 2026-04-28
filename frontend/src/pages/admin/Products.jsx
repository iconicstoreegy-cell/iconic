import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { getProducts, deleteProduct } from '../../services/productService';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiPackage } from 'react-icons/fi';

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['adminProducts', page, search],
    queryFn: () => getProducts({ page, limit: 10, search })
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      toast.success('Product deleted');
      queryClient.invalidateQueries(['adminProducts']);
      setConfirmDelete(null);
    },
    onError: () => toast.error('Failed to delete product')
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-950">Products</h1>
          <p className="text-sm text-primary-400 mt-0.5">{data?.total || 0} total products</p>
        </div>
        <Link to="/admin/products/new" className="btn-primary flex items-center gap-2 text-sm">
          <FiPlus size={16} /> Add Product
        </Link>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <FiSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products..."
            className="input-field pl-9 py-2.5 text-sm"
          />
        </div>
        <button type="submit" className="btn-outline text-sm px-4">Search</button>
        {search && (
          <button type="button" onClick={() => { setSearch(''); setSearchInput(''); }} className="text-sm text-primary-400 hover:text-primary-700 px-2">
            Clear
          </button>
        )}
      </form>

      <div className="bg-white rounded-xl border border-primary-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="flex gap-4 items-center animate-pulse">
                <div className="w-12 h-16 bg-primary-100 rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-primary-100 rounded w-1/3" />
                  <div className="h-3 bg-primary-100 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : data?.products?.length === 0 ? (
          <div className="py-20 text-center">
            <FiPackage size={40} className="mx-auto text-primary-200 mb-3" />
            <p className="text-primary-400 text-sm">No products found</p>
            <Link to="/admin/products/new" className="btn-primary text-sm mt-4 inline-block">Add your first product</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primary-50 border-b border-primary-100">
                  {['Product', 'Category', 'Price', 'Variants', 'Stock', 'Flags', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-medium tracking-widest uppercase text-primary-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-50">
                {data?.products?.map((product, i) => {
                  const totalStock = product.variants?.reduce((s, v) => s + (v.stock || 0), 0) || 0;
                  const uniqueSizes = [...new Set(product.variants?.map(v => v.size).filter(Boolean))];
                  const uniqueColors = [...new Set(product.variants?.map(v => v.colorHex).filter(Boolean))];
                  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
                  return (
                    <motion.tr
                      key={product._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-primary-50/50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-16 flex-shrink-0 bg-primary-100 rounded-lg overflow-hidden">
                            <img
                              src={product.images?.[0] || 'https://placehold.co/48x64/f5f5f5/a3a3a3?text=IMG'}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-primary-950 truncate max-w-[180px]">{product.name?.en}</p>
                            <p className="text-xs text-primary-400 truncate max-w-[180px]" dir="rtl">{product.name?.ar}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs bg-primary-100 text-primary-700 px-2.5 py-1 rounded-full">
                          {product.category?.en}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {hasDiscount ? (
                          <div>
                            <p className="font-semibold text-primary-950">{product.discountPrice} EGP</p>
                            <p className="text-xs text-primary-400 line-through">{product.price} EGP</p>
                          </div>
                        ) : (
                          <p className="font-semibold">{product.price} EGP</p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <div className="flex flex-wrap gap-1">
                            {uniqueSizes.slice(0, 4).map((s) => (
                              <span key={s} className="text-[10px] border border-primary-200 px-1.5 py-0.5 rounded">{s}</span>
                            ))}
                          </div>
                          <div className="flex gap-1">
                            {uniqueColors.slice(0, 6).map((hex) => (
                              <span key={hex} className="w-3.5 h-3.5 rounded-full border border-primary-200" style={{ backgroundColor: hex }} />
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          totalStock === 0 ? 'bg-red-100 text-red-700' :
                          totalStock < 10 ? 'bg-amber-100 text-amber-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {totalStock === 0 ? 'Out of stock' : `${totalStock} pcs`}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          {product.isFeatured && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full w-fit">⭐ Featured</span>}
                          {product.isNewCollection && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full w-fit">🆕 New</span>}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/admin/products/${product._id}/edit`}
                            className="p-2 text-primary-400 hover:text-primary-950 hover:bg-primary-100 rounded-lg transition-colors"
                          >
                            <FiEdit2 size={15} />
                          </Link>
                          <button
                            onClick={() => setConfirmDelete(product)}
                            className="p-2 text-primary-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </div>
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
              {Array.from({ length: Math.min(data.pages, 5) }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 text-xs rounded transition-colors ${page === p ? 'bg-primary-950 text-white' : 'border border-primary-200 hover:border-primary-950'}`}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(data.pages, p + 1))} disabled={page === data.pages} className="px-3 py-1.5 text-xs border border-primary-200 rounded hover:border-primary-950 disabled:opacity-40 transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl"
            >
              <h3 className="font-semibold text-lg mb-2">Delete Product?</h3>
              <p className="text-sm text-primary-500 mb-6">
                Are you sure you want to delete <strong>"{confirmDelete.name?.en}"</strong>? This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => deleteMutation.mutate(confirmDelete._id)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 bg-red-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-60"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Yes, Delete'}
                </button>
                <button onClick={() => setConfirmDelete(null)} className="flex-1 btn-outline text-sm">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
