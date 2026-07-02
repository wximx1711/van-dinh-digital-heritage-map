import { useLanguage } from './LanguageContext';
import { Home, Search, ArrowLeft } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate: (page: string) => void;
}

export function NotFoundPage({ onNavigate }: NotFoundPageProps) {
  const { lang } = useLanguage();

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#F0F4F8', padding: 24,
    }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <div style={{
          width: 120, height: 120, borderRadius: '50%', background: '#0F3D5E',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <span style={{ fontSize: 48, fontWeight: 800, color: '#D4A017', fontFamily: 'Merriweather, serif' }}>404</span>
        </div>
        <h1 style={{ color: '#0F3D5E', fontSize: 22, fontFamily: 'Merriweather, serif', marginBottom: 8 }}>
          {lang === 'vi' ? 'Trang không tìm thấy' : 'Page Not Found'}
        </h1>
        <p style={{ color: '#5d7a8c', fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
          {lang === 'vi'
            ? 'Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển. Vui lòng kiểm tra lại đường dẫn hoặc quay về trang chủ.'
            : 'The page you are looking for does not exist or has been moved. Please check the URL or return to the home page.'}
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={() => onNavigate('home')} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 24px', borderRadius: 8,
            background: '#0F3D5E', border: 'none', color: 'white',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>
            <Home size={14} /> {lang === 'vi' ? 'Về trang chủ' : 'Home'}
          </button>
          <button onClick={() => onNavigate('relics')} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 24px', borderRadius: 8,
            background: 'white', border: '1px solid rgba(15,61,94,0.2)',
            color: '#0F3D5E', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>
            <Search size={14} /> {lang === 'vi' ? 'Khám phá di tích' : 'Explore Relics'}
          </button>
        </div>
      </div>
    </div>
  );
}