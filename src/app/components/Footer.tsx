import { useLanguage } from './LanguageContext';
import { Landmark, MapPin, Phone, Mail, Facebook, Youtube, Globe } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const { lang, t } = useLanguage();

  return (
    <footer style={{ background: '#071D2E', color: 'rgba(255,255,255,0.8)', marginTop: 'auto' }}>
      {/* Gold divider with lotus pattern */}
      <div style={{ background: 'linear-gradient(90deg, transparent, #D4A017 20%, #D4A017 80%, transparent)', height: 2 }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 40, marginBottom: 40 }}>
          {/* About column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 8,
                background: 'linear-gradient(135deg, #D4A017, #B8860B)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Landmark size={20} color="white" />
              </div>
              <div>
                <div style={{ color: '#D4A017', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                  {lang === 'vi' ? 'Cổng thông tin' : 'Information Portal'}
                </div>
                <div style={{ color: 'white', fontSize: 13, fontWeight: 700, fontFamily: 'Merriweather, serif' }}>
                  {lang === 'vi' ? 'Di sản Vân Đình' : 'Van Dinh Heritage'}
                </div>
              </div>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}>
              {lang === 'vi'
                ? 'Hệ thống số hóa và bảo tồn di sản văn hóa xã Vân Đình, huyện Ứng Hòa, thành phố Hà Nội.'
                : 'Digital system for preserving cultural heritage of Van Dinh Commune, Ung Hoa District, Hanoi.'}
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { icon: <Facebook size={16} />, label: 'Facebook' },
                { icon: <Youtube size={16} />, label: 'YouTube' },
                { icon: <Globe size={16} />, label: 'Website' },
              ].map((s) => (
                <button
                  key={s.label}
                  style={{
                    width: 34, height: 34, borderRadius: 6,
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(212,160,23,0.2)';
                    (e.currentTarget as HTMLButtonElement).style.color = '#D4A017';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)';
                    (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.6)';
                  }}
                >
                  {s.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 style={{ color: '#D4A017', fontSize: 14, fontWeight: 700, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {t('footer.quick_links')}
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { key: 'home', label: t('nav.home') },
                { key: 'relics', label: t('nav.relics') },
                { key: 'intangible', label: t('nav.intangible') },
                { key: 'map', label: t('nav.map') },
                { key: 'statistics', label: t('nav.statistics') },
              ].map((link) => (
                <li key={link.key}>
                  <button
                    onClick={() => onNavigate(link.key)}
                    style={{
                      background: 'none', border: 'none', padding: 0,
                      color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 6, transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#D4A017'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.6)'; }}
                  >
                    <span style={{ color: '#D4A017', fontSize: 10 }}>▶</span>
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: '#D4A017', fontSize: 14, fontWeight: 700, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {t('footer.contact_info')}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <MapPin size={15} style={{ color: '#D4A017', marginTop: 2, flexShrink: 0 }} />
                <div>
                  <div style={{ color: 'white', fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{t('footer.authority')}</div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, lineHeight: 1.5 }}>{t('footer.address')}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Phone size={15} style={{ color: '#D4A017', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{t('footer.phone')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Mail size={15} style={{ color: '#D4A017', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{t('footer.email')}</span>
              </div>
            </div>
          </div>

          {/* Related links */}
          <div>
            <h4 style={{ color: '#D4A017', fontSize: 14, fontWeight: 700, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {t('footer.related')}
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: t('footer.ministry'), href: '#' },
                { label: t('footer.hanoi_culture'), href: '#' },
                { label: lang === 'vi' ? 'UBND huyện Ứng Hòa' : 'Ung Hoa District Committee', href: '#' },
                { label: lang === 'vi' ? 'Di sản thế giới UNESCO' : 'UNESCO World Heritage', href: '#' },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    style={{
                      color: 'rgba(255,255,255,0.6)', fontSize: 13, textDecoration: 'none',
                      display: 'flex', alignItems: 'center', gap: 6, transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#D4A017'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.6)'; }}
                  >
                    <span style={{ color: '#D4A017', fontSize: 10 }}>▶</span>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            {t('footer.copyright')}
          </p>
          <div style={{ display: 'flex', gap: 16 }}>
            {[
              lang === 'vi' ? 'Chính sách bảo mật' : 'Privacy Policy',
              lang === 'vi' ? 'Điều khoản sử dụng' : 'Terms of Use',
              lang === 'vi' ? 'Sitemap' : 'Sitemap',
            ].map((item) => (
              <a key={item} href="#" style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#D4A017'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.4)'; }}>
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
