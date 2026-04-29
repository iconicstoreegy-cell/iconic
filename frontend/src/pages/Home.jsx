import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../services/productService';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import PageTransition from '../components/ui/PageTransition';
import { FiArrowRight, FiArrowLeft, FiPlay } from 'react-icons/fi';

const CATEGORIES = [
  { en: 'Hoodies',  ar: 'هوديز',     img: 'https://wearthepeace.com/cdn/shop/products/human-embroidered-hoodie-wear-the-peace-585045_1445x.jpg?v=1694209411' },
  { en: 'T-Shirts', ar: 'تيشيرتات', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSj9dEFMDZG32etPpUbUgtYzTEQGByJQbbPug&s' },
  { en: 'Jackets',  ar: 'جاكيتات',  img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5sm2BSyMiZO39Cl2YoMsVcq-nZlblVg9f4g&s' },
  { en: 'Pants',    ar: 'بناطيل',   img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjufOLO5420yL7Wu_PWB5ij3Qv00HVMMVy_Q&s' }
];

const fadeUp = { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } };
const stagger = { show: { transition: { staggerChildren: 0.15 } } };

export default function Home() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const isRTL = lang === 'ar';
  
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

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

      {/* ── BREATHTAKING HERO ── */}
      <section ref={heroRef} className="relative h-screen min-h-[700px] flex items-center justify-center bg-neutral-50 overflow-hidden">
        {/* Dynamic Abstract Background Elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-200/40 rounded-full blur-[100px] animate-float mix-blend-multiply" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-[100px] animate-pulse-slow mix-blend-multiply" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none  " />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          initial="hidden"
          animate="show"
          variants={stagger}
          className="relative text-center px-4 max-w-5xl mx-auto z-10 pt-20"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-neutral-200/50 shadow-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse" />
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-primary-950">
              {isRTL ? 'إطلاق مجموعة الصيف' : 'Summer Drop Live'}
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="font-display text-5xl sm:text-7xl lg:text-[6.5rem] font-semibold leading-[1.05] tracking-tight text-primary-950 mb-8"
          >
            {t('home.hero_title')}
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-neutral-500 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed font-light"
          >
            {t('home.hero_subtitle')}
          </motion.p>

          <motion.div variants={fadeUp} className="flex items-center justify-center gap-5 flex-wrap">
            <Link to="/shop" className="btn-primary group flex items-center gap-2">
              {t('home.hero_cta')} 
              <ArrowIcon size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/shop?newCollection=true" className="btn-outline flex items-center gap-2 bg-white/50 backdrop-blur-sm">
              <FiPlay size={16} /> {t('home.new_collection')}
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── SLEEK MARQUEE STRIP ── */}
      <div className="bg-primary-950 py-4 overflow-hidden shadow-soft relative z-20">
        <motion.div
          animate={{ x: isRTL ? [0, 800] : [0, -800] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="flex gap-16 whitespace-nowrap items-center"
        >
          {Array(8).fill(['NEW COLLECTION', 'HANDMADE IN EGYPT', 'PREMIUM QUALITY', 'LIMITED DROPS']).flat().map((text, i) => (
            <span key={i} className="text-[13px] font-semibold tracking-[0.3em] uppercase text-white/50 flex-shrink-0 flex items-center gap-16">
              {text} <span className="text-accent-500/50 w-2 h-2 rounded-full" />
            </span>
          ))}
        </motion.div>
      </div>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="container-custom py-32 bg-white">
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={stagger}
          className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
        >
          <motion.div variants={fadeUp} className="max-w-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-[1px] w-8 bg-accent-500" />
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent-500">Curated for you</p>
            </div>
            <h2 className="section-title">{t('home.featured')}</h2>
          </motion.div>
          
          <motion.div variants={fadeUp}>
            <Link
              to="/shop?featured=true"
              className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide uppercase text-primary-950 hover:text-accent-500 transition-colors group"
            >
              {isRTL ? 'عرض الكل' : 'View All'} 
              <span className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center group-hover:bg-accent-500/10 transition-colors">
                <ArrowIcon size={14} />
              </span>
            </Link>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {loadingFeatured
            ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
            : featuredData?.products?.length
              ? featuredData.products.map((p) => <ProductCard key={p._id} product={p} />)
              : (
                <div className="col-span-4 py-24 text-center text-neutral-400 bg-neutral-50 rounded-3xl border border-neutral-100">
                  {isRTL ? 'لا توجد منتجات مميزة بعد' : 'No featured products yet — add some from the admin panel'}
                </div>
              )
          }
        </div>
      </section>

      {/* ── INTERACTIVE CATEGORIES ── */}
      <section className="py-32 bg-neutral-50 relative overflow-hidden">
        {/* Soft background decor */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/60 to-transparent pointer-events-none" />
        
        <div className="container-custom relative z-10">
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
            className="mb-16 max-w-2xl"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="h-[1px] w-8 bg-accent-500" />
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent-500">Explore</p>
            </div>
            <h2 className="section-title">{t('home.categories')}</h2>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {CATEGORIES.map((cat, i) => (
              <motion.div key={cat.en} variants={fadeUp}>
                <Link
                  to={`/shop?category=${cat.en}`}
                  className="block relative overflow-hidden h-[450px] group rounded-3xl shadow-sm hover:shadow-soft transition-all duration-500 bg-white"
                >
                  <motion.div 
                    className="absolute inset-0 z-0"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                    <img
                      src={cat.img}
                      alt={cat[lang] || cat.en}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </motion.div>
                  
                  {/* Glassmorphism Label */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-950/80 via-primary-950/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500 z-10" />
                  
                  <div className="absolute inset-x-4 bottom-4 z-20 flex flex-col justify-end">
                    <div className="glass-dark p-6 rounded-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <span className="text-white font-display text-2xl font-semibold tracking-wide flex items-center justify-between">
                        {lang === 'ar' ? cat.ar : cat.en}
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                           <ArrowIcon size={14} className="text-white" />
                        </div>
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── IMMERSIVE BRAND STORY ── */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="container-custom">
          <div className={`grid lg:grid-cols-2 gap-20 items-center ${isRTL ? 'lg:flex-row-reverse' : ''}`}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <div className="relative rounded-[2rem] overflow-hidden aspect-[4/5] shadow-2xl">
                <img
                  src="TreVero.png?text=Our+Story"
                  alt="Brand Story"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              {/* Floating glass badge */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-8 -right-8 glass p-8 rounded-3xl hidden md:block"
              >
                <div className="flex flex-col items-center justify-center">
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-500 mb-1">Established</p>
                  <p className="font-display text-4xl font-bold text-primary-950">2026</p>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: isRTL ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-8"
            >
              <div className="flex items-center gap-4">
                <div className="h-[1px] w-8 bg-accent-500" />
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent-500">
                  {isRTL ? 'من نحن' : 'Our Story'}
                </p>
              </div>
              
              <h2 className="section-title leading-tight">{t('home.brand_story_title')}</h2>
              <p className="text-neutral-500 leading-relaxed text-lg font-light">
                {t('home.brand_story_text')}
              </p>

              <div className="grid grid-cols-3 gap-8 py-8 border-y border-neutral-100">
                {[
                  { num: '100%', label: isRTL ? 'هاند ميد' : 'Handmade' },
                  { num: '50+',  label: isRTL ? 'تصميم' : 'Designs' },
                  { num: '4.9',  label: isRTL ? 'تقييم' : 'Rating', icon: '★' }
                ].map(({ num, label, icon }) => (
                  <div key={label} className="text-center">
                    <p className="font-display text-3xl font-bold text-primary-950 flex items-center justify-center gap-1">
                      {icon && <span className="text-accent-500 text-2xl">{icon}</span>}
                      {num}
                    </p>
                    <p className="text-[10px] font-semibold text-neutral-400 mt-2 tracking-[0.1em] uppercase">{label}</p>
                  </div>
                ))}
              </div>

              <Link to="/shop" className="btn-primary inline-flex items-center gap-2 group">
                {t('home.hero_cta')} 
                <ArrowIcon size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

    </PageTransition>
  );
}
