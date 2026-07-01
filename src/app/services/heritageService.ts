import { apiGet, apiPost, apiPut, apiDelete } from './api';
import type { HeritageSite } from '../../core/types';

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
    lat: dto.lat ?? 0,
    lon: dto.lon ?? 0,
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
  const result = await apiGet<HeritageSearchResult>('/heritage?pageSize=100');
  return result.data.map(toHeritageSite);
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
  return toHeritageSite(dto);
}

export async function updateHeritageSite(id: string, data: Record<string, unknown>): Promise<HeritageSite> {
  const dto = await apiPut<HeritageDto>(`/heritage/${encodeURIComponent(id)}`, data);
  return toHeritageSite(dto);
}

export async function deleteHeritageSite(id: string): Promise<void> {
  await apiDelete(`/heritage/${encodeURIComponent(id)}`);
}
