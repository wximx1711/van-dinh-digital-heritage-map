interface InfoCardField {
  label: string;
  value: React.ReactNode;
}

interface InfoCardProps {
  title: string;
  subtitle?: string;
  badges?: React.ReactNode[];
  fields: InfoCardField[];
  accentColor?: string;
}

export function InfoCard({ title, subtitle, badges, fields, accentColor }: InfoCardProps) {
  return (
    <div style={{
      background: 'white', borderRadius: 12, overflow: 'hidden',
      boxShadow: '0 2px 12px rgba(15,61,94,0.08)',
      borderTop: accentColor ? `4px solid ${accentColor}` : 'none',
    }}>
      <div style={{ padding: '20px' }}>
        {badges && badges.length > 0 && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
            {badges.map((badge, i) => (
              <span key={i}>{badge}</span>
            ))}
          </div>
        )}
        <h1 style={{
          color: '#0F3D5E', fontSize: 18, fontFamily: 'Merriweather, serif',
          fontWeight: 700, margin: '0 0 4px',
        }}>
          {title}
        </h1>
        {subtitle && (
          <div style={{ fontSize: 12, color: '#5d7a8c', marginBottom: 12 }}>{subtitle}</div>
        )}
        {fields.map((field) => (
          <div key={field.label} style={{ padding: '8px 0' }}>
            <div style={{
              fontSize: 11, color: '#5d7a8c', marginBottom: 2,
              fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3,
            }}>
              {field.label}
            </div>
            <div style={{ fontSize: 13, color: '#1a2332', fontWeight: 500 }}>
              {field.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
