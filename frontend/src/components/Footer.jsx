import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiInstagram, FiTwitter, FiFacebook } from 'react-icons/fi';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-primary-950 text-primary-300 mt-20">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <h2 className="font-display text-2xl font-bold text-white tracking-widest mb-2">Tervero</h2>
            <p className="font-arabic text-lg text-primary-400 mb-4">تريفيرو</p>
            <p className="text-sm leading-relaxed">{t('footer.tagline')}</p>
            <div className="flex gap-4 mt-6">
              {[FiInstagram, FiTwitter, FiFacebook].map((Icon, i) => (
                <a key={i} href="#" className="text-primary-400 hover:text-white transition-colors">
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-sm tracking-widest uppercase mb-4">{t('footer.quick_links')}</h3>
            <ul className="space-y-2 text-sm">
              {[
                { to: '/', label: t('nav.home') },
                { to: '/shop', label: t('nav.shop') },
                { to: '/cart', label: t('nav.cart') }
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white text-sm tracking-widest uppercase mb-4">{t('footer.contact')}</h3>
            <ul className="space-y-2 text-sm">
              <li>treverostore@gmail.com</li>
              <li>01012704648 </li>
              <li>Assiut, Egypt</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-800 mt-12 pt-6 text-center text-xs text-primary-500">
          © {new Date().getFullYear()} Trevero | تريفيرو {t('footer.rights')}
        </div>
      </div>
    </footer>
  );
}
