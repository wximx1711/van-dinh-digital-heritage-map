import { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { heritageSites } from '../../data/mockData';
import { classificationLabels, typeLabels } from '../../data/labels';
import type { Classification, HeritageType } from '../../core/types';
import { classificationColors, classificationBackgrounds, statusColors } from '../constants';
import { Search, Filter, MapPin, Calendar, Eye, RotateCcw, Grid2x2, List } from 'lucide-react';

interface RelicsPageProps {
   onNavigate: (page: string, id?: string) => void;
}

export function RelicsPage({ onNavigate }: RelicsPageProps) {
  const { lang, t } = useLanguage();
  const [search, setSearch] = useState('');
  const [filterCls, setFilterCls] = useState<Classification | 'all'>('all');
  const [filterType, setFilterType] = useState<HeritageType | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  const filtered = heritageSites.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !search || s.nameVi.toLowerCase().includes(q) || s.nameEn.toLowerCase().includes(q);
    const matchCls = filterCls === 'all' || s.classification === filterCls;
    const matchType = filterType === 'all' || s.type === filterType;
    return matchSearch && matchCls && matchType;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const resetFilters = () => { setSearch(''); setFilterCls('all'); setFilterType('all'); setPage(1); };

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

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', transform: 'translateY(-24px)' }}>
        {/* Filter bar */}
        <div style={{ background: 'white', borderRadius: 10, padding: '16px', marginBottom: 20, boxShadow: '0 4px 16px rgba(15,61,94,0.1)', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#5d7a8c' }} />
            <input
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder={t('hero.search.placeholder')}
              style={{ width: '100%', padding: '9px 9px 9px 32px', borderRadius: 7, border: '1.5px solid rgba(15,61,94,0.12)', fontSize: 13, background: '#F0F4F8', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* Classification filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Filter size={13} style={{ color: '#5d7a8c' }} />
            <select value={filterCls} onChange={e => { setFilterCls(e.target.value as Classification | 'all'); setPage(1); }}
              style={{ padding: '9px 10px', borderRadius: 7, border: '1.5px solid rgba(15,61,94,0.12)', fontSize: 13, background: 'white', cursor: 'pointer', outline: 'none' }}>
              <option value="all">{t('common.all')} ({lang === 'vi' ? 'Xếp hạng' : 'Classification'})</option>
              <option value="national">{t('map.national')}</option>
              <option value="city">{t('map.city')}</option>
              <option value="unranked">{t('map.unranked')}</option>
            </select>
          </div>

          {/* Type filter */}
          <select value={filterType} onChange={e => { setFilterType(e.target.value as HeritageType | 'all'); setPage(1); }}
            style={{ padding: '9px 10px', borderRadius: 7, border: '1.5px solid rgba(15,61,94,0.12)', fontSize: 13, background: 'white', cursor: 'pointer', outline: 'none' }}>
            <option value="all">{t('common.all')} ({lang === 'vi' ? 'Loại hình' : 'Type'})</option>
            {Object.entries(typeLabels).map(([k, v]) => (
              <option key={k} value={k}>{v[lang]}</option>
            ))}
          </select>

          {/* Reset */}
          {(search || filterCls !== 'all' || filterType !== 'all') && (
            <button onClick={resetFilters} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '9px 14px', borderRadius: 7, border: '1px solid rgba(212,160,23,0.3)', background: 'rgba(212,160,23,0.05)', color: '#B8860B', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              <RotateCcw size={12} /> {t('map.resetfilter')}
            </button>
          )}

          {/* View toggle */}
          <div style={{ display: 'flex', gap: 2, background: '#F0F4F8', borderRadius: 7, padding: 3 }}>
            {[{ mode: 'grid', icon: <Grid2x2 size={14} /> }, { mode: 'list', icon: <List size={14} /> }].map(v => (
              <button key={v.mode} onClick={() => setViewMode(v.mode as 'grid' | 'list')}
                style={{ padding: '6px 10px', borderRadius: 5, border: 'none', cursor: 'pointer', background: viewMode === v.mode ? 'white' : 'transparent', color: viewMode === v.mode ? '#0F3D5E' : '#5d7a8c', boxShadow: viewMode === v.mode ? '0 1px 4px rgba(15,61,94,0.1)' : 'none', display: 'flex', alignItems: 'center' }}>
                {v.icon}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: '#5d7a8c' }}>
            {lang === 'vi' ? `Hiển thị ${filtered.length} kết quả` : `Showing ${filtered.length} results`}
          </span>
        </div>

        {/* Grid view */}
        {viewMode === 'grid' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20, marginBottom: 24 }}>
            {paginated.map(site => (
              <div key={site.id} onClick={() => onNavigate('heritage-detail', site.id)}
                style={{ background: 'white', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', boxShadow: '0 2px 10px rgba(15,61,94,0.07)', transition: 'transform 0.25s, box-shadow 0.25s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-5px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 32px rgba(15,61,94,0.15)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 10px rgba(15,61,94,0.07)'; }}
              >
                <div style={{ position: 'relative', height: 180, background: '#dce8f0' }}>
                  <img src={site.image} alt={lang === 'vi' ? site.nameVi : site.nameEn} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
        )}

        {/* List view */}
        {viewMode === 'list' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            {paginated.map(site => (
              <div key={site.id} onClick={() => onNavigate('heritage-detail', site.id)}
                style={{ background: 'white', borderRadius: 10, overflow: 'hidden', cursor: 'pointer', boxShadow: '0 2px 8px rgba(15,61,94,0.06)', display: 'flex', transition: 'box-shadow 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 20px rgba(15,61,94,0.12)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(15,61,94,0.06)'; }}
              >
                <div style={{ width: 120, height: 90, background: '#dce8f0', flexShrink: 0 }}>
                  <img src={site.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: classificationBackgrounds[site.classification], color: classificationColors[site.classification] }}>
                        {classificationLabels[site.classification][lang]}
                      </span>
                      <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: '#EBF5FB', color: '#0F3D5E' }}>
                        {typeLabels[site.type][lang]}
                      </span>
                    </div>
                    <h3 style={{ color: '#0F3D5E', fontSize: 14, fontWeight: 700, margin: '0 0 4px' }}>{lang === 'vi' ? site.nameVi : site.nameEn}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 11, color: '#5d7a8c', display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={10} />{lang === 'vi' ? site.addressVi.split(',').slice(-2).join(',') : site.addressEn.split(',').slice(-2).join(',')}</span>
                    </div>
                  </div>
                  <button style={{ padding: '7px 16px', borderRadius: 7, background: '#0F3D5E', border: 'none', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Eye size={12} /> {t('featured.viewprofile')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No results */}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#5d7a8c' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏛️</div>
            <p style={{ fontSize: 15 }}>{t('common.nodata')}</p>
            <button onClick={resetFilters} style={{ padding: '9px 20px', borderRadius: 8, background: '#0F3D5E', border: 'none', color: 'white', fontSize: 13, cursor: 'pointer', marginTop: 8 }}>
              {t('map.resetfilter')}
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, paddingBottom: 32 }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => { setPage(p); window.scrollTo(0, 0); }}
                style={{ width: 36, height: 36, borderRadius: 8, border: '1.5px solid', borderColor: page === p ? '#0F3D5E' : 'rgba(15,61,94,0.15)', background: page === p ? '#0F3D5E' : 'white', color: page === p ? 'white' : '#5d7a8c', cursor: 'pointer', fontSize: 13, fontWeight: page === p ? 700 : 400 }}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
