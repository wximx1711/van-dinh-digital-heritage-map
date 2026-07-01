import { useState, useRef } from 'react';
import { useLanguage } from './LanguageContext';
import { useHeritageSites, useTypeLabels, useClassificationLabels } from '../../presentation/hooks/useHeritageData';
import type { HeritageSite, HeritageType, Classification } from '../../core/types';
import { classificationColors } from '../constants';
import {
  X, MapPin, Share2, QrCode, Navigation, Eye, RotateCcw, Search,
  ZoomIn, ZoomOut, Filter, ChevronDown, ChevronUp
} from 'lucide-react';

interface MapPageProps {
  onNavigate: (page: string, id?: string) => void;
}

const typeEmoji: Record<HeritageType, string> = {
  dinh: '🏛️', chua: '🛕', den: '⛩️', mieu: '🏚️',
  phu: '🏯', quan: '🕌', nhacu: '🏘️', nhatho: '⛪', lang: '🪦',
};

// Coordinate to percentage mapping for map display
const MAP_BOUNDS = { minLat: 20.738, maxLat: 20.772, minLon: 105.838, maxLon: 105.873 };

function latLonToPercent(lat: number, lon: number) {
  const x = ((lon - MAP_BOUNDS.minLon) / (MAP_BOUNDS.maxLon - MAP_BOUNDS.minLon)) * 100;
  const y = ((MAP_BOUNDS.maxLat - lat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * 100;
  return { x: Math.max(3, Math.min(97, x)), y: Math.max(3, Math.min(97, y)) };
}

interface QrModalProps {
  site: HeritageSite;
  onClose: () => void;
  lang: 'vi' | 'en';
}

function QrModal({ site, onClose, lang }: QrModalProps) {
  const qrData = `DITICHR:${site.id}|${site.nameVi}|${site.googleMapUrl || `${site.lat},${site.lon}`}`;
  const cells = 21;
  const seed = site.id.charCodeAt(0) + site.id.charCodeAt(1);
  const pattern = Array.from({ length: cells * cells }, (_, i) => {
    const row = Math.floor(i / cells);
    const col = i % cells;
    if ((row < 8 && col < 8) || (row < 8 && col > 12) || (row > 12 && col < 8)) return true;
    if ((row === 0 || row === 7 || row === 13 || row === 20) && ((col < 8) || (col > 12))) return true;
    return (((row * 7 + col * 3 + seed) % 5) < 2);
  });

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }} onClick={onClose}>
      <div style={{
        background: 'white', borderRadius: 12, padding: 28, maxWidth: 320, width: '90%',
        textAlign: 'center',
      }} onClick={e => e.stopPropagation()}>
        <h3 style={{ color: '#0F3D5E', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
          {lang === 'vi' ? 'Mã QR Di tích' : 'Heritage QR Code'}
        </h3>
        <p style={{ color: '#5d7a8c', fontSize: 12, marginBottom: 16 }}>
          {lang === 'vi' ? site.nameVi : site.nameEn}
        </p>
        <div style={{
          display: 'inline-grid', gridTemplateColumns: `repeat(${cells}, 8px)`,
          gap: 1, padding: 12, background: 'white', border: '2px solid #0F3D5E', borderRadius: 8,
          marginBottom: 16,
        }}>
          {pattern.map((filled, i) => (
            <div key={i} style={{
              width: 8, height: 8,
              background: filled ? '#0F3D5E' : 'white',
            }} />
          ))}
        </div>
        <p style={{ color: '#5d7a8c', fontSize: 11, marginBottom: 16 }}>
          {qrData.substring(0, 40)}...
        </p>
        <button
          onClick={onClose}
          style={{
            padding: '8px 20px', borderRadius: 6,
            background: '#0F3D5E', border: 'none', color: 'white',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}
        >
          {lang === 'vi' ? 'Đóng' : 'Close'}
        </button>
      </div>
    </div>
  );
}

export function MapPage({ onNavigate }: MapPageProps) {
  const { lang, t } = useLanguage();
  const { data: heritageSites } = useHeritageSites();
  const typeLabels = useTypeLabels();
  const classificationLabels = useClassificationLabels();
  const [selectedSite, setSelectedSite] = useState<HeritageSite | null>(null);
  const [filterClassification, setFilterClassification] = useState<Record<Classification, boolean>>({
    national: true, city: true, unranked: true,
  });
  const [filterTypes, setFilterTypes] = useState<Record<HeritageType, boolean>>({
    dinh: true, chua: true, den: true, mieu: true,
    phu: true, quan: true, nhacu: true, nhatho: true, lang: true,
  });
  const [zoom, setZoom] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [showQr, setShowQr] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  const filteredSites = heritageSites.filter(site => {
    if (!filterClassification[site.classification]) return false;
    if (!filterTypes[site.type]) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return site.nameVi.toLowerCase().includes(q) || site.nameEn.toLowerCase().includes(q);
    }
    return true;
  });

  const classificationTypes: Classification[] = ['national', 'city', 'unranked'];
  const heritageTypes: HeritageType[] = ['dinh', 'chua', 'den', 'mieu', 'phu', 'quan', 'nhacu', 'nhatho', 'lang'];

  const resetFilters = () => {
    setFilterClassification({ national: true, city: true, unranked: true });
    setFilterTypes({ dinh: true, chua: true, den: true, mieu: true, phu: true, quan: true, nhacu: true, nhatho: true, lang: true });
    setSearchQuery('');
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 120px)', background: '#F0F4F8' }}>
      {/* Sidebar */}
      <div style={{
        width: showFilters ? 300 : 48, minWidth: showFilters ? 300 : 48,
        background: 'white', borderRight: '1px solid rgba(15,61,94,0.1)',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.3s, min-width 0.3s', overflow: 'hidden',
      }}>
        {/* Sidebar header */}
        <div style={{
          padding: '14px 12px', background: '#0F3D5E',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {showFilters && (
            <span style={{ color: 'white', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Filter size={14} /> {t('common.filter')}
            </span>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', padding: 4 }}
          >
            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {showFilters && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            {/* Search */}
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#5d7a8c' }} />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('hm.search')}
                style={{
                  width: '100%', padding: '8px 8px 8px 32px', borderRadius: 6,
                  border: '1px solid rgba(15,61,94,0.15)', fontSize: 12,
                  background: '#F0F4F8', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Classification filter */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#0F3D5E', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                {t('map.filter.classification')}
              </div>
              {classificationTypes.map(cls => (
                <label key={cls} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={filterClassification[cls]}
                    onChange={e => setFilterClassification(prev => ({ ...prev, [cls]: e.target.checked }))}
                    style={{ accentColor: classificationColors[cls] }}
                  />
                  <span style={{ fontSize: 12, color: '#1a2332', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: classificationColors[cls], display: 'inline-block' }} />
                    {t(`map.${cls}`)}
                  </span>
                </label>
              ))}
            </div>

            {/* Type filter */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#0F3D5E', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                {t('map.filter.type')}
              </div>
              {heritageTypes.map(type => (
                <label key={type} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={filterTypes[type]}
                    onChange={e => setFilterTypes(prev => ({ ...prev, [type]: e.target.checked }))}
                    style={{ accentColor: '#0F3D5E' }}
                  />
                  <span style={{ fontSize: 12, color: '#1a2332' }}>
                    {typeEmoji[type]} {t(`map.type.${type}`)}
                  </span>
                </label>
              ))}
            </div>

            {/* Reset */}
            <button
              onClick={resetFilters}
              style={{
                width: '100%', padding: '8px', borderRadius: 6,
                border: '1px solid #0F3D5E', background: 'white',
                color: '#0F3D5E', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              <RotateCcw size={12} /> {t('map.resetfilter')}
            </button>

            {/* Count */}
            <div style={{ marginTop: 16, padding: '10px', borderRadius: 6, background: '#EBF5FB', textAlign: 'center' }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: '#0F3D5E' }}>{filteredSites.length}</span>
              <span style={{ fontSize: 11, color: '#5d7a8c', display: 'block' }}>
                {lang === 'vi' ? 'di tích hiển thị' : 'sites shown'}
              </span>
            </div>

            {/* Legend */}
            <div style={{ marginTop: 16, padding: '12px', background: '#F0F4F8', borderRadius: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 8 }}>
                {lang === 'vi' ? 'Chú giải' : 'Legend'}
              </div>
              {classificationTypes.map(cls => (
                <div key={cls} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <div style={{
                    width: 12, height: 12, borderRadius: '50% 50% 50% 0',
                    transform: 'rotate(-45deg)', background: classificationColors[cls],
                    flexShrink: 0,
                  }} />
                  <span style={{ fontSize: 11, color: '#5d7a8c' }}>{classificationLabels[cls][lang]}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Map area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Map controls */}
        <div style={{
          position: 'absolute', top: 16, right: 16, zIndex: 50,
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          {[
            { icon: <ZoomIn size={16} />, onClick: () => setZoom(z => Math.min(2.5, z + 0.25)), label: '+' },
            { icon: <ZoomOut size={16} />, onClick: () => setZoom(z => Math.max(0.5, z - 0.25)), label: '-' },
          ].map((btn, i) => (
            <button
              key={i}
              onClick={btn.onClick}
              style={{
                width: 36, height: 36, borderRadius: 6,
                background: 'white', border: '1px solid rgba(15,61,94,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', color: '#0F3D5E',
              }}
            >
              {btn.icon}
            </button>
          ))}
          <button
            onClick={() => setZoom(1)}
            style={{
              width: 36, height: 36, borderRadius: 6, marginTop: 4,
              background: 'white', border: '1px solid rgba(15,61,94,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', color: '#0F3D5E',
            }}
          >
            <RotateCcw size={14} />
          </button>
        </div>

        {/* Scale indicator */}
        <div style={{
          position: 'absolute', bottom: 24, right: 16, zIndex: 50,
          background: 'rgba(255,255,255,0.95)', borderRadius: 6, padding: '6px 12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 40, height: 3, background: '#0F3D5E', borderLeft: '2px solid #0F3D5E', borderRight: '2px solid #0F3D5E' }} />
            <span style={{ fontSize: 10, color: '#5d7a8c' }}>{Math.round(500 / zoom)}m</span>
          </div>
          <div style={{ fontSize: 9, color: '#5d7a8c', textAlign: 'center', marginTop: 2 }}>
            © OpenStreetMap
          </div>
        </div>

        {/* Coordinates display */}
        <div style={{
          position: 'absolute', bottom: 24, left: 16, zIndex: 50,
          background: 'rgba(255,255,255,0.95)', borderRadius: 6, padding: '6px 12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)', fontSize: 11, color: '#5d7a8c',
        }}>
          <div>20°45'N - 20°46'N</div>
          <div>105°50'E - 105°52'E</div>
        </div>

        {/* Map container */}
        <div ref={mapRef} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: '#b8d8b8' }}>
          {/* Map background */}
          <div style={{
            position: 'absolute', inset: 0,
            transform: `scale(${zoom})`, transformOrigin: 'center',
            transition: 'transform 0.3s ease',
          }}>
            {/* Terrain background */}
            <img
              src="https://images.unsplash.com/photo-1758298135151-e1283f571030?w=1600&h=1000&fit=crop&auto=format"
              alt="Map terrain"
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55 }}
            />
            {/* Map grid overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'linear-gradient(rgba(15,61,94,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(15,61,94,0.08) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }} />
            {/* Color tint */}
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(180,210,190,0.4)' }} />

            {/* Road lines simulation */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M 0,55 Q 25,52 50,50 Q 75,48 100,45" stroke="rgba(255,220,100,0.6)" strokeWidth="0.8" fill="none" />
              <path d="M 30,0 Q 32,25 35,50 Q 38,75 40,100" stroke="rgba(200,200,200,0.5)" strokeWidth="0.5" fill="none" />
              <path d="M 0,35 Q 30,40 60,38 Q 80,36 100,30" stroke="rgba(200,200,200,0.5)" strokeWidth="0.4" fill="none" />
              <path d="M 55,0 Q 58,30 60,55 Q 62,75 65,100" stroke="rgba(200,200,200,0.5)" strokeWidth="0.4" fill="none" />
              <path d="M 0,70 Q 25,68 50,65 Q 75,62 100,60" stroke="rgba(200,200,200,0.4)" strokeWidth="0.3" fill="none" />
              {/* Water */}
              <path d="M 0,80 Q 15,82 25,79 Q 35,76 45,78 Q 55,80 65,77 Q 75,74 100,76" stroke="rgba(100,160,200,0.6)" strokeWidth="2" fill="none" />
            </svg>

            {/* Heritage markers */}
            {filteredSites.map((site) => {
              const { x, y } = latLonToPercent(site.lat, site.lon);
              const color = classificationColors[site.classification];
              const isSelected = selectedSite?.id === site.id;
              return (
                <div
                  key={site.id}
                  onClick={() => setSelectedSite(isSelected ? null : site)}
                  style={{
                    position: 'absolute',
                    left: `${x}%`, top: `${y}%`,
                    transform: 'translate(-50%, -100%)',
                    cursor: 'pointer', zIndex: isSelected ? 20 : 10,
                    transition: 'transform 0.2s',
                  }}
                >
                  {/* Marker */}
                  <div style={{
                    position: 'relative',
                    filter: isSelected ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                    transform: isSelected ? 'scale(1.3)' : 'scale(1)',
                    transition: 'transform 0.2s',
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50% 50% 50% 0',
                      transform: 'rotate(-45deg)',
                      background: color,
                      border: isSelected ? '3px solid white' : '2px solid white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ transform: 'rotate(45deg)', fontSize: 12 }}>{typeEmoji[site.type]}</span>
                    </div>
                  </div>
                  {/* Label */}
                  {isSelected && (
                    <div style={{
                      position: 'absolute', bottom: '110%', left: '50%', transform: 'translateX(-50%)',
                      background: 'white', borderRadius: 4, padding: '2px 6px',
                      fontSize: 10, fontWeight: 600, color: '#0F3D5E', whiteSpace: 'nowrap',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)', marginBottom: 2,
                    }}>
                      {lang === 'vi' ? site.nameVi : site.nameEn}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Selected site info card */}
          {selectedSite && (
            <div style={{
              position: 'absolute', top: 16, left: 16, zIndex: 100,
              background: 'white', borderRadius: 12, width: 280,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              overflow: 'hidden',
              border: `2px solid ${classificationColors[selectedSite.classification]}`,
            }}>
              {/* Site image */}
              <div style={{ position: 'relative', height: 140 }}>
                <img
                  src={selectedSite.image}
                  alt={lang === 'vi' ? selectedSite.nameVi : selectedSite.nameEn}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,61,94,0.6), transparent)' }} />
                <button
                  onClick={() => setSelectedSite(null)}
                  style={{
                    position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: '50%',
                    background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <X size={12} />
                </button>
                <div style={{
                  position: 'absolute', bottom: 8, left: 8,
                  padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700,
                  background: classificationColors[selectedSite.classification], color: 'white',
                }}>
                  {classificationLabels[selectedSite.classification][lang]}
                </div>
              </div>

              {/* Site info */}
              <div style={{ padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: '#5d7a8c' }}>
                    {typeEmoji[selectedSite.type]} {typeLabels[selectedSite.type][lang]}
                  </span>
                  <span style={{ color: '#cbced4' }}>·</span>
                  <span style={{ fontSize: 11, color: '#5d7a8c' }}>{selectedSite.code}</span>
                </div>
                <h3 style={{ color: '#0F3D5E', fontSize: 14, fontWeight: 700, margin: '0 0 8px', lineHeight: 1.3 }}>
                  {lang === 'vi' ? selectedSite.nameVi : selectedSite.nameEn}
                </h3>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4, marginBottom: 4 }}>
                  <MapPin size={11} style={{ color: '#5d7a8c', marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: '#5d7a8c', lineHeight: 1.4 }}>
                    {lang === 'vi' ? selectedSite.addressVi : selectedSite.addressEn}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: '#5d7a8c', marginBottom: 8 }}>
                  📍 {selectedSite.googleMapUrl ? selectedSite.googleMapUrl : `${selectedSite.lat.toFixed(4)}°N, ${selectedSite.lon.toFixed(4)}°E`}
                </div>
                <p style={{
                  fontSize: 11, color: '#5d7a8c', lineHeight: 1.5, margin: '0 0 12px',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {lang === 'vi' ? selectedSite.descriptionVi : selectedSite.descriptionEn}
                </p>

                {/* Action buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  <button
                    onClick={() => onNavigate('heritage-detail', selectedSite.id)}
                    style={{
                      gridColumn: '1 / -1', padding: '8px', borderRadius: 6,
                      background: '#0F3D5E', border: 'none', color: 'white',
                      fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                    }}
                  >
                    <Eye size={12} /> {t('map.viewdetail')}
                  </button>
                  <button
                    onClick={() => setShowQr(true)}
                    style={{
                      padding: '7px', borderRadius: 6, border: '1px solid rgba(15,61,94,0.2)',
                      background: 'white', color: '#0F3D5E', fontSize: 11, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                    }}
                  >
                    <QrCode size={12} /> {t('map.qr')}
                  </button>
                  <button
                    style={{
                      padding: '7px', borderRadius: 6, border: '1px solid rgba(15,61,94,0.2)',
                      background: 'white', color: '#0F3D5E', fontSize: 11, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                    }}
                  >
                    <Share2 size={12} /> {t('map.share')}
                  </button>
                  <a
                    href={selectedSite.googleMapUrl || `https://www.google.com/maps?q=${selectedSite.lat},${selectedSite.lon}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      gridColumn: '1 / -1', padding: '7px', borderRadius: 6,
                      border: '1px solid #D4A017', background: 'rgba(212,160,23,0.05)',
                      color: '#B8860B', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                      textDecoration: 'none',
                    }}
                  >
                    <Navigation size={12} /> {t('map.directions')}
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* No results */}
          {filteredSites.length === 0 && (
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              background: 'white', borderRadius: 12, padding: '24px 32px', textAlign: 'center',
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🗺️</div>
              <p style={{ color: '#5d7a8c', fontSize: 13 }}>
                {lang === 'vi' ? 'Không tìm thấy di tích nào' : 'No heritage sites found'}
              </p>
              <button onClick={resetFilters} style={{
                marginTop: 8, padding: '6px 14px', borderRadius: 6,
                background: '#0F3D5E', border: 'none', color: 'white', fontSize: 12, cursor: 'pointer',
              }}>
                {t('map.resetfilter')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* QR Modal */}
      {showQr && selectedSite && (
        <QrModal site={selectedSite} onClose={() => setShowQr(false)} lang={lang} />
      )}
    </div>
  );
}
