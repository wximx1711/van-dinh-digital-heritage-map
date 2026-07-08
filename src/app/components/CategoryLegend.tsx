import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from './LanguageContext';
import { heritageMarkerColors, HERITAGE_TYPES } from '../constants';
import { typeLabels } from '../../data/labels';

export function CategoryLegend() {
  const { lang } = useLanguage();
  const [expanded, setExpanded] = useState(() => !window.matchMedia('(max-width: 768px)').matches);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      setExpanded(!e.matches);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggle = useCallback(() => setExpanded((c) => !c), []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    },
    [toggle],
  );

  const buttonLabel = lang === 'vi' ? 'Chú giải' : 'Legend';

  if (!expanded) {
    return (
      <button
        onClick={toggle}
        onKeyDown={handleKeyDown}
        aria-label={buttonLabel}
        title={buttonLabel}
        style={{
          pointerEvents: 'auto',
          padding: '8px 12px',
          borderRadius: 8,
          background: 'rgba(255,255,255,0.95)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          border: 'none',
          cursor: 'pointer',
          fontSize: 12,
          fontWeight: 700,
          color: '#0F3D5E',
          fontFamily: 'inherit',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #8E44AD, #E67E22, #C0392B, #16A085, #2C3E50, #D35400, #2980B9, #27AE60, #7F8C8D)',
            flexShrink: 0,
          }}
        />
        {buttonLabel}
      </button>
    );
  }

  return (
    <div
      role="region"
      aria-label={buttonLabel}
      style={{
        pointerEvents: 'none',
        background: 'rgba(255,255,255,0.95)',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        fontSize: 11,
        maxWidth: 180,
      }}
    >
      <button
        onClick={toggle}
        onKeyDown={handleKeyDown}
        aria-expanded={expanded}
        aria-label={buttonLabel}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          width: '100%',
          padding: '8px 12px',
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          fontSize: 11,
          fontWeight: 700,
          color: '#0F3D5E',
          fontFamily: 'inherit',
          pointerEvents: 'auto',
        }}
      >
        <span>{buttonLabel}</span>
        <span
          style={{
            marginLeft: 'auto',
            transition: 'transform 0.2s',
            fontSize: 8,
          }}
        >
          ▼
        </span>
      </button>
      <div
        style={{
          padding: '0 12px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: 5,
          pointerEvents: 'auto',
        }}
      >
        {HERITAGE_TYPES.map((type) => {
          const color = heritageMarkerColors[type];
          const label = typeLabels[type]?.[lang] ?? type;
          return (
            <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: color,
                  flexShrink: 0,
                  border: '1px solid rgba(255,255,255,0.8)',
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
                }}
              />
              <span style={{ color: '#1a2332', lineHeight: 1.3 }}>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
