import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiShoppingBag } from 'react-icons/fi';

export default function ProductCard({ product }) {
  const { i18n, t } = useTranslation();
  const lang = i18n.language;
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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group cursor-pointer"
    >
      <Link to={`/product/${product.slug}`}>
        {/* Image */}
        <div className="relative overflow-hidden aspect-[3/4] bg-primary-100 mb-3">
          <motion.img
            key={imgIdx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            src={product.images?.[imgIdx] || 'https://placehold.co/400x533/f5f5f5/a3a3a3?text=AL-SHAER'}
            alt={name}
            className="w-full h-full object-cover"
            loading="lazy"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {product.isNewCollection && (
              <span className="bg-primary-950 text-white text-xs px-2 py-1 tracking-widest">NEW</span>
            )}
            {product.discountPrice > 0 && (
              <span className="bg-red-600 text-white text-xs px-2 py-1 tracking-widest">SALE</span>
            )}
          </div>

          {/* Quick add overlay */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-0 left-0 right-0 bg-primary-950 text-white py-3 flex items-center justify-center gap-2 text-xs tracking-widest uppercase"
          >
            <FiShoppingBag size={14} />
            {t('product.add_to_cart')}
          </motion.div>
        </div>

        {/* Info */}
        <div>
          <h3 className="text-sm font-medium text-primary-900 mb-1 truncate">{name}</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-primary-950">
              {price} {t('common.egp')}
            </span>
            {originalPrice && (
              <span className="text-xs text-primary-400 line-through">
                {originalPrice} {t('common.egp')}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
