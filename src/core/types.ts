export type Classification = 'national' | 'city' | 'unranked';
export type HeritageType = 'dinh' | 'chua' | 'den' | 'mieu' | 'phu' | 'quan' | 'nhacu' | 'nhatho' | 'lang';
export type HeritageStatus = 'active' | 'maintenance' | 'closed';

export interface HeritageSite {
  id: string;
  code: string;
  nameVi: string;
  nameEn: string;
  type: HeritageType;
  classification: Classification;
  status: HeritageStatus;
  addressVi: string;
  addressEn: string;
  lat: number;
  lon: number;
  descriptionVi: string;
  descriptionEn: string;
  historyVi: string;
  historyEn: string;
  image: string;
  images: string[];
  updatedAt: string;
  yearBuilt: string;
  guardian: string;
}

export interface IntangibleHeritage {
  id: string;
  nameVi: string;
  nameEn: string;
  category: 'festival' | 'performance' | 'craft' | 'ritual' | 'story';
  descriptionVi: string;
  descriptionEn: string;
  image: string;
  videoUrl?: string;
}
