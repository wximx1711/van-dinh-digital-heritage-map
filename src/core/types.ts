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
  lat: number | null;
  lon: number | null;
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

export interface MapMarker {
  id: string;
  position: google.maps.LatLngLiteral;
  label?: string;
  type?: HeritageType;
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
  // Structured sections
  otherNames?: string;
  location?: string;
  culturalSpace?: string;
  community?: string;
  representativePersons?: string;
  origin?: string;
  originEn?: string;
  formationHistory?: string;
  historicalDevelopment?: string;
  worshipObjects?: string;
  festivalTime?: string;
  festivalDuration?: string;
  festivalLocation?: string;
  ritualParticipants?: string;
  ritualProcess?: string;
  customsAndOfferings?: string;
  folkGames?: string;
  traditionalPerformances?: string;
  ritualObjects?: string;
  relatedDocuments?: string;
  relatedDocumentsEn?: string;
  existingArtisans?: string;
  teachingArtisans?: string;
  practitioners?: string;
  learners?: string;
  otherHumanResources?: string;
  transmissionMethod?: string;
  currentStatus?: string;
  currentStatusEn?: string;
  threatLevel?: string;
  riskDescription?: string;
  heritageValue?: string;
  heritageValueEn?: string;
  existingProtectionMeasures?: string;
  proposedProtectionMeasures?: string;
  galleryImages?: string[];
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

export interface AboutPageHistoryItem {
  historyId: number;
  titleVi: string | null;
  titleEn: string | null;
  introductionVi: string | null;
  introductionEn: string | null;
  mainContentVi: string | null;
  mainContentEn: string | null;
  bannerImage: string | null;
  contactInfo: string | null;
  updatedBy: number;
  createdAt: string;
}

export interface AboutPageData {
  aboutId: number;
  titleVi: string;
  titleEn: string;
  introductionVi: string;
  introductionEn: string;
  mainContentVi: string;
  mainContentEn: string;
  bannerImage: string;
  contactInfo: string | null;
  updatedAt: string;
}

export interface MediaFile {
  id: number | null;
  url: string;
  fileName: string;
  fileSize: number;
  mediaType: 'image' | 'video' | 'document';
  uploadedAt: string;
  usageCount: number;
  heritageNames: string[];
}

export interface PagedResult<T> {
  data: T[];
  totalRecords: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface MediaSearchRequest {
  page?: number;
  pageSize?: number;
  search?: string;
  mediaType?: string;
  usageFilter?: string;
  sortBy?: string;
  sortDirection?: string;
}

export interface ClassificationStat {
  classification: string;
  count: number;
}

export interface TypeStat {
  type: string;
  nameVi: string;
  nameEn: string;
  count: number;
}

export interface StatusStat {
  status: string;
  count: number;
}

export interface RecentHeritageStat {
  id: string;
  code: string;
  nameVi: string;
  nameEn: string;
  image: string | null;
  classification: string;
  type: string;
  updatedAt: string;
}

export interface MonthlyUpdateStat {
  updateId: number;
  monthLabel: string;
  displayVi: string;
  displayEn: string;
  updateCount: number;
}

export interface StatisticsOverview {
  totalHeritage: number;
  nationalCount: number;
  cityCount: number;
  unrankedCount: number;
  totalIntangible: number;
  totalImages: number;
  totalVideos: number;
  totalDocuments: number;
  classificationBreakdown: ClassificationStat[];
  typeBreakdown: TypeStat[];
  statusBreakdown: StatusStat[];
  monthlyUpdates: MonthlyUpdateStat[];
  recentHeritages: RecentHeritageStat[];
}
