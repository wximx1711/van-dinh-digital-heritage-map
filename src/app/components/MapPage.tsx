import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { useHeritageSites, useTypeLabels, useClassificationLabels } from '../../presentation/hooks/useHeritageData';
import { useHeritageMapMarkers } from '../../presentation/hooks/useHeritageMapMarkers';
import { haversineDistance, openDirections } from '../utils/geo';
import { getImageUrl } from '../utils/url';
import { sanitizeLocation } from '../utils/uiText';
import { GoogleMapView } from './GoogleMapView';
import { CategoryLegend } from './CategoryLegend';
import { LazyImage } from './LazyImage';
import { TripPlanner } from './TripPlanner';
import { HERITAGE_TYPES, classificationColors } from '../constants';
import { getIconUrl } from '../heritageIcons';
import type { HeritageSite, HeritageType, Classification, MapMarker } from '../../core/types';
import type { TripPlan } from '../services/tripPlannerService';
import {
  X, QrCode, Navigation, RotateCcw, Search,
  Filter, ChevronDown, ChevronUp, Crosshair, Satellite
} from 'lucide-react';

interface MapPageProps {
  onNavigate: (page: string, id?: string) => void;
}



const PLACEHOLDER_IMG = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="120" viewBox="0 0 200 120">' +
  '<rect fill="#F0F4F8" width="200" height="120"/>' +
  '<text x="100" y="68" text-anchor="middle" font-size="36" dominant-baseline="central">🏛️</text>' +
  '</svg>',
);

interface QrModalProps {
  site: HeritageSite;
  onClose: () => void;
  lang: 'vi' | 'en';
}

