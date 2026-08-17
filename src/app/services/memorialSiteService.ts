import { apiGet, apiPost, apiPut, apiDelete } from './api';

export type MemorialSiteCategory = 'memorial' | 'victory' | 'military_camp' | 'secret_base' | 'battlefield' | 'revolutionary_event' | 'other';
export type MemorialSiteClassification = 'national' | 'provincial' | 'city' | 'unranked';
export type MemorialSiteStatus = 'active' | 'maintenance' | 'closed';

export interface MemorialSite {
  id: string;
  code: string;
  nameVi: string;
  nameEn: string;
  category: MemorialSiteCategory;
  classification: MemorialSiteClassification;
  status: MemorialSiteStatus;
  otherNames?: string;
  addressVi?: string;
  addressEn?: string;
  lat?: number | null;
  lon?: number | null;
  googleMapUrl?: string;
  descriptionVi?: string;
  descriptionEn?: string;
  historyVi?: string;
  historyEn?: string;
  eventDate?: string;
  commemorationVi?: string;
  commemorationEn?: string;
  image: string;
  videoUrl?: string;
  galleryImages?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface MemorialSiteDto {
  id: string;
  code: string;
  nameVi: string;
  nameEn: string;
  category: string;
  classification: string;
  status: string;
  otherNames: string | null;
  addressVi: string | null;
  addressEn: string | null;
  lat: number | null;
  lon: number | null;
  googleMapUrl: string | null;
  descriptionVi: string | null;
  descriptionEn: string | null;
  historyVi: string | null;
  historyEn: string | null;
  eventDate: string | null;
  commemorationVi: string | null;
  commemorationEn: string | null;
  image: string | null;
  videoUrl: string | null;
  galleryImages: string[] | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface MemorialSiteSearchResult {
  data: MemorialSite[];
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

function toMemorialSite(dto: MemorialSiteDto): MemorialSite {
  return {
    id: dto.id,
    code: dto.code,
    nameVi: dto.nameVi,
    nameEn: dto.nameEn,
    category: dto.category as MemorialSite['category'],
    classification: dto.classification as MemorialSite['classification'],
    status: dto.status as MemorialSite['status'],
    otherNames: dto.otherNames ?? undefined,
    addressVi: dto.addressVi ?? undefined,
    addressEn: dto.addressEn ?? undefined,
    lat: dto.lat ?? null,
    lon: dto.lon ?? null,
    googleMapUrl: dto.googleMapUrl ?? undefined,
    descriptionVi: dto.descriptionVi ?? undefined,
    descriptionEn: dto.descriptionEn ?? undefined,
    historyVi: dto.historyVi ?? undefined,
    historyEn: dto.historyEn ?? undefined,
    eventDate: dto.eventDate ?? undefined,
    commemorationVi: dto.commemorationVi ?? undefined,
    commemorationEn: dto.commemorationEn ?? undefined,
    image: dto.image ?? '',
    videoUrl: dto.videoUrl ?? undefined,
    galleryImages: dto.galleryImages ?? undefined,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt ?? undefined,
  };
}

export async function fetchMemorialSites(
  q?: string,
  category?: string,
  classification?: string,
  status?: string,
  page = 1,
  pageSize = 12,
): Promise<MemorialSiteSearchResult> {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (category) params.set('category', category);
  if (classification) params.set('classification', classification);
  if (status) params.set('status', status);
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));
  const result = await apiGet<MemorialSiteSearchResult>(`/memorial-sites?${params.toString()}`);
  return {
    ...result,
    data: result.data.map(toMemorialSite),
  };
}

export async function fetchMemorialSiteById(id: string): Promise<MemorialSite> {
  const dto = await apiGet<MemorialSiteDto>(`/memorial-sites/${encodeURIComponent(id)}`);
  return toMemorialSite(dto);
}

export async function createMemorialSite(data: Record<string, unknown>): Promise<MemorialSite> {
  const dto = await apiPost<MemorialSiteDto>('/memorial-sites', data);
  return toMemorialSite(dto);
}

export async function updateMemorialSite(id: string, data: Record<string, unknown>): Promise<MemorialSite> {
  const dto = await apiPut<MemorialSiteDto>(`/memorial-sites/${encodeURIComponent(id)}`, data);
  return toMemorialSite(dto);
}

export async function deleteMemorialSite(id: string): Promise<void> {
  await apiDelete(`/memorial-sites/${encodeURIComponent(id)}`);
}