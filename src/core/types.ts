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
  googleMapUrl: string;
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

export interface UserInfo {
  userId: number;
  username: string;
  fullName: string | null;
  roleName: string;
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
  createdAt?: string;
  updatedAt?: string;
}

export interface HeritageCategory {
  categoryId: number;
  code: string;
  nameVi: string;
  nameEn: string;
  iconUrl: string;
}

export interface MonthlyUpdate {
  updateId: number;
  monthLabel: string;
  displayVi: string;
  displayEn: string;
  updateCount: number;
}

export interface AboutPageData {
  aboutId: number;
  title: string;
  content: string;
  bannerImage: string;
  updatedAt: string;
}

export interface AboutContent {
  introductionVi: string;
  introductionEn: string;
  historyVi: string;
  historyEn: string;
  contactVi: string;
  contactEn: string;
}

export interface MediaFile {
  url: string;
  fileName: string;
  size: number;
  type: 'image' | 'video' | 'document';
  uploadedAt: string;
}
