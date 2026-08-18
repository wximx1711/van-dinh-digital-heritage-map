import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLanguage } from './LanguageContext';
import { useSystemSettings } from './SystemSettingsContext';
import { apiGet, apiPut, apiPost, apiDelete } from '../services/api';
import { Save, Check, AlertTriangle, Plus, Pencil, Trash2, X, ArrowUp, ArrowDown, EyeOff, Eye, Upload, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import { FormSkeleton } from './Skeleton';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';
import { uploadFileWithProgress } from '../services/uploadService';
import { getImageUrl } from '../utils/url';
import { MediaPicker } from './MediaPicker';
import { LazyImage } from './LazyImage';

interface SystemSettingsManagementProps {
  onDirtyChange?: (dirty: boolean) => void;
}

interface RelatedLink {
  linkId: number;
  title: string;
  url: string;
  displayOrder: number;
  isEnabled: boolean;
  createdAt: string;
}

export function SystemSettingsManagement({ onDirtyChange }: SystemSettingsManagementProps) {
  const { lang, t } = useLanguage();
  const { updateSettings } = useSystemSettings();
  const [form, setForm] = useState({
    websiteName: '', logoUrl: '', footerText: '',
    contactEmail: '', phone: '', address: '',
    facebookUrl: '', tiktokUrl: '', youtubeUrl: '',
    homeBackgroundType: '', homeBackgroundImageUrl: '',
    homeBackgroundVideoUrl: '', homeBackgroundVideoPosterUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [bgUploading, setBgUploading] = useState<'image' | 'video' | 'poster' | null>(null);
  const [bgUploadProgress, setBgUploadProgress] = useState(0);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<'image' | 'poster' | null>(null);
  const initialSnapshotRef = useRef<string | null>(null);

  // Related Links state
  const [links, setLinks] = useState<RelatedLink[]>([]);
  const [linksLoading, setLinksLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [linkForm, setLinkForm] = useState({ title: '', url: '', displayOrder: 0, isEnabled: true });
  const [linksSaving, setLinksSaving] = useState(false);

  const isDirty = useMemo(() => {
    if (!initialSnapshotRef.current) return false;
    return JSON.stringify(form) !== initialSnapshotRef.current;
  }, [form]);

  const unsaved = useUnsavedChanges(onDirtyChange);

  useEffect(() => {
    unsaved.setIsDirty(isDirty);
  }, [isDirty]);

  const saveSnapshot = useCallback(() => {
    initialSnapshotRef.current = JSON.stringify(form);
  }, [form]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await apiGet<any>('/system-settings');
      const newForm = {
        websiteName: data.websiteName || '',
        logoUrl: data.logoUrl || '',
        footerText: data.footerText || '',
        contactEmail: data.contactEmail || '',
        phone: data.phone || '',
        address: data.address || '',
        facebookUrl: data.facebookUrl || '',
        tiktokUrl: data.tiktokUrl || '',
        youtubeUrl: data.youtubeUrl || '',
        homeBackgroundType: data.homeBackgroundType || '',
        homeBackgroundImageUrl: data.homeBackgroundImageUrl || '',
        homeBackgroundVideoUrl: data.homeBackgroundVideoUrl || '',
        homeBackgroundVideoPosterUrl: data.homeBackgroundVideoPosterUrl || '',
      };
      setForm(newForm);
      initialSnapshotRef.current = JSON.stringify(newForm);
    } catch {
      showToast(lang === 'vi' ? 'Không thể tải cài đặt' : 'Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Related Links data
  const fetchLinks = async () => {
    setLinksLoading(true);
    try {
      const data = await apiGet<RelatedLink[]>('/related-links');
      setLinks(data || []);
    } catch {
      showToast(lang === 'vi' ? 'Không thể tải danh sách' : 'Failed to load links', 'error');
    } finally {
      setLinksLoading(false);
    }
  };

  useEffect(() => { fetchLinks(); }, []);

  const resetLinkForm = () => {
    setEditingId(null);
    setLinkForm({ title: '', url: '', displayOrder: 0, isEnabled: true });
  };

  const startEdit = (link: RelatedLink) => {
    setEditingId(link.linkId);
    setLinkForm({ title: link.title, url: link.url, displayOrder: link.displayOrder, isEnabled: link.isEnabled });
  };

  const validateLink = (): string | null => {
    if (!linkForm.title.trim()) return lang === 'vi' ? 'Vui lòng nhập tiêu đề' : 'Title is required';
    if (!linkForm.url.trim()) return lang === 'vi' ? 'Vui lòng nhập URL' : 'URL is required';
    try { new URL(linkForm.url); } catch { return lang === 'vi' ? 'URL không hợp lệ' : 'Invalid URL format'; }
    return null;
  };

  const handleSaveLink = async () => {
    const error = validateLink();
    if (error) { showToast(error, 'error'); return; }
    setLinksSaving(true);
    try {
      const payload = { title: linkForm.title.trim(), url: linkForm.url.trim(), displayOrder: linkForm.displayOrder, isEnabled: linkForm.isEnabled };
      if (editingId) {
        await apiPut(`/related-links/${editingId}`, payload);
        showToast(lang === 'vi' ? 'Đã cập nhật' : 'Link updated');
      } else {
        await apiPost('/related-links', payload);
        showToast(lang === 'vi' ? 'Đã thêm' : 'Link created');
      }
      resetLinkForm();
      await fetchLinks();
    } catch {
      showToast(lang === 'vi' ? 'Lưu thất bại' : 'Save failed', 'error');
    } finally {
      setLinksSaving(false);
    }
  };

  const handleDeleteLink = async (id: number) => {
    if (!confirm(lang === 'vi' ? 'Xóa liên kết này?' : 'Delete this link?')) return;
    try {
      await apiDelete(`/related-links/${id}`);
      showToast(lang === 'vi' ? 'Đã xóa' : 'Link deleted');
      await fetchLinks();
    } catch {
      showToast(lang === 'vi' ? 'Xóa thất bại' : 'Delete failed', 'error');
    }
  };

  const handleToggleEnabled = async (link: RelatedLink) => {
    setLinksSaving(true);
    try {
      await apiPut(`/related-links/${link.linkId}`, {
        title: link.title, url: link.url, displayOrder: link.displayOrder, isEnabled: !link.isEnabled,
      });
      await fetchLinks();
    } catch {
      showToast(lang === 'vi' ? 'Cập nhật thất bại' : 'Update failed', 'error');
    } finally {
      setLinksSaving(false);
    }
  };

  const moveOrder = async (link: RelatedLink, direction: number) => {
    const sorted = [...links].sort((a, b) => a.displayOrder - b.displayOrder);
    const idx = sorted.findIndex(l => l.linkId === link.linkId);
    const target = idx + direction;
    if (target < 0 || target >= sorted.length) return;
    const swap = sorted[target];
    try {
      await apiPut(`/related-links/${link.linkId}`, { ...link, displayOrder: swap.displayOrder });
      await apiPut(`/related-links/${swap.linkId}`, { ...swap, displayOrder: link.displayOrder });
      await fetchLinks();
    } catch {
      showToast(lang === 'vi' ? 'Sắp xếp thất bại' : 'Reorder failed', 'error');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiPut('/system-settings', form);
      updateSettings({ ...form, updatedAt: new Date().toISOString() });
      saveSnapshot();
      unsaved.markClean();
      showToast(lang === 'vi' ? 'Đã lưu cài đặt' : 'Settings saved');
    } catch {
      showToast(lang === 'vi' ? 'Lưu thất bại' : 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'image' | 'video' | 'poster') => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBgUploading(target);
    setBgUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await uploadFileWithProgress({
        path: target === 'video' ? '/uploads/videos' : '/uploads/images',
        formData,
        onProgress: setBgUploadProgress,
      });
      if (target === 'image') setForm(s => ({ ...s, homeBackgroundImageUrl: result.url }));
      else if (target === 'video') setForm(s => ({ ...s, homeBackgroundVideoUrl: result.url }));
      else setForm(s => ({ ...s, homeBackgroundVideoPosterUrl: result.url }));
      showToast(lang === 'vi' ? 'Tải lên thành công' : 'Upload successful');
    } catch {
      showToast(lang === 'vi' ? 'Tải lên thất bại' : 'Upload failed', 'error');
    } finally {
      setBgUploading(null);
      setBgUploadProgress(0);
    }
  };

  const openBackgroundPicker = (target: 'image' | 'poster') => {
    setMediaPickerTarget(target);
    setShowMediaPicker(true);
  };

  const handleBackgroundSelect = (url: string) => {
    if (mediaPickerTarget === 'poster') setForm(s => ({ ...s, homeBackgroundVideoPosterUrl: url }));
    else setForm(s => ({ ...s, homeBackgroundImageUrl: url }));
  };

  const inputStyle = {
    width: '100%', padding: '9px 12px', borderRadius: 6,
    border: '1.5px solid rgba(15,61,94,0.15)', fontSize: 13,
    background: '#F8FAFC', outline: 'none', boxSizing: 'border-box' as const,
  };

  if (loading) {
    return <FormSkeleton />;
  }

  const sortedLinks = [...links].sort((a, b) => a.displayOrder - b.displayOrder);

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

      <h1 style={{ color: '#0F3D5E', margin: '0 0 4px', fontSize: 20, fontFamily: 'Merriweather, serif' }}>{t('admin.settings')}</h1>
      <p style={{ color: '#5d7a8c', fontSize: 12, margin: '0 0 20px' }}>
        {lang === 'vi' ? 'Cấu hình thông tin chung của hệ thống' : 'Configure general system information'}
      </p>

      {/* Website Settings */}
      <div style={{ background: 'white', borderRadius: 10, padding: '24px', boxShadow: '0 1px 6px rgba(15,61,94,0.06)', marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>{lang === 'vi' ? 'Tên website' : 'Website Name'}</label>
            <input style={inputStyle} value={form.websiteName} onChange={e => setForm(s => ({ ...s, websiteName: e.target.value }))} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>{lang === 'vi' ? 'Footer text' : 'Footer Text'}</label>
            <textarea rows={2} style={{ ...inputStyle, resize: 'vertical' }} value={form.footerText} onChange={e => setForm(s => ({ ...s, footerText: e.target.value }))} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>Email</label>
            <input style={inputStyle} type="email" value={form.contactEmail} onChange={e => setForm(s => ({ ...s, contactEmail: e.target.value }))} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>{lang === 'vi' ? 'Số điện thoại' : 'Phone'}</label>
            <input style={inputStyle} value={form.phone} onChange={e => setForm(s => ({ ...s, phone: e.target.value }))} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>{lang === 'vi' ? 'Địa chỉ' : 'Address'}</label>
            <input style={inputStyle} value={form.address} onChange={e => setForm(s => ({ ...s, address: e.target.value }))} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>Facebook URL</label>
            <input style={inputStyle} value={form.facebookUrl} onChange={e => setForm(s => ({ ...s, facebookUrl: e.target.value }))} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>TikTok URL</label>
            <input style={inputStyle} value={form.tiktokUrl} onChange={e => setForm(s => ({ ...s, tiktokUrl: e.target.value }))} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>YouTube URL</label>
            <input style={inputStyle} value={form.youtubeUrl} onChange={e => setForm(s => ({ ...s, youtubeUrl: e.target.value }))} />
          </div>
        </div>
        {/* HomePage Background */}
        <div style={{ borderTop: '1px solid rgba(15,61,94,0.1)', marginBottom: 20, paddingTop: 20 }}>
          <h2 style={{ color: '#0F3D5E', margin: '0 0 4px', fontSize: 18, fontFamily: 'Merriweather, serif' }}>
            {lang === 'vi' ? 'Nền trang chủ' : 'HomePage Background'}
          </h2>
          <p style={{ color: '#5d7a8c', fontSize: 12, margin: '0 0 16px' }}>
            {lang === 'vi' ? 'Chọn ảnh hoặc video làm nền trang chủ. Nếu chưa cấu hình sẽ dùng nền mặc định.' : 'Choose an image or video as the homepage background. Defaults to the built-in background when not configured.'}
          </p>

          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button onClick={() => setForm(s => ({ ...s, homeBackgroundType: 'image' }))}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 6,
                background: form.homeBackgroundType !== 'video' ? '#0F3D5E' : 'white',
                border: `1px solid ${form.homeBackgroundType !== 'video' ? '#0F3D5E' : 'rgba(15,61,94,0.2)'}`,
                color: form.homeBackgroundType !== 'video' ? 'white' : '#0F3D5E',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}>
              <ImageIcon size={14} /> {lang === 'vi' ? 'Ảnh nền' : 'Image'}
            </button>
            <button onClick={() => setForm(s => ({ ...s, homeBackgroundType: 'video' }))}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 6,
                background: form.homeBackgroundType === 'video' ? '#0F3D5E' : 'white',
                border: `1px solid ${form.homeBackgroundType === 'video' ? '#0F3D5E' : 'rgba(15,61,94,0.2)'}`,
                color: form.homeBackgroundType === 'video' ? 'white' : '#0F3D5E',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}>
              <VideoIcon size={14} /> {lang === 'vi' ? 'Video nền' : 'Video'}
            </button>
          </div>

          {form.homeBackgroundType !== 'video' ? (
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{
                width: 320, height: 140, borderRadius: 8, overflow: 'hidden',
                background: '#dce8f0', border: '1px solid rgba(15,61,94,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {form.homeBackgroundImageUrl ? <LazyImage src={getImageUrl(form.homeBackgroundImageUrl)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <ImageIcon size={32} style={{ color: '#5d7a8c', opacity: 0.5 }} />}
              </div>
              <div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <label style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '8px 16px', borderRadius: 6,
                    background: '#0F3D5E', color: 'white', fontSize: 12, fontWeight: 600,
                    cursor: bgUploading !== null ? 'wait' : 'pointer', opacity: bgUploading !== null ? 0.7 : 1,
                  }}>
                    <Upload size={14} />
                    {bgUploading === 'image' ? `${bgUploadProgress}%` : (lang === 'vi' ? 'Chọn ảnh' : 'Choose Image')}
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif" style={{ display: 'none' }} onChange={e => handleBackgroundUpload(e, 'image')} disabled={bgUploading !== null} />
                  </label>
                  <div onClick={() => openBackgroundPicker('image')}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 6, border: '1px solid rgba(15,61,94,0.2)', background: 'white', color: '#0F3D5E', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    <ImageIcon size={14} /> {lang === 'vi' ? 'Từ thư viện' : 'From Library'}
                  </div>
                  {form.homeBackgroundImageUrl && (
                    <button onClick={() => setForm(s => ({ ...s, homeBackgroundImageUrl: '' }))} style={{
                      padding: '8px 16px', borderRadius: 6, border: '1px solid rgba(231,76,60,0.3)',
                      background: '#FDEDEC', color: '#E74C3C', fontSize: 12, cursor: 'pointer',
                    }}>
                      {lang === 'vi' ? 'Xóa ảnh' : 'Remove Image'}
                    </button>
                  )}
                </div>
                {bgUploading === 'image' && (
                  <div style={{ marginTop: 8, width: 320, height: 6, background: '#dce8f0', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${bgUploadProgress}%`, height: '100%', background: '#D4A017', borderRadius: 3, transition: 'width 0.2s ease' }} />
                  </div>
                )}
                <p style={{ fontSize: 10, color: '#cbced4', margin: '6px 0 0' }}>{lang === 'vi' ? 'PNG, JPG, JPEG, WebP, HEIC, HEIF — tối đa 5MB' : 'PNG, JPG, JPEG, WebP, HEIC, HEIF — max 5MB'}</p>
              </div>
            </div>
          ) : (
            <div>
              <div style={{
                width: 320, height: 170, borderRadius: 8, overflow: 'hidden',
                background: '#0d1b2a', border: '1px solid rgba(15,61,94,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
              }}>
                {form.homeBackgroundVideoUrl ? (
                  <video key={form.homeBackgroundVideoUrl} src={getImageUrl(form.homeBackgroundVideoUrl)} poster={form.homeBackgroundVideoPosterUrl ? getImageUrl(form.homeBackgroundVideoPosterUrl) : undefined} controls muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : form.homeBackgroundImageUrl ? (
                  <LazyImage src={getImageUrl(form.homeBackgroundImageUrl)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <VideoIcon size={32} style={{ color: '#5d7a8c', opacity: 0.5 }} />
                )}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <label style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: 6,
                  background: '#0F3D5E', color: 'white', fontSize: 12, fontWeight: 600,
                  cursor: bgUploading !== null ? 'wait' : 'pointer', opacity: bgUploading !== null ? 0.7 : 1,
                }}>
                  <Upload size={14} />
                  {bgUploading === 'video' ? `${bgUploadProgress}%` : (lang === 'vi' ? 'Chọn video' : 'Choose Video')}
                  <input type="file" accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov" style={{ display: 'none' }} onChange={e => handleBackgroundUpload(e, 'video')} disabled={bgUploading !== null} />
                </label>
                {form.homeBackgroundVideoUrl && (
                  <button onClick={() => setForm(s => ({ ...s, homeBackgroundVideoUrl: '' }))} style={{
                    padding: '8px 16px', borderRadius: 6, border: '1px solid rgba(231,76,60,0.3)',
                    background: '#FDEDEC', color: '#E74C3C', fontSize: 12, cursor: 'pointer',
                  }}>
                    {lang === 'vi' ? 'Xóa video' : 'Remove Video'}
                  </button>
                )}
              </div>
              {bgUploading === 'video' && (
                <div style={{ marginTop: 8, width: 320, height: 6, background: '#dce8f0', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${bgUploadProgress}%`, height: '100%', background: '#D4A017', borderRadius: 3, transition: 'width 0.2s ease' }} />
                </div>
              )}
              <p style={{ fontSize: 10, color: '#cbced4', margin: '6px 0 0' }}>{lang === 'vi' ? 'MP4, WebM, MOV — tối đa 100MB' : 'MP4, WebM, MOV — max 100MB'}</p>

              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(15,61,94,0.08)' }}>
                <div style={{
                  width: 120, height: 68, borderRadius: 6, overflow: 'hidden',
                  background: '#dce8f0', border: '1px solid rgba(15,61,94,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {form.homeBackgroundVideoPosterUrl ? <LazyImage src={getImageUrl(form.homeBackgroundVideoPosterUrl)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <ImageIcon size={20} style={{ color: '#5d7a8c', opacity: 0.5 }} />}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                    {lang === 'vi' ? 'Ảnh đại diện (poster) — tùy chọn' : 'Video Poster (optional)'}
                  </label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <label style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '7px 12px', borderRadius: 6,
                      background: '#0F3D5E', color: 'white', fontSize: 11, fontWeight: 600,
                      cursor: bgUploading !== null ? 'wait' : 'pointer', opacity: bgUploading !== null ? 0.7 : 1,
                    }}>
                      <Upload size={13} />
                      {bgUploading === 'poster' ? `${bgUploadProgress}%` : (lang === 'vi' ? 'Chọn ảnh' : 'Choose Image')}
                      <input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif" style={{ display: 'none' }} onChange={e => handleBackgroundUpload(e, 'poster')} disabled={bgUploading !== null} />
                    </label>
                    <div onClick={() => openBackgroundPicker('poster')}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 6, border: '1px solid rgba(15,61,94,0.2)', background: 'white', color: '#0F3D5E', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                      <ImageIcon size={13} /> {lang === 'vi' ? 'Từ thư viện' : 'From Library'}
                    </div>
                    {form.homeBackgroundVideoPosterUrl && (
                      <button onClick={() => setForm(s => ({ ...s, homeBackgroundVideoPosterUrl: '' }))} style={{
                        padding: '7px 12px', borderRadius: 6, border: '1px solid rgba(231,76,60,0.3)',
                        background: '#FDEDEC', color: '#E74C3C', fontSize: 11, cursor: 'pointer',
                      }}>
                        {lang === 'vi' ? 'Xóa poster' : 'Remove Poster'}
                      </button>
                    )}
                  </div>
                  {bgUploading === 'poster' && (
                    <div style={{ marginTop: 8, width: 200, height: 6, background: '#dce8f0', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${bgUploadProgress}%`, height: '100%', background: '#D4A017', borderRadius: 3, transition: 'width 0.2s ease' }} />
                    </div>
                  )}
                  <p style={{ fontSize: 10, color: '#cbced4', margin: '6px 0 0' }}>{lang === 'vi' ? 'PNG, JPG, JPEG, WebP, HEIC, HEIF — tối đa 5MB' : 'PNG, JPG, JPEG, WebP, HEIC, HEIF — max 5MB'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid rgba(15,61,94,0.1)', paddingTop: 16 }}>
          <button onClick={handleSave} disabled={saving}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '10px 24px', borderRadius: 8,
              background: saving ? '#5d7a8c' : '#0F3D5E', border: 'none', color: 'white',
              fontSize: 13, fontWeight: 600, cursor: saving ? 'wait' : 'pointer',
              boxShadow: '0 4px 12px rgba(15,61,94,0.3)',
            }}>
            <Save size={16} /> {saving ? (lang === 'vi' ? 'Đang lưu...' : 'Saving...') : t('common.save')}
          </button>
        </div>
      </div>

      {/* Footer Related Links Section */}
      <div style={{ background: 'white', borderRadius: 10, padding: '24px', boxShadow: '0 1px 6px rgba(15,61,94,0.06)' }}>
        <h2 style={{ color: '#0F3D5E', margin: '0 0 4px', fontSize: 18, fontFamily: 'Merriweather, serif' }}>
          {lang === 'vi' ? 'Liên kết liên quan (Footer)' : 'Footer Related Links'}
        </h2>
        <p style={{ color: '#5d7a8c', fontSize: 12, margin: '0 0 20px' }}>
          {lang === 'vi' ? 'Quản lý các liên kết hiển thị trong Footer' : 'Manage links displayed in the Footer'}
        </p>

        {/* Add/Edit form */}
        <div style={{ background: '#F8FAFC', borderRadius: 8, padding: '16px', marginBottom: 16, border: '1px solid rgba(15,61,94,0.08)' }}>
          <h3 style={{ color: '#0F3D5E', fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>
            {editingId
              ? (lang === 'vi' ? 'Chỉnh sửa liên kết' : 'Edit Link')
              : (lang === 'vi' ? 'Thêm liên kết mới' : 'Add New Link')}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 80px auto', gap: 10, alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#5d7a8c', marginBottom: 3, textTransform: 'uppercase' }}>
                {lang === 'vi' ? 'Tiêu đề' : 'Title'}
              </label>
              <input style={inputStyle} value={linkForm.title} onChange={e => setLinkForm(s => ({ ...s, title: e.target.value }))} placeholder={lang === 'vi' ? 'VD: Bộ Văn hóa' : 'e.g. Ministry of Culture'} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#5d7a8c', marginBottom: 3, textTransform: 'uppercase' }}>URL</label>
              <input style={inputStyle} value={linkForm.url} onChange={e => setLinkForm(s => ({ ...s, url: e.target.value }))} placeholder="https://..." />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#5d7a8c', marginBottom: 3, textTransform: 'uppercase' }}>
                {lang === 'vi' ? 'Thứ tự' : 'Order'}
              </label>
              <input type="number" min={0} style={inputStyle} value={linkForm.displayOrder} onChange={e => setLinkForm(s => ({ ...s, displayOrder: parseInt(e.target.value) || 0 }))} />
            </div>
            <div style={{ display: 'flex', gap: 6, paddingBottom: 1 }}>
              <button onClick={handleSaveLink} disabled={linksSaving}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4, padding: '9px 14px', borderRadius: 6,
                  background: linksSaving ? '#5d7a8c' : '#0F3D5E', border: 'none', color: 'white',
                  fontSize: 12, fontWeight: 600, cursor: linksSaving ? 'wait' : 'pointer',
                }}>
                <Plus size={14} /> {linksSaving ? '...' : t('common.save')}
              </button>
              {editingId && (
                <button onClick={resetLinkForm}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4, padding: '9px 14px', borderRadius: 6,
                    background: 'transparent', border: '1px solid rgba(15,61,94,0.15)', color: '#5d7a8c',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}>
                  <X size={14} /> {lang === 'vi' ? 'Hủy' : 'Cancel'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Links table */}
        {linksLoading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#5d7a8c', fontSize: 13 }}>
            {lang === 'vi' ? 'Đang tải...' : 'Loading...'}
          </div>
        ) : sortedLinks.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#5d7a8c', fontSize: 13 }}>
            {lang === 'vi' ? 'Chưa có liên kết nào' : 'No links yet'}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid rgba(15,61,94,0.08)' }}>
                  <th style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#5d7a8c', textTransform: 'uppercase', textAlign: 'left', width: 60 }}>
                    {lang === 'vi' ? 'Thứ tự' : 'Order'}
                  </th>
                  <th style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#5d7a8c', textTransform: 'uppercase', textAlign: 'left' }}>
                    {lang === 'vi' ? 'Tiêu đề' : 'Title'}
                  </th>
                  <th style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#5d7a8c', textTransform: 'uppercase', textAlign: 'left' }}>URL</th>
                  <th style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#5d7a8c', textTransform: 'uppercase', textAlign: 'center', width: 160 }}>
                    {lang === 'vi' ? 'Thao tác' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedLinks.map((link, idx) => (
                  <tr key={link.linkId} style={{ borderBottom: '1px solid rgba(15,61,94,0.05)' }}>
                    <td style={{ padding: '10px 14px', fontSize: 12, color: '#5d7a8c' }}>{link.displayOrder}</td>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: '#0F3D5E', fontWeight: 600 }}>
                      <span style={{ opacity: link.isEnabled ? 1 : 0.4 }}>{link.title}</span>
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 12, color: '#5d7a8c', maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ color: '#0F3D5E', textDecoration: 'none' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#D4A017'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#0F3D5E'; }}>
                        {link.url}
                      </a>
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                        <button onClick={() => moveOrder(link, -1)} disabled={idx === 0}
                          style={{ ...actionBtnStyle, opacity: idx === 0 ? 0.3 : 1 }} title={lang === 'vi' ? 'Lên trên' : 'Move up'}>
                          <ArrowUp size={14} />
                        </button>
                        <button onClick={() => moveOrder(link, 1)} disabled={idx === sortedLinks.length - 1}
                          style={{ ...actionBtnStyle, opacity: idx === sortedLinks.length - 1 ? 0.3 : 1 }} title={lang === 'vi' ? 'Xuống dưới' : 'Move down'}>
                          <ArrowDown size={14} />
                        </button>
                        <button onClick={() => handleToggleEnabled(link)}
                          style={{ ...actionBtnStyle, color: link.isEnabled ? '#E67E22' : '#27AE60' }}
                          title={link.isEnabled ? (lang === 'vi' ? 'Vô hiệu hóa' : 'Disable') : (lang === 'vi' ? 'Kích hoạt' : 'Enable')}>
                          {link.isEnabled ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button onClick={() => startEdit(link)}
                          style={{ ...actionBtnStyle, color: '#0F3D5E' }} title={lang === 'vi' ? 'Sửa' : 'Edit'}>
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDeleteLink(link.linkId)}
                          style={{ ...actionBtnStyle, color: '#E74C3C' }} title={lang === 'vi' ? 'Xóa' : 'Delete'}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <MediaPicker
        open={showMediaPicker}
        onClose={() => { setShowMediaPicker(false); setMediaPickerTarget(null); }}
        onSelect={handleBackgroundSelect}
        title={lang === 'vi' ? 'Chọn ảnh từ thư viện' : 'Select image from library'}
      />
    </div>
  );
}

const actionBtnStyle = {
  width: 30, height: 30, borderRadius: 6,
  border: '1px solid rgba(15,61,94,0.1)', background: 'white',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', fontSize: 12, transition: 'all 0.15s',
} as const;
