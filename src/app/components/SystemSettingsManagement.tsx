import { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { apiGet, apiPut, apiPost } from '../services/api';
import { Save, Check, AlertTriangle, Upload } from 'lucide-react';
import { getImageUrl } from '../utils/url';

export function SystemSettingsManagement() {
  const { lang, t } = useLanguage();
  const [form, setForm] = useState({
    websiteName: '', logoUrl: '', footerText: '',
    contactEmail: '', phone: '', address: '',
    facebookUrl: '', tiktokUrl: '', youtubeUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [uploading, setUploading] = useState(false);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await apiGet<any>('/system-settings');
      setForm({
        websiteName: data.websiteName || '',
        logoUrl: data.logoUrl || '',
        footerText: data.footerText || '',
        contactEmail: data.contactEmail || '',
        phone: data.phone || '',
        address: data.address || '',
        facebookUrl: data.facebookUrl || '',
        tiktokUrl: data.tiktokUrl || '',
        youtubeUrl: data.youtubeUrl || '',
      });
    } catch {
      showToast(lang === 'vi' ? 'Không thể tải cài đặt' : 'Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiPut('/system-settings', form);
      showToast(lang === 'vi' ? 'Đã lưu cài đặt' : 'Settings saved');
    } catch {
      showToast(lang === 'vi' ? 'Lưu thất bại' : 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await apiPost<{ url: string }>('/uploads/images', formData, true);
      setForm(s => ({ ...s, logoUrl: result.url }));
    } catch {
      showToast(lang === 'vi' ? 'Tải ảnh thất bại' : 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
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

      <h1 style={{ color: '#0F3D5E', margin: '0 0 4px', fontSize: 20, fontFamily: 'Merriweather, serif' }}>{t('admin.settings')}</h1>
      <p style={{ color: '#5d7a8c', fontSize: 12, margin: '0 0 20px' }}>
        {lang === 'vi' ? 'Cấu hình thông tin chung của hệ thống' : 'Configure general system information'}
      </p>

      <div style={{ background: 'white', borderRadius: 10, padding: '24px', boxShadow: '0 1px 6px rgba(15,61,94,0.06)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>{lang === 'vi' ? 'Tên website' : 'Website Name'}</label>
            <input style={inputStyle} value={form.websiteName} onChange={e => setForm(s => ({ ...s, websiteName: e.target.value }))} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>{lang === 'vi' ? 'Logo' : 'Logo'}</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {form.logoUrl && <img src={getImageUrl(form.logoUrl)} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} />}
              <label style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '7px 14px', borderRadius: 6, background: '#0F3D5E', color: 'white', fontSize: 12, fontWeight: 600,
                cursor: uploading ? 'wait' : 'pointer', opacity: uploading ? 0.7 : 1,
              }}>
                <Upload size={13} /> {uploading ? '...' : (lang === 'vi' ? 'Chọn ảnh' : 'Choose')}
                <input type="file" accept=".jpg,.jpeg,.png,.webp" style={{ display: 'none' }} onChange={handleLogoUpload} disabled={uploading} />
              </label>
            </div>
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
    </div>
  );
}
