import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { getProducts } from '../services/productService';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import PageTransition from '../components/ui/PageTransition';
import { FiFilter, FiX } from 'react-icons/fi';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLORS = ['Black', 'White', 'Grey', 'Navy', 'Beige', 'Brown'];
const CATEGORIES = ['Hoodies', 'T-Shirts', 'Jackets', 'Pants', 'Accessories'];

export default function Shop() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterOpen, setFilterOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    size: searchParams.get('size') || '',
    color: searchParams.get('color') || '',
    featured: searchParams.get('featured') || '',
    newCollection: searchParams.get('newCollection') || '',
    page: 1
  });

  useEffect(() => {
    const params = {};
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
    setSearchParams(params);
  }, [filters]);

  const { data, isLoading } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => getProducts(filters),
    keepPreviousData: true
  });

  const setFilter = (key, val) => setFilters((f) => ({ ...f, [key]: val, page: 1 }));
  const clearFilters = () => setFilters({ search: '', category: '', minPrice: '', maxPrice: '', size: '', color: '', featured: '', newCollection: '', page: 1 });

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <h3 className="text-xs tracking-widest uppercase font-medium mb-3">{t('shop.category')}</h3>
        <div className="space-y-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setFilter('category', filters.category === c ? '' : c)}
              className={`block text-sm w-full text-left py-1 transition-colors ${filters.category === c ? 'text-primary-950 font-medium' : 'text-primary-500 hover:text-primary-950'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <h3 className="text-xs tracking-widest uppercase font-medium mb-3">{t('shop.price_range')}</h3>
        <div className="flex gap-2">
          <input type="number" placeholder="Min" value={filters.minPrice} onChange={(e) => setFilter('minPrice', e.target.value)} className="input-field text-xs py-2" />
          <input type="number" placeholder="Max" value={filters.maxPrice} onChange={(e) => setFilter('maxPrice', e.target.value)} className="input-field text-xs py-2" />
        </div>
      </div>

      {/* Size */}
      <div>
        <h3 className="text-xs tracking-widest uppercase font-medium mb-3">{t('shop.size')}</h3>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => setFilter('size', filters.size === s ? '' : s)}
              className={`w-10 h-10 text-xs border transition-colors ${filters.size === s ? 'bg-primary-950 text-white border-primary-950' : 'border-primary-300 hover:border-primary-950'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <h3 className="text-xs tracking-widest uppercase font-medium mb-3">{t('shop.color')}</h3>
        <div className="space-y-2">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setFilter('color', filters.color === c ? '' : c)}
              className={`block text-sm w-full text-left py-1 transition-colors ${filters.color === c ? 'text-primary-950 font-medium' : 'text-primary-500 hover:text-primary-950'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <button onClick={clearFilters} className="text-xs tracking-widest uppercase text-red-500 hover:text-red-700 transition-colors">
        {t('shop.clear_filters')}
      </button>
    </div>
  );

  return (
    <PageTransition>
      <div className="pt-20 md:pt-24">
        <div className="container-custom py-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="section-title">{t('shop.title')}</h1>
            <button onClick={() => setFilterOpen(!filterOpen)} className="flex items-center gap-2 text-sm tracking-widest uppercase md:hidden">
              <FiFilter size={16} /> {t('shop.filter')}
            </button>
          </div>

          {/* Search */}
          <div className="mb-8">
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
              placeholder={t('shop.search_placeholder')}
              className="input-field max-w-md"
            />
          </div>

          <div className="flex gap-8">
            {/* Desktop Filters */}
            <aside className="hidden md:block w-56 flex-shrink-0">
              <FilterPanel />
            </aside>

            {/* Mobile Filters */}
            <AnimatePresence>
              {filterOpen && (
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl p-6 overflow-y-auto md:hidden"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="font-medium tracking-widest uppercase text-sm">{t('shop.filter')}</h2>
                    <button onClick={() => setFilterOpen(false)}><FiX size={20} /></button>
                  </div>
                  <FilterPanel />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Products */}
            <div className="flex-1">
              {data && (
                <p className="text-sm text-primary-500 mb-6">
                  {t('shop.showing', { count: data.total })}
                </p>
              )}

              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : data?.products?.length === 0 ? (
                <div className="text-center py-20 text-primary-400">
                  <p className="text-lg">{t('shop.no_products')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {data?.products?.map((p) => <ProductCard key={p._id} product={p} />)}
                </div>
              )}

              {/* Pagination */}
              {data && data.pages > 1 && (
                <div className="flex justify-center gap-2 mt-12">
                  {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setFilters((f) => ({ ...f, page: p }))}
                      className={`w-10 h-10 text-sm border transition-colors ${filters.page === p ? 'bg-primary-950 text-white border-primary-950' : 'border-primary-300 hover:border-primary-950'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
