import { useState, useCallback, useMemo } from 'react';
import { Search, X, Crosshair, Navigation } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { useHeritageSites, useTypeLabels } from '../../presentation/hooks/useHeritageData';
import { useHeritageMapMarkers } from '../../presentation/hooks/useHeritageMapMarkers';
import { haversineDistance, openGoogleMapsDirections } from '../utils/geo';
import { getImageUrl } from '../utils/url';
import { GoogleMapView } from './GoogleMapView';
import { Skeleton } from './Skeleton';
import { CategoryLegend } from './CategoryLegend';
import { LazyImage } from './LazyImage';
import { HERITAGE_TYPES } from '../constants';
import type { MapMarker, HeritageType } from '../../core/types';

interface HeritageMapSectionProps {
  apiKey: string;
  onNavigate: (page: string, id?: string) => void;
  className?: string;
}

const PLACEHOLDER_IMG = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="120" viewBox="0 0 200 120">' +
  '<rect fill="#F0F4F8" width="200" height="120"/>' +
  '<text x="100" y="68" text-anchor="middle" font-size="36" dominant-baseline="central">🏛️</text>' +
  '</svg>',
);

export function HeritageMapSection({ apiKey, onNavigate, className }: HeritageMapSectionProps) {
  const { lang, t } = useLanguage();
  const { data: sites } = useHeritageSites();
  const { markers, loading, error } = useHeritageMapMarkers();
  const typeLabels = useTypeLabels();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<HeritageType | 'all'>('all');
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid'>('roadmap');

  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);



  const siteMap = useMemo(() => {
    const map = new Map<string, (typeof sites)[number]>();
    for (const site of sites) {
      map.set(site.id, site);
    }
    return map;
  }, [sites]);

  const filteredSites = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return sites.filter((site) => {
      if (selectedCategory !== 'all' && site.type !== selectedCategory) return false;
      if (q) {
        const nameVi = site.nameVi.toLowerCase();
        const nameEn = site.nameEn.toLowerCase();
        if (!nameVi.includes(q) && !nameEn.includes(q)) return false;
      }
      return true;
    });
  }, [sites, searchQuery, selectedCategory]);

  const filteredSiteIds = useMemo(
    () => new Set(filteredSites.map((s) => s.id)),
    [filteredSites],
  );

  const filteredMarkers = useMemo(
    () => markers.filter((m) => filteredSiteIds.has(m.id)),
    [markers, filteredSiteIds],
  );

  const effectiveSelectedId = useMemo(() => {
    if (selectedMarkerId !== null && !filteredSiteIds.has(selectedMarkerId)) {
      return null;
    }
    return selectedMarkerId;
  }, [selectedMarkerId, filteredSiteIds]);

  const visibleCount = filteredMarkers.length;

  const handleMarkerClick = useCallback((id: string) => {
    setSelectedMarkerId(id);
  }, []);

  const handleInfoWindowClose = useCallback(() => {
    setSelectedMarkerId(null);
  }, []);

  const handleViewDetails = useCallback(
    (id: string) => {
      onNavigate('heritage-detail', id);
    },
    [onNavigate],
  );

  const locateUser = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError(
        lang === 'vi' ? 'Trình duyệt không hỗ trợ định vị' : 'Geolocation not supported',
      );
      return;
    }
    setIsLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLocating(false);
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setLocationError(
              lang === 'vi' ? 'Vui lòng cấp quyền truy cập vị trí' : 'Location permission denied',
            );
            break;
          case err.POSITION_UNAVAILABLE:
            setLocationError(
              lang === 'vi' ? 'Không thể xác định vị trí' : 'Location unavailable',
            );
            break;
          case err.TIMEOUT:
            setLocationError(
              lang === 'vi' ? 'Yêu cầu định vị hết thời gian' : 'Location request timed out',
            );
            break;
          default:
            setLocationError(
              lang === 'vi' ? 'Không thể xác định vị trí' : 'Could not determine location',
            );
        }
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }, [lang]);

  const handleGetDirections = useCallback((siteId: string) => {
    const site = siteMap.get(siteId);
    if (!site) return;
    openGoogleMapsDirections(site.lat, site.lon);
  }, [siteMap]);

  const nearestHeritage = useMemo(() => {
    if (!userLocation) return null;
    let best: { id: string; name: string; distance: number } | null = null;
    for (const site of filteredSites) {
      if (site.lat === null || site.lon === null) continue;
      const d = haversineDistance(userLocation.lat, userLocation.lng, site.lat, site.lon);
      if (best === null || d < best.distance) {
        best = { id: site.id, name: lang === 'vi' ? site.nameVi : site.nameEn, distance: d };
      }
    }
    return best;
  }, [userLocation, filteredSites, lang]);

  const highlightedMarkerId = nearestHeritage?.id ?? null;

  const renderInfoWindow = useCallback(
    (marker: MapMarker) => {
      const site = siteMap.get(marker.id);
      if (!site) return null;

      const imgSrc = site.image ? getImageUrl(site.image) : PLACEHOLDER_IMG;
      const categoryLabel = typeLabels[site.type]?.[lang] ?? site.type;
      const description = lang === 'vi' ? site.descriptionVi : site.descriptionEn;
      const truncated =
        description.length > 120 ? description.slice(0, 120).trimEnd() + '…' : description;

      return (
        <div style={{ maxWidth: 260, fontFamily: "'Be Vietnam Pro', sans-serif" }}>
          <div style={{ width: '100%', height: 110, overflow: 'hidden', borderRadius: 8, marginBottom: 10, background: '#F0F4F8' }}>
<LazyImage 
              src={imgSrc}
              alt={lang === 'vi' ? site.nameVi : site.nameEn}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              onError={(e) => {
                const img = e.currentTarget;
                if (img.src !== PLACEHOLDER_IMG) {
                  img.src = PLACEHOLDER_IMG;
                }
              }}
            />
          </div>

          <div style={{ marginBottom: 6 }}>
            <span style={{
              display: 'inline-block',
              padding: '2px 8px',
              borderRadius: 10,
              fontSize: 10,
              fontWeight: 700,
              background: '#EBF5FB',
              color: '#0F3D5E',
            }}>
              {categoryLabel}
            </span>
          </div>

          <h3 style={{
            margin: '0 0 6px',
            fontSize: 14,
            fontWeight: 700,
            color: '#0F3D5E',
            lineHeight: 1.3,
            fontFamily: 'Merriweather, serif',
          }}>
            {lang === 'vi' ? site.nameVi : site.nameEn}
          </h3>

          <p style={{
            margin: '0 0 10px',
            fontSize: 12,
            color: '#5d7a8c',
            lineHeight: 1.5,
          }}>
            {truncated}
          </p>

          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => handleGetDirections(site.id)}
              disabled={site.lat === null || site.lon === null}
              title={site.lat === null || site.lon === null
                ? (lang === 'vi' ? 'Thiếu tọa độ' : 'Missing coordinates')
                : (lang === 'vi' ? 'Chỉ đường' : 'Directions')}
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: 6,
                border: '1px solid #D4A017',
                background: site.lat !== null && site.lon !== null ? 'rgba(212,160,23,0.05)' : '#F0F4F8',
                color: site.lat !== null && site.lon !== null ? '#B8860B' : '#cbced4',
                fontSize: 12,
                fontWeight: 600,
                cursor: site.lat !== null && site.lon !== null ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
              }}
            >
              <Navigation size={12} />
              {lang === 'vi' ? 'Chỉ đường' : 'Directions'}
            </button>

            <button
              onClick={() => handleViewDetails(site.id)}
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: 6,
                border: 'none',
                background: '#0F3D5E',
                color: 'white',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {t('map.viewdetail')}
            </button>
          </div>
        </div>
      );
    },
    [siteMap, typeLabels, lang, t, handleViewDetails, handleGetDirections],
  );

  if (loading || error) {
    const isError = !!error;
    return (
      <div
        className={className}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F0F4F8',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          {isError ? (
            <>
              <div style={{ fontSize: 32, marginBottom: 8 }}>⚠️</div>
              <div style={{ fontWeight: 700, marginBottom: 4, color: '#1a2332' }}>
                {lang === 'vi' ? 'Không thể tải dữ liệu' : 'Failed to load data'}
              </div>
              <div style={{ fontSize: 13, color: '#E74C3C', marginBottom: 8 }}>{error!.message}</div>
            </>
          ) : (
            <div style={{ width: '100%', height: '100%', padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Skeleton height={36} borderRadius={8} />
              <Skeleton height={36} borderRadius={8} />
              <Skeleton height="60%" borderRadius={10} style={{ flex: 1 }} />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Filter bar */}
      <div style={{
        padding: '12px 16px',
        background: 'white',
        borderBottom: '1px solid rgba(15,61,94,0.1)',
        flexShrink: 0,
      }}>
        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <Search
            size={15}
            style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#5d7a8c', pointerEvents: 'none' }}
          />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('hm.search')}
            aria-label={t('hm.search')}
            style={{
              width: '100%',
              padding: '9px 34px 9px 34px',
              borderRadius: 8,
              border: '1px solid rgba(15,61,94,0.15)',
              fontSize: 13,
              background: '#F0F4F8',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.15s',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              aria-label={lang === 'vi' ? 'Xóa tìm kiếm' : 'Clear search'}
              style={{
                position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                color: '#5d7a8c', display: 'flex',
              }}
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Category chips */}
        <div role="radiogroup" aria-label={lang === 'vi' ? 'Lọc theo loại hình' : 'Filter by type'} style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {['all', ...HERITAGE_TYPES].map((type) => {
            const isAll = type === 'all';
            const active = selectedCategory === type;
            const label = isAll
              ? t('common.all')
              : typeLabels[type as HeritageType]?.[lang] ?? type;
            return (
              <button
                key={type}
                onClick={() => setSelectedCategory(type as HeritageType | 'all')}
                role="radio"
                aria-checked={active}
                aria-label={label}
                style={{
                  padding: '4px 12px',
                  borderRadius: 16,
                  border: active ? 'none' : '1px solid rgba(15,61,94,0.15)',
                  background: active ? '#0F3D5E' : 'white',
                  color: active ? 'white' : '#5d7a8c',
                  fontSize: 12,
                  fontWeight: active ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Count */}
        <div role="status" aria-live="polite" style={{ marginTop: 10, fontSize: 12, color: '#5d7a8c' }}>
          <span style={{ fontWeight: 700, color: '#0F3D5E' }}>{visibleCount}</span>
          {visibleCount === 1
            ? (lang === 'vi' ? ' di tích hiển thị' : ' site shown')
            : (lang === 'vi' ? ' di tích hiển thị' : ' sites shown')}
        </div>
      </div>

      {/* Map / Empty state */}
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        {visibleCount > 0 ? (
          <>
            <GoogleMapView
              apiKey={apiKey}
              markers={filteredMarkers}
              selectedMarkerId={effectiveSelectedId}
              onMarkerClick={handleMarkerClick}
              onInfoWindowClose={handleInfoWindowClose}
              renderInfoWindow={renderInfoWindow}
              mapTypeId={mapType}
              userLocation={userLocation}
              highlightedMarkerId={highlightedMarkerId}
            />



            {/* Map type toggle (top-right) */}
            <div role="radiogroup" aria-label={lang === 'vi' ? 'Loại bản đồ' : 'Map type'} style={{
              position: 'absolute', top: 12, right: 12, zIndex: 10,
              display: 'flex', borderRadius: 8, overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}>
              {[
                { id: 'roadmap' as const, label: lang === 'vi' ? 'Bản đồ' : 'Map' },
                { id: 'satellite' as const, label: lang === 'vi' ? 'Vệ tinh' : 'Satellite' },
                { id: 'hybrid' as const, label: lang === 'vi' ? 'Hỗn hợp' : 'Hybrid' },
              ].map(({ id, label }) => {
                const active = mapType === id;
                return (
                  <button
                    key={id}
                    onClick={() => setMapType(id)}
                    role="radio"
                    aria-checked={active}
                    aria-label={label}
                    style={{
                      padding: '6px 12px',
                      border: 'none',
                      fontSize: 11,
                      fontWeight: active ? 700 : 500,
                      background: active ? '#0F3D5E' : 'white',
                      color: active ? 'white' : '#5d7a8c',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* My Location button (bottom-right) */}
            <div style={{
              position: 'absolute', bottom: 16, right: 16, zIndex: 10,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            }}>
              {locationError && (
                <div style={{
                  padding: '6px 10px', borderRadius: 6, background: '#FDEDEC',
                  color: '#E74C3C', fontSize: 11, fontWeight: 600, maxWidth: 200,
                  textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  whiteSpace: 'nowrap',
                }}>
                  {locationError}
                </div>
              )}
              <button
                onClick={locateUser}
                disabled={isLocating}
                aria-label={lang === 'vi' ? 'Vị trí của tôi' : 'My Location'}
                title={lang === 'vi' ? 'Vị trí của tôi' : 'My Location'}
                style={{
                  width: 40, height: 40, borderRadius: 8,
                  background: 'white', border: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: isLocating ? 'not-allowed' : 'pointer',
                  color: userLocation ? '#4285F4' : '#5d7a8c',
                  opacity: isLocating ? 0.6 : 1,
                }}
              >
                {isLocating ? (
                  <style>{`@keyframes locate-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%',
                    border: '2px solid #4285F4', borderTopColor: 'transparent',
                    animation: 'locate-pulse 0.8s linear infinite',
                  }} />
                ) : (
                  <Crosshair size={18} />
                )}
              </button>
            </div>

            {/* Bottom-left controls: legend + nearest badge */}
            <div style={{
              position: 'absolute', bottom: 16, left: 16, zIndex: 10,
              display: 'flex', flexDirection: 'column', gap: 8,
              alignItems: 'flex-start',
              pointerEvents: 'none',
            }}>
              <div style={{ pointerEvents: 'auto' }}>
                <CategoryLegend />
              </div>

              {userLocation && nearestHeritage && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 14px', borderRadius: 8,
                  background: 'rgba(255,255,255,0.95)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  maxWidth: 280,
                  pointerEvents: 'auto',
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: '#D4A017', flexShrink: 0,
                  }} />
                  <div>
                    <div style={{
                      fontSize: 10, fontWeight: 700, color: '#D4A017',
                      textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 1,
                    }}>
                      {lang === 'vi' ? 'Gần nhất' : 'Nearest'}
                    </div>
                    <div style={{
                      fontSize: 12, fontWeight: 600, color: '#0F3D5E', lineHeight: 1.3,
                    }}>
                      {nearestHeritage.name}
                    </div>
                    <div style={{ fontSize: 11, color: '#5d7a8c' }}>
                      {nearestHeritage.distance < 1
                        ? `${(nearestHeritage.distance * 1000).toFixed(0)} m`
                        : `${nearestHeritage.distance.toFixed(2)} km`}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#F0F4F8',
          }}>
            <div style={{ textAlign: 'center', maxWidth: 320 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0F3D5E', marginBottom: 6 }}>
                {lang === 'vi' ? 'Không tìm thấy di tích' : 'No heritage sites found'}
              </div>
              <div style={{ fontSize: 13, color: '#5d7a8c', lineHeight: 1.5 }}>
                {searchQuery || selectedCategory !== 'all'
                  ? (lang === 'vi'
                    ? 'Không có di tích nào khớp với bộ lọc hiện tại. Hãy thử thay đổi từ khóa hoặc chọn loại hình khác.'
                    : 'No sites match your current filters. Try a different search term or category.')
                  : (lang === 'vi'
                    ? 'Hiện chưa có dữ liệu di tích để hiển thị trên bản đồ.'
                    : 'No heritage site data is currently available to display on the map.')}
              </div>
              {(searchQuery || selectedCategory !== 'all') && (
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                  aria-label={lang === 'vi' ? 'Đặt lại bộ lọc' : 'Reset filters'}
                  style={{
                    marginTop: 14,
                    padding: '8px 18px',
                    borderRadius: 8,
                    border: '1px solid #0F3D5E',
                    background: 'white',
                    color: '#0F3D5E',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  {lang === 'vi' ? 'Đặt lại bộ lọc' : 'Reset Filters'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
