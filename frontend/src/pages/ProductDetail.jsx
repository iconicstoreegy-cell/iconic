import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { getProductBySlug, getRelatedProducts } from '../services/productService';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import PageTransition from '../components/ui/PageTransition';
import { FiStar, FiChevronLeft } from 'react-icons/fi';

export default function ProductDetail() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { addToCart } = useCart();

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => getProductBySlug(slug)
  });

  const { data: related } = useQuery({
    queryKey: ['related', product?._id],
    queryFn: () => getRelatedProducts(product._id),
    enabled: !!product?._id
  });

  if (isLoading) return (
    <div className="pt-24 container-custom py-10">
      <div className="grid md:grid-cols-2 gap-10 animate-pulse">
        <div className="aspect-[3/4] bg-primary-100" />
        <div className="space-y-4">
          <div className="h-8 bg-primary-100 w-3/4" />
          <div className="h-6 bg-primary-100 w-1/4" />
          <div className="h-4 bg-primary-100 w-full" />
          <div className="h-4 bg-primary-100 w-full" />
        </div>
      </div>
    </div>
  );

  if (!product) return null;

  const name = product.name?.[lang] || product.name?.en;
  const description = product.description?.[lang] || product.description?.en;
  const price = product.discountPrice > 0 ? product.discountPrice : product.price;

  // Get unique sizes and colors from variants
  const sizes = [...new Set(product.variants?.map((v) => v.size))];
  const colors = [...new Set(product.variants?.map((v) => v.color))];

  // Check stock for selected variant
  const selectedVariant = product.variants?.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  );
  const inStock = !selectedSize || !selectedColor || (selectedVariant?.stock > 0);

  const handleAddToCart = () => {
    if (!selectedSize) { toast.error(t('product.select_size')); return; }
    if (!selectedColor) { toast.error(t('product.select_color')); return; }
    if (!inStock) { toast.error(t('product.out_of_stock')); return; }
    addToCart(product, selectedSize, selectedColor, qty);
    toast.success(`${name} added to cart`);
  };

  return (
    <PageTransition>
      <div className="pt-20 md:pt-24">
        <div className="container-custom py-10">
          {/* Breadcrumb */}
          <Link to="/shop" className="flex items-center gap-1 text-sm text-primary-500 hover:text-primary-950 mb-8 transition-colors">
            <FiChevronLeft size={16} /> {t('nav.shop')}
          </Link>

          <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
            {/* Gallery */}
            <div className="space-y-3">
              <motion.div
                key={activeImg}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="aspect-[3/4] overflow-hidden bg-primary-100"
              >
                <img
                  src={product.images?.[activeImg] || 'https://placehold.co/600x800/f5f5f5/a3a3a3?text=AL-SHAER'}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              </motion.div>
              {product.images?.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`flex-shrink-0 w-20 aspect-square overflow-hidden border-2 transition-colors ${activeImg === i ? 'border-primary-950' : 'border-transparent'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="space-y-6">
              <div>
                <p className="text-xs tracking-widest uppercase text-primary-400 mb-2">
                  {product.category?.[lang] || product.category?.en}
                </p>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-950 mb-3">{name}</h1>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-semibold">{price} {t('common.egp')}</span>
                  {product.discountPrice > 0 && (
                    <span className="text-lg text-primary-400 line-through">{product.price} {t('common.egp')}</span>
                  )}
                </div>
                {/* Rating */}
                {product.numReviews > 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    {Array(5).fill(0).map((_, i) => (
                      <FiStar key={i} size={14} className={i < Math.round(product.rating) ? 'text-gold-400 fill-gold-400' : 'text-primary-300'} />
                    ))}
                    <span className="text-xs text-primary-500 ml-1">({product.numReviews})</span>
                  </div>
                )}
              </div>

              {/* Size */}
              <div>
                <h3 className="text-xs tracking-widest uppercase font-medium mb-3">{t('product.select_size')}</h3>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`w-12 h-12 text-sm border transition-colors ${selectedSize === s ? 'bg-primary-950 text-white border-primary-950' : 'border-primary-300 hover:border-primary-950'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <h3 className="text-xs tracking-widest uppercase font-medium mb-3">{t('product.select_color')}</h3>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`px-4 py-2 text-sm border transition-colors ${selectedColor === c ? 'bg-primary-950 text-white border-primary-950' : 'border-primary-300 hover:border-primary-950'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-4">
                <h3 className="text-xs tracking-widest uppercase font-medium">{t('cart.quantity')}</h3>
                <div className="flex items-center border border-primary-300">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-primary-50 transition-colors">−</button>
                  <span className="w-10 text-center text-sm">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-primary-50 transition-colors">+</button>
                </div>
              </div>

              {/* Stock status */}
              {selectedSize && selectedColor && (
                <p className={`text-sm ${inStock ? 'text-green-600' : 'text-red-500'}`}>
                  {inStock ? t('product.in_stock') : t('product.out_of_stock')}
                </p>
              )}

              {/* Add to cart */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAddToCart}
                disabled={!inStock && selectedSize && selectedColor}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('product.add_to_cart')}
              </motion.button>

              {/* Description */}
              <div className="border-t border-primary-100 pt-6">
                <h3 className="text-xs tracking-widest uppercase font-medium mb-3">{t('product.description')}</h3>
                <p className="text-primary-600 text-sm leading-relaxed">{description}</p>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {related?.length > 0 && (
            <section className="mt-20">
              <h2 className="section-title mb-8">{t('product.related')}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {related.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
            </section>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
