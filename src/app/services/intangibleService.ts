import { apiGet } from './api';
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

export async function fetchIntangibleHeritage(): Promise<IntangibleHeritage[]> {
  const list = await apiGet<IntangibleHeritageDto[]>('/intangible-heritage');
  return list.map(toIntangibleHeritage);
}
