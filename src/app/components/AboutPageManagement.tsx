import { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { apiGet, apiPut, apiPost } from '../services/api';
import { Upload, Save, Check, AlertTriangle, Image as ImageIcon, X, Eye, History } from 'lucide-react';
import { getImageUrl } from '../utils/url';
import { MediaPicker } from './MediaPicker';
import type { AboutPageData, AboutPageHistoryItem } from '../../core/types';

export function AboutPageManagement() {
  const { lang, t } = useLanguage();
  const [aboutId, setAboutId] = useState<number>(0);
  const [bannerImage, setBannerImage] = useState('');
  const [titleVi, setTitleVi] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [introductionVi, setIntroductionVi] = useState('');
  const [introductionEn, setIntroductionEn] = useState('');
  const [mainContentVi, setMainContentVi] = useState('');
  const [mainContentEn, setMainContentEn] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [historyList, setHistoryList] = useState<AboutPageHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await apiGet<AboutPageData>('/about');
      setAboutId(data.aboutId || 0);
      setBannerImage(data.bannerImage || '');
      setTitleVi(data.titleVi || '');
      setTitleEn(data.titleEn || '');
      setIntroductionVi(data.introductionVi || '');
      setIntroductionEn(data.introductionEn || '');
      setMainContentVi(data.mainContentVi || '');
      setMainContentEn(data.mainContentEn || '');
      setContactInfo(data.contactInfo || '');
      setUpdatedAt(data.updatedAt || '');
    } catch {
      showToast(lang === 'vi' ? 'Không thể tải dữ liệu' : 'Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await apiGet<AboutPageHistoryItem[]>('/about/history');
      setHistoryList(data || []);
    } catch {
      showToast(lang === 'vi' ? 'Không thể tải lịch sử' : 'Failed to load history', 'error');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleOpenHistory = async () => {
    setShowHistory(true);
    await fetchHistory();
  };

  useEffect(() => { fetchData(); }, []);

  const validateAboutForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!titleVi.trim() || titleVi.trim().length < 5 || titleVi.trim().length > 200)
      errors.titleVi = lang === 'vi' ? 'Tiêu đề (VI) phải từ 5-200 ký tự' : 'Title (VI) must be 5-200 characters';
    if (!titleEn.trim() || titleEn.trim().length < 5 || titleEn.trim().length > 200)
      errors.titleEn = lang === 'vi' ? 'Tiêu đề (EN) phải từ 5-200 ký tự' : 'Title (EN) must be 5-200 characters';
    if (!introductionVi.trim())
      errors.introductionVi = lang === 'vi' ? 'Giới thiệu (VI) là bắt buộc' : 'Introduction (VI) is required';
    if (!introductionEn.trim())
      errors.introductionEn = lang === 'vi' ? 'Giới thiệu (EN) là bắt buộc' : 'Introduction (EN) is required';
    if (!mainContentVi.trim())
      errors.mainContentVi = lang === 'vi' ? 'Nội dung chính (VI) là bắt buộc' : 'Main content (VI) is required';
    if (!mainContentEn.trim())
      errors.mainContentEn = lang === 'vi' ? 'Nội dung chính (EN) là bắt buộc' : 'Main content (EN) is required';
    if (!bannerImage.trim())
      errors.bannerImage = lang === 'vi' ? 'Ảnh banner là bắt buộc' : 'Banner image is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    setFormErrors({});
    if (!validateAboutForm()) return;
    setSaving(true);
    try {
      await apiPut('/about', {
        titleVi: titleVi.trim(),
        titleEn: titleEn.trim(),
        introductionVi: introductionVi.trim(),
        introductionEn: introductionEn.trim(),
        mainContentVi: mainContentVi.trim(),
        mainContentEn: mainContentEn.trim(),
        bannerImage: bannerImage || null,
        contactInfo: contactInfo.trim() || null,
      });
      await fetchData();
      showToast(lang === 'vi' ? 'Đã cập nhật trang giới thiệu' : 'About page updated');
    } catch (e: any) {
      showToast(e.message || (lang === 'vi' ? 'Lưu thất bại' : 'Save failed'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await apiPost<{ url: string }>('/uploads/images', formData, true);
      setBannerImage(result.url);
      setFormErrors(prev => { const next = { ...prev }; delete next.bannerImage; return next; });
    } catch {
      showToast(lang === 'vi' ? 'Tải ảnh thất bại' : 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const openMediaPicker = () => {
    setShowMediaPicker(true);
  };

  const handleMediaSelect = (url: string) => {
    setBannerImage(url);
    setFormErrors(prev => { const next = { ...prev }; delete next.bannerImage; return next; });
  };

  const inputStyle = {
    width: '100%', padding: '9px 12px', borderRadius: 6,
    border: '1.5px solid rgba(15,61,94,0.15)', fontSize: 13,
    background: '#F8FAFC', outline: 'none', boxSizing: 'border-box' as const,
  };

  if (loading) {
    return <div style={{ padding: '48px', textAlign: 'center', color: '#5d7a8c', fontSize: 13 }}>{t('common.loading')}</div>;
  }

  return (
    <div style={{ padding: '24px', position: 'relative' }}>
      {toast && (
        <div style={{
          position: 'fixed', top: 80, right: 24, zIndex: 1000, padding: '12px 16px', borderRadius: 8,
          background: toast.type === 'success' ? '#EAFAF1' : '#FDEDEC',
          border: `1px solid ${toast.type === 'success' ? '#27AE60' : '#E74C3C'}`,
          color: toast.type === 'success' ? '#27AE60' : '#E74C3C',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600,
        }}>
          {toast.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
          {toast.msg}
        </div>
      )}

      <h1 style={{ color: '#0F3D5E', margin: '0 0 4px', fontSize: 20, fontFamily: 'Merriweather, serif' }}>{t('admin.about')}</h1>
      <p style={{ color: '#5d7a8c', fontSize: 12, margin: '0 0 20px' }}>
        {lang === 'vi' ? 'Chỉnh sửa nội dung trang giới thiệu' : 'Edit about page content'}
      </p>

      <div style={{ background: 'white', borderRadius: 10, padding: '24px', boxShadow: '0 1px 6px rgba(15,61,94,0.06)' }}>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.3 }}>
            {lang === 'vi' ? 'Ảnh banner *' : 'Banner Image *'}
          </label>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{
              width: 320, height: 140, borderRadius: 8, overflow: 'hidden',
              background: '#dce8f0', border: '1px solid rgba(15,61,94,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              {bannerImage ? <img src={getImageUrl(bannerImage)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <ImageIcon size={32} style={{ color: '#5d7a8c', opacity: 0.5 }} />}
            </div>
            <div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <label style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: 6,
                  background: '#0F3D5E', color: 'white', fontSize: 12, fontWeight: 600,
                  cursor: uploading ? 'wait' : 'pointer', opacity: uploading ? 0.7 : 1,
                }}>
                  <Upload size={14} />
                  {uploading ? (lang === 'vi' ? 'Đang tải...' : 'Uploading...') : (lang === 'vi' ? 'Chọn ảnh' : 'Choose Image')}
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif" style={{ display: 'none' }} onChange={handleBannerUpload} disabled={uploading} />
                </label>
                <div onClick={openMediaPicker}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 6, border: '1px solid rgba(15,61,94,0.2)', background: 'white', color: '#0F3D5E', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  <ImageIcon size={14} /> {lang === 'vi' ? 'Từ thư viện' : 'From Library'}
                </div>
              </div>
              <p style={{ fontSize: 10, color: '#cbced4', margin: '6px 0 0' }}>{lang === 'vi' ? 'PNG, JPG, JPEG, WebP, HEIC, HEIF — tối đa 5MB' : 'PNG, JPG, JPEG, WebP, HEIC, HEIF — max 5MB'}</p>
              {bannerImage && (
                <button onClick={() => setBannerImage('')} style={{
                  marginTop: 6, padding: '4px 10px', borderRadius: 4, border: '1px solid rgba(231,76,60,0.3)',
                  background: '#FDEDEC', color: '#E74C3C', fontSize: 11, cursor: 'pointer',
                }}>
                  {lang === 'vi' ? 'Xóa ảnh' : 'Remove Image'}
                </button>
              )}
              {formErrors.bannerImage && <div style={{ fontSize: 11, color: '#E74C3C', marginTop: 4 }}>{formErrors.bannerImage}</div>}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>
              {lang === 'vi' ? 'Tiêu đề (Tiếng Việt) *' : 'Title (Vietnamese) *'}
            </label>
            <input style={inputStyle} value={titleVi} onChange={e => setTitleVi(e.target.value)} maxLength={200} />
            {formErrors.titleVi && <div style={{ fontSize: 11, color: '#E74C3C', marginTop: 4 }}>{formErrors.titleVi}</div>}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>
              {lang === 'vi' ? 'Tiêu đề (Tiếng Anh) *' : 'Title (English) *'}
            </label>
            <input style={inputStyle} value={titleEn} onChange={e => setTitleEn(e.target.value)} maxLength={200} />
            {formErrors.titleEn && <div style={{ fontSize: 11, color: '#E74C3C', marginTop: 4 }}>{formErrors.titleEn}</div>}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>
              {lang === 'vi' ? 'Giới thiệu (Tiếng Việt) *' : 'Introduction (Vietnamese) *'}
            </label>
            <textarea rows={5} style={{ ...inputStyle, resize: 'vertical' }} value={introductionVi} onChange={e => setIntroductionVi(e.target.value)} />
            {formErrors.introductionVi && <div style={{ fontSize: 11, color: '#E74C3C', marginTop: 4 }}>{formErrors.introductionVi}</div>}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>
              {lang === 'vi' ? 'Giới thiệu (Tiếng Anh) *' : 'Introduction (English) *'}
            </label>
            <textarea rows={5} style={{ ...inputStyle, resize: 'vertical' }} value={introductionEn} onChange={e => setIntroductionEn(e.target.value)} />
            {formErrors.introductionEn && <div style={{ fontSize: 11, color: '#E74C3C', marginTop: 4 }}>{formErrors.introductionEn}</div>}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>
              {lang === 'vi' ? 'Nội dung chính (Tiếng Việt) *' : 'Main Content (Vietnamese) *'}
            </label>
            <textarea rows={6} style={{ ...inputStyle, resize: 'vertical' }} value={mainContentVi} onChange={e => setMainContentVi(e.target.value)} />
            {formErrors.mainContentVi && <div style={{ fontSize: 11, color: '#E74C3C', marginTop: 4 }}>{formErrors.mainContentVi}</div>}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>
              {lang === 'vi' ? 'Nội dung chính (Tiếng Anh) *' : 'Main Content (English) *'}
            </label>
            <textarea rows={6} style={{ ...inputStyle, resize: 'vertical' }} value={mainContentEn} onChange={e => setMainContentEn(e.target.value)} />
            {formErrors.mainContentEn && <div style={{ fontSize: 11, color: '#E74C3C', marginTop: 4 }}>{formErrors.mainContentEn}</div>}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>
            {lang === 'vi' ? 'Thông tin liên hệ' : 'Contact Information'}
          </label>
          <textarea rows={3} style={{ ...inputStyle, resize: 'vertical' }} value={contactInfo} onChange={e => setContactInfo(e.target.value)} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid rgba(15,61,94,0.1)', paddingTop: 16 }}>
          {updatedAt && (
            <div style={{ fontSize: 11, color: '#5d7a8c', textAlign: 'right' }}>
              {lang === 'vi' ? 'Cập nhật lần cuối: ' : 'Last updated: '}{new Date(updatedAt).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US')}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button onClick={handleOpenHistory} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 20px', borderRadius: 8,
              border: '1px solid rgba(15,61,94,0.2)', background: 'white',
              color: '#0F3D5E', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>
              <History size={16} /> {lang === 'vi' ? 'Lịch sử' : 'History'}
            </button>
            <button onClick={() => setShowPreview(true)} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 20px', borderRadius: 8,
              border: '1px solid rgba(15,61,94,0.2)', background: 'white',
              color: '#0F3D5E', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>
              <Eye size={16} /> {lang === 'vi' ? 'Xem trước' : 'Preview'}
            </button>
            <button onClick={handleSave} disabled={saving}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 24px', borderRadius: 8,
                background: saving ? '#5d7a8c' : '#0F3D5E', border: 'none', color: 'white',
                fontSize: 13, fontWeight: 600, cursor: saving ? 'wait' : 'pointer',
                boxShadow: '0 4px 12px rgba(15,61,94,0.3)',
              }}>
              <Save size={16} />
              {saving ? (lang === 'vi' ? 'Đang lưu...' : 'Saving...') : t('common.save')}
            </button>
          </div>
        </div>
      </div>

      <MediaPicker
        open={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={handleMediaSelect}
        onSelectMultiple={() => {}}
        multiple={false}
        title={lang === 'vi' ? 'Chọn ảnh banner' : 'Select Banner Image'}
      />

      {showPreview && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setShowPreview(false)}>
          <div style={{ background: '#F0F4F8', borderRadius: 12, width: '90%', maxWidth: 600, maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding: '14px 20px', background: '#0F3D5E', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>{lang === 'vi' ? 'Xem trước trang giới thiệu' : 'About Page Preview'}</span>
              <button onClick={() => setShowPreview(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              {bannerImage && (
                <img src={getImageUrl(bannerImage)} alt="" style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8, marginBottom: 16 }} />
              )}
              <h2 style={{ color: '#0F3D5E', fontFamily: 'Merriweather, serif', fontSize: 18, margin: '0 0 8px' }}>{titleVi}</h2>
              <div style={{ fontSize: 14, lineHeight: 1.7, color: '#1a2332', whiteSpace: 'pre-line' }}>{introductionVi}</div>
              <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid rgba(15,61,94,0.1)' }} />
              <h2 style={{ color: '#0F3D5E', fontFamily: 'Merriweather, serif', fontSize: 18, margin: '0 0 8px' }}>{titleEn}</h2>
              <div style={{ fontSize: 14, lineHeight: 1.7, color: '#1a2332', whiteSpace: 'pre-line' }}>{introductionEn}</div>
            </div>
          </div>
        </div>
      )}

      {showHistory && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setShowHistory(false)}>
          <div style={{ background: '#F0F4F8', borderRadius: 12, width: '90%', maxWidth: 700, maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding: '14px 20px', background: '#0F3D5E', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>{lang === 'vi' ? 'Lịch sử chỉnh sửa' : 'Version History'}</span>
              <button onClick={() => setShowHistory(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
              {loadingHistory ? (
                <div style={{ textAlign: 'center', padding: 24, color: '#5d7a8c', fontSize: 13 }}>{t('common.loading')}</div>
              ) : historyList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 24, color: '#5d7a8c', fontSize: 13 }}>
                  {lang === 'vi' ? 'Chưa có lịch sử chỉnh sửa' : 'No edit history available'}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {historyList.map((h) => (
                    <div key={h.historyId} style={{
                      background: 'white', borderRadius: 8, padding: 14,
                      border: '1px solid rgba(15,61,94,0.1)',
                    }}>
                      <div style={{ fontSize: 11, color: '#5d7a8c', marginBottom: 8 }}>
                        {new Date(h.createdAt).toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US')}
                        <span style={{ margin: '0 8px' }}>|</span>
                        {lang === 'vi' ? 'Người chỉnh sửa:' : 'Edited by:'} ID {h.updatedBy}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
                        <div>
                          <span style={{ fontWeight: 700, color: '#0F3D5E' }}>{lang === 'vi' ? 'Tiêu đề VI:' : 'Title VI:'}</span>
                          <span style={{ color: '#1a2332', marginLeft: 4 }}>{h.titleVi || '-'}</span>
                        </div>
                        <div>
                          <span style={{ fontWeight: 700, color: '#0F3D5E' }}>{lang === 'vi' ? 'Tiêu đề EN:' : 'Title EN:'}</span>
                          <span style={{ color: '#1a2332', marginLeft: 4 }}>{h.titleEn || '-'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}