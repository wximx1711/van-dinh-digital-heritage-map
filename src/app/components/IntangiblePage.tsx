import { useLanguage } from './LanguageContext';
import { intangibleHeritage } from './data';
import { Play, Eye } from 'lucide-react';
import { intangibleCategoryIcons } from '../constants';

interface IntangiblePageProps {
  onNavigate: (page: string, id?: string) => void;
}

export function IntangiblePage({ onNavigate }: IntangiblePageProps) {
  const { lang, t } = useLanguage();

  return (
    <div style={{ background: '#F0F4F8', minHeight: '100vh' }}>
      <div style={{ background: '#0F3D5E', padding: '32px 24px 40px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ color: '#D4A017', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
            {lang === 'vi' ? 'Phi vật thể' : 'Intangible'}
          </div>
          <h1 style={{ color: 'white', fontSize: 26, fontFamily: 'Merriweather, serif', fontWeight: 700, margin: '0 0 8px' }}>
            {t('intangible.title')}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, margin: 0 }}>
            {t('intangible.subtitle')}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px', transform: 'translateY(-24px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
          {intangibleHeritage.map((item) => (
            <div
              key={item.id}
              style={{
                background: 'white', borderRadius: 12, overflow: 'hidden',
                boxShadow: '0 2px 12px rgba(15,61,94,0.08)',
                transition: 'transform 0.25s, box-shadow 0.25s', cursor: 'pointer',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-5px)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 32px rgba(15,61,94,0.15)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(15,61,94,0.08)';
              }}
            >
              <div style={{ position: 'relative', height: 200, background: '#dce8f0', overflow: 'hidden' }}>
                <img
                  src={item.image}
                  alt={lang === 'vi' ? item.nameVi : item.nameEn}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,61,94,0.2)' }} />
                <div style={{
                  position: 'absolute', top: 10, left: 10,
                  padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                  background: 'rgba(212,160,23,0.9)', color: 'white',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <span>{intangibleCategoryIcons[item.category]}</span>
                  {t(`intangible.${item.category}`)}
                </div>
              </div>
              <div style={{ padding: '18px' }}>
                <h3 style={{ color: '#0F3D5E', fontSize: 15, fontWeight: 700, margin: '0 0 10px', fontFamily: 'Merriweather, serif' }}>
                  {lang === 'vi' ? item.nameVi : item.nameEn}
                </h3>
                <p style={{
                  color: '#5d7a8c', fontSize: 13, lineHeight: 1.65, margin: '0 0 16px',
                  display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {lang === 'vi' ? item.descriptionVi : item.descriptionEn}
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                    padding: '8px 0', borderRadius: 7,
                    border: '1px solid #0F3D5E', background: 'white',
                    color: '#0F3D5E', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}>
                    <Play size={12} /> {t('intangible.video')}
                  </button>
                  <button style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                    padding: '8px 0', borderRadius: 7,
                    background: '#0F3D5E', border: 'none',
                    color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}>
                    <Eye size={12} /> {t('intangible.detail')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
