import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLanguage } from './LanguageContext';
import { useAuth } from './AuthContext';
import { useHeritageSites, useIntangibleHeritage, useClassificationLabels, useTypeLabels, useStatusLabels } from '../../presentation/hooks/useHeritageData';
import { ConfirmDialog } from './ConfirmDialog';

import { getImageUrl } from '../utils/url';
import {
  LayoutDashboard, Building2, BookOpen, ImageIcon,
  Users, Settings, Bell, LogOut, ChevronRight, Star,
  Award, LayoutGrid, RefreshCw, Menu, X, Landmark, Eye, Plus, UserCheck, ChevronDown, List, Info, ClipboardList, QrCode as QrCodeIcon
} from 'lucide-react';
import { classificationColors } from '../constants';
import { HeritageManagement } from './HeritageManagement';
import { UserManagement } from './UserManagement';

import { IntangibleManagement } from './IntangibleManagement';
import { HeritageCategoriesManagement } from './HeritageCategoriesManagement';
import { AboutPageManagement } from './AboutPageManagement';
import { MediaManagement } from './MediaManagement';
import { QrManagement } from './QrManagement';
import { SystemSettingsManagement } from './SystemSettingsManagement';
import { ContactMessagesManagement } from './ContactMessagesManagement';
import { ActivityLogPage } from './ActivityLogPage';
import { LazyImage } from './LazyImage';

interface AdminDashboardProps {
  onNavigate: (page: string, id?: string) => void;
  onLogout: () => void;
}

type AdminSection = 'dashboard' | 'heritage' | 'intangible' | 'categories' | 'about' | 'media' | 'users' | 'settings' | 'activity-logs' | 'qr' | 'contact-messages';

