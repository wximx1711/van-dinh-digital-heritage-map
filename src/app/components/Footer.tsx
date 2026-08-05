import { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { useSystemSettings } from './SystemSettingsContext';
import { AppLogo } from './AppLogo';
import { apiGet } from '../services/api';
import { MapPin, Phone, Mail, Facebook, Youtube, Globe } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

interface RelatedLinkData {
  linkId: number;
  title: string;
  url: string;
  displayOrder: number;
  isEnabled: boolean;
}

export function Footer({ onNavigate }: FooterProps) {
  const { lang, t } = useLanguage();
  const { settings: s } = useSystemSettings();
  const [relatedLinks, setRelatedLinks] = useState<RelatedLinkData[]>([]);

  useEffect(() => {
    apiGet<RelatedLinkData[]>('/related-links')
      .then(data => setRelatedLinks(data?.filter(l => l.isEnabled).sort((a, b) => a.displayOrder - b.displayOrder) || []))
      .catch(() => {});
  }, []);

  const enabledRelatedLinks = relatedLinks
    .filter(l => l.isEnabled)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const socialLinks = [
    ...(s?.facebookUrl ? [{ icon: <Facebook size={16} />, label: 'Facebook', href: s.facebookUrl }] : []),
    ...(s?.youtubeUrl ? [{ icon: <Youtube size={16} />, label: 'YouTube', href: s.youtubeUrl }] : []),
    ...(s?.tiktokUrl ? [{ icon: <Globe size={16} />, label: 'TikTok', href: s.tiktokUrl }] : []),
  ];

  return (
    <footer style={{ background: '#071D2E', color: 'rgba(255,255,255,0.8)', marginTop: 'auto' }}>
      <div style={{ background: 'linear-gradient(90deg, transparent, #D4A017 20%, #D4A017 80%, transparent)', height: 2 }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px 24px' }} className="footer-container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 32, marginBottom: 32 }} className="footer-grid">
          {/* About column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <AppLogo />
              <div>
                <div style={{ color: '#D4A017', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                  {lang === 'vi' ? 'Cổng thông tin' : 'Information Portal'}
                </div>
                <div style={{ color: 'white', fontSize: 13, fontWeight: 700, fontFamily: 'Merriweather, serif' }}>
                  {s?.websiteName || (lang === 'vi' ? 'Di sản Vân Đình' : 'Van Dinh Heritage')}
                </div>
              </div>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}>
              {s?.footerText || (lang === 'vi'
                ? 'Hệ thống số hóa và bảo tồn di sản văn hóa xã Vân Đình, huyện Ứng Hòa, thành phố Hà Nội.'
                : 'Digital system for preserving cultural heritage of Van Dinh Commune, Ung Hoa District, Hanoi.')}
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {socialLinks.map((soc) => (
                <a
                  key={soc.label}
                  href={soc.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: 34, height: 34, borderRadius: 6,
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(212,160,23,0.2)';
                    (e.currentTarget as HTMLAnchorElement).style.color = '#D4A017';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.08)';
                    (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.6)';
                  }}
                >
                  {soc.icon}
                </a>
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
                { key: 'evaluate', label: lang === 'vi' ? 'Đánh giá dịch vụ' : 'Rate our service' },
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
                  <div style={{ color: 'white', fontSize: 13, fontWeight: 600, marginBottom: 2 }}>
                    {lang === 'vi' ? 'Địa chỉ' : 'Address'}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, lineHeight: 1.5 }}>
                    {s?.address || (lang === 'vi' ? 'Chưa cập nhật' : 'Not set')}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Phone size={15} style={{ color: '#D4A017', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{s?.phone || (lang === 'vi' ? 'Chưa cập nhật' : 'Not set')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Mail size={15} style={{ color: '#D4A017', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{s?.contactEmail || (lang === 'vi' ? 'Chưa cập nhật' : 'Not set')}</span>
              </div>
            </div>
          </div>

          {/* Related links */}
          <div>
            <h4 style={{ color: '#D4A017', fontSize: 14, fontWeight: 700, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {t('footer.related')}
            </h4>
            {enabledRelatedLinks.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {enabledRelatedLinks.map((link) => (
                  <li key={link.linkId}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: 'rgba(255,255,255,0.6)', fontSize: 13, textDecoration: 'none',
                        display: 'flex', alignItems: 'center', gap: 6, transition: 'color 0.2s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#D4A017'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.6)'; }}
                    >
                      <span style={{ color: '#D4A017', fontSize: 10 }}>▶</span>
                      {link.title}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                {lang === 'vi' ? 'Chưa có liên kết' : 'No links yet'}
              </p>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            {t('footer.copyright')}
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              lang === 'vi' ? 'Chính sách bảo mật' : 'Privacy Policy',
              lang === 'vi' ? 'Điều khoản sử dụng' : 'Terms of Use',
              lang === 'vi' ? 'Sitemap' : 'Sitemap',
            ].map((item) => (
              <span key={item} style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 640px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .footer-container {
            padding: 32px 16px 16px !important;
          }
        }
      `}</style>
    </footer>
  );
}
