import { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { useAuth } from './AuthContext';
import { useSystemSettings } from './SystemSettingsContext';
import {
  Map, BookOpen, Info, Phone, LogIn, Menu, X, Globe, ChevronDown, Shield, LogOut, UserCheck
} from 'lucide-react';
import { Skeleton } from './Skeleton';
import { AppLogo } from './AppLogo';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Header({ currentPage, onNavigate }: HeaderProps) {
  const { lang, setLang, t } = useLanguage();
  const auth = useAuth();
  const { settings } = useSystemSettings();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const displayName = auth.user?.fullName ?? auth.user?.username ?? '';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map(s => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  const handleLogoutClick = async () => {
    setUserMenuOpen(false);
    await auth.logout();
    onNavigate('login');
  };

  const navItems = [
    { key: 'home', label: t('nav.home'), icon: null },
    { key: 'memorial-sites', label: t('nav.memorialSites'), icon: null },
    { key: 'relics', label: t('nav.relics'), icon: null },
    { key: 'intangible', label: t('nav.intangible'), icon: null },
    { key: 'map', label: t('nav.map'), icon: <Map size={14} /> },
    { key: 'about', label: t('nav.about'), icon: <Info size={14} /> },
    { key: 'contact', label: t('nav.contact'), icon: <Phone size={14} /> },
  ];

  return (
    <header style={{ background: 'linear-gradient(180deg, #0F3D5E 0%, #0b3150 100%)', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 20px rgba(15,61,94,0.45)' }}>
      {/* Top strip - hidden on mobile */}
      <div className="hide-mobile" style={{ background: '#0a2d47', borderBottom: '1px solid rgba(212,160,23,0.2)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '4px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {lang === 'vi' ? 'Cổng thông tin di sản văn hóa Vân Đình, thành phố Hà Nội' : 'Van Dinh Cultural Heritage Portal, Hanoi'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, whiteSpace: 'nowrap' }}>
              {lang === 'vi' ? 'Đường dây nóng: ' : 'Hotline: '}{settings?.phone || '--'}
            </span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, gap: 8 }}>
        {/* Logo & title */}
        <button
          onClick={() => onNavigate('home')}
          style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', minWidth: 0, flex: '1 1 auto', overflow: 'hidden' }}
        >
          <div style={{ borderRadius: 10, padding: 2, background: 'linear-gradient(135deg, #E5B723, #B8860B)', boxShadow: '0 4px 14px rgba(212,160,23,0.35)' }}>
            <AppLogo size={38} containerStyle={{ borderRadius: 8, background: 'white' }} />
          </div>
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <div style={{ color: '#D4A017', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {lang === 'vi' ? 'Ủy ban nhân dân xã Vân Đình' : 'Van Dinh Commune People\'s Committee'}
            </div>
            <div style={{ color: 'white', fontSize: 14, fontWeight: 700, lineHeight: 1.3, fontFamily: 'Merriweather, serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
              {lang === 'vi' ? 'Bản đồ di sản số' : 'Digital Heritage Map'}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {/* Language switch */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="touch-target"
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '6px 8px', borderRadius: 6,
                border: '1px solid rgba(212,160,23,0.4)',
                background: 'transparent', color: '#D4A017',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >
              <Globe size={13} />
              <span className="hide-mobile">{lang.toUpperCase()}</span>
              <ChevronDown size={10} />
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
                    className="touch-target"
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

          {/* Auth button — only render after auth check completes */}
          {auth.isLoading ? (
            <Skeleton width={34} height={34} borderRadius="50%" />
          ) : auth.isAuthenticated && (auth.isAdmin || auth.isManager) ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="touch-target"
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '4px 8px 4px 4px', borderRadius: 20,
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(212,160,23,0.3)',
                  color: 'white', fontSize: 12, fontWeight: 500,
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
                <span className="hide-mobile" style={{ maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</span>
                <ChevronDown size={10} style={{ color: '#D4A017', flexShrink: 0 }} />
              </button>
              {userMenuOpen && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: 4, zIndex: 300,
                  background: 'white', borderRadius: 10, minWidth: 180,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)', border: '1px solid rgba(15,61,94,0.08)',
                  overflow: 'hidden',
                }}>
                  <button
                    onClick={() => { setUserMenuOpen(false); onNavigate('admin'); }}
                    className="touch-target"
                    style={{
                      width: '100%', padding: '10px 16px', border: 'none', cursor: 'pointer',
                      background: 'white', color: '#0F3D5E', fontSize: 13,
                      display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F0F4F8'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'white'; }}
                  >
                    <Shield size={14} /> {lang === 'vi' ? 'Quản trị' : 'Admin Panel'}
                  </button>
                  <div style={{ borderTop: '1px solid rgba(15,61,94,0.08)' }}>
                    <button
                      onClick={handleLogoutClick}
                      className="touch-target"
                      style={{
                        width: '100%', padding: '10px 16px', border: 'none', cursor: 'pointer',
                        background: 'white', color: '#E74C3C', fontSize: 13,
                        display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#FDEDEC'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'white'; }}
                    >
                      <LogOut size={14} /> {t('common.logout')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => onNavigate('login')}
              className="touch-target btn-gold-glow"
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '6px 12px', borderRadius: 6,
                background: 'linear-gradient(135deg, #E5B723, #B8860B)',
                border: 'none', color: 'white', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(212,160,23,0.4)',
              }}
            >
              <LogIn size={13} />
              <span className="hide-mobile">{t('nav.login')}</span>
            </button>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="show-mobile touch-target"
            style={{
              display: 'none', padding: 8, borderRadius: 6, border: 'none',
              background: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer',
              alignItems: 'center', justifyContent: 'center',
            }}
            aria-label={mobileOpen ? (lang === 'vi' ? 'Đóng menu' : 'Close menu') : (lang === 'vi' ? 'Mở menu' : 'Open menu')}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ background: '#0a2d47', borderTop: '1px solid rgba(212,160,23,0.2)', padding: '4px 16px 16px', maxHeight: 'calc(100vh - 64px)', overflowY: 'auto' }}>
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => { onNavigate(item.key); setMobileOpen(false); }}
              className="touch-target"
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                width: '100%', padding: '12px 12px', borderRadius: 6, border: 'none',
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

      <div style={{ height: 3, background: 'linear-gradient(90deg, transparent, #D4A017 20%, #E5B723 50%, #D4A017 80%, transparent)' }} />

      <style>{`
        @media (max-width: 900px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 901px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </header>
  );
}
