import { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { LazyImage } from './LazyImage';
import { useHeritageSites, useIntangibleHeritage, useClassificationLabels, useTypeLabels } from '../../presentation/hooks/useHeritageData';
import type { Classification, HeritageType } from '../../core/types';
import { classificationColors, classificationBackgrounds, statusColors, intangibleCategoryIcons } from '../constants';
import { getImageUrl } from '../utils/url';
import { normalizeSearchText } from '../utils/string';
import { Search, Filter, MapPin, Calendar, Eye, RotateCcw, Grid2x2, List, Play } from 'lucide-react';

interface RelicsPageProps {
  onNavigate: (page: string, id?: string) => void;
  searchQuery?: string;
}

function matchHeritageSite(site: { nameVi: string; nameEn: string; code: string; descriptionVi: string; descriptionEn: string; addressVi: string; addressEn: string; historyVi: string; historyEn: string; }, q: string): boolean {
  if (!q) return true;
  return (
    normalizeSearchText(site.nameVi).includes(q) ||
    normalizeSearchText(site.nameEn).includes(q) ||
    normalizeSearchText(site.code).includes(q) ||
    normalizeSearchText(site.descriptionVi).includes(q) ||
    normalizeSearchText(site.descriptionEn).includes(q) ||
    normalizeSearchText(site.addressVi).includes(q) ||
    normalizeSearchText(site.addressEn).includes(q) ||
    normalizeSearchText(site.historyVi).includes(q) ||
    normalizeSearchText(site.historyEn).includes(q)
  );
}

function matchIntangible(item: { nameVi: string; nameEn: string; descriptionVi: string; descriptionEn: string; otherNames?: string; location?: string; community?: string; origin?: string; originEn?: string; heritageValue?: string; heritageValueEn?: string; currentStatus?: string; currentStatusEn?: string; }, q: string): boolean {
  if (!q) return true;
  return (
    normalizeSearchText(item.nameVi).includes(q) ||
    normalizeSearchText(item.nameEn).includes(q) ||
    normalizeSearchText(item.descriptionVi).includes(q) ||
    normalizeSearchText(item.descriptionEn).includes(q) ||
    (item.otherNames ? normalizeSearchText(item.otherNames).includes(q) : false) ||
    (item.location ? normalizeSearchText(item.location).includes(q) : false) ||
    (item.community ? normalizeSearchText(item.community).includes(q) : false) ||
    (item.origin ? normalizeSearchText(item.origin).includes(q) : false) ||
    (item.originEn ? normalizeSearchText(item.originEn).includes(q) : false) ||
    (item.heritageValue ? normalizeSearchText(item.heritageValue).includes(q) : false) ||
    (item.heritageValueEn ? normalizeSearchText(item.heritageValueEn).includes(q) : false) ||
    (item.currentStatus ? normalizeSearchText(item.currentStatus).includes(q) : false) ||
    (item.currentStatusEn ? normalizeSearchText(item.currentStatusEn).includes(q) : false)
  );
}

export function RelicsPage({ onNavigate, searchQuery = '' }: RelicsPageProps) {
  const { lang, t } = useLanguage();
  const { data: heritageSites } = useHeritageSites();
  const { data: intangibleHeritage } = useIntangibleHeritage();
  const classificationLabels = useClassificationLabels();
  const typeLabels = useTypeLabels();
  const [search, setSearch] = useState(searchQuery);
  const [filterCls, setFilterCls] = useState<Classification | 'all'>('all');
  const [filterType, setFilterType] = useState<HeritageType | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  useEffect(() => {
    if (searchQuery) {
      setSearch(searchQuery);
      setPage(1);
    }
  }, [searchQuery]);

  const normalizedQuery = normalizeSearchText(search);

  const filteredHeritage = heritageSites.filter(s => {
    if (!search) return true;
    const q = normalizedQuery;
    const matchSearch = matchHeritageSite(s, q);
    const matchCls = filterCls === 'all' || s.classification === filterCls;
    const matchType = filterType === 'all' || s.type === filterType;
    return matchSearch && matchCls && matchType;
  });

  const filteredIntangible = !search ? [] : intangibleHeritage.filter(i => {
    const q = normalizedQuery;
    return matchIntangible(i, q);
  });

  const hasSearch = search.trim().length > 0;

  const totalPages = Math.ceil(filteredHeritage.length / PER_PAGE);
  const paginated = filteredHeritage.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const resetFilters = () => { setSearch(''); setFilterCls('all'); setFilterType('all'); setPage(1); };

  const totalResults = filteredHeritage.length + filteredIntangible.length;

  return (
    <div style={{ background: '#F0F4F8', minHeight: '100vh' }}>
      {/* Page header */}
      <div style={{ background: '#0F3D5E', padding: '32px 24px 40px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ color: '#D4A017', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
            {lang === 'vi' ? 'Danh mục' : 'Catalog'}
          </div>
          <h1 style={{ color: 'white', fontSize: 26, fontFamily: 'Merriweather, serif', fontWeight: 700, margin: '0 0 8px' }}>
            {t('nav.relics')}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, margin: 0 }}>
            {lang === 'vi' ? `${heritageSites.length} di tích được ghi nhận tại xã Vân Đình` : `${heritageSites.length} heritage sites recorded in Van Dinh Commune`}
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
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder={t('hero.search.placeholder')}
              style={{ width: '100%', padding: '9px 9px 9px 32px', borderRadius: 7, border: '1.5px solid rgba(15,61,94,0.12)', fontSize: 'clamp(12px, 3vw, 13px)', background: '#F0F4F8', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* Classification filter */}
          <div className="relics-filter-select" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Filter size={13} style={{ color: '#5d7a8c', flexShrink: 0 }} />
            <select value={filterCls} onChange={e => { setFilterCls(e.target.value as Classification | 'all'); setPage(1); }}
              style={{ padding: '9px 10px', borderRadius: 7, border: '1.5px solid rgba(15,61,94,0.12)', fontSize: 'clamp(12px, 3vw, 13px)', background: 'white', cursor: 'pointer', outline: 'none', maxWidth: 160 }}>
              <option value="all">{t('common.all')}</option>
              <option value="national">{t('map.national')}</option>
              <option value="city">{t('map.city')}</option>
              <option value="unranked">{t('map.unranked')}</option>
            </select>
          </div>

          {/* Type filter */}
          <select value={filterType} onChange={e => { setFilterType(e.target.value as HeritageType | 'all'); setPage(1); }}
            style={{ padding: '9px 10px', borderRadius: 7, border: '1.5px solid rgba(15,61,94,0.12)', fontSize: 'clamp(12px, 3vw, 13px)', background: 'white', cursor: 'pointer', outline: 'none', maxWidth: 160 }}>
            <option value="all">{t('common.all')}</option>
            {Object.entries(typeLabels).map(([k, v]) => (
              <option key={k} value={k}>{v[lang]}</option>
            ))}
          </select>

          {/* Reset */}
          {(search || filterCls !== 'all' || filterType !== 'all') && (
            <button onClick={resetFilters} className="touch-target" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '9px 14px', borderRadius: 7, border: '1px solid rgba(212,160,23,0.3)', background: 'rgba(212,160,23,0.05)', color: '#B8860B', fontSize: 'clamp(11px, 2.5vw, 12px)', fontWeight: 600, cursor: 'pointer' }}>
              <RotateCcw size={12} /> {t('map.resetfilter')}
            </button>
          )}

          {/* View toggle */}
          {!hasSearch && (
            <div style={{ display: 'flex', gap: 2, background: '#F0F4F8', borderRadius: 7, padding: 3 }}>
              {[{ mode: 'grid', icon: <Grid2x2 size={14} /> }, { mode: 'list', icon: <List size={14} /> }].map(v => (
                <button key={v.mode} onClick={() => setViewMode(v.mode as 'grid' | 'list')}
                  style={{ padding: '6px 10px', borderRadius: 5, border: 'none', cursor: 'pointer', background: viewMode === v.mode ? 'white' : 'transparent', color: viewMode === v.mode ? '#0F3D5E' : '#5d7a8c', boxShadow: viewMode === v.mode ? '0 1px 4px rgba(15,61,94,0.1)' : 'none', display: 'flex', alignItems: 'center' }}>
                  {v.icon}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Count */}
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: '#5d7a8c' }}>
            {hasSearch
              ? (lang === 'vi' ? `Tìm thấy ${totalResults} kết quả cho "${search.trim()}"` : `Found ${totalResults} results for "${search.trim()}"`)
              : (lang === 'vi' ? `Hiển thị ${filteredHeritage.length} kết quả` : `Showing ${filteredHeritage.length} results`)}
          </span>
        </div>

        {/* Heritage Sites section */}
        {filteredHeritage.length > 0 && (
          <>
            {hasSearch && (
              <h3 style={{ color: '#0F3D5E', fontSize: 15, fontFamily: 'Merriweather, serif', fontWeight: 700, margin: '0 0 12px' }}>
                {lang === 'vi' ? 'Di tích' : 'Heritage Sites'}
              </h3>
            )}
            {/* Grid view */}
            {(!hasSearch && viewMode === 'grid') || hasSearch ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20, marginBottom: 24 }}>
                {(hasSearch ? filteredHeritage : paginated).map(site => (
                  <div key={site.id} onClick={() => onNavigate('heritage-detail', site.id)}
                    style={{ background: 'white', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', boxShadow: '0 2px 10px rgba(15,61,94,0.07)', transition: 'transform 0.25s, box-shadow 0.25s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-5px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 32px rgba(15,61,94,0.15)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 10px rgba(15,61,94,0.07)'; }}
                  >
                    <div style={{ position: 'relative', height: 180, background: '#dce8f0' }}>
                      <LazyImage src={getImageUrl(site.image)} alt={lang === 'vi' ? site.nameVi : site.nameEn} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: 10, left: 10, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: classificationBackgrounds[site.classification], color: classificationColors[site.classification] }}>
                        {classificationLabels[site.classification][lang]}
                      </div>
                      <div style={{ position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: '50%', background: statusColors[site.status], border: '2px solid white' }} />
                    </div>
                    <div style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: '#EBF5FB', color: '#0F3D5E' }}>
                          {typeLabels[site.type][lang]}
                        </span>
                        <span style={{ fontSize: 10, color: '#5d7a8c' }}>{site.code}</span>
                      </div>
                      <h3 style={{ color: '#0F3D5E', fontSize: 14, fontWeight: 700, margin: '0 0 6px', lineHeight: 1.3 }}>
                        {lang === 'vi' ? site.nameVi : site.nameEn}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#5d7a8c' }}>
                          <MapPin size={10} /> {lang === 'vi' ? 'Vân Đình' : 'Van Dinh'}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#5d7a8c' }}>
                          <Calendar size={10} /> {site.yearBuilt}
                        </span>
                      </div>
                      <button style={{ width: '100%', padding: '7px', borderRadius: 7, background: '#0F3D5E', border: 'none', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                        <Eye size={12} /> {t('featured.viewprofile')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {/* List view (only when not searching) */}
            {!hasSearch && viewMode === 'list' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {paginated.map(site => (
                  <div key={site.id} onClick={() => onNavigate('heritage-detail', site.id)}
                    className="relics-list-item"
                    style={{ background: 'white', borderRadius: 10, overflow: 'hidden', cursor: 'pointer', boxShadow: '0 2px 8px rgba(15,61,94,0.06)', display: 'flex', transition: 'box-shadow 0.2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 20px rgba(15,61,94,0.12)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(15,61,94,0.06)'; }}
                  >
                    <div style={{ width: 120, height: 90, background: '#dce8f0', flexShrink: 0 }}>
                      <LazyImage src={getImageUrl(site.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div className="relics-list-content" style={{ flex: 1, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                          <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: classificationBackgrounds[site.classification], color: classificationColors[site.classification] }}>
                            {classificationLabels[site.classification][lang]}
                          </span>
                          <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: '#EBF5FB', color: '#0F3D5E' }}>
                            {typeLabels[site.type][lang]}
                          </span>
                        </div>
                        <h3 style={{ color: '#0F3D5E', fontSize: 14, fontWeight: 700, margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lang === 'vi' ? site.nameVi : site.nameEn}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 11, color: '#5d7a8c', display: 'flex', alignItems: 'center', gap: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><MapPin size={10} />{lang === 'vi' ? site.addressVi.split(',').slice(-2).join(',') : site.addressEn.split(',').slice(-2).join(',')}</span>
                        </div>
                      </div>
                      <button className="hide-mobile" style={{ padding: '7px 16px', borderRadius: 7, background: '#0F3D5E', border: 'none', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                        <Eye size={12} /> {t('featured.viewprofile')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!hasSearch && totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, paddingBottom: 32 }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => { setPage(p); window.scrollTo(0, 0); }}
                    style={{ width: 36, height: 36, borderRadius: 8, border: '1.5px solid', borderColor: page === p ? '#0F3D5E' : 'rgba(15,61,94,0.15)', background: page === p ? '#0F3D5E' : 'white', color: page === p ? 'white' : '#5d7a8c', cursor: 'pointer', fontSize: 13, fontWeight: page === p ? 700 : 400 }}>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Intangible Heritage section */}
        {filteredIntangible.length > 0 && (
          <>
            <h3 style={{ color: '#0F3D5E', fontSize: 15, fontFamily: 'Merriweather, serif', fontWeight: 700, margin: '24px 0 12px' }}>
              {lang === 'vi' ? 'Di sản phi vật thể' : 'Intangible Heritage'}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20, marginBottom: 24 }}>
              {filteredIntangible.map(item => (
                <div
                  key={item.id}
                  onClick={() => onNavigate('intangible-detail', item.id)}
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
                  <div style={{ position: 'relative', height: 160, background: '#dce8f0', overflow: 'hidden' }}>
                    <LazyImage
                      src={getImageUrl(item.image)}
                      alt={lang === 'en' ? (item.nameEn || item.nameVi) : item.nameVi}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,61,94,0.25)' }} />
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
                  <div style={{ padding: '16px' }}>
                    <h3 style={{ color: '#0F3D5E', fontSize: 14, fontWeight: 700, margin: '0 0 8px' }}>
                      {lang === 'en' ? (item.nameEn || item.nameVi) : item.nameVi}
                    </h3>
                    <p style={{ color: '#5d7a8c', fontSize: 12, lineHeight: 1.5, margin: '0 0 14px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {lang === 'en' ? (item.descriptionEn || item.descriptionVi) : item.descriptionVi}
                    </p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {item.videoUrl ? (
                        <a href={item.videoUrl} target="_blank" rel="noreferrer" style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                          padding: '6px 0', borderRadius: 6,
                          border: '1px solid #0F3D5E', background: 'white',
                          color: '#0F3D5E', fontSize: 11, fontWeight: 600, cursor: 'pointer', textDecoration: 'none',
                        }}>
                          <Play size={11} /> {t('intangible.video')}
                        </a>
                      ) : (
                        <div style={{ flex: 1 }} />
                      )}
                      <button onClick={() => onNavigate('intangible-detail', item.id)} style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                        padding: '6px 0', borderRadius: 6,
                        background: '#0F3D5E', border: 'none',
                        color: 'white', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                      }}>
                        <Eye size={11} /> {t('intangible.detail')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* No results */}
        {totalResults === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#5d7a8c' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <p style={{ fontSize: 15 }}>
              {hasSearch
                ? (lang === 'vi'
                  ? `Không tìm thấy kết quả nào cho "${search.trim()}"`
                  : `No results found for "${search.trim()}"`)
                : t('common.nodata')}
            </p>
            {hasSearch && (
              <button onClick={resetFilters} style={{ padding: '9px 20px', borderRadius: 8, background: '#0F3D5E', border: 'none', color: 'white', fontSize: 13, cursor: 'pointer', marginTop: 8 }}>
                {lang === 'vi' ? 'Xóa tìm kiếm' : 'Clear search'}
              </button>
            )}
            {!hasSearch && (
              <button onClick={resetFilters} style={{ padding: '9px 20px', borderRadius: 8, background: '#0F3D5E', border: 'none', color: 'white', fontSize: 13, cursor: 'pointer', marginTop: 8 }}>
                {t('map.resetfilter')}
              </button>
            )}
          </div>
        )}
      </div>
      <style>{`
        @media (max-width: 767px) {
          .relics-filters {
            gap: 8px !important;
            padding: 12px !important;
          }
          .relics-filter-select select {
            max-width: 130px !important;
            font-size: 12px !important;
          }
          .relics-list-item {
            flex-direction: column !important;
          }
          .relics-list-item > div:first-child {
            width: 100% !important;
            height: 140px !important;
          }
          .relics-list-content {
            padding: 10px 12px !important;
          }
        }
        @media (max-width: 640px) {
          .relics-filters {
            flex-direction: column !important;
          }
          .relics-filters > div,
          .relics-filters > select {
            width: 100% !important;
            min-width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
