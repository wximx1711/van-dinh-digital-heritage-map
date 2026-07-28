import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useLanguage } from './LanguageContext';
import { useTypeLabels, useClassificationLabels } from '../../presentation/hooks/useHeritageData';
import { classificationColors } from '../constants';
import { generateTripPlan, fmtDist, fmtTime, VAN_DINH_ORIGIN } from '../services/tripPlannerService';
import { clearRouteCache } from '../services/routingService';
import type { HeritageSite } from '../../core/types';
import type { TripPlan, TripDestination, TripType } from '../services/tripPlannerService';
import type { TransportProfile } from '../services/routingService';
import {
  MapPin, Route, RotateCcw, Navigation, Printer, Clipboard, Download,
  Sun, Clock, Bike, Car, PersonStanding, Loader2, AlertCircle, X,
} from 'lucide-react';

interface TripPlannerProps {
  heritageSites: HeritageSite[];
  plan: TripPlan | null;
  activeDay: number;
  onGenerate: (plan: TripPlan) => void;
  onReset: () => void;
  onFocusSite: (siteId: string) => void;
  onDayChange: (day: number) => void;
}

const DESTINATION_OPTIONS = [3, 4, 5, 6, 7, 8];
const TRIP_TYPE_OPTIONS: { key: TripType; icon: string; labelVi: string; labelEn: string }[] = [
  { key: 'half-day', icon: '🌅', labelVi: 'Nửa ngày', labelEn: 'Half Day' },
  { key: 'one-day', icon: '☀️', labelVi: 'Một ngày', labelEn: 'One Day' },
  { key: 'full-day', icon: '🌙', labelVi: 'Cả ngày', labelEn: 'Full Day' },
];
const MODE_OPTIONS: { key: TransportProfile; icon: React.ReactNode; labelVi: string; labelEn: string }[] = [
  { key: 'driving', icon: <Car size={16} />, labelVi: 'Xe máy', labelEn: 'Motorbike' },
  { key: 'cycling', icon: <Bike size={16} />, labelVi: 'Xe đạp', labelEn: 'Cycling' },
  { key: 'walking', icon: <PersonStanding size={16} />, labelVi: 'Đi bộ', labelEn: 'Walking' },
];

