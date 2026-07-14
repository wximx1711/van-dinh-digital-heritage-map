import { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { apiGet, apiPost, apiPut, apiDelete } from '../services/api';
import { Plus, Save, Check, AlertTriangle, Pencil, Trash2, X, ArrowUp, ArrowDown, EyeOff, Eye } from 'lucide-react';
import { FormSkeleton } from './Skeleton';

interface RelatedLink {
  linkId: number;
  title: string;
  url: string;
  displayOrder: number;
  isEnabled: boolean;
  createdAt: string;
}

export function RelatedLinksManagement() {
  const { lang, t } = useLanguage();
  const [links, setLinks] = useState<RelatedLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ title: '', url: '', displayOrder: 0, isEnabled: true });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await apiGet<RelatedLink[]>('/related-links');
      setLinks(data || []);
    } catch {
      showToast(lang === 'vi' ? 'Không thể tải danh sách' : 'Failed to load links', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm({ title: '', url: '', displayOrder: 0, isEnabled: true });
  };

  const startEdit = (link: RelatedLink) => {
    setEditingId(link.linkId);
    setForm({ title: link.title, url: link.url, displayOrder: link.displayOrder, isEnabled: link.isEnabled });
  };

  const validate = (): string | null => {
    if (!form.title.trim()) return lang === 'vi' ? 'Vui lòng nhập tiêu đề' : 'Title is required';
    if (!form.url.trim()) return lang === 'vi' ? 'Vui lòng nhập URL' : 'URL is required';
    try { new URL(form.url); } catch { return lang === 'vi' ? 'URL không hợp lệ' : 'Invalid URL format'; }
    return null;
  };

  const handleSave = async () => {
    const error = validate();
    if (error) { showToast(error, 'error'); return; }
    setSaving(true);
    try {
      const payload = { title: form.title.trim(), url: form.url.trim(), displayOrder: form.displayOrder, isEnabled: form.isEnabled };
      if (editingId) {
        await apiPut(`/related-links/${editingId}`, payload);
        showToast(lang === 'vi' ? 'Đã cập nhật' : 'Link updated');
      } else {
        await apiPost('/related-links', payload);
        showToast(lang === 'vi' ? 'Đã thêm' : 'Link created');
      }
      resetForm();
      await fetchData();
    } catch {
      showToast(lang === 'vi' ? 'Lưu thất bại' : 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(lang === 'vi' ? 'Xóa liên kết này?' : 'Delete this link?')) return;
    try {
      await apiDelete(`/related-links/${id}`);
      showToast(lang === 'vi' ? 'Đã xóa' : 'Link deleted');
      await fetchData();
    } catch {
      showToast(lang === 'vi' ? 'Xóa thất bại' : 'Delete failed', 'error');
    }
  };

  const handleToggleEnabled = async (link: RelatedLink) => {
    setSaving(true);
    try {
      await apiPut(`/related-links/${link.linkId}`, {
        title: link.title, url: link.url, displayOrder: link.displayOrder, isEnabled: !link.isEnabled,
      });
      showToast(link.isEnabled
        ? (lang === 'vi' ? 'Đã vô hiệu hóa' : 'Link disabled')
        : (lang === 'vi' ? 'Đã kích hoạt' : 'Link enabled'));
      await fetchData();
    } catch {
      showToast(lang === 'vi' ? 'Cập nhật thất bại' : 'Update failed', 'error');
    } finally {
      setSaving(false);
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
      await fetchData();
    } catch {
      showToast(lang === 'vi' ? 'Sắp xếp thất bại' : 'Reorder failed', 'error');
    }
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

      <h1 style={{ color: '#0F3D5E', margin: '0 0 4px', fontSize: 20, fontFamily: 'Merriweather, serif' }}>
        {lang === 'vi' ? 'Liên kết liên quan' : 'Related Links'}
      </h1>
      <p style={{ color: '#5d7a8c', fontSize: 12, margin: '0 0 20px' }}>
        {lang === 'vi' ? 'Quản lý các liên kết hiển thị trong Footer' : 'Manage links displayed in the Footer'}
      </p>

      {/* Add/Edit form */}
      <div style={{ background: 'white', borderRadius: 10, padding: '20px', boxShadow: '0 1px 6px rgba(15,61,94,0.06)', marginBottom: 20 }}>
        <h3 style={{ color: '#0F3D5E', fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>
          {editingId
            ? (lang === 'vi' ? 'Chỉnh sửa liên kết' : 'Edit Link')
            : (lang === 'vi' ? 'Thêm liên kết mới' : 'Add New Link')}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 80px 80px', gap: 12, alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.3 }}>
              {lang === 'vi' ? 'Tiêu đề' : 'Title'}
            </label>
            <input style={inputStyle} value={form.title} onChange={e => setForm(s => ({ ...s, title: e.target.value }))} placeholder={lang === 'vi' ? 'VD: Bộ Văn hóa' : 'e.g. Ministry of Culture'} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.3 }}>URL</label>
            <input style={inputStyle} value={form.url} onChange={e => setForm(s => ({ ...s, url: e.target.value }))} placeholder="https://..." />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.3 }}>
              {lang === 'vi' ? 'Thứ tự' : 'Order'}
            </label>
            <input type="number" min={0} style={inputStyle} value={form.displayOrder} onChange={e => setForm(s => ({ ...s, displayOrder: parseInt(e.target.value) || 0 }))} />
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'end', paddingBottom: 2 }}>
            <button onClick={handleSave} disabled={saving}
              style={{
                display: 'flex', alignItems: 'center', gap: 4, padding: '9px 16px', borderRadius: 6,
                background: saving ? '#5d7a8c' : '#0F3D5E', border: 'none', color: 'white',
                fontSize: 12, fontWeight: 600, cursor: saving ? 'wait' : 'pointer',
              }}>
              <Save size={14} /> {saving ? '...' : t('common.save')}
            </button>
            {editingId && (
              <button onClick={resetForm}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4, padding: '9px 16px', borderRadius: 6,
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
      <div style={{ background: 'white', borderRadius: 10, boxShadow: '0 1px 6px rgba(15,61,94,0.06)', overflow: 'hidden' }}>
        {sortedLinks.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#5d7a8c', fontSize: 13 }}>
            {lang === 'vi' ? 'Chưa có liên kết nào' : 'No links yet'}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid rgba(15,61,94,0.08)' }}>
                <th style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#5d7a8c', textTransform: 'uppercase', textAlign: 'left', width: 40 }}>#</th>
                <th style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#5d7a8c', textTransform: 'uppercase', textAlign: 'left' }}>
                  {lang === 'vi' ? 'Tiêu đề' : 'Title'}
                </th>
                <th style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#5d7a8c', textTransform: 'uppercase', textAlign: 'left' }}>URL</th>
                <th style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#5d7a8c', textTransform: 'uppercase', textAlign: 'center', width: 80 }}>
                  {lang === 'vi' ? 'Thứ tự' : 'Order'}
                </th>
                <th style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#5d7a8c', textTransform: 'uppercase', textAlign: 'center', width: 80 }}>
                  {lang === 'vi' ? 'Trạng thái' : 'Status'}
                </th>
                <th style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#5d7a8c', textTransform: 'uppercase', textAlign: 'center', width: 160 }}>
                  {lang === 'vi' ? 'Thao tác' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedLinks.map((link, idx) => (
                <tr key={link.linkId} style={{ borderBottom: '1px solid rgba(15,61,94,0.05)' }}>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: '#5d7a8c' }}>{idx + 1}</td>
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
                    <span style={{ fontSize: 12, color: '#5d7a8c' }}>{link.displayOrder}</span>
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block', padding: '3px 10px', borderRadius: 10, fontSize: 10, fontWeight: 700,
                      background: link.isEnabled ? '#EAFAF1' : '#F0F4F8',
                      color: link.isEnabled ? '#27AE60' : '#5d7a8c',
                    }}>
                      {link.isEnabled ? (lang === 'vi' ? 'Bật' : 'On') : (lang === 'vi' ? 'Tắt' : 'Off')}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                      <button onClick={() => moveOrder(link, -1)} disabled={idx === 0}
                        style={actionBtnStyle}>
                        <ArrowUp size={14} />
                      </button>
                      <button onClick={() => moveOrder(link, 1)} disabled={idx === sortedLinks.length - 1}
                        style={actionBtnStyle}>
                        <ArrowDown size={14} />
                      </button>
                      <button onClick={() => handleToggleEnabled(link)}
                        style={{ ...actionBtnStyle, color: link.isEnabled ? '#E67E22' : '#27AE60' }}>
                        {link.isEnabled ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button onClick={() => startEdit(link)}
                        style={{ ...actionBtnStyle, color: '#0F3D5E' }}>
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(link.linkId)}
                        style={{ ...actionBtnStyle, color: '#E74C3C' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const actionBtnStyle = {
  width: 30, height: 30, borderRadius: 6,
  border: '1px solid rgba(15,61,94,0.1)', background: 'white',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', fontSize: 12, transition: 'all 0.15s',
} as const;
