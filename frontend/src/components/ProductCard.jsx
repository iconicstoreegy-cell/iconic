import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiShoppingBag, FiArrowRight } from 'react-icons/fi';

export default function ProductCard({ product }) {
  const { i18n, t } = useTranslation();
  const lang = i18n.language;
  const isRTL = lang === 'ar';
  const [hovered, setHovered] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);

  const name = product.name?.[lang] || product.name?.en || '';
  const price = product.discountPrice > 0 ? product.discountPrice : product.price;
  const originalPrice = product.discountPrice > 0 ? product.price : null;

  const handleMouseEnter = () => {
    setHovered(true);
    if (product.images?.length > 1) setImgIdx(1);
  };
  const handleMouseLeave = () => {
    setHovered(false);
    setImgIdx(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group cursor-pointer flex flex-col h-full bg-white rounded-3xl p-3 shadow-sm hover:shadow-soft transition-all duration-500"
    >
      <Link to={`/product/${product.slug}`} className="flex-1 flex flex-col">
        {/* Image Container */}
        <div className="relative overflow-hidden aspect-[4/5] bg-neutral-100 rounded-2xl mb-4">
          <AnimatePresence mode="wait">
            <motion.img
              key={imgIdx}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              src={product.images?.[imgIdx] || 'https://placehold.co/400x533/f4f4f5/a1a1aa?text=TreVero'}
              alt={name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </AnimatePresence>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {product.isNewCollection && (
              <span className="bg-white/90 backdrop-blur-sm text-primary-950 text-[10px] font-bold px-3 py-1 rounded-full shadow-sm tracking-wider">
                NEW
              </span>
            )}
            {product.discountPrice > 0 && (
              <span className="bg-accent-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm tracking-wider">
                SALE
              </span>
            )}
          </div>

          {/* Quick add overlay */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute bottom-3 left-3 right-3"
          >
            <button className="w-full bg-white/95 backdrop-blur-md text-primary-950 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold tracking-wide shadow-soft hover:bg-primary-950 hover:text-white transition-colors">
              <FiShoppingBag size={15} />
              {t('product.add_to_cart')}
            </button>
          </motion.div>
        </div>

        {/* Info Container */}
        <div className="px-2 pb-2 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-[15px] font-medium text-neutral-800 mb-1 line-clamp-1 group-hover:text-accent-500 transition-colors">
              {name}
            </h3>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base font-semibold text-primary-950">
                {price} {t('common.egp')}
              </span>
              {originalPrice && (
                <span className="text-xs font-medium text-neutral-400 line-through">
                  {originalPrice} {t('common.egp')}
                </span>
              )}
            </div>
            
            {/* Minimal Arrow indicator */}
            <motion.div 
              initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
              animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : (isRTL ? 10 : -10) }}
              transition={{ duration: 0.3 }}
              className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center text-primary-950"
            >
              <FiArrowRight className={isRTL ? 'rotate-180' : ''} size={14} />
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
