import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLanguage } from './LanguageContext';
import { fetchMemorialSites, createMemorialSite, updateMemorialSite, deleteMemorialSite } from '../services/memorialSiteService';
import type { MemorialSite } from '../services/memorialSiteService';
import { uploadFileWithProgress } from '../services/uploadService';
import { getImageUrl } from '../utils/url';
import {
  MEMORIAL_CATEGORIES, MEMORIAL_CLASSIFICATIONS, MEMORIAL_STATUSES,
  memorialCategoryIcons, memorialClassificationColors, memorialClassificationBackgrounds, memorialStatusColors,
} from '../constants/memorial';
import { MediaPicker } from './MediaPicker';
import { ConfirmDialog } from './ConfirmDialog';
import {
  Plus, Search, Filter, Pencil, Trash2, X, Check, AlertTriangle, Upload,
  ChevronLeft, ChevronRight,
  Image as ImageIcon, Eye
} from 'lucide-react';
import { AdminTableSkeleton } from './Skeleton';
import { LazyImage } from './LazyImage';

type FormMode = 'add' | 'edit' | null;

interface MemorialSiteForm {
  id: string;
  nameVi: string;
  nameEn: string;
  category: string;
  classification: string;
  status: string;
  otherNames: string;
  addressVi: string;
  addressEn: string;
  lat: string;
  lon: string;
  googleMapUrl: string;
  descriptionVi: string;
  descriptionEn: string;
  historyVi: string;
  historyEn: string;
  eventDate: string;
  commemorationVi: string;
  commemorationEn: string;
  image: string;
  videoUrl: string;
}

const emptyItem: MemorialSiteForm = {
  id: '', nameVi: '', nameEn: '', category: 'memorial', classification: 'provincial', status: 'active',
  otherNames: '', addressVi: '', addressEn: '', lat: '', lon: '', googleMapUrl: '',
  descriptionVi: '', descriptionEn: '', historyVi: '', historyEn: '', eventDate: '',
  commemorationVi: '', commemorationEn: '', image: '', videoUrl: '',
};

const PER_PAGE = 8;

interface MemorialSitesManagementProps {
  onDirtyChange?: (dirty: boolean) => void;
}

