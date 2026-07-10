import { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { useHeritageSites, useIntangibleHeritage, useClassificationLabels, useTypeLabels } from '../../presentation/hooks/useHeritageData';
import { classificationColors, classificationBackgrounds, intangibleCategoryIcons } from '../constants';
import { getImageUrl } from '../utils/url';
import {
  Search, Building2, Star, Award, LayoutGrid, BookOpen,
  Play, ArrowRight, ChevronRight, Eye, MapPin, Calendar
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string, id?: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { lang, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: heritageSites, loading: sitesLoading } = useHeritageSites();
  const { data: intangibleHeritage } = useIntangibleHeritage();
  const classificationLabels = useClassificationLabels();
  const typeLabels = useTypeLabels();

  const nationalCount = heritageSites.filter(h => h.classification === 'national').length;
  const cityCount = heritageSites.filter(h => h.classification === 'city').length;
  const unrankedCount = heritageSites.filter(h => h.classification === 'unranked').length;

  const stats = [
    { label: t('stats.total'), value: heritageSites.length, icon: <Building2 size={22} />, color: '#0F3D5E' },
    { label: t('stats.national'), value: nationalCount, icon: <Star size={22} />, color: '#E74C3C' },
    { label: t('stats.city'), value: cityCount, icon: <Award size={22} />, color: '#1A5276' },
    { label: t('stats.unranked'), value: unrankedCount, icon: <LayoutGrid size={22} />, color: '#7F8C8D' },
    { label: t('stats.intangible'), value: intangibleHeritage.length, icon: <BookOpen size={22} />, color: '#D4A017' },
  ];

const handleSearch = () => {
     if (searchQuery.trim()) onNavigate('relics');
   };

  return (
    <div style={{ background: 'white' }}>
      {/* Hero Section */}
      <section style={{ position: 'relative', minHeight: 520, overflow: 'hidden' }}>
        {/* Background */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(https://images.unsplash.com/photo-1723065195938-30a5e64036e8?w=1600&h=900&fit=crop&auto=format)`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'brightness(0.4)',
        }} />
        {/* Overlay gradient */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(15,61,94,0.85) 0%, rgba(10,29,46,0.6) 100%)',
        }} />
        {/* Decorative gold border bottom */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, transparent, #D4A017 20%, #D4A017 80%, transparent)' }} />

        <div style={{ position: 'relative', maxWidth: 1280, margin: '0 auto', padding: '80px 24px 100px', textAlign: 'center' }}>
          {/* Decorative top label */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 20,
            padding: '6px 16px', borderRadius: 20,
            background: 'rgba(212,160,23,0.2)', border: '1px solid rgba(212,160,23,0.4)',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#D4A017', display: 'inline-block' }} />
            <span style={{ color: '#D4A017', fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
              {lang === 'vi' ? 'Hệ thống quản lý di sản văn hóa' : 'Cultural Heritage Management System'}
            </span>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#D4A017', display: 'inline-block' }} />
          </div>

          <h1 style={{
            color: 'white', fontSize: 'clamp(28px, 4vw, 48px)',
            fontFamily: 'Merriweather, serif', fontWeight: 900, marginBottom: 16, lineHeight: 1.2,
          }}>
            {t('site.title')}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 16, maxWidth: 600, margin: '0 auto 36px', lineHeight: 1.7 }}>
            {t('site.subtitle')}
          </p>

          {/* Search bar */}
          <div style={{ display: 'flex', maxWidth: 560, margin: '0 auto', gap: 0 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#5d7a8c' }} />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder={t('hero.search.placeholder')}
                style={{
                  width: '100%', padding: '14px 14px 14px 44px',
                  borderRadius: '8px 0 0 8px', border: 'none', outline: 'none',
                  fontSize: 14, background: 'white',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <button
              onClick={handleSearch}
              style={{
                padding: '0 24px', borderRadius: '0 8px 8px 0',
                background: '#D4A017', border: 'none', color: 'white',
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {t('hero.search.btn')}
            </button>
          </div>

          {/* Quick nav buttons */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
            {[
              { label: t('nav.map'), page: 'map', icon: '🗺️' },
              { label: t('nav.relics'), page: 'relics', icon: '🏛️' },
              { label: t('nav.intangible'), page: 'intangible', icon: '🎭' },
            ].map(btn => (
              <button
                key={btn.page}
                onClick={() => onNavigate(btn.page)}
                style={{
                  padding: '8px 18px', borderRadius: 6,
                  background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)',
                  color: 'white', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(212,160,23,0.25)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(212,160,23,0.5)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.25)';
                }}
              >
                <span>{btn.icon}</span> {btn.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section style={{ background: 'white', padding: '0 24px' }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 16, transform: 'translateY(-48px)',
        }}>
          {stats.map((stat) => (
            <div
              key={stat.label}
              style={{
                background: 'white', borderRadius: 12, padding: '20px 16px',
                boxShadow: '0 4px 20px rgba(15,61,94,0.12)',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                textAlign: 'center', border: `2px solid ${stat.color}15`,
                transition: 'transform 0.25s, box-shadow 0.25s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 32px rgba(15,61,94,0.18)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(15,61,94,0.12)';
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: `${stat.color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 10, color: stat.color,
              }}>
                {stat.icon}
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, color: stat.color, lineHeight: 1, marginBottom: 4, fontFamily: 'Be Vietnam Pro, sans-serif' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 12, color: '#5d7a8c', fontWeight: 500, lineHeight: 1.3 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Map Preview Section */}
      <section style={{ background: '#F0F4F8', padding: '40px 24px 60px', marginTop: -32 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
            <div>
              <div style={{ color: '#D4A017', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                {lang === 'vi' ? 'Khám phá' : 'Explore'}
              </div>
              <h2 style={{ color: '#0F3D5E', fontSize: 24, fontFamily: 'Merriweather, serif', fontWeight: 700, margin: 0 }}>
                {t('map.title')}
              </h2>
            </div>
            <button
              onClick={() => onNavigate('map')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 20px', borderRadius: 8,
                background: '#0F3D5E', border: 'none', color: 'white',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}
            >
              {lang === 'vi' ? 'Mở bản đồ' : 'Open Map'} <ArrowRight size={14} />
            </button>
          </div>

          {/* Map preview */}
          <div
            onClick={() => onNavigate('map')}
            style={{
              borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(15,61,94,0.15)',
              position: 'relative', height: 320,
              background: '#c8d8c0',
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1758298135151-e1283f571030?w=1200&h=400&fit=crop&auto=format"
              alt={lang === 'vi' ? 'Bản đồ khu vực Vân Đình' : 'Van Dinh area map'}
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
            />
            {/* Map overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, rgba(15,61,94,0.5), rgba(15,61,94,0.2))',
            }} />
            {/* Fake markers */}
            {heritageSites.slice(0, 6).map((site, i) => {
              const x = 15 + (i * 14) % 70;
              const y = 20 + (i * 17) % 60;
              const col = site.classification === 'national' ? '#E74C3C' : site.classification === 'city' ? '#1A5276' : '#7F8C8D';
              return (
                <div key={site.id} style={{
                  position: 'absolute', left: `${x}%`, top: `${y}%`,
                  transform: 'translate(-50%, -100%)',
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50% 50% 50% 0',
                    transform: 'rotate(-45deg)',
                    background: col, boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                    border: '2px solid white',
                  }} />
                </div>
              );
            })}
            {/* Click to open overlay */}
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                padding: '12px 24px', borderRadius: 8,
                background: 'rgba(255,255,255,0.95)',
                display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
              }}>
                <MapPin size={18} style={{ color: '#0F3D5E' }} />
                <span style={{ color: '#0F3D5E', fontSize: 14, fontWeight: 600 }}>
                  {lang === 'vi' ? 'Nhấn để mở bản đồ tương tác' : 'Click to open interactive map'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Heritage */}
      <section style={{ padding: '60px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ color: '#D4A017', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              {lang === 'vi' ? 'Di sản tiêu biểu' : 'Outstanding Heritage'}
            </div>
            <h2 style={{ color: '#0F3D5E', fontSize: 28, fontFamily: 'Merriweather, serif', fontWeight: 700, margin: '0 0 12px' }}>
              {t('featured.title')}
            </h2>
            <p style={{ color: '#5d7a8c', fontSize: 15, maxWidth: 560, margin: '0 auto' }}>
              {t('featured.subtitle')}
            </p>
            <div style={{ background: 'linear-gradient(90deg, transparent, #D4A017, transparent)', height: 2, maxWidth: 100, margin: '16px auto 0' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
            {heritageSites.slice(0, 6).map((site) => (
              <div
                key={site.id}
                onClick={() => onNavigate('heritage-detail', site.id)}
                style={{
                  background: 'white', borderRadius: 12, overflow: 'hidden',
                  boxShadow: '0 2px 12px rgba(15,61,94,0.08)',
                  border: '1px solid rgba(15,61,94,0.08)',
                  cursor: 'pointer', transition: 'transform 0.25s, box-shadow 0.25s',
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
                {/* Image */}
                <div style={{ position: 'relative', height: 180, overflow: 'hidden', background: '#dce8f0' }}>
                  <img
                    src={getImageUrl(site.image)}
                    alt={lang === 'vi' ? site.nameVi : site.nameEn}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.05)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'; }}
                  />
<div style={{
                     position: 'absolute', top: 10, left: 10,
                     padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                     background: classificationBackgrounds[site.classification],
                     color: classificationColors[site.classification],
                   }}>
                    {classificationLabels[site.classification][lang]}
                  </div>
                </div>
                {/* Content */}
                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                      background: '#EBF5FB', color: '#0F3D5E',
                    }}>
                      {typeLabels[site.type][lang]}
                    </span>
                    <span style={{ color: '#5d7a8c', fontSize: 11 }}>
                      <Calendar size={11} style={{ display: 'inline', marginRight: 3 }} />
                      {site.yearBuilt}
                    </span>
                  </div>
                  <h3 style={{ color: '#0F3D5E', fontSize: 15, fontWeight: 700, margin: '0 0 6px', lineHeight: 1.3 }}>
                    {lang === 'vi' ? site.nameVi : site.nameEn}
                  </h3>
                  <p style={{ color: '#5d7a8c', fontSize: 12, lineHeight: 1.5, margin: '0 0 14px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {lang === 'vi' ? site.descriptionVi : site.descriptionEn}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#5d7a8c', fontSize: 11 }}>
                      <MapPin size={11} />
                      <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {lang === 'vi' ? 'Vân Đình, Ứng Hòa' : 'Van Dinh, Ung Hoa'}
                      </span>
                    </div>
                    <button style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '5px 12px', borderRadius: 6,
                      background: '#0F3D5E', border: 'none', color: 'white',
                      fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    }}>
                      <Eye size={11} /> {t('featured.viewprofile')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <button
              onClick={() => onNavigate('relics')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 28px', borderRadius: 8,
                border: '2px solid #0F3D5E', background: 'white',
                color: '#0F3D5E', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = '#0F3D5E';
                (e.currentTarget as HTMLButtonElement).style.color = 'white';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'white';
                (e.currentTarget as HTMLButtonElement).style.color = '#0F3D5E';
              }}
            >
              {t('featured.viewall')} <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Intangible Heritage */}
      <section style={{ background: '#F0F4F8', padding: '60px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ color: '#D4A017', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              {lang === 'vi' ? 'Phi vật thể' : 'Intangible'}
            </div>
            <h2 style={{ color: '#0F3D5E', fontSize: 28, fontFamily: 'Merriweather, serif', fontWeight: 700, margin: '0 0 12px' }}>
              {t('intangible.title')}
            </h2>
            <p style={{ color: '#5d7a8c', fontSize: 15, maxWidth: 560, margin: '0 auto' }}>
              {t('intangible.subtitle')}
            </p>
            <div style={{ background: 'linear-gradient(90deg, transparent, #D4A017, transparent)', height: 2, maxWidth: 100, margin: '16px auto 0' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 24 }}>
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
                <div style={{ position: 'relative', height: 160, background: '#dce8f0', overflow: 'hidden' }}>
                  <img
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
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '60px 24px',
        background: 'linear-gradient(135deg, #0F3D5E 0%, #1A5276 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.05,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 Q38 18 30 30 Q22 18 30 5Z' fill='%23D4A017' /%3E%3C/svg%3E")`,
        }} />
        <div style={{ position: 'relative', maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ color: 'white', fontSize: 28, fontFamily: 'Merriweather, serif', fontWeight: 700, marginBottom: 16 }}>
            {lang === 'vi' ? 'Khám phá di sản văn hóa Vân Đình' : 'Explore Van Dinh Cultural Heritage'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
            {lang === 'vi'
              ? 'Hãy cùng chúng tôi bảo tồn và phát huy các giá trị di sản văn hóa vật thể và phi vật thể của xã Vân Đình cho các thế hệ tương lai.'
              : 'Join us in preserving and promoting the tangible and intangible cultural heritage values of Van Dinh Commune for future generations.'}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavigate('map')}
              style={{
                padding: '12px 28px', borderRadius: 8,
                background: '#D4A017', border: 'none', color: 'white',
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(212,160,23,0.4)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              {lang === 'vi' ? 'Xem bản đồ' : 'View Map'} <ArrowRight size={14} />
            </button>
            <button
              onClick={() => onNavigate('about')}
              style={{
                padding: '12px 28px', borderRadius: 8,
                border: '2px solid rgba(255,255,255,0.4)', background: 'transparent',
                color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}
            >
              {lang === 'vi' ? 'Tìm hiểu thêm' : 'Learn More'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
