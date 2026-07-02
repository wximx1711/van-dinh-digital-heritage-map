import { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { apiGet, apiPost, apiDelete } from '../services/api';
import type { MediaFile } from '../../core/types';
import { getImageUrl } from '../utils/url';
import {
  Image as ImageIcon, Video, FileText, Trash2, X, Check, AlertTriangle,
  Upload, Search, RefreshCw, Download, Maximize2
} from 'lucide-react';

export function MediaManagement() {
  const { lang, t } = useLanguage();
  const [tab, setTab] = useState<'images' | 'videos' | 'documents'>('images');
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleteUrl, setDeleteUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const result = await apiGet<MediaFile[]>(`/uploads/list?folder=${tab}`);
      setFiles(Array.isArray(result) ? result : []);
    } catch {
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFiles(); }, [tab]);

  const filtered = files.filter(f =>
    !search || f.fileName.toLowerCase().includes(search.toLowerCase()) || f.url.toLowerCase().includes(search.toLowerCase())
  );

  const allowedExtensions: Record<string, string[]> = {
    images: ['.jpg', '.jpeg', '.png', '.webp'],
    videos: ['.mp4', '.webm', '.ogg'],
    documents: ['.pdf'],
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions[tab].includes(ext)) {
      showToast(lang === 'vi' ? 'Định dạng file không được hỗ trợ' : 'File type not supported', 'error');
      return;
    }
    const maxSize = tab === 'videos' ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast(lang === 'vi' ? `File quá lớn. Tối đa ${maxSize / 1024 / 1024}MB` : `File too large. Max ${maxSize / 1024 / 1024}MB`, 'error');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await apiPost<{ url: string; fileName: string; size: number }>(`/uploads/${tab}`, formData, true);
      showToast(lang === 'vi' ? 'Tải lên thành công' : 'Upload successful');
      fetchFiles();
    } catch {
      showToast(lang === 'vi' ? 'Tải lên thất bại' : 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (url: string) => {
    try {
      await apiDelete(url);
      showToast(lang === 'vi' ? 'Đã xóa file' : 'File deleted');
      setDeleteUrl(null);
      fetchFiles();
    } catch {
      showToast(lang === 'vi' ? 'Xóa thất bại' : 'Delete failed', 'error');
      setDeleteUrl(null);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleImgError = (url: string) => {
    setBrokenImages(prev => new Set(prev).add(url));
  };

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
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(15,61,94,0.1)' }}>
          {[
            { key: 'images' as const, label: lang === 'vi' ? 'Hình ảnh' : 'Images', icon: <ImageIcon size={14} /> },
            { key: 'videos' as const, label: lang === 'vi' ? 'Video' : 'Videos', icon: <Video size={14} /> },
            { key: 'documents' as const, label: lang === 'vi' ? 'Tài liệu' : 'Documents', icon: <FileText size={14} /> },
          ].map(tabItem => (
            <button key={tabItem.key} onClick={() => { setTab(tabItem.key); setSearch(''); }}
              style={{
                flex: 1, padding: '14px 8px', border: 'none', cursor: 'pointer',
                background: tab === tabItem.key ? '#EBF5FB' : 'white',
                color: tab === tabItem.key ? '#0F3D5E' : '#5d7a8c',
                fontSize: 12, fontWeight: tab === tabItem.key ? 700 : 500,
                borderBottom: tab === tabItem.key ? '2px solid #D4A017' : '2px solid transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
              {tabItem.icon} {tabItem.label}
            </button>
          ))}
        </div>

        <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(15,61,94,0.06)' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#5d7a8c' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={lang === 'vi' ? 'Tìm kiếm file...' : 'Search files...'}
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
            <input type="file" accept={allowedExtensions[tab].join(',')} style={{ display: 'none' }} onChange={handleUpload} disabled={uploading} />
          </label>
          <button onClick={fetchFiles} style={{
            padding: '8px', borderRadius: 6, border: '1px solid rgba(15,61,94,0.15)',
            background: 'white', cursor: 'pointer', display: 'flex', color: '#5d7a8c',
          }}><RefreshCw size={14} /></button>
        </div>

        <div style={{ padding: '16px', minHeight: 200 }}>
          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#5d7a8c', fontSize: 13 }}>{t('common.loading')}</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#5d7a8c', fontSize: 13 }}>
              {tab === 'images' ? <ImageIcon size={32} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.4 }} /> :
               tab === 'videos' ? <Video size={32} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.4 }} /> :
               <FileText size={32} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.4 }} />}
              {lang === 'vi' ? 'Không có file nào' : 'No files found'}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${tab === 'documents' ? '280px' : '180px'}, 1fr))`, gap: 12 }}>
              {filtered.map((file, i) => (
                <div key={i} style={{
                  background: '#F8FAFC', borderRadius: 8, overflow: 'hidden',
                  border: '1px solid rgba(15,61,94,0.08)',
                  display: 'flex', flexDirection: 'column',
                }}>
                  {tab === 'images' && (
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
                  {tab === 'videos' && (
                    <div style={{ height: 120, background: '#071520', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Video size={36} style={{ color: 'rgba(255,255,255,0.4)' }} />
                    </div>
                  )}
                  {tab === 'documents' && (
                    <div style={{ height: 60, display: 'flex', alignItems: 'center', gap: 10, padding: '12px' }}>
                      <FileText size={28} style={{ color: '#E74C3C', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#0F3D5E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.fileName}</div>
                        <div style={{ fontSize: 10, color: '#5d7a8c' }}>{formatSize(file.size)}</div>
                      </div>
                    </div>
                  )}
                  <div style={{ padding: '8px 10px', borderTop: '1px solid rgba(15,61,94,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 10, color: '#5d7a8c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                      {tab !== 'documents' ? file.fileName : ''} {tab !== 'documents' && formatSize(file.size)}
                    </span>
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      <a href={getImageUrl(file.url)} target="_blank" rel="noreferrer" style={{
                        width: 26, height: 26, borderRadius: 4, border: '1px solid rgba(15,61,94,0.15)',
                        background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F3D5E', textDecoration: 'none',
                      }}><Download size={11} /></a>
                      <button onClick={() => setDeleteUrl(file.url)} style={{
                        width: 26, height: 26, borderRadius: 4, border: '1px solid rgba(231,76,60,0.2)',
                        background: '#FDEDEC', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E74C3C',
                      }}><Trash2 size={11} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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

      {deleteUrl && (
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
              <button onClick={() => setDeleteUrl(null)} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid rgba(15,61,94,0.2)', background: 'white', color: '#5d7a8c', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                {t('common.cancel')}</button>
              <button onClick={() => handleDelete(deleteUrl)} style={{ padding: '9px 20px', borderRadius: 8, background: '#E74C3C', border: 'none', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                {t('hm.delete')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}