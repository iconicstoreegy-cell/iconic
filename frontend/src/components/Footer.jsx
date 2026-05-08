import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiInstagram, FiTwitter, FiFacebook, FiArrowUpRight} from 'react-icons/fi';
import { AiFillTikTok } from "react-icons/ai";

export default function Footer() {
  const { t } = useTranslation();
  const socialLinks = [
  {
    icon: FiInstagram,
    href: "https://www.instagram.com/iconic_online_store_?igsh=YjV1aDJ6ZGoxa3M0&utm_source=qr",
  },
  {
    icon: AiFillTikTok,
    href: "https://www.tiktok.com/@iconic.eg?_r=1&_t=ZS-96AHZy7X0it",
  },
];

  return (
    <footer className="bg-primary-950 text-neutral-300 mt-24 border-t border-primary-900 overflow-hidden relative">
      {/* Decorative gradient orb */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-accent-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container-custom relative pt-20 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Brand */}
          <div className="md:col-span-5 lg:col-span-4">
            <h2 className="font-display text-3xl font-bold text-white tracking-tight mb-2 flex items-center gap-1">
              Iconic<span className="text-accent-500">.</span>
            </h2>
            <p className="font-arabic text-lg text-neutral-500 mb-6">أيقونة</p>
            <p className="text-sm leading-relaxed text-neutral-400 max-w-sm mb-8">
              {t('footer.tagline')}
            </p>
           <div className="flex gap-4">
            {socialLinks.map((item, i) => {
              const Icon = item.icon;

              return (
                <a
                  key={i}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-primary-900 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-accent-500 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <Icon size={18} />
                </a>
              );
            })}
          </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 lg:col-span-2 lg:col-start-7">
            <h3 className="text-white text-xs font-semibold tracking-widest uppercase mb-6">{t('footer.quick_links')}</h3>
            <ul className="space-y-4 text-sm font-medium">
              {[
                { to: '/', label: t('nav.home') },
                { to: '/shop', label: t('nav.shop') },
                { to: '/cart', label: t('nav.cart') }
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-neutral-400 hover:text-white hover:pl-2 transition-all flex items-center gap-1 group">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-4 lg:col-span-3">
            <h3 className="text-white text-xs font-semibold tracking-widest uppercase mb-6">{t('footer.contact')}</h3>
            <ul className="space-y-4 text-sm font-medium text-neutral-400">
              <li>
                <a href="mailto:iconicstore@gmail.com" className="hover:text-white transition-colors flex items-center gap-2 group">
                  iconic.store.egy@gmail.com
                  <FiArrowUpRight className="opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" size={14} />
                </a>
              </li>
              <li>
                <a href="tel:+201012704648" className="hover:text-white transition-colors">
                  01027252707
                </a>
              </li>
              <li>Assiut, Egypt</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs font-medium text-neutral-500">
            © {new Date().getFullYear()} Iconic. {t('footer.rights')}
          </p>
          <div className="flex items-center gap-6 text-xs font-medium text-neutral-500">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
