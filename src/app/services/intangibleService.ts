import { apiGet, apiPost, apiPut, apiDelete } from './api';
import type { IntangibleHeritage } from '../../core/types';

interface IntangibleHeritageDto {
  id: string;
  nameVi: string;
  nameEn: string;
  category: string;
  descriptionVi: string | null;
  descriptionEn: string | null;
  image: string | null;
  videoUrl: string | null;
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
  const result = await apiGet<IntangibleSearchResult>('/intangible-heritage?pageSize=100');
  return result.data.map(toIntangibleHeritage);
}

export async function createIntangibleHeritage(data: Record<string, unknown>): Promise<IntangibleHeritage> {
  const dto = await apiPost<IntangibleHeritageDto>('/intangible-heritage', data);
  return toIntangibleHeritage(dto);
}

export async function updateIntangibleHeritage(id: string, data: Record<string, unknown>): Promise<IntangibleHeritage> {
  const dto = await apiPut<IntangibleHeritageDto>(`/intangible-heritage/${encodeURIComponent(id)}`, data);
  return toIntangibleHeritage(dto);
}

export async function deleteIntangibleHeritage(id: string): Promise<void> {
  await apiDelete(`/intangible-heritage/${encodeURIComponent(id)}`);
}
