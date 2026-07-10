import { useLanguage } from './LanguageContext';
import { useIntangibleHeritageById, useIntangibleHeritage } from '../../presentation/hooks/useHeritageData';
import { intangibleCategoryIcons } from '../constants';
import { ImageGallery } from './ImageGallery';
import { InfoCard } from './InfoCard';
import { ShareSection } from './ShareSection';
import { RelatedItems } from './RelatedItems';
import { ArrowLeft, ChevronRight } from 'lucide-react';

interface IntangibleHeritageDetailProps {
  itemId: string;
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

export function IntangibleHeritageDetail({ itemId, onNavigate }: IntangibleHeritageDetailProps) {
  const { lang, t } = useLanguage();
  const { data: item, loading, error } = useIntangibleHeritageById(itemId);
  const { data: allItems } = useIntangibleHeritage();

  if (loading) {
    return (
      <div style={{ background: '#F0F4F8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#5d7a8c' }}>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid rgba(15,61,94,0.2)', borderTopColor: '#0F3D5E', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <div style={{ fontSize: 13 }}>{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: '#F0F4F8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#E74C3C' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{lang === 'vi' ? 'Không thể tải dữ liệu' : 'Failed to load data'}</div>
          <div style={{ fontSize: 13, color: '#5d7a8c', marginBottom: 16 }}>{error.message}</div>
          <button onClick={() => onNavigate('intangible')} style={{ padding: '8px 20px', borderRadius: 6, background: '#0F3D5E', border: 'none', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            {lang === 'vi' ? 'Quay lại' : 'Go back'}
          </button>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div style={{ background: '#F0F4F8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#5d7a8c' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎭</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#0F3D5E', marginBottom: 8 }}>{lang === 'vi' ? 'Không tìm thấy di sản' : 'Heritage not found'}</div>
          <div style={{ fontSize: 13, marginBottom: 16 }}>{lang === 'vi' ? 'Di sản bạn đang tìm không tồn tại hoặc đã bị xóa.' : 'The heritage item you are looking for does not exist or has been deleted.'}</div>
          <button onClick={() => onNavigate('intangible')} style={{ padding: '8px 20px', borderRadius: 6, background: '#0F3D5E', border: 'none', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            {lang === 'vi' ? 'Quay lại danh sách' : 'Back to list'}
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
  const categoryLabel = t(`intangible.${item.category}`);

  const sameCategoryItems = allItems.filter(s => s.id !== item.id && s.category === item.category);
  const relatedItems = sameCategoryItems.slice(0, 6);

  const hasDescription = item.descriptionVi || item.descriptionEn;
  const origin = lang === 'en' ? (item.originEn || item.origin) : item.origin;
  const heritageValue = lang === 'en' ? (item.heritageValueEn || item.heritageValue) : item.heritageValue;
  const currentStatus = lang === 'en' ? (item.currentStatusEn || item.currentStatus) : item.currentStatus;
  const relatedDocuments = lang === 'en' ? (item.relatedDocumentsEn || item.relatedDocuments) : item.relatedDocuments;
  const hasOrigin = origin || item.formationHistory || item.historicalDevelopment;
  const hasHeritageValue = !!heritageValue;
  const hasCurrentStatus = currentStatus || item.threatLevel || item.riskDescription;
  const hasPreservation = item.existingProtectionMeasures || item.proposedProtectionMeasures;
  const hasDocuments = !!relatedDocuments;

  return (
    <div style={{ background: '#F0F4F8', minHeight: '100vh' }}>
      <div style={{ background: '#0F3D5E', padding: '12px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => onNavigate('intangible')}
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
            onClick={() => onNavigate('intangible')}
            style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer' }}
          >
            {t('nav.intangible')}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}><ChevronRight size={12} /></span>
          <span style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>{name}</span>
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
                    {t('intangible.section_video')}
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
                {/* General Description */}
                {hasDescription && (
                  <DetailBlock title={t('intangible.section_description')}>
                    <p style={{ fontSize: 13, color: '#1a2332', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>
                      {lang === 'en' ? (item.descriptionEn || item.descriptionVi) : (item.descriptionVi || item.descriptionEn)}
                    </p>
                  </DetailBlock>
                )}

                {/* Origin / History */}
                {hasOrigin && (
                  <DetailBlock title={t('intangible.section_origin')}>
                    {origin && (
                      <div style={{ marginBottom: item.formationHistory || item.historicalDevelopment ? 16 : 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#5d7a8c', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 6 }}>
                          {t('im.origin')}
                        </div>
                        <p style={{ fontSize: 13, color: '#1a2332', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>
                          {origin}
                        </p>
                      </div>
                    )}
                    {item.formationHistory && (
                      <>
                        <div style={{ height: 1, background: 'rgba(15,61,94,0.08)', margin: '12px 0' }} />
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#5d7a8c', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 6 }}>
                            {t('im.formation_history')}
                          </div>
                          <p style={{ fontSize: 13, color: '#1a2332', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>
                            {item.formationHistory}
                          </p>
                        </div>
                      </>
                    )}
                    {item.historicalDevelopment && (
                      <>
                        <div style={{ height: 1, background: 'rgba(15,61,94,0.08)', margin: '12px 0' }} />
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#5d7a8c', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 6 }}>
                            {t('im.historical_development')}
                          </div>
                          <p style={{ fontSize: 13, color: '#1a2332', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>
                            {item.historicalDevelopment}
                          </p>
                        </div>
                      </>
                    )}
                  </DetailBlock>
                )}

                {/* Cultural Value */}
                {hasHeritageValue && (
                  <DetailBlock title={t('intangible.section_cultural_value')}>
                    <p style={{ fontSize: 13, color: '#1a2332', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>
                      {heritageValue}
                    </p>
                  </DetailBlock>
                )}

                {/* Current Status */}
                {hasCurrentStatus && (
                  <DetailBlock title={t('intangible.section_current_status')}>
                    {currentStatus && (
                      <div style={{ marginBottom: item.threatLevel || item.riskDescription ? 16 : 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#5d7a8c', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 6 }}>
                          {t('im.current_status')}
                        </div>
                        <p style={{ fontSize: 13, color: '#1a2332', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>
                          {currentStatus}
                        </p>
                      </div>
                    )}
                    {item.threatLevel && (
                      <>
                        <div style={{ height: 1, background: 'rgba(15,61,94,0.08)', margin: '12px 0' }} />
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#5d7a8c', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 6 }}>
                            {t('im.threat_level')}
                          </div>
                          <p style={{ fontSize: 13, color: '#1a2332', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>
                            {item.threatLevel}
                          </p>
                        </div>
                      </>
                    )}
                    {item.riskDescription && (
                      <>
                        <div style={{ height: 1, background: 'rgba(15,61,94,0.08)', margin: '12px 0' }} />
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#5d7a8c', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 6 }}>
                            {t('im.risk_description')}
                          </div>
                          <p style={{ fontSize: 13, color: '#1a2332', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>
                            {item.riskDescription}
                          </p>
                        </div>
                      </>
                    )}
                  </DetailBlock>
                )}

                {/* Preservation */}
                {hasPreservation && (
                  <DetailBlock title={t('intangible.section_preservation')}>
                    {item.existingProtectionMeasures && (
                      <div style={{ marginBottom: item.proposedProtectionMeasures ? 16 : 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#5d7a8c', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 6 }}>
                          {t('im.existing_protection')}
                        </div>
                        <p style={{ fontSize: 13, color: '#1a2332', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>
                          {item.existingProtectionMeasures}
                        </p>
                      </div>
                    )}
                    {item.proposedProtectionMeasures && (
                      <>
                        <div style={{ height: 1, background: 'rgba(15,61,94,0.08)', margin: '12px 0' }} />
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#5d7a8c', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 6 }}>
                            {t('im.proposed_protection')}
                          </div>
                          <p style={{ fontSize: 13, color: '#1a2332', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>
                            {item.proposedProtectionMeasures}
                          </p>
                        </div>
                      </>
                    )}
                  </DetailBlock>
                )}

                {/* Related Documents */}
                {hasDocuments && (
                  <DetailBlock title={t('intangible.section_documents')}>
                    <p style={{ fontSize: 13, color: '#1a2332', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>
                      {relatedDocuments}
                    </p>
                  </DetailBlock>
                )}

                {!hasDescription && !hasOrigin && !hasHeritageValue && !hasCurrentStatus && !hasPreservation && !hasDocuments && !youtubeUrl && (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#5d7a8c', fontSize: 13 }}>
                    {lang === 'vi' ? 'Chưa có thông tin chi tiết' : 'No detailed information available'}
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
                  <span>{intangibleCategoryIcons[item.category]}</span>
                  {categoryLabel}
                </span>,
              ]}
              fields={[
                ...(item.createdAt ? [{
                  label: lang === 'vi' ? 'Ngày tạo' : 'Created',
                  value: new Date(item.createdAt).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US'),
                }] : []),
                ...(item.location ? [{
                  label: t('im.location'),
                  value: item.location,
                }] : []),
                ...(item.culturalSpace ? [{
                  label: t('im.cultural_space'),
                  value: item.culturalSpace,
                }] : []),
                ...(item.community ? [{
                  label: t('im.community'),
                  value: item.community,
                }] : []),
                ...(item.representativePersons ? [{
                  label: t('im.representative_persons'),
                  value: item.representativePersons,
                }] : []),
              ]}
            />

            <ShareSection
              qrImageUrl={`/api/qr/intangible/${item.id}`}
              title={name}
              shareUrl={window.location.href}
            />

            <RelatedItems
              title={t('intangible.related')}
              items={relatedItems.map(ri => ({
                id: ri.id,
                nameVi: ri.nameVi,
                nameEn: ri.nameEn,
                image: ri.image,
                subtitle: `${intangibleCategoryIcons[ri.category]} ${t(`intangible.${ri.category}`)}`,
              }))}
              onItemClick={(id) => onNavigate('intangible-detail', id)}
              lang={lang}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
