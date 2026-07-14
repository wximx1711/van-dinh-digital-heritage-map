import { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './components/LanguageContext';
import { AuthProvider, useAuth } from './components/AuthContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { MapPage } from './components/MapPage';
import { HeritageDetail } from './components/HeritageDetail';
import { LoginPage } from './components/LoginPage';
import { AdminDashboard } from './components/AdminDashboard';
import { RelicsPage } from './components/RelicsPage';

import { IntangiblePage } from './components/IntangiblePage';
import { IntangibleHeritageDetail } from './components/IntangibleHeritageDetail';
import { StatisticsPage } from './components/StatisticsPage';
import { NotFoundPage } from './components/NotFoundPage';
import { Skeleton } from './components/Skeleton';
import { apiGet, apiPost } from './services/api';
import { getImageUrl } from './utils/url';
import type { UserInfo, AboutPageData } from '../core/types';

type Page =
  | 'home' | 'relics' | 'intangible' | 'map' | 'statistics'
  | 'about' | 'contact' | 'heritage-detail' | 'intangible-detail'
  | 'login' | 'admin' | '404';

function AboutPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { lang } = useLanguage();
  const [data, setData] = useState<AboutPageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<AboutPageData>('/about')
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ background: '#F0F4F8', minHeight: '100vh', padding: '48px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <Skeleton width={200} height={28} borderRadius={4} style={{ marginBottom: 8 }} />
          <Skeleton width="100%" height={16} borderRadius={3} style={{ marginBottom: 24 }} />
          <Skeleton height={300} borderRadius={10} style={{ marginBottom: 24 }} />
          <Skeleton height={14} borderRadius={3} style={{ marginBottom: 8 }} />
          <Skeleton height={14} borderRadius={3} style={{ marginBottom: 8 }} />
          <Skeleton height={14} borderRadius={3} style={{ marginBottom: 8 }} />
          <Skeleton width="70%" height={14} borderRadius={3} />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ background: '#F0F4F8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5d7a8c', fontSize: 13 }}>
        {lang === 'vi' ? 'Không thể tải nội dung.' : 'Unable to load content.'}
      </div>
    );
  }

  const title = lang === 'vi' ? data.titleVi : data.titleEn;
  const introduction = lang === 'vi' ? data.introductionVi : data.introductionEn;
  const mainContent = lang === 'vi' ? data.mainContentVi : data.mainContentEn;
  const contact = data.contactInfo;
  const contactText = contact ? (lang === 'vi' ? `Liên hệ: ${contact}` : `Contact: ${contact}`) : null;

  return (
    <div style={{ background: '#F0F4F8', minHeight: '100vh' }}>
      {data.bannerImage && (
        <div style={{ width: '100%', height: 320, overflow: 'hidden' }}>
          <img src={getImageUrl(data.bannerImage)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
      <div style={{ background: '#0F3D5E', padding: data.bannerImage ? '32px 24px 40px' : '40px 24px 48px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ color: '#D4A017', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
            {lang === 'vi' ? 'Tổng quan' : 'Overview'}
          </div>
          <h1 style={{ color: 'white', fontSize: 26, fontFamily: 'Merriweather, serif', fontWeight: 700, margin: 0 }}>
            {title}
          </h1>
        </div>
      </div>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px', transform: 'translateY(-24px)' }}>
        <div style={{ background: 'white', borderRadius: 12, padding: '32px', boxShadow: '0 2px 12px rgba(15,61,94,0.08)' }}>
          <h2 style={{ color: '#0F3D5E', fontFamily: 'Merriweather, serif', marginTop: 0, marginBottom: 12 }}>{title}</h2>
          <div style={{ background: 'linear-gradient(90deg, #D4A017, transparent)', height: 3, width: 80, marginBottom: 20 }} />
          {introduction && <p style={{ color: '#1a2332', lineHeight: 1.8, fontSize: 14, whiteSpace: 'pre-line' }}>{introduction}</p>}
          {mainContent && <p style={{ color: '#1a2332', lineHeight: 1.8, fontSize: 14, whiteSpace: 'pre-line', marginTop: 16 }}>{mainContent}</p>}
          {contactText && (
            <div style={{ marginTop: 20, padding: '14px', background: '#F0F4F8', borderRadius: 8, fontSize: 13, color: '#0F3D5E' }}>
              {contactText}
            </div>
          )}
          <div style={{ marginTop: 20, fontSize: 11, color: '#5d7a8c', textAlign: 'right' }}>
            {lang === 'vi' ? 'Cập nhật lần cuối: ' : 'Last updated: '}{new Date(data.updatedAt).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US')}
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { lang } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError(lang === 'vi' ? 'Vui lòng điền đầy đủ thông tin bắt buộc' : 'Please fill in all required fields');
      return;
    }
    setSending(true);
    setError('');
    try {
      await apiPost('/contact', { name: form.name.trim(), email: form.email.trim(), subject: form.subject.trim() || undefined, message: form.message.trim() });
      setSent(true);
    } catch {
      setError(lang === 'vi' ? 'Gửi thất bại, vui lòng thử lại sau' : 'Failed to send, please try again later');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ background: '#F0F4F8', minHeight: '100vh' }}>
      <div style={{ background: '#0F3D5E', padding: '40px 24px 48px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ color: '#D4A017', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
            {lang === 'vi' ? 'Kết nối' : 'Get in Touch'}
          </div>
          <h1 style={{ color: 'white', fontSize: 26, fontFamily: 'Merriweather, serif', fontWeight: 700, margin: 0 }}>
            {lang === 'vi' ? 'Liên hệ' : 'Contact'}
          </h1>
        </div>
      </div>
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px', transform: 'translateY(-24px)' }}>
        {sent ? (
          <div style={{ background: 'white', borderRadius: 12, padding: '48px', textAlign: 'center', boxShadow: '0 2px 12px rgba(15,61,94,0.08)' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
            <h2 style={{ color: '#0F3D5E', fontFamily: 'Merriweather, serif' }}>
              {lang === 'vi' ? 'Gửi thành công!' : 'Message Sent!'}
            </h2>
            <p style={{ color: '#5d7a8c' }}>
              {lang === 'vi' ? 'Chúng tôi sẽ phản hồi trong vòng 24–48 giờ làm việc.' : 'We will respond within 24–48 business hours.'}
            </p>
            <button onClick={() => setSent(false)} style={{ padding: '10px 28px', borderRadius: 8, background: '#0F3D5E', border: 'none', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 8 }}>
              {lang === 'vi' ? 'Gửi tin nhắn khác' : 'Send Another Message'}
            </button>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: 12, padding: '32px', boxShadow: '0 2px 12px rgba(15,61,94,0.08)' }}>
            <h2 style={{ color: '#0F3D5E', fontFamily: 'Merriweather, serif', marginTop: 0 }}>
              {lang === 'vi' ? 'Gửi tin nhắn' : 'Send a Message'}
            </h2>
            <div style={{ background: 'linear-gradient(90deg, #D4A017, transparent)', height: 3, width: 60, marginBottom: 24 }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { label: lang === 'vi' ? 'Họ và tên *' : 'Full Name *', key: 'name', type: 'text', full: false },
                { label: 'Email *', key: 'email', type: 'email', full: false },
                { label: lang === 'vi' ? 'Chủ đề' : 'Subject', key: 'subject', type: 'text', full: true },
              ].map(f => (
                <div key={f.key} style={{ gridColumn: f.full ? '1 / -1' : 'auto' }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#0F3D5E', marginBottom: 5 }}>{f.label}</label>
                  <input
                    type={f.type}
                    value={(form as any)[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 7, border: '1.5px solid rgba(15,61,94,0.15)', fontSize: 13, background: '#F8FAFC', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#0F3D5E', marginBottom: 5 }}>
                  {lang === 'vi' ? 'Nội dung *' : 'Message *'}
                </label>
                <textarea
                  rows={5}
                  value={form.message}
                  onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 7, border: '1.5px solid rgba(15,61,94,0.15)', fontSize: 13, background: '#F8FAFC', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>
            </div>
            {error && (
              <div style={{ color: '#dc2626', fontSize: 13, marginTop: 8, textAlign: 'center' }}>{error}</div>
            )}
            <button
              onClick={handleSend}
              disabled={sending}
              style={{ marginTop: 16, width: '100%', padding: '12px', borderRadius: 8, background: sending ? '#94a3b8' : '#0F3D5E', border: 'none', color: 'white', fontSize: 14, fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(15,61,94,0.3)' }}
            >
              {sending ? (lang === 'vi' ? 'Đang gửi...' : 'Sending...') : (lang === 'vi' ? 'Gửi tin nhắn' : 'Send Message')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function AppInner() {
  const [page, setPage] = useState<Page>('home');
  const [heritageSiteId, setHeritageSiteId] = useState<string>('h001');
  const [intangibleId, setIntangibleId] = useState<string>('');
  const auth = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pageParam = params.get('page');
    const idParam = params.get('id');
    if (pageParam === 'heritage' && idParam) {
      setHeritageSiteId(idParam);
      setPage('heritage-detail');
    } else if (pageParam === 'intangible' && idParam) {
      setIntangibleId(idParam);
      setPage('intangible-detail');
    }
  }, []);

  const navigate = (targetPage: string, id?: string) => {
    if (targetPage === 'heritage-detail' && id) setHeritageSiteId(id);
    if (targetPage === 'intangible-detail' && id) setIntangibleId(id);
    setPage(targetPage as Page);
    if (!['login', 'admin'].includes(targetPage)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLogout = async () => {
    await auth.logout();
    setPage('login');
  };

  const handleLoginSuccess = (userData: UserInfo) => {
    auth.login(userData);
    setPage('admin');
  };

  // Global loading gate: block ALL UI until auth initialization completes
  if (auth.isLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0F4F8' }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid rgba(15,61,94,0.2)', borderTopColor: '#0F3D5E', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  // Login page — full screen, no header/footer
  if (page === 'login') {
    return <LoginPage onNavigate={navigate} onLoginSuccess={handleLoginSuccess} />;
  }

  // Admin panel — full screen with compact top bar
  if (page === 'admin') {
    if (!auth.isAuthenticated) {
      return <LoginPage onNavigate={navigate} onLoginSuccess={handleLoginSuccess} />;
    }
    if (!auth.isAdmin && !auth.isManager) {
      navigate('login');
      return null;
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <div style={{
          background: '#0F3D5E', padding: '0 20px', height: 44,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
          borderBottom: '2px solid #D4A017',
        }}>
          <span style={{ color: '#D4A017', fontSize: 13, fontWeight: 700, fontFamily: 'Merriweather, serif' }}>
            {auth.isAdmin ? '👤 Vân Đình — Quản trị người dùng' : '🏛️ Di sản Vân Đình — Quản lý nội dung'}
          </span>
          <button onClick={() => navigate('home')} style={{ padding: '4px 12px', borderRadius: 5, background: 'rgba(255,255,255,0.1)', border: 'none', color: 'rgba(255,255,255,0.8)', fontSize: 12, cursor: 'pointer' }}>
            ← Trang chủ
          </button>
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <AdminDashboard onNavigate={navigate} onLogout={handleLogout} />
        </div>
      </div>
    );
  }

  // Map page — full height without footer
  if (page === 'map') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <Header currentPage={page} onNavigate={navigate} />
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <MapPage onNavigate={navigate} />
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (page) {
      case 'home': return <HomePage onNavigate={navigate} />;
      case 'relics': return <RelicsPage onNavigate={navigate} />;
      case 'intangible': return <IntangiblePage onNavigate={navigate} />;
      case 'statistics': return <StatisticsPage onNavigate={navigate} />;
      case 'heritage-detail': return <HeritageDetail siteId={heritageSiteId} onNavigate={navigate} />;
      case 'intangible-detail': return <IntangibleHeritageDetail itemId={intangibleId} onNavigate={navigate} />;

      case 'about': return <AboutPage onNavigate={navigate} />;
      case 'contact': return <ContactPage onNavigate={navigate} />;
      case '404': return <NotFoundPage onNavigate={navigate} />;
      default: return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header currentPage={page} onNavigate={navigate} />
      <main style={{ flex: 1 }}>
        {renderContent()}
      </main>
      <Footer onNavigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </LanguageProvider>
  );
}
