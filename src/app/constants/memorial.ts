import type { MemorialSiteCategory, MemorialSiteClassification, MemorialSiteStatus } from '../services/memorialSiteService';

export const MEMORIAL_CATEGORIES: readonly MemorialSiteCategory[] = [
  'memorial', 'victory', 'military_camp', 'secret_base', 'battlefield', 'revolutionary_event', 'other',
] as const;

export const MEMORIAL_CLASSIFICATIONS: readonly MemorialSiteClassification[] = [
  'national', 'provincial', 'city', 'unranked',
] as const;

export const MEMORIAL_STATUSES: readonly MemorialSiteStatus[] = [
  'active', 'maintenance', 'closed',
] as const;

export const memorialCategoryIcons: Record<string, string> = {
  memorial: '🕯️',
  victory: '🏆',
  military_camp: '⛺',
  secret_base: '🕵️',
  battlefield: '⚔️',
  revolutionary_event: '🚩',
  other: '📍',
};

export const memorialClassificationColors: Record<string, string> = {
  national: '#E74C3C',
  provincial: '#8E44AD',
  city: '#1A5276',
  unranked: '#7F8C8D',
};

export const memorialClassificationBackgrounds: Record<string, string> = {
  national: '#FDEDEC',
  provincial: '#F4ECF7',
  city: '#EBF5FB',
  unranked: '#F2F3F4',
};

export const memorialStatusColors: Record<string, string> = {
  active: '#27AE60',
  maintenance: '#F39C12',
  closed: '#E74C3C',
};