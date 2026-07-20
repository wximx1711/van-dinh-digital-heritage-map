import type { HeritageType } from '../core/types';

export const intangibleCategoryIcons = {
  knowledge: '📖',
  festival: '🎭',
  belief: '🙏',
  craft: '🧵',
};

export const classificationColors = {
  national: '#E74C3C',
  city: '#1A5276',
  unranked: '#7F8C8D',
};

export const classificationBackgrounds = {
  national: '#FDEDEC',
  city: '#EBF5FB',
  unranked: '#F2F3F4',
};

export const statusColors = {
  active: '#27AE60',
  maintenance: '#F39C12',
  closed: '#E74C3C',
};

export const HERITAGE_TYPES: readonly HeritageType[] = ['dinh', 'chua', 'den', 'mieu', 'phu', 'quan', 'nhacu', 'nhatho', 'lang'] as const;

export const heritageMarkerColors: Record<HeritageType, string> = {
  dinh: '#8E44AD',
  chua: '#E67E22',
  den: '#C0392B',
  mieu: '#16A085',
  phu: '#2C3E50',
  quan: '#D35400',
  nhacu: '#2980B9',
  nhatho: '#27AE60',
  lang: '#7F8C8D',
};