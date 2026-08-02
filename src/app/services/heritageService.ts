import { apiGet, apiPost, apiPut, apiDelete } from './api';
import { getCache, setCache, clearCache, dedupeFetch } from './cache';
import type { HeritageSite } from '../../core/types';

const CACHE_KEY_HERITAGE_SITES = 'heritageSites';

interface HeritageDto {
  id: string;
  code: string;
  nameVi: string;
  nameEn: string;
  type: string;
  classification: string;
  status: string;
  addressVi: string | null;
  addressEn: string | null;
  lat: number | null;
  lon: number | null;
  descriptionVi: string | null;
  descriptionEn: string | null;
  historyVi: string | null;
  historyEn: string | null;
  image: string | null;
  images: string[];
  updatedAt: string;
  yearBuilt: string | null;
  guardian: string | null;
  qrCodeUrl?: string | null;
  googleMapUrl?: string | null;
}

interface HeritageSearchResult {
  data: HeritageDto[];
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

function toHeritageSite(dto: HeritageDto): HeritageSite {
  return {
    id: dto.id,
    code: dto.code,
    nameVi: dto.nameVi,
    nameEn: dto.nameEn,
    type: dto.type as HeritageSite['type'],
    classification: dto.classification as HeritageSite['classification'],
    status: dto.status as HeritageSite['status'],
    addressVi: dto.addressVi ?? '',
    addressEn: dto.addressEn ?? '',
    lat: dto.lat ?? null,
    lon: dto.lon ?? null,
    googleMapUrl: dto.googleMapUrl ?? '',
    descriptionVi: dto.descriptionVi ?? '',
    descriptionEn: dto.descriptionEn ?? '',
    historyVi: dto.historyVi ?? '',
    historyEn: dto.historyEn ?? '',
    image: dto.image ?? '',
    images: dto.images,
    updatedAt: dto.updatedAt,
    yearBuilt: dto.yearBuilt ?? '',
    guardian: dto.guardian ?? '',
  };
}

export async function fetchHeritageSites(): Promise<HeritageSite[]> {
  const cached = getCache<HeritageSite[]>(CACHE_KEY_HERITAGE_SITES);
  if (cached) return cached;

  return dedupeFetch(CACHE_KEY_HERITAGE_SITES, async () => {
    const pageSize = 100;
    const allDtos: HeritageDto[] = [];
    let page = 1;
    let totalRecords = Number.POSITIVE_INFINITY;
    while (allDtos.length < totalRecords) {
      const result = await apiGet<HeritageSearchResult>(`/heritage?page=${page}&pageSize=${pageSize}`);
      allDtos.push(...result.data);
      if (result.data.length === 0) break;
      totalRecords = result.totalRecords;
      page++;
    }
    const sites = allDtos.map(toHeritageSite);
    setCache(CACHE_KEY_HERITAGE_SITES, sites);
    return sites;
  });
}

export async function fetchHeritageSite(id: string): Promise<HeritageSite | null> {
  try {
    const dto = await apiGet<HeritageDto>(`/heritage/${encodeURIComponent(id)}`);
    return toHeritageSite(dto);
  } catch {
    return null;
  }
}

export async function createHeritageSite(data: Record<string, unknown>): Promise<HeritageSite> {
  const dto = await apiPost<HeritageDto>('/heritage', data);
  clearCache(CACHE_KEY_HERITAGE_SITES);
  return toHeritageSite(dto);
}

export async function updateHeritageSite(id: string, data: Record<string, unknown>): Promise<HeritageSite> {
  if (!id || !id.trim()) throw new Error('Cannot update: heritage ID is empty');
  const dto = await apiPut<HeritageDto>(`/heritage/${encodeURIComponent(id)}`, data);
  clearCache(CACHE_KEY_HERITAGE_SITES);
  return toHeritageSite(dto);
}

export async function duplicateHeritageSite(id: string): Promise<HeritageSite> {
  if (!id || !id.trim()) throw new Error('Cannot duplicate: heritage ID is empty');
  const dto = await apiPost<HeritageDto>(`/heritage/${encodeURIComponent(id)}/duplicate`);
  clearCache(CACHE_KEY_HERITAGE_SITES);
  return toHeritageSite(dto);
}

export async function deleteHeritageSite(id: string): Promise<void> {
  await apiDelete(`/heritage/${encodeURIComponent(id)}`);
  clearCache(CACHE_KEY_HERITAGE_SITES);
}
