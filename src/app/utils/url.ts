const DEV_API_BASE = 'http://localhost:5109';

export function getImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) {
    if (import.meta.env.DEV) {
      return `${DEV_API_BASE}${url}`;
    }
    return url;
  }
  return url;
}

export function getLogoUrl(logoUrl: string | null | undefined, updatedAt?: string): string {
  const base = getImageUrl(logoUrl);
  if (!base) return '';
  if (updatedAt) {
    const sep = base.includes('?') ? '&' : '?';
    return `${base}${sep}v=${new Date(updatedAt).getTime()}`;
  }
  return base;
}

export function handleImgError(e: React.SyntheticEvent<HTMLImageElement>): void {
  const img = e.currentTarget;
  img.style.display = 'none';
}