export function TripPlanner({
  heritageSites,
  plan,
  onGenerate,
  onReset,
  onFocusSite,
}: TripPlannerProps) {
  const { lang, t } = useLanguage();
  const typeLabels = useTypeLabels();
  const classificationLabels = useClassificationLabels();

  const [panelOpen, setPanelOpen] = useState(false);
  const [destinationCount, setDestinationCount] = useState(5);
  const [tripType, setTripType] = useState<TripType>('one-day');
  const [transportMode, setTransportMode] = useState<TransportProfile>('driving');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copyMsg, setCopyMsg] = useState('');
  const [showConfig, setShowConfig] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (copyMsg) {
      const t = setTimeout(() => setCopyMsg(''), 2500);
      return () => clearTimeout(t);
    }
  }, [copyMsg]);

  useEffect(() => {
    if (!panelOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPanelOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [panelOpen]);

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setLoadingStep(lang === 'vi' ? 'Đang chuẩn bị...' : 'Preparing...');
    setError(null);

    try {
      const result = await generateTripPlan({
        sites: heritageSites,
        origin: VAN_DINH_ORIGIN,
        destinationCount,
        transportMode,
        tripType,
        onProgress: (step) => setLoadingStep(step),
      });
      onGenerate(result);
      setShowConfig(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [heritageSites, destinationCount, transportMode, tripType, lang, onGenerate]);

  const handleReset = useCallback(() => {
    setDestinationCount(5);
    setTripType('one-day');
    setTransportMode('driving');
    setError(null);
    setShowConfig(true);
    clearRouteCache();
    onReset();
  }, [onReset]);

  const handleRegenerate = useCallback(async () => {
    clearRouteCache();
    await handleGenerate();
  }, [handleGenerate]);

  const handleFocus = useCallback((siteId: string) => {
    onFocusSite(siteId);
  }, [onFocusSite]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleExportPdf = useCallback(() => {
    if (!plan) return;
    const printWin = window.open('', '_blank');
    if (!printWin) return;
    const lines: string[] = [];
    for (const day of plan.days) {
      lines.push(`<h2 style="color:#0F3D5E;border-bottom:2px solid ${day.color};padding-bottom:4px;">${lang === 'vi' ? `Hành trình` : `Itinerary`}</h2>`);
      lines.push('<div style="margin:8px 0 12px;">');
      for (const d of day.destinations) {
        const name = lang === 'vi' ? d.nameVi : d.nameEn;
        const typeLabel = typeLabels[d.type]?.[lang] ?? d.type;
        lines.push(`<div style="margin-bottom:8px;padding:8px;background:#F0F4F8;border-radius:6px;"><strong>${d.order}. ${name}</strong><br/><span style="color:#5d7a8c;font-size:12px;">${typeLabel} — ${d.estimatedArrival} - ${d.departureTime}</span></div>`);
      }
      lines.push('</div>');
    }
    lines.push(`<hr/><p style="font-size:13px;font-weight:600;">${lang === 'vi' ? 'Tổng:' : 'Total:'} ${fmtDist(plan.totalDistance)} · ${fmtTime(plan.totalDuration)} · ${plan.totalSites} ${lang === 'vi' ? 'di tích' : 'sites'}</p>`);
    printWin.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${lang === 'vi' ? 'Lịch trình tham quan' : 'Trip Itinerary'}</title><style>body{font-family:sans-serif;max-width:700px;margin:0 auto;padding:24px;color:#1a2332;}@media print{body{padding:0;}}</style></head><body>${lines.join('\n')}</body></html>`);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => { printWin.print(); }, 300);
  }, [plan, lang, typeLabels]);

  const handleCopyToClipboard = useCallback(() => {
    if (!plan) return;
    const lines: string[] = [];
    lines.push(lang === 'vi' ? 'LỊCH TRÌNH THAM QUAN' : 'TRIP ITINERARY');
    lines.push('='.repeat(40));
    lines.push('');
    for (const day of plan.days) {
      for (const d of day.destinations) {
        const name = lang === 'vi' ? d.nameVi : d.nameEn;
        const typeLabel = typeLabels[d.type]?.[lang] ?? d.type;
        lines.push(`  ${d.order}. ${name} (${typeLabel})`);
        lines.push(`     ${lang === 'vi' ? 'Đến:' : 'Arrive:'} ${d.estimatedArrival} - ${lang === 'vi' ? 'Đi:' : 'Leave:'} ${d.departureTime}`);
        if (d.distanceFromPrev > 0) {
          lines.push(`     ${lang === 'vi' ? 'Di chuyển:' : 'Travel:'} ${fmtDist(d.distanceFromPrev)} (${d.travelTime} ${lang === 'vi' ? 'phút' : 'min'})`);
        }
      }
    }
    lines.push('');
    lines.push(`${lang === 'vi' ? 'Tổng khoảng cách:' : 'Total distance:'} ${fmtDist(plan.totalDistance)}`);
    lines.push(`${lang === 'vi' ? 'Tổng thời gian:' : 'Total duration:'} ${fmtTime(plan.totalDuration)}`);
    lines.push(`${lang === 'vi' ? 'Số di tích:' : 'Sites:'} ${plan.totalSites}`);

    navigator.clipboard.writeText(lines.join('\n')).then(
      () => setCopyMsg(lang === 'vi' ? 'Đã sao chép!' : 'Copied!'),
      () => setCopyMsg(lang === 'vi' ? 'Sao chép thất bại' : 'Copy failed'),
    );
  }, [plan, lang, typeLabels]);

  const handleClose = useCallback(() => {
    setPanelOpen(false);
  }, []);

  const togglePanel = useCallback(() => {
    setPanelOpen(prev => !prev);
  }, []);

  if (!panelOpen) {
    return (
      <button
        onClick={togglePanel}
        aria-label={lang === 'vi' ? 'Lập lịch trình' : 'Trip Planner'}
        title={lang === 'vi' ? 'Lập lịch trình' : 'Trip Planner'}
        className="trip-planner-btn"
        style={{
          position: 'fixed', bottom: 80, right: 16, zIndex: 1000,
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '10px 16px', borderRadius: 8,
          background: plan ? '#D4A017' : '#0F3D5E', border: 'none',
          color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer',
          boxShadow: plan ? '0 4px 12px rgba(212,160,23,0.35)' : '0 4px 12px rgba(15,61,94,0.35)',
          fontFamily: 'inherit', transition: 'transform 0.15s, box-shadow 0.15s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(15,61,94,0.45)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = plan ? '0 4px 12px rgba(212,160,23,0.35)' : '0 4px 12px rgba(15,61,94,0.35)';
        }}
      >
        <Route size={16} />
        <span className="trip-planner-label">
          {plan
            ? (lang === 'vi' ? `Lịch trình (${plan.totalSites} điểm)` : `Trip (${plan.totalSites} stops)`)
            : (lang === 'vi' ? 'Lập lịch trình' : 'Trip Planner')}
        </span>
      </button>
    );
  }

  return (
    <>
      <div
        style={{
          position: 'absolute', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.35)', cursor: 'pointer',
        }}
        onClick={handleClose}
      />

      <div ref={panelRef} className="trip-planner-panel" style={{
        position: 'absolute', top: 0, left: 0,
        width: 380, maxWidth: '100%', height: '100%',
        zIndex: 1001, background: 'white',
        boxShadow: '4px 0 16px rgba(0,0,0,0.12)',
        display: 'flex', flexDirection: 'column',
        fontFamily: "'Be Vietnam Pro', sans-serif",
      }}>
        <div style={{
          padding: '14px 16px', background: '#0F3D5E',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Route size={18} color="#D4A017" />
            <span style={{ color: 'white', fontSize: 15, fontWeight: 700 }}>
              {lang === 'vi' ? 'Lập lịch trình' : 'Trip Planner'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {plan && (
              <button
                onClick={handleRegenerate}
                disabled={loading}
                title={lang === 'vi' ? 'Tạo lại' : 'Regenerate'}
                style={{
                  background: 'rgba(255,255,255,0.1)', border: 'none',
                  color: 'rgba(255,255,255,0.7)', cursor: loading ? 'not-allowed' : 'pointer',
                  padding: '4px 8px', borderRadius: 4,
                  fontSize: 11, display: 'flex', alignItems: 'center', gap: 4,
                  fontFamily: 'inherit', opacity: loading ? 0.5 : 1,
                }}
              >
                <RotateCcw size={11} />
                {lang === 'vi' ? 'Tạo lại' : 'Regen'}
              </button>
            )}
            <button
              onClick={handleReset}
              disabled={loading}
              title={lang === 'vi' ? 'Đặt lại' : 'Reset'}
              style={{
                background: 'rgba(255,255,255,0.1)', border: 'none',
                color: 'rgba(255,255,255,0.7)', cursor: loading ? 'not-allowed' : 'pointer',
                padding: '4px 8px', borderRadius: 4,
                fontSize: 11, display: 'flex', alignItems: 'center', gap: 4,
                fontFamily: 'inherit', opacity: loading ? 0.5 : 1,
              }}
            >
              <RotateCcw size={11} />
              {lang === 'vi' ? 'Đặt lại' : 'Reset'}
            </button>
            <button
              onClick={handleClose}
              aria-label={lang === 'vi' ? 'Đóng' : 'Close'}
              title={lang === 'vi' ? 'Đóng' : 'Close'}
              style={{
                background: 'rgba(255,255,255,0.15)', border: 'none',
                color: 'white', cursor: 'pointer',
                width: 28, height: 28, borderRadius: 4,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'inherit',
              }}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
          {loading && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', padding: '40px 20px', gap: 12,
            }}>
              <Loader2 size={32} style={{ animation: 'trip-spin 1s linear infinite', color: '#0F3D5E' }} />
              <div style={{ fontSize: 13, color: '#5d7a8c', fontWeight: 600, textAlign: 'center' }}>
                {loadingStep}
              </div>
              <div style={{ fontSize: 11, color: '#cbced4', textAlign: 'center' }}>
                {lang === 'vi' ? 'Đang tải dữ liệu từ OSRM...' : 'Fetching route data from OSRM...'}
              </div>
            </div>
          )}

          {error && (
            <div style={{
              padding: '10px 12px', borderRadius: 6, background: '#FDEDEC',
              color: '#E74C3C', fontSize: 12, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
            }}>
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {!loading && showConfig && !plan && (
            <div>
              <div style={{
                padding: '10px 12px', borderRadius: 8, background: '#F0F4F8',
                marginBottom: 14, border: '1px solid rgba(15,61,94,0.08)',
              }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: '#0F3D5E',
                  marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <MapPin size={13} />
                  {lang === 'vi' ? 'Điểm xuất phát' : 'Starting Point'}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1a2332' }}>
                  {lang === 'vi' ? 'UBND xã Vân Đình' : 'Van Dinh Commune PC'}
                </div>
                <div style={{ fontSize: 10, color: '#5d7a8c', marginTop: 2 }}>
                  {VAN_DINH_ORIGIN.lat.toFixed(4)}, {VAN_DINH_ORIGIN.lng.toFixed(4)}
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: '#0F3D5E',
                  textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8,
                }}>
                  {lang === 'vi' ? 'Thời gian' : 'Trip Duration'}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {TRIP_TYPE_OPTIONS.map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => setTripType(opt.key)}
                      style={{
                        flex: 1, padding: '8px 6px', borderRadius: 8,
                        border: tripType === opt.key ? '2px solid #0F3D5E' : '1px solid rgba(15,61,94,0.12)',
                        background: tripType === opt.key ? '#EBF5FB' : 'white',
                        color: tripType === opt.key ? '#0F3D5E' : '#5d7a8c',
                        fontSize: 11, fontWeight: tripType === opt.key ? 700 : 500,
                        cursor: 'pointer', fontFamily: 'inherit',
                        textAlign: 'center', transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ fontSize: 16, marginBottom: 2 }}>{opt.icon}</div>
                      <div>{lang === 'vi' ? opt.labelVi : opt.labelEn}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: '#0F3D5E',
                  textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8,
                }}>
                  {lang === 'vi' ? 'Số điểm đến' : 'Destinations'}
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {DESTINATION_OPTIONS.map(n => (
                    <button
                      key={n}
                      onClick={() => setDestinationCount(n)}
                      style={{
                        width: 44, height: 36, borderRadius: 6,
                        border: destinationCount === n ? '2px solid #0F3D5E' : '1px solid rgba(15,61,94,0.12)',
                        background: destinationCount === n ? '#EBF5FB' : 'white',
                        color: destinationCount === n ? '#0F3D5E' : '#5d7a8c',
                        fontSize: 13, fontWeight: destinationCount === n ? 700 : 500,
                        cursor: 'pointer', fontFamily: 'inherit',
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: '#0F3D5E',
                  textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8,
                }}>
                  {lang === 'vi' ? 'Phương tiện' : 'Transport'}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {MODE_OPTIONS.map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => setTransportMode(opt.key)}
                      style={{
                        flex: 1, padding: '8px 6px', borderRadius: 8,
                        border: transportMode === opt.key ? '2px solid #D4A017' : '1px solid rgba(15,61,94,0.12)',
                        background: transportMode === opt.key ? '#FFF9EB' : 'white',
                        color: transportMode === opt.key ? '#B8860B' : '#5d7a8c',
                        fontSize: 11, fontWeight: transportMode === opt.key ? 700 : 500,
                        cursor: 'pointer', fontFamily: 'inherit',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: 4, transition: 'all 0.15s',
                      }}
                    >
                      {opt.icon}
                      <span>{lang === 'vi' ? opt.labelVi : opt.labelEn}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading}
                style={{
                  width: '100%', padding: '12px', borderRadius: 8,
                  border: 'none', background: loading ? '#cbced4' : '#D4A017',
                  color: 'white', fontSize: 14, fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 6, fontFamily: 'inherit',
                  boxShadow: loading ? 'none' : '0 3px 8px rgba(212,160,23,0.3)',
                  transition: 'all 0.15s',
                  opacity: heritageSites.length === 0 ? 0.5 : 1,
                }}
              >
                <Navigation size={16} />
                {lang === 'vi' ? 'Tạo lịch trình' : 'Generate Trip'}
              </button>
            </div>
          )}

          {!loading && plan && plan.totalSites > 0 && (
            <>
              <div style={{
                padding: '12px 14px', borderRadius: 10,
                background: 'linear-gradient(135deg, #0F3D5E 0%, #1A5276 100%)',
                color: 'white', marginBottom: 12,
              }}>
                <div style={{
                  fontSize: 12, fontWeight: 700, marginBottom: 8,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <Sun size={14} />
                  {lang === 'vi' ? 'Tổng quan' : 'Summary'}
                </div>
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr',
                  gap: '3px 16px', fontSize: 11,
                }}>
                  <span style={{ opacity: 0.7 }}>{lang === 'vi' ? 'Bắt đầu:' : 'Start:'}</span>
                  <span style={{ fontWeight: 600, textAlign: 'right' }}>{plan.startTime}</span>
                  <span style={{ opacity: 0.7 }}>{lang === 'vi' ? 'Kết thúc:' : 'End:'}</span>
                  <span style={{ fontWeight: 600, textAlign: 'right' }}>{plan.endTime}</span>
                  <span style={{ opacity: 0.7 }}>{lang === 'vi' ? 'Di tích:' : 'Sites:'}</span>
                  <span style={{ fontWeight: 600, textAlign: 'right' }}>{plan.totalSites}</span>
                  <span style={{ opacity: 0.7 }}>{lang === 'vi' ? 'Di chuyển:' : 'Travel:'}</span>
                  <span style={{ fontWeight: 600, textAlign: 'right' }}>{fmtTime(plan.totalTravelTime)}</span>
                  <span style={{ opacity: 0.7 }}>{lang === 'vi' ? 'Tham quan:' : 'Visit:'}</span>
                  <span style={{ fontWeight: 600, textAlign: 'right' }}>{fmtTime(plan.totalVisitTime)}</span>
                  <span style={{ opacity: 0.7 }}>{lang === 'vi' ? 'Khoảng cách:' : 'Distance:'}</span>
                  <span style={{ fontWeight: 600, textAlign: 'right' }}>{fmtDist(plan.totalDistance)}</span>
                  <span style={{ opacity: 0.7 }}>{lang === 'vi' ? 'Tổng TG:' : 'Total:'}</span>
                  <span style={{ fontWeight: 600, textAlign: 'right' }}>{fmtTime(plan.totalDuration)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 4, marginBottom: 12, flexWrap: 'wrap' }}>
                <button onClick={handlePrint} title={lang === 'vi' ? 'In' : 'Print'}
                  style={{
                    flex: 1, padding: '5px 8px', borderRadius: 5,
                    border: '1px solid rgba(15,61,94,0.15)', background: 'white',
                    color: '#5d7a8c', fontSize: 10, fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                    fontFamily: 'inherit',
                  }}
                >
                  <Printer size={12} /> {lang === 'vi' ? 'In' : 'Print'}
                </button>
                <button onClick={handleExportPdf} title="PDF"
                  style={{
                    flex: 1, padding: '5px 8px', borderRadius: 5,
                    border: '1px solid rgba(15,61,94,0.15)', background: 'white',
                    color: '#5d7a8c', fontSize: 10, fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                    fontFamily: 'inherit',
                  }}
                >
                  <Download size={12} /> PDF
                </button>
                <button onClick={handleCopyToClipboard} title={lang === 'vi' ? 'Sao chép' : 'Copy'}
                  style={{
                    flex: 1, padding: '5px 8px', borderRadius: 5,
                    border: '1px solid rgba(15,61,94,0.15)', background: 'white',
                    color: '#5d7a8c', fontSize: 10, fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                    fontFamily: 'inherit', position: 'relative',
                  }}
                >
                  <Clipboard size={12} />
                  {copyMsg ? (
                    <span style={{
                      position: 'absolute', top: -20, right: 0,
                      fontSize: 9, color: '#27AE60', fontWeight: 700, whiteSpace: 'nowrap',
                    }}>
                      {copyMsg}
                    </span>
                  ) : null}
                  {lang === 'vi' ? 'Sao chép' : 'Copy'}
                </button>
              </div>

              <div style={{
                marginBottom: 12, padding: '8px 10px', borderRadius: 6,
                background: '#F0F4F8', display: 'flex',
                justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div style={{ fontSize: 11, color: '#5d7a8c' }}>
                  {lang === 'vi' ? 'Số điểm' : 'Stops'}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#0F3D5E' }}>
                  {plan.totalSites}
                </div>
              </div>

              <div className="trip-timeline" style={{ position: 'relative', paddingLeft: 32, marginBottom: 8 }}>
                <div style={{
                  position: 'absolute', left: 14, top: 8, bottom: 8,
                  width: 2, background: '#D4A017', opacity: 0.25,
                  borderRadius: 1,
                }} />

                <div style={{
                  position: 'relative', marginBottom: 12,
                  padding: '8px 10px', borderRadius: 6,
                  background: '#F0F4F8',
                }}>
                  <div style={{
                    position: 'absolute', left: -22, top: 9,
                    width: 20, height: 20, borderRadius: '50%',
                    background: '#D4A017', color: 'white',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 9,
                    fontWeight: 700, zIndex: 1,
                    boxShadow: '0 0 0 3px white',
                  }}>
                    <MapPin size={10} />
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#0F3D5E' }}>
                    {plan.startTime}
                  </div>
                  <div style={{ fontSize: 12, color: '#1a2332', fontWeight: 500 }}>
                    {lang === 'vi' ? 'UBND xã Vân Đình' : 'Van Dinh Commune PC'}
                  </div>
                </div>

                {plan.days[0]?.destinations.map((dest, idx) => (
                  <div key={dest.siteId}>
                    {idx > 0 && (
                      <div style={{
                        marginLeft: -18, padding: '4px 0 4px 24px',
                        fontSize: 10, color: '#5d7a8c',
                        display: 'flex', alignItems: 'center', gap: 4,
                      }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 2,
                          background: '#F0F4F8', padding: '1px 6px', borderRadius: 3,
                        }}>
                          <Clock size={9} />
                          {dest.travelTime} {lang === 'vi' ? 'ph' : 'min'}
                        </span>
                        <span>{fmtDist(dest.distanceFromPrev)}</span>
                      </div>
                    )}

                    <div
                      onClick={() => handleFocus(dest.siteId)}
                      style={{
                        position: 'relative', padding: '8px 10px',
                        borderRadius: 6, cursor: 'pointer',
                        transition: 'background 0.15s', marginBottom: 0,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#F0F4F8'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div style={{
                        position: 'absolute', left: -22, top: 9,
                        width: 22, height: 22, borderRadius: '50%',
                        background: '#0F3D5E', color: 'white',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: 10,
                        fontWeight: 700, zIndex: 1,
                        boxShadow: '0 0 0 3px white',
                      }}>
                        {dest.order}
                      </div>

                      <div style={{
                        fontSize: 10, color: '#D4A017', fontWeight: 700,
                        marginBottom: 2, display: 'flex', alignItems: 'center', gap: 3,
                      }}>
                        <Clock size={9} />
                        {dest.estimatedArrival} - {dest.departureTime}
                      </div>

                      <div style={{
                        fontSize: 13, fontWeight: 600, color: '#0F3D5E',
                        lineHeight: 1.3, marginBottom: 4,
                      }}>
                        {lang === 'vi' ? dest.nameVi : dest.nameEn}
                      </div>

                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        flexWrap: 'wrap',
                      }}>
                        <span style={{
                          fontSize: 9, padding: '1px 5px', borderRadius: 3,
                          background: '#EBF5FB', color: '#0F3D5E', fontWeight: 600,
                        }}>
                          {typeLabels[dest.type]?.[lang] ?? dest.type}
                        </span>
                        <span style={{
                          fontSize: 9, padding: '1px 5px', borderRadius: 3,
                          background: '#E8F8F0', color: '#27AE60', fontWeight: 600,
                        }}>
                          {lang === 'vi' ? `${dest.visitDuration} ph` : `${dest.visitDuration} min`}
                        </span>
                        <span style={{
                          fontSize: 9, color: '#5d7a8c', fontWeight: 500,
                        }}>
                          {classificationLabels[dest.classification as keyof typeof classificationLabels]?.[lang] ?? dest.classification}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                <div style={{
                  position: 'relative', marginTop: 8,
                  padding: '8px 10px', borderRadius: 6,
                  background: '#F0F4F8',
                }}>
                  <div style={{
                    position: 'absolute', left: -22, top: 9,
                    width: 20, height: 20, borderRadius: '50%',
                    background: '#27AE60', color: 'white',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 9,
                    fontWeight: 700, zIndex: 1,
                    boxShadow: '0 0 0 3px white',
                  }}>
                    <MapPin size={10} />
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#0F3D5E' }}>
                    {plan.endTime}
                  </div>
                  <div style={{ fontSize: 12, color: '#5d7a8c', fontWeight: 500 }}>
                    {lang === 'vi' ? 'Kết thúc' : 'Finish'}
                  </div>
                </div>
              </div>
            </>
          )}

          {!loading && plan && plan.totalSites === 0 && (
            <div style={{
              padding: '20px', textAlign: 'center', color: '#5d7a8c', fontSize: 13,
            }}>
              {lang === 'vi'
                ? 'Không có đủ di tích hợp lệ để tạo lịch trình.'
                : 'Not enough valid sites to generate an itinerary.'}
            </div>
          )}
        </div>

        <div style={{ display: 'none' }} className="trip-planner-print">
          {plan && plan.days.map(day => (
            <div key={day.day}>
              <h2 style={{ color: '#0F3D5E' }}>{lang === 'vi' ? 'Lịch trình' : 'Itinerary'}</h2>
              {day.destinations.map(d => (
                <div key={d.siteId} style={{ marginBottom: 8, padding: 8, background: '#F0F4F8', borderRadius: 6 }}>
                  <strong>{d.order}. {lang === 'vi' ? d.nameVi : d.nameEn}</strong><br />
                  <span style={{ color: '#5d7a8c', fontSize: 12 }}>
                    {typeLabels[d.type]?.[lang] ?? d.type} — {d.estimatedArrival} - {d.departureTime}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes trip-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 767px) {
          .trip-planner-label { display: none; }
          .trip-planner-panel {
            width: 100% !important;
            max-width: 100% !important;
            left: 0 !important;
          }
          .trip-planner-btn {
            bottom: 116px !important;
            right: 8px !important;
          }
        }
        @media print {
          .trip-planner-print { display: block !important; }
        }
      `}</style>
    </>
  );
}

export { fmtDist, fmtTime };