export function MemorialSitesManagement({ onDirtyChange }: MemorialSitesManagementProps) {
  const { lang, t } = useLanguage();
  const [items, setItems] = useState<MemorialSite[]>([]);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterClassification, setFilterClassification] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [editItem, setEditItem] = useState<MemorialSiteForm | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<'thumbnail' | 'gallery' | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const cleanSnapshotRef = useRef<string | null>(null);
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);
  const pendingCloseRef = useRef<(() => void) | null>(null);

  const isDirty = useMemo(() => {
    if (!formMode || !editItem || !cleanSnapshotRef.current) return false;
    const current = JSON.stringify({ editItem, galleryImages });
    return current !== cleanSnapshotRef.current;
  }, [formMode, editItem, galleryImages]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const closeForm = useCallback(() => {
    if (!formMode) return;
    const doClose = () => {
      setFormMode(null);
      setEditItem(null);
      setFormErrors({});
      setGalleryImages([]);
      cleanSnapshotRef.current = null;
    };
    if (isDirty) {
      pendingCloseRef.current = doClose;
      setShowUnsavedConfirm(true);
    } else {
      doClose();
    }
  }, [formMode, isDirty]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await fetchMemorialSites(
        search || undefined,
        filterCat || undefined,
        filterClassification || undefined,
        filterStatus || undefined,
        page,
        PER_PAGE,
      );
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

  useEffect(() => { loadData(); }, [search, filterCat, filterClassification, filterStatus, page]);

  const toForm = (item: MemorialSite): MemorialSiteForm => ({
    id: item.id,
    nameVi: item.nameVi,
    nameEn: item.nameEn,
    category: item.category,
    classification: item.classification,
    status: item.status,
    otherNames: item.otherNames ?? '',
    addressVi: item.addressVi ?? '',
    addressEn: item.addressEn ?? '',
    lat: item.lat != null ? String(item.lat) : '',
    lon: item.lon != null ? String(item.lon) : '',
    googleMapUrl: item.googleMapUrl ?? '',
    descriptionVi: item.descriptionVi ?? '',
    descriptionEn: item.descriptionEn ?? '',
    historyVi: item.historyVi ?? '',
    historyEn: item.historyEn ?? '',
    eventDate: item.eventDate ?? '',
    commemorationVi: item.commemorationVi ?? '',
    commemorationEn: item.commemorationEn ?? '',
    image: item.image,
    videoUrl: item.videoUrl ?? '',
  });

  const openAdd = () => {
    const item = { ...emptyItem };
    setEditItem(item);
    setGalleryImages([]);
    setFormErrors({});
    setFormMode('add');
    cleanSnapshotRef.current = JSON.stringify({ editItem: item, galleryImages: [] });
  };

  const openEdit = (item: MemorialSite) => {
    const itemCopy = toForm(item);
    const gallery = item.galleryImages ?? [];
    setEditItem(itemCopy);
    setGalleryImages(gallery);
    setFormErrors({});
    setFormMode('edit');
    cleanSnapshotRef.current = JSON.stringify({ editItem: itemCopy, galleryImages: gallery });
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
    if (!editItem.category) errors.category = lang === 'vi' ? 'Loại hình là bắt buộc' : 'Category is required';
    if (!editItem.classification) errors.classification = lang === 'vi' ? 'Xếp hạng là bắt buộc' : 'Classification is required';
    if (!editItem.status) errors.status = lang === 'vi' ? 'Trạng thái là bắt buộc' : 'Status is required';
    if (!editItem.image) errors.image = lang === 'vi' ? 'Ảnh đại diện là bắt buộc' : 'Cover image is required';
    const videoUrl = editItem.videoUrl.trim();
    if (videoUrl && !videoUrl.startsWith('https://www.youtube.com')
      && !videoUrl.startsWith('https://youtube.com')
      && !videoUrl.startsWith('https://youtu.be')) {
      errors.videoUrl = lang === 'vi' ? 'Chỉ chấp nhận URL video YouTube' : 'Only YouTube video URLs are accepted';
    }
    if (editItem.addressVi.trim() && editItem.addressVi.trim().length < 5) {
      errors.addressVi = lang === 'vi' ? 'Tối thiểu 5 ký tự' : 'Minimum 5 characters';
    }
    if (editItem.addressEn.trim() && editItem.addressEn.trim().length < 5) {
      errors.addressEn = lang === 'vi' ? 'Tối thiểu 5 ký tự' : 'Minimum 5 characters';
    }
    if (editItem.descriptionVi.trim() && editItem.descriptionVi.trim().length < 30) {
      errors.descriptionVi = lang === 'vi' ? 'Tối thiểu 30 ký tự' : 'Minimum 30 characters';
    }
    if (editItem.descriptionEn.trim() && editItem.descriptionEn.trim().length < 30) {
      errors.descriptionEn = lang === 'vi' ? 'Tối thiểu 30 ký tự' : 'Minimum 30 characters';
    }
    if (editItem.historyVi.trim() && editItem.historyVi.trim().length < 50) {
      errors.historyVi = lang === 'vi' ? 'Tối thiểu 50 ký tự' : 'Minimum 50 characters';
    }
    if (editItem.historyEn.trim() && editItem.historyEn.trim().length < 50) {
      errors.historyEn = lang === 'vi' ? 'Tối thiểu 50 ký tự' : 'Minimum 50 characters';
    }
    if (editItem.lat.trim() && (isNaN(Number(editItem.lat)) || Number(editItem.lat) < -90 || Number(editItem.lat) > 90)) {
      errors.lat = lang === 'vi' ? 'Vĩ độ phải từ -90 đến 90' : 'Latitude must be between -90 and 90';
    }
    if (editItem.lon.trim() && (isNaN(Number(editItem.lon)) || Number(editItem.lon) < -180 || Number(editItem.lon) > 180)) {
      errors.lon = lang === 'vi' ? 'Kinh độ phải từ -180 đến 180' : 'Longitude must be between -180 and 180';
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
        nameVi: editItem.nameVi.trim(),
        nameEn: editItem.nameEn.trim(),
        category: editItem.category,
        classification: editItem.classification,
        status: editItem.status,
        otherNames: editItem.otherNames.trim() || null,
        addressVi: editItem.addressVi.trim() || null,
        addressEn: editItem.addressEn.trim() || null,
        latitude: editItem.lat.trim() ? Number(editItem.lat) : null,
        longitude: editItem.lon.trim() ? Number(editItem.lon) : null,
        googleMapUrl: editItem.googleMapUrl.trim() || null,
        descriptionVi: editItem.descriptionVi.trim() || null,
        descriptionEn: editItem.descriptionEn.trim() || null,
        historyVi: editItem.historyVi.trim() || null,
        historyEn: editItem.historyEn.trim() || null,
        eventDate: editItem.eventDate.trim() || null,
        commemorationVi: editItem.commemorationVi.trim() || null,
        commemorationEn: editItem.commemorationEn.trim() || null,
        image: editItem.image || null,
        videoUrl: editItem.videoUrl.trim() || null,
        galleryImages: galleryImages.length > 0 ? galleryImages : null,
      };
      if (formMode === 'add') {
        await createMemorialSite(payload);
        showToast(lang === 'vi' ? 'Đã thêm thành công' : 'Created successfully');
      } else {
        await updateMemorialSite(editItem.id, payload);
        showToast(lang === 'vi' ? 'Đã cập nhật thành công' : 'Updated successfully');
      }
      setFormMode(null);
      setEditItem(null);
      setFormErrors({});
      setGalleryImages([]);
      cleanSnapshotRef.current = null;
      loadData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : (lang === 'vi' ? 'Lỗi khi lưu dữ liệu' : 'Failed to save data');
      showToast(msg, 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMemorialSite(id);
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
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(file.type) && !allowedExts.includes(ext)) {
      showToast(lang === 'vi' ? 'Chỉ chấp nhận PNG, JPG, JPEG, WebP, HEIC, HEIF' : 'Only PNG, JPG, JPEG, WebP, HEIC, HEIF allowed', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) { showToast(lang === 'vi' ? 'Kích thước tối đa 5MB' : 'Maximum file size is 5MB', 'error'); return; }
    setUploading(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await uploadFileWithProgress({
        path: '/uploads/images',
        formData,
        onProgress: setUploadProgress,
      });
      setEditItem(s => s ? { ...s, image: result.url } : s);
      setFormErrors(prev => ({ ...prev, image: '' }));
      showToast(lang === 'vi' ? 'Tải ảnh thành công' : 'Upload successful');
    } catch (err) {
      const msg = err instanceof Error ? err.message : (lang === 'vi' ? 'Tải ảnh thất bại' : 'Upload failed');
      showToast(msg, 'error');
    } finally { setUploading(false); setUploadProgress(0); }
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

  const updateField = (field: keyof MemorialSiteForm, value: string) => {
    setEditItem(s => s ? { ...s, [field]: value } : s);
    setFormErrors(prev => ({ ...prev, [field]: '' }));
  };

  const renderField = (field: keyof MemorialSiteForm, label: string, options?: { type?: string; rows?: number; required?: boolean; placeholder?: string }) => {
    const { type = 'text', rows, required, placeholder } = options || {};
    const value = editItem?.[field] ?? '';
    const errorKey = field as string;
    return (
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.3 }}>
          {label}{required ? ' *' : ''}
        </label>
        {type === 'textarea' ? (
          <textarea
            style={{ ...inputStyle, resize: 'vertical', minHeight: rows ? rows * 20 : 72, borderColor: formErrors[errorKey] ? '#E74C3C' : 'rgba(15,61,94,0.15)' }}
            value={value as string}
            placeholder={placeholder}
            onChange={e => updateField(field, e.target.value)}
          />
        ) : (
          <input
            style={{ ...inputStyle, borderColor: formErrors[errorKey] ? '#E74C3C' : 'rgba(15,61,94,0.15)' }}
            type={type}
            value={value as string}
            placeholder={placeholder}
            onChange={e => updateField(field, e.target.value)}
          />
        )}
        {formErrors[errorKey] && <span style={{ fontSize: 11, color: '#E74C3C', marginTop: 2, display: 'block' }}>{formErrors[errorKey]}</span>}
      </div>
    );
  };

  const renderCard = (title: string, children: React.ReactNode) => (
    <div style={{
      background: 'white', borderRadius: 10, overflow: 'hidden',
      boxShadow: '0 1px 6px rgba(15,61,94,0.06)', marginBottom: 12,
      border: '1px solid rgba(15,61,94,0.08)',
    }}>
      <div style={{
        padding: '11px 18px', background: '#0F3D5E',
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.3, color: 'white' }}>
          {title}
        </span>
      </div>
      <div style={{ padding: '18px' }}>
        {children}
      </div>
    </div>
  );

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
          <h1 style={{ color: '#0F3D5E', margin: 0, fontSize: 20, fontFamily: 'Merriweather, serif' }}>{t('admin.memorial_mgmt')}</h1>
          <p style={{ color: '#5d7a8c', fontSize: 12, margin: '4px 0 0' }}>
            {lang === 'vi' ? `Tổng cộng ${totalRecords} điểm lưu niệm` : `Total ${totalRecords} memorial sites`}
          </p>
        </div>
        <button onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 8, background: '#0F3D5E', border: 'none', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(15,61,94,0.25)' }}>
          <Plus size={16} /> {lang === 'vi' ? 'Thêm điểm lưu niệm' : 'Add Memorial Site'}
        </button>
      </div>

      <div className="mm-filters" style={{ background: 'white', borderRadius: 10, padding: '14px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', boxShadow: '0 1px 6px rgba(15,61,94,0.06)' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#5d7a8c' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder={t('mm.search')} style={{ ...inputStyle, paddingLeft: 32, background: '#F0F4F8' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Filter size={13} style={{ color: '#5d7a8c' }} />
          <select value={filterCat} onChange={e => { setFilterCat(e.target.value); setPage(1); }} style={{ ...inputStyle, width: 'auto', background: 'white', cursor: 'pointer' }}>
            <option value="">{lang === 'vi' ? 'Tất cả loại hình' : 'All categories'}</option>
            {MEMORIAL_CATEGORIES.map(cat => (<option key={cat} value={cat}>{t(`memorial.category.${cat}`)}</option>))}
          </select>
        </div>
        <select value={filterClassification} onChange={e => { setFilterClassification(e.target.value); setPage(1); }} style={{ ...inputStyle, width: 'auto', background: 'white', cursor: 'pointer' }}>
          <option value="">{lang === 'vi' ? 'Tất cả xếp hạng' : 'All classifications'}</option>
          {MEMORIAL_CLASSIFICATIONS.map(c => (<option key={c} value={c}>{t(`memorial.classification.${c}`)}</option>))}
        </select>
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} style={{ ...inputStyle, width: 'auto', background: 'white', cursor: 'pointer' }}>
          <option value="">{lang === 'vi' ? 'Tất cả trạng thái' : 'All statuses'}</option>
          {MEMORIAL_STATUSES.map(s => (<option key={s} value={s}>{t(`memorial.status.${s}`)}</option>))}
        </select>
      </div>

      <div className="mm-table-wrapper" style={{ background: 'white', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 6px rgba(15,61,94,0.06)' }}>
        {loading ? (
          <AdminTableSkeleton rowCount={5} columnCount={8} />
        ) : (
          <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 620 }}>
            <thead>
              <tr style={{ background: '#0F3D5E' }}>
                {[
                  lang === 'vi' ? 'Ảnh' : 'Image',
                  lang === 'vi' ? 'Mã điểm' : 'Code',
                  lang === 'vi' ? 'Tên' : 'Name',
                  lang === 'vi' ? 'Loại hình' : 'Category',
                  lang === 'vi' ? 'Xếp hạng' : 'Classification',
                  lang === 'vi' ? 'Trạng thái' : 'Status',
                  lang === 'vi' ? 'Thời gian sự kiện' : 'Event Date',
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
                      {item.image ? <LazyImage src={getImageUrl(item.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#5d7a8c' }}>-</div>}
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 11, color: '#5d7a8c', whiteSpace: 'nowrap' }}>{item.code || '-'}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#0F3D5E' }}>{lang === 'en' ? (item.nameEn || item.nameVi) : item.nameVi}</div>
                    <div style={{ fontSize: 10, color: '#5d7a8c' }}>{lang === 'vi' ? item.nameEn : item.nameVi}</div>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#5d7a8c' }}>
                      <span>{memorialCategoryIcons[item.category]}</span>
                      {t(`memorial.category.${item.category}`)}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ padding: '3px 9px', borderRadius: 10, fontSize: 10, fontWeight: 700, background: memorialClassificationBackgrounds[item.classification], color: memorialClassificationColors[item.classification] }}>
                      {t(`memorial.classification.${item.classification}`)}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: memorialStatusColors[item.status] }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: memorialStatusColors[item.status] }} />
                      {t(`memorial.status.${item.status}`)}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 11, color: '#5d7a8c', whiteSpace: 'nowrap' }}>
                    {item.eventDate || '-'}
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
                <tr><td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: '#5d7a8c', fontSize: 13 }}>{t('common.nodata')}</td></tr>
              )}
            </tbody>
            </table>
          </div>
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
          onClick={closeForm}>
          <div style={{ background: '#F0F4F8', borderRadius: 12, width: '95%', maxWidth: 860, maxHeight: '94vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding: '16px 20px', background: '#0F3D5E', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>{formMode === 'add' ? t('mm.add') : t('mm.edit')}</span>
              <button onClick={closeForm}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, padding: '16px 20px' }}>

              {/* Card 1: Basic Information */}
              {renderCard(t('mm.section_basic'), (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {renderField('nameVi', t('mm.name_vi'), { required: true })}
                  {renderField('nameEn', t('mm.name_en'), { required: true })}
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.3 }}>{t('mm.category')} *</label>
                    <select style={{ ...inputStyle, background: 'white', cursor: 'pointer', borderColor: formErrors.category ? '#E74C3C' : 'rgba(15,61,94,0.15)' }} value={editItem.category}
                      onChange={e => { updateField('category', e.target.value); }}>
                      {MEMORIAL_CATEGORIES.map(cat => (<option key={cat} value={cat}>{memorialCategoryIcons[cat]} {t(`memorial.category.${cat}`)}</option>))}
                    </select>
                    {formErrors.category && <span style={{ fontSize: 11, color: '#E74C3C', marginTop: 2, display: 'block' }}>{formErrors.category}</span>}
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.3 }}>{t('mm.classification')} *</label>
                    <select style={{ ...inputStyle, background: 'white', cursor: 'pointer', borderColor: formErrors.classification ? '#E74C3C' : 'rgba(15,61,94,0.15)' }} value={editItem.classification}
                      onChange={e => { updateField('classification', e.target.value); }}>
                      {MEMORIAL_CLASSIFICATIONS.map(c => (<option key={c} value={c}>{t(`memorial.classification.${c}`)}</option>))}
                    </select>
                    {formErrors.classification && <span style={{ fontSize: 11, color: '#E74C3C', marginTop: 2, display: 'block' }}>{formErrors.classification}</span>}
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.3 }}>{t('mm.status')} *</label>
                    <select style={{ ...inputStyle, background: 'white', cursor: 'pointer', borderColor: formErrors.status ? '#E74C3C' : 'rgba(15,61,94,0.15)' }} value={editItem.status}
                      onChange={e => { updateField('status', e.target.value); }}>
                      {MEMORIAL_STATUSES.map(s => (<option key={s} value={s}>{t(`memorial.status.${s}`)}</option>))}
                    </select>
                    {formErrors.status && <span style={{ fontSize: 11, color: '#E74C3C', marginTop: 2, display: 'block' }}>{formErrors.status}</span>}
                  </div>
                  {renderField('otherNames', t('mm.other_names'))}
                  {renderField('eventDate', t('memorial.eventDate'), { placeholder: lang === 'vi' ? 'Ví dụ: 01/1947' : 'e.g. 01/1947' })}
                </div>
              ))}

              {/* Card 2: Location */}
              {renderCard(t('mm.section_location'), (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {renderField('addressVi', t('mm.address_vi'))}
                  {renderField('addressEn', t('mm.address_en'))}
                  {renderField('lat', t('common.latitude'))}
                  {renderField('lon', t('common.longitude'))}
                  <div style={{ gridColumn: '1 / -1' }}>
                    {renderField('googleMapUrl', t('mm.google_map_url'), { placeholder: 'https://www.google.com/maps/...' })}
                  </div>
                </div>
              ))}

              {/* Card 3: General Description */}
              {renderCard(t('mm.section_description'), (
                <div>
                  <p style={{ fontSize: 11, color: '#5d7a8c', marginTop: 0, marginBottom: 12, fontStyle: 'italic' }}>
                    {lang === 'vi' ? 'Mô tả tổng quan về điểm lưu niệm (tối thiểu 30 ký tự nếu nhập).' : 'General description of the memorial site (min 30 characters if provided).'}
                  </p>
                  {renderField('descriptionVi', t('mm.description_vi'), { type: 'textarea', rows: 8 })}
                  {renderField('descriptionEn', t('mm.description_en'), { type: 'textarea', rows: 8 })}
                </div>
              ))}

              {/* Card 4: History */}
              {renderCard(t('mm.section_history'), (
                <div>
                  <p style={{ fontSize: 11, color: '#5d7a8c', marginTop: 0, marginBottom: 12, fontStyle: 'italic' }}>
                    {lang === 'vi' ? 'Lịch sử sự kiện, cách mạng và kháng chiến (tối thiểu 50 ký tự nếu nhập).' : 'History of the event, revolution and resistance (min 50 characters if provided).'}
                  </p>
                  {renderField('historyVi', t('mm.history_vi'), { type: 'textarea', rows: 8 })}
                  {renderField('historyEn', t('mm.history_en'), { type: 'textarea', rows: 8 })}
                </div>
              ))}

              {/* Card 5: Commemoration */}
              {renderCard(t('mm.section_commemoration'), (
                <div>
                  {renderField('commemorationVi', t('mm.commemoration_vi'), { type: 'textarea', rows: 6 })}
                  {renderField('commemorationEn', t('mm.commemoration_en'), { type: 'textarea', rows: 6 })}
                </div>
              ))}

              {/* Card 6: Video */}
              {renderCard(t('mm.section_video'), (
                <div>
                  <p style={{ fontSize: 11, color: '#5d7a8c', marginTop: 0, marginBottom: 12, fontStyle: 'italic' }}>
                    {lang === 'vi' ? 'Chỉ chấp nhận URL video YouTube (youtube.com, youtu.be).' : 'Only YouTube video URLs are accepted (youtube.com, youtu.be).'}
                  </p>
                  {renderField('videoUrl', t('mm.video_url'), { placeholder: 'https://www.youtube.com/watch?v=...' })}
                </div>
              ))}

              {/* Cover Image & Gallery - compact inline section */}
              <div style={{
                background: 'white', borderRadius: 10, overflow: 'hidden',
                boxShadow: '0 1px 6px rgba(15,61,94,0.06)', marginBottom: 12,
                border: '1px solid rgba(15,61,94,0.08)',
              }}>
                <div style={{ padding: '11px 18px', background: '#0F3D5E' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.3, color: 'white' }}>
                    {lang === 'vi' ? 'Hình ảnh & Truyền thông' : 'Media'}
                  </span>
                </div>
                <div style={{ padding: '18px' }}>
                  {/* Cover Image */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>{t('mm.image')} *</label>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ width: 120, height: 90, borderRadius: 8, overflow: 'hidden', background: '#dce8f0', border: '1px solid rgba(15,61,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {editItem.image ? <LazyImage src={getImageUrl(editItem.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <span style={{ fontSize: 11, color: '#5d7a8c' }}>{t('mm.no_image')}</span>}
                      </div>
                      <div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 6, background: uploading ? '#5d7a8c' : '#0F3D5E', color: 'white', fontSize: 12, fontWeight: 600, cursor: uploading ? 'wait' : 'pointer', opacity: uploading ? 0.7 : 1 }}>
                            <Upload size={14} />
                            {uploading ? `${uploadProgress}%` : (editItem.image ? t('mm.replace_image') : t('mm.upload_btn'))}
                            <input type="file" accept=".jpg,.jpeg,.png,.webp" style={{ display: 'none' }} onChange={handleImageUpload} disabled={uploading} />
                          </label>
                          {uploading && (
                            <div style={{ width: 200, height: 6, background: '#dce8f0', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ width: `${uploadProgress}%`, height: '100%', background: '#D4A017', borderRadius: 3, transition: 'width 0.2s ease' }} />
                            </div>
                          )}
                          <div onClick={() => openMediaPicker('thumbnail')}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 6, border: '1px solid rgba(15,61,94,0.2)', background: 'white', color: '#0F3D5E', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                            <ImageIcon size={14} /> {lang === 'vi' ? 'Từ thư viện' : 'From Library'}
                          </div>
                        </div>
                        <p style={{ fontSize: 10, color: '#cbced4', margin: 0 }}>{t('mm.upload_hint')}</p>
                      </div>
                    </div>
                    {formErrors.image && <span style={{ fontSize: 11, color: '#E74C3C', marginTop: 4, display: 'block' }}>{formErrors.image}</span>}
                  </div>

                  {/* Gallery */}
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                      {t('mm.gallery')} <span style={{ color: '#5d7a8c', fontWeight: 400 }}>({galleryImages.length})</span>
                    </label>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                      {galleryImages.map((url, i) => (
                        <div key={i} style={{ position: 'relative', width: 90, height: 70, borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(15,61,94,0.1)' }}>
                          <LazyImage src={getImageUrl(url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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

            </div>

            <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(15,61,94,0.1)', display: 'flex', justifyContent: 'flex-end', gap: 10, background: '#F8FAFC', flexShrink: 0 }}>
              <button onClick={() => setShowPreview(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 8, border: '1px solid rgba(15,61,94,0.2)', background: 'white', color: '#0F3D5E', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                <Eye size={14} /> {lang === 'vi' ? 'Xem trước' : 'Preview'}
              </button>
              <button onClick={closeForm}
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
          <div style={{ background: 'white', borderRadius: 12, width: '90%', maxWidth: 600, maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding: '14px 20px', background: '#0F3D5E', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>{lang === 'vi' ? 'Xem trước' : 'Preview'}</span>
              <button onClick={() => setShowPreview(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              {editItem.image && <LazyImage src={getImageUrl(editItem.image)} alt="" style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8, marginBottom: 12 }} />}
              <h2 style={{ color: '#0F3D5E', fontSize: 18, fontFamily: 'Merriweather, serif', margin: '0 0 4px' }}>{editItem.nameVi}</h2>
              <p style={{ color: '#5d7a8c', fontSize: 12, marginBottom: 8 }}>{editItem.nameEn}</p>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                <span style={{ padding: '3px 10px', borderRadius: 10, fontSize: 11, fontWeight: 700, background: 'rgba(212,160,23,0.15)', color: '#B8860B', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {memorialCategoryIcons[editItem.category]} {t(`memorial.category.${editItem.category}`)}
                </span>
                <span style={{ padding: '3px 10px', borderRadius: 10, fontSize: 11, fontWeight: 700, background: memorialClassificationBackgrounds[editItem.classification], color: memorialClassificationColors[editItem.classification] }}>
                  {t(`memorial.classification.${editItem.classification}`)}
                </span>
                <span style={{ padding: '3px 10px', borderRadius: 10, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(39,174,96,0.1)', color: memorialStatusColors[editItem.status] }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: memorialStatusColors[editItem.status] }} />
                  {t(`memorial.status.${editItem.status}`)}
                </span>
              </div>

              {(editItem.descriptionVi || editItem.descriptionEn) && renderPreviewSection(t('mm.section_description'), (
                <div style={{ fontSize: 13, color: '#1a2332', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                  {editItem.descriptionVi && <div>{editItem.descriptionVi}</div>}
                  {editItem.descriptionEn && editItem.descriptionVi && <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid rgba(15,61,94,0.08)' }} />}
                  {editItem.descriptionEn && <div>{editItem.descriptionEn}</div>}
                </div>
              ))}

              {(editItem.historyVi || editItem.historyEn) && renderPreviewSection(t('mm.section_history'), (
                <div style={{ fontSize: 13, color: '#1a2332', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                  {editItem.historyVi && <div>{editItem.historyVi}</div>}
                  {editItem.historyEn && editItem.historyVi && <hr style={{ margin: '10px 0', border: 'none', borderTop: '1px solid rgba(15,61,94,0.08)' }} />}
                  {editItem.historyEn && <div style={{ color: '#5d7a8c', fontSize: 12 }}>{editItem.historyEn}</div>}
                </div>
              ))}

              {(editItem.commemorationVi || editItem.commemorationEn) && renderPreviewSection(t('mm.section_commemoration'), (
                <div style={{ fontSize: 13, color: '#1a2332', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                  {editItem.commemorationVi && <div>{editItem.commemorationVi}</div>}
                  {editItem.commemorationEn && editItem.commemorationVi && <hr style={{ margin: '10px 0', border: 'none', borderTop: '1px solid rgba(15,61,94,0.08)' }} />}
                  {editItem.commemorationEn && <div style={{ color: '#5d7a8c', fontSize: 12 }}>{editItem.commemorationEn}</div>}
                </div>
              ))}

              {galleryImages.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0F3D5E', marginBottom: 8 }}>{t('mm.gallery')}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                    {galleryImages.slice(0, 6).map((url, i) => (
                      <LazyImage key={i} src={getImageUrl(url)} alt="" style={{ width: '100%', height: 60, objectFit: 'cover', borderRadius: 4 }} />
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
            <p style={{ color: '#5d7a8c', fontSize: 13, marginBottom: 20 }}>{t('mm.delete_confirm')}</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setDeleteId(null)} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid rgba(15,61,94,0.2)', background: 'white', color: '#5d7a8c', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{t('common.cancel')}</button>
              <button onClick={() => handleDelete(deleteId)} style={{ padding: '9px 20px', borderRadius: 8, background: '#E74C3C', border: 'none', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{t('hm.delete')}</button>
            </div>
          </div>
        </div>
      )}

      {showUnsavedConfirm && (
        <ConfirmDialog
          message={lang === 'vi' ? 'Bạn có thay đổi chưa lưu. Hủy bỏ chúng?' : 'You have unsaved changes. Discard them?'}
          onConfirm={() => {
            setShowUnsavedConfirm(false);
            pendingCloseRef.current?.();
            pendingCloseRef.current = null;
          }}
          onCancel={() => {
            setShowUnsavedConfirm(false);
            pendingCloseRef.current = null;
          }}
          confirmLabel={lang === 'vi' ? 'Hủy bỏ' : 'Discard'}
          cancelLabel={lang === 'vi' ? 'Tiếp tục' : 'Keep editing'}
        />
      )}

      <MediaPicker
        open={showMediaPicker}
        onClose={() => { setShowMediaPicker(false); setMediaPickerTarget(null); }}
        onSelect={handleMediaSelect}
        onSelectMultiple={handleMediaSelectMultiple}
        multiple={mediaPickerTarget === 'gallery'}
      />
      <style>{`
        @media (max-width: 767px) {
          .mm-table-wrapper {
            overflow-x: auto !important;
          }
          .mm-table-wrapper table {
            min-width: 560px !important;
          }
        }
      `}</style>
    </div>
  );
}

function renderPreviewSection(title: string, content: React.ReactNode) {
  return (
    <div style={{ marginBottom: 16, padding: 12, background: '#F8FAFC', borderRadius: 8 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#0F3D5E', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.3 }}>
        {title}
      </div>
      {content}
    </div>
  );
}
