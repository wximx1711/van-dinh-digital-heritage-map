import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';
import { useLanguage } from './LanguageContext';
import { useHeritageSites, useClassificationLabels, useTypeLabels, useStatusLabels } from '../../presentation/hooks/useHeritageData';
import { createHeritageSite, updateHeritageSite, deleteHeritageSite, duplicateHeritageSite } from '../services/heritageService';
import { fetchHeritageEvaluationSummaries } from '../services/evaluationService';
import { apiPost, apiDelete, apiGet } from '../services/api';
import { uploadFileWithProgress } from '../services/uploadService';
import type { HeritageSite, Classification, HeritageType, HeritageStatus, HeritageEvaluationSummary } from '../../core/types';
import { classificationColors, statusColors } from '../constants';
import { getImageUrl } from '../utils/url';
import { MediaPicker } from './MediaPicker';
import { ConfirmDialog } from './ConfirmDialog';
import {
  Plus, Search, Filter, Eye, Pencil, Trash2, X, Upload, QrCode,
  ChevronLeft, ChevronRight, MapPin, Check, AlertTriangle,   GripVertical,
  FileText, Image as ImageIcon, Download, Copy, Star, MessageSquare
} from 'lucide-react';
import { Skeleton } from './Skeleton';
import { LazyImage } from './LazyImage';

interface HeritageManagementProps {
  onNavigate?: (page: string, id?: string) => void;
  onDirtyChange?: (dirty: boolean) => void;
  onOpenEvaluations?: (heritageId: string) => void;
}

type FormMode = 'add' | 'edit' | null;

interface DocumentAttachment {
  documentId: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}

function isValidGoogleMapsUrl(url: string): boolean {
  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname.toLowerCase();
    if (host === 'maps.google.com') return true;
    if (host === 'www.google.com' && path.startsWith('/maps')) return true;
    if (host === 'goo.gl' && path.startsWith('/maps')) return true;
    if (host === 'maps.app.goo.gl') return true;
    return false;
  } catch {
    return false;
  }
}

