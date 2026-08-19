import { useState, useEffect, useRef } from 'react';
import { useLanguage } from './LanguageContext';
import { LazyImage } from './LazyImage';
import { useSystemSettings } from './SystemSettingsContext';
import { useHeritageSites, useIntangibleHeritage, useClassificationLabels, useTypeLabels } from '../../presentation/hooks/useHeritageData';
import { useMemorialSites } from '../../presentation/hooks/useMemorialSiteData';
import { classificationColors, classificationBackgrounds, intangibleCategoryIcons } from '../constants';
import { memorialCategoryIcons, memorialClassificationBackgrounds, memorialClassificationColors } from '../constants/memorial';
import { getImageUrl } from '../utils/url';
import { sanitizeLocation } from '../utils/uiText';
import {
  Search, Building2, Star, Award, LayoutGrid, BookOpen,
  Play, ArrowRight, ChevronRight, Eye, MapPin, Calendar,
  ChevronDown, Landmark, Sparkles, Compass,
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string, id?: string, searchQuery?: string) => void;
}

/* ── Default hero background (final fallback when no background is configured) ── */
const DEFAULT_HERO_BACKGROUND = 'https://images.unsplash.com/photo-1723065195938-30a5e64036e8?w=1920&h=1080&fit=crop&auto=format';

/* ── Count-up number for stats ─────────────────────────────── */
function useCountUp(target: number, started: boolean, duration = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!started) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, target, duration]);
  return value;
}

/* ── Decorative lotus ornament (inline SVG) ────────────────── */
function LotusOrnament({ size = 88, opacity = 0.6 }: { size?: number; opacity?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }} aria-hidden="true">
      <path d="M32 8 Q40 22 32 34 Q24 22 32 8Z" stroke="#D4A017" strokeWidth="1.3" opacity={opacity} fill="none" />
      <path d="M6 32 Q20 40 32 32 Q20 24 6 32Z" stroke="#D4A017" strokeWidth="1.3" opacity={opacity} fill="none" />
      <path d="M58 32 Q44 40 32 32 Q44 24 58 32Z" stroke="#D4A017" strokeWidth="1.3" opacity={opacity} fill="none" />
      <path d="M32 56 Q40 42 32 30 Q24 42 32 56Z" stroke="#D4A017" strokeWidth="1.3" opacity={opacity} fill="none" />
      <circle cx="32" cy="32" r="2.4" fill="#D4A017" opacity={opacity} />
    </svg>
  );
}

