import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useLanguage } from './LanguageContext';
import { useTypeLabels, useClassificationLabels } from '../../presentation/hooks/useHeritageData';
import { classificationColors } from '../constants';
import { generateTripPlan } from '../services/tripPlannerService';
import type { HeritageSite } from '../../core/types';
import type { TripPlan, TripDestination } from '../services/tripPlannerService';
import { fmtDist, fmtTime } from '../services/tripPlannerService';
import {
  MapPin, Route, ChevronRight, ChevronLeft,
  RotateCcw, Navigation, Printer, Clipboard, Download,
  Sun, Clock
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

const DAY_OPTIONS = [1, 2, 3, 4, 5, 6, 7];
const PANEL_WIDTH = 360;

export function TripPlanner({
  heritageSites,
  plan,
  activeDay,
  onGenerate,
  onReset,
  onFocusSite,
  onDayChange,
}: TripPlannerProps) {
  const { lang } = useLanguage();
  const typeLabels = useTypeLabels();
  const classificationLabels = useClassificationLabels();

  const [numDays, setNumDays] = useState(1);
  const [panelOpen, setPanelOpen] = useState(false);
  const [copyMsg, setCopyMsg] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (copyMsg) {
      const t = setTimeout(() => setCopyMsg(''), 2500);
      return () => clearTimeout(t);
    }
  }, [copyMsg]);

  const activeItinerary = useMemo(() => {
    if (!plan) return null;
    return plan.days.find((d) => d.day === activeDay) ?? null;
  }, [plan, activeDay]);

  const handleGenerate = useCallback(() => {
    const tripPlan = generateTripPlan(heritageSites, numDays);
    onGenerate(tripPlan);
  }, [heritageSites, numDays, onGenerate]);

  const handleReset = useCallback(() => {
    setNumDays(1);
    onReset();
  }, [onReset]);

  const handleFocus = useCallback((siteId: string) => {
    onFocusSite(siteId);
  }, [onFocusSite]);

  const handlePrevDay = useCallback(() => {
    if (!plan) return;
    const prev = Math.max(1, activeDay - 1);
    if (prev !== activeDay && plan.days.some(d => d.day === prev)) {
      onDayChange(prev);
    }
  }, [plan, activeDay, onDayChange]);

  const handleNextDay = useCallback(() => {
    if (!plan) return;
    const next = activeDay + 1;
    if (plan.days.some(d => d.day === next)) {
      onDayChange(next);
    }
  }, [plan, activeDay, onDayChange]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleCopyToClipboard = useCallback(() => {
    if (!plan) return;
    const lines: string[] = [];
    lines.push(lang === 'vi' ? 'LỊCH TRÌNH THAM QUAN' : 'TRIP ITINERARY');
    lines.push('='.repeat(40));
    lines.push('');
    for (const day of plan.days) {
      lines.push(lang === 'vi' ? `Ngày ${day.day}` : `Day ${day.day}`);
      lines.push('-'.repeat(20));
      for (const d of day.destinations) {
        const name = lang === 'vi' ? d.nameVi : d.nameEn;
        const typeLabel = typeLabels[d.type]?.[lang] ?? d.type;
        lines.push(`  ${d.order}. ${name} (${typeLabel}) - ${d.estimatedArrival}`);
      }
      lines.push(`  ${lang === 'vi' ? 'Khoảng cách:' : 'Distance:'} ${fmtDist(day.totalDistance)}`);
      lines.push(`  ${lang === 'vi' ? 'Thời gian:' : 'Duration:'} ${fmtTime(day.totalDuration)}`);
      lines.push('');
    }
    lines.push(`${lang === 'vi' ? 'Tổng khoảng cách:' : 'Total distance:'} ${fmtDist(plan.totalDistance)}`);
    lines.push(`${lang === 'vi' ? 'Tổng thời gian:' : 'Total duration:'} ${fmtTime(plan.totalDuration)}`);
    lines.push(`${lang === 'vi' ? 'Tổng số di tích:' : 'Total sites:'} ${plan.totalSites}`);

    navigator.clipboard.writeText(lines.join('\n')).then(
      () => setCopyMsg(lang === 'vi' ? 'Đã sao chép!' : 'Copied!'),
      () => setCopyMsg(lang === 'vi' ? 'Sao chép thất bại' : 'Copy failed'),
    );
  }, [plan, lang, typeLabels]);

  const handleExportPdf = useCallback(() => {
    const printWin = window.open('', '_blank');
    if (!printWin || !plan) return;
    const lines: string[] = [];
    for (const day of plan.days) {
      lines.push(`<h2 style="color:#0F3D5E;border-bottom:2px solid ${day.color};padding-bottom:4px;">${lang === 'vi' ? `Ngày ${day.day}` : `Day ${day.day}`}</h2>`);
      lines.push('<ol style="margin:8px 0 12px;padding-left:20px;">');
      for (const d of day.destinations) {
        const name = lang === 'vi' ? d.nameVi : d.nameEn;
        const typeLabel = typeLabels[d.type]?.[lang] ?? d.type;
        const classLabel = classificationLabels[d.classification as keyof typeof classificationLabels]?.[lang] ?? d.classification;
        lines.push(`<li style="margin-bottom:4px;"><strong>${name}</strong> — ${typeLabel} (${classLabel}) <span style="color:#5d7a8c;font-size:12px;">— ${d.estimatedArrival}</span></li>`);
      }
      lines.push('</ol>');
      lines.push(`<p style="font-size:12px;color:#5d7a8c;">${lang === 'vi' ? 'Khoảng cách:' : 'Distance:'} ${fmtDist(day.totalDistance)} &middot; ${lang === 'vi' ? 'Thời gian:' : 'Duration:'} ${fmtTime(day.totalDuration)}</p>`);
    }
    lines.push(`<hr/><p style="font-size:13px;font-weight:600;">${lang === 'vi' ? 'Tổng:' : 'Total:'} ${fmtDist(plan.totalDistance)} &middot; ${fmtTime(plan.totalDuration)} &middot; ${plan.totalSites} ${lang === 'vi' ? 'di tích' : 'sites'}</p>`);

    printWin.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${lang === 'vi' ? 'Lịch trình tham quan' : 'Trip Itinerary'}</title><style>body{font-family:sans-serif;max-width:700px;margin:0 auto;padding:24px;color:#1a2332;}ol li{line-height:1.6;}@media print{body{padding:0;}}</style></head><body>${lines.join('\n')}</body></html>`);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => { printWin.print(); }, 300);
  }, [plan, lang, typeLabels, classificationLabels]);

  const handleClose = useCallback(() => {
    setPanelOpen(false);
  }, []);

  const hasPrev = plan && plan.days.some(d => d.day === activeDay - 1);
  const hasNext = plan && plan.days.some(d => d.day === activeDay + 1);

  if (!panelOpen) {
    return (
      <button
        onClick={() => setPanelOpen(true)}
        aria-label={lang === 'vi' ? 'Lập lịch trình' : 'Trip Planner'}
        title={lang === 'vi' ? 'Lập lịch trình' : 'Trip Planner'}
        className="trip-planner-btn"
        style={{
          position: 'absolute',
          bottom: 60,
          left: 16,
          zIndex: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '10px 16px',
          borderRadius: 8,
          background: '#0F3D5E',
          border: 'none',
          color: 'white',
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(15,61,94,0.35)',
          fontFamily: 'inherit',
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(15,61,94,0.45)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(15,61,94,0.35)';
        }}
      >
        <Route size={16} />
        <span className="trip-planner-label">
          {lang === 'vi' ? 'Lập lịch trình' : 'Trip Planner'}
        </span>
      </button>
    );
  }

  return (
    <>
      <button
        onClick={handleClose}
        aria-label={lang === 'vi' ? 'Đóng lịch trình' : 'Close planner'}
        title={lang === 'vi' ? 'Đóng lịch trình' : 'Close planner'}
        style={{
          position: 'absolute',
          bottom: 60,
          left: 16,
          zIndex: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 12px',
          borderRadius: 8,
          background: '#5d7a8c',
          border: 'none',
          color: 'white',
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          fontFamily: 'inherit',
        }}
      >
        <ChevronRight size={14} />
        <span>{lang === 'vi' ? 'Đóng' : 'Close'}</span>
      </button>

      <div ref={panelRef} className="trip-planner-panel" style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: PANEL_WIDTH,
        maxWidth: '100%',
        height: '100%',
        zIndex: 15,
        background: 'white',
        boxShadow: '-4px 0 16px rgba(0,0,0,0.12)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Be Vietnam Pro', sans-serif",
      }}>
        {/* Header */}
        <div style={{
          padding: '12px 14px',
          background: '#0F3D5E',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Route size={16} color="#D4A017" />
            <span style={{ color: 'white', fontSize: 14, fontWeight: 700 }}>
              {lang === 'vi' ? 'Lập lịch trình' : 'Trip Planner'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={handleReset}
              title={lang === 'vi' ? 'Đặt lại' : 'Reset'}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: 'rgba(255,255,255,0.7)',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: 4,
                fontSize: 11,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontFamily: 'inherit',
              }}
            >
              <RotateCcw size={11} />
              {lang === 'vi' ? 'Đặt lại' : 'Reset'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 14px' }}>
          {/* Pre-generation: day selector */}
          {!plan && (
            <div>
              <label style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 700,
                color: '#0F3D5E',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginBottom: 8,
              }}>
                {lang === 'vi' ? 'Thời gian' : 'Trip Duration'}
              </label>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {DAY_OPTIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setNumDays(d)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 6,
                      border: numDays === d ? '2px solid #0F3D5E' : '1px solid rgba(15,61,94,0.15)',
                      background: numDays === d ? '#EBF5FB' : 'white',
                      color: numDays === d ? '#0F3D5E' : '#5d7a8c',
                      fontSize: 12,
                      fontWeight: numDays === d ? 700 : 500,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      minWidth: 36,
                      textAlign: 'center',
                    }}
                  >
                    {d}{lang === 'vi' ? ' ngày' : 'd'}
                  </button>
                ))}
              </div>
              <div style={{
                marginTop: 10,
                padding: '8px 10px',
                borderRadius: 6,
                background: '#F0F4F8',
                fontSize: 11,
                color: '#5d7a8c',
                lineHeight: 1.5,
              }}>
                <div style={{ fontWeight: 600, color: '#0F3D5E', marginBottom: 2 }}>
                  {lang === 'vi' ? 'Điểm xuất phát' : 'Starting Point'}
                </div>
                <div>{lang === 'vi' ? 'UBND xã Vân Đình' : 'Van Dinh Commune PC'}</div>
                <div style={{ fontSize: 10, color: '#5d7a8c', marginTop: 2 }}>
                  {lang === 'vi' ? '(Điểm xuất phát cố định)' : '(Fixed starting location)'}
                </div>
              </div>
              <button
                onClick={handleGenerate}
                style={{
                  width: '100%',
                  marginTop: 10,
                  padding: '10px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#D4A017',
                  color: 'white',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  fontFamily: 'inherit',
                  boxShadow: '0 3px 8px rgba(212,160,23,0.3)',
                }}
              >
                <Navigation size={14} />
                {lang === 'vi' ? 'Tạo lịch trình' : 'Generate Trip'}
              </button>
            </div>
          )}

          {/* Post-generation */}
          {plan && (
            <>
              {/* Trip Summary Card */}
              <div style={{
                padding: '10px 12px',
                borderRadius: 8,
                background: 'linear-gradient(135deg, #0F3D5E 0%, #1A5276 100%)',
                color: 'white',
                marginBottom: 10,
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sun size={14} />
                  {lang === 'vi' ? 'Tổng quan lịch trình' : 'Trip Summary'}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', fontSize: 11 }}>
                  <span>{lang === 'vi' ? 'Số ngày:' : 'Days:'}</span>
                  <span style={{ fontWeight: 600, textAlign: 'right' }}>{plan.days.length}</span>
                  <span>{lang === 'vi' ? 'Di tích:' : 'Sites:'}</span>
                  <span style={{ fontWeight: 600, textAlign: 'right' }}>{plan.totalSites}</span>
                  <span>{lang === 'vi' ? 'Tổng KC:' : 'Total Dist:'}</span>
                  <span style={{ fontWeight: 600, textAlign: 'right' }}>{fmtDist(plan.totalDistance)}</span>
                  <span>{lang === 'vi' ? 'Tổng TG:' : 'Total Time:'}</span>
                  <span style={{ fontWeight: 600, textAlign: 'right' }}>{fmtTime(plan.totalDuration)}</span>
                </div>
              </div>

              {/* Export buttons */}
              <div style={{ display: 'flex', gap: 4, marginBottom: 10, flexWrap: 'wrap' }}>
                <button
                  onClick={handlePrint}
                  title={lang === 'vi' ? 'In lịch trình' : 'Print itinerary'}
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
                <button
                  onClick={handleExportPdf}
                  title={lang === 'vi' ? 'Xuất PDF' : 'Export PDF'}
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
                <button
                  onClick={handleCopyToClipboard}
                  title={lang === 'vi' ? 'Sao chép' : 'Copy to clipboard'}
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
                    <span style={{ position: 'absolute', top: -20, right: 0, fontSize: 9, color: '#27AE60', fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {copyMsg}
                    </span>
                  ) : null}
                  {lang === 'vi' ? 'Sao chép' : 'Copy'}
                </button>
              </div>

              {/* Day tabs */}
              <div style={{
                display: 'flex',
                gap: 4,
                marginBottom: 8,
                flexWrap: 'wrap',
                alignItems: 'center',
              }}>
                {plan.days.map((day) => (
                  <button
                    key={day.day}
                    onClick={() => onDayChange(day.day)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 5,
                      border: activeDay === day.day ? `2px solid ${day.color}` : '1px solid rgba(15,61,94,0.12)',
                      background: activeDay === day.day ? '#EBF5FB' : 'white',
                      color: activeDay === day.day ? day.color : '#5d7a8c',
                      fontSize: 11,
                      fontWeight: activeDay === day.day ? 700 : 500,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                    }}
                  >
                    <span style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: day.color, display: 'inline-block', flexShrink: 0,
                    }} />
                    {lang === 'vi' ? `Ngày ${day.day}` : `Day ${day.day}`}
                    <span style={{ fontSize: 9, opacity: 0.7 }}>({day.destinations.length})</span>
                  </button>
                ))}
              </div>

              {/* Previous / Next day navigation */}
              {activeItinerary && (
                <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                  <button
                    onClick={handlePrevDay}
                    disabled={!hasPrev}
                    style={{
                      flex: 1, padding: '5px 8px', borderRadius: 5,
                      border: '1px solid rgba(15,61,94,0.12)',
                      background: hasPrev ? 'white' : '#F0F4F8',
                      color: hasPrev ? '#0F3D5E' : '#cbced4',
                      fontSize: 11, fontWeight: 600, cursor: hasPrev ? 'pointer' : 'not-allowed',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                      fontFamily: 'inherit',
                    }}
                  >
                    <ChevronLeft size={12} />
                    {lang === 'vi' ? 'Ngày trước' : 'Previous'}
                  </button>
                  <button
                    onClick={handleNextDay}
                    disabled={!hasNext}
                    style={{
                      flex: 1, padding: '5px 8px', borderRadius: 5,
                      border: '1px solid rgba(15,61,94,0.12)',
                      background: hasNext ? 'white' : '#F0F4F8',
                      color: hasNext ? '#0F3D5E' : '#cbced4',
                      fontSize: 11, fontWeight: 600, cursor: hasNext ? 'pointer' : 'not-allowed',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                      fontFamily: 'inherit',
                    }}
                  >
                    {lang === 'vi' ? 'Ngày tiếp' : 'Next'}
                    <ChevronRight size={12} />
                  </button>
                </div>
              )}

              {/* Daily Summary Card */}
              {activeItinerary && (
                <div style={{
                  padding: '8px 10px',
                  borderRadius: 6,
                  background: '#F0F4F8',
                  marginBottom: 10,
                  display: 'flex',
                  gap: 12,
                  fontSize: 11,
                  color: '#5d7a8c',
                  borderLeft: `3px solid ${activeItinerary.color}`,
                }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#0F3D5E', marginBottom: 1 }}>
                      {lang === 'vi' ? 'Điểm' : 'Sites'}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: activeItinerary.color }}>
                      {activeItinerary.destinations.length}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#0F3D5E', marginBottom: 1 }}>
                      {lang === 'vi' ? 'KC' : 'Dist'}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: activeItinerary.color }}>
                      {fmtDist(activeItinerary.totalDistance)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#0F3D5E', marginBottom: 1 }}>
                      {lang === 'vi' ? 'TG' : 'Time'}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: activeItinerary.color }}>
                      {fmtTime(activeItinerary.totalDuration)}
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline */}
              {activeItinerary && (
                <div>
                  <div style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: activeItinerary.color,
                    marginBottom: 8,
                    paddingBottom: 4,
                    borderBottom: `2px solid ${activeItinerary.color}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}>
                    <MapPin size={13} />
                    {lang === 'vi'
                      ? `Ngày ${activeItinerary.day} - ${activeItinerary.destinations.length} điểm`
                      : `Day ${activeItinerary.day} - ${activeItinerary.destinations.length} stops`}
                  </div>

                  {/* Vertical timeline */}
                  <div style={{ position: 'relative', paddingLeft: 28 }}>
                    {/* Vertical line */}
                    <div style={{
                      position: 'absolute',
                      left: 11,
                      top: 4,
                      bottom: 4,
                      width: 2,
                      background: activeItinerary.color,
                      opacity: 0.3,
                      borderRadius: 1,
                    }} />

                    {activeItinerary.destinations.map((dest, idx) => (
                      <div
                        key={dest.siteId}
                        onClick={() => handleFocus(dest.siteId)}
                        style={{
                          position: 'relative',
                          marginBottom: idx < activeItinerary.destinations.length - 1 ? 6 : 0,
                          padding: '8px 8px 8px 0',
                          borderRadius: 6,
                          cursor: 'pointer',
                          transition: 'background 0.15s',
                          marginLeft: 4,
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#F0F4F8'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        {/* Numbered circle */}
                        <div style={{
                          position: 'absolute',
                          left: -22,
                          top: 8,
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          background: activeItinerary.color,
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 10,
                          fontWeight: 700,
                          zIndex: 1,
                          boxShadow: `0 0 0 3px white`,
                        }}>
                          {dest.order}
                        </div>

                        {/* Content */}
                        <div style={{ marginLeft: 0 }}>
                          {/* Arrival time */}
                          <div style={{
                            fontSize: 9,
                            color: '#5d7a8c',
                            fontWeight: 600,
                            marginBottom: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                          }}>
                            <Clock size={9} />
                            {dest.estimatedArrival}
                          </div>

                          {/* Heritage name */}
                          <div style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: '#0F3D5E',
                            lineHeight: 1.3,
                            marginBottom: 4,
                          }}>
                            {lang === 'vi' ? dest.nameVi : dest.nameEn}
                          </div>

                          {/* Badges row */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                            <span style={{
                              fontSize: 9,
                              padding: '1px 5px',
                              borderRadius: 3,
                              background: '#EBF5FB',
                              color: '#0F3D5E',
                              fontWeight: 600,
                            }}>
                              {typeLabels[dest.type]?.[lang] ?? dest.type}
                            </span>
                            <span style={{
                              fontSize: 9,
                              padding: '1px 5px',
                              borderRadius: 3,
                              background: classificationColors[dest.classification as keyof typeof classificationColors] + '22',
                              color: classificationColors[dest.classification as keyof typeof classificationColors],
                              fontWeight: 600,
                            }}>
                              {classificationLabels[dest.classification as keyof typeof classificationLabels]?.[lang] ?? dest.classification}
                            </span>
                            <span style={{
                              fontSize: 9,
                              color: '#5d7a8c',
                              fontWeight: 500,
                            }}>
                              {fmtDist(dest.distanceFromPrev)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Day distance summary */}
                  <div style={{
                    marginTop: 8,
                    padding: '8px 10px',
                    borderRadius: 6,
                    background: '#F0F4F8',
                    fontSize: 11,
                    color: '#5d7a8c',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}>
                    <span>{lang === 'vi' ? 'Khoảng cách:' : 'Distance:'} <strong style={{ color: '#0F3D5E' }}>{fmtDist(activeItinerary.totalDistance)}</strong></span>
                    <span>{lang === 'vi' ? 'Thời gian:' : 'Duration:'} <strong style={{ color: '#0F3D5E' }}>{fmtTime(activeItinerary.totalDuration)}</strong></span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Hidden printable content */}
        <div style={{ display: 'none' }} className="trip-planner-print">
          {plan && (
            <div>
              <h1>{lang === 'vi' ? 'LỊCH TRÌNH THAM QUAN' : 'TRIP ITINERARY'}</h1>
              <p>{lang === 'vi' ? `Tổng số: ${plan.totalSites} di tích, ${plan.days.length} ngày` : `Total: ${plan.totalSites} sites, ${plan.days.length} days`}</p>
              {plan.days.map(day => (
                <div key={day.day}>
                  <h2>{lang === 'vi' ? `Ngày ${day.day}` : `Day ${day.day}`}</h2>
                  <ol>
                    {day.destinations.map(d => (
                      <li key={d.siteId}>
                        {lang === 'vi' ? d.nameVi : d.nameEn} — {typeLabels[d.type]?.[lang] ?? d.type} — {d.estimatedArrival}
                      </li>
                    ))}
                  </ol>
                  <p>{lang === 'vi' ? `Khoảng cách: ${fmtDist(day.totalDistance)}` : `Distance: ${fmtDist(day.totalDistance)}`} | {lang === 'vi' ? `Thời gian: ${fmtTime(day.totalDuration)}` : `Duration: ${fmtTime(day.totalDuration)}`}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
@media (max-width: 767px) {
  .trip-planner-label { display: none; }
  .trip-planner-panel {
    width: 100% !important;
    max-width: 100% !important;
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
