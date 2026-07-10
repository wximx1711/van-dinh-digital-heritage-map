import { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from './LanguageContext';
import { apiGet, apiPost, apiDelete } from '../services/api';
import type { MediaFile, PagedResult, MediaSearchRequest } from '../../core/types';
import { getImageUrl } from '../utils/url';
import {
  Image as ImageIcon, Video, FileText, Trash2, X, Check, AlertTriangle,
  Upload, Search, RefreshCw, Download, Maximize2, ChevronLeft, ChevronRight,
  SlidersHorizontal
} from 'lucide-react';

type MediaTypeFilter = '' | 'image' | 'video' | 'document';
type UsageFilter = '' | 'used' | 'unused';
type SortField = 'uploadedAt' | 'fileName';
type SortDir = 'desc' | 'asc';

interface HeritageGroup {
  name: string;
  items: MediaFile[];
}

export function MediaManagement() {
  const { lang, t } = useLanguage();
  const [result, setResult] = useState<PagedResult<MediaFile> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [mediaType, setMediaType] = useState<MediaTypeFilter>('');
  const [usageFilter, setUsageFilter] = useState<UsageFilter>('');
  const [sortBy, setSortBy] = useState<SortField>('uploadedAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteFile, setDeleteFile] = useState<MediaFile | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const params: MediaSearchRequest = {
        page,
        pageSize,
        search: debouncedSearch || undefined,
        mediaType: mediaType || undefined,
        usageFilter: usageFilter || undefined,
        sortBy,
        sortDirection: sortDir,
      };
      const query = Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== '')
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join('&');
      const data = await apiGet<PagedResult<MediaFile>>(`/uploads/search?${query}`);
      setResult(data);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch, mediaType, usageFilter, sortBy, sortDir]);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [mediaType, usageFilter, sortBy, sortDir]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const allowedExtensions: Record<string, string[]> = {
    images: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.heic', '.heif'],
    videos: ['.mp4', '.webm', '.mov'],
    documents: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'],
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    const folder = mediaType || 'images';
    let tab = folder === 'video' ? 'videos' : folder === 'document' ? 'documents' : 'images';
    // When "All" filter is active, derive tab from the actual file extension
    if (mediaType === '') {
      if (allowedExtensions.videos.includes(ext)) {
        tab = 'videos';
      } else if (allowedExtensions.documents.includes(ext)) {
        tab = 'documents';
      }
    }

    // DEBUG: frontend pre-upload diagnostics
    console.log('--- FRONTEND UPLOAD DEBUG ---');
    console.log('file.name:', file.name);
    console.log('file.type:', file.type);
    console.log('extension:', ext);
    console.log('mediaType:', mediaType);
    console.log('folder:', folder);
    console.log('tab:', tab);
    console.log('allowedExtensions[tab]:', allowedExtensions[tab]);
    console.log('endpoint URL:', `/uploads/${tab}`);

    const validationPasses = allowedExtensions[tab]?.includes(ext) ?? false;
    console.log('validation passes:', validationPasses);

    if (!validationPasses) {
      showToast(lang === 'vi' ? 'Định dạng file không được hỗ trợ' : 'File type not supported', 'error');
      return;
    }
    const maxSize = tab === 'videos' ? 100 * 1024 * 1024 : tab === 'documents' ? 30 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast(lang === 'vi' ? `File quá lớn. Tối đa ${maxSize / 1024 / 1024}MB` : `File too large. Max ${maxSize / 1024 / 1024}MB`, 'error');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('--- FRONTEND: starting fetch ---');
      const endpointUrl = `/uploads/${tab}`;
      console.log('fetching URL:', `/api${endpointUrl}`);
      const response = await fetch(`/api${endpointUrl}`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      console.log('--- NETWORK DEBUG ---');
      console.log('Request URL:', `/api${endpointUrl}`);
      console.log('Status Code:', response.status);
      const responseText = await response.text();
      console.log('Response Body:', responseText);
      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}: ${responseText}`);
      }
      const json = JSON.parse(responseText);
      if (!json.success) {
        throw new Error(json.message || 'Upload failed');
      }
      showToast(lang === 'vi' ? 'Tải lên thành công' : 'Upload successful');
      fetchFiles();
    } catch (err) {
      console.error('--- FRONTEND CATCH ---', err);
      showToast(lang === 'vi' ? 'Tải lên thất bại' : 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (file: MediaFile) => {
    if (file.id === null) return;
    setDeleting(true);
    const folder = file.mediaType === 'image' ? 'images' : file.mediaType === 'video' ? 'videos' : 'documents';
    const deleteUrl = `/uploads/${folder}/${file.id}`;
    try {
      await apiDelete(deleteUrl);
      showToast(lang === 'vi' ? 'Đã xóa file' : 'File deleted');
      setDeleteFile(null);
      fetchFiles();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast(msg || (lang === 'vi' ? 'Xóa thất bại' : 'Delete failed'), 'error');
      setDeleteFile(null);
    } finally {
      setDeleting(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const handleImgError = (url: string) => {
    setBrokenImages(prev => new Set(prev).add(url));
  };

  const toggleSortDir = () => {
    setSortDir(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  const getSortLabel = () => {
    if (sortBy === 'uploadedAt') return sortDir === 'desc'
      ? (lang === 'vi' ? 'Mới nhất' : 'Newest')
      : (lang === 'vi' ? 'Cũ nhất' : 'Oldest');
    return sortDir === 'asc'
      ? (lang === 'vi' ? 'A-Z' : 'A-Z')
      : (lang === 'vi' ? 'Z-A' : 'Z-A');
  };

  const totalPages = result?.totalPages ?? 0;
  const startItem = result && result.totalRecords > 0 ? (page - 1) * pageSize + 1 : 0;
  const endItem = result ? Math.min(page * pageSize, result.totalRecords) : 0;

  // Group items by heritage
  const groups = (() => {
    if (!result?.data) return { groups: [] as HeritageGroup[], unused: [] as MediaFile[] };
    const groupMap = new Map<string, MediaFile[]>();
    const unused: MediaFile[] = [];

    for (const item of result.data) {
      if (item.heritageNames && item.heritageNames.length > 0) {
        for (const name of item.heritageNames) {
          if (!groupMap.has(name)) groupMap.set(name, []);
          groupMap.get(name)!.push(item);
        }
      } else {
        unused.push(item);
      }
    }

    // Deduplicate items within each group (same file can have same heritage name from multiple refs)
    for (const [, items] of groupMap) {
      const seen = new Set<number>();
      for (let i = items.length - 1; i >= 0; i--) {
        if (seen.has(items[i].id!)) {
          items.splice(i, 1);
        }
        seen.add(items[i].id!);
      }
    }

    return {
      groups: Array.from(groupMap.entries()).sort(([a], [b]) => a.localeCompare(b)),
      unused,
    };
  })();

  const renderMediaCard = (file: MediaFile) => (
    <div
      key={file.id ?? file.url}
      style={{
        background: '#F8FAFC', borderRadius: 8, overflow: 'hidden',
        border: '1px solid rgba(15,61,94,0.08)',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Thumbnail */}
      {file.mediaType === 'image' && (
        <div
          onClick={() => setPreviewUrl(file.url)}
          style={{ height: 140, overflow: 'hidden', background: '#dce8f0', position: 'relative', cursor: 'pointer' }}
        >
          {brokenImages.has(file.url) ? (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#5d7a8c', gap: 4 }}>
              <ImageIcon size={24} style={{ opacity: 0.4 }} />
              <span style={{ fontSize: 10, opacity: 0.5 }}>{lang === 'vi' ? 'Lỗi tải' : 'Load error'}</span>
            </div>
          ) : (
            <img
              src={getImageUrl(file.url)}
              alt={file.fileName}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={() => handleImgError(file.url)}
            />
          )}
          <div style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: 4, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <Maximize2 size={11} />
          </div>
        </div>
      )}
      {file.mediaType === 'video' && (
        <div style={{ height: 120, background: '#071520', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Video size={36} style={{ color: 'rgba(255,255,255,0.4)' }} />
        </div>
      )}
      {file.mediaType === 'document' && (
        <div style={{ height: 60, display: 'flex', alignItems: 'center', gap: 10, padding: '12px' }}>
          <FileText size={28} style={{ color: '#E74C3C', flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#0F3D5E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.fileName}</div>
            <div style={{ fontSize: 10, color: '#5d7a8c' }}>{formatSize(file.fileSize)}</div>
          </div>
        </div>
      )}

      {/* Info */}
      <div style={{ padding: '8px 10px', borderTop: '1px solid rgba(15,61,94,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <span style={{ fontSize: 10, color: '#5d7a8c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', flex: 1 }}>
            {file.fileName}
          </span>
        </div>
        <div style={{ fontSize: 9, color: '#8ba0b0', marginBottom: 4 }}>
          {formatDate(file.uploadedAt)} &middot; {formatSize(file.fileSize)}
        </div>
        {(file.usageCount ?? 0) > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{
              display: 'inline-block', fontSize: 9, fontWeight: 700,
              color: '#D4A017', background: '#FEF9E7',
              padding: '1px 6px', borderRadius: 4,
            }}>
              {lang === 'vi' ? `${file.usageCount} hồ sơ` : `${file.usageCount} heritage`}
            </span>
          </div>
        )}
        {file.heritageNames && file.heritageNames.length > 0 && (
          <div style={{ fontSize: 9, color: '#0F3D5E', lineHeight: 1.4 }}>
            {file.heritageNames.slice(0, 2).join(', ')}
            {file.heritageNames.length > 2 && <span style={{ color: '#8ba0b0' }}> +{file.heritageNames.length - 2}</span>}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ padding: '6px 10px', borderTop: '1px solid rgba(15,61,94,0.06)', display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
        <a href={getImageUrl(file.url)} target="_blank" rel="noreferrer" style={{
          width: 26, height: 26, borderRadius: 4, border: '1px solid rgba(15,61,94,0.15)',
          background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F3D5E', textDecoration: 'none',
        }}><Download size={11} /></a>
        {(file.usageCount ?? 0) === 0 && (
          <button
            onClick={() => file.id !== null && setDeleteFile(file)}
            disabled={deleting || file.id === null}
            title={file.id === null ? (lang === 'vi' ? 'Không thể xóa file không có trong cơ sở dữ liệu' : 'Cannot delete file not in database') : ''}
            style={{
              width: 26, height: 26, borderRadius: 4,
              border: file.id === null ? '1px solid rgba(15,61,94,0.1)' : '1px solid rgba(231,76,60,0.2)',
              background: deleting || file.id === null ? '#F0F4F8' : '#FDEDEC',
              cursor: deleting || file.id === null ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: file.id === null ? '#ccc' : (deleting ? '#5d7a8c' : '#E74C3C'),
            }}><Trash2 size={11} /></button>
        )}
      </div>
    </div>
  );

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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ color: '#0F3D5E', margin: 0, fontSize: 20, fontFamily: 'Merriweather, serif' }}>{t('admin.media')}</h1>
          <p style={{ color: '#5d7a8c', fontSize: 12, margin: '4px 0 0' }}>
            {lang === 'vi' ? 'Quản lý tập trung các file phương tiện' : 'Centralized media file management'}
          </p>
        </div>
      </div>

      <div style={{
        background: 'white', borderRadius: 10, overflow: 'hidden',
        boxShadow: '0 1px 6px rgba(15,61,94,0.06)',
      }}>
        {/* Search bar */}
        <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(15,61,94,0.06)' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#5d7a8c' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={lang === 'vi' ? 'Tìm kiếm theo tên file, hồ sơ di sản...' : 'Search by file name, heritage...'}
              style={{
                width: '100%', padding: '8px 8px 8px 32px', borderRadius: 6,
                border: '1px solid rgba(15,61,94,0.15)', fontSize: 12,
                background: '#F0F4F8', outline: 'none', boxSizing: 'border-box',
              }} />
          </div>
          <label style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 6,
            background: '#0F3D5E', color: 'white', fontSize: 12, fontWeight: 600,
            cursor: uploading ? 'wait' : 'pointer', opacity: uploading ? 0.7 : 1, whiteSpace: 'nowrap',
          }}>
            <Upload size={14} />
            {uploading ? (lang === 'vi' ? 'Đang tải...' : 'Uploading...') : (lang === 'vi' ? 'Tải lên' : 'Upload')}
            <input type="file"
              accept={mediaType === ''
                ? ([] as string[]).concat(allowedExtensions.images, allowedExtensions.videos, allowedExtensions.documents).join(',')
                : allowedExtensions[mediaType === 'image' ? 'images' : mediaType === 'video' ? 'videos' : 'documents'].join(',')}
              style={{ display: 'none' }} onChange={handleUpload} disabled={uploading} />
          </label>
          <button onClick={fetchFiles} style={{
            padding: '8px', borderRadius: 6, border: '1px solid rgba(15,61,94,0.15)',
            background: 'white', cursor: 'pointer', display: 'flex', color: '#5d7a8c',
          }}><RefreshCw size={14} /></button>
        </div>

        {/* Filters */}
        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', borderBottom: '1px solid rgba(15,61,94,0.06)' }}>
          {/* Media type filter */}
          <div style={{ display: 'flex', gap: 4 }}>
            {([
              { key: '' as const, label: lang === 'vi' ? 'Tất cả' : 'All', icon: <SlidersHorizontal size={12} /> },
              { key: 'image' as const, label: lang === 'vi' ? 'Hình ảnh' : 'Images', icon: <ImageIcon size={12} /> },
              { key: 'video' as const, label: lang === 'vi' ? 'Video' : 'Videos', icon: <Video size={12} /> },
              { key: 'document' as const, label: lang === 'vi' ? 'Tài liệu' : 'Documents', icon: <FileText size={12} /> },
            ] as const).map(opt => (
              <button key={opt.key} onClick={() => setMediaType(opt.key)}
                style={{
                  padding: '5px 10px', borderRadius: 6, border: '1px solid rgba(15,61,94,0.12)',
                  background: mediaType === opt.key ? '#0F3D5E' : 'white',
                  color: mediaType === opt.key ? 'white' : '#5d7a8c',
                  fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap',
                }}>
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>

          <div style={{ width: 1, height: 24, background: 'rgba(15,61,94,0.1)' }} />

          {/* Usage filter */}
          <div style={{ display: 'flex', gap: 4 }}>
            {([
              { key: '' as const, label: lang === 'vi' ? 'Tất cả' : 'All Media' },
              { key: 'used' as const, label: lang === 'vi' ? 'Đã dùng' : 'Used' },
              { key: 'unused' as const, label: lang === 'vi' ? 'Chưa dùng' : 'Unused' },
            ] as const).map(opt => (
              <button key={opt.key} onClick={() => setUsageFilter(opt.key)}
                style={{
                  padding: '5px 10px', borderRadius: 6, border: '1px solid rgba(15,61,94,0.12)',
                  background: usageFilter === opt.key ? '#D4A017' : 'white',
                  color: usageFilter === opt.key ? 'white' : '#5d7a8c',
                  fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                }}>
                {opt.label}
              </button>
            ))}
          </div>

          <div style={{ flex: 1 }} />

          {/* Sort */}
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#5d7a8c', fontWeight: 500 }}>
              {lang === 'vi' ? 'Sắp xếp:' : 'Sort:'}
            </span>
            <select value={`${sortBy}-${sortDir}`} onChange={e => {
              const [newSortBy, newSortDir] = e.target.value.split('-') as [SortField, SortDir];
              setSortBy(newSortBy);
              setSortDir(newSortDir);
            }} style={{
              padding: '5px 8px', borderRadius: 6, border: '1px solid rgba(15,61,94,0.15)',
              fontSize: 11, fontWeight: 600, color: '#0F3D5E', background: '#F0F4F8',
              outline: 'none', cursor: 'pointer',
            }}>
              <option value="uploadedAt-desc">{lang === 'vi' ? 'Mới nhất' : 'Newest'}</option>
              <option value="uploadedAt-asc">{lang === 'vi' ? 'Cũ nhất' : 'Oldest'}</option>
              <option value="fileName-asc">File Name (A-Z)</option>
              <option value="fileName-desc">File Name (Z-A)</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '16px', minHeight: 200 }}>
          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#5d7a8c', fontSize: 13 }}>{t('common.loading')}</div>
          ) : !result || result.data.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#5d7a8c', fontSize: 13 }}>
              {mediaType === '' ? <SlidersHorizontal size={32} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.4 }} /> :
               mediaType === 'image' ? <ImageIcon size={32} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.4 }} /> :
               mediaType === 'video' ? <Video size={32} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.4 }} /> :
               <FileText size={32} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.4 }} />}
              {lang === 'vi' ? 'Không tìm thấy file nào' : 'No media files found'}
            </div>
          ) : (
            <>
              {/* Heritage Grouped Display */}
              {groups.groups.map(([heritageName, items]) => (
                <div key={heritageName} style={{ marginBottom: 24 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 700, color: '#0F3D5E',
                    fontFamily: 'Merriweather, serif',
                    paddingBottom: 8, marginBottom: 12,
                    borderBottom: '2px solid rgba(212,160,23,0.3)',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <div style={{ width: 4, height: 16, borderRadius: 2, background: '#D4A017' }} />
                    {heritageName}
                    <span style={{ fontSize: 10, color: '#8ba0b0', fontWeight: 400 }}>
                      ({items.length} {lang === 'vi' ? 'file' : 'file(s)'})
                    </span>
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(auto-fill, minmax(180px, 1fr))`,
                    gap: 12,
                  }}>
                    {items.map(file => renderMediaCard(file))}
                  </div>
                </div>
              ))}

              {/* Unused Media */}
              {groups.unused.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 700, color: '#5d7a8c',
                    fontFamily: 'Merriweather, serif',
                    paddingBottom: 8, marginBottom: 12,
                    borderBottom: '2px dashed rgba(93,122,140,0.3)',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <div style={{ width: 4, height: 16, borderRadius: 2, background: '#8ba0b0' }} />
                    {lang === 'vi' ? 'Phương tiện chưa dùng' : 'Unused Media'}
                    <span style={{ fontSize: 10, color: '#8ba0b0', fontWeight: 400 }}>
                      ({groups.unused.length} {lang === 'vi' ? 'file' : 'file(s)'})
                    </span>
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(auto-fill, minmax(180px, 1fr))`,
                    gap: 12,
                  }}>
                    {groups.unused.map(file => renderMediaCard(file))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Pagination */}
        {result && result.totalRecords > pageSize && (
          <div style={{
            padding: '12px 16px', borderTop: '1px solid rgba(15,61,94,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 11, color: '#5d7a8c' }}>
              {lang === 'vi'
                ? `Hiển thị ${startItem}-${endItem} của ${result.totalRecords} mục`
                : `Showing ${startItem}-${endItem} of ${result.totalRecords} items`}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                style={{
                  padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(15,61,94,0.12)',
                  background: page <= 1 ? '#F0F4F8' : 'white',
                  color: page <= 1 ? '#ccc' : '#0F3D5E',
                  cursor: page <= 1 ? 'not-allowed' : 'pointer', fontSize: 11,
                  display: 'flex', alignItems: 'center', gap: 2,
                }}>
                <ChevronLeft size={12} /> {lang === 'vi' ? 'Trước' : 'Prev'}
              </button>

              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <button key={pageNum} onClick={() => setPage(pageNum)}
                    style={{
                      width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(15,61,94,0.12)',
                      background: page === pageNum ? '#0F3D5E' : 'white',
                      color: page === pageNum ? 'white' : '#5d7a8c',
                      cursor: 'pointer', fontSize: 11, fontWeight: page === pageNum ? 700 : 400,
                    }}>
                    {pageNum}
                  </button>
                );
              })}

              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                style={{
                  padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(15,61,94,0.12)',
                  background: page >= totalPages ? '#F0F4F8' : 'white',
                  color: page >= totalPages ? '#ccc' : '#0F3D5E',
                  cursor: page >= totalPages ? 'not-allowed' : 'pointer', fontSize: 11,
                  display: 'flex', alignItems: 'center', gap: 2,
                }}>
                {lang === 'vi' ? 'Sau' : 'Next'} <ChevronRight size={12} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Preview modal */}
      {previewUrl && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 700 }}
          onClick={() => setPreviewUrl(null)}>
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setPreviewUrl(null)} style={{
              position: 'absolute', top: -40, right: 0, background: 'none', border: 'none', color: 'white', cursor: 'pointer',
            }}><X size={24} /></button>
            <img src={getImageUrl(previewUrl)} alt="" style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: 8, objectFit: 'contain' }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteFile && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 600 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: '28px', maxWidth: 360, width: '90%', textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#FDEDEC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#E74C3C' }}>
              <Trash2 size={24} />
            </div>
            <h3 style={{ color: '#0F3D5E', fontSize: 16, marginBottom: 8 }}>{lang === 'vi' ? 'Xác nhận xóa' : 'Confirm Delete'}</h3>
            <p style={{ color: '#5d7a8c', fontSize: 13, marginBottom: 20 }}>
              {lang === 'vi' ? 'File này sẽ bị xóa vĩnh viễn.' : 'This file will be permanently deleted.'}
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setDeleteFile(null)} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid rgba(15,61,94,0.2)', background: 'white', color: '#5d7a8c', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                {t('common.cancel')}</button>
              <button onClick={() => handleDelete(deleteFile)} disabled={deleting} style={{ padding: '9px 20px', borderRadius: 8, background: deleting ? '#F0F4F8' : '#E74C3C', border: 'none', color: deleting ? '#5d7a8c' : 'white', fontSize: 13, fontWeight: 600, cursor: deleting ? 'not-allowed' : 'pointer' }}>
                {deleting ? (lang === 'vi' ? 'Đang xóa...' : 'Deleting...') : t('hm.delete')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
