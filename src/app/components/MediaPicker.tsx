import { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { apiGet } from '../services/api';
import { getImageUrl } from '../utils/url';
import { X, Image as ImageIcon, Check, Upload } from 'lucide-react';
import { MediaGridSkeleton } from './Skeleton';

interface MediaFile {
  url: string;
  fileName: string;
  size: number;
}

interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  onSelectMultiple?: (urls: string[]) => void;
  multiple?: boolean;
  title?: string;
}

export function MediaPicker({ open, onClose, onSelect, onSelectMultiple, multiple, title }: MediaPickerProps) {
  const { lang, t } = useLanguage();
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const result = await apiGet<MediaFile[]>('/uploads/list?folder=images');
      setFiles(Array.isArray(result) ? result : []);
    } catch {
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setSelected(new Set());
      setSearch('');
      fetchFiles();
    }
  }, [open]);

  const filtered = files.filter(f =>
    !search || f.fileName.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (url: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(url)) {
        next.delete(url);
      } else {
        if (!multiple) {
          onSelect(url);
          onClose();
          return next;
        }
        next.add(url);
      }
      return next;
    });
  };

  const handleConfirm = () => {
    if (multiple && onSelectMultiple) {
      onSelectMultiple(Array.from(selected));
    }
    onClose();
  };

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 900,
    }} onClick={onClose}>
      <div style={{
        background: 'white', borderRadius: 12, width: '90%', maxWidth: 640, maxHeight: '85vh',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '14px 20px', background: '#0F3D5E', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>
            {title || (lang === 'vi' ? 'Chọn ảnh từ thư viện' : 'Select from Media Library')}
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(15,61,94,0.06)' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={lang === 'vi' ? 'Tìm kiếm ảnh...' : 'Search images...'}
            style={{
              width: '100%', padding: '8px 12px', borderRadius: 6,
              border: '1px solid rgba(15,61,94,0.15)', fontSize: 12,
              background: '#F0F4F8', outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {loading ? (
            <MediaGridSkeleton />
          ) : filtered.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#5d7a8c', fontSize: 13 }}>
              <ImageIcon size={32} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.4 }} />
              {lang === 'vi' ? 'Không có ảnh nào trong thư viện' : 'No images in library'}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
              {filtered.map((file, i) => {
                const isSelected = selected.has(file.url);
                return (
                  <div
                    key={i}
                    onClick={() => toggleSelect(file.url)}
                    style={{
                      borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
                      border: isSelected ? '3px solid #27AE60' : '2px solid transparent',
                      position: 'relative', aspectRatio: '4/3',
                      background: '#dce8f0', transition: 'border-color 0.15s',
                    }}
                  >
                    <img
                      src={getImageUrl(file.url)}
                      alt={file.fileName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                        (e.currentTarget as HTMLImageElement).parentElement!.innerHTML =
                          `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#5d7a8c;font-size:10px">${lang === 'vi' ? 'Lỗi' : 'Error'}</div>`;
                      }}
                    />
                    {isSelected && (
                      <div style={{
                        position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%',
                        background: '#27AE60', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white',
                      }}>
                        <Check size={13} />
                      </div>
                    )}
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
                      padding: '16px 6px 4px', fontSize: 9, color: 'white', whiteSpace: 'nowrap',
                      overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {file.fileName}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(15,61,94,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
          <span style={{ fontSize: 12, color: '#5d7a8c' }}>
            {selected.size > 0
              ? (lang === 'vi' ? `Đã chọn ${selected.size} ảnh` : `${selected.size} image(s) selected`)
              : (lang === 'vi' ? 'Chưa chọn ảnh nào' : 'No image selected')}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onClose} style={{
              padding: '8px 16px', borderRadius: 6, border: '1px solid rgba(15,61,94,0.2)',
              background: 'white', color: '#5d7a8c', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>
              {t('common.cancel')}
            </button>
            {multiple && (
              <button onClick={handleConfirm} disabled={selected.size === 0} style={{
                padding: '8px 16px', borderRadius: 6,
                background: selected.size === 0 ? '#5d7a8c' : '#0F3D5E', border: 'none',
                color: 'white', fontSize: 12, fontWeight: 600, cursor: selected.size === 0 ? 'default' : 'pointer',
              }}>
                {lang === 'vi' ? 'Chọn' : 'Select'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