export function AdminDashboard({ onNavigate, onLogout }: AdminDashboardProps) {
  const { lang, t } = useLanguage();
  const auth = useAuth();
  const { data: heritageSites } = useHeritageSites();
  const { data: intangibleHeritage } = useIntangibleHeritage();
  const classificationLabels = useClassificationLabels();
  const typeLabels = useTypeLabels();
  const statusLabels = useStatusLabels();
  const [section, setSection] = useState<AdminSection>('dashboard');
  const [formDirty, setFormDirty] = useState(false);
  const [pendingSection, setPendingSection] = useState<AdminSection | null>(null);
  const [showNavConfirm, setShowNavConfirm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleDirtyChange = useCallback((dirty: boolean) => {
    setFormDirty(dirty);
  }, []);

  const handleNavClick = useCallback((target: AdminSection) => {
    if (formDirty && section !== target) {
      setPendingSection(target);
      setShowNavConfirm(true);
    } else {
      setSection(target);
    }
  }, [formDirty, section]);

  const confirmNav = useCallback(() => {
    setShowNavConfirm(false);
    setFormDirty(false);
    if (pendingSection) {
      setSection(pendingSection);
      setPendingSection(null);
    }
  }, [pendingSection]);

  const cancelNav = useCallback(() => {
    setShowNavConfirm(false);
    setPendingSection(null);
  }, []);
  const totalImages = heritageSites.reduce((s, h) => s + (h.images?.length || 0), 0);
  const totalVideos = 0;
  const totalDocuments = 0;
  const totalIntangible = intangibleHeritage.length;

  const adminNavItems = [
    { key: 'dashboard', label: t('admin.dashboard'), icon: <LayoutDashboard size={16} /> },
    { key: 'users', label: t('admin.users'), icon: <Users size={16} /> },
    { key: 'activity-logs', label: t('admin.activity_logs'), icon: <ClipboardList size={16} /> },
  ];

  const managerNavItems = [
    { key: 'dashboard', label: t('admin.dashboard'), icon: <LayoutDashboard size={16} /> },
    { key: 'heritage', label: t('admin.heritage_mgmt'), icon: <Building2 size={16} /> },
    { key: 'intangible', label: t('admin.intangible_mgmt'), icon: <BookOpen size={16} /> },
    { key: 'categories', label: t('admin.categories'), icon: <List size={16} /> },
    { key: 'about', label: t('admin.about'), icon: <Info size={16} /> },
    { key: 'media', label: t('admin.media'), icon: <ImageIcon size={16} /> },
    { key: 'qr', label: lang === 'vi' ? 'QR Code' : 'QR Code', icon: <QrCodeIcon size={16} /> },
    { key: 'settings', label: t('admin.settings'), icon: <Settings size={16} /> },
    { key: 'contact-messages', label: t('admin.contact_messages'), icon: <List size={16} /> },
  ];

  const navItems = auth.isAdmin ? adminNavItems : managerNavItems;
  const allowedSections = navItems.map(n => n.key as AdminSection);

  const displayName = auth.user?.fullName ?? auth.user?.username ?? '';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map(s => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  const nationalCount = heritageSites.filter(h => h.classification === 'national').length;
  const cityCount = heritageSites.filter(h => h.classification === 'city').length;
  const unrankedCount = heritageSites.filter(h => h.classification === 'unranked').length;

  function getRelativeTime(dateStr: string): string {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return lang === 'vi' ? 'Vài giây trước' : 'Just now';
    if (mins < 60) return lang === 'vi' ? `${mins} phút trước` : `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return lang === 'vi' ? `${hours} giờ trước` : `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return lang === 'vi' ? `${days} ngày trước` : `${days}d ago`;
    return dateStr;
  }

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentUpdates = useMemo(() =>
    heritageSites
      .filter(site => new Date(site.updatedAt).getTime() >= sevenDaysAgo)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 5),
    [heritageSites]
  );

  const notifications = useMemo(() =>
    recentUpdates.map(site => ({
      id: site.id,
      nameVi: site.nameVi,
      nameEn: site.nameEn,
      relativeTime: getRelativeTime(site.updatedAt),
      siteId: site.id,
    })),
    [recentUpdates, lang]
  );


  const statusColors: Record<string, string> = {
    active: '#27AE60', maintenance: '#F39C12', closed: '#E74C3C',
  };

  useEffect(() => {
    if (!allowedSections.includes(section)) {
      setSection('dashboard');
    }
  }, [section, allowedSections]);

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 0px)', background: '#F0F4F8', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? 240 : 60, minWidth: sidebarOpen ? 240 : 60,
        background: '#071520', display: 'flex', flexDirection: 'column',
        transition: 'width 0.3s, min-width 0.3s', overflow: 'hidden',
      }}>
        {/* Sidebar brand */}
        <div style={{
          padding: sidebarOpen ? '20px 16px' : '20px 10px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, flexShrink: 0,
            background: 'linear-gradient(135deg, #D4A017, #B8860B)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Landmark size={18} color="white" />
          </div>
          {sidebarOpen && (
            <div>
              <div style={{ color: '#D4A017', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Admin Panel
              </div>
              <div style={{ color: 'white', fontSize: 12, fontWeight: 700, lineHeight: 1.3, fontFamily: 'Merriweather, serif' }}>
                Di sản Vân Đình
              </div>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => handleNavClick(item.key as AdminSection)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                gap: sidebarOpen ? 10 : 0, justifyContent: sidebarOpen ? 'flex-start' : 'center',
                padding: sidebarOpen ? '9px 12px' : '9px 0',
                borderRadius: 8, border: 'none', cursor: 'pointer', marginBottom: 4,
                background: section === item.key ? 'rgba(212,160,23,0.15)' : 'transparent',
                color: section === item.key ? '#D4A017' : 'rgba(255,255,255,0.6)',
                fontSize: 13, fontWeight: section === item.key ? 700 : 400,
                transition: 'all 0.15s', whiteSpace: 'nowrap', overflow: 'hidden',
                borderLeft: section === item.key ? '3px solid #D4A017' : '3px solid transparent',
              }}
              onMouseEnter={e => {
                if (section !== item.key) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.85)';
                }
              }}
              onMouseLeave={e => {
                if (section !== item.key) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.6)';
                }
              }}
            >
              <span style={{ flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && item.label}
            </button>
          ))}
        </nav>

        {/* Bottom: toggle + logout */}
        <div style={{ padding: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              width: '100%', padding: '8px', borderRadius: 6, border: 'none',
              background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: sidebarOpen ? 'flex-start' : 'center', gap: 8, marginBottom: 6,
              fontSize: 12,
            }}
          >
            {sidebarOpen ? <><X size={14} />{lang === 'vi' ? 'Thu gọn' : 'Collapse'}</> : <Menu size={14} />}
          </button>
          <button
            onClick={onLogout}
            style={{
              width: '100%', padding: '8px', borderRadius: 6, border: 'none',
              background: 'rgba(231,76,60,0.1)', color: '#E74C3C',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: sidebarOpen ? 'flex-start' : 'center', gap: 8, fontSize: 12,
            }}
          >
            <LogOut size={14} />
            {sidebarOpen && (lang === 'vi' ? 'Đăng xuất' : 'Logout')}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{
          background: 'white', borderBottom: '1px solid rgba(15,61,94,0.1)',
          padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 1px 8px rgba(15,61,94,0.06)',
        }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#5d7a8c', fontSize: 13 }}>{lang === 'vi' ? 'Quản trị' : 'Admin'}</span>
            <ChevronRight size={14} style={{ color: '#cbced4' }} />
            <span style={{ color: '#0F3D5E', fontSize: 13, fontWeight: 600 }}>
              {navItems.find(n => n.key === section)?.label}
            </span>
          </div>

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                style={{
                  width: 36, height: 36, borderRadius: 8,
                  border: '1px solid rgba(15,61,94,0.1)', background: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', position: 'relative', color: '#5d7a8c',
                }}
              >
                <Bell size={16} />
                <span style={{
                  position: 'absolute', top: 6, right: 6, width: 8, height: 8,
                  borderRadius: '50%', background: '#E74C3C', border: '1px solid white',
                }} />
              </button>
              {notifOpen && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: 4, zIndex: 200,
                  background: 'white', borderRadius: 10, width: 300, maxHeight: 360, overflowY: 'auto',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)', border: '1px solid rgba(15,61,94,0.08)',
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(15,61,94,0.08)', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0F3D5E' }}>{t('common.notification')}</span>
                    <span style={{ fontSize: 11, color: '#D4A017', fontWeight: 600 }}>{notifications.length} {lang === 'vi' ? 'mới' : 'new'}</span>
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '24px 16px', textAlign: 'center', fontSize: 12, color: '#5d7a8c' }}>
                      {lang === 'vi' ? 'Không có thông báo mới' : 'No new notifications'}
                    </div>
                  ) : notifications.map(n => (
                    <div key={n.id} onClick={() => { setNotifOpen(false); onNavigate('heritage-detail', n.siteId); }}
                      style={{ padding: '12px 16px', borderBottom: '1px solid rgba(15,61,94,0.05)', display: 'flex', gap: 10, cursor: 'pointer' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#F0F4F8'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#D4A017', marginTop: 5, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, color: '#1a2332', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lang === 'vi' ? n.nameVi : n.nameEn}</p>
                        <span style={{ fontSize: 10, color: '#5d7a8c' }}>{lang === 'vi' ? `Cập nhật · ${n.relativeTime}` : `Updated · ${n.relativeTime}`}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* User dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                onBlur={() => setTimeout(() => setUserMenuOpen(false), 200)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '4px 8px', borderRadius: 8, border: '1px solid rgba(15,61,94,0.1)',
                  background: userMenuOpen ? '#EBF5FB' : 'transparent', cursor: 'pointer',
                }}
              >
                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0F3D5E, #1A5276)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: 13, fontWeight: 700,
                }}>
                  {initials}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0F3D5E' }}>{displayName}</div>
                  <div style={{ fontSize: 10, color: '#5d7a8c' }}>
                    {auth.isAdmin ? (lang === 'vi' ? 'Quản trị viên' : 'Administrator') : (lang === 'vi' ? 'Quản lý' : 'Manager')}
                  </div>
                </div>
                <ChevronDown size={14} style={{ color: '#5d7a8c' }} />
              </button>
              {userMenuOpen && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: 4, zIndex: 300,
                  background: 'white', borderRadius: 10, minWidth: 180,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)', border: '1px solid rgba(15,61,94,0.08)',
                  overflow: 'hidden',
                }}>
                  <button
                    onClick={() => { setUserMenuOpen(false); }}
                    style={{
                      width: '100%', padding: '10px 16px', border: 'none', cursor: 'pointer',
                      background: 'white', color: '#0F3D5E', fontSize: 13,
                      display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F0F4F8'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'white'; }}
                  >
                    <UserCheck size={14} /> {t('common.profile')}
                  </button>
                  <div style={{ borderTop: '1px solid rgba(15,61,94,0.08)' }}>
                    <button
                      onClick={() => { setUserMenuOpen(false); onLogout(); }}
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

            <button
              onClick={() => onNavigate('home')}
              style={{
                padding: '6px 12px', borderRadius: 6,
                border: '1px solid rgba(15,61,94,0.15)', background: 'white',
                color: '#0F3D5E', fontSize: 12, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              <Eye size={12} /> {lang === 'vi' ? 'Xem trang' : 'View Site'}
            </button>
          </div>
        </div>

        {/* Content area */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {/* DASHBOARD */}
          {section === 'dashboard' && (
            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ color: '#0F3D5E', margin: '0 0 4px', fontSize: 22, fontFamily: 'Merriweather, serif' }}>
                  {lang === 'vi' ? `Xin chào, ${displayName}` : `Welcome, ${displayName}`} 👋
                </h1>
                <p style={{ color: '#5d7a8c', fontSize: 13, margin: 0 }}>
                  {lang === 'vi' ? `Hôm nay là ${new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}` : `Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
                </p>
              </div>

              {/* Stats cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
                {[
                  { label: t('stats.total'), value: heritageSites.length, icon: <Building2 size={18} />, color: '#0F3D5E' },
                  { label: t('stats.national'), value: nationalCount, icon: <Star size={18} />, color: '#E74C3C' },
                  { label: t('stats.city'), value: cityCount, icon: <Award size={18} />, color: '#1A5276' },
                  { label: t('stats.unranked'), value: unrankedCount, icon: <LayoutGrid size={18} />, color: '#7F8C8D' },
                  { label: t('stats.intangible'), value: totalIntangible, icon: <BookOpen size={18} />, color: '#D4A017' },
                  { label: lang === 'vi' ? 'Hình ảnh' : 'Images', value: totalImages, icon: <ImageIcon size={18} />, color: '#27AE60' },
                  { label: lang === 'vi' ? 'Video' : 'Videos', value: totalVideos, icon: <RefreshCw size={18} />, color: '#8E44AD' },
                  { label: lang === 'vi' ? 'Tài liệu' : 'Documents', value: totalDocuments, icon: <LayoutGrid size={18} />, color: '#E67E22' },
                ].map(s => (
                  <div key={s.label} style={{
                    background: 'white', borderRadius: 10, padding: '16px',
                    boxShadow: '0 2px 8px rgba(15,61,94,0.06)',
                    border: `1px solid ${s.color}18`,
                    display: 'flex', flexDirection: 'column',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 8, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                        {s.icon}
                      </div>
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: '#5d7a8c', fontWeight: 500 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Recent updates */}
                <div style={{ background: 'white', borderRadius: 10, boxShadow: '0 2px 8px rgba(15,61,94,0.06)', overflow: 'hidden' }}>
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(15,61,94,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0F3D5E' }}>{t('admin.recent_updates')}</span>
                    <button onClick={() => handleNavClick('heritage')} style={{ background: 'none', border: 'none', color: '#D4A017', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                      {lang === 'vi' ? 'Xem tất cả' : 'View all'}
                    </button>
                  </div>
                  <div>
                    {recentUpdates.map(site => (
                      <div key={site.id} style={{ padding: '10px 16px', borderBottom: '1px solid rgba(15,61,94,0.04)', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <LazyImage src={getImageUrl(site.image)} alt="" style={{ width: 40, height: 32, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#0F3D5E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {lang === 'vi' ? site.nameVi : site.nameEn}
                          </div>
                          <div style={{ fontSize: 11, color: '#5d7a8c' }}>{typeLabels[site.type][lang]}</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                          <span style={{
padding: '2px 7px', borderRadius: 8, fontSize: 9, fontWeight: 700,
                             background: `${classificationColors[site.classification]}15`,
                             color: classificationColors[site.classification],
                          }}>
                            {classificationLabels[site.classification][lang]}
                          </span>
                          <span style={{ fontSize: 10, color: '#5d7a8c' }}>{site.updatedAt}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick actions */}
                <div>
                  <div style={{ background: 'white', borderRadius: 10, boxShadow: '0 2px 8px rgba(15,61,94,0.06)', padding: '14px 16px', marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0F3D5E', marginBottom: 14, borderBottom: '1px solid rgba(15,61,94,0.08)', paddingBottom: 10 }}>
                      {lang === 'vi' ? 'Thao tác nhanh' : 'Quick Actions'}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {(auth.isManager ? [
                        { label: lang === 'vi' ? 'Thêm di tích mới' : 'Add New Heritage', icon: <Plus size={14} />, section: 'heritage' as AdminSection },
                        { label: lang === 'vi' ? 'Di sản phi vật thể' : 'Intangible Heritage', icon: <BookOpen size={14} />, section: 'intangible' as AdminSection },
                        { label: lang === 'vi' ? 'Danh mục di tích' : 'Categories', icon: <List size={14} />, section: 'categories' as AdminSection },
                        { label: lang === 'vi' ? 'Cài đặt hệ thống' : 'System Settings', icon: <Settings size={14} />, section: 'settings' as AdminSection },
                      ] : [
                        { label: lang === 'vi' ? 'Quản lý người dùng' : 'Manage Users', icon: <Users size={14} />, section: 'users' as AdminSection },
                        { label: lang === 'vi' ? 'Nhật ký hoạt động' : 'Activity Logs', icon: <ClipboardList size={14} />, section: 'activity-logs' as AdminSection },
                      ]).map(a => (
                        <button
                          key={a.label}
                          onClick={() => handleNavClick(a.section)}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(15,61,94,0.1)',
                            background: 'white', cursor: 'pointer', transition: 'all 0.15s',
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#EBF5FB'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#0F3D5E'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'white'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(15,61,94,0.1)'; }}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#0F3D5E', fontWeight: 500 }}>
                            <span style={{ color: '#D4A017' }}>{a.icon}</span> {a.label}
                          </span>
                          <ChevronRight size={14} style={{ color: '#5d7a8c' }} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Heritage status breakdown */}
                  <div style={{ background: 'white', borderRadius: 10, boxShadow: '0 2px 8px rgba(15,61,94,0.06)', padding: '14px 16px' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0F3D5E', marginBottom: 12 }}>
                      {lang === 'vi' ? 'Trạng thái di tích' : 'Heritage Status'}
                    </div>
                    {['active', 'maintenance', 'closed'].map(status => {
                      const count = heritageSites.filter(s => s.status === status).length;
                      const pct = heritageSites.length > 0 ? Math.round((count / heritageSites.length) * 100) : 0;
                      return (
                        <div key={status} style={{ marginBottom: 10 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: 12, color: '#1a2332' }}>{statusLabels[status as keyof typeof statusLabels][lang]}</span>
                            <span style={{ fontSize: 11, color: '#5d7a8c' }}>{count}/{heritageSites.length}</span>
                          </div>
                          <div style={{ height: 6, borderRadius: 3, background: '#F0F4F8', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, borderRadius: 3, background: statusColors[status] }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {section === 'heritage' && (
            <HeritageManagement onNavigate={onNavigate} onDirtyChange={handleDirtyChange} />
          )}

          {section === 'intangible' && (
            <IntangibleManagement onDirtyChange={handleDirtyChange} />
          )}

          {section === 'users' && (
            <UserManagement onDirtyChange={handleDirtyChange} />
          )}

          {section === 'categories' && <HeritageCategoriesManagement onDirtyChange={handleDirtyChange} />}
          {section === 'about' && <AboutPageManagement onDirtyChange={handleDirtyChange} />}
          {section === 'media' && <MediaManagement />}
          {section === 'qr' && <QrManagement />}
          {section === 'settings' && <SystemSettingsManagement onDirtyChange={handleDirtyChange} />}
          {section === 'contact-messages' && <ContactMessagesManagement />}

          {section === 'activity-logs' && <ActivityLogPage />}
        </div>
      </div>

      {showNavConfirm && (
        <ConfirmDialog
          message={lang === 'vi' ? 'Bạn có thay đổi chưa lưu. Hủy bỏ chúng?' : 'You have unsaved changes. Discard them?'}
          onConfirm={confirmNav}
          onCancel={cancelNav}
          confirmLabel={lang === 'vi' ? 'Hủy bỏ' : 'Discard'}
          cancelLabel={lang === 'vi' ? 'Tiếp tục' : 'Keep editing'}
        />
      )}
    </div>
  );
}
