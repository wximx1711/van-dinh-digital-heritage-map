import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from './LanguageContext';
import { LazyImage } from './LazyImage';
import { Skeleton } from './Skeleton';
import { fetchIntangibleHeritageList } from '../services/intangibleService';
import { Play, Eye, Search, Filter, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { intangibleCategoryIcons } from '../constants';
import { getImageUrl } from '../utils/url';
import { sanitizeLocation } from '../utils/uiText';
import type { IntangibleHeritage } from '../../core/types';

interface IntangiblePageProps {
  onNavigate: (page: string, id?: string) => void;
}

const PAGE_SIZE = 12;
const INTANGIBLE_CATEGORIES = ['knowledge', 'festival', 'belief', 'craft'] as const;

interface IntangiblePageResult {
  data: IntangibleHeritage[];
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export function IntangiblePage({ onNavigate }: IntangiblePageProps) {
  const { lang, t } = useLanguage();
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<IntangiblePageResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(query.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchIntangibleHeritageList(
        search || undefined,
        category === 'all' ? undefined : category,
        page,
        PAGE_SIZE,
      );
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load data'));
    } finally {
      setLoading(false);
    }
  }, [search, category, page]);

  useEffect(() => { loadData(); }, [loadData]);

  const resetFilters = () => {
    setQuery('');
    setSearch('');
    setCategory('all');
    setPage(1);
  };

  const hasActiveFilters = search !== '' || category !== 'all';

  const totalPages = data?.totalPages ?? 0;
  const pageItems: (number | string)[] = [];
  if (totalPages > 1) {
    pageItems.push(1);
    const windowStart = Math.max(2, page - 1);
    const windowEnd = Math.min(totalPages - 1, page + 1);
    if (windowStart > 2) pageItems.push('...');
    for (let p = windowStart; p <= windowEnd; p++) pageItems.push(p);
    if (windowEnd < totalPages - 1) pageItems.push('...');
    pageItems.push(totalPages);
  }

  const renderCards = () => (data?.data ?? []).map((item) => (
    <div
      key={item.id}
      onClick={() => onNavigate('intangible-detail', item.id)}
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
          {lang === 'en' ? (item.nameEn || item.nameVi) : item.nameVi}
        </h3>
        <p style={{
          color: '#5d7a8c', fontSize: 13, lineHeight: 1.65, margin: '0 0 16px',
          display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {sanitizeLocation(lang === 'en' ? (item.descriptionEn || item.descriptionVi) : item.descriptionVi) || (lang === 'vi' ? 'Chưa có mô tả' : 'No description')}
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
          <button onClick={(e) => { e.stopPropagation(); onNavigate('intangible-detail', item.id); }} style={{
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
  ));

  return (
    <div style={{ background: '#F0F4F8', minHeight: '100vh' }}>
      <div className="page-hero" style={{ background: '#0F3D5E', padding: '32px 24px 40px' }}>
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

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 16px', transform: 'translateY(-24px)' }}>
        {/* Filter bar */}
        <div className="relics-filters" style={{ background: 'white', borderRadius: 10, padding: '16px', marginBottom: 20, boxShadow: '0 4px 16px rgba(15,61,94,0.1)', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#5d7a8c' }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="field-focus"
              placeholder={lang === 'vi' ? 'Tìm kiếm di sản phi vật thể...' : 'Search intangible heritage...'}
              style={{ width: '100%', padding: '9px 9px 9px 32px', borderRadius: 7, border: '1.5px solid rgba(15,61,94,0.12)', fontSize: 'clamp(12px, 3vw, 13px)', background: '#F0F4F8', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* Category filter */}
          <div className="relics-filter-select" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Filter size={13} style={{ color: '#5d7a8c', flexShrink: 0 }} />
            <select
              value={category}
              onChange={e => { setCategory(e.target.value); setPage(1); }}
              className="field-focus"
              style={{ padding: '9px 10px', borderRadius: 7, border: '1.5px solid rgba(15,61,94,0.12)', fontSize: 'clamp(12px, 3vw, 13px)', background: 'white', cursor: 'pointer', outline: 'none', maxWidth: 180 }}>
              <option value="all">{t('common.all')}</option>
              {INTANGIBLE_CATEGORIES.map(c => (
                <option key={c} value={c}>{t(`intangible.${c}`)}</option>
              ))}
            </select>
          </div>

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
              ? `Hiển thị ${data?.totalRecords ?? 0} kết quả`
              : `Showing ${data?.totalRecords ?? 0} results`}
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
            <div style={{ fontSize: 16, fontWeight: 700, color: '#E74C3C', marginBottom: 8 }}>
              {lang === 'vi' ? 'Không thể tải dữ liệu' : 'Failed to load data'}
            </div>
            <div style={{ fontSize: 13, color: '#5d7a8c', marginBottom: 16 }}>{error.message}</div>
            <button onClick={loadData} style={{ padding: '9px 22px', borderRadius: 8, background: '#0F3D5E', border: 'none', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              {lang === 'vi' ? 'Thử lại' : 'Retry'}
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && (data?.data.length ?? 0) === 0 && (
          <div style={{ background: 'white', borderRadius: 12, padding: '48px', textAlign: 'center', boxShadow: '0 2px 12px rgba(15,61,94,0.08)', color: '#5d7a8c', fontSize: 13 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📖</div>
            {hasActiveFilters
              ? (lang === 'vi' ? 'Không tìm thấy kết quả nào phù hợp' : 'No matching results found')
              : (lang === 'vi' ? 'Chưa có dữ liệu di sản phi vật thể' : 'No intangible heritage data available')}
            {hasActiveFilters && (
              <div style={{ marginTop: 16 }}>
                <button onClick={resetFilters} style={{ padding: '9px 22px', borderRadius: 8, background: '#0F3D5E', border: 'none', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  {t('map.resetfilter')}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Results grid */}
        {!loading && !error && (data?.data.length ?? 0) > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {renderCards()}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, margin: '28px 0 8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo(0, 0); }}
              disabled={page === 1}
              className="pager-btn touch-target"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                minWidth: 36, height: 36, padding: '0 10px', borderRadius: 7,
                border: '1px solid rgba(15,61,94,0.15)', background: 'white',
                color: page === 1 ? '#c0ccd4' : '#0F3D5E', fontSize: 13, cursor: page === 1 ? 'not-allowed' : 'pointer',
              }}
              aria-label={lang === 'vi' ? 'Trang trước' : 'Previous page'}
            >
              <ChevronLeft size={16} />
            </button>
            {pageItems.map((p, i) => (
              p === '...' ? (
                <span key={`e-${i}`} style={{ color: '#5d7a8c', fontSize: 13, padding: '0 2px' }}>...</span>
              ) : (
                <button
                  key={p}
                  onClick={() => { if (p !== page) { setPage(p); window.scrollTo(0, 0); } }}
                  className="pager-btn touch-target"
                  style={{
                    minWidth: 36, height: 36, padding: '0 4px', borderRadius: 7,
                    border: 'none',
                    background: p === page
                      ? 'linear-gradient(135deg, #0F3D5E, #1a5a85)'
                      : 'white',
                    color: p === page ? 'white' : '#0F3D5E',
                    fontSize: 13, fontWeight: p === page ? 700 : 500, cursor: 'pointer',
                    boxShadow: p === page ? '0 4px 12px rgba(15,61,94,0.3)' : '0 1px 4px rgba(15,61,94,0.1)',
                  }}
                >
                  {p}
                </button>
              )
            ))}
            <button
              onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo(0, 0); }}
              disabled={page === totalPages}
              className="pager-btn touch-target"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                minWidth: 36, height: 36, padding: '0 10px', borderRadius: 7,
                border: '1px solid rgba(15,61,94,0.15)', background: 'white',
                color: page === totalPages ? '#c0ccd4' : '#0F3D5E', fontSize: 13, cursor: page === totalPages ? 'not-allowed' : 'pointer',
              }}
              aria-label={lang === 'vi' ? 'Trang sau' : 'Next page'}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}