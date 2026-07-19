import { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { LazyImage } from './LazyImage';
import { useHeritageSites, useHeritageSite, useTypeLabels, useClassificationLabels, useStatusLabels } from '../../presentation/hooks/useHeritageData';
import { classificationColors, statusColors } from '../constants';
import { apiGet } from '../services/api';
import { getImageUrl } from '../utils/url';
import { ImageGallery } from './ImageGallery';
import { InfoCard } from './InfoCard';
import { ShareSection } from './ShareSection';
import { RelatedItems } from './RelatedItems';
import { DetailPageSkeleton, Skeleton } from './Skeleton';
import { openGoogleMapsDirections } from '../utils/geo';
import {
  ArrowLeft, MapPin, Calendar, Download, FileText, Image, Info, Clock, User,
  Video, ExternalLink, Globe, Navigation,
} from 'lucide-react';

interface HeritageDetailProps {
  siteId: string;
  onNavigate: (page: string, id?: string) => void;
}

interface VideoData {
  videoId: number;
  title: string | null;
  videoType: string | null;
  videoUrl: string | null;
  thumbnailUrl: string | null;
}

interface DocumentData {
  documentId: number;
  fileName: string | null;
  fileUrl: string | null;
  fileType: string | null;
  fileSize: number | null;
}

function extractGoogleMapsEmbed(url: string): string | null {
  if (!url) return null;
  const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (match) return `https://www.google.com/maps/embed/v1/place?key=&q=${match[1]},${match[2]}&center=${match[1]},${match[2]}&zoom=15`;
  const qmatch = url.match(/[?&]q=([^&]+)/);
  if (qmatch) return `https://www.google.com/maps/embed/v1/place?key=&q=${encodeURIComponent(qmatch[1])}&zoom=15`;
  return null;
}

export function HeritageDetail({ siteId, onNavigate }: HeritageDetailProps) {
  const { lang, t } = useLanguage();
  const { data: heritageSites } = useHeritageSites();
  const { data: siteData, loading, error } = useHeritageSite(siteId);
  const typeLabels = useTypeLabels();
  const classificationLabels = useClassificationLabels();
  const statusLabels = useStatusLabels();
  const site = siteData;
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'docs' | 'gallery'>('info');
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);

  useEffect(() => {
    if (!siteId) return;
    setLoadingMedia(true);
    Promise.all([
      apiGet<any[]>(`/heritage/${encodeURIComponent(siteId)}/media/videos`).then(d => setVideos(Array.isArray(d) ? d : [])).catch(() => setVideos([])),
      apiGet<any[]>(`/heritage/${encodeURIComponent(siteId)}/media/documents`).then(d => setDocuments(Array.isArray(d) ? d : [])).catch(() => setDocuments([])),
    ]).finally(() => setLoadingMedia(false));
  }, [siteId]);

  const sameCategorySites = site ? heritageSites.filter(s => s.id !== site.id && s.type === site.type) : [];
  const relatedSites = sameCategorySites.slice(0, 4);

  const allImages = site ? (Array.isArray(site.images) && site.images.length > 0 ? site.images : site.image ? [site.image] : []) : [];

  const formatSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getVideoEmbedUrl = (url: string | null) => {
    if (!url) return null;
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    return url;
  };

  const embedUrl = site?.googleMapUrl ? extractGoogleMapsEmbed(site.googleMapUrl) : null;

  const getSafeLabel = (labels: Record<string, { vi: string; en: string } | undefined> | undefined, key: string): string => {
    if (!labels || !key) return key;
    const item = labels[key];
    if (!item) return key;
    return item[lang] || key;
  };

  const getSafeColor = (colors: Record<string, string> | undefined, key: string, fallback: string): string => {
    if (!colors || !key) return fallback;
    return colors[key] || fallback;
  };

  if (loading) {
    return <DetailPageSkeleton />;
  }

  if (error) {
    return (
      <div style={{ background: '#F0F4F8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#E74C3C' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{lang === 'vi' ? 'Không thể tải dữ liệu' : 'Failed to load data'}</div>
          <div style={{ fontSize: 13, color: '#5d7a8c', marginBottom: 16 }}>{error.message}</div>
          <button onClick={() => onNavigate('relics')} style={{ padding: '8px 20px', borderRadius: 6, background: '#0F3D5E', border: 'none', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            {lang === 'vi' ? 'Quay lại' : 'Go back'}
          </button>
        </div>
      </div>
    );
  }

  if (!site) {
    return (
      <div style={{ background: '#F0F4F8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#5d7a8c' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏛️</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#0F3D5E', marginBottom: 8 }}>{lang === 'vi' ? 'Không tìm thấy di tích' : 'Heritage site not found'}</div>
          <div style={{ fontSize: 13, marginBottom: 16 }}>{lang === 'vi' ? 'Di tích bạn đang tìm không tồn tại hoặc đã bị xóa.' : 'The heritage site you are looking for does not exist or has been deleted.'}</div>
          <button onClick={() => onNavigate('relics')} style={{ padding: '8px 20px', borderRadius: 6, background: '#0F3D5E', border: 'none', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            {lang === 'vi' ? 'Quay lại danh sách' : 'Back to list'}
          </button>
        </div>
      </div>
    );
  }

  const name = lang === 'vi' ? site.nameVi : site.nameEn;

  return (
    <div style={{ background: '#F0F4F8', minHeight: '100vh' }}>
      <div style={{ background: '#0F3D5E', padding: '12px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => onNavigate('relics')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)',
              fontSize: 13, cursor: 'pointer', padding: '4px 0',
            }}
          >
            <ArrowLeft size={14} /> {t('detail.back')}
          </button>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>/</span>
          <span style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>{name}</span>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: 24 }} className="heritage-detail-layout">

          {/* ===== MAIN CONTENT ===== */}
          <div style={{ minWidth: 0 }}>
            {/* Image gallery */}
            {allImages.length > 0 && (
              <ImageGallery images={allImages} alt={name} />
            )}

            {/* Tabs */}
            <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(15,61,94,0.08)' }}>
              <div style={{ display: 'flex', borderBottom: '1px solid rgba(15,61,94,0.1)' }}>
                {[
                  { key: 'info', label: lang === 'vi' ? 'Thông tin' : 'Info', icon: <Info size={14} /> },
                  { key: 'history', label: lang === 'vi' ? 'Lịch sử' : 'History', icon: <Clock size={14} /> },
                  { key: 'docs', label: lang === 'vi' ? 'Tài liệu & Video' : 'Docs & Video', icon: <FileText size={14} /> },
                  { key: 'gallery', label: lang === 'vi' ? 'Thư viện' : 'Gallery', icon: <Image size={14} /> },
                ].map(tab => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key as typeof activeTab)}
                    style={{
                      flex: 1, padding: '14px 8px', border: 'none', cursor: 'pointer',
                      background: activeTab === tab.key ? '#EBF5FB' : 'white',
                      color: activeTab === tab.key ? '#0F3D5E' : '#5d7a8c',
                      fontSize: 12, fontWeight: activeTab === tab.key ? 700 : 500,
                      borderBottom: activeTab === tab.key ? '2px solid #D4A017' : '2px solid transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}>
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              <div style={{ padding: '20px' }}>
                {/* INFO TAB */}
                {activeTab === 'info' && (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      {[
                        { label: t('detail.code'), value: site.code },
                        { label: t('detail.type'), value: getSafeLabel(typeLabels, site.type) },
                        { label: t('detail.classification'), value: getSafeLabel(classificationLabels, site.classification) },
                        { label: lang === 'vi' ? 'Trạng thái' : 'Status', value: getSafeLabel(statusLabels, site.status) },
                        { label: lang === 'vi' ? 'Năm xây dựng' : 'Year Built', value: site.yearBuilt },
                        { label: lang === 'vi' ? 'Đơn vị quản lý' : 'Managing Unit', value: site.guardian },
                      ].map(item => {
                        const isClassification = item.label === t('detail.classification');
                        const isStatus = item.label === (lang === 'vi' ? 'Trạng thái' : 'Status');
                        return (
                          <div key={item.label} style={{ padding: '12px', background: '#F8FAFC', borderRadius: 8 }}>
                            <div style={{ fontSize: 11, color: '#5d7a8c', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                              {item.label}
                            </div>
                            <div style={{ fontSize: 13, color: '#1a2332', fontWeight: 600 }}>
                              {isClassification ? (
                                <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 12, background: `${getSafeColor(classificationColors, site.classification, '#7F8C8D')}15`, color: getSafeColor(classificationColors, site.classification, '#7F8C8D'), fontWeight: 700 }}>
                                  {item.value}
                                </span>
                              ) : isStatus ? (
                                <span style={{ color: getSafeColor(statusColors, site.status, '#27AE60') }}>{item.value}</span>
                              ) : item.value || (lang === 'vi' ? 'Chưa có' : 'Not available')}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ marginTop: 16, padding: '16px', background: '#F8FAFC', borderRadius: 8 }}>
                      <div style={{ fontSize: 11, color: '#5d7a8c', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                        {t('common.address')}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                        <MapPin size={14} style={{ color: '#D4A017', marginTop: 2 }} />
                        <span style={{ fontSize: 13, color: '#1a2332' }}>
                          {lang === 'vi' ? site.addressVi : site.addressEn}
                        </span>
                      </div>
                    </div>

                    <div style={{ marginTop: 16, padding: '16px', background: '#F8FAFC', borderRadius: 8 }}>
                      <div style={{ fontSize: 11, color: '#5d7a8c', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                        {lang === 'vi' ? 'Mô tả' : 'Description'}
                      </div>
                      <p style={{ fontSize: 13, color: '#1a2332', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>
                        {lang === 'vi' ? site.descriptionVi || (lang === 'vi' ? 'Chưa có mô tả' : 'No description') : site.descriptionEn || (lang === 'vi' ? 'Chưa có mô tả' : 'No description')}
                      </p>
                    </div>

                    {embedUrl && (
                      <div style={{ marginTop: 16, padding: '16px', background: '#F8FAFC', borderRadius: 8 }}>
                        <div style={{ fontSize: 11, color: '#5d7a8c', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                          {lang === 'vi' ? 'Vị trí trên bản đồ' : 'Location on Map'}
                        </div>
                        <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(15,61,94,0.1)' }}>
                          <iframe
                            src={embedUrl}
                            width="100%"
                            height="250"
                            style={{ border: 0, display: 'block' }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Google Maps"
                          />
                        </div>
                        <button
                          onClick={() => openGoogleMapsDirections(site.lat, site.lon)}
                          disabled={site.lat === null || site.lon === null}
                          title={site.lat === null || site.lon === null ? (lang === 'vi' ? 'Thiếu tọa độ' : 'Missing coordinates') : (lang === 'vi' ? 'Mở trong Google Maps' : 'Open in Google Maps')}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10,
                            padding: '8px 16px', borderRadius: 6,
                            background: site.lat !== null && site.lon !== null ? '#D4A017' : '#F0F4F8',
                            color: site.lat !== null && site.lon !== null ? 'white' : '#cbced4',
                            fontSize: 12, fontWeight: 600, cursor: site.lat !== null && site.lon !== null ? 'pointer' : 'not-allowed', border: 'none',
                          }}>
                          <ExternalLink size={13} /> {lang === 'vi' ? 'Mở trong Google Maps' : 'Open in Google Maps'}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* HISTORY TAB */}
                {activeTab === 'history' && (
                  <div>
                    <h3 style={{ color: '#0F3D5E', fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
                      {lang === 'vi' ? 'Lịch sử' : 'History'}
                    </h3>
                    <p style={{ fontSize: 14, color: '#1a2332', lineHeight: 1.8, whiteSpace: 'pre-line', marginBottom: 24 }}>
                      {lang === 'vi' ? site.historyVi || 'Chưa có thông tin lịch sử.' : site.historyEn || 'No history information available.'}
                    </p>
                  </div>
                )}

                {/* DOCS & VIDEO TAB */}
                {activeTab === 'docs' && (
                  <div>
                    {videos.length > 0 && (
                      <>
                        <h3 style={{ color: '#0F3D5E', fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
                          <Video size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                          {lang === 'vi' ? 'Video' : 'Videos'}
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                          {videos.map(v => (
                            <div key={v.videoId} style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(15,61,94,0.08)' }}>
                              {v.videoType === 'youtube' && v.videoUrl ? (
                                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                                  <iframe src={getVideoEmbedUrl(v.videoUrl)} title={v.title || ''}
                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                                    allowFullScreen />
                                </div>
                              ) : v.videoUrl ? (
                                <video controls style={{ width: '100%', display: 'block' }}>
                                  <source src={v.videoUrl} />
                                </video>
                              ) : null}
                              {v.title && <div style={{ padding: '8px 10px', fontSize: 12, color: '#0F3D5E', fontWeight: 600 }}>{v.title}</div>}
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    <h3 style={{ color: '#0F3D5E', fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
                      <FileText size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                      {lang === 'vi' ? 'Tài liệu đính kèm' : 'Attached Documents'}
                    </h3>
                    {loadingMedia ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Skeleton key={i} height={48} borderRadius={8} />
                        ))}
                      </div>
                    ) : documents.length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center', color: '#5d7a8c', fontSize: 13 }}>
                        {lang === 'vi' ? 'Chưa có tài liệu' : 'No documents available'}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {documents.map(doc => {
                          const ext = doc.fileName?.split('.').pop()?.toUpperCase() || 'FILE';
                          return (
                            <div key={doc.documentId} style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              padding: '12px 14px', background: '#F8FAFC', borderRadius: 8,
                              border: '1px solid rgba(15,61,94,0.08)',
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{
                                  width: 36, height: 36, borderRadius: 6,
                                  background: ext === 'PDF' ? '#FDEDEC' : '#EBF5FB',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: 10, fontWeight: 700,
                                  color: ext === 'PDF' ? '#E74C3C' : '#1A5276',
                                }}>
                                  {ext}
                                </div>
                                <div>
                                  <div style={{ fontSize: 13, color: '#1a2332', fontWeight: 500 }}>{doc.fileName}</div>
                                  <div style={{ fontSize: 11, color: '#5d7a8c' }}>{formatSize(doc.fileSize)}</div>
                                </div>
                              </div>
                              {doc.fileUrl && (
                                <a href={doc.fileUrl} target="_blank" rel="noreferrer" style={{
                                  display: 'flex', alignItems: 'center', gap: 4,
                                  padding: '6px 12px', borderRadius: 6,
                                  background: '#0F3D5E', border: 'none', color: 'white',
                                  fontSize: 11, fontWeight: 600, cursor: 'pointer', textDecoration: 'none',
                                }}>
                                  <Download size={12} /> {t('detail.download')}
                                </a>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {!loadingMedia && videos.length === 0 && documents.length === 0 && (
                      <div style={{ padding: '24px', textAlign: 'center', color: '#5d7a8c', fontSize: 13 }}>
                        {lang === 'vi' ? 'Chưa có tài liệu hoặc video' : 'No documents or videos available'}
                      </div>
                    )}
                  </div>
                )}

                {/* GALLERY TAB */}
                {activeTab === 'gallery' && (
                  <div>
                    <h3 style={{ color: '#0F3D5E', fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
                      {lang === 'vi' ? 'Thư viện ảnh' : 'Photo Gallery'}
                    </h3>
                    {allImages.length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center', color: '#5d7a8c', fontSize: 13 }}>
                        {lang === 'vi' ? 'Chưa có ảnh' : 'No images available'}
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
                        {allImages.map((img, i) => (
                          <div key={i} onClick={() => setActiveTab('info')}
                            style={{ borderRadius: 8, overflow: 'hidden', height: 120, cursor: 'pointer', border: '2px solid transparent', transition: 'border-color 0.2s' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#D4A017'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'transparent'; }}>
                            <LazyImage src={getImageUrl(img)} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ===== SIDEBAR ===== */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <InfoCard
              title={name}
              subtitle={site.code}
              badges={[
                <span key="classification" style={{ padding: '3px 10px', borderRadius: 10, fontSize: 11, fontWeight: 700, background: `${getSafeColor(classificationColors, site.classification, '#7F8C8D')}15`, color: getSafeColor(classificationColors, site.classification, '#7F8C8D') }}>
                  {getSafeLabel(classificationLabels, site.classification)}
                </span>,
                <span key="type" style={{ padding: '3px 10px', borderRadius: 10, fontSize: 11, fontWeight: 600, background: '#EBF5FB', color: '#0F3D5E' }}>
                  {getSafeLabel(typeLabels, site.type)}
                </span>,
                <span key="status" style={{ padding: '3px 10px', borderRadius: 10, fontSize: 11, fontWeight: 600, background: `${getSafeColor(statusColors, site.status, '#27AE60')}15`, color: getSafeColor(statusColors, site.status, '#27AE60') }}>
                  {getSafeLabel(statusLabels, site.status)}
                </span>,
              ]}
              fields={[
                {
                  label: lang === 'vi' ? 'Địa chỉ' : 'Address',
                  value: (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                      <MapPin size={13} style={{ color: '#D4A017', marginTop: 1, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: '#5d7a8c', lineHeight: 1.4 }}>
                        {lang === 'vi' ? site.addressVi : site.addressEn}
                      </span>
                    </div>
                  ),
                },
                ...(site.yearBuilt ? [{
                  label: lang === 'vi' ? 'Năm xây dựng' : 'Year Built',
                  value: (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={13} style={{ color: '#D4A017' }} />
                      <span style={{ fontSize: 12, color: '#5d7a8c' }}>
                        {site.yearBuilt}
                      </span>
                    </div>
                  ),
                }] : []),
                ...(site.guardian ? [{
                  label: lang === 'vi' ? 'Đơn vị quản lý' : 'Managing Unit',
                  value: (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <User size={13} style={{ color: '#D4A017' }} />
                      <span style={{ fontSize: 12, color: '#5d7a8c' }}>{site.guardian}</span>
                    </div>
                  ),
                }] : []),
              ]}
              accentColor={getSafeColor(classificationColors, site.classification, '#7F8C8D')}
            />

            <div style={{ background: 'white', borderRadius: 12, padding: '16px', boxShadow: '0 2px 12px rgba(15,61,94,0.08)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  onClick={() => openGoogleMapsDirections(site.lat, site.lon)}
                  disabled={site.lat === null || site.lon === null}
                  title={site.lat === null || site.lon === null ? (lang === 'vi' ? 'Thiếu tọa độ' : 'Missing coordinates') : (lang === 'vi' ? 'Chỉ đường đến đây' : 'Directions')}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '10px', borderRadius: 8,
                    background: site.lat !== null && site.lon !== null ? '#0F3D5E' : '#F0F4F8',
                    color: site.lat !== null && site.lon !== null ? 'white' : '#cbced4',
                    fontSize: 13, fontWeight: 600, cursor: site.lat !== null && site.lon !== null ? 'pointer' : 'not-allowed', border: 'none',
                  }}>
                  <Navigation size={14} /> {t('detail.route')}
                </button>
              </div>
            </div>

            <ShareSection
              qrImageUrl={`/api/qr/heritage/${site.id}`}
              title={name}
              shareUrl={window.location.href}
            />

            {embedUrl && (
              <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(15,61,94,0.08)' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(15,61,94,0.08)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={14} style={{ color: '#D4A017' }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0F3D5E' }}>{t('detail.location')}</span>
                </div>
                <div style={{ height: 180 }}>
                  <iframe
                    src={embedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0, display: 'block' }}
                    allowFullScreen
                    loading="lazy"
                    title="Google Maps"
                  />
                </div>
                <div style={{ padding: '12px', textAlign: 'center' }}>
                  <button
                    onClick={() => openGoogleMapsDirections(site.lat, site.lon)}
                    disabled={site.lat === null || site.lon === null}
                    title={site.lat === null || site.lon === null ? (lang === 'vi' ? 'Thiếu tọa độ' : 'Missing coordinates') : (lang === 'vi' ? 'Mở trong Google Maps' : 'Open in Google Maps')}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '8px 20px', borderRadius: 8,
                      background: site.lat !== null && site.lon !== null ? '#D4A017' : '#F0F4F8',
                      color: site.lat !== null && site.lon !== null ? 'white' : '#cbced4',
                      fontSize: 13, fontWeight: 600, cursor: site.lat !== null && site.lon !== null ? 'pointer' : 'not-allowed', border: 'none',
                    }}>
                    <Globe size={14} /> {lang === 'vi' ? 'Mở trong Google Maps' : 'Open in Google Maps'}
                  </button>
                </div>
              </div>
            )}

            <RelatedItems
              title={lang === 'vi' ? 'Di tích liên quan' : 'Related Sites'}
              items={relatedSites.map(rs => ({
                id: rs.id,
                nameVi: rs.nameVi,
                nameEn: rs.nameEn,
                image: rs.image,
                subtitle: getSafeLabel(typeLabels, rs.type),
              }))}
              onItemClick={(id) => onNavigate('heritage-detail', id)}
              lang={lang}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
