import { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { useHeritageSites } from '../../presentation/hooks/useHeritageData';
import { apiPost } from '../services/api';
import {
  QrCode, Download, RefreshCw, Search, Check, AlertTriangle, Eye, X
} from 'lucide-react';
import { Skeleton } from './Skeleton';

export function QrManagement() {
  const { lang, t } = useLanguage();
  const { data: heritageSites } = useHeritageSites();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [qrSvg, setQrSvg] = useState<string>('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewModal, setPreviewModal] = useState(false);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = heritageSites.filter(s =>
    !search || s.nameVi.toLowerCase().includes(search.toLowerCase()) || s.nameEn.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase())
  );

  const fetchQr = async (id: string) => {
    setLoading(true);
    setSelectedId(id);
    try {
      const response = await fetch(`/api/qr/heritage/${encodeURIComponent(id)}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed');
      const svg = await response.text();
      setQrSvg(svg);
    } catch {
      showToast(lang === 'vi' ? 'Không thể tạo QR code' : 'Failed to generate QR code', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!selectedId) return;
    await fetchQr(selectedId);
    if (!toast) showToast(lang === 'vi' ? 'Đã tạo lại QR code' : 'QR code regenerated');
  };

  const handleDownload = () => {
    if (!qrSvg) return;
    const blob = new Blob([qrSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-${selectedId}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(lang === 'vi' ? 'Đã tải xuống QR code' : 'QR code downloaded');
  };

  const site = heritageSites.find(s => s.id === selectedId);

  useEffect(() => {
    if (heritageSites.length > 0 && !selectedId) {
      fetchQr(heritageSites[0].id);
    }
  }, [heritageSites]);

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
        {lang === 'vi' ? 'Quản lý QR Code' : 'QR Code Management'}
      </h1>
      <p style={{ color: '#5d7a8c', fontSize: 12, margin: '0 0 20px' }}>
        {lang === 'vi' ? 'Tạo, tải xuống và xem trước mã QR cho từng di tích' : 'Generate, download and preview QR codes for each heritage site'}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>
        {/* Sidebar - site list */}
        <div style={{ background: 'white', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 6px rgba(15,61,94,0.06)' }}>
          <div style={{ padding: '12px', borderBottom: '1px solid rgba(15,61,94,0.08)' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#5d7a8c' }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder={t('hm.search')}
                style={{
                  width: '100%', padding: '7px 7px 7px 32px', borderRadius: 6,
                  border: '1px solid rgba(15,61,94,0.15)', fontSize: 12,
                  background: '#F0F4F8', outline: 'none', boxSizing: 'border-box',
                }} />
            </div>
          </div>
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {filtered.map(s => (
              <div key={s.id} onClick={() => fetchQr(s.id)}
                style={{
                  padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid rgba(15,61,94,0.04)',
                  background: selectedId === s.id ? '#EBF5FB' : 'white',
                  borderLeft: selectedId === s.id ? '3px solid #D4A017' : '3px solid transparent',
                }}
                onMouseEnter={e => { if (selectedId !== s.id) (e.currentTarget as HTMLDivElement).style.background = '#F0F4F8'; }}
                onMouseLeave={e => { if (selectedId !== s.id) (e.currentTarget as HTMLDivElement).style.background = 'white'; }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0F3D5E' }}>{lang === 'vi' ? s.nameVi : s.nameEn}</div>
                <div style={{ fontSize: 10, color: '#5d7a8c', marginTop: 2 }}>{s.code}</div>
              </div>
            ))}
          </div>
        </div>

        {/* QR preview */}
        <div style={{ background: 'white', borderRadius: 10, padding: '24px', boxShadow: '0 1px 6px rgba(15,61,94,0.06)' }}>
          {loading ? (
            <div style={{ padding: '24px' }}>
              <Skeleton width="60%" height={20} borderRadius={4} style={{ marginBottom: 16 }} />
              <Skeleton height={260} borderRadius={8} />
            </div>
          ) : selectedId && site ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <h2 style={{ color: '#0F3D5E', fontSize: 16, fontFamily: 'Merriweather, serif', margin: '0 0 4px' }}>
                  {lang === 'vi' ? site.nameVi : site.nameEn}
                </h2>
                <p style={{ color: '#5d7a8c', fontSize: 12, margin: 0 }}>{site.code}</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                <div style={{
                  width: 220, height: 220, borderRadius: 12, overflow: 'hidden',
                  border: '2px solid #0F3D5E', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'white',
                }}>
                  {qrSvg ? (
                    <div dangerouslySetInnerHTML={{ __html: qrSvg }} style={{ width: 200, height: 200 }} />
                  ) : (
                    <QrCode size={64} style={{ color: '#cbced4' }} />
                  )}
                </div>
              </div>

              <p style={{ textAlign: 'center', color: '#5d7a8c', fontSize: 11, marginBottom: 20 }}>
                {lang === 'vi' ? 'Quét mã QR để xem chi tiết di tích' : 'Scan QR code to view heritage details'}
              </p>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button onClick={handleRegenerate} disabled={loading}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '9px 18px', borderRadius: 6,
                    background: '#0F3D5E', border: 'none', color: 'white',
                    fontSize: 12, fontWeight: 600, cursor: loading ? 'wait' : 'pointer',
                  }}>
                  <RefreshCw size={14} /> {lang === 'vi' ? 'Tạo lại' : 'Regenerate'}
                </button>
                <button onClick={() => setPreviewModal(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '9px 18px', borderRadius: 6,
                    border: '1px solid rgba(15,61,94,0.2)', background: 'white',
                    color: '#0F3D5E', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}>
                  <Eye size={14} /> {lang === 'vi' ? 'Xem trước' : 'Preview'}
                </button>
                <button onClick={handleDownload} disabled={!qrSvg}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '9px 18px', borderRadius: 6,
                    border: '1px solid #D4A017', background: 'rgba(212,160,23,0.05)',
                    color: '#B8860B', fontSize: 12, fontWeight: 600, cursor: !qrSvg ? 'not-allowed' : 'pointer',
                  }}>
                  <Download size={14} /> {lang === 'vi' ? 'Tải xuống' : 'Download'}
                </button>
              </div>

              <div style={{ marginTop: 20, padding: '14px', background: '#F0F4F8', borderRadius: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                  {lang === 'vi' ? 'Thông tin QR' : 'QR Info'}
                </div>
                <div style={{ fontSize: 11, color: '#5d7a8c', lineHeight: 1.6 }}>
                  <div><strong>{lang === 'vi' ? 'Mã di tích:' : 'Heritage ID:'}</strong> {site.id}</div>
                  <div><strong>URL:</strong> /Heritage/Details/{site.id}</div>
                  <div><strong>{lang === 'vi' ? 'Kích thước:' : 'Size:'}</strong> 200x200 SVG</div>
                </div>
              </div>
            </>
          ) : (
            <div style={{ padding: '48px', textAlign: 'center', color: '#5d7a8c', fontSize: 13 }}>
              <QrCode size={48} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
              {lang === 'vi' ? 'Chọn một di tích từ danh sách' : 'Select a heritage site from the list'}
            </div>
          )}
        </div>
      </div>

      {previewModal && qrSvg && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setPreviewModal(false)}>
          <div style={{ background: 'white', borderRadius: 12, padding: 28, maxWidth: 340, width: '90%', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ color: '#0F3D5E', margin: 0, fontSize: 15 }}>{lang === 'vi' ? 'Xem trước QR' : 'QR Preview'}</h3>
              <button onClick={() => setPreviewModal(false)} style={{ background: 'none', border: 'none', color: '#5d7a8c', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: 240, height: 240 }} dangerouslySetInnerHTML={{ __html: qrSvg }} />
            </div>
            <p style={{ color: '#5d7a8c', fontSize: 11, margin: '12px 0 0' }}>
              {site && (lang === 'vi' ? site.nameVi : site.nameEn)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
