import { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { useIntangibleHeritage } from '../../presentation/hooks/useHeritageData';
import { Play, Eye, X, Calendar, Clock } from 'lucide-react';
import { intangibleCategoryIcons } from '../constants';
import { getImageUrl } from '../utils/url';

interface IntangiblePageProps {
  onNavigate: (page: string, id?: string) => void;
}

export function IntangiblePage({ onNavigate }: IntangiblePageProps) {
  const { lang, t } = useLanguage();
  const { data: intangibleHeritage } = useIntangibleHeritage();
  const [selected, setSelected] = useState<any>(null);

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
        {intangibleHeritage.length === 0 ? (
          <div style={{
            background: 'white', borderRadius: 12, padding: '48px', textAlign: 'center',
            boxShadow: '0 2px 12px rgba(15,61,94,0.08)', color: '#5d7a8c', fontSize: 13,
          }}>
            {lang === 'vi' ? 'Chưa có dữ liệu di sản phi vật thể' : 'No intangible heritage data available'}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {intangibleHeritage.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelected(item)}
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
                  {item.image ? (
                    <img
                      src={getImageUrl(item.image)}
                      alt={lang === 'vi' ? item.nameVi : item.nameEn}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, opacity: 0.3 }}>
                      {intangibleCategoryIcons[item.category]}
                    </div>
                  )}
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
                    {lang === 'vi' ? item.descriptionVi : item.descriptionEn || (lang === 'vi' ? 'Chưa có mô tả' : 'No description')}
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {item.videoUrl && (
                      <a href={item.videoUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                        padding: '8px 0', borderRadius: 7,
                        border: '1px solid #0F3D5E', background: 'white',
                        color: '#0F3D5E', fontSize: 12, fontWeight: 600, cursor: 'pointer', textDecoration: 'none',
                      }}>
                        <Play size={12} /> {t('intangible.video')}
                      </a>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); setSelected(item); }} style={{
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
        )}
      </div>

      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setSelected(null)}>
          <div style={{
            background: 'white', borderRadius: 12, width: '90%', maxWidth: 600, maxHeight: '85vh',
            overflow: 'hidden', display: 'flex', flexDirection: 'column',
            boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '14px 20px', background: '#0F3D5E', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>
                {lang === 'vi' ? selected.nameVi : selected.nameEn}
              </span>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1, padding: '20px' }}>
              {selected.image && (
                <img src={getImageUrl(selected.image)} alt="" style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 8, marginBottom: 16 }} />
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div style={{ padding: '10px', background: '#F8FAFC', borderRadius: 8 }}>
                  <div style={{ fontSize: 10, color: '#5d7a8c', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>{t('im.category')}</div>
                  <div style={{ fontSize: 13, color: '#0F3D5E', fontWeight: 600 }}>
                    {intangibleCategoryIcons[selected.category]} {t(`intangible.${selected.category}`)}
                  </div>
                </div>
                <div style={{ padding: '10px', background: '#F8FAFC', borderRadius: 8 }}>
                  <div style={{ fontSize: 10, color: '#5d7a8c', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
                    {lang === 'vi' ? 'Ngày tạo' : 'Created'}
                  </div>
                  <div style={{ fontSize: 13, color: '#0F3D5E', fontWeight: 600 }}>
                    <Calendar size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                    {(selected as any).createdAt || (lang === 'vi' ? 'Chưa có' : 'N/A')}
                  </div>
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0F3D5E', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                  {t('common.description')} (VI)
                </div>
                <p style={{ fontSize: 13, color: '#1a2332', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>
                  {selected.descriptionVi || (lang === 'vi' ? 'Chưa có mô tả' : 'No description')}
                </p>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0F3D5E', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                  {t('common.description')} (EN)
                </div>
                <p style={{ fontSize: 13, color: '#1a2332', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>
                  {selected.descriptionEn || (lang === 'vi' ? 'Chưa có mô tả' : 'No description')}
                </p>
              </div>
              {selected.videoUrl && (
                <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(15,61,94,0.08)' }}>
                  <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                    <iframe
                      src={`https://www.youtube.com/embed/${selected.videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)?.[1] || selected.videoUrl}`}
                      title={selected.nameVi}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}