import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../services/productService';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import PageTransition from '../components/ui/PageTransition';
import { FiArrowRight, FiArrowLeft, FiInstagram } from 'react-icons/fi';

const CATEGORIES = [
  { en: 'Hoodies',  ar: 'هوديز',     img: 'https://wearthepeace.com/cdn/shop/products/human-embroidered-hoodie-wear-the-peace-585045_1445x.jpg?v=1694209411' },
  { en: 'T-Shirts', ar: 'تيشيرتات', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSj9dEFMDZG32etPpUbUgtYzTEQGByJQbbPug&s' },
  { en: 'Jackets',  ar: 'جاكيتات',  img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5sm2BSyMiZO39Cl2YoMsVcq-nZlblVg9f4g&s' },
  { en: 'Pants',    ar: 'بناطيل',   img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjufOLO5420yL7Wu_PWB5ij3Qv00HVMMVy_Q&s' }
];

const fadeUp = { hidden: { opacity: 0, y: 32 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } };
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

export default function Home() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const isRTL = lang === 'ar';
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const ArrowIcon = isRTL ? FiArrowLeft : FiArrowRight;

  const { data: featuredData, isLoading: loadingFeatured } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => getProducts({ featured: true, limit: 4 })
  });

  const { data: newData, isLoading: loadingNew } = useQuery({
    queryKey: ['products', 'new'],
    queryFn: () => getProducts({ newCollection: true, limit: 4 })
  });

  return (
    <PageTransition>

      {/* ── HERO ── */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center bg-primary-950 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-50"
          style={{ backgroundImage: "url('TreVero.png')" }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />

        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger}
          className="relative text-center text-white px-4 max-w-4xl mx-auto"
        >
          <motion.p
            variants={fadeUp}
            className="text-[11px] tracking-[0.5em] uppercase text-white/60 mb-6"
          >
            {isRTL ? 'تريفيرو — مصر' : 'TreVero — Egypt'}
          </motion.p>

          <motion.h1
            variants={fadeUp}
            className="font-display text-5xl sm:text-7xl lg:text-8xl font-bold leading-[1.05] mb-6"
          >
            {t('home.hero_title')}
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-white/70 text-base md:text-lg mb-10 max-w-lg mx-auto leading-relaxed"
          >
            {t('home.hero_subtitle')}
          </motion.p>

          <motion.div variants={fadeUp} className="flex items-center justify-center gap-4 flex-wrap">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link to="/shop" className="btn-primary inline-flex items-center gap-2 px-8 py-3.5">
                {t('home.hero_cta')} <ArrowIcon size={16} />
              </Link>
            </motion.div>
            <Link to="/shop?newCollection=true" className="text-white/70 hover:text-white text-sm tracking-widest uppercase transition-colors border-b border-white/30 hover:border-white pb-0.5">
              {t('home.new_collection')}
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll line */}
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
        >
          <span className="text-[10px] tracking-[0.3em] uppercase text-white/40">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-white/40 to-transparent" />
        </motion.div>
      </section>

      {/* ── MARQUEE STRIP ── */}
      <div className="bg-primary-950 py-3 overflow-hidden">
        <motion.div
          animate={{ x: isRTL ? [0, 600] : [0, -600] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          className="flex gap-12 whitespace-nowrap"
        >
          {Array(6).fill(['NEW COLLECTION', 'HANDMADE IN EGYPT', 'PREMIUM QUALITY', 'FREE SHIPPING', 'LIMITED DROPS']).flat().map((text, i) => (
            <span key={i} className="text-xs tracking-[0.4em] uppercase text-white/40 flex-shrink-0">
              {text} <span className="text-white/20 mx-4">✦</span>
            </span>
          ))}
        </motion.div>
      </div>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="container-custom py-24">
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
          className="flex items-end justify-between mb-12"
        >
          <motion.div variants={fadeUp}>
            <p className="text-xs tracking-[0.4em] uppercase text-primary-400 mb-2">Curated for you</p>
            <h2 className="section-title">{t('home.featured')}</h2>
          </motion.div>
          <motion.div variants={fadeUp}>
            <Link
              to="/shop?featured=true"
              className="hidden md:inline-flex items-center gap-2 text-xs tracking-widest uppercase text-primary-500 hover:text-primary-950 transition-colors border-b border-primary-200 hover:border-primary-950 pb-0.5"
            >
              {isRTL ? 'عرض الكل' : 'View All'} <ArrowIcon size={13} />
            </Link>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {loadingFeatured
            ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
            : featuredData?.products?.length
              ? featuredData.products.map((p) => <ProductCard key={p._id} product={p} />)
              : (
                <div className="col-span-4 py-16 text-center text-primary-300 text-sm">
                  {isRTL ? 'لا توجد منتجات مميزة بعد' : 'No featured products yet — add some from the admin panel'}
                </div>
              )
          }
        </div>
      </section>

      {/* ── FULL-WIDTH COLLECTION BANNER ── */}
      <section className="relative overflow-hidden bg-primary-950 min-h-[420px] flex items-center">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600')] bg-cover bg-center opacity-20" />
        <div className="relative container-custom py-20 grid md:grid-cols-2 gap-10 items-center">
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="text-white"
          >
            <motion.p variants={fadeUp} className="text-xs tracking-[0.4em] uppercase text-white/50 mb-4">SS 2025</motion.p>
            <motion.h2 variants={fadeUp} className="font-display text-4xl md:text-6xl font-bold mb-6 leading-tight">
              {t('home.new_collection')}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/60 mb-8 max-w-sm leading-relaxed">
              {isRTL
                ? 'أحدث إصداراتنا — قطع حصرية مصنوعة يدوياً بأعلى معايير الجودة'
                : 'Our latest drops — exclusive pieces handcrafted to the highest standards'}
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link
                to="/shop?newCollection=true"
                className="inline-flex items-center gap-2 border border-white text-white px-8 py-3.5 text-sm tracking-widest uppercase hover:bg-white hover:text-primary-950 transition-all duration-300"
              >
                {t('home.hero_cta')} <ArrowIcon size={15} />
              </Link>
            </motion.div>
          </motion.div>

          {/* New collection grid preview */}
          <div className="grid grid-cols-2 gap-3">
            {loadingNew
              ? Array(4).fill(0).map((_, i) => <div key={i} className="aspect-[3/4] bg-white/10 animate-pulse rounded" />)
              : newData?.products?.slice(0, 4).map((p) => (
                <Link key={p._id} to={`/product/${p.slug}`} className="aspect-[3/4] overflow-hidden group rounded">
                  <img
                    src={p.images?.[0] || 'https://placehold.co/300x400/1a1a1a/ffffff?text=NEW'}
                    alt={p.name?.[lang]}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </Link>
              ))
            }
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="container-custom py-24">
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
          className="text-center mb-14"
        >
          <p className="text-xs tracking-[0.4em] uppercase text-primary-400 mb-3">Browse</p>
          <h2 className="section-title">{t('home.categories')}</h2>
        </motion.div>

        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
        >
          {CATEGORIES.map((cat, i) => (
            <motion.div key={cat.en} variants={fadeUp}>
              <Link
                to={`/shop?category=${cat.en}`}
                className="block relative overflow-hidden aspect-[3/4] group"
              >
                <img
                  src={cat.img}
                  alt={cat[lang] || cat.en}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-5">
                  <span className="text-white font-semibold tracking-widest uppercase text-sm">
                    {lang === 'ar' ? cat.ar : cat.en}
                  </span>
                  <span className="text-white/50 text-xs mt-1 flex items-center gap-1 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    {isRTL ? 'تسوق الآن' : 'Shop now'} <ArrowIcon size={11} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── BRAND STORY ── */}
      <section className="py-24 bg-primary-50">
        <div className="container-custom">
          <div className={`grid md:grid-cols-2 gap-16 items-center ${isRTL ? 'md:flex-row-reverse' : ''}`}>
            <motion.div
              initial={{ opacity: 0, x: isRTL ? 40 : -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <img
                src="TreVero.png?text=Our+Story"
                alt="Brand Story"
                className="w-full object-cover"
                loading="lazy"
              />
              {/* Floating badge */}
              <div className="absolute -bottom-5 -right-5 bg-white border border-primary-100 shadow-lg px-6 py-4 hidden md:block">
                <p className="text-xs tracking-widest uppercase text-primary-400">Est.</p>
                <p className="text-3xl font-bold text-primary-950">2026</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: isRTL ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              <p className="text-xs tracking-[0.4em] uppercase text-primary-400">
                {isRTL ? 'من نحن' : 'Our Story'}
              </p>
              <h2 className="section-title">{t('home.brand_story_title')}</h2>
              <p className="text-primary-600 leading-relaxed text-lg">{t('home.brand_story_text')}</p>

              <div className="grid grid-cols-3 gap-4 py-6 border-y border-primary-200">
                {[
                  { num: '100%', label: isRTL ? 'هاند ميد' : 'Handmade' },
                  { num: '50+',  label: isRTL ? 'تصميم' : 'Designs' },
                  { num: '★4.9', label: isRTL ? 'تقييم' : 'Rating' }
                ].map(({ num, label }) => (
                  <div key={label} className="text-center">
                    <p className="text-2xl font-bold text-primary-950">{num}</p>
                    <p className="text-xs text-primary-400 mt-1 tracking-widest uppercase">{label}</p>
                  </div>
                ))}
              </div>

              <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
                {t('home.hero_cta')} <ArrowIcon size={15} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

     

   

    </PageTransition>
  );
}
