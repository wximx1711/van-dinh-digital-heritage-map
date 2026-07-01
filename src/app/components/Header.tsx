import { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { useAuth } from './AuthContext';
import {
  Map, BookOpen, BarChart2, Info, Phone, LogIn, Menu, X, Globe, ChevronDown, Landmark, Shield
} from 'lucide-react';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Header({ currentPage, onNavigate }: HeaderProps) {
  const { lang, setLang, t } = useLanguage();
  const auth = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const displayName = auth.user?.fullName ?? auth.user?.username ?? '';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map(s => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  const navItems = [
    { key: 'home', label: t('nav.home'), icon: null },
    { key: 'relics', label: t('nav.relics'), icon: null },
    { key: 'intangible', label: t('nav.intangible'), icon: null },
    { key: 'map', label: t('nav.map'), icon: <Map size={14} /> },
    { key: 'statistics', label: t('nav.statistics'), icon: <BarChart2 size={14} /> },
    { key: 'about', label: t('nav.about'), icon: <Info size={14} /> },
    { key: 'contact', label: t('nav.contact'), icon: <Phone size={14} /> },
  ];

  return (
    <header style={{ background: '#0F3D5E', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 12px rgba(15,61,94,0.4)' }}>
      {/* Top strip */}
      <div style={{ background: '#0a2d47', borderBottom: '1px solid rgba(212,160,23,0.2)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '4px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
            {lang === 'vi' ? 'Cổng thông tin di sản văn hóa xã Vân Đình, Ứng Hòa, Hà Nội' : 'Van Dinh Cultural Heritage Portal, Ung Hoa, Hanoi'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
              {lang === 'vi' ? 'Đường dây nóng: 024.1234.5678' : 'Hotline: 024.1234.5678'}
            </span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
        {/* Logo & title */}
        <button
          onClick={() => onNavigate('home')}
          style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
        >
          <div style={{
            width: 48, height: 48, borderRadius: 8,
            background: 'linear-gradient(135deg, #D4A017, #B8860B)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Landmark size={26} color="white" />
          </div>
          <div>
            <div style={{ color: '#D4A017', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, lineHeight: 1.2 }}>
              {lang === 'vi' ? 'Ủy ban nhân dân xã Vân Đình' : 'Van Dinh Commune People\'s Committee'}
            </div>
            <div style={{ color: 'white', fontSize: 15, fontWeight: 700, lineHeight: 1.3, fontFamily: 'Merriweather, serif' }}>
              {lang === 'vi' ? 'Bản đồ số Di sản Văn hóa' : 'Digital Heritage Map'}
            </div>
          </div>
        </button>

        {/* Desktop nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="hidden-mobile">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '6px 12px',
                borderRadius: 6,
                border: 'none',
                background: currentPage === item.key ? 'rgba(212,160,23,0.2)' : 'transparent',
                color: currentPage === item.key ? '#D4A017' : 'rgba(255,255,255,0.85)',
                fontSize: 13,
                fontWeight: currentPage === item.key ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
                borderBottom: currentPage === item.key ? '2px solid #D4A017' : '2px solid transparent',
              }}
              onMouseEnter={e => {
                if (currentPage !== item.key) {
                  (e.currentTarget as HTMLButtonElement).style.color = '#D4A017';
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(212,160,23,0.1)';
                }
              }}
              onMouseLeave={e => {
                if (currentPage !== item.key) {
                  (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.85)';
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Language switch */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 10px', borderRadius: 6,
                border: '1px solid rgba(212,160,23,0.4)',
                background: 'transparent', color: '#D4A017',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}
            >
              <Globe size={14} />
              {lang.toUpperCase()}
              <ChevronDown size={12} />
            </button>
            {dropdownOpen && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: 4,
                background: 'white', borderRadius: 8, overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)', minWidth: 120, zIndex: 200,
              }}>
                {(['vi', 'en'] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => { setLang(l); setDropdownOpen(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      width: '100%', padding: '10px 16px', border: 'none', cursor: 'pointer',
                      background: lang === l ? '#EBF5FB' : 'white',
                      color: lang === l ? '#0F3D5E' : '#1a2332',
                      fontSize: 13, fontWeight: lang === l ? 600 : 400,
                      textAlign: 'left',
                    }}
                  >
                    <span>{l === 'vi' ? '🇻🇳' : '🇬🇧'}</span>
                    {l === 'vi' ? 'Tiếng Việt' : 'English'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Auth button */}
          {auth.isAuthenticated && (auth.isAdmin || auth.isManager) ? (
            <button
              onClick={() => onNavigate('admin')}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '5px 12px 5px 5px', borderRadius: 20,
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(212,160,23,0.3)',
                color: 'white', fontSize: 13, fontWeight: 500,
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: 'linear-gradient(135deg, #D4A017, #B8860B)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: 11, fontWeight: 700, flexShrink: 0,
              }}>
                {initials}
              </div>
              <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</span>
              <Shield size={11} style={{ color: '#D4A017', flexShrink: 0 }} />
            </button>
          ) : auth.isAuthenticated ? (
            <button
              onClick={() => onNavigate('home')}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '5px 12px 5px 5px', borderRadius: 20,
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(212,160,23,0.3)',
                color: 'white', fontSize: 13, fontWeight: 500,
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: 'linear-gradient(135deg, #D4A017, #B8860B)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: 11, fontWeight: 700, flexShrink: 0,
              }}>
                {initials}
              </div>
              <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate('login')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 16px', borderRadius: 6,
                background: 'linear-gradient(135deg, #D4A017, #B8860B)',
                border: 'none', color: 'white', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(212,160,23,0.4)',
              }}
            >
              <LogIn size={14} />
              {t('nav.login')}
            </button>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              display: 'none', padding: 8, borderRadius: 6, border: 'none',
              background: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer',
            }}
            className="show-mobile"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ background: '#0a2d47', borderTop: '1px solid rgba(212,160,23,0.2)', padding: '8px 24px 16px' }}>
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => { onNavigate(item.key); setMobileOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                width: '100%', padding: '10px 12px', borderRadius: 6, border: 'none',
                background: currentPage === item.key ? 'rgba(212,160,23,0.15)' : 'transparent',
                color: currentPage === item.key ? '#D4A017' : 'rgba(255,255,255,0.85)',
                fontSize: 14, fontWeight: 500, cursor: 'pointer', textAlign: 'left',
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
