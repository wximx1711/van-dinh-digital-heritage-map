import { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { LazyImage } from './LazyImage';
import { Skeleton } from './Skeleton';
import { useMemorialSites } from '../../presentation/hooks/useMemorialSiteData';
import {
  MEMORIAL_CATEGORIES, MEMORIAL_CLASSIFICATIONS, MEMORIAL_STATUSES,
  memorialCategoryIcons, memorialClassificationColors, memorialClassificationBackgrounds, memorialStatusColors,
} from '../constants/memorial';
import { getImageUrl } from '../utils/url';
import { sanitizeLocation } from '../utils/uiText';
import { Search, Filter, MapPin, Calendar, Eye, RotateCcw } from 'lucide-react';

interface MemorialSitesPageProps {
  onNavigate: (page: string, id?: string) => void;
}

const PAGE_SIZE = 12;

export function MemorialSitesPage({ onNavigate }: MemorialSitesPageProps) {
  const { lang, t } = useLanguage();
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [classification, setClassification] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(query.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, loading, error, refetch } = useMemorialSites({
    q: search || undefined,
    category: category === 'all' ? undefined : category,
    classification: classification === 'all' ? undefined : classification,
    status: status === 'all' ? undefined : status,
    page,
    pageSize: PAGE_SIZE,
  });

  const resetFilters = () => {
    setQuery('');
    setSearch('');
    setCategory('all');
    setClassification('all');
    setStatus('all');
    setPage(1);
  };

  const hasActiveFilters = search !== '' || category !== 'all' || classification !== 'all' || status !== 'all';

  const renderCards = () => data.data.map((item) => (
    <div
      key={item.id}
      onClick={() => onNavigate('memorial-site-detail', item.id)}
      className="card-accent-gold"
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
      <div className="card-img-zoom img-veil" style={{ position: 'relative', height: 200, background: '#dce8f0', overflow: 'hidden' }}>
        {item.image ? (
          <LazyImage
            src={getImageUrl(item.image)}
            alt={lang === 'en' ? (item.nameEn || item.nameVi) : item.nameVi}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, opacity: 0.3 }}>
            {memorialCategoryIcons[item.category]}
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,61,94,0.2)' }} />
        <div style={{
          position: 'absolute', top: 10, left: 10,
          padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
          background: 'rgba(212,160,23,0.9)', color: 'white',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <span>{memorialCategoryIcons[item.category]}</span>
          {t(`memorial.category.${item.category}`)}
        </div>
        <div style={{
          position: 'absolute', top: 10, right: 10,
          padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
          background: memorialClassificationBackgrounds[item.classification],
          color: memorialClassificationColors[item.classification],
        }}>
          {t(`memorial.classification.${item.classification}`)}
        </div>
      </div>
      <div style={{ padding: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: memorialStatusColors[item.status] }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: memorialStatusColors[item.status] }} />
            {t(`memorial.status.${item.status}`)}
          </span>
          <span style={{ fontSize: 10, color: '#5d7a8c' }}>{item.code}</span>
        </div>
        <h3 style={{ color: '#0F3D5E', fontSize: 15, fontWeight: 700, margin: '0 0 10px', lineHeight: 1.35, fontFamily: 'Merriweather, serif' }}>
          {lang === 'en' ? (item.nameEn || item.nameVi) : item.nameVi}
        </h3>
        <p style={{
          color: '#5d7a8c', fontSize: 13, lineHeight: 1.65, margin: '0 0 12px',
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {sanitizeLocation(lang === 'en' ? (item.descriptionEn || item.descriptionVi) : item.descriptionVi) || (lang === 'vi' ? 'Chưa có mô tả' : 'No description')}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
          {(lang === 'vi' ? item.addressVi : item.addressEn) && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#5d7a8c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <MapPin size={11} style={{ flexShrink: 0 }} /> {sanitizeLocation(lang === 'vi' ? item.addressVi : item.addressEn)}
            </span>
          )}
          {item.eventDate && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#5d7a8c' }}>
              <Calendar size={11} /> {t('memorial.eventDate')}: {item.eventDate}
            </span>
          )}
        </div>
        <button onClick={(e) => { e.stopPropagation(); onNavigate('memorial-site-detail', item.id); }} style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
          padding: '8px 0', borderRadius: 7,
          background: '#0F3D5E', border: 'none',
          color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer',
        }}>
          <Eye size={12} /> {t('memorial.detail')}
        </button>
      </div>
    </div>
  ));

  return (
    <div style={{ background: '#F0F4F8', minHeight: '100vh' }}>
      {/* Page header */}
      <div className="page-hero" style={{ background: '#0F3D5E', padding: '32px 24px 40px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ color: '#D4A017', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
            {lang === 'vi' ? 'Lưu niệm' : 'Memorial'}
          </div>
          <h1 style={{ color: 'white', fontSize: 26, fontFamily: 'Merriweather, serif', fontWeight: 700, margin: '0 0 8px' }}>
            {t('memorial.title')}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, margin: 0 }}>
            {t('memorial.subtitle')}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 16px', transform: 'translateY(-24px)' }}>
        {/* Filter bar */}
        <div className="relics-filters" style={{ background: 'white', borderRadius: 10, padding: '16px', marginBottom: 20, boxShadow: '0 4px 16px rgba(15,61,94,0.1)', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#5d7a8c' }} />
            <input
              value={query} onChange={e => setQuery(e.target.value)}
              className="field-focus"
              placeholder={t('memorial.searchPlaceholder')}
              style={{ width: '100%', padding: '9px 9px 9px 32px', borderRadius: 7, border: '1.5px solid rgba(15,61,94,0.12)', fontSize: 'clamp(12px, 3vw, 13px)', background: '#F0F4F8', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* Category filter */}
          <div className="relics-filter-select" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Filter size={13} style={{ color: '#5d7a8c', flexShrink: 0 }} />
            <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}
              className="field-focus"
              style={{ padding: '9px 10px', borderRadius: 7, border: '1.5px solid rgba(15,61,94,0.12)', fontSize: 'clamp(12px, 3vw, 13px)', background: 'white', cursor: 'pointer', outline: 'none', maxWidth: 170 }}>
              <option value="all">{lang === 'vi' ? 'Tất cả loại hình' : 'All categories'}</option>
              {MEMORIAL_CATEGORIES.map(c => (
                <option key={c} value={c}>{t(`memorial.category.${c}`)}</option>
              ))}
            </select>
          </div>

          {/* Classification filter */}
          <select value={classification} onChange={e => { setClassification(e.target.value); setPage(1); }}
            className="field-focus"
            style={{ padding: '9px 10px', borderRadius: 7, border: '1.5px solid rgba(15,61,94,0.12)', fontSize: 'clamp(12px, 3vw, 13px)', background: 'white', cursor: 'pointer', outline: 'none', maxWidth: 160 }}>
            <option value="all">{lang === 'vi' ? 'Tất cả xếp hạng' : 'All classifications'}</option>
            {MEMORIAL_CLASSIFICATIONS.map(c => (
              <option key={c} value={c}>{t(`memorial.classification.${c}`)}</option>
            ))}
          </select>

          {/* Status filter */}
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="field-focus"
            style={{ padding: '9px 10px', borderRadius: 7, border: '1.5px solid rgba(15,61,94,0.12)', fontSize: 'clamp(12px, 3vw, 13px)', background: 'white', cursor: 'pointer', outline: 'none', maxWidth: 160 }}>
            <option value="all">{lang === 'vi' ? 'Tất cả trạng thái' : 'All statuses'}</option>
            {MEMORIAL_STATUSES.map(s => (
              <option key={s} value={s}>{t(`memorial.status.${s}`)}</option>
            ))}
          </select>

          {/* Reset */}
          {hasActiveFilters && (
            <button onClick={resetFilters} className="touch-target" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '9px 14px', borderRadius: 7, border: '1px solid rgba(212,160,23,0.3)', background: 'rgba(212,160,23,0.05)', color: '#B8860B', fontSize: 'clamp(11px, 2.5vw, 12px)', fontWeight: 600, cursor: 'pointer' }}>
              <RotateCcw size={12} /> {t('map.resetfilter')}
            </button>
          )}
        </div>

        {/* Count */}
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontSize: 13, color: '#5d7a8c' }}>
            {lang === 'vi'
              ? `Hiển thị ${data.totalRecords} kết quả`
              : `Showing ${data.totalRecords} results`}
          </span>
        </div>

        {/* Loading state */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(15,61,94,0.08)' }}>
                <Skeleton height={200} borderRadius={0} />
                <div style={{ padding: '18px' }}>
                  <Skeleton width="40%" height={12} borderRadius={3} style={{ marginBottom: 10 }} />
                  <Skeleton width="85%" height={16} borderRadius={3} style={{ marginBottom: 10 }} />
                  <Skeleton height={13} borderRadius={3} style={{ marginBottom: 8 }} />
                  <Skeleton height={13} borderRadius={3} style={{ marginBottom: 14 }} />
                  <Skeleton height={34} borderRadius={7} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div style={{ background: 'white', borderRadius: 12, padding: '48px', textAlign: 'center', boxShadow: '0 2px 12px rgba(15,61,94,0.08)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#E74C3C', marginBottom: 8 }}>{t('memorial.errorTitle')}</div>
            <div style={{ fontSize: 13, color: '#5d7a8c', marginBottom: 16 }}>{error.message}</div>
            <button onClick={refetch} style={{ padding: '9px 22px', borderRadius: 8, background: '#0F3D5E', border: 'none', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              {t('memorial.retry')}
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && data.data.length === 0 && (
          <div style={{ background: 'white', borderRadius: 12, padding: '48px', textAlign: 'center', boxShadow: '0 2px 12px rgba(15,61,94,0.08)', color: '#5d7a8c', fontSize: 13 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🕯️</div>
            {hasActiveFilters
              ? (lang === 'vi' ? 'Không tìm thấy kết quả nào phù hợp' : 'No matching results found')
              : t('memorial.empty')}
            {hasActiveFilters && (
              <div style={{ marginTop: 16 }}>
                <button onClick={resetFilters} style={{ padding: '9px 22px', borderRadius: 8, background: '#0F3D5E', border: 'none', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  {t('map.resetfilter')}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Grid */}
        {!loading && !error && data.data.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24, marginBottom: 24 }}>
            {renderCards()}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && data.totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, paddingBottom: 32, alignItems: 'center' }}>
            {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => { setPage(p); window.scrollTo(0, 0); }}
                className="pager-btn"
                style={{ width: 36, height: 36, borderRadius: 8, border: '1.5px solid', borderColor: page === p ? '#0F3D5E' : 'rgba(15,61,94,0.15)', background: page === p ? 'linear-gradient(135deg, #0F3D5E, #1A5276)' : 'white', color: page === p ? 'white' : '#5d7a8c', cursor: 'pointer', fontSize: 13, fontWeight: page === p ? 700 : 400 }}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}