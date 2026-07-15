import { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { LazyImage } from './LazyImage';
import { QrCode, Share2, Download } from 'lucide-react';

interface ShareSectionProps {
  qrImageUrl: string;
  title: string;
  shareUrl: string;
}

export function ShareSection({ qrImageUrl, title, shareUrl }: ShareSectionProps) {
  const { lang, t } = useLanguage();
  const [showQr, setShowQr] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div style={{ background: 'white', borderRadius: 12, padding: '16px', boxShadow: '0 2px 12px rgba(15,61,94,0.08)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={() => setShowQr(true)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '10px', borderRadius: 8, border: '1px solid #D4A017',
              background: 'rgba(212,160,23,0.05)',
              color: '#B8860B', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>
            <QrCode size={14} /> {t('detail.share_qr')}
          </button>
          <button onClick={handleCopyLink}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '10px', borderRadius: 8,
              border: '1px solid rgba(15,61,94,0.2)', background: 'white',
              color: '#0F3D5E', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>
            <Share2 size={14} /> {copied
              ? (lang === 'vi' ? 'Đã sao chép!' : 'Copied!')
              : (lang === 'vi' ? 'Sao chép liên kết' : 'Copy Link')}
          </button>
        </div>
      </div>

      {showQr && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setShowQr(false)}>
          <div style={{ background: 'white', borderRadius: 12, padding: 28, maxWidth: 340, width: '90%', textAlign: 'center' }}
            onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#0F3D5E', marginBottom: 4 }}>{t('detail.share_qr')}</h3>
            <p style={{ color: '#5d7a8c', fontSize: 12, marginBottom: 16 }}>{title}</p>
            <div style={{
              width: 200, height: 200, margin: '0 auto 16px', background: 'white',
              border: '2px solid #0F3D5E', borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
            }}>
              <LazyImage src={qrImageUrl} alt="QR Code"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                onError={(e) => {
                  const el = e.currentTarget;
                  el.style.display = 'none';
                  el.parentElement!.innerHTML = `<div style="font-size:11px;color:#5d7a8c;padding:16px">${lang === 'vi' ? 'Không thể tạo QR' : 'QR generation failed'}</div>`;
                }} />
            </div>
            <div style={{ fontSize: 11, color: '#5d7a8c', marginBottom: 16 }}>
              {lang === 'vi' ? 'Quét mã để xem chi tiết' : 'Scan to view details'}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button onClick={() => setShowQr(false)}
                style={{ padding: '8px 20px', borderRadius: 6, background: '#0F3D5E', border: 'none', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                {t('common.close')}
              </button>
              <a href={qrImageUrl} download={`qr-${title.replace(/\s+/g, '-')}.svg`}
                style={{
                  padding: '8px 16px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 6,
                  border: '1px solid #0F3D5E', background: 'white', color: '#0F3D5E',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', textDecoration: 'none',
                }}>
                <Download size={14} /> {lang === 'vi' ? 'Tải xuống' : 'Download'}
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
