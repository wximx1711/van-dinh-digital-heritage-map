import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
}

export function Skeleton({ width, height, borderRadius, style }: SkeletonProps) {
  return (
    <div
      style={{
        width: width ?? '100%',
        height: height ?? 16,
        borderRadius: borderRadius ?? 4,
        background: 'linear-gradient(90deg, #e8ecf0 25%, #f0f4f8 50%, #e8ecf0 75%)',
        backgroundSize: '200% 100%',
        animation: 'sk-shimmer 1.5s ease-in-out infinite',
        ...style,
      }}
    />
  );
}

/** Skeleton matching admin table layout: header row + paginated body rows */
export function AdminTableSkeleton({ rowCount = 6, columnCount = 7 }: { rowCount?: number; columnCount?: number }) {
  return (
    <div style={{ background: 'white', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 6px rgba(15,61,94,0.06)' }}>
      <div style={{ display: 'flex', gap: 12, padding: '12px 14px', background: '#0F3D5E' }}>
        {Array.from({ length: columnCount }).map((_, i) => (
          <Skeleton key={i} height={11} borderRadius={2} style={{ flex: 1, background: 'rgba(255,255,255,0.15)', animation: 'sk-shimmer 1.5s ease-in-out infinite', backgroundSize: '200% 100%' }} />
        ))}
      </div>
      {Array.from({ length: rowCount }).map((_, r) => (
        <div key={r} style={{ display: 'flex', gap: 12, padding: '11px 14px', borderBottom: r < rowCount - 1 ? '1px solid rgba(15,61,94,0.06)' : undefined }}>
          {Array.from({ length: columnCount }).map((_, c) => (
            <Skeleton key={c} height={14} borderRadius={3} style={{ flex: 1 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Skeleton matching detail page layout: image hero + two-column content + sidebar */
export function DetailPageSkeleton() {
  return (
    <div style={{ background: '#F0F4F8', minHeight: '100vh' }}>
      <div style={{ background: '#0F3D5E', padding: '12px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <Skeleton width={120} height={14} borderRadius={3} style={{ background: 'rgba(255,255,255,0.2)', backgroundSize: '200% 100%', animation: 'sk-shimmer 1.5s ease-in-out infinite' }} />
        </div>
      </div>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px' }}>
        <div className="heritage-detail-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: 24 }}>
          <div style={{ minWidth: 0 }}>
            <Skeleton height={380} borderRadius={10} />
            <div style={{ marginTop: 16 }}>
              <Skeleton width="60%" height={24} borderRadius={4} style={{ marginBottom: 12 }} />
              <Skeleton height={14} borderRadius={3} style={{ marginBottom: 8 }} />
              <Skeleton height={14} borderRadius={3} style={{ marginBottom: 8 }} />
              <Skeleton height={14} borderRadius={3} style={{ marginBottom: 8 }} />
              <Skeleton width="75%" height={14} borderRadius={3} style={{ marginBottom: 24 }} />
              <Skeleton height={14} borderRadius={3} style={{ marginBottom: 8 }} />
              <Skeleton height={14} borderRadius={3} style={{ marginBottom: 8 }} />
              <Skeleton width="60%" height={14} borderRadius={3} />
            </div>
          </div>
          <div>
            <div style={{ background: 'white', borderRadius: 10, padding: 16, boxShadow: '0 1px 6px rgba(15,61,94,0.06)' }}>
              <Skeleton height={16} borderRadius={3} style={{ marginBottom: 12 }} />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} height={13} borderRadius={3} style={{ marginBottom: 10 }} />
              ))}
            </div>
            <div style={{ background: 'white', borderRadius: 10, padding: 16, marginTop: 16, boxShadow: '0 1px 6px rgba(15,61,94,0.06)' }}>
              <Skeleton height={16} borderRadius={3} style={{ marginBottom: 12 }} />
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} height={13} borderRadius={3} style={{ marginBottom: 10 }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Skeleton matching the statistics dashboard layout */
export function StatsSkeleton() {
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ background: 'white', borderRadius: 10, padding: 16, boxShadow: '0 1px 6px rgba(15,61,94,0.06)' }}>
            <Skeleton height={12} borderRadius={3} style={{ marginBottom: 8 }} />
            <Skeleton width="60%" height={28} borderRadius={4} />
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: 'white', borderRadius: 10, padding: 20, boxShadow: '0 1px 6px rgba(15,61,94,0.06)' }}>
          <Skeleton width="40%" height={16} borderRadius={3} style={{ marginBottom: 16 }} />
          <Skeleton height={220} borderRadius={8} />
        </div>
        <div style={{ background: 'white', borderRadius: 10, padding: 20, boxShadow: '0 1px 6px rgba(15,61,94,0.06)' }}>
          <Skeleton width="40%" height={16} borderRadius={3} style={{ marginBottom: 16 }} />
          <Skeleton height={220} borderRadius={8} />
        </div>
      </div>
    </div>
  );
}

/** Skeleton matching a form-based admin page (settings, about, etc.) */
export function FormSkeleton() {
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ background: 'white', borderRadius: 10, padding: 24, boxShadow: '0 1px 6px rgba(15,61,94,0.06)' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ marginBottom: 20 }}>
            <Skeleton width="30%" height={12} borderRadius={3} style={{ marginBottom: 6 }} />
            <Skeleton height={36} borderRadius={6} />
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 24 }}>
          <Skeleton width={80} height={34} borderRadius={6} />
          <Skeleton width={100} height={34} borderRadius={6} />
        </div>
      </div>
    </div>
  );
}

/** Skeleton matching a media grid layout */
export function MediaGridSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton key={i} height={100} borderRadius={8} />
      ))}
    </div>
  );
}
