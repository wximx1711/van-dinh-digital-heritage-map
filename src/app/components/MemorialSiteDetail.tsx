import { useLanguage } from './LanguageContext';
import { useMemorialSite, useMemorialSites } from '../../presentation/hooks/useMemorialSiteData';
import { memorialCategoryIcons, memorialClassificationColors, memorialClassificationBackgrounds, memorialStatusColors } from '../constants/memorial';
import { ImageGallery } from './ImageGallery';
import { InfoCard } from './InfoCard';
import { RelatedItems } from './RelatedItems';
import { ArrowLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { DetailPageSkeleton } from './Skeleton';
import { sanitizeLocation } from '../utils/uiText';

interface MemorialSiteDetailProps {
  siteId: string;
  onNavigate: (page: string, id?: string) => void;
}

function getYouTubeEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
  if (match) return `https://www.youtube.com/embed/${match[1]}`;
  return null;
}

function DetailBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20, padding: '20px', background: '#F8FAFC', borderRadius: 8, border: '1px solid rgba(15,61,94,0.06)' }}>
      <div style={{
        fontSize: 12, fontWeight: 700, color: '#0F3D5E', marginBottom: 12,
        textTransform: 'uppercase', letterSpacing: 0.4,
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

export function MemorialSiteDetail({ siteId, onNavigate }: MemorialSiteDetailProps) {
  const { lang, t } = useLanguage();
  const { data: item, loading, error } = useMemorialSite(siteId);
  const { data: relatedResult } = useMemorialSites({ category: item?.category, page: 1, pageSize: 20 });

  if (loading) {
    return <DetailPageSkeleton />;
  }

  if (error) {
    return (
      <div style={{ background: '#F0F4F8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#E74C3C' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{t('memorial.errorTitle')}</div>
          <div style={{ fontSize: 13, color: '#5d7a8c', marginBottom: 16 }}>{error.message}</div>
          <button onClick={() => onNavigate('memorial-sites')} style={{ padding: '8px 20px', borderRadius: 6, background: '#0F3D5E', border: 'none', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            {t('detail.back')}
          </button>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div style={{ background: '#F0F4F8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#5d7a8c' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🕯️</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#0F3D5E', marginBottom: 8 }}>{t('memorial.notFound')}</div>
          <div style={{ fontSize: 13, marginBottom: 16 }}>{t('memorial.notFoundDesc')}</div>
          <button onClick={() => onNavigate('memorial-sites')} style={{ padding: '8px 20px', borderRadius: 6, background: '#0F3D5E', border: 'none', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            {t('memorial.backToList')}
          </button>
        </div>
      </div>
    );
  }

  const allImages = [
    ...(item.image ? [item.image] : []),
    ...(item.galleryImages || []),
  ];

  const youtubeUrl = getYouTubeEmbedUrl(item.videoUrl);
  const name = lang === 'en' ? (item.nameEn || item.nameVi) : item.nameVi;
  const categoryLabel = t(`memorial.category.${item.category}`);
  const classificationLabel = t(`memorial.classification.${item.classification}`);
  const statusLabel = t(`memorial.status.${item.status}`);
  const address = sanitizeLocation(lang === 'en' ? (item.addressEn || item.addressVi) : item.addressVi);
  const description = sanitizeLocation(lang === 'en' ? (item.descriptionEn || item.descriptionVi) : item.descriptionVi || item.descriptionEn);
  const history = sanitizeLocation(lang === 'en' ? (item.historyEn || item.historyVi) : item.historyVi || item.historyEn);
  const commemoration = sanitizeLocation(lang === 'en' ? (item.commemorationEn || item.commemorationVi) : item.commemorationVi || item.commemorationEn);

  const relatedItems = (relatedResult.data || []).filter(s => s.id !== item.id).slice(0, 6);

  const hasContent = description || history || commemoration || youtubeUrl || allImages.length > 0;

  return (
    <div style={{ background: '#F0F4F8', minHeight: '100vh' }}>
      <div style={{ background: '#0F3D5E', padding: '12px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => onNavigate('memorial-sites')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)',
              fontSize: 13, cursor: 'pointer', padding: '4px 0',
            }}
          >
            <ArrowLeft size={14} /> {t('detail.back')}
          </button>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>/</span>
          <span
            onClick={() => onNavigate('memorial-sites')}
            style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer' }}
          >
            {t('memorial.title')}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}><ChevronRight size={12} /></span>
          <span style={{ color: 'white', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }} className="heritage-detail-layout">

          {/* ===== MAIN CONTENT ===== */}
          <div>
            {/* Image Gallery */}
            {allImages.length > 0 && (
              <ImageGallery images={allImages} alt={name} />
            )}

            {/* Video Section */}
            {youtubeUrl && (
              <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', marginBottom: 20, boxShadow: '0 2px 12px rgba(15,61,94,0.08)' }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(15,61,94,0.08)' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0F3D5E' }}>
                    {t('memorial.section_video')}
                  </span>
                </div>
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                  <iframe
                    src={youtubeUrl}
                    title={name}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Content sections */}
            <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(15,61,94,0.08)' }}>
              <div style={{ padding: '20px' }}>
                {description && (
                  <DetailBlock title={t('memorial.section_description')}>
                    <p style={{ fontSize: 13, color: '#1a2332', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>
                      {description}
                    </p>
                  </DetailBlock>
                )}

                {history && (
                  <DetailBlock title={t('memorial.section_history')}>
                    <p style={{ fontSize: 13, color: '#1a2332', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>
                      {history}
                    </p>
                  </DetailBlock>
                )}

                {commemoration && (
                  <DetailBlock title={t('memorial.section_commemoration')}>
                    <p style={{ fontSize: 13, color: '#1a2332', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>
                      {commemoration}
                    </p>
                  </DetailBlock>
                )}

                {!hasContent && (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#5d7a8c', fontSize: 13 }}>
                    {t('memorial.noDetail')}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ===== SIDEBAR ===== */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <InfoCard
              title={name}
              subtitle={item.otherNames || undefined}
              badges={[
                <span key="category" style={{
                  padding: '3px 10px', borderRadius: 10, fontSize: 11, fontWeight: 700,
                  background: 'rgba(212,160,23,0.15)', color: '#B8860B',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <span>{memorialCategoryIcons[item.category]}</span>
                  {categoryLabel}
                </span>,
                <span key="classification" style={{
                  padding: '3px 10px', borderRadius: 10, fontSize: 11, fontWeight: 700,
                  background: memorialClassificationBackgrounds[item.classification],
                  color: memorialClassificationColors[item.classification],
                }}>
                  {classificationLabel}
                </span>,
                <span key="status" style={{
                  padding: '3px 10px', borderRadius: 10, fontSize: 11, fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: 'rgba(39,174,96,0.1)', color: memorialStatusColors[item.status],
                }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: memorialStatusColors[item.status] }} />
                  {statusLabel}
                </span>,
              ]}
              fields={[
                { label: t('memorial.code'), value: item.code },
                ...(item.eventDate ? [{ label: t('memorial.eventDate'), value: item.eventDate }] : []),
                ...(address ? [{ label: t('memorial.address'), value: address }] : []),
                ...(item.createdAt ? [{
                  label: t('memorial.created'),
                  value: new Date(item.createdAt).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US'),
                }] : []),
              ]}
            />

            {item.googleMapUrl && (
              <div style={{ background: 'white', borderRadius: 12, padding: '16px', boxShadow: '0 2px 12px rgba(15,61,94,0.08)' }}>
                <div style={{
                  fontSize: 12, fontWeight: 700, color: '#0F3D5E', marginBottom: 12,
                  textTransform: 'uppercase', letterSpacing: 0.4,
                }}>
                  {t('memorial.section_map')}
                </div>
                <a href={item.googleMapUrl} target="_blank" rel="noreferrer" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '10px', borderRadius: 8, background: '#0F3D5E',
                  color: 'white', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', textDecoration: 'none',
                }}>
                  <ExternalLink size={14} /> {t('memorial.openMap')}
                </a>
              </div>
            )}

            <RelatedItems
              title={t('memorial.related')}
              items={relatedItems.map(ri => ({
                id: ri.id,
                nameVi: ri.nameVi,
                nameEn: ri.nameEn,
                image: ri.image,
                subtitle: `${memorialCategoryIcons[ri.category]} ${t(`memorial.category.${ri.category}`)}`,
              }))}
              onItemClick={(id) => onNavigate('memorial-site-detail', id)}
              lang={lang}
            />
          </div>
        </div>
      </div>
    </div>
  );
}