function QrModal({ site, onClose, lang }: QrModalProps) {
  const coordStr = site.lat !== null && site.lon !== null ? `${site.lat},${site.lon}` : '';
  const qrData = `DITICHR:${site.id}|${site.nameVi}|${site.googleMapUrl || coordStr}`;
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
  const { markers } = useHeritageMapMarkers(heritageSites);
  const typeLabels = useTypeLabels();
  const classificationLabels = useClassificationLabels();

  const [filterClassification, setFilterClassification] = useState<Record<Classification, boolean>>({
    national: true, city: true, unranked: true,
  });
  const [filterTypes, setFilterTypes] = useState<Record<HeritageType, boolean>>({
    dinh: true, chua: true, den: true, mieu: true,
    phu: true, quan: true, nhacu: true, nhatho: true, lang: true,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [showQr, setShowQr] = useState(false);

  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid'>('roadmap');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [tripPlan, setTripPlan] = useState<TripPlan | null>(null);
  const [tripVisibleDay, setTripVisibleDay] = useState<number | null>(null);
  const [tripFocusPosition, setTripFocusPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [tripFitBoundsKey, setTripFitBoundsKey] = useState(0);
  const [customStartPoint, setCustomStartPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [selectingStartPoint, setSelectingStartPoint] = useState(false);
  const mountedRef = useRef(true);
  const langRef = useRef(lang);
  langRef.current = lang;

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const siteMap = useMemo(() => {
    const map = new Map<string, HeritageSite>();
    for (const site of heritageSites) map.set(site.id, site);
    return map;
  }, [heritageSites]);

  const classificationTypes: Classification[] = ['national', 'city', 'unranked'];
  const heritageTypes: HeritageType[] = [...HERITAGE_TYPES];

  const filteredSiteIds = useMemo(() => {
    return new Set(
      heritageSites.filter(site => {
        if (!filterClassification[site.classification]) return false;
        if (!filterTypes[site.type]) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          return site.nameVi.toLowerCase().includes(q) || site.nameEn.toLowerCase().includes(q);
        }
        return true;
      }).map(s => s.id)
    );
  }, [heritageSites, filterClassification, filterTypes, searchQuery]);

  const filteredMarkers = useMemo(
    () => markers.filter(m => filteredSiteIds.has(m.id)),
    [markers, filteredSiteIds],
  );

  const effectiveSelectedId = useMemo(() => {
    if (selectedMarkerId !== null && !filteredSiteIds.has(selectedMarkerId)) return null;
    return selectedMarkerId;
  }, [selectedMarkerId, filteredSiteIds]);

  const visibleCount = filteredMarkers.length;

  const selectedSite = useMemo(
    () => (effectiveSelectedId ? siteMap.get(effectiveSelectedId) ?? null : null),
    [effectiveSelectedId, siteMap],
  );

  const handleMarkerClick = useCallback((id: string) => {
    setSelectedMarkerId(prev => (prev === id ? null : id));
  }, []);

  const handleInfoWindowClose = useCallback(() => {
    setSelectedMarkerId(null);
    setTripFocusPosition(null);
  }, []);

  const handleViewDetails = useCallback(
    (id: string) => onNavigate('heritage-detail', id),
    [onNavigate],
  );

  const resetFilters = () => {
    setFilterClassification({ national: true, city: true, unranked: true });
    setFilterTypes({
      dinh: true, chua: true, den: true, mieu: true,
      phu: true, quan: true, nhacu: true, nhatho: true, lang: true,
    });
    setSearchQuery('');
  };

  const locateUser = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError(
        langRef.current === 'vi' ? 'Trình duyệt không hỗ trợ định vị' : 'Geolocation not supported',
      );
      return;
    }
    setIsLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!mountedRef.current) return;
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setIsLocating(false);
      },
      (err) => {
        if (!mountedRef.current) return;
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setLocationError(langRef.current === 'vi' ? 'Vui lòng cấp quyền truy cập vị trí' : 'Location permission denied');
            break;
          case err.POSITION_UNAVAILABLE:
            setLocationError(langRef.current === 'vi' ? 'Không thể xác định vị trí' : 'Location unavailable');
            break;
          case err.TIMEOUT:
            setLocationError(langRef.current === 'vi' ? 'Yêu cầu định vị hết thời gian' : 'Location request timed out');
            break;
          default:
            setLocationError(langRef.current === 'vi' ? 'Không thể xác định vị trí' : 'Could not determine location');
        }
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }, []);

  const handleGetDirections = useCallback((siteId: string) => {
    const site = siteMap.get(siteId);
    if (!site) return;
    openDirections(site.lat, site.lon);
  }, [siteMap]);

  const visibleSites = useMemo(
    () => heritageSites.filter(s => filteredSiteIds.has(s.id)),
    [heritageSites, filteredSiteIds],
  );

  const nearestHeritage = useMemo(() => {
    if (!userLocation) return null;
    let best: { id: string; name: string; distance: number } | null = null;
    for (const site of visibleSites) {
      if (site.lat === null || site.lon === null) continue;
      const d = haversineDistance(userLocation.lat, userLocation.lng, site.lat, site.lon);
      if (best === null || d < best.distance) {
        best = { id: site.id, name: lang === 'vi' ? site.nameVi : site.nameEn, distance: d };
      }
    }
    return best;
  }, [userLocation, visibleSites, lang]);

  const highlightedMarkerId = nearestHeritage?.id ?? null;

  const tripRouteMarkers = useMemo(() => {
    if (!tripPlan) return [];
    const markers: Array<{
      id: string;
      position: { lat: number; lng: number };
      orderNumber: number;
      dayIndex: number;
      color: string;
    }> = [];
    for (const day of tripPlan.days) {
      for (const dest of day.destinations) {
        markers.push({
          id: dest.siteId,
          position: dest.position,
          orderNumber: dest.order,
          dayIndex: day.day,
          color: day.color,
        });
      }
    }
    return markers;
  }, [tripPlan]);

  const tripPolylines = useMemo(() => {
    if (!tripPlan) return [];
    return tripPlan.days.map((day) => ({
      dayIndex: day.day,
      path: day.routeGeometry && day.routeGeometry.length > 0
        ? day.routeGeometry
            .filter(p => Array.isArray(p) && p.length >= 2 && Number.isFinite(p[0]) && Number.isFinite(p[1]))
            .map(p => ({ lat: p[0], lng: p[1] }))
        : day.destinations.map((d) => d.position),
      color: day.color,
    }));
  }, [tripPlan]);

  const handleTripGenerate = useCallback((plan: TripPlan) => {
    setTripPlan(plan);
    if (plan.days.length > 0) {
      setTripVisibleDay(plan.days[0].day);
      setSelectedMarkerId(null);
    }
  }, []);

  const handleTripReset = useCallback(() => {
    setTripPlan(null);
    setTripVisibleDay(null);
    setSelectedMarkerId(null);
    setCustomStartPoint(null);
    setSelectingStartPoint(false);
  }, []);

  const handleTripFocusSite = useCallback((siteId: string) => {
    setSelectedMarkerId(siteId);
    if (!tripPlan) return;
    for (const day of tripPlan.days) {
      for (const dest of day.destinations) {
        if (dest.siteId === siteId) {
          setTripFocusPosition(dest.position);
          return;
        }
      }
    }
  }, [tripPlan]);

  const tripContextMap = useMemo(() => {
    const map = new Map<string, { day: number; stop: number; arrival: string }>();
    if (!tripPlan) return map;
    for (const day of tripPlan.days) {
      for (const dest of day.destinations) {
        map.set(dest.siteId, { day: day.day, stop: dest.order, arrival: dest.estimatedArrival });
      }
    }
    return map;
  }, [tripPlan]);

  const handleTripDayChange = useCallback((day: number) => {
    setTripVisibleDay(day);
    setTripFitBoundsKey(k => k + 1);
  }, []);

  const handleRequestStartPointSelection = useCallback(() => {
    setSelectingStartPoint(true);
  }, []);

  const handleStartPointSelected = useCallback((coords: { lat: number; lng: number }) => {
    setCustomStartPoint(coords);
    setSelectingStartPoint(false);
  }, []);

  const handleClearStartPoint = useCallback(() => {
    setCustomStartPoint(null);
  }, []);

  const handleCancelStartPointSelection = useCallback(() => {
    setSelectingStartPoint(false);
  }, []);

  const renderInfoWindow = useCallback(
    (marker: MapMarker) => {
      const site = siteMap.get(marker.id);
      if (!site) return null;

      const imgSrc = site.image ? getImageUrl(site.image) : PLACEHOLDER_IMG;
      const categoryLabel = typeLabels[site.type]?.[lang] ?? site.type;
      const address = sanitizeLocation(lang === 'vi' ? site.addressVi : site.addressEn);
      const tripCtx = tripContextMap.get(marker.id);

      const statusLabelKey = `hm.status_${site.status}` as const;
      const statusLabel = t(statusLabelKey);

      return (
        <div style={{ maxWidth: 260, fontFamily: "'Be Vietnam Pro', sans-serif" }}>
          {tripCtx && (
            <div style={{
              display: 'flex', gap: 4, marginBottom: 6, flexWrap: 'wrap',
            }}>
              <span style={{
                display: 'inline-block', padding: '2px 8px', borderRadius: 10,
                fontSize: 10, fontWeight: 700, background: '#0F3D5E', color: 'white',
              }}>
                {lang === 'vi' ? `Ngày ${tripCtx.day}` : `Day ${tripCtx.day}`} #{tripCtx.stop}
              </span>
              <span style={{
                display: 'inline-block', padding: '2px 8px', borderRadius: 10,
                fontSize: 10, fontWeight: 600, background: '#F0F4F8', color: '#5d7a8c',
              }}>
                {tripCtx.arrival}
              </span>
            </div>
          )}
          <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', borderRadius: 8, marginBottom: 10, background: '#F0F4F8' }}>
            <LazyImage
              src={imgSrc}
              alt={lang === 'vi' ? site.nameVi : site.nameEn}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              onError={(e) => {
                const img = e.currentTarget;
                if (img.src !== PLACEHOLDER_IMG) img.src = PLACEHOLDER_IMG;
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 6, flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-block', padding: '2px 8px', borderRadius: 10,
              fontSize: 10, fontWeight: 700, background: '#EBF5FB', color: '#0F3D5E',
            }}>
              {categoryLabel}
            </span>
            <span style={{
              display: 'inline-block', padding: '2px 8px', borderRadius: 10,
              fontSize: 10, fontWeight: 600, background: '#E8F8F0', color: '#27AE60',
            }}>
              {statusLabel}
            </span>
          </div>
          <h3 style={{
            margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: '#0F3D5E',
            lineHeight: 1.3, fontFamily: 'Merriweather, serif',
          }}>
            {lang === 'vi' ? site.nameVi : site.nameEn}
          </h3>
          {address && (
            <p style={{ margin: '0 0 10px', fontSize: 11, color: '#5d7a8c', lineHeight: 1.4 }}>
              {address}
            </p>
          )}
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => handleGetDirections(site.id)}
              disabled={site.lat === null || site.lon === null}
              title={site.lat === null || site.lon === null
                ? (lang === 'vi' ? 'Thiếu tọa độ' : 'Missing coordinates')
                : (lang === 'vi' ? 'Chỉ đường' : 'Directions')}
              style={{
                flex: 1, padding: '8px 10px', borderRadius: 6,
                border: '1px solid #D4A017',
                background: site.lat !== null && site.lon !== null ? 'rgba(212,160,23,0.05)' : '#F0F4F8',
                color: site.lat !== null && site.lon !== null ? '#B8860B' : '#cbced4',
                fontSize: 12, fontWeight: 600,
                cursor: site.lat !== null && site.lon !== null ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              }}
            >
              <Navigation size={12} />
              {lang === 'vi' ? 'Chỉ đường' : 'Directions'}
            </button>
            <button
              onClick={() => handleViewDetails(site.id)}
              style={{
                flex: 1, padding: '8px 10px', borderRadius: 6, border: 'none',
                background: '#0F3D5E', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >
              {t('map.viewdetail')}
            </button>
          </div>
        </div>
      );
    },
    [siteMap, typeLabels, lang, t, handleViewDetails, handleGetDirections, tripContextMap],
  );

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 120px)', background: '#F0F4F8', position: 'relative' }}>
      {/* Mobile sidebar toggle button */}
      <button
        onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        className="show-mobile"
        style={{
          display: 'none', position: 'absolute', top: 8, left: 8, zIndex: 25,
          padding: '8px 10px', borderRadius: 6, border: 'none',
          background: '#0F3D5E', color: 'white', cursor: 'pointer',
          alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        }}
        aria-label={lang === 'vi' ? 'Mở bộ lọc' : 'Open filters'}
      >
        <Filter size={14} />
        <span>{t('common.filter')}</span>
      </button>

      {/* Mobile sidebar backdrop */}
      {mobileSidebarOpen && (
        <div
          className="show-mobile"
          style={{ display: 'none', position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 19 }}
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${mobileSidebarOpen ? 'map-sidebar-overlay' : ''}`} style={{
        width: showFilters ? 300 : 48, minWidth: showFilters ? 300 : 48,
        background: 'white', borderRight: '1px solid rgba(15,61,94,0.1)',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.3s, min-width 0.3s', overflow: 'hidden',
      }}>
        <div style={{
          padding: '14px 12px', background: '#0F3D5E',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {showFilters && (
            <span style={{ color: 'white', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Filter size={14} /> <span className="hide-mobile">{t('common.filter')}</span>
            </span>
          )}
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={() => { setShowFilters(!showFilters); setMobileSidebarOpen(false); }}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', padding: 4 }}
            >
              {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {showFilters && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
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
                  <span style={{ fontSize: 12, color: '#1a2332', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <LazyImage src={getIconUrl(type)} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    </div>
                    {t(`map.type.${type}`)}
                  </span>
                </label>
              ))}
            </div>

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

            <div style={{ marginTop: 16, padding: '10px', borderRadius: 6, background: '#EBF5FB', textAlign: 'center' }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: '#0F3D5E' }}>{visibleCount}</span>
              <span style={{ fontSize: 11, color: '#5d7a8c', display: 'block' }}>
                {lang === 'vi' ? 'di tích hiển thị' : 'sites shown'}
              </span>
            </div>

            <div style={{ marginTop: 16, padding: '12px', background: '#F0F4F8', borderRadius: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 8 }}>
                {lang === 'vi' ? 'Chú giải' : 'Legend'}
              </div>
              <div style={{ fontSize: 10, color: '#5d7a8c', fontWeight: 600, marginBottom: 6 }}>
                {lang === 'vi' ? 'Loại hình' : 'Type'}
              </div>
              {heritageTypes.map((type) => {
                const label = typeLabels[type]?.[lang] ?? type;
                return (
                  <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 }}>
                    <div style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <LazyImage src={getIconUrl(type)} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    </div>
                    <span style={{ fontSize: 11, color: '#1a2332' }}>{label}</span>
                  </div>
                );
              })}
              <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                <div style={{ fontSize: 10, color: '#5d7a8c', fontWeight: 600, marginBottom: 4 }}>
                  {lang === 'vi' ? 'Xếp hạng' : 'Ranking'}
                </div>
                {classificationTypes.map(cls => (
                  <div key={cls} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <div style={{
                      width: 14, height: 3, borderRadius: 1.5,
                      background: classificationColors[cls],
                      flexShrink: 0,
                    }} />
                    <span style={{ fontSize: 11, color: '#5d7a8c' }}>{classificationLabels[cls][lang]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Map area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <GoogleMapView
          markers={filteredMarkers}
          selectedMarkerId={effectiveSelectedId}
          onMarkerClick={handleMarkerClick}
          onInfoWindowClose={handleInfoWindowClose}
          renderInfoWindow={renderInfoWindow}
          mapType={mapType}
          userLocation={userLocation}
          highlightedMarkerId={highlightedMarkerId}
          tripRouteMarkers={tripRouteMarkers}
          tripPolylines={tripPolylines}
          visibleDay={tripVisibleDay}
          onTripMarkerClick={handleMarkerClick}
          focusPosition={tripFocusPosition}
          fitTripBoundsKey={tripFitBoundsKey}
          selectingStartPoint={selectingStartPoint}
          startPointMarker={customStartPoint}
          onStartPointSelected={handleStartPointSelected}
          onCancelStartPointSelection={handleCancelStartPointSelection}
        />

        {selectingStartPoint && (
          <div style={{
            position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
            zIndex: 1002, background: '#0F3D5E', color: 'white',
            padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
            display: 'flex', alignItems: 'center', gap: 10,
            pointerEvents: 'auto', whiteSpace: 'nowrap',
          }}>
            <span>{lang === 'vi' ? '👆 Nhấp vào bản đồ để chọn điểm xuất phát' : '👆 Click the map to select a starting point'}</span>
            <button
              onClick={() => setSelectingStartPoint(false)}
              style={{
                background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white',
                cursor: 'pointer', borderRadius: 4, width: 22, height: 22,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, padding: 0,
              }}
              title={lang === 'vi' ? 'Hủy' : 'Cancel'}
              aria-label={lang === 'vi' ? 'Hủy chọn điểm' : 'Cancel point selection'}
            >
              ✕
            </button>
          </div>
        )}

        {visibleCount === 0 && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            zIndex: 20, pointerEvents: 'auto',
            background: 'rgba(255,255,255,0.95)',
            borderRadius: 12, padding: '20px 28px',
            textAlign: 'center',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0F3D5E', marginBottom: 4 }}>
              {lang === 'vi' ? 'Không tìm thấy di tích' : 'No heritage sites found'}
            </div>
            <div style={{ fontSize: 12, color: '#5d7a8c', lineHeight: 1.5, marginBottom: 12 }}>
              {lang === 'vi'
                ? 'Thử thay đổi từ khóa hoặc bộ lọc.'
                : 'Try a different search term or filter.'}
            </div>
            <button
              onClick={resetFilters}
              style={{
                padding: '6px 16px', borderRadius: 6,
                border: '1px solid #0F3D5E', background: 'white',
                color: '#0F3D5E', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >
              {lang === 'vi' ? 'Đặt lại bộ lọc' : 'Reset Filters'}
            </button>
          </div>
        )}



        <TripPlanner
          heritageSites={heritageSites}
          plan={tripPlan}
          activeDay={tripVisibleDay ?? 1}
          onGenerate={handleTripGenerate}
          onReset={handleTripReset}
          onFocusSite={handleTripFocusSite}
          onDayChange={handleTripDayChange}
          customStartPoint={customStartPoint}
          onRequestStartPointSelection={handleRequestStartPointSelection}
          onClearStartPoint={handleClearStartPoint}
        />

        <div role="radiogroup" aria-label={lang === 'vi' ? 'Loại bản đồ' : 'Map type'} className="map-type-controls" style={{
          position: 'absolute', top: 12, right: 12, zIndex: 10,
          display: 'flex', borderRadius: 8, overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        }}>
          {[
            { id: 'roadmap' as const, label: lang === 'vi' ? 'Bản đồ' : 'Map' },
            { id: 'satellite' as const, label: lang === 'vi' ? 'Vệ tinh' : 'Satellite' },
            { id: 'hybrid' as const, label: lang === 'vi' ? 'Hỗn hợp' : 'Hybrid' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setMapType(id)}
              role="radio"
              aria-checked={mapType === id}
              className="touch-target"
              style={{
                padding: '6px 12px', border: 'none', fontSize: 'clamp(10px, 2.5vw, 11px)',
                fontWeight: mapType === id ? 700 : 500,
                background: mapType === id ? '#0F3D5E' : 'white',
                color: mapType === id ? 'white' : '#5d7a8c',
                cursor: 'pointer', transition: 'background 0.15s',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="map-location-controls" style={{
          position: 'absolute', bottom: 16, right: 16, zIndex: 10,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        }}>
          <style>{`@keyframes locate-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
          {locationError && (
            <div className="hide-mobile" style={{
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
            className="touch-target"
            style={{
              width: 44, height: 44, borderRadius: 8,
              background: 'white', border: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: isLocating ? 'not-allowed' : 'pointer',
              color: userLocation ? '#4285F4' : '#5d7a8c',
              opacity: isLocating ? 0.6 : 1,
            }}
          >
            {isLocating ? (
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

        <div className="map-info-controls" style={{
          position: 'absolute', bottom: 16, left: 16, zIndex: 10,
          display: 'flex', flexDirection: 'column', gap: 8,
          alignItems: 'flex-start', pointerEvents: 'none',
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
              maxWidth: 260, pointerEvents: 'auto',
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: '#D4A017', flexShrink: 0,
              }} />
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, color: '#D4A017',
                  textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 1,
                }}>
                  {lang === 'vi' ? 'Gần nhất' : 'Nearest'}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#0F3D5E', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
      </div>

      {showQr && selectedSite && (
        <QrModal site={selectedSite} onClose={() => setShowQr(false)} lang={lang} />
      )}
      <style>{`
        @media (max-width: 767px) {
          .map-sidebar-overlay {
            position: absolute !important;
            top: 0;
            left: 0;
            bottom: 0;
            z-index: 20;
            width: 280px !important;
            min-width: 280px !important;
            box-shadow: 4px 0 24px rgba(0,0,0,0.2);
          }
          .map-type-controls {
            top: 48px !important;
            left: 8px !important;
            right: auto !important;
          }
          .map-location-controls {
            bottom: 60px !important;
            right: 8px !important;
          }
          .map-info-controls {
            bottom: 60px !important;
            left: 8px !important;
          }
        }
        @media (min-width: 768px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
}
