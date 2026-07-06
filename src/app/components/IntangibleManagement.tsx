import { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { intangibleCategoryIcons } from '../constants';
import { fetchIntangibleHeritageList, createIntangibleHeritage, updateIntangibleHeritage, deleteIntangibleHeritage } from '../services/intangibleService';
import { apiPost, apiGet, apiDelete } from '../services/api';
import { getImageUrl } from '../utils/url';
import { MediaPicker } from './MediaPicker';
import {
  Plus, Search, Filter, Pencil, Trash2, X, Check, AlertTriangle, Upload,
  ChevronLeft, ChevronRight, Image as ImageIcon, Video, FileText, Download, Eye
} from 'lucide-react';

interface IntangibleItem {
  id: string;
  nameVi: string;
  nameEn: string;
  category: string;
  descriptionVi: string;
  descriptionEn: string;
  image: string;
  videoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

type FormMode = 'add' | 'edit' | null;

const categories = ['festival', 'performance', 'craft', 'ritual', 'story'];

export function IntangibleManagement() {
  const { lang, t } = useLanguage();
  const [items, setItems] = useState<IntangibleItem[]>([]);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [editItem, setEditItem] = useState<IntangibleItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<'thumbnail' | 'gallery' | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const PER_PAGE = 8;

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await fetchIntangibleHeritageList(search || undefined, filterCat || undefined, page, PER_PAGE);
      setItems(result.data);
      setTotalRecords(result.totalRecords);
      setTotalPages(result.totalPages);
    } catch (err) {
      const msg = err instanceof Error ? err.message : (lang === 'vi' ? 'Không thể tải dữ liệu' : 'Failed to load data');
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [search, filterCat, page]);

  const openAdd = () => {
    setEditItem({ id: '', nameVi: '', nameEn: '', category: 'festival', descriptionVi: '', descriptionEn: '', image: '', videoUrl: '' });
    setGalleryImages([]);
    setFormErrors({});
    setFormMode('add');
  };

  const openEdit = (item: IntangibleItem) => {
    setEditItem({ ...item });
    setGalleryImages([]);
    setFormErrors({});
    setFormMode('edit');
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!editItem) return false;
    if (!editItem.nameVi.trim()) errors.nameVi = lang === 'vi' ? 'Tên (VI) là bắt buộc' : 'Name (VI) is required';
    else if (editItem.nameVi.trim().length < 5) errors.nameVi = lang === 'vi' ? 'Tối thiểu 5 ký tự' : 'Minimum 5 characters';
    else if (editItem.nameVi.length > 200) errors.nameVi = lang === 'vi' ? 'Tối đa 200 ký tự' : 'Max 200 characters';
    if (!editItem.nameEn.trim()) errors.nameEn = lang === 'vi' ? 'Tên (EN) là bắt buộc' : 'Name (EN) is required';
    else if (editItem.nameEn.trim().length < 5) errors.nameEn = lang === 'vi' ? 'Tối thiểu 5 ký tự' : 'Minimum 5 characters';
    else if (editItem.nameEn.length > 200) errors.nameEn = lang === 'vi' ? 'Tối đa 200 ký tự' : 'Max 200 characters';
    if (!editItem.category) errors.category = lang === 'vi' ? 'Thể loại là bắt buộc' : 'Category is required';
    if (!editItem.descriptionVi.trim()) errors.descriptionVi = lang === 'vi' ? 'Mô tả (VI) là bắt buộc' : 'Description (VI) is required';
    else if (editItem.descriptionVi.trim().length < 30) errors.descriptionVi = lang === 'vi' ? 'Tối thiểu 30 ký tự' : 'Minimum 30 characters';
    if (!editItem.descriptionEn.trim()) errors.descriptionEn = lang === 'vi' ? 'Mô tả (EN) là bắt buộc' : 'Description (EN) is required';
    else if (editItem.descriptionEn.trim().length < 30) errors.descriptionEn = lang === 'vi' ? 'Tối thiểu 30 ký tự' : 'Minimum 30 characters';
    if (!editItem.image) errors.image = lang === 'vi' ? 'Ảnh đại diện là bắt buộc' : 'Cover image is required';
    if (editItem.videoUrl && editItem.videoUrl.trim()) {
      const url = editItem.videoUrl.trim();
      if (!url.startsWith('https://www.youtube.com') && !url.startsWith('https://youtube.com') && !url.startsWith('https://youtu.be'))
        errors.videoUrl = lang === 'vi' ? 'Chỉ chấp nhận URL YouTube' : 'Only YouTube URLs accepted';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!editItem) return;
    setFormErrors({});
    if (!validateForm()) return;
    try {
      const payload: Record<string, unknown> = {
        nameVi: editItem.nameVi,
        nameEn: editItem.nameEn,
        category: editItem.category,
        descriptionVi: editItem.descriptionVi || null,
        descriptionEn: editItem.descriptionEn || null,
        image: editItem.image || null,
        videoUrl: editItem.videoUrl || null,
      };
      if (formMode === 'add') {
        await createIntangibleHeritage(payload);
        showToast(lang === 'vi' ? 'Đã thêm thành công' : 'Created successfully');
      } else {
        await updateIntangibleHeritage(editItem.id, payload);
        showToast(lang === 'vi' ? 'Đã cập nhật thành công' : 'Updated successfully');
      }
      setFormMode(null);
      setEditItem(null);
      setFormErrors({});
      loadData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : (lang === 'vi' ? 'Lỗi khi lưu dữ liệu' : 'Failed to save data');
      showToast(msg, 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteIntangibleHeritage(id);
      showToast(lang === 'vi' ? 'Đã xóa thành công' : 'Deleted successfully');
      setDeleteId(null);
      loadData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : (lang === 'vi' ? 'Lỗi khi xóa' : 'Failed to delete');
      showToast(msg, 'error');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) { showToast(lang === 'vi' ? 'Chỉ chấp nhận JPG, PNG, WebP' : 'Only JPG, PNG, WebP allowed', 'error'); return; }
    if (file.size > 5 * 1024 * 1024) { showToast(lang === 'vi' ? 'Kích thước tối đa 5MB' : 'Maximum file size is 5MB', 'error'); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await apiPost<{ url: string }>('/uploads/images', formData, true);
      setEditItem(s => s ? { ...s, image: result.url } : s);
      setFormErrors(prev => ({ ...prev, image: '' }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : (lang === 'vi' ? 'Tải ảnh thất bại' : 'Upload failed');
      showToast(msg, 'error');
    } finally { setUploading(false); }
  };

  const openMediaPicker = (target: 'thumbnail' | 'gallery') => {
    setMediaPickerTarget(target);
    setShowMediaPicker(true);
  };

  const handleMediaSelect = (url: string) => {
    if (mediaPickerTarget === 'thumbnail') {
      setEditItem(s => s ? { ...s, image: url } : s);
      setFormErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const handleMediaSelectMultiple = (urls: string[]) => {
    if (mediaPickerTarget === 'gallery') {
      setGalleryImages(prev => [...prev, ...urls]);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
  };

  const inputStyle = {
    width: '100%', padding: '9px 12px', borderRadius: 6,
    border: '1.5px solid rgba(15,61,94,0.15)', fontSize: 13,
    background: '#F8FAFC', outline: 'none', boxSizing: 'border-box' as const,
  };

  return (
    <div style={{ padding: '24px', position: 'relative' }}>
      {toast && (
        <div style={{ position: 'fixed', top: 80, right: 24, zIndex: 1000, padding: '12px 16px', borderRadius: 8,
          background: toast.type === 'success' ? '#EAFAF1' : '#FDEDEC',
          border: `1px solid ${toast.type === 'success' ? '#27AE60' : '#E74C3C'}`,
          color: toast.type === 'success' ? '#27AE60' : '#E74C3C',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}>
          {toast.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
          {toast.msg}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ color: '#0F3D5E', margin: 0, fontSize: 20, fontFamily: 'Merriweather, serif' }}>{t('admin.intangible_mgmt')}</h1>
          <p style={{ color: '#5d7a8c', fontSize: 12, margin: '4px 0 0' }}>
            {lang === 'vi' ? `Tổng cộng ${totalRecords} di sản` : `Total ${totalRecords} items`}
          </p>
        </div>
        <button onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 8, background: '#0F3D5E', border: 'none', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(15,61,94,0.25)' }}>
          <Plus size={16} /> {t('hm.add')}
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: 10, padding: '14px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', boxShadow: '0 1px 6px rgba(15,61,94,0.06)' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#5d7a8c' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder={t('im.search')} style={{ ...inputStyle, paddingLeft: 32, background: '#F0F4F8' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Filter size={13} style={{ color: '#5d7a8c' }} />
          <select value={filterCat} onChange={e => { setFilterCat(e.target.value); setPage(1); }} style={{ ...inputStyle, width: 'auto', background: 'white', cursor: 'pointer' }}>
            <option value="">{t('common.all')}</option>
            {categories.map(cat => (<option key={cat} value={cat}>{t(`intangible.${cat}`)}</option>))}
          </select>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 6px rgba(15,61,94,0.06)' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#5d7a8c', fontSize: 13 }}>{t('common.loading')}</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0F3D5E' }}>
                {[
                  lang === 'vi' ? 'Ảnh' : 'Image',
                  lang === 'vi' ? 'Tên' : 'Name',
                  lang === 'vi' ? 'Thể loại' : 'Category',
                  lang === 'vi' ? 'Mô tả' : 'Description',
                  lang === 'vi' ? 'Video' : 'Video',
                  lang === 'vi' ? 'Ngày tạo' : 'Created',
                  t('hm.actions')
                ].map(h => (
                  <th key={h} style={{ padding: '12px 14px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.8)', textAlign: 'left', textTransform: 'uppercase', letterSpacing: 0.4, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item.id} style={{ background: i % 2 === 0 ? 'white' : '#FAFBFD', borderBottom: '1px solid rgba(15,61,94,0.04)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = '#EBF5FB'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = i % 2 === 0 ? 'white' : '#FAFBFD'; }}>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ width: 44, height: 34, borderRadius: 4, overflow: 'hidden', background: '#dce8f0' }}>
                      {item.image ? <img src={getImageUrl(item.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#5d7a8c' }}>-</div>}
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#0F3D5E' }}>{lang === 'vi' ? item.nameVi : item.nameEn}</div>
                    <div style={{ fontSize: 10, color: '#5d7a8c' }}>{lang === 'vi' ? item.nameEn : item.nameVi}</div>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#5d7a8c' }}>
                      <span>{intangibleCategoryIcons[item.category as keyof typeof intangibleCategoryIcons]}</span>
                      {t(`intangible.${item.category}`)}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 11, color: '#5d7a8c', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {lang === 'vi' ? item.descriptionVi : item.descriptionEn}
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 11, color: '#5d7a8c' }}>
                    {item.videoUrl ? (
                      <a href={item.videoUrl} target="_blank" rel="noreferrer" style={{ color: '#D4A017', textDecoration: 'underline', fontSize: 11 }}>
                        {lang === 'vi' ? 'Xem' : 'Watch'}
                      </a>
                    ) : '-'}
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 11, color: '#5d7a8c', whiteSpace: 'nowrap' }}>
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => openEdit(item)}
                        style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(15,61,94,0.15)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4A017' }}
                        title={t('hm.edit')}><Pencil size={12} /></button>
                      <button onClick={() => setDeleteId(item.id)}
                        style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(231,76,60,0.2)', background: '#FDEDEC', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E74C3C' }}
                        title={t('hm.delete')}><Trash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#5d7a8c', fontSize: 13 }}>{t('common.nodata')}</td></tr>
              )}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(15,61,94,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#5d7a8c' }}>
              {lang === 'vi' ? `Hiển thị ${(page-1)*PER_PAGE+1}–${Math.min(page*PER_PAGE, totalRecords)} trong ${totalRecords}` : `Showing ${(page-1)*PER_PAGE+1}–${Math.min(page*PER_PAGE, totalRecords)} of ${totalRecords}`}
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(15,61,94,0.15)', background: page === 1 ? '#F0F4F8' : 'white', cursor: page === 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: page === 1 ? '#cbced4' : '#0F3D5E' }}>
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid', borderColor: page === p ? '#0F3D5E' : 'rgba(15,61,94,0.15)', background: page === p ? '#0F3D5E' : 'white', color: page === p ? 'white' : '#5d7a8c', cursor: 'pointer', fontSize: 12, fontWeight: page === p ? 700 : 400 }}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}
                style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(15,61,94,0.15)', background: page === totalPages ? '#F0F4F8' : 'white', cursor: page === totalPages ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: page === totalPages ? '#cbced4' : '#0F3D5E' }}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {formMode && editItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500 }}
          onClick={() => { setFormMode(null); setEditItem(null); setFormErrors({}); }}>
          <div style={{ background: 'white', borderRadius: 12, width: '90%', maxWidth: 720, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding: '16px 20px', background: '#0F3D5E', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>{formMode === 'add' ? t('im.add') : t('im.edit')}</span>
              <button onClick={() => { setFormMode(null); setEditItem(null); setFormErrors({}); }}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>{t('im.name_vi')} *</label>
                  <input style={{ ...inputStyle, borderColor: formErrors.nameVi ? '#E74C3C' : 'rgba(15,61,94,0.15)' }} value={editItem.nameVi} onChange={e => { setEditItem(s => s ? { ...s, nameVi: e.target.value } : s); setFormErrors(prev => ({ ...prev, nameVi: '' })); }} />
                  {formErrors.nameVi && <span style={{ fontSize: 11, color: '#E74C3C', marginTop: 2, display: 'block' }}>{formErrors.nameVi}</span>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>{t('im.name_en')} *</label>
                  <input style={{ ...inputStyle, borderColor: formErrors.nameEn ? '#E74C3C' : 'rgba(15,61,94,0.15)' }} value={editItem.nameEn} onChange={e => { setEditItem(s => s ? { ...s, nameEn: e.target.value } : s); setFormErrors(prev => ({ ...prev, nameEn: '' })); }} />
                  {formErrors.nameEn && <span style={{ fontSize: 11, color: '#E74C3C', marginTop: 2, display: 'block' }}>{formErrors.nameEn}</span>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>{t('im.category')} *</label>
                  <select style={{ ...inputStyle, background: 'white', cursor: 'pointer', borderColor: formErrors.category ? '#E74C3C' : 'rgba(15,61,94,0.15)' }} value={editItem.category}
                    onChange={e => { setEditItem(s => s ? { ...s, category: e.target.value } : s); setFormErrors(prev => ({ ...prev, category: '' })); }}>
                    {categories.map(cat => (<option key={cat} value={cat}>{intangibleCategoryIcons[cat as keyof typeof intangibleCategoryIcons]} {t(`intangible.${cat}`)}</option>))}
                  </select>
                  {formErrors.category && <span style={{ fontSize: 11, color: '#E74C3C', marginTop: 2, display: 'block' }}>{formErrors.category}</span>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>{t('im.video_url')}</label>
                  <input style={{ ...inputStyle, borderColor: formErrors.videoUrl ? '#E74C3C' : 'rgba(15,61,94,0.15)' }} type="url" placeholder="https://www.youtube.com/..." value={editItem.videoUrl || ''} onChange={e => { setEditItem(s => s ? { ...s, videoUrl: e.target.value } : s); setFormErrors(prev => ({ ...prev, videoUrl: '' })); }} />
                  {formErrors.videoUrl && <span style={{ fontSize: 11, color: '#E74C3C', marginTop: 2, display: 'block' }}>{formErrors.videoUrl}</span>}
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>{t('im.description_vi')} *</label>
                  <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 72, borderColor: formErrors.descriptionVi ? '#E74C3C' : 'rgba(15,61,94,0.15)' }}
                    value={editItem.descriptionVi} onChange={e => { setEditItem(s => s ? { ...s, descriptionVi: e.target.value } : s); setFormErrors(prev => ({ ...prev, descriptionVi: '' })); }} />
                  {formErrors.descriptionVi && <span style={{ fontSize: 11, color: '#E74C3C', marginTop: 2, display: 'block' }}>{formErrors.descriptionVi}</span>}
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>{t('im.description_en')} *</label>
                  <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 72, borderColor: formErrors.descriptionEn ? '#E74C3C' : 'rgba(15,61,94,0.15)' }}
                    value={editItem.descriptionEn} onChange={e => { setEditItem(s => s ? { ...s, descriptionEn: e.target.value } : s); setFormErrors(prev => ({ ...prev, descriptionEn: '' })); }} />
                  {formErrors.descriptionEn && <span style={{ fontSize: 11, color: '#E74C3C', marginTop: 2, display: 'block' }}>{formErrors.descriptionEn}</span>}
                </div>

                {/* Cover Image */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>{t('im.image')} *</label>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 120, height: 90, borderRadius: 8, overflow: 'hidden', background: '#dce8f0', border: '1px solid rgba(15,61,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {editItem.image ? <img src={getImageUrl(editItem.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontSize: 11, color: '#5d7a8c' }}>{t('im.no_image')}</span>}
                    </div>
                    <div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 6, background: uploading ? '#5d7a8c' : '#0F3D5E', color: 'white', fontSize: 12, fontWeight: 600, cursor: uploading ? 'wait' : 'pointer', opacity: uploading ? 0.7 : 1 }}>
                          <Upload size={14} />
                          {uploading ? (lang === 'vi' ? 'Đang tải...' : 'Uploading...') : (editItem.image ? t('im.replace_image') : t('im.upload_btn'))}
                          <input type="file" accept=".jpg,.jpeg,.png,.webp" style={{ display: 'none' }} onChange={handleImageUpload} disabled={uploading} />
                        </label>
                        <div onClick={() => openMediaPicker('thumbnail')}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 6, border: '1px solid rgba(15,61,94,0.2)', background: 'white', color: '#0F3D5E', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                          <ImageIcon size={14} /> {lang === 'vi' ? 'Từ thư viện' : 'From Library'}
                        </div>
                      </div>
                      <p style={{ fontSize: 10, color: '#cbced4', margin: 0 }}>{t('im.upload_hint')}</p>
                    </div>
                  </div>
                  {formErrors.image && <span style={{ fontSize: 11, color: '#E74C3C', marginTop: 4, display: 'block' }}>{formErrors.image}</span>}
                </div>

                {/* Gallery Images */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                    {lang === 'vi' ? 'Thư viện ảnh' : 'Gallery Images'} <span style={{ color: '#5d7a8c', fontWeight: 400 }}>({galleryImages.length})</span>
                  </label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                    {galleryImages.map((url, i) => (
                      <div key={i} style={{ position: 'relative', width: 90, height: 70, borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(15,61,94,0.1)' }}>
                        <img src={getImageUrl(url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button onClick={() => removeGalleryImage(i)} style={{ position: 'absolute', top: 2, right: 2, width: 18, height: 18, borderRadius: '50%', background: 'rgba(231,76,60,0.85)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={10} /></button>
                      </div>
                    ))}
                    <button onClick={() => openMediaPicker('gallery')} style={{ width: 90, height: 70, borderRadius: 6, border: '2px dashed rgba(15,61,94,0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#5d7a8c', fontSize: 10, gap: 4, background: '#F8FAFC' }}>
                      <ImageIcon size={16} />
                      {lang === 'vi' ? 'Thêm ảnh' : 'Add Image'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(15,61,94,0.1)', display: 'flex', justifyContent: 'flex-end', gap: 10, background: '#F8FAFC' }}>
              <button onClick={() => setShowPreview(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 8, border: '1px solid rgba(15,61,94,0.2)', background: 'white', color: '#0F3D5E', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                <Eye size={14} /> {lang === 'vi' ? 'Xem trước' : 'Preview'}
              </button>
              <button onClick={() => { setFormMode(null); setEditItem(null); setFormErrors({}); }}
                style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid rgba(15,61,94,0.2)', background: 'white', color: '#5d7a8c', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{t('common.cancel')}</button>
              <button onClick={handleSave}
                style={{ padding: '9px 20px', borderRadius: 8, background: '#0F3D5E', border: 'none', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(15,61,94,0.3)' }}>{t('common.save')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && editItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 600 }}
          onClick={() => setShowPreview(false)}>
          <div style={{ background: 'white', borderRadius: 12, width: '90%', maxWidth: 500, maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding: '14px 20px', background: '#0F3D5E', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>{lang === 'vi' ? 'Xem trước' : 'Preview'}</span>
              <button onClick={() => setShowPreview(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              {editItem.image && <img src={getImageUrl(editItem.image)} alt="" style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8, marginBottom: 12 }} />}
              <h2 style={{ color: '#0F3D5E', fontSize: 18, fontFamily: 'Merriweather, serif', margin: '0 0 4px' }}>{editItem.nameVi}</h2>
              <p style={{ color: '#5d7a8c', fontSize: 12, marginBottom: 8 }}>{editItem.nameEn}</p>
              <p style={{ fontSize: 13, color: '#1a2332', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{editItem.descriptionVi}</p>
              <p style={{ fontSize: 13, color: '#1a2332', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{editItem.descriptionEn}</p>
              {galleryImages.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0F3D5E', marginBottom: 8 }}>{lang === 'vi' ? 'Thư viện ảnh' : 'Gallery'}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                    {galleryImages.slice(0, 6).map((url, i) => (
                      <img key={i} src={getImageUrl(url)} alt="" style={{ width: '100%', height: 60, objectFit: 'cover', borderRadius: 4 }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 600 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: '28px', maxWidth: 360, width: '90%', textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#FDEDEC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#E74C3C' }}><Trash2 size={24} /></div>
            <h3 style={{ color: '#0F3D5E', fontSize: 16, marginBottom: 8 }}>{lang === 'vi' ? 'Xác nhận xóa' : 'Confirm Delete'}</h3>
            <p style={{ color: '#5d7a8c', fontSize: 13, marginBottom: 20 }}>{t('im.delete_confirm')}</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setDeleteId(null)} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid rgba(15,61,94,0.2)', background: 'white', color: '#5d7a8c', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{t('common.cancel')}</button>
              <button onClick={() => handleDelete(deleteId)} style={{ padding: '9px 20px', borderRadius: 8, background: '#E74C3C', border: 'none', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{t('hm.delete')}</button>
            </div>
          </div>
        </div>
      )}

      <MediaPicker
        open={showMediaPicker}
        onClose={() => { setShowMediaPicker(false); setMediaPickerTarget(null); }}
        onSelect={handleMediaSelect}
        onSelectMultiple={handleMediaSelectMultiple}
        multiple={mediaPickerTarget === 'gallery'}
      />
    </div>
  );
}
