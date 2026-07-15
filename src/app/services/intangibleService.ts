import { apiGet, apiPost, apiPut, apiDelete } from './api';
import { getCache, setCache, clearCache, dedupeFetch } from './cache';
import type { IntangibleHeritage } from '../../core/types';

const CACHE_KEY_INTANGIBLE = 'intangibleHeritage';

interface IntangibleHeritageDto {
  id: string;
  nameVi: string;
  nameEn: string;
  category: string;
  descriptionVi: string | null;
  descriptionEn: string | null;
  image: string | null;
  videoUrl: string | null;
  createdAt?: string;
  updatedAt?: string;
  otherNames?: string | null;
  location?: string | null;
  culturalSpace?: string | null;
  community?: string | null;
  representativePersons?: string | null;
  origin?: string | null;
  originEn?: string | null;
  formationHistory?: string | null;
  historicalDevelopment?: string | null;
  worshipObjects?: string | null;
  festivalTime?: string | null;
  festivalDuration?: string | null;
  festivalLocation?: string | null;
  ritualParticipants?: string | null;
  ritualProcess?: string | null;
  customsAndOfferings?: string | null;
  folkGames?: string | null;
  traditionalPerformances?: string | null;
  ritualObjects?: string | null;
  relatedDocuments?: string | null;
  relatedDocumentsEn?: string | null;
  existingArtisans?: string | null;
  teachingArtisans?: string | null;
  practitioners?: string | null;
  learners?: string | null;
  otherHumanResources?: string | null;
  transmissionMethod?: string | null;
  currentStatus?: string | null;
  currentStatusEn?: string | null;
  threatLevel?: string | null;
  riskDescription?: string | null;
  heritageValue?: string | null;
  heritageValueEn?: string | null;
  existingProtectionMeasures?: string | null;
  proposedProtectionMeasures?: string | null;
  galleryImages?: string[] | null;
}

interface IntangibleSearchResult {
  data: IntangibleHeritageDto[];
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

function toIntangibleHeritage(dto: IntangibleHeritageDto): IntangibleHeritage {
  return {
    id: dto.id,
    nameVi: dto.nameVi,
    nameEn: dto.nameEn,
    category: dto.category as IntangibleHeritage['category'],
    descriptionVi: dto.descriptionVi ?? '',
    descriptionEn: dto.descriptionEn ?? '',
    image: dto.image ?? '',
    videoUrl: dto.videoUrl ?? undefined,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    otherNames: dto.otherNames ?? undefined,
    location: dto.location ?? undefined,
    culturalSpace: dto.culturalSpace ?? undefined,
    community: dto.community ?? undefined,
    representativePersons: dto.representativePersons ?? undefined,
    origin: dto.origin ?? undefined,
    originEn: dto.originEn ?? undefined,
    formationHistory: dto.formationHistory ?? undefined,
    historicalDevelopment: dto.historicalDevelopment ?? undefined,
    worshipObjects: dto.worshipObjects ?? undefined,
    festivalTime: dto.festivalTime ?? undefined,
    festivalDuration: dto.festivalDuration ?? undefined,
    festivalLocation: dto.festivalLocation ?? undefined,
    ritualParticipants: dto.ritualParticipants ?? undefined,
    ritualProcess: dto.ritualProcess ?? undefined,
    customsAndOfferings: dto.customsAndOfferings ?? undefined,
    folkGames: dto.folkGames ?? undefined,
    traditionalPerformances: dto.traditionalPerformances ?? undefined,
    ritualObjects: dto.ritualObjects ?? undefined,
    relatedDocuments: dto.relatedDocuments ?? undefined,
    relatedDocumentsEn: dto.relatedDocumentsEn ?? undefined,
    existingArtisans: dto.existingArtisans ?? undefined,
    teachingArtisans: dto.teachingArtisans ?? undefined,
    practitioners: dto.practitioners ?? undefined,
    learners: dto.learners ?? undefined,
    otherHumanResources: dto.otherHumanResources ?? undefined,
    transmissionMethod: dto.transmissionMethod ?? undefined,
    currentStatus: dto.currentStatus ?? undefined,
    currentStatusEn: dto.currentStatusEn ?? undefined,
    threatLevel: dto.threatLevel ?? undefined,
    riskDescription: dto.riskDescription ?? undefined,
    heritageValue: dto.heritageValue ?? undefined,
    heritageValueEn: dto.heritageValueEn ?? undefined,
    existingProtectionMeasures: dto.existingProtectionMeasures ?? undefined,
    proposedProtectionMeasures: dto.proposedProtectionMeasures ?? undefined,
    galleryImages: dto.galleryImages ?? undefined,
  };
}

export async function fetchIntangibleHeritageList(q?: string, category?: string, page = 1, pageSize = 20): Promise<IntangibleSearchResult> {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (category) params.set('category', category);
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));
  const result = await apiGet<IntangibleSearchResult>(`/intangible-heritage?${params.toString()}`);
  return {
    ...result,
    data: result.data.map(toIntangibleHeritage),
  };
}

export async function fetchIntangibleHeritage(): Promise<IntangibleHeritage[]> {
  const cached = getCache<IntangibleHeritage[]>(CACHE_KEY_INTANGIBLE);
  if (cached) return cached;

  return dedupeFetch(CACHE_KEY_INTANGIBLE, async () => {
    const result = await apiGet<IntangibleSearchResult>('/intangible-heritage?pageSize=100');
    const items = result.data.map(toIntangibleHeritage);
    setCache(CACHE_KEY_INTANGIBLE, items);
    return items;
  });
}

export async function createIntangibleHeritage(data: Record<string, unknown>): Promise<IntangibleHeritage> {
  const dto = await apiPost<IntangibleHeritageDto>('/intangible-heritage', data);
  clearCache(CACHE_KEY_INTANGIBLE);
  return toIntangibleHeritage(dto);
}

export async function updateIntangibleHeritage(id: string, data: Record<string, unknown>): Promise<IntangibleHeritage> {
  const dto = await apiPut<IntangibleHeritageDto>(`/intangible-heritage/${encodeURIComponent(id)}`, data);
  clearCache(CACHE_KEY_INTANGIBLE);
  return toIntangibleHeritage(dto);
}

export async function fetchIntangibleHeritageById(id: string): Promise<IntangibleHeritage> {
  const dto = await apiGet<IntangibleHeritageDto>(`/intangible-heritage/${encodeURIComponent(id)}`);
  return toIntangibleHeritage(dto);
}

export async function deleteIntangibleHeritage(id: string): Promise<void> {
  await apiDelete(`/intangible-heritage/${encodeURIComponent(id)}`);
  clearCache(CACHE_KEY_INTANGIBLE);
}
