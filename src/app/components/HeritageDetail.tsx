import { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { heritageSites } from '../../data/mockData';
import { typeLabels, classificationLabels, statusLabels } from '../../data/labels';
import { classificationColors, statusColors } from '../constants';
import {
  ArrowLeft, MapPin, Calendar, Download, Share2, QrCode, Navigation,
  ChevronLeft, ChevronRight, Eye, FileText, Image, Info, Clock, User,
  RotateCcw, X
} from 'lucide-react';

interface HeritageDetailProps {
  siteId: string;
  onNavigate: (page: string, id?: string) => void;
}

export function HeritageDetail({ siteId, onNavigate }: HeritageDetailProps) {
  const { lang, t } = useLanguage();
  const site = heritageSites.find(s => s.id === siteId) || heritageSites[0];
  const [activeImage, setActiveImage] = useState(0);
  const [showQr, setShowQr] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'docs' | 'gallery'>('info');
  const [show360, setShow360] = useState(false);

  const relatedSites = heritageSites.filter(s => s.id !== site.id && s.type === site.type).slice(0, 3);

  // Fake QR pattern
  const cells = 21;
  const seed = site.id.charCodeAt(0) + site.id.charCodeAt(1);
  const qrPattern = Array.from({ length: cells * cells }, (_, i) => {
    const row = Math.floor(i / cells);
    const col = i % cells;
    if ((row < 8 && col < 8) || (row < 8 && col > 12) || (row > 12 && col < 8)) return true;
    if ((row === 0 || row === 7 || row === 13 || row === 20) && ((col < 8) || (col > 12))) return true;
    return (((row * 7 + col * 3 + seed) % 5) < 2);
  });

  const allImages = site.images.length > 0 ? site.images : [site.image];

  return (
    <div style={{ background: '#F0F4F8', minHeight: '100vh' }}>
      {/* Breadcrumb header */}
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
          <span style={{ color: 'white', fontSize: 13 }}>{lang === 'vi' ? site.nameVi : site.nameEn}</span>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
          {/* Main content */}
          <div>
            {/* Image gallery */}
            <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', marginBottom: 20, boxShadow: '0 2px 12px rgba(15,61,94,0.08)' }}>
              {/* Main image */}
              <div style={{ position: 'relative', height: 400, background: '#dce8f0' }}>
                <img
                  src={allImages[activeImage]}
                  alt={lang === 'vi' ? site.nameVi : site.nameEn}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,61,94,0.4), transparent 50%)' }} />

                {/* 360 button */}
                <button
                  onClick={() => setShow360(true)}
                  style={{
                    position: 'absolute', top: 16, right: 16,
                    padding: '6px 14px', borderRadius: 6,
                    background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.3)',
                    color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6,
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  <RotateCcw size={14} /> {t('detail.panorama')}
                </button>

                {/* Navigation arrows */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImage(i => (i - 1 + allImages.length) % allImages.length)}
                      style={{
                        position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={() => setActiveImage(i => (i + 1) % allImages.length)}
                      style={{
                        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}

                {/* Image counter */}
                <div style={{
                  position: 'absolute', bottom: 16, right: 16,
                  background: 'rgba(0,0,0,0.5)', borderRadius: 12, padding: '3px 10px',
                  color: 'white', fontSize: 12,
                }}>
                  {activeImage + 1} / {allImages.length}
                </div>
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div style={{ display: 'flex', gap: 8, padding: '12px' }}>
                  {allImages.map((img, i) => (
                    <div
                      key={i}
                      onClick={() => setActiveImage(i)}
                      style={{
                        width: 72, height: 52, borderRadius: 6, overflow: 'hidden',
                        cursor: 'pointer', border: i === activeImage ? '2px solid #D4A017' : '2px solid transparent',
                        flexShrink: 0,
                      }}
                    >
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tabs */}
            <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(15,61,94,0.08)' }}>
              <div style={{ display: 'flex', borderBottom: '1px solid rgba(15,61,94,0.1)' }}>
                {[
                  { key: 'info', label: lang === 'vi' ? 'Thông tin' : 'Info', icon: <Info size={14} /> },
                  { key: 'history', label: lang === 'vi' ? 'Lịch sử' : 'History', icon: <Clock size={14} /> },
                  { key: 'docs', label: lang === 'vi' ? 'Tài liệu' : 'Documents', icon: <FileText size={14} /> },
                  { key: 'gallery', label: lang === 'vi' ? 'Thư viện' : 'Gallery', icon: <Image size={14} /> },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as typeof activeTab)}
                    style={{
                      flex: 1, padding: '14px 8px', border: 'none', cursor: 'pointer',
                      background: activeTab === tab.key ? '#EBF5FB' : 'white',
                      color: activeTab === tab.key ? '#0F3D5E' : '#5d7a8c',
                      fontSize: 12, fontWeight: activeTab === tab.key ? 700 : 500,
                      borderBottom: activeTab === tab.key ? '2px solid #D4A017' : '2px solid transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              <div style={{ padding: '20px' }}>
                {activeTab === 'info' && (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      {[
                        { label: t('detail.code'), value: site.code },
                        { label: t('detail.type'), value: `${typeLabels[site.type][lang]}` },
                        { label: t('detail.classification'), value: classificationLabels[site.classification][lang] },
                        { label: lang === 'vi' ? 'Trạng thái' : 'Status', value: statusLabels[site.status][lang] },
                        { label: lang === 'vi' ? 'Năm xây dựng' : 'Year Built', value: site.yearBuilt },
                        { label: lang === 'vi' ? 'Đơn vị quản lý' : 'Managing Unit', value: site.guardian },
                        { label: t('common.latitude'), value: `${site.lat.toFixed(6)}°N` },
                        { label: t('common.longitude'), value: `${site.lon.toFixed(6)}°E` },
                      ].map(item => (
                        <div key={item.label} style={{ padding: '12px', background: '#F8FAFC', borderRadius: 8 }}>
                          <div style={{ fontSize: 11, color: '#5d7a8c', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                            {item.label}
                          </div>
                          <div style={{ fontSize: 13, color: '#1a2332', fontWeight: 600 }}>
                            {item.label === t('detail.classification') ? (
                              <span style={{
                                padding: '2px 8px', borderRadius: 4, fontSize: 12,
                                background: `${classificationColors[site.classification]}15`,
                                color: classificationColors[site.classification], fontWeight: 700,
                              }}>{item.value}</span>
                            ) : item.label === (lang === 'vi' ? 'Trạng thái' : 'Status') ? (
                              <span style={{ color: statusColors[site.status] }}>{item.value}</span>
                            ) : item.value}
                          </div>
                        </div>
                      ))}
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
                        {t('common.description')}
                      </div>
                      <p style={{ fontSize: 13, color: '#1a2332', lineHeight: 1.7, margin: 0 }}>
                        {lang === 'vi' ? site.descriptionVi : site.descriptionEn}
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'history' && (
                  <div>
                    <h3 style={{ color: '#0F3D5E', fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
                      {t('detail.history')}
                    </h3>
                    <p style={{ fontSize: 14, color: '#1a2332', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                      {lang === 'vi' ? site.historyVi : site.historyEn}
                    </p>
                  </div>
                )}

                {activeTab === 'docs' && (
                  <div>
                    <h3 style={{ color: '#0F3D5E', fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
                      {t('detail.documents')}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {[
                        { name: lang === 'vi' ? `Hồ sơ di tích ${site.nameVi}.pdf` : `Heritage Profile ${site.nameEn}.pdf`, size: '2.4 MB', type: 'PDF' },
                        { name: lang === 'vi' ? `Quyết định xếp hạng ${site.code}.pdf` : `Classification Decision ${site.code}.pdf`, size: '840 KB', type: 'PDF' },
                        { name: lang === 'vi' ? `Bản vẽ kiến trúc.dwg` : `Architectural Drawing.dwg`, size: '5.1 MB', type: 'CAD' },
                        { name: lang === 'vi' ? `Báo cáo khảo sát 2023.docx` : `Survey Report 2023.docx`, size: '1.2 MB', type: 'WORD' },
                      ].map(doc => (
                        <div key={doc.name} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '12px 14px', background: '#F8FAFC', borderRadius: 8,
                          border: '1px solid rgba(15,61,94,0.08)',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 36, height: 36, borderRadius: 6,
                              background: doc.type === 'PDF' ? '#FDEDEC' : doc.type === 'CAD' ? '#EBF5FB' : '#FEF9E7',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 10, fontWeight: 700,
                              color: doc.type === 'PDF' ? '#E74C3C' : doc.type === 'CAD' ? '#1A5276' : '#D4A017',
                            }}>
                              {doc.type}
                            </div>
                            <div>
                              <div style={{ fontSize: 13, color: '#1a2332', fontWeight: 500 }}>{doc.name}</div>
                              <div style={{ fontSize: 11, color: '#5d7a8c' }}>{doc.size}</div>
                            </div>
                          </div>
                          <button style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            padding: '6px 12px', borderRadius: 6,
                            background: '#0F3D5E', border: 'none', color: 'white',
                            fontSize: 11, fontWeight: 600, cursor: 'pointer',
                          }}>
                            <Download size={12} /> {t('detail.download')}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'gallery' && (
                  <div>
                    <h3 style={{ color: '#0F3D5E', fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
                      {t('detail.gallery')}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                      {allImages.map((img, i) => (
                        <div key={i} onClick={() => { setActiveImage(i); setActiveTab('info'); }}
                          style={{ borderRadius: 8, overflow: 'hidden', height: 120, cursor: 'pointer', border: '2px solid transparent', transition: 'border-color 0.2s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#D4A017'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'transparent'; }}
                        >
                          <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Site title card */}
            <div style={{
              background: 'white', borderRadius: 12, overflow: 'hidden',
              boxShadow: '0 2px 12px rgba(15,61,94,0.08)',
              borderTop: `4px solid ${classificationColors[site.classification]}`,
            }}>
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: 10, fontSize: 11, fontWeight: 700,
                    background: `${classificationColors[site.classification]}15`,
                    color: classificationColors[site.classification],
                  }}>
                    {classificationLabels[site.classification][lang]}
                  </span>
                  <span style={{
                    padding: '3px 10px', borderRadius: 10, fontSize: 11, fontWeight: 600,
                    background: '#EBF5FB', color: '#0F3D5E',
                  }}>
                    {typeLabels[site.type][lang]}
                  </span>
                  <span style={{
                    padding: '3px 10px', borderRadius: 10, fontSize: 11, fontWeight: 600,
                    background: `${statusColors[site.status]}15`, color: statusColors[site.status],
                  }}>
                    {statusLabels[site.status][lang]}
                  </span>
                </div>
                <h1 style={{ color: '#0F3D5E', fontSize: 18, fontFamily: 'Merriweather, serif', fontWeight: 700, margin: '0 0 4px' }}>
                  {lang === 'vi' ? site.nameVi : site.nameEn}
                </h1>
                <div style={{ fontSize: 12, color: '#5d7a8c', marginBottom: 12 }}>
                  {site.code}
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, padding: '10px', background: '#F8FAFC', borderRadius: 8 }}>
                  <MapPin size={13} style={{ color: '#D4A017', marginTop: 1, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: '#5d7a8c', lineHeight: 1.4 }}>
                    {lang === 'vi' ? site.addressVi : site.addressEn}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                  <Calendar size={13} style={{ color: '#D4A017' }} />
                  <span style={{ fontSize: 12, color: '#5d7a8c' }}>
                    {lang === 'vi' ? `Xây dựng: ${site.yearBuilt}` : `Built: ${site.yearBuilt}`}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <User size={13} style={{ color: '#D4A017' }} />
                  <span style={{ fontSize: 12, color: '#5d7a8c' }}>{site.guardian}</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{
              background: 'white', borderRadius: 12, padding: '16px',
              boxShadow: '0 2px 12px rgba(15,61,94,0.08)',
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${site.lat},${site.lon}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '10px', borderRadius: 8,
                    background: '#0F3D5E', color: 'white',
                    fontSize: 13, fontWeight: 600, textDecoration: 'none',
                  }}
                >
                  <Navigation size={14} /> {t('detail.route')}
                </a>
                <button
                  onClick={() => setShowQr(true)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '10px', borderRadius: 8,
                    border: '1px solid #D4A017', background: 'rgba(212,160,23,0.05)',
                    color: '#B8860B', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  <QrCode size={14} /> {t('detail.share_qr')}
                </button>
                <button style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '10px', borderRadius: 8,
                  border: '1px solid rgba(15,61,94,0.2)', background: 'white',
                  color: '#0F3D5E', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}>
                  <Share2 size={14} /> {lang === 'vi' ? 'Chia sẻ' : 'Share'}
                </button>
              </div>
            </div>

            {/* Map embed */}
            <div style={{
              background: 'white', borderRadius: 12, overflow: 'hidden',
              boxShadow: '0 2px 12px rgba(15,61,94,0.08)',
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(15,61,94,0.08)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={14} style={{ color: '#D4A017' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0F3D5E' }}>{t('detail.location')}</span>
              </div>
              <div style={{ position: 'relative', height: 180, background: '#c8d8c0', overflow: 'hidden' }}>
                <img
                  src="https://images.unsplash.com/photo-1758298135151-e1283f571030?w=400&h=200&fit=crop&auto=format"
                  alt="Map"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(180,210,190,0.3)' }} />
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -100%)' }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50% 50% 50% 0',
                    transform: 'rotate(-45deg)', background: '#E74C3C',
                    border: '3px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  }} />
                </div>
                <div style={{
                  position: 'absolute', bottom: 8, left: 8, right: 8,
                  background: 'rgba(255,255,255,0.95)', borderRadius: 6, padding: '6px 10px', fontSize: 11,
                }}>
                  <span style={{ color: '#0F3D5E', fontWeight: 600 }}>📍 {site.lat.toFixed(4)}°N, {site.lon.toFixed(4)}°E</span>
                </div>
              </div>
            </div>

            {/* Related sites */}
            {relatedSites.length > 0 && (
              <div style={{
                background: 'white', borderRadius: 12, overflow: 'hidden',
                boxShadow: '0 2px 12px rgba(15,61,94,0.08)',
              }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(15,61,94,0.08)' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0F3D5E' }}>
                    {lang === 'vi' ? 'Di tích liên quan' : 'Related Sites'}
                  </span>
                </div>
                <div style={{ padding: '12px' }}>
                  {relatedSites.map(rs => (
                    <div
                      key={rs.id}
                      onClick={() => onNavigate('heritage-detail', rs.id)}
                      style={{
                        display: 'flex', gap: 10, padding: '8px',
                        borderRadius: 8, cursor: 'pointer',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#F0F4F8'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                    >
                      <img src={rs.image} alt="" style={{ width: 52, height: 40, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#0F3D5E', lineHeight: 1.3 }}>
                          {lang === 'vi' ? rs.nameVi : rs.nameEn}
                        </div>
                        <div style={{ fontSize: 11, color: '#5d7a8c' }}>{typeLabels[rs.type][lang]}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Modal */}
      {showQr && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={() => setShowQr(false)}>
          <div style={{
            background: 'white', borderRadius: 12, padding: 28, maxWidth: 320, width: '90%', textAlign: 'center',
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#0F3D5E', marginBottom: 4 }}>{t('detail.share_qr')}</h3>
            <p style={{ color: '#5d7a8c', fontSize: 12, marginBottom: 16 }}>
              {lang === 'vi' ? site.nameVi : site.nameEn}
            </p>
            <div style={{
              display: 'inline-grid', gridTemplateColumns: `repeat(${cells}, 8px)`,
              gap: 1, padding: 12, background: 'white', border: '2px solid #0F3D5E', borderRadius: 8, marginBottom: 16,
            }}>
              {qrPattern.map((filled, i) => (
                <div key={i} style={{ width: 8, height: 8, background: filled ? '#0F3D5E' : 'white' }} />
              ))}
            </div>
            <div style={{ fontSize: 11, color: '#5d7a8c', marginBottom: 16 }}>
              {lang === 'vi' ? 'Quét mã để xem chi tiết di tích' : 'Scan to view heritage details'}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button onClick={() => setShowQr(false)} style={{
                padding: '8px 20px', borderRadius: 6,
                background: '#0F3D5E', border: 'none', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>
                {t('common.close')}
              </button>
              <button style={{
                padding: '8px 20px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6,
                border: '1px solid #0F3D5E', background: 'white', color: '#0F3D5E', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>
                <Download size={14} /> {lang === 'vi' ? 'Tải xuống' : 'Download'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 360 Modal */}
      {show360 && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div style={{ color: 'white', fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
            🔄 {t('detail.panorama')} — {lang === 'vi' ? site.nameVi : site.nameEn}
          </div>
          <div style={{ position: 'relative', width: '80vw', height: '60vh', borderRadius: 12, overflow: 'hidden' }}>
            <img src={site.image} alt="360 view" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.9)' }} />
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.3)',
            }}>
              <div style={{ textAlign: 'center', color: 'white' }}>
                <RotateCcw size={48} style={{ opacity: 0.8, marginBottom: 8 }} />
                <p style={{ fontSize: 14, opacity: 0.8 }}>
                  {lang === 'vi' ? 'Chế độ xem 360° — Kéo để xoay' : '360° View Mode — Drag to rotate'}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShow360(false)}
            style={{
              marginTop: 16, padding: '10px 24px', borderRadius: 8,
              background: 'white', border: 'none', color: '#0F3D5E',
              fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <X size={14} /> {t('common.close')}
          </button>
        </div>
      )}
    </div>
  );
}
