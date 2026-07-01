import { useState } from 'react';
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
import { StatisticsPage } from './components/StatisticsPage';
import { IntangiblePage } from './components/IntangiblePage';
import type { UserInfo } from '../core/types';

type Page =
  | 'home' | 'relics' | 'intangible' | 'map' | 'statistics'
  | 'about' | 'contact' | 'heritage-detail' | 'login' | 'admin';

function AboutPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { lang } = useLanguage();
  return (
    <div style={{ background: '#F0F4F8', minHeight: '100vh' }}>
      <div style={{ background: '#0F3D5E', padding: '40px 24px 48px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ color: '#D4A017', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
            {lang === 'vi' ? 'Tổng quan' : 'Overview'}
          </div>
          <h1 style={{ color: 'white', fontSize: 26, fontFamily: 'Merriweather, serif', fontWeight: 700, margin: 0 }}>
            {lang === 'vi' ? 'Giới thiệu' : 'About'}
          </h1>
        </div>
      </div>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px', transform: 'translateY(-24px)' }}>
        <div style={{ background: 'white', borderRadius: 12, padding: '32px', boxShadow: '0 2px 12px rgba(15,61,94,0.08)' }}>
          <h2 style={{ color: '#0F3D5E', fontFamily: 'Merriweather, serif', marginTop: 0, marginBottom: 12 }}>
            {lang === 'vi' ? 'Bản đồ số Di sản Văn hóa Vân Đình' : 'Van Dinh Digital Heritage Map'}
          </h2>
          <div style={{ background: 'linear-gradient(90deg, #D4A017, transparent)', height: 3, width: 80, marginBottom: 20 }} />
          <p style={{ color: '#1a2332', lineHeight: 1.8, fontSize: 14 }}>
            {lang === 'vi'
              ? 'Hệ thống Bản đồ số Di sản Văn hóa Vân Đình là dự án số hóa và bảo tồn di sản văn hóa của xã Vân Đình, huyện Ứng Hòa, thành phố Hà Nội. Dự án nhằm xây dựng một hệ thống thông tin di sản văn hóa toàn diện, kết hợp bản đồ GIS, cơ sở dữ liệu di sản và các công cụ quản lý hiện đại.'
              : 'The Van Dinh Digital Heritage Map System is a project for digitizing and preserving cultural heritage of Van Dinh Commune, Ung Hoa District, Hanoi City. The project aims to build a comprehensive cultural heritage information system combining GIS mapping, heritage databases, and modern management tools.'}
          </p>
          <p style={{ color: '#1a2332', lineHeight: 1.8, fontSize: 14 }}>
            {lang === 'vi'
              ? 'Với tổng số hơn 10 di tích vật thể và 5 di sản phi vật thể được ghi nhận và số hóa, hệ thống cung cấp đầy đủ thông tin lịch sử, kiến trúc, tọa độ và hình ảnh của từng di sản, phục vụ công tác nghiên cứu, bảo tồn và quảng bá du lịch văn hóa.'
              : 'With over 10 tangible heritage sites and 5 intangible heritage items documented and digitized, the system provides comprehensive information on history, architecture, coordinates, and images of each heritage site, serving research, conservation, and cultural tourism promotion.'}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 24 }}>
            {[
              { titleVi: 'Mục tiêu', titleEn: 'Objectives', textVi: 'Số hóa và bảo tồn di sản văn hóa địa phương', textEn: 'Digitize and preserve local cultural heritage' },
              { titleVi: 'Phạm vi', titleEn: 'Scope', textVi: 'Toàn bộ di sản vật thể và phi vật thể xã Vân Đình', textEn: 'All tangible and intangible heritage of Van Dinh Commune' },
              { titleVi: 'Đơn vị thực hiện', titleEn: 'Implementing Unit', textVi: 'UBND xã Vân Đình & Sở Văn hóa Hà Nội', textEn: 'Van Dinh Commune & Hanoi Department of Culture' },
              { titleVi: 'Năm triển khai', titleEn: 'Launch Year', textVi: '2024', textEn: '2024' },
            ].map(item => (
              <div key={item.titleVi} style={{ padding: '14px', background: '#F0F4F8', borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: '#D4A017', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                  {lang === 'vi' ? item.titleVi : item.titleEn}
                </div>
                <div style={{ fontSize: 13, color: '#0F3D5E', fontWeight: 500 }}>{lang === 'vi' ? item.textVi : item.textEn}</div>
              </div>
            ))}
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
            <button
              onClick={() => setSent(true)}
              style={{ marginTop: 16, width: '100%', padding: '12px', borderRadius: 8, background: '#0F3D5E', border: 'none', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(15,61,94,0.3)' }}
            >
              {lang === 'vi' ? 'Gửi tin nhắn' : 'Send Message'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StatisticsPageWrapper({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { lang } = useLanguage();
  return (
    <div style={{ background: '#F0F4F8', minHeight: '100vh' }}>
      <div style={{ background: '#0F3D5E', padding: '32px 24px 48px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ color: '#D4A017', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
            {lang === 'vi' ? 'Dữ liệu' : 'Data'}
          </div>
          <h1 style={{ color: 'white', fontSize: 26, fontFamily: 'Merriweather, serif', fontWeight: 700, margin: 0 }}>
            {lang === 'vi' ? 'Thống kê Di sản' : 'Heritage Statistics'}
          </h1>
        </div>
      </div>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px', transform: 'translateY(-24px)' }}>
        <StatisticsPage onNavigate={onNavigate} />
      </div>
    </div>
  );
}

function AppInner() {
  const [page, setPage] = useState<Page>('home');
  const [heritageSiteId, setHeritageSiteId] = useState<string>('h001');
  const auth = useAuth();

  const navigate = (targetPage: string, id?: string) => {
    if (targetPage === 'heritage-detail' && id) setHeritageSiteId(id);
    setPage(targetPage as Page);
    if (!['login', 'admin'].includes(targetPage)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLogout = async () => {
    await auth.logout();
    setPage('home');
  };

  const handleLoginSuccess = (userData: UserInfo) => {
    auth.login(userData);
    setPage('admin');
  };

  // Login page — full screen, no header/footer
  if (page === 'login') {
    return <LoginPage onNavigate={navigate} onLoginSuccess={handleLoginSuccess} />;
  }

  // Admin panel — full screen with compact top bar
  if (page === 'admin') {
    if (auth.isLoading) {
      return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0F4F8' }}>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ textAlign: 'center', color: '#5d7a8c' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid rgba(15,61,94,0.2)', borderTopColor: '#0F3D5E', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            <div style={{ fontSize: 13 }}>Loading...</div>
          </div>
        </div>
      );
    }
    if (!auth.isAuthenticated) {
      return <LoginPage onNavigate={navigate} onLoginSuccess={handleLoginSuccess} />;
    }
    if (!auth.isAdmin && !auth.isManager) {
      navigate('home');
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
            🏛️ Di sản Vân Đình — Quản trị hệ thống
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
      case 'heritage-detail': return <HeritageDetail siteId={heritageSiteId} onNavigate={navigate} />;
      case 'statistics': return <StatisticsPageWrapper onNavigate={navigate} />;
      case 'about': return <AboutPage onNavigate={navigate} />;
      case 'contact': return <ContactPage onNavigate={navigate} />;
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
