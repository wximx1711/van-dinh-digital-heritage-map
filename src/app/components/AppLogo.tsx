import { APP_LOGO_URL } from '../constants/logo';

interface AppLogoProps {
  size?: number;
  containerStyle?: React.CSSProperties;
  imgStyle?: React.CSSProperties;
  alt?: string;
}

export function AppLogo({ size = 40, containerStyle, imgStyle, alt = '' }: AppLogoProps) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 8, overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      ...containerStyle,
    }}>
      <img
        src={APP_LOGO_URL}
        alt={alt}
        style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 8, ...imgStyle }}
      />
    </div>
  );
}