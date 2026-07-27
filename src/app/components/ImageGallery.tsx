import { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { LazyImage } from './LazyImage';
import { getImageUrl } from '../utils/url';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  alt: string;
}

export function ImageGallery({ images, alt }: ImageGalleryProps) {
  const { lang, t } = useLanguage();
  const [active, setActive] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  if (!images || images.length === 0) return null;

  const showNav = images.length > 1;

  const prev = () => setActive(i => (i - 1 + images.length) % images.length);
  const next = () => setActive(i => (i + 1) % images.length);

  return (
    <>
      <div style={{
        background: 'white', borderRadius: 12, overflow: 'hidden', marginBottom: 20,
        boxShadow: '0 2px 12px rgba(15,61,94,0.08)',
      }}>
        <div className="gallery-main-image" style={{
          position: 'relative', height: 400, background: '#dce8f0',
          display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
        }}>
          <LazyImage
            src={getImageUrl(images[active])}
            alt={alt}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            onError={e => {
              const el = e.currentTarget;
              el.style.display = 'none';
              el.parentElement!.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#5d7a8c;font-size:14px">${lang === 'vi' ? 'Không thể tải ảnh' : 'Cannot load image'}</div>`;
            }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,61,94,0.4), transparent 50%)' }} />

          {showNav && (
            <>
              <button onClick={prev}
                style={{
                  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                  width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.5)',
                  border: 'none', color: 'white', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                <ChevronLeft size={18} />
              </button>
              <button onClick={next}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.5)',
                  border: 'none', color: 'white', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                <ChevronRight size={18} />
              </button>
            </>
          )}

          <div style={{
            position: 'absolute', bottom: 16, right: 16,
            background: 'rgba(0,0,0,0.6)', borderRadius: 12,
            padding: '3px 10px', color: 'white', fontSize: 12,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span>{active + 1} / {images.length}</span>
            <button onClick={() => setFullscreen(true)}
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0, display: 'flex' }}>
              <Expand size={14} />
            </button>
          </div>
        </div>

        {showNav && (
          <div className="gallery-thumbnails" style={{ display: 'flex', gap: 8, padding: '12px', overflowX: 'auto' }}>
            {images.map((img, i) => (
              <div key={i} onClick={() => setActive(i)}
                className="gallery-thumb"
                style={{
                  width: 72, height: 52, borderRadius: 6, overflow: 'hidden',
                  cursor: 'pointer', flexShrink: 0,
                  border: i === active ? '2px solid #D4A017' : '2px solid transparent',
                }}>
                <LazyImage src={getImageUrl(img)} alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            ))}
          </div>
        )}
      </div>

      {fullscreen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 2000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={() => setFullscreen(false)}>
          <button onClick={() => setFullscreen(false)}
            style={{
              position: 'absolute', top: 16, right: 16, width: 40, height: 40,
              borderRadius: '50%', background: 'rgba(255,255,255,0.1)',
              border: 'none', color: 'white', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
            <X size={20} />
          </button>
          {showNav && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prev(); }}
                style={{
                  position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)',
                  width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.1)',
                  border: 'none', color: 'white', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                <ChevronLeft size={24} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); next(); }}
                style={{
                  position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)',
                  width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.1)',
                  border: 'none', color: 'white', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                <ChevronRight size={24} />
              </button>
            </>
          )}
          <div onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LazyImage src={getImageUrl(images[active])} alt={alt}
              style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain' }} />
          </div>
          <div style={{
            position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.6)', borderRadius: 12, padding: '6px 14px', color: 'white', fontSize: 14,
          }}>
            {active + 1} / {images.length}
          </div>
        </div>
      )}
      <style>{`
        @media (max-width: 767px) {
          .gallery-main-image { height: 240px !important; }
          .gallery-thumbnails { gap: 6px !important; padding: 8px !important; }
          .gallery-thumb { width: 56px !important; height: 44px !important; }
        }
        @media (min-width: 768px) and (max-width: 1024px) {
          .gallery-main-image { height: 320px !important; }
        }
      `}</style>
    </>
  );
}
