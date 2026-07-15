import { useState } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

export function LazyImage({ src, alt, style, onLoad, onError, ...rest }: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onLoad={(e) => { setLoaded(true); onLoad?.(e); }}
      onError={(e) => { setLoaded(true); onError?.(e); }}
      style={{
        background: loaded ? undefined : '#dce8f0',
        ...(style as React.CSSProperties),
      }}
      {...rest}
    />
  );
}
