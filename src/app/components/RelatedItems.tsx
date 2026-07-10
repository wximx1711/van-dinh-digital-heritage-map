import type { Lang } from './LanguageContext';
import { getImageUrl } from '../utils/url';

interface RelatedItem {
  id: string;
  nameVi: string;
  nameEn: string;
  image: string;
  subtitle?: string;
}

interface RelatedItemsProps {
  title: string;
  items: RelatedItem[];
  onItemClick: (id: string) => void;
  lang: Lang;
}

export function RelatedItems({ title, items, onItemClick, lang }: RelatedItemsProps) {
  if (!items || items.length === 0) return null;

  return (
    <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(15,61,94,0.08)' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(15,61,94,0.08)' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#0F3D5E' }}>{title}</span>
      </div>
      <div style={{ padding: '12px' }}>
        {items.map(rs => (
          <div key={rs.id} onClick={() => onItemClick(rs.id)}
            style={{
              display: 'flex', gap: 10, padding: '8px', borderRadius: 8,
              cursor: 'pointer', transition: 'background 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#F0F4F8'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}>
            <img src={getImageUrl(rs.image)} alt=""
              style={{ width: 52, height: 40, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#0F3D5E', lineHeight: 1.3 }}>
                {lang === 'en' ? (rs.nameEn || rs.nameVi) : rs.nameVi}
              </div>
              {rs.subtitle && (
                <div style={{ fontSize: 11, color: '#5d7a8c' }}>{rs.subtitle}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