/* ── Decorative digital-map node network (hero side panels) ── */
function MapNodeNetwork({
  mirror = false,
  labelTop = 'VÂN ĐÌNH · HÀ NỘI',
  labelBottom = '20.8522°N · 105.7632°E',
}: { mirror?: boolean; labelTop?: string; labelBottom?: string }) {
  const w = 150;
  return (
    <svg width={w} height={250} viewBox={`0 0 ${w} 250`} fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }} aria-hidden="true">
      <g transform={mirror ? `scale(-1, 1) translate(-${w}, 0)` : undefined}>
        {/* Faint topographic contour lines */}
        <path d="M6 24 C 44 6, 112 14, 144 2" stroke="rgba(212,160,23,0.5)" strokeWidth="1" strokeLinecap="round" />
        <path d="M6 48 C 44 30, 112 38, 144 26" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" strokeLinecap="round" />
        <path d="M6 72 C 44 54, 112 62, 144 50" stroke="rgba(212,160,23,0.42)" strokeWidth="0.8" strokeLinecap="round" />
        <path d="M6 196 C 54 218, 106 212, 144 226" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" strokeLinecap="round" />
        <path d="M6 222 C 54 240, 106 234, 144 244" stroke="rgba(212,160,23,0.35)" strokeWidth="0.7" strokeLinecap="round" />
        {/* Map-node connections */}
        <line x1="22" y1="112" x2="54" y2="96" stroke="rgba(255,255,255,0.55)" strokeWidth="1" />
        <line x1="54" y1="96" x2="86" y2="128" stroke="rgba(255,255,255,0.45)" strokeWidth="1" strokeDasharray="3 4" />
        <line x1="86" y1="128" x2="118" y2="104" stroke="rgba(212,160,23,0.6)" strokeWidth="1" />
        <line x1="118" y1="104" x2="136" y2="148" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" strokeDasharray="2 4" />
        {/* Fine dotted route */}
        <path d="M6 164 C 36 148, 76 172, 108 156 S 138 148, 144 138" stroke="rgba(255,255,255,0.5)" strokeWidth="1" strokeDasharray="1 6" strokeLinecap="round" />
        {/* Heritage map pin */}
        <path d="M128 16 C 121.5 23.5, 121.5 32, 128 41 C 134.5 32, 134.5 23.5, 128 16 Z" fill="#D4A017" opacity="0.9" />
        <circle cx="128" cy="26" r="2.1" fill="#0F3D5E" />
        {/* Map nodes */}
        <circle cx="22" cy="112" r="3.2" fill="#D4A017" />
        <circle cx="54" cy="96" r="2" fill="rgba(255,255,255,0.9)" />
        <circle className="hero-map-node" cx="86" cy="128" r="3.8" fill="#D4A017" />
        <circle cx="118" cy="104" r="2.2" fill="rgba(255,255,255,0.8)" />
        <circle cx="136" cy="148" r="2.4" fill="none" stroke="rgba(212,160,23,0.85)" strokeWidth="1" />
        <circle cx="126" cy="80" r="1.8" fill="rgba(255,255,255,0.6)" />
      </g>
      {/* Cartographic labels (kept upright, never mirrored) */}
      <text x="2" y="12" fill="rgba(255,255,255,0.5)" fontSize="8.5" letterSpacing="2.2" fontFamily="'JetBrains Mono', Consolas, monospace">{labelTop}</text>
      <text x="2" y="244" fill="rgba(212,160,23,0.65)" fontSize="8.5" letterSpacing="1.4" fontFamily="'JetBrains Mono', Consolas, monospace">{labelBottom}</text>
    </svg>
  );
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { lang, t } = useLanguage();
  const { settings } = useSystemSettings();
  const [searchQuery, setSearchQuery] = useState('');
  const [statsStarted, setStatsStarted] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  const bgType = settings?.homeBackgroundType === 'video' ? 'video' : 'image';
  const bgImageUrl = settings?.homeBackgroundImageUrl || '';
  const bgVideoUrl = settings?.homeBackgroundVideoUrl || '';
  const bgPosterUrl = settings?.homeBackgroundVideoPosterUrl || '';

  useEffect(() => {
    setVideoFailed(false);
  }, [bgVideoUrl, bgType]);

  const { data: heritageSites, loading: sitesLoading } = useHeritageSites();
  const { data: intangibleHeritage } = useIntangibleHeritage();
  const { data: memorialResult, loading: memorialSitesLoading, error: memorialSitesError } = useMemorialSites({ page: 1, pageSize: 100 });
  const memorialSites = memorialResult.data;
  const classificationLabels = useClassificationLabels();
  const typeLabels = useTypeLabels();

  /* Scroll-triggered reveal + stats count-up */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = root.querySelectorAll('.reveal');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-revealed');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [heritageSites, intangibleHeritage, memorialSites]);

  useEffect(() => {
    const stats = statsRef.current;
    if (!stats) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setStatsStarted(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.3 },
    );
    io.observe(stats);
    return () => io.disconnect();
  }, []);

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
    const q = searchQuery.trim();
    if (q) onNavigate('relics', undefined, q);
  };

  const cultureValues = [
    {
      icon: <Landmark size={24} />,
      titleVi: 'Lịch sử & Kiến trúc',
      titleEn: 'History & Architecture',
      textVi: 'Hệ thống đình, chùa, đền, miếu cổ kính ghi dấu bao thế hệ.',
      textEn: 'Ancient communal houses, pagodas and temples of generations past.',
    },
    {
      icon: <Sparkles size={24} />,
      titleVi: 'Tín ngưỡng & Lễ hội',
      titleEn: 'Beliefs & Festivals',
      textVi: 'Những nghi lễ truyền thống linh thiêng của làng quê Vân Đình.',
      textEn: 'Sacred traditional rituals of Van Dinh countryside.',
    },
    {
      icon: <BookOpen size={24} />,
      titleVi: 'Tri thức dân gian',
      titleEn: 'Folk Knowledge',
      textVi: 'Ẩm thực, nghề truyền thống và trí tuệ dân gian được trao truyền.',
      textEn: 'Cuisine, crafts and folk wisdom passed down the generations.',
    },
    {
      icon: <Compass size={24} />,
      titleVi: 'Bảo tồn & Số hóa',
      titleEn: 'Preservation & Digitization',
      textVi: 'Chuyển đổi số giúp di sản được lưu giữ và lan tỏa mãi mãi.',
      textEn: 'Digital transformation preserves heritage for generations to come.',
    },
  ];

  const sectionHeading = (eyebrow: string, title: string, subtitle?: string) => (
    <div className="reveal" style={{ textAlign: 'center', marginBottom: 36 }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span style={{ width: 32, height: 1.5, background: 'linear-gradient(90deg, transparent, #D4A017)' }} />
        <span style={{ color: '#B8860B', fontSize: 'clamp(11px, 2.5vw, 12px)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2 }}>
          {eyebrow}
        </span>
        <span style={{ width: 32, height: 1.5, background: 'linear-gradient(90deg, #D4A017, transparent)' }} />
      </div>
      <h2 className="text-responsive-h2" style={{ color: '#0F3D5E', fontSize: 'clamp(24px, 4vw, 32px)', fontFamily: 'Merriweather, serif', fontWeight: 800, margin: '0 0 10px' }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{ color: '#5d7a8c', fontSize: 'clamp(13px, 2.5vw, 15px)', maxWidth: 620, margin: '0 auto', paddingLeft: 8, paddingRight: 8, lineHeight: 1.7 }}>
          {subtitle}
        </p>
      )}
      <div className="culture-trail" style={{ justifyContent: 'center', marginTop: 14 }}>
        <span className="ornament-diamond" />
      </div>
    </div>
  );

  return (
    <div ref={rootRef} style={{ background: 'white' }}>
      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="hero-section" style={{ position: 'relative', minHeight: 'clamp(560px, 88vh, 780px)', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
        {/* Heritage background media layer (configurable via Settings; falls back to default Unsplash) */}
        {bgType === 'video' && bgVideoUrl && !videoFailed ? (
          <video
            src={getImageUrl(bgVideoUrl)}
            poster={bgPosterUrl ? getImageUrl(bgPosterUrl) : undefined}
            autoPlay muted loop playsInline
            onError={() => setVideoFailed(true)}
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center', pointerEvents: 'none',
              filter: 'brightness(0.9) saturate(1.12) contrast(1.02)',
            }}
          />
        ) : (
          <div className="kenburns" style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${videoFailed && bgPosterUrl ? getImageUrl(bgPosterUrl) : getImageUrl(bgImageUrl || DEFAULT_HERO_BACKGROUND)})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            filter: 'brightness(0.9) saturate(1.12) contrast(1.02)',
          }} />
        )}
        {/* Navy-to-transparent gradient (lighter overlay so the heritage image breathes) */}
        <div className="hero-scrim" style={{
          position: 'absolute', inset: 0,
          background:
            'linear-gradient(180deg, rgba(7,29,46,0.68) 0%, rgba(15,61,94,0.30) 36%, rgba(15,61,94,0.10) 62%, rgba(7,29,46,0) 100%),' +
            'radial-gradient(ellipse 78% 66% at 50% 47%, rgba(7,29,46,0.30) 0%, rgba(15,61,94,0.12) 52%, rgba(7,29,46,0) 100%)',
        }} />
        {/* Faint digital map grid + contours (subtle, never competes with the image) */}
        <div className="hero-digital-grid" style={{
          position: 'absolute', inset: 0, opacity: 0.08, pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='140' height='140' viewBox='0 0 140 140' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 46.7H140M0 93.3H140M46.7 0V140M93.3 0V140' stroke='%23FFFFFF' stroke-width='0.7'/%3E%3Cpath d='M0 23C36 0 104 46 140 23M0 70C36 47 104 93 140 70M0 117C36 94 104 140 140 117' stroke='%23FFFFFF' stroke-width='0.5' fill='none'/%3E%3Cpath d='M0 12C26 24 114 18 140 6M0 128C26 116 114 122 140 134' stroke='%23D4A017' stroke-width='0.5' fill='none'/%3E%3C/svg%3E")`,
          backgroundSize: '280px 280px',
        }} />
        {/* Drifting aurora blobs (toned down so the image stays dominant) */}
        <div className="hero-blob hero-blob-gold" style={{ width: 420, height: 420, top: '-10%', right: '6%', opacity: 0.7 }} />
        <div className="hero-blob hero-blob-navy" style={{ width: 380, height: 380, bottom: '-12%', left: '2%', animationDelay: '-6s', opacity: 0.6 }} />
        <div className="hero-blob hero-blob-teal" style={{ width: 300, height: 300, top: '30%', left: '38%', animationDelay: '-11s', opacity: 0.35 }} />
        {/* Lotus pattern veil (kept subtle at ~15%) */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.15,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 Q38 18 30 30 Q22 18 30 5Z' fill='none' stroke='%23D4A017' stroke-width='1'/%3E%3Cpath d='M5 30 Q18 38 30 30 Q18 22 5 30Z' fill='none' stroke='%23D4A017' stroke-width='1'/%3E%3Cpath d='M55 30 Q42 38 30 30 Q42 22 55 30Z' fill='none' stroke='%23D4A017' stroke-width='1'/%3E%3Cpath d='M30 55 Q38 42 30 30 Q22 42 30 55Z' fill='none' stroke='%23D4A017' stroke-width='1'/%3E%3C/svg%3E")`,
        }} />
        {/* Central readability halo — soft, edgeless darkening behind hero text */}
        <div className="hero-content-halo" style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background:
            'radial-gradient(ellipse 34% 22% at 50% 38%, rgba(212,160,23,0.14) 0%, rgba(212,160,23,0) 70%),' +
            'radial-gradient(ellipse 66% 62% at 50% 47%, rgba(7,29,46,0.78) 0%, rgba(7,29,46,0.55) 40%, rgba(7,29,46,0.28) 66%, rgba(7,29,46,0) 80%)',
        }} />
        {/* Corner vignette */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 140% 120% at 50% 40%, transparent 52%, rgba(7,29,46,0.42) 100%)',
        }} />
        {/* Faint map crosshair markers (desktop only) */}
        <div className="hide-mobile" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {[
            { top: '24%', left: '13%', ring: 'rgba(212,160,23,0.45)' },
            { top: '68%', left: '78%', ring: 'rgba(255,255,255,0.3)' },
            { top: '72%', left: '26%', ring: 'rgba(212,160,23,0.4)' },
            { top: '30%', left: '84%', ring: 'rgba(255,255,255,0.25)' },
          ].map((m, i) => (
            <div key={i} className="map-crosshair" style={{ position: 'absolute', top: m.top, left: m.left, width: 30, height: 30, transform: 'translate(-50%, -50%)' }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `1px solid ${m.ring}` }} />
              <div style={{ position: 'absolute', top: '50%', left: -5, right: -5, height: 1, background: m.ring }} />
              <div style={{ position: 'absolute', left: '50%', top: -5, bottom: -5, width: 1, background: m.ring }} />
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 6, height: 6, borderRadius: '50%', background: '#D4A017', boxShadow: '0 0 10px rgba(212,160,23,0.8)' }} />
            </div>
          ))}
        </div>

        {/* Faint coordinate labels (desktop only) */}
        <div className="hide-mobile" style={{ position: 'absolute', top: 20, left: 22, pointerEvents: 'none', color: 'rgba(255,255,255,0.42)', fontSize: 10, letterSpacing: 1.6, fontFamily: '"JetBrains Mono", Consolas, monospace', lineHeight: 1.7 }}>
          20.8522°N · 105.7632°E
        </div>
        <div className="hide-mobile" style={{ position: 'absolute', bottom: 44, right: 22, pointerEvents: 'none', color: 'rgba(212,160,23,0.6)', fontSize: 10, letterSpacing: 1.8, fontFamily: '"JetBrains Mono", Consolas, monospace', lineHeight: 1.7, textAlign: 'right' }}>
          VÂN ĐÌNH · CHUƠNG MỸ · HÀ NỘI
        </div>

        {/* Digital-map side panels (large screens only) */}
        <div className="hide-mobile hero-side-panel" style={{ position: 'absolute', top: '50%', left: 'clamp(14px, 2vw, 34px)', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.9 }}>
          <MapNodeNetwork labelTop="VÂN ĐÌNH · HÀ NỘI" labelBottom="20.8522°N · 105.7632°E" />
        </div>
        <div className="hide-mobile hero-side-panel" style={{ position: 'absolute', top: '50%', right: 'clamp(14px, 2vw, 34px)', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.9 }}>
          <MapNodeNetwork mirror labelTop="DIGITAL HERITAGE MAP" labelBottom="BẢN ĐỒ DI SẢN SỐ" />
        </div>

        {/* Floating lotus ornaments (desktop only) */}
        <div className="hide-mobile bob-slow" style={{ position: 'absolute', top: '16%', left: '4%', opacity: 0.6, pointerEvents: 'none' }}>
          <LotusOrnament size={92} opacity={0.7} />
        </div>
        <div className="hide-mobile bob-slow" style={{ position: 'absolute', bottom: '14%', right: '4%', opacity: 0.55, pointerEvents: 'none', animationDelay: '-3s' }}>
          <LotusOrnament size={110} opacity={0.55} />
        </div>

        {/* Decorative gold border bottom */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, transparent, #D4A017 20%, #D4A017 80%, transparent)' }} />

        <div className="hero-content fade-up" style={{ position: 'relative', width: '100%', maxWidth: 1280, margin: '0 auto', padding: '96px 24px 120px', textAlign: 'center' }}>
          {/* Decorative top label */}
          <div className="reveal is-revealed" style={{
            display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 24,
            padding: '8px 20px', borderRadius: 30,
            background: 'rgba(212,160,23,0.16)', border: '1px solid rgba(212,160,23,0.45)',
            backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
            boxShadow: '0 4px 18px rgba(0,0,0,0.25)',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#D4A017', display: 'inline-block', boxShadow: '0 0 8px rgba(212,160,23,0.9)' }} />
            <span style={{ color: '#EBC55C', fontSize: 12, fontWeight: 600, letterSpacing: 1.4, textTransform: 'uppercase' }}>
              {lang === 'vi' ? 'Hệ thống quản lý di sản văn hóa' : 'Cultural Heritage Management System'}
            </span>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#D4A017', display: 'inline-block', boxShadow: '0 0 8px rgba(212,160,23,0.9)' }} />
          </div>

          <h1 className="text-responsive-hero fade-up-1" style={{
            color: 'white', fontSize: 'clamp(30px, 5vw, 58px)',
            fontFamily: 'Merriweather, serif', fontWeight: 900, marginBottom: 20, lineHeight: 1.16,
            textShadow: '0 2px 4px rgba(7,29,46,0.95), 0 10px 30px rgba(7,29,46,0.7), 0 4px 70px rgba(7,29,46,0.5)',
          }}>
            {lang === 'vi' ? (
              <>
                Bản đồ di sản số{' '}
                <span className="text-gold-gradient">Vân Đình</span>
              </>
            ) : (
              <>
                <span className="text-gold-gradient">Van Dinh</span> Digital Heritage Map
              </>
            )}
          </h1>
          <p className="fade-up-2" style={{ color: 'rgba(255,255,255,0.95)', fontSize: 'clamp(14px, 2.5vw, 17px)', maxWidth: 680, margin: '0 auto 22px', lineHeight: 1.75, paddingLeft: 8, paddingRight: 8, fontWeight: 500, textShadow: '0 2px 8px rgba(7,29,46,0.95), 0 4px 26px rgba(7,29,46,0.7)' }}>
            {t('site.subtitle')}
          </p>

          {/* Gold hairline ornament between subtitle and search */}
          <div className="fade-up-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 30 }}>
            <span style={{ width: 64, height: 1, background: 'linear-gradient(90deg, transparent, rgba(212,160,23,0.85))' }} />
            <span className="ornament-diamond" style={{ width: 7, height: 7 }} />
            <span style={{ width: 64, height: 1, background: 'linear-gradient(90deg, rgba(212,160,23,0.85), transparent)' }} />
          </div>

          {/* Search bar */}
          <div className="hero-search-bar fade-up-3" style={{ display: 'flex', maxWidth: 580, margin: '0 auto', gap: 0, boxShadow: '0 18px 50px rgba(7,29,46,0.4)', borderRadius: 60, border: '1.5px solid rgba(212,160,23,0.35)', overflow: 'hidden' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: '#5d7a8c' }} />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder={t('hero.search.placeholder')}
                style={{
                  width: '100%', padding: '15px 14px 15px 46px',
                  borderRadius: '60px 0 0 60px', border: 'none', outline: 'none',
                  fontSize: 'clamp(13px, 3.5vw, 14px)', background: 'rgba(255,255,255,0.97)',
                  boxSizing: 'border-box', color: '#1a2332',
                }}
              />
            </div>
            <button
              onClick={handleSearch}
              className="touch-target btn-gold-glow btn-shine"
              style={{
                padding: '0 30px', borderRadius: '0 60px 60px 0',
                background: 'linear-gradient(135deg, #E5B723, #B8860B)', border: 'none', color: 'white',
                fontSize: 'clamp(13px, 3.5vw, 14px)', fontWeight: 700, cursor: 'pointer',
                whiteSpace: 'nowrap', letterSpacing: 0.3,
              }}
            >
              {t('hero.search.btn')}
            </button>
          </div>

          {/* Quick nav chips */}
          <div className="fade-up-4" style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 28, flexWrap: 'wrap' }}>
            {[
              { label: t('nav.map'), page: 'map', icon: '🗺️' },
              { label: t('nav.relics'), page: 'relics', icon: '🏛️' },
              { label: t('nav.intangible'), page: 'intangible', icon: '🎭' },
              { label: lang === 'vi' ? 'Điểm lưu niệm cách mạng' : 'Memorial Sites', page: 'memorial-sites', icon: <Landmark size={15} /> },
            ].map(btn => (
              <button
                key={btn.page}
                onClick={() => onNavigate(btn.page)}
                className="touch-target glass-chip"
                style={{
                  padding: '9px 20px', borderRadius: 40,
                  color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                <span style={{ fontSize: 15 }}>{btn.icon}</span> {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scroll cue */}
        <div className="hide-mobile scroll-cue" style={{ position: 'absolute', bottom: 26, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.65)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textShadow: '0 2px 8px rgba(7,29,46,0.85)' }}>
          <span style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' }}>
            {lang === 'vi' ? 'Khám phá' : 'Explore'}
          </span>
          <ChevronDown size={18} style={{ color: '#D4A017' }} />
        </div>
      </section>

      {/* ═══════════════════ STATS ═══════════════════ */}
      <section style={{ background: 'white', padding: '0 16px' }}>
        <div
          ref={statsRef}
          className="stats-grid reveal is-revealed"
          style={{
            maxWidth: 1280, margin: '0 auto',
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 16, transform: 'translateY(-56px)',
          }}
        >
          {stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} started={statsStarted} />
          ))}
        </div>
      </section>

      {/* ═══════════════════ MAP PREVIEW ═══════════════════ */}
      <section style={{ background: '#F0F4F8', padding: '40px 24px 64px', marginTop: -32 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div className="map-preview-header reveal" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
            <div>
              <div style={{ color: '#B8860B', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.6, marginBottom: 6 }}>
                {lang === 'vi' ? 'Khám phá' : 'Explore'}
              </div>
              <h2 style={{ color: '#0F3D5E', fontSize: 'clamp(22px, 3.5vw, 28px)', fontFamily: 'Merriweather, serif', fontWeight: 800, margin: 0 }}>
                {t('map.title')}
              </h2>
            </div>
            <button
              onClick={() => onNavigate('map')}
              className="btn-navy-lift"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '11px 22px', borderRadius: 10,
                background: '#0F3D5E', border: 'none', color: 'white',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                boxShadow: '0 6px 18px rgba(15,61,94,0.3)',
              }}
            >
              {lang === 'vi' ? 'Mở bản đồ' : 'Open Map'} <ArrowRight size={14} />
            </button>
          </div>

          {/* Map preview */}
          <div
            onClick={() => onNavigate('map')}
            className="frame-corner reveal"
            style={{
              borderRadius: 18, overflow: 'hidden', cursor: 'pointer',
              boxShadow: '0 18px 50px rgba(15,61,94,0.22)',
              border: '3px solid rgba(212,160,23,0.35)',
              position: 'relative', height: 340,
              background: '#c8d8c0',
            }}
          >
            <LazyImage
              src="https://images.unsplash.com/photo-1758298135151-e1283f571030?w=1600&h=500&fit=crop&auto=format"
              alt={lang === 'vi' ? 'Bản đồ khu vực Vân Đình' : 'Van Dinh area map'}
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.62 }}
            />
            {/* Map overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(150deg, rgba(15,61,94,0.55) 0%, rgba(15,61,94,0.25) 55%, rgba(15,61,94,0.55) 100%)',
            }} />
            {/* Lotus pattern veil */}
            <div style={{
              position: 'absolute', inset: 0, opacity: 0.12,
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 Q38 18 30 30 Q22 18 30 5Z' fill='none' stroke='%23D4A017' stroke-width='1'/%3E%3Cpath d='M5 30 Q18 38 30 30 Q18 22 5 30Z' fill='none' stroke='%23D4A017' stroke-width='1'/%3E%3Cpath d='M55 30 Q42 38 30 30 Q42 22 55 30Z' fill='none' stroke='%23D4A017' stroke-width='1'/%3E%3Cpath d='M30 55 Q38 42 30 30 Q22 42 30 55Z' fill='none' stroke='%23D4A017' stroke-width='1'/%3E%3C/svg%3E")`,
            }} />
            {/* Fake markers with pulse */}
            {heritageSites.slice(0, 6).map((site, i) => {
              const x = 15 + (i * 14) % 70;
              const y = 20 + (i * 17) % 60;
              const col = site.classification === 'national' ? '#E74C3C' : site.classification === 'city' ? '#1A5276' : '#7F8C8D';
              return (
                <div key={site.id} style={{ position: 'absolute', left: `${x}%`, top: `${y}%` }}>
                  <div style={{ position: 'relative', width: 22, height: 22 }}>
                    {i === 0 && <span className="pin-pulse" />}
                    <div style={{
                      position: 'absolute', inset: 0, borderRadius: '50% 50% 50% 0',
                      transform: 'rotate(-45deg)',
                      background: col, boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
                      border: '2px solid white',
                    }} />
                  </div>
                </div>
              );
            })}
            {/* Click to open overlay */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="glass-chip" style={{
                padding: '14px 28px', borderRadius: 50,
                background: 'rgba(255,255,255,0.94)',
                display: 'flex', alignItems: 'center', gap: 10,
                boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
              }}>
                <MapPin size={18} style={{ color: '#D4A017' }} />
                <span style={{ color: '#0F3D5E', fontSize: 14, fontWeight: 700 }}>
                  {lang === 'vi' ? 'Nhấn để mở bản đồ tương tác' : 'Click to open interactive map'}
                </span>
                <ArrowRight size={15} style={{ color: '#B8860B' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ CULTURAL IDENTITY ═══════════════════ */}
      <section style={{ background: 'white', padding: 'clamp(40px, 5vw, 64px) 16px', position: 'relative' }}>
        <div className="paper-grid" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative' }}>
          {sectionHeading(
            lang === 'vi' ? 'Bản sắc' : 'Identity',
            lang === 'vi' ? 'Tinh hoa văn hóa Vân Đình' : 'The Essence of Van Dinh Culture',
            lang === 'vi'
              ? 'Mỗi di tích, mỗi phong tục là một trang sử sống động của mảnh đất ven sông Đáy.'
              : 'Every monument and custom tells a living story of the land by the Day River.',
          )}
          <div className="culture-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 20 }}>
            {cultureValues.map((c, i) => (
              <div key={i} className="reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
              <div
                className="culture-card"
                style={{
                  background: 'linear-gradient(160deg, #ffffff 0%, #F6F8FB 100%)',
                  borderRadius: 16, padding: '28px 24px',
                  border: '1px solid rgba(15,61,94,0.1)',
                  boxShadow: '0 4px 18px rgba(15,61,94,0.07)',
                  position: 'relative', overflow: 'hidden',
                }}
              >
                <div style={{ position: 'absolute', top: -30, right: -30, width: 90, height: 90, borderRadius: '50%', background: 'rgba(212,160,23,0.08)' }} />
                <div className="culture-icon" style={{
                  width: 52, height: 52, borderRadius: 14, marginBottom: 16,
                  background: 'linear-gradient(135deg, #E5B723, #B8860B)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', boxShadow: '0 8px 20px rgba(212,160,23,0.35)',
                }}>
                  {c.icon}
                </div>
                <h3 style={{ color: '#0F3D5E', fontSize: 15, fontWeight: 800, margin: '0 0 8px', fontFamily: 'Merriweather, serif' }}>
                  {lang === 'vi' ? c.titleVi : c.titleEn}
                </h3>
                <p style={{ color: '#5d7a8c', fontSize: 12.5, lineHeight: 1.65, margin: 0 }}>
                  {lang === 'vi' ? c.textVi : c.textEn}
                </p>
              </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ FEATURED HERITAGE ═══════════════════ */}
      <section style={{ background: '#F0F4F8', padding: 'clamp(48px, 6vw, 72px) 16px', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.05, pointerEvents: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 Q38 18 30 30 Q22 18 30 5Z' fill='none' stroke='%23D4A017' stroke-width='1'/%3E%3Cpath d='M5 30 Q18 38 30 30 Q18 22 5 30Z' fill='none' stroke='%23D4A017' stroke-width='1'/%3E%3Cpath d='M55 30 Q42 38 30 30 Q42 22 55 30Z' fill='none' stroke='%23D4A017' stroke-width='1'/%3E%3Cpath d='M30 55 Q38 42 30 30 Q22 42 30 55Z' fill='none' stroke='%23D4A017' stroke-width='1'/%3E%3C/svg%3E")` }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative' }}>
          {sectionHeading(
            lang === 'vi' ? 'Di sản tiêu biểu' : 'Outstanding Heritage',
            t('featured.title'),
            t('featured.subtitle'),
          )}

          {sitesLoading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#5d7a8c', fontSize: 13 }}>
              {t('common.loading')}…
            </div>
          ) : (
            <div className="featured-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 26 }}>
              {heritageSites.slice(0, 6).map((site, idx) => (
                <div key={site.id} className="reveal" style={{ transitionDelay: `${(idx % 3) * 0.08}s` }}>
                <div
                  onClick={() => onNavigate('heritage-detail', site.id)}
                  className="hero-card card-accent-gold"
                  style={{
                    background: 'white', borderRadius: 16, overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(15,61,94,0.09)',
                    border: '1px solid rgba(15,61,94,0.08)',
                    cursor: 'pointer', transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-8px)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 24px 50px rgba(15,61,94,0.2)';
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(212,160,23,0.45)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(15,61,94,0.09)';
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(15,61,94,0.08)';
                  }}
                >
                  {/* Image */}
                  <div className="hero-card-media img-veil" style={{ position: 'relative', height: 190, overflow: 'hidden', background: '#dce8f0' }}>
                    <LazyImage
                      src={getImageUrl(site.image)}
                      alt={lang === 'vi' ? site.nameVi : site.nameEn}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                      position: 'absolute', top: 10, left: 10,
                      padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                      background: classificationBackgrounds[site.classification],
                      color: classificationColors[site.classification],
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    }}>
                      {classificationLabels[site.classification][lang]}
                    </div>
                    <div style={{
                      position: 'absolute', top: 8, right: 12,
                      fontFamily: 'Merriweather, serif', fontSize: 30, fontWeight: 900,
                      color: 'rgba(255,255,255,0.9)', textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                    }}>
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                  </div>
                  {/* Content */}
                  <div style={{ padding: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <span style={{
                        padding: '3px 9px', borderRadius: 5, fontSize: 11, fontWeight: 700,
                        background: '#EBF5FB', color: '#0F3D5E',
                      }}>
                        {typeLabels[site.type][lang]}
                      </span>
                      <span style={{ color: '#5d7a8c', fontSize: 11, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Calendar size={11} /> {site.yearBuilt}
                      </span>
                    </div>
                    <h3 style={{ color: '#0F3D5E', fontSize: 15.5, fontWeight: 800, margin: '0 0 6px', lineHeight: 1.35, fontFamily: 'Merriweather, serif' }}>
                      {lang === 'vi' ? site.nameVi : site.nameEn}
                    </h3>
                    <p style={{ color: '#5d7a8c', fontSize: 12.5, lineHeight: 1.55, margin: '0 0 14px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {lang === 'vi' ? sanitizeLocation(site.descriptionVi) : sanitizeLocation(site.descriptionEn)}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#5d7a8c', fontSize: 11 }}>
                        <MapPin size={11} style={{ color: '#B8860B' }} />
                        <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {lang === 'vi' ? 'Vân Đình, thành phố Hà Nội' : 'Van Dinh, Hanoi'}
                        </span>
                      </div>
                      <button className="btn-navy-lift" style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        padding: '6px 13px', borderRadius: 8,
                        background: '#0F3D5E', border: 'none', color: 'white',
                        fontSize: 11, fontWeight: 600, cursor: 'pointer',
                      }}>
                        <Eye size={11} /> {t('featured.viewprofile')}
                      </button>
                    </div>
                  </div>
                </div>
                </div>
              ))}
            </div>
          )}

          <div className="reveal" style={{ textAlign: 'center', marginTop: 36 }}>
            <button
              onClick={() => onNavigate('relics')}
              className="btn-outline-glow btn-shine"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '13px 30px', borderRadius: 10,
                border: '2px solid #0F3D5E', background: 'white',
                color: '#0F3D5E', fontSize: 14, fontWeight: 700, cursor: 'pointer',
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

      {/* ═══════════════════ INTANGIBLE HERITAGE ═══════════════════ */}
      <section style={{ background: 'white', padding: 'clamp(48px, 6vw, 72px) 16px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          {sectionHeading(
            lang === 'vi' ? 'Phi vật thể' : 'Intangible',
            t('intangible.title'),
            t('intangible.subtitle'),
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 26 }}>
            {intangibleHeritage.map((item, idx) => (
              <div key={item.id} className="reveal" style={{ transitionDelay: `${(idx % 3) * 0.08}s` }}>
              <div
                className="hero-card card-accent-gold"
                style={{
                  background: 'white', borderRadius: 16, overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(15,61,94,0.09)',
                  border: '1px solid rgba(15,61,94,0.08)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease', cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-8px)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 24px 50px rgba(15,61,94,0.18)';
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(212,160,23,0.45)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(15,61,94,0.09)';
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(15,61,94,0.08)';
                }}
              >
                <div className="hero-card-media img-veil" style={{ position: 'relative', height: 165, background: '#dce8f0', overflow: 'hidden' }}>
                  <LazyImage
                    src={getImageUrl(item.image)}
                    alt={lang === 'en' ? (item.nameEn || item.nameVi) : item.nameVi}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(15,61,94,0.05) 30%, rgba(15,61,94,0.55) 100%)' }} />
                  <div style={{
                    position: 'absolute', top: 10, left: 10,
                    padding: '4px 11px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                    background: 'linear-gradient(135deg, #E5B723, #B8860B)', color: 'white',
                    display: 'flex', alignItems: 'center', gap: 5,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                  }}>
                    <span>{intangibleCategoryIcons[item.category]}</span>
                    {t(`intangible.${item.category}`)}
                  </div>
                </div>
                <div style={{ padding: '18px' }}>
                  <h3 style={{ color: '#0F3D5E', fontSize: 14.5, fontWeight: 800, margin: '0 0 8px', lineHeight: 1.35 }}>
                    {lang === 'en' ? (item.nameEn || item.nameVi) : item.nameVi}
                  </h3>
                  <p style={{ color: '#5d7a8c', fontSize: 12.5, lineHeight: 1.55, margin: '0 0 14px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {lang === 'en' ? sanitizeLocation(item.descriptionEn || item.descriptionVi) : sanitizeLocation(item.descriptionVi)}
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {item.videoUrl ? (
                      <a href={item.videoUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                        padding: '7px 0', borderRadius: 8,
                        border: '1px solid #0F3D5E', background: 'white',
                        color: '#0F3D5E', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', textDecoration: 'none',
                      }}>
                        <Play size={11} /> {t('intangible.video')}
                      </a>
                    ) : (
                      <div style={{ flex: 1 }} />
                    )}
                    <button onClick={e => { e.stopPropagation(); onNavigate('intangible-detail', item.id); }} style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                      padding: '7px 0', borderRadius: 8,
                      background: '#0F3D5E', border: 'none',
                      color: 'white', fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
                    }}>
                      <Eye size={11} /> {t('intangible.detail')}
                    </button>
                  </div>
                </div>
              </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ MEMORIAL SITES (SKCMKC) ═══════════════════ */}
      <section style={{ background: '#F0F4F8', padding: 'clamp(48px, 6vw, 72px) 16px', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.05, pointerEvents: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 Q38 18 30 30 Q22 18 30 5Z' fill='none' stroke='%23D4A017' stroke-width='1'/%3E%3Cpath d='M5 30 Q18 38 30 30 Q18 22 5 30Z' fill='none' stroke='%23D4A017' stroke-width='1'/%3E%3Cpath d='M55 30 Q42 38 30 30 Q42 22 55 30Z' fill='none' stroke='%23D4A017' stroke-width='1'/%3E%3Cpath d='M30 55 Q38 42 30 30 Q22 42 30 55Z' fill='none' stroke='%23D4A017' stroke-width='1'/%3E%3C/svg%3E")` }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative' }}>
          {sectionHeading(
            lang === 'vi' ? 'Lưu niệm' : 'Memorial',
            t('memorial.title'),
            t('memorial.subtitle'),
          )}

          {memorialSitesLoading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#5d7a8c', fontSize: 13 }}>
              {t('common.loading')}…
            </div>
          ) : memorialSitesError ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#E74C3C', fontSize: 13 }}>
              {t('memorial.errorTitle')}
            </div>
          ) : !memorialSites || memorialSites.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#5d7a8c', fontSize: 13 }}>
              {t('memorial.empty')}
            </div>
          ) : (
            <>
              <div className="featured-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 26 }}>
                {memorialSites.slice(0, 6).map((item, idx) => (
                  <div key={item.id} className="reveal" style={{ transitionDelay: `${(idx % 3) * 0.08}s` }}>
                  <div
                    onClick={() => onNavigate('memorial-site-detail', item.id)}
                    className="hero-card card-accent-gold"
                    style={{
                      background: 'white', borderRadius: 16, overflow: 'hidden',
                      boxShadow: '0 4px 20px rgba(15,61,94,0.09)',
                      border: '1px solid rgba(15,61,94,0.08)',
                      cursor: 'pointer', transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-8px)';
                      (e.currentTarget as HTMLDivElement).style.boxShadow = '0 24px 50px rgba(15,61,94,0.2)';
                      (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(212,160,23,0.45)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                      (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(15,61,94,0.09)';
                      (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(15,61,94,0.08)';
                    }}
                  >
                    {/* Image */}
                    <div className="hero-card-media img-veil" style={{ position: 'relative', height: 190, overflow: 'hidden', background: '#dce8f0' }}>
                      <LazyImage
                        src={getImageUrl(item.image)}
                        alt={lang === 'en' ? (item.nameEn || item.nameVi) : item.nameVi}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{
                        position: 'absolute', top: 10, left: 10,
                        padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                        background: memorialClassificationBackgrounds[item.classification],
                        color: memorialClassificationColors[item.classification],
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      }}>
                        {t(`memorial.classification.${item.classification}`)}
                      </div>
                      <div style={{
                        position: 'absolute', top: 8, right: 12,
                        fontFamily: 'Merriweather, serif', fontSize: 30, fontWeight: 900,
                        color: 'rgba(255,255,255,0.9)', textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                      }}>
                        {String(idx + 1).padStart(2, '0')}
                      </div>
                    </div>
                    {/* Content */}
                    <div style={{ padding: '18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <span style={{
                          padding: '3px 9px', borderRadius: 5, fontSize: 11, fontWeight: 700,
                          background: '#EBF5FB', color: '#0F3D5E',
                        }}>
                          {memorialCategoryIcons[item.category]} {t(`memorial.category.${item.category}`)}
                        </span>
                        {item.eventDate && (
                          <span style={{ color: '#5d7a8c', fontSize: 11, display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Calendar size={11} /> {item.eventDate}
                          </span>
                        )}
                      </div>
                      <h3 style={{ color: '#0F3D5E', fontSize: 15.5, fontWeight: 800, margin: '0 0 6px', lineHeight: 1.35, fontFamily: 'Merriweather, serif' }}>
                        {lang === 'en' ? (item.nameEn || item.nameVi) : item.nameVi}
                      </h3>
                      <p style={{ color: '#5d7a8c', fontSize: 12.5, lineHeight: 1.55, margin: '0 0 14px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {sanitizeLocation(lang === 'en' ? (item.descriptionEn || item.descriptionVi) : item.descriptionVi)}
                      </p>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {item.videoUrl ? (
                          <a href={item.videoUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                            padding: '7px 0', borderRadius: 8,
                            border: '1px solid #0F3D5E', background: 'white',
                            color: '#0F3D5E', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', textDecoration: 'none',
                          }}>
                            <Play size={11} /> {t('intangible.video')}
                          </a>
                        ) : (
                          <div style={{ flex: 1 }} />
                        )}
                        <button onClick={e => { e.stopPropagation(); onNavigate('memorial-site-detail', item.id); }} style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                          padding: '7px 0', borderRadius: 8,
                          background: '#0F3D5E', border: 'none',
                          color: 'white', fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
                        }}>
                          <Eye size={11} /> {t('memorial.detail')}
                        </button>
                      </div>
                    </div>
                  </div>
                  </div>
                ))}
              </div>

              {memorialSites.length > 6 && (
                <div className="reveal" style={{ textAlign: 'center', marginTop: 36 }}>
                  <button
                    onClick={() => onNavigate('memorial-sites')}
                    className="btn-outline-glow btn-shine"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      padding: '13px 30px', borderRadius: 10,
                      border: '2px solid #0F3D5E', background: 'white',
                      color: '#0F3D5E', fontSize: 14, fontWeight: 700, cursor: 'pointer',
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
              )}
            </>
          )}
        </div>
      </section>

      {/* ═══════════════════ CTA ═══════════════════ */}
      <section className="cta-section" style={{
        padding: 'clamp(48px, 6vw, 76px) 16px',
        background: 'linear-gradient(135deg, #0F3D5E 0%, #1A5276 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div className="hero-blob hero-blob-gold" style={{ width: 380, height: 380, top: '-20%', right: '-5%', opacity: 0.8 }} />
        <div className="hero-blob hero-blob-navy" style={{ width: 340, height: 340, bottom: '-25%', left: '-5%', animationDelay: '-8s' }} />
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.06,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 Q38 18 30 30 Q22 18 30 5Z' fill='%23D4A017' /%3E%3C/svg%3E")`,
        }} />
        <div style={{ position: 'relative', maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <div className="reveal is-revealed" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 18, padding: '7px 18px', borderRadius: 30, background: 'rgba(212,160,23,0.18)', border: '1px solid rgba(212,160,23,0.5)' }}>
            <LotusOrnament size={18} opacity={0.9} />
            <span style={{ color: '#EBC55C', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.6 }}>
              {lang === 'vi' ? 'Hành trình di sản' : 'Heritage Journey'}
            </span>
            <LotusOrnament size={18} opacity={0.9} />
          </div>
          <h2 className="reveal" style={{ color: 'white', fontSize: 'clamp(24px, 4.5vw, 34px)', fontFamily: 'Merriweather, serif', fontWeight: 800, marginBottom: 18, textShadow: '0 4px 24px rgba(0,0,0,0.35)' }}>
            {lang === 'vi' ? 'Khám phá di sản văn hóa' : 'Explore Van Dinh'} <span className="text-gold-gradient">{lang === 'vi' ? 'Vân Đình' : 'Cultural Heritage'}</span>
          </h2>
          <p className="reveal" style={{ color: 'rgba(255,255,255,0.78)', fontSize: 15, lineHeight: 1.75, marginBottom: 30 }}>
            {lang === 'vi'
              ? 'Hãy cùng chúng tôi bảo tồn và phát huy các giá trị di sản văn hóa vật thể và phi vật thể của Vân Đình cho các thế hệ tương lai.'
              : 'Join us in preserving and promoting the tangible and intangible cultural heritage values of Van Dinh for future generations.'}
          </p>
          <div className="reveal" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavigate('map')}
              className="btn-gold-glow btn-shine glow-pulse"
              style={{
                padding: '13px 30px', borderRadius: 10,
                background: 'linear-gradient(135deg, #E5B723, #B8860B)', border: 'none', color: 'white',
                fontSize: 14, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              {lang === 'vi' ? 'Xem bản đồ' : 'View Map'} <ArrowRight size={14} />
            </button>
            <button
              onClick={() => onNavigate('about')}
              className="btn-outline-glow"
              style={{
                padding: '13px 30px', borderRadius: 10,
                border: '2px solid rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.06)',
                color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.25s', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(212,160,23,0.2)'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#D4A017'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.45)'; }}
            >
              {lang === 'vi' ? 'Tìm hiểu thêm' : 'Learn More'}
            </button>
          </div>
        </div>
        <div style={{ position: 'relative', maxWidth: 1280, margin: '40px auto 0', borderTop: '1px solid rgba(212,160,23,0.25)', paddingTop: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, letterSpacing: 0.5 }}>
            {lang === 'vi' ? 'Bản đồ di sản số — Vì một di sản trường tồn' : 'Van Dinh Digital Heritage Map — For an enduring heritage'}
          </span>
          <div className="culture-trail" style={{ gap: 6 }}>
            <span className="ornament-diamond" style={{ width: 6, height: 6 }} />
            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>Vân Đình · Hà Nội</span>
            <span className="ornament-diamond" style={{ width: 6, height: 6 }} />
          </div>
        </div>
      </section>

      <style>{`
        .map-crosshair { animation: crosshairPulse 6s ease-in-out infinite; }
        @keyframes crosshairPulse {
          0%, 100% { opacity: 0.65; }
          50% { opacity: 1; }
        }
        .hero-map-node { animation: mapNodePulse 4.5s ease-in-out infinite; }
        @keyframes mapNodePulse {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .map-crosshair, .hero-map-node { animation: none !important; }
        }
        @media (max-width: 1599px) {
          .hero-side-panel { display: none !important; }
        }
        @media (max-width: 640px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
            transform: translateY(-40px) !important;
          }
          .featured-grid {
            grid-template-columns: 1fr !important;
          }
          .culture-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
          .map-preview-header {
            flex-direction: column !important;
            align-items: center !important;
            gap: 12px !important;
            text-align: center !important;
          }
          .hero-content {
            padding: 72px 16px 96px !important;
          }
        }
        @media (min-width: 641px) and (max-width: 1024px) {
          .featured-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .culture-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}

/* ── Stat card with count-up ─────────────────────────────── */
function StatCard({ stat, started }: { stat: { label: string; value: number; icon: React.ReactNode; color: string }; started: boolean }) {
  const value = useCountUp(stat.value, started);
  return (
    <div
      className="card-accent-gold"
      style={{
        background: 'linear-gradient(165deg, #ffffff 0%, #FBFCFE 100%)',
        borderRadius: 16, padding: '22px 16px',
        boxShadow: '0 10px 34px rgba(15,61,94,0.16)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center', border: `2px solid ${stat.color}18`,
        transition: 'transform 0.28s ease, box-shadow 0.28s ease',
        position: 'relative',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-6px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 20px 48px rgba(15,61,94,0.22)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 10px 34px rgba(15,61,94,0.16)';
      }}
    >
      <div style={{
        width: 52, height: 52, borderRadius: 14, marginBottom: 12,
        background: `linear-gradient(135deg, ${stat.color}, ${stat.color}CC)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', boxShadow: `0 8px 20px ${stat.color}40`,
      }}>
        {stat.icon}
      </div>
      <div style={{ fontSize: 34, fontWeight: 800, color: stat.color, lineHeight: 1, marginBottom: 5, fontFamily: 'Be Vietnam Pro, sans-serif' }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: '#5d7a8c', fontWeight: 600, lineHeight: 1.3 }}>
        {stat.label}
      </div>
    </div>
  );
}