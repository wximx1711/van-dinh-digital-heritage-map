import { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { apiGet, apiPut, apiPost } from '../services/api';
import { Upload, Save, Check, AlertTriangle, Image as ImageIcon, Trash2, X, Eye } from 'lucide-react';
import { getImageUrl } from '../utils/url';
import { MediaPicker } from './MediaPicker';

export function AboutPageManagement() {
  const { lang, t } = useLanguage();
  const [aboutId, setAboutId] = useState<number>(0);
  const [bannerImage, setBannerImage] = useState('');
  const [gallery, setGallery] = useState<string[]>([]);
  const [introductionVi, setIntroductionVi] = useState('');
  const [introductionEn, setIntroductionEn] = useState('');
  const [historyVi, setHistoryVi] = useState('');
  const [historyEn, setHistoryEn] = useState('');
  const [contactVi, setContactVi] = useState('');
  const [contactEn, setContactEn] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<'banner' | 'gallery' | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await apiGet<any>('/about');
      setAboutId(data.aboutId || 0);
      setBannerImage(data.bannerImage || '');
      const content = parseContent(data.content || '');
      setIntroductionVi(content.introductionVi || '');
      setIntroductionEn(content.introductionEn || '');
      setHistoryVi(content.historyVi || '');
      setHistoryEn(content.historyEn || '');
      setContactVi(content.contactVi || '');
      setContactEn(content.contactEn || '');
      setGallery(Array.isArray(content.gallery) ? content.gallery : []);
    } catch {
      showToast(lang === 'vi' ? 'Không thể tải dữ liệu' : 'Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const parseContent = (raw: string): Record<string, any> => {
    try { return JSON.parse(raw); } catch { return { introductionVi: raw || '', introductionEn: '', historyVi: '', historyEn: '', contactVi: '', contactEn: '', gallery: [] }; }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const content = JSON.stringify({ introductionVi, introductionEn, historyVi, historyEn, contactVi, contactEn, gallery });
      await apiPut('/about', { bannerImage, content });
      showToast(lang === 'vi' ? 'Đã cập nhật trang giới thiệu' : 'About page updated');
    } catch {
      showToast(lang === 'vi' ? 'Lưu thất bại' : 'Save failed', 'error');
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
    } catch {
      showToast(lang === 'vi' ? 'Tải ảnh thất bại' : 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingGallery(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await apiPost<{ url: string }>('/uploads/images', formData, true);
      setGallery(prev => [...prev, result.url]);
    } catch {
      showToast(lang === 'vi' ? 'Tải ảnh thất bại' : 'Upload failed', 'error');
    } finally {
      setUploadingGallery(false);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGallery(prev => prev.filter((_, i) => i !== index));
  };

  const openMediaPicker = (target: 'banner' | 'gallery') => {
    setMediaPickerTarget(target);
    setShowMediaPicker(true);
  };

  const handleMediaSelect = (url: string) => {
    if (mediaPickerTarget === 'banner') setBannerImage(url);
  };

  const handleMediaSelectMultiple = (urls: string[]) => {
    if (mediaPickerTarget === 'gallery') setGallery(prev => [...prev, ...urls]);
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
            {lang === 'vi' ? 'Ảnh banner' : 'Banner Image'}
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
                        <input type="file" accept=".jpg,.jpeg,.png,.webp" style={{ display: 'none' }} onChange={handleBannerUpload} disabled={uploading} />
                      </label>
                      <div onClick={() => openMediaPicker('banner')}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 6, border: '1px solid rgba(15,61,94,0.2)', background: 'white', color: '#0F3D5E', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                        <ImageIcon size={14} /> {lang === 'vi' ? 'Từ thư viện' : 'From Library'}
                      </div>
                    </div>
              <p style={{ fontSize: 10, color: '#cbced4', margin: '6px 0 0' }}>{lang === 'vi' ? 'PNG, JPG, WebP — tối đa 5MB' : 'PNG, JPG, WebP — max 5MB'}</p>
              {bannerImage && (
                <button onClick={() => setBannerImage('')} style={{
                  marginTop: 6, padding: '4px 10px', borderRadius: 4, border: '1px solid rgba(231,76,60,0.3)',
                  background: '#FDEDEC', color: '#E74C3C', fontSize: 11, cursor: 'pointer',
                }}>
                  {lang === 'vi' ? 'Xóa ảnh' : 'Remove Image'}
                </button>
              )}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.3 }}>
            {lang === 'vi' ? 'Thư viện ảnh' : 'Image Gallery'} <span style={{ color: '#5d7a8c', fontWeight: 400 }}>({gallery.length})</span>
          </label>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
            {gallery.map((url, i) => (
              <div key={i} style={{ position: 'relative', width: 100, height: 80, borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(15,61,94,0.1)' }}>
                <img src={getImageUrl(url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button onClick={() => removeGalleryImage(i)} style={{
                  position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%',
                  background: 'rgba(231,76,60,0.85)', border: 'none', color: 'white', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}><Trash2 size={10} /></button>
              </div>
            ))}
            <label style={{
              width: 100, height: 80, borderRadius: 6, border: '2px dashed rgba(15,61,94,0.15)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              cursor: uploadingGallery ? 'wait' : 'pointer', color: '#5d7a8c', fontSize: 10, gap: 4,
            }}>
              <Upload size={16} />
              {uploadingGallery ? (lang === 'vi' ? 'Đang tải...' : 'Uploading...') : (lang === 'vi' ? 'Tải lên' : 'Upload')}
              <input type="file" accept=".jpg,.jpeg,.png,.webp" style={{ display: 'none' }} onChange={handleGalleryUpload} disabled={uploadingGallery} />
            </label>
            <div onClick={() => openMediaPicker('gallery')}
              style={{ width: 100, height: 80, borderRadius: 6, border: '2px dashed rgba(15,61,94,0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#5d7a8c', fontSize: 10, gap: 4, background: '#F8FAFC' }}>
              <ImageIcon size={16} />
              {lang === 'vi' ? 'Thư viện' : 'Library'}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>
              {lang === 'vi' ? 'Giới thiệu (Tiếng Việt)' : 'Introduction (Vietnamese)'}
            </label>
            <textarea rows={5} style={{ ...inputStyle, resize: 'vertical' }} value={introductionVi} onChange={e => setIntroductionVi(e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>
              {lang === 'vi' ? 'Giới thiệu (Tiếng Anh)' : 'Introduction (English)'}
            </label>
            <textarea rows={5} style={{ ...inputStyle, resize: 'vertical' }} value={introductionEn} onChange={e => setIntroductionEn(e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>
              {lang === 'vi' ? 'Lịch sử (Tiếng Việt)' : 'Historical Overview (Vietnamese)'}
            </label>
            <textarea rows={6} style={{ ...inputStyle, resize: 'vertical' }} value={historyVi} onChange={e => setHistoryVi(e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>
              {lang === 'vi' ? 'Lịch sử (Tiếng Anh)' : 'Historical Overview (English)'}
            </label>
            <textarea rows={6} style={{ ...inputStyle, resize: 'vertical' }} value={historyEn} onChange={e => setHistoryEn(e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>
              {lang === 'vi' ? 'Thông tin liên hệ (Tiếng Việt)' : 'Contact Information (Vietnamese)'}
            </label>
            <textarea rows={4} style={{ ...inputStyle, resize: 'vertical' }} value={contactVi} onChange={e => setContactVi(e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>
              {lang === 'vi' ? 'Thông tin liên hệ (Tiếng Anh)' : 'Contact Information (English)'}
            </label>
            <textarea rows={4} style={{ ...inputStyle, resize: 'vertical' }} value={contactEn} onChange={e => setContactEn(e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid rgba(15,61,94,0.1)', paddingTop: 16 }}>
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

      <MediaPicker
        open={showMediaPicker}
        onClose={() => { setShowMediaPicker(false); setMediaPickerTarget(null); }}
        onSelect={handleMediaSelect}
        onSelectMultiple={handleMediaSelectMultiple}
        multiple={mediaPickerTarget === 'gallery'}
        title={mediaPickerTarget === 'banner'
          ? (lang === 'vi' ? 'Chọn ảnh banner' : 'Select Banner Image')
          : (lang === 'vi' ? 'Chọn ảnh cho thư viện' : 'Select Gallery Images')}
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
              <div style={{ fontSize: 14, lineHeight: 1.7, color: '#1a2332', whiteSpace: 'pre-line' }}>{introductionVi}</div>
              <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid rgba(15,61,94,0.1)' }} />
              <div style={{ fontSize: 14, lineHeight: 1.7, color: '#1a2332', whiteSpace: 'pre-line' }}>{introductionEn}</div>
              {gallery.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0F3D5E', marginBottom: 8 }}>{lang === 'vi' ? 'Thư viện ảnh' : 'Gallery'}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {gallery.map((url, i) => (
                      <img key={i} src={getImageUrl(url)} alt="" style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 6 }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}