export function HeritageManagement({ onNavigate, onDirtyChange, onOpenEvaluations }: HeritageManagementProps) {
  const { lang, t } = useLanguage();
  const { data: apiSites, refetch } = useHeritageSites();
  const classificationLabels = useClassificationLabels();
  const typeLabels = useTypeLabels();
  const statusLabels = useStatusLabels();
  const [sites, setSites] = useState<HeritageSite[]>([]);
  const [evalSummaries, setEvalSummaries] = useState<Record<string, HeritageEvaluationSummary>>({});
  const [search, setSearch] = useState('');
  const [filterCls, setFilterCls] = useState<Classification | 'all'>('all');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterYearBuilt, setFilterYearBuilt] = useState('');
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [editSite, setEditSite] = useState<HeritageSite | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [duplicateId, setDuplicateId] = useState<string | null>(null);
  const [duplicating, setDuplicating] = useState(false);
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<'thumbnail' | 'gallery' | null>(null);
  const [documents, setDocuments] = useState<DocumentAttachment[]>([]);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [videoUrlMap, setVideoUrlMap] = useState<Record<string, string>>({});
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [showDocUpload, setShowDocUpload] = useState(false);
  const docInputRef = useRef<HTMLInputElement>(null);
  const cleanSnapshotRef = useRef<string | null>(null);
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);
  const pendingCloseRef = useRef<(() => void) | null>(null);

  const isDirty = useMemo(() => {
    if (!formMode || !editSite || !cleanSnapshotRef.current) return false;
    const current = JSON.stringify({
      editSite,
      galleryImages,
      videoUrlInput,
      documents,
    });
    return current !== cleanSnapshotRef.current;
  }, [formMode, editSite, galleryImages, videoUrlInput, documents]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    fetchHeritageEvaluationSummaries()
      .then(summaries => {
        const map: Record<string, HeritageEvaluationSummary> = {};
        summaries.forEach(s => { map[s.targetId] = s; });
        setEvalSummaries(map);
      })
      .catch(() => {});
  }, []);

  const closeForm = useCallback(() => {
    if (!formMode) return;
    const doClose = () => {
      setFormMode(null);
      setEditSite(null);
      setFormErrors({});
      setGalleryImages([]);
      setDocuments([]);
      cleanSnapshotRef.current = null;
    };
    if (isDirty) {
      pendingCloseRef.current = doClose;
      setShowUnsavedConfirm(true);
    } else {
      doClose();
    }
  }, [formMode, isDirty]);

  const PER_PAGE = 6;

  useEffect(() => {
    if (apiSites.length > 0) setSites(apiSites);
  }, [apiSites]);

  const filtered = sites.filter(s => {
    const matchSearch = !search || s.nameVi.toLowerCase().includes(search.toLowerCase()) || s.nameEn.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase());
    const matchCls = filterCls === 'all' || s.classification === filterCls;
    const matchDistrict = !filterDistrict || s.addressVi.toLowerCase().includes(filterDistrict.toLowerCase()) || s.addressEn.toLowerCase().includes(filterDistrict.toLowerCase());
    const matchYearBuilt = !filterYearBuilt || (s.yearBuilt && s.yearBuilt.includes(filterYearBuilt));
    return matchSearch && matchCls && matchDistrict && matchYearBuilt;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  useEffect(() => {
    const ids = paginated.map(s => s.id);
    if (ids.length === 0) return;
    let cancelled = false;
    Promise.all(ids.map(id =>
      apiGet<any[]>('/heritage/' + encodeURIComponent(id) + '/media/videos')
        .then(v => ({ id, url: Array.isArray(v) && v.length > 0 ? (v[0].videoUrl || '') : '' }))
        .catch(() => ({ id, url: '' }))
    )).then(results => {
      if (!cancelled) {
        const map: Record<string, string> = {};
        for (const r of results) { if (r.url) map[r.id] = r.url; }
        setVideoUrlMap(map);
      }
    });
    return () => { cancelled = true; };
  }, [paginated]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteHeritageSite(id);
      setSites(prev => prev.filter(s => s.id !== id));
      setDeleteId(null);
      showToast(lang === 'vi' ? 'Đã xóa di tích thành công' : 'Heritage site deleted successfully');
    } catch (err) {
      const msg = err instanceof Error ? err.message : (lang === 'vi' ? 'Lỗi khi xóa di tích' : 'Failed to delete heritage site');
      showToast(msg, 'error');
    }
  };

  const handleDuplicate = async (id: string) => {
    if (duplicating) return;
    setDuplicating(true);
    try {
      const created = await duplicateHeritageSite(id);
      setDuplicateId(null);
      setSites(prev => [...prev, created]);
      showToast(lang === 'vi' ? 'Đã nhân bản di tích thành công' : 'Heritage duplicated successfully.');
      refetch();
      await openEdit(created);
    } catch (err) {
      const msg = err instanceof Error ? err.message : (lang === 'vi' ? 'Lỗi khi nhân bản di tích' : 'Failed to duplicate heritage site');
      showToast(msg, 'error');
    } finally {
      setDuplicating(false);
    }
  };

  const loadMedia = async (siteId: string) => {
    setLoadingDocs(true);
    let loadedDocs: DocumentAttachment[] = [];
    let loadedVideoUrl = '';
    try {
      const v = await apiGet<any[]>('/heritage/' + encodeURIComponent(siteId) + '/media/videos');
      if (Array.isArray(v) && v.length > 0) {
        loadedVideoUrl = v[0].videoUrl || '';
      }
      setVideoUrlInput(loadedVideoUrl);
    } catch { setVideoUrlInput(''); }
    try {
      const d = await apiGet<any[]>('/heritage/' + encodeURIComponent(siteId) + '/media/documents');
      loadedDocs = Array.isArray(d) ? d.map((x: any) => ({ documentId: x.documentId, fileName: x.fileName || '', fileUrl: x.fileUrl || '', fileType: x.fileType || '', fileSize: x.fileSize || 0 })) : [];
      setDocuments(loadedDocs);
    } catch { setDocuments([]); }
    setLoadingDocs(false);
    cleanSnapshotRef.current = JSON.stringify({
      editSite,
      galleryImages,
      videoUrlInput: loadedVideoUrl,
      documents: loadedDocs,
    });
  };

  const openEdit = async (site: HeritageSite) => {
    const siteCopy = { ...site };
    setEditSite(siteCopy);
    const initialGallery = site.images.length > 0 ? [...site.images] : [];
    setGalleryImages(initialGallery);
    setVideoUrlInput('');
    setFormErrors({});
    setFormMode('edit');
    await loadMedia(site.id);
  };

  const openAdd = () => {
    const newSite = {
      id: '',
      code: '',
      nameVi: '', nameEn: '', type: '' as HeritageType, classification: 'unranked',
      status: 'active', addressVi: '', addressEn: '',
      lat: null, lon: null, googleMapUrl: '',
      descriptionVi: '', descriptionEn: '',
      historyVi: '', historyEn: '',
      image: '',
      images: [],
      updatedAt: new Date().toISOString().slice(0, 10),
      yearBuilt: '', guardian: '',
    };
    setEditSite(newSite);
    setGalleryImages([]);
    setVideoUrlInput('');
    setDocuments([]);
    setFormErrors({});
    setFormMode('add');
    cleanSnapshotRef.current = JSON.stringify({
      editSite: newSite,
      galleryImages: [],
      videoUrlInput: '',
      documents: [],
    });
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!editSite) return false;
    const currentYear = new Date().getFullYear();

    if (!editSite.nameVi.trim()) errors.nameVi = lang === 'vi' ? 'Tên di tích (VI) là bắt buộc' : 'Heritage Name (VI) is required';
    else if (editSite.nameVi.trim().length < 5) errors.nameVi = lang === 'vi' ? 'Tối thiểu 5 ký tự' : 'Minimum 5 characters';
    else if (editSite.nameVi.length > 200) errors.nameVi = lang === 'vi' ? 'Tối đa 200 ký tự' : 'Max 200 characters';
    else if (editSite.nameVi !== editSite.nameVi.trim()) errors.nameVi = lang === 'vi' ? 'Không được có khoảng trắng đầu/cuối' : 'Cannot have leading/trailing spaces';

    if (!editSite.nameEn.trim()) errors.nameEn = lang === 'vi' ? 'Tên di tích (EN) là bắt buộc' : 'Heritage Name (EN) is required';
    else if (editSite.nameEn.trim().length < 5) errors.nameEn = lang === 'vi' ? 'Tối thiểu 5 ký tự' : 'Minimum 5 characters';
    else if (editSite.nameEn.length > 200) errors.nameEn = lang === 'vi' ? 'Tối đa 200 ký tự' : 'Max 200 characters';
    else if (editSite.nameEn !== editSite.nameEn.trim()) errors.nameEn = lang === 'vi' ? 'Không được có khoảng trắng đầu/cuối' : 'Cannot have leading/trailing spaces';

    if (!editSite.type) errors.type = lang === 'vi' ? 'Loại di tích là bắt buộc' : 'Category is required';
    if (!editSite.classification) errors.classification = lang === 'vi' ? 'Phân loại là bắt buộc' : 'Classification is required';
    if (!editSite.status) errors.status = lang === 'vi' ? 'Trạng thái là bắt buộc' : 'Status is required';

    if (!editSite.yearBuilt.trim()) errors.yearBuilt = lang === 'vi' ? 'Năm xây dựng là bắt buộc' : 'Year built is required';

    if (editSite.id && !editSite.code.trim()) errors.code = lang === 'vi' ? 'Mã di tích là bắt buộc' : 'Code is required';

    if (!editSite.googleMapUrl.trim()) errors.googleMapUrl = lang === 'vi' ? 'Google Maps URL là bắt buộc' : 'Google Maps URL is required';
    else if (!isValidGoogleMapsUrl(editSite.googleMapUrl))
      errors.googleMapUrl = lang === 'vi' ? 'Phải là đường dẫn Google Maps hợp lệ (maps.google, google.com/maps, goo.gl/maps, maps.app.goo.gl)' : 'Must be a valid Google Maps link (maps.google, google.com/maps, goo.gl/maps, maps.app.goo.gl)';

    if (!editSite.addressVi.trim()) errors.addressVi = lang === 'vi' ? 'Địa chỉ (VI) là bắt buộc' : 'Address (VI) is required';
    else if (editSite.addressVi.trim().length < 5) errors.addressVi = lang === 'vi' ? 'Tối thiểu 5 ký tự' : 'Minimum 5 characters';
    else if (editSite.addressVi.length > 300) errors.addressVi = lang === 'vi' ? 'Tối đa 300 ký tự' : 'Max 300 characters';

    if (!editSite.addressEn.trim()) errors.addressEn = lang === 'vi' ? 'Địa chỉ (EN) là bắt buộc' : 'Address (EN) is required';
    else if (editSite.addressEn.trim().length < 5) errors.addressEn = lang === 'vi' ? 'Tối thiểu 5 ký tự' : 'Minimum 5 characters';
    else if (editSite.addressEn.length > 300) errors.addressEn = lang === 'vi' ? 'Tối đa 300 ký tự' : 'Max 300 characters';

    if (!editSite.image) errors.image = lang === 'vi' ? 'Ảnh đại diện là bắt buộc' : 'Thumbnail image is required';

    if (!editSite.descriptionVi.trim()) errors.descriptionVi = lang === 'vi' ? 'Mô tả (VI) là bắt buộc' : 'Description (VI) is required';
    if (!editSite.descriptionEn.trim()) errors.descriptionEn = lang === 'vi' ? 'Mô tả (EN) là bắt buộc' : 'Description (EN) is required';

    if (!editSite.historyVi.trim()) errors.historyVi = lang === 'vi' ? 'Lịch sử (VI) là bắt buộc' : 'History (VI) is required';
    if (!editSite.historyEn.trim()) errors.historyEn = lang === 'vi' ? 'Lịch sử (EN) là bắt buộc' : 'History (EN) is required';

    if (editSite.guardian && editSite.guardian.length > 150) errors.guardian = lang === 'vi' ? 'Tối đa 150 ký tự' : 'Max 150 characters';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!editSite) return;
    setFormErrors({});
    if (!validateForm()) return;
    try {
      const payload: Record<string, unknown> = {
        code: editSite.code,
        nameVi: editSite.nameVi,
        nameEn: editSite.nameEn,
        type: editSite.type,
        classification: editSite.classification,
        status: editSite.status,
        addressVi: editSite.addressVi || null,
        addressEn: editSite.addressEn || null,
        googleMapUrl: editSite.googleMapUrl || null,
        descriptionVi: editSite.descriptionVi || null,
        descriptionEn: editSite.descriptionEn || null,
        historyVi: editSite.historyVi || null,
        historyEn: editSite.historyEn || null,
        image: editSite.image || null,
        yearBuilt: editSite.yearBuilt || null,
        guardian: editSite.guardian || null,
        imageUrls: galleryImages.length > 0 ? galleryImages : null,
      };
      if (!editSite.id || !editSite.id.trim()) {
        const newSite = await createHeritageSite(payload);
        if (videoUrlInput) {
          try {
            const formData = new FormData();
            formData.append('title', editSite.nameVi || '');
            formData.append('youtubeUrl', videoUrlInput);
            await apiPost('/heritage/' + encodeURIComponent(newSite.id) + '/media/videos', formData, true);
          } catch { /* skip */ }
        }
        showToast(lang === 'vi' ? 'Đã thêm di tích mới thành công' : 'New heritage site added successfully');
      } else {
        await updateHeritageSite(editSite.id, payload);
        try {
          const existing = await apiGet<any[]>('/heritage/' + encodeURIComponent(editSite.id) + '/media/videos');
          const existingVideos = Array.isArray(existing) ? existing : [];
          const storedUrl = existingVideos.length > 0 ? (existingVideos[0].videoUrl || '') : '';
          const currentUrl = videoUrlInput || '';
          if (currentUrl !== storedUrl) {
            for (const v of existingVideos) {
              await apiDelete('/heritage/' + encodeURIComponent(editSite.id) + '/media/videos/' + v.videoId);
            }
            if (currentUrl) {
              const formData = new FormData();
              formData.append('title', editSite.nameVi || '');
              formData.append('youtubeUrl', currentUrl);
              await apiPost('/heritage/' + encodeURIComponent(editSite.id) + '/media/videos', formData, true);
            }
          }
        } catch { /* skip */ }
        showToast(lang === 'vi' ? 'Đã cập nhật di tích thành công' : 'Heritage site updated successfully');
      }
      setFormMode(null);
      setEditSite(null);
      setFormErrors({});
      cleanSnapshotRef.current = null;
      setGalleryImages([]);
      setDocuments([]);
      refetch();
    } catch (err) {
      const msg = err instanceof Error ? err.message : (lang === 'vi' ? 'Lỗi khi lưu dữ liệu' : 'Failed to save data');
      showToast(msg, 'error');
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await uploadFile(file);
  };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragOver(false); };

  const uploadFile = async (file: File) => {
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
      setEditSite(s => s ? { ...s, image: result.url } : s);
      setFormErrors(prev => ({ ...prev, image: '' }));
      showToast(lang === 'vi' ? 'Tải ảnh thành công' : 'Upload successful');
    } catch (err) {
      const msg = err instanceof Error ? err.message : (lang === 'vi' ? 'Tải ảnh thất bại' : 'Upload failed');
      showToast(msg, 'error');
    } finally { setUploading(false); setUploadProgress(0); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
    if (e.target) e.target.value = '';
  };

  const openMediaPicker = (target: 'thumbnail' | 'gallery') => {
    setMediaPickerTarget(target);
    setShowMediaPicker(true);
  };

  const handleMediaSelect = (url: string) => {
    if (mediaPickerTarget === 'thumbnail') {
      setEditSite(s => s ? { ...s, image: url } : s);
      setFormErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const handleMediaSelectMultiple = (urls: string[]) => {
    if (mediaPickerTarget === 'gallery') {
      const maxImages = 20;
      const currentCount = galleryImages.length;
      if (currentCount + urls.length > maxImages) {
        showToast(lang === 'vi' ? `Tối đa ${maxImages} ảnh trong thư viện` : `Maximum ${maxImages} gallery images`, 'error');
        return;
      }
      setGalleryImages(prev => [...prev, ...urls]);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
  };

  const moveGalleryImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= galleryImages.length) return;
    const newImages = [...galleryImages];
    const [moved] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, moved);
    setGalleryImages(newImages);
  };



  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { showToast(lang === 'vi' ? 'Chỉ chấp nhận PDF' : 'Only PDF allowed', 'error'); return; }
    if (file.size > 20 * 1024 * 1024) { showToast(lang === 'vi' ? 'Tối đa 20MB' : 'Max 20MB', 'error'); return; }
    if (formMode === 'add') {
      showToast(lang === 'vi' ? 'Lưu di tích trước, sau đó thêm tài liệu' : 'Save the site first, then add documents', 'error');
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await uploadFileWithProgress({
        path: '/heritage/' + encodeURIComponent(editSite!.id) + '/media/documents',
        formData,
        onProgress: setUploadProgress,
      });
      setDocuments(prev => [...prev, { documentId: result.documentId, fileName: result.fileName || '', fileUrl: result.fileUrl || '', fileType: result.fileType || '', fileSize: result.fileSize || 0 }]);
      showToast(lang === 'vi' ? 'Đã thêm tài liệu' : 'Document added');
    } catch (err) {
      const msg = err instanceof Error ? err.message : (lang === 'vi' ? 'Lỗi khi tải tài liệu' : 'Failed to upload document');
      showToast(msg, 'error');
    } finally { setUploading(false); setUploadProgress(0); }
    if (e.target) e.target.value = '';
  };

  const handleDeleteDoc = async (docId: number) => {
    if (formMode === 'add') {
      setDocuments(prev => prev.filter(d => d.documentId !== docId));
      return;
    }
    try {
      await apiDelete('/heritage/' + encodeURIComponent(editSite!.id) + '/media/documents/' + docId);
      setDocuments(prev => prev.filter(d => d.documentId !== docId));
      showToast(lang === 'vi' ? 'Đã xóa tài liệu' : 'Document deleted');
    } catch (err) {
      const msg = err instanceof Error ? err.message : (lang === 'vi' ? 'Lỗi khi xóa tài liệu' : 'Failed to delete document');
      showToast(msg, 'error');
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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
          <h1 style={{ color: '#0F3D5E', margin: 0, fontSize: 20, fontFamily: 'Merriweather, serif' }}>{t('admin.heritage_mgmt')}</h1>
          <p style={{ color: '#5d7a8c', fontSize: 12, margin: '4px 0 0' }}>
            {lang === 'vi' ? `Tổng cộng ${filtered.length} di tích` : `Total ${filtered.length} heritage sites`}
          </p>
        </div>
        <button onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 8, background: '#0F3D5E', border: 'none', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(15,61,94,0.25)' }}>
          <Plus size={16} /> {t('hm.add')}
        </button>
      </div>

      <div className="hm-filters" style={{ background: 'white', borderRadius: 10, padding: '14px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', boxShadow: '0 1px 6px rgba(15,61,94,0.06)' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#5d7a8c' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder={t('hm.search')} style={{ ...inputStyle, paddingLeft: 32, background: '#F0F4F8' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Filter size={13} style={{ color: '#5d7a8c' }} />
          <select value={filterCls} onChange={e => { setFilterCls(e.target.value as Classification | 'all'); setPage(1); }} style={{ ...inputStyle, width: 'auto', background: 'white', cursor: 'pointer' }}>
            <option value="all">{t('common.all')}</option>
            <option value="national">{t('map.national')}</option>
            <option value="city">{t('map.city')}</option>
            <option value="unranked">{t('map.unranked')}</option>
          </select>
        </div>
        <div style={{ position: 'relative', minWidth: 140 }}>
          <MapPin size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#5d7a8c' }} />
          <input value={filterDistrict} onChange={e => { setFilterDistrict(e.target.value); setPage(1); }} placeholder={lang === 'vi' ? 'Quận/Huyện' : 'District'} style={{ ...inputStyle, paddingLeft: 32, background: '#F0F4F8', fontSize: 12 }} />
        </div>
        <div style={{ position: 'relative', minWidth: 110 }}>
          <input value={filterYearBuilt} onChange={e => { setFilterYearBuilt(e.target.value); setPage(1); }} placeholder={lang === 'vi' ? 'Năm xây dựng' : 'Year built'} style={{ ...inputStyle, paddingLeft: 10, background: '#F0F4F8', fontSize: 12 }} />
        </div>
      </div>

      <div className="hm-table-wrapper" style={{ background: 'white', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 6px rgba(15,61,94,0.06)' }}>
        <div className="hm-table-scroll" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
          <thead>
            <tr style={{ background: '#0F3D5E' }}>
              {[t('hm.id'), t('hm.name'), t('hm.classification'), t('hm.type'), t('hm.status'), lang === 'vi' ? 'Video' : 'Video', lang === 'vi' ? 'Đánh giá' : 'Rating', t('hm.updated'), t('hm.actions')].map(h => (
                <th key={h} style={{ padding: '12px 14px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.8)', textAlign: 'left', textTransform: 'uppercase', letterSpacing: 0.4, whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((site, i) => (
              <tr key={site.id} style={{ background: i % 2 === 0 ? 'white' : '#FAFBFD', borderBottom: '1px solid rgba(15,61,94,0.04)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = '#EBF5FB'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = i % 2 === 0 ? 'white' : '#FAFBFD'; }}>
                <td style={{ padding: '12px 14px', fontSize: 11, color: '#5d7a8c', fontWeight: 600 }}>{site.code}</td>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <LazyImage src={getImageUrl(site.image)} alt="" style={{ width: 36, height: 28, borderRadius: 4, objectFit: 'cover' }} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#0F3D5E' }}>{lang === 'vi' ? site.nameVi : site.nameEn}</div>
                      <div style={{ fontSize: 10, color: '#5d7a8c', display: 'flex', alignItems: 'center', gap: 2 }}>
                        <MapPin size={9} /> {lang === 'vi' ? 'Vân Đình, Thành phố Hà Nội' : 'Van Dinh, Hanoi'}
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ padding: '3px 8px', borderRadius: 8, fontSize: 10, fontWeight: 700, background: `${classificationColors[site.classification]}15`, color: classificationColors[site.classification] }}>
                    {classificationLabels[site.classification][lang]}
                  </span>
                </td>
                <td style={{ padding: '12px 14px', fontSize: 12, color: '#5d7a8c' }}>{typeLabels[site.type][lang]}</td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: statusColors[site.status], fontWeight: 600 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColors[site.status], display: 'inline-block' }} />
                    {statusLabels[site.status][lang]}
                  </span>
                </td>
                <td style={{ padding: '12px 14px', fontSize: 11, color: '#5d7a8c' }}>
                  {videoUrlMap[site.id] ? (
                    <a href={videoUrlMap[site.id]} target="_blank" rel="noreferrer" style={{ color: '#D4A017', textDecoration: 'underline', fontSize: 11 }}>
                      {lang === 'vi' ? 'Xem' : 'Watch'}
                    </a>
                  ) : '-'}
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <button
                    onClick={() => onOpenEvaluations?.(site.id)}
                    disabled={!onOpenEvaluations}
                    title={lang === 'vi' ? 'Xem đánh giá' : 'View ratings'}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: onOpenEvaluations ? 'pointer' : 'default', padding: 0,
                    }}
                  >
                    {(evalSummaries[site.id]?.averageScore ?? 0) > 0 ? (
                      <>
                        <Star size={12} style={{ color: '#D4A017', fill: '#D4A017' }} />
                        <span style={{ fontSize: 11, color: '#0F3D5E', fontWeight: 700 }}>{evalSummaries[site.id]?.averageScore.toFixed(1)}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 10, color: '#5d7a8c' }}>
                          <MessageSquare size={9} /> {evalSummaries[site.id]?.totalEvaluations ?? 0}
                        </span>
                      </>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: '#5d7a8c' }}>
                        <Star size={11} /> {evalSummaries[site.id]?.totalEvaluations ? evalSummaries[site.id].totalEvaluations : '0'}
                      </span>
                    )}
                  </button>
                </td>
                <td style={{ padding: '12px 14px', fontSize: 11, color: '#5d7a8c' }}>{site.updatedAt}</td>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => onNavigate?.('heritage-detail', site.id)}
                      style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(15,61,94,0.15)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F3D5E' }}
                      title={t('hm.view')}><Eye size={12} /></button>
                    <button onClick={() => openEdit(site)}
                      style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(15,61,94,0.15)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4A017' }}
                      title={t('hm.edit')}><Pencil size={12} /></button>
                    <button onClick={() => setDuplicateId(site.id)}
                      style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(39,174,96,0.25)', background: '#EAF9F0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#27AE60' }}
                      title={t('hm.duplicate')}><Copy size={12} /></button>
                    <button onClick={() => setDeleteId(site.id)}
                      style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(231,76,60,0.2)', background: '#FDEDEC', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E74C3C' }}
                      title={t('hm.delete')}><Trash2 size={12} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr><td colSpan={9} style={{ padding: '32px', textAlign: 'center', color: '#5d7a8c', fontSize: 13 }}>{t('common.nodata')}</td></tr>
            )}
          </tbody>
        </table>
        </div>

        {totalPages > 1 && (
          <div className="hm-pagination" style={{ padding: '12px 16px', borderTop: '1px solid rgba(15,61,94,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="hide-pagination-label" style={{ fontSize: 12, color: '#5d7a8c' }}>
              {lang === 'vi' ? `Hiển thị ${(page-1)*PER_PAGE+1}–${Math.min(page*PER_PAGE, filtered.length)} trong ${filtered.length}` : `Showing ${(page-1)*PER_PAGE+1}–${Math.min(page*PER_PAGE, filtered.length)} of ${filtered.length}`}
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
      {formMode && editSite && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500 }}
          onClick={closeForm}>
          <div style={{ background: 'white', borderRadius: 12, width: '95%', maxWidth: 860, maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding: '14px 20px', background: '#0F3D5E', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>{formMode === 'add' ? t('hm.add') : t('hm.edit')}</span>
              <button onClick={closeForm}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {/* Code - Auto generated, read only */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>{t('detail.code')} *</label>
                  <input style={{ ...inputStyle, background: '#dce8f0', color: '#5d7a8c', cursor: 'not-allowed' }} value={editSite.code} readOnly title={lang === 'vi' ? 'Mã tự động tạo' : 'Auto-generated code'} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>{lang === 'vi' ? 'Năm xây dựng' : 'Year Built'}</label>
                  <input style={{ ...inputStyle, borderColor: formErrors.yearBuilt ? '#E74C3C' : 'rgba(15,61,94,0.15)' }} value={editSite.yearBuilt} onChange={e => { setEditSite(s => s ? { ...s, yearBuilt: e.target.value } : s); setFormErrors(prev => ({ ...prev, yearBuilt: '' })); }} />
                  {formErrors.yearBuilt && <span style={{ fontSize: 11, color: '#E74C3C', marginTop: 2, display: 'block' }}>{formErrors.yearBuilt}</span>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>{lang === 'vi' ? 'Tên di tích (VI)' : 'Heritage Name (VI)'} *</label>
                  <input style={{ ...inputStyle, borderColor: formErrors.nameVi ? '#E74C3C' : 'rgba(15,61,94,0.15)' }} value={editSite.nameVi} onChange={e => { setEditSite(s => s ? { ...s, nameVi: e.target.value } : s); setFormErrors(prev => ({ ...prev, nameVi: '' })); }} />
                  {formErrors.nameVi && <span style={{ fontSize: 11, color: '#E74C3C', marginTop: 2, display: 'block' }}>{formErrors.nameVi}</span>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>{lang === 'vi' ? 'Tên di tích (EN)' : 'Heritage Name (EN)'} *</label>
                  <input style={{ ...inputStyle, borderColor: formErrors.nameEn ? '#E74C3C' : 'rgba(15,61,94,0.15)' }} value={editSite.nameEn} onChange={e => { setEditSite(s => s ? { ...s, nameEn: e.target.value } : s); setFormErrors(prev => ({ ...prev, nameEn: '' })); }} />
                  {formErrors.nameEn && <span style={{ fontSize: 11, color: '#E74C3C', marginTop: 2, display: 'block' }}>{formErrors.nameEn}</span>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>{t('hm.type')} *</label>
                  <select style={{ ...inputStyle, background: 'white', cursor: 'pointer', borderColor: formErrors.type ? '#E74C3C' : 'rgba(15,61,94,0.15)' }} value={editSite.type}
                    onChange={e => { setEditSite(s => s ? { ...s, type: e.target.value as HeritageType } : s); setFormErrors(prev => ({ ...prev, type: '' })); }}>
                    <option value="">{lang === 'vi' ? '-- Chọn loại --' : '-- Select type --'}</option>
                    {(Object.keys(typeLabels) as HeritageType[]).map(type => (<option key={type} value={type}>{typeLabels[type][lang]}</option>))}
                  </select>
                  {formErrors.type && <span style={{ fontSize: 11, color: '#E74C3C', marginTop: 2, display: 'block' }}>{formErrors.type}</span>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>{t('hm.classification')} *</label>
                  <select style={{ ...inputStyle, background: 'white', cursor: 'pointer', borderColor: formErrors.classification ? '#E74C3C' : 'rgba(15,61,94,0.15)' }} value={editSite.classification}
                    onChange={e => { setEditSite(s => s ? { ...s, classification: e.target.value as Classification } : s); setFormErrors(prev => ({ ...prev, classification: '' })); }}>
                    {(['national', 'city', 'unranked'] as Classification[]).map(c => (<option key={c} value={c}>{classificationLabels[c][lang]}</option>))}
                  </select>
                  {formErrors.classification && <span style={{ fontSize: 11, color: '#E74C3C', marginTop: 2, display: 'block' }}>{formErrors.classification}</span>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>{t('hm.status')} *</label>
                  <select style={{ ...inputStyle, background: 'white', cursor: 'pointer', borderColor: formErrors.status ? '#E74C3C' : 'rgba(15,61,94,0.15)' }} value={editSite.status}
                    onChange={e => { setEditSite(s => s ? { ...s, status: e.target.value as HeritageStatus } : s); setFormErrors(prev => ({ ...prev, status: '' })); }}>
                    {(['active', 'maintenance', 'closed'] as HeritageStatus[]).map(c => (<option key={c} value={c}>{statusLabels[c][lang]}</option>))}
                  </select>
                  {formErrors.status && <span style={{ fontSize: 11, color: '#E74C3C', marginTop: 2, display: 'block' }}>{formErrors.status}</span>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>{lang === 'vi' ? 'Đơn vị quản lý' : 'Managing Unit'}</label>
                  <input style={{ ...inputStyle, borderColor: formErrors.guardian ? '#E74C3C' : 'rgba(15,61,94,0.15)' }} value={editSite.guardian} onChange={e => { setEditSite(s => s ? { ...s, guardian: e.target.value } : s); setFormErrors(prev => ({ ...prev, guardian: '' })); }} />
                  {formErrors.guardian && <span style={{ fontSize: 11, color: '#E74C3C', marginTop: 2, display: 'block' }}>{formErrors.guardian}</span>}
                </div>

                {/* Google Maps URL */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>{lang === 'vi' ? 'Google Maps URL' : 'Google Maps URL'} *</label>
                  <input style={{ ...inputStyle, borderColor: formErrors.googleMapUrl ? '#E74C3C' : 'rgba(15,61,94,0.15)' }} type="url" placeholder="https://maps.google.com/..." value={editSite.googleMapUrl} onChange={e => { setEditSite(s => s ? { ...s, googleMapUrl: e.target.value } : s); setFormErrors(prev => ({ ...prev, googleMapUrl: '' })); }} />
                  {formErrors.googleMapUrl && <span style={{ fontSize: 11, color: '#E74C3C', marginTop: 2, display: 'block' }}>{formErrors.googleMapUrl}</span>}
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>{t('common.address')} (VI) *</label>
                  <input style={{ ...inputStyle, borderColor: formErrors.addressVi ? '#E74C3C' : 'rgba(15,61,94,0.15)' }} value={editSite.addressVi} onChange={e => { setEditSite(s => s ? { ...s, addressVi: e.target.value } : s); setFormErrors(prev => ({ ...prev, addressVi: '' })); }} />
                  {formErrors.addressVi && <span style={{ fontSize: 11, color: '#E74C3C', marginTop: 2, display: 'block' }}>{formErrors.addressVi}</span>}
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>{t('common.address')} (EN) *</label>
                  <input style={{ ...inputStyle, borderColor: formErrors.addressEn ? '#E74C3C' : 'rgba(15,61,94,0.15)' }} value={editSite.addressEn} onChange={e => { setEditSite(s => s ? { ...s, addressEn: e.target.value } : s); setFormErrors(prev => ({ ...prev, addressEn: '' })); }} />
                  {formErrors.addressEn && <span style={{ fontSize: 11, color: '#E74C3C', marginTop: 2, display: 'block' }}>{formErrors.addressEn}</span>}
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>{t('common.description')} (VI) *</label>
                  <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 72, borderColor: formErrors.descriptionVi ? '#E74C3C' : 'rgba(15,61,94,0.15)' }}
                    value={editSite.descriptionVi} onChange={e => { setEditSite(s => s ? { ...s, descriptionVi: e.target.value } : s); setFormErrors(prev => ({ ...prev, descriptionVi: '' })); }} />
                  {formErrors.descriptionVi && <span style={{ fontSize: 11, color: '#E74C3C', marginTop: 2, display: 'block' }}>{formErrors.descriptionVi}</span>}
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>{t('common.description')} (EN) *</label>
                  <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 72, borderColor: formErrors.descriptionEn ? '#E74C3C' : 'rgba(15,61,94,0.15)' }}
                    value={editSite.descriptionEn} onChange={e => { setEditSite(s => s ? { ...s, descriptionEn: e.target.value } : s); setFormErrors(prev => ({ ...prev, descriptionEn: '' })); }} />
                  {formErrors.descriptionEn && <span style={{ fontSize: 11, color: '#E74C3C', marginTop: 2, display: 'block' }}>{formErrors.descriptionEn}</span>}
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>{lang === 'vi' ? 'Lịch sử (VI)' : 'History (VI)'} *</label>
                  <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 100, borderColor: formErrors.historyVi ? '#E74C3C' : 'rgba(15,61,94,0.15)' }}
                    value={editSite.historyVi} onChange={e => { setEditSite(s => s ? { ...s, historyVi: e.target.value } : s); setFormErrors(prev => ({ ...prev, historyVi: '' })); }} />
                  {formErrors.historyVi && <span style={{ fontSize: 11, color: '#E74C3C', marginTop: 2, display: 'block' }}>{formErrors.historyVi}</span>}
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>{lang === 'vi' ? 'Lịch sử (EN)' : 'History (EN)'} *</label>
                  <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 100, borderColor: formErrors.historyEn ? '#E74C3C' : 'rgba(15,61,94,0.15)' }}
                    value={editSite.historyEn} onChange={e => { setEditSite(s => s ? { ...s, historyEn: e.target.value } : s); setFormErrors(prev => ({ ...prev, historyEn: '' })); }} />
                  {formErrors.historyEn && <span style={{ fontSize: 11, color: '#E74C3C', marginTop: 2, display: 'block' }}>{formErrors.historyEn}</span>}
                </div>

                {/* Thumbnail with Media Library picker */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>{lang === 'vi' ? 'Ảnh đại diện' : 'Thumbnail Image'} *</label>
                  <div onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px', borderRadius: 8, border: `2px dashed ${dragOver ? '#D4A017' : formErrors.image ? '#E74C3C' : 'rgba(15,61,94,0.15)'}`, background: dragOver ? '#FEF9E7' : '#F8FAFC', cursor: uploading ? 'wait' : 'pointer', transition: 'all 0.2s' }}>
                    <div style={{ width: 120, height: 90, borderRadius: 8, overflow: 'hidden', background: '#dce8f0', border: '1px solid rgba(15,61,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {editSite.image ? <LazyImage src={getImageUrl(editSite.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ textAlign: 'center', padding: 8 }}><Upload size={24} style={{ color: '#5d7a8c', opacity: 0.5, marginBottom: 4 }} /><span style={{ fontSize: 11, color: '#5d7a8c' }}>{lang === 'vi' ? 'Kéo ảnh vào đây' : 'Drop image here'}</span></div>}
                    </div>
                    <div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 6, background: uploading ? '#5d7a8c' : '#0F3D5E', color: 'white', fontSize: 12, fontWeight: 600, opacity: uploading ? 0.7 : 1 }}>
                          <Upload size={14} />
                          {uploading ? `${uploadProgress}%` : (lang === 'vi' ? 'Tải ảnh lên' : 'Upload Image')}
                        </div>
                        <div onClick={(e) => { e.stopPropagation(); openMediaPicker('thumbnail'); }}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 6, border: '1px solid rgba(15,61,94,0.2)', background: 'white', color: '#0F3D5E', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                          <ImageIcon size={14} /> {lang === 'vi' ? 'Từ thư viện' : 'From Library'}
                        </div>
                      </div>
                      {uploading && (
                        <div style={{ marginTop: 8, width: '100%', height: 6, background: '#dce8f0', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${uploadProgress}%`, height: '100%', background: '#D4A017', borderRadius: 3, transition: 'width 0.2s ease' }} />
                        </div>
                      )}
                      <p style={{ fontSize: 10, color: '#cbced4', margin: uploading ? '4px 0 0' : '6px 0 0' }}>{lang === 'vi' ? 'PNG, JPG, JPEG, WebP, HEIC, HEIF — tối đa 5MB. Kéo thả hoặc nhấp để chọn.' : 'PNG, JPG, JPEG, WebP, HEIC, HEIF — max 5MB. Drag & drop or click to select.'}</p>
                    </div>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif" style={{ display: 'none' }} onChange={handleImageUpload} disabled={uploading} />
                  {formErrors.image && <span style={{ fontSize: 11, color: '#E74C3C', marginTop: 4, display: 'block' }}>{formErrors.image}</span>}
                </div>

                {/* Gallery Images */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                    {lang === 'vi' ? 'Thư viện ảnh' : 'Gallery Images'} <span style={{ color: '#5d7a8c', fontWeight: 400 }}>({galleryImages.length})</span>
                  </label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                    {galleryImages.map((url, i) => (
                      <div key={i}
                        draggable
                        onDragStart={() => setDragIndex(i)}
                        onDragOver={e => { e.preventDefault(); }}
                        onDrop={() => { if (dragIndex !== null && dragIndex !== i) { moveGalleryImage(dragIndex, i); setDragIndex(null); } }}
                        style={{ position: 'relative', width: 90, height: 70, borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(15,61,94,0.1)', cursor: 'grab' }}>
                        <div style={{ position: 'absolute', top: 2, left: 2, width: 18, height: 18, borderRadius: 4, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                          <GripVertical size={10} />
                        </div>
                        <LazyImage src={getImageUrl(url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                        <button onClick={() => removeGalleryImage(i)}
                          style={{ position: 'absolute', top: 2, right: 2, width: 18, height: 18, borderRadius: '50%', background: 'rgba(231,76,60,0.85)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                    <button onClick={() => openMediaPicker('gallery')}
                      style={{ width: 90, height: 70, borderRadius: 6, border: '2px dashed rgba(15,61,94,0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#5d7a8c', fontSize: 10, gap: 4, background: '#F8FAFC' }}>
                      <ImageIcon size={16} />
                      {lang === 'vi' ? 'Thêm ảnh' : 'Add Image'}
                    </button>
                  </div>
                </div>

                {/* Video URL */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                    {t('im.video_url')}
                  </label>
                  <input
                    style={{ ...inputStyle }}
                    type="url"
                    placeholder={lang === 'vi' ? 'https://www.youtube.com/watch?v=...' : 'https://www.youtube.com/watch?v=...'}
                    value={videoUrlInput}
                    onChange={e => setVideoUrlInput(e.target.value)}
                  />
                </div>

                {/* Documents Section */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#0F3D5E', textTransform: 'uppercase', letterSpacing: 0.3 }}>
                      <FileText size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                      {lang === 'vi' ? 'Tài liệu PDF' : 'PDF Documents'} <span style={{ color: '#5d7a8c', fontWeight: 400 }}>({documents.length})</span>
                    </label>
                    <button onClick={() => setShowDocUpload(!showDocUpload)}
                      style={{ padding: '4px 10px', borderRadius: 4, border: '1px solid rgba(15,61,94,0.2)', background: 'white', color: '#0F3D5E', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>
                      {showDocUpload ? (lang === 'vi' ? 'Đóng' : 'Close') : (lang === 'vi' ? 'Thêm tài liệu' : 'Add Document')}
                    </button>
                  </div>

                  {showDocUpload && (
                    <div style={{ padding: '10px', background: '#F0F4F8', borderRadius: 8, marginBottom: 10 }}>
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 6, background: uploading ? '#5d7a8c' : '#0F3D5E', color: 'white', fontSize: 12, fontWeight: 600, cursor: uploading ? 'wait' : 'pointer' }}>
                        <Upload size={14} /> {uploading ? `${uploadProgress}%` : (lang === 'vi' ? 'Chọn file PDF' : 'Select PDF file')}
                        <input ref={docInputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleDocUpload} disabled={uploading} />
                      </label>
                      <p style={{ fontSize: 10, color: '#cbced4', margin: '4px 0 0' }}>{lang === 'vi' ? 'PDF — tối đa 20MB' : 'PDF — max 20MB'}</p>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                    {documents.map(d => (
                      <div key={d.documentId} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6, background: '#F8FAFC', border: '1px solid rgba(15,61,94,0.08)' }}>
                        <FileText size={14} style={{ color: '#E74C3C', flexShrink: 0 }} />
                        <span style={{ fontSize: 11, color: '#0F3D5E', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.fileName}</span>
                        <span style={{ fontSize: 10, color: '#5d7a8c', flexShrink: 0 }}>{formatSize(d.fileSize)}</span>
                        <a href={d.fileUrl} target="_blank" rel="noreferrer" style={{ color: '#0F3D5E', display: 'flex' }}><Download size={11} /></a>
                        <button onClick={() => handleDeleteDoc(d.documentId)} style={{ background: 'none', border: 'none', color: '#E74C3C', cursor: 'pointer', padding: 2 }}>
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {loadingDocs && <Skeleton width={80} height={14} borderRadius={3} />}
                  </div>
                </div>

                {/* QR code preview */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px', background: '#EBF5FB', borderRadius: 8 }}>
                    <QrCode size={20} style={{ color: '#0F3D5E' }} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#0F3D5E' }}>{t('common.gen_qr')}</div>
                      <div style={{ fontSize: 11, color: '#5d7a8c' }}>
                        {lang === 'vi' ? 'Mã QR sẽ được tự động tạo khi lưu' : 'QR code will be auto-generated on save'}
                      </div>
                    </div>
                    <span style={{ marginLeft: 'auto', padding: '3px 8px', borderRadius: 4, background: '#27AE60', color: 'white', fontSize: 10, fontWeight: 700 }}>
                      {lang === 'vi' ? 'Tự động' : 'Auto'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(15,61,94,0.1)', display: 'flex', justifyContent: 'flex-end', gap: 10, background: '#F8FAFC' }}>
              <button onClick={() => setShowPreview(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 8, border: '1px solid rgba(15,61,94,0.2)', background: 'white', color: '#0F3D5E', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                <Eye size={14} /> {lang === 'vi' ? 'Xem trước' : 'Preview'}
              </button>
              <button onClick={closeForm}
                style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid rgba(15,61,94,0.2)', background: 'white', color: '#5d7a8c', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                {t('common.cancel')}
              </button>
              <button onClick={handleSave}
                style={{ padding: '9px 20px', borderRadius: 8, background: '#0F3D5E', border: 'none', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(15,61,94,0.3)' }}>
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && editSite && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 600 }}
          onClick={() => setShowPreview(false)}>
          <div style={{ background: 'white', borderRadius: 12, width: '90%', maxWidth: 600, maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding: '14px 20px', background: '#0F3D5E', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>{lang === 'vi' ? 'Xem trước di tích' : 'Heritage Preview'}</span>
              <button onClick={() => setShowPreview(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              {editSite.image && <LazyImage src={getImageUrl(editSite.image)} alt="" style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 8, marginBottom: 12 }} />}
              <h2 style={{ color: '#0F3D5E', fontSize: 18, fontFamily: 'Merriweather, serif', margin: '0 0 4px' }}>{editSite.nameVi}</h2>
              <p style={{ color: '#5d7a8c', fontSize: 12, margin: '0 0 8px' }}>{editSite.nameEn}</p>
              <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                {editSite.type && typeLabels[editSite.type] && <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, background: '#EBF5FB', color: '#0F3D5E' }}>{typeLabels[editSite.type][lang]}</span>}
                <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, background: `${classificationColors[editSite.classification]}15`, color: classificationColors[editSite.classification] }}>{classificationLabels[editSite.classification][lang]}</span>
              </div>
              <p style={{ fontSize: 13, color: '#1a2332', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{editSite.descriptionVi}</p>
              {galleryImages.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0F3D5E', marginBottom: 8 }}>{lang === 'vi' ? 'Thư viện ảnh' : 'Gallery'}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                    {galleryImages.slice(0, 8).map((url, i) => (
                      <LazyImage key={i} src={getImageUrl(url)} alt="" style={{ width: '100%', height: 60, objectFit: 'cover', borderRadius: 4 }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Duplicate confirm */}
      {duplicateId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 600 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: '28px', maxWidth: 360, width: '90%', textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#EAF9F0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#27AE60' }}><Copy size={24} /></div>
            <h3 style={{ color: '#0F3D5E', fontSize: 16, marginBottom: 8 }}>{lang === 'vi' ? 'Nhân bản di tích' : 'Duplicate Heritage'}</h3>
            <p style={{ color: '#5d7a8c', fontSize: 13, marginBottom: 20 }}>{lang === 'vi' ? 'Tạo bản sao của di tích này?' : 'Create a copy of this heritage?'}</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setDuplicateId(null)} disabled={duplicating} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid rgba(15,61,94,0.2)', background: 'white', color: '#5d7a8c', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{t('common.cancel')}</button>
              <button onClick={() => handleDuplicate(duplicateId)} disabled={duplicating} style={{ padding: '9px 20px', borderRadius: 8, background: '#27AE60', border: 'none', color: 'white', fontSize: 13, fontWeight: 600, cursor: duplicating ? 'default' : 'pointer' }}>{t('hm.duplicate')}</button>
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
            <p style={{ color: '#5d7a8c', fontSize: 13, marginBottom: 20 }}>{lang === 'vi' ? 'Bạn có chắc chắn muốn xóa di tích này? Hành động này không thể hoàn tác.' : 'Are you sure you want to delete this heritage site? This action cannot be undone.'}</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setDeleteId(null)} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid rgba(15,61,94,0.2)', background: 'white', color: '#5d7a8c', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{t('common.cancel')}</button>
              <button onClick={() => handleDelete(deleteId)} style={{ padding: '9px 20px', borderRadius: 8, background: '#E74C3C', border: 'none', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{t('hm.delete')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Unsaved changes confirm */}
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

      {/* Media Picker */}
      <MediaPicker
        open={showMediaPicker}
        onClose={() => { setShowMediaPicker(false); setMediaPickerTarget(null); }}
        onSelect={handleMediaSelect}
        onSelectMultiple={handleMediaSelectMultiple}
        multiple={mediaPickerTarget === 'gallery'}
        title={mediaPickerTarget === 'thumbnail'
          ? (lang === 'vi' ? 'Chọn ảnh đại diện' : 'Select Thumbnail')
          : (lang === 'vi' ? 'Chọn ảnh cho thư viện' : 'Select Gallery Images')}
      />
      <style>{`
        @media (max-width: 767px) {
          .hm-filters {
            flex-direction: column !important;
          }
          .hm-filters > div,
          .hm-filters > select,
          .hm-filters > input {
            width: 100% !important;
            min-width: 100% !important;
            max-width: 100% !important;
          }
          .hm-pagination {
            flex-direction: column !important;
            gap: 8px !important;
            align-items: flex-start !important;
          }
          .hm-table-scroll {
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch;
          }
          .hide-pagination-label {
            font-size: 11px !important;
          }
        }
      `}</style>
    </div>
  );
}
