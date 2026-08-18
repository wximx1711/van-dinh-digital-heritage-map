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
  position: { lat: number; lng: number };
  label?: string;
  type?: HeritageType;
  classification?: Classification;
}

export interface UserInfo {
  userId: number;
  username: string;
  fullName: string | null;
  roleName: string;
}

export interface IntangibleHeritage {
  id: string;
  code?: string;
  nameVi: string;
  nameEn: string;
  category: 'knowledge' | 'festival' | 'belief' | 'craft';
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
  editorName: string;
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

export interface StatisticsOverview {
  totalHeritage: number;
  nationalCount: number;
  cityCount: number;
  unrankedCount: number;
  totalIntangible: number;
  totalImages: number;
  totalVideos: number;
  totalDocuments: number;
  totalEvaluations: number;
  pendingEvaluations: number;
  approvedEvaluations: number;
  rejectedEvaluations: number;
  averageEvaluationScore: number;
  averageSatisfaction: number;
  classificationBreakdown: ClassificationStat[];
  typeBreakdown: TypeStat[];
  statusBreakdown: StatusStat[];
  recentHeritages: RecentHeritageStat[];
}

// ── Evaluations (service satisfaction / heritage rating) ──────────────

export type EvaluationTargetType = 'service' | 'heritage' | 'intangible';
export type EvaluationStatus = 'pending' | 'approved' | 'rejected';
export type SatisfactionLevel = 'very_satisfied' | 'satisfied' | 'neutral' | 'unsatisfied' | 'very_unsatisfied';

export interface EvaluationSubmitPayload {
  targetType: EvaluationTargetType;
  targetId?: string;
  score: number;
  satisfactionLevel?: SatisfactionLevel;
  title?: string;
  comment?: string;
  reviewerName?: string;
  email?: string;
  deviceName?: string;
}

export interface EvaluationTargetStats {
  targetType: string;
  targetId: string;
  totalEvaluations: number;
  averageScore: number;
  ratingDistribution: RatingDistributionItem[];
  monthlyTrend: EvaluationTrendItem[];
  recentComments: EvaluationComment[];
}

export interface RatingDistributionItem {
  score: number;
  count: number;
  percentage: number;
}

export interface EvaluationTrendItem {
  month: string;
  count: number;
  averageScore: number;
}

export interface EvaluationComment {
  id: number;
  score: number;
  title: string | null;
  comment: string | null;
  reviewerName: string | null;
  adminReply: string | null;
  createdAt: string;
}

export interface EvaluationAdminStats {
  totalEvaluations: number;
  averageScore: number;
  satisfactionRate: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  todayCount: number;
}

export interface EvaluationListItem {
  id: number;
  targetType: EvaluationTargetType;
  targetId: string | null;
  heritageNameVi: string | null;
  heritageNameEn: string | null;
  score: number;
  satisfactionLevel: SatisfactionLevel | null;
  title: string | null;
  comment: string | null;
  reviewerName: string | null;
  email: string | null;
  status: EvaluationStatus;
  isApproved: boolean;
  adminReply: string | null;
  createdAt: string;
}

export interface EvaluationDetail {
  id: number;
  targetType: EvaluationTargetType;
  targetId: string | null;
  heritageNameVi: string | null;
  heritageNameEn: string | null;
  score: number;
  satisfactionLevel: SatisfactionLevel | null;
  title: string | null;
  comment: string | null;
  reviewerName: string | null;
  email: string | null;
  status: EvaluationStatus;
  isApproved: boolean;
  adminReply: string | null;
  createdAt: string;
  deviceName: string | null;
}

export interface EvaluationSearchRequest {
  page?: number;
  pageSize?: number;
  search?: string;
  targetType?: string;
  targetId?: string;
  rating?: number;
  satisfactionLevel?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortDirection?: string;
}

export interface EvaluationOverallStats {
  summary: {
    totalEvaluations: number;
    averageScore: number;
    satisfactionRate: number;
    todayCount: number;
    monthCount: number;
  };
  ratingDistribution: RatingDistributionItem[];
  monthlyTrend: EvaluationTrendItem[];
  topHeritages: EvaluationTopItem[];
  lowestHeritages: EvaluationTopItem[];
  topIntangible: EvaluationTopItem[];
  lowestIntangible: EvaluationTopItem[];
}

export interface EvaluationTopItem {
  id: string;
  nameVi: string;
  nameEn: string;
  averageScore: number;
  evaluationCount: number;
}

export interface HeritageEvaluationSummary {
  targetType: EvaluationTargetType;
  targetId: string;
  nameVi: string;
  nameEn: string;
  averageScore: number;
  totalEvaluations: number;
}
