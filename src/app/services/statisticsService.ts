import { apiGet } from './api';

interface MonthlyUpdateDto {
  updateId: number;
  monthLabel: string;
  displayVi: string;
  displayEn: string;
  updateCount: number;
}

interface MonthlyUpdateItem {
  month: string;
  count: number;
  vi: string;
  en: string;
}

interface StatisticsData {
  totalHeritage: number;
  national: number;
  city: number;
  unranked: number;
  intangible: number;
  images: number;
  videos: number;
  documents: number;
  categories: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  monthlyUpdates: MonthlyUpdateDto[];
}

export interface StatisticsResult {
  totalHeritage: number;
  national: number;
  city: number;
  unranked: number;
  intangible: number;
  images: number;
  videos: number;
  documents: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  monthlyUpdates: MonthlyUpdateItem[];
}

function toMonthlyUpdate(dto: MonthlyUpdateDto): MonthlyUpdateItem {
  return {
    month: dto.monthLabel,
    count: dto.updateCount,
    vi: dto.displayVi,
    en: dto.displayEn,
  };
}

export async function fetchMonthlyUpdates(): Promise<MonthlyUpdateItem[]> {
  const list = await apiGet<MonthlyUpdateDto[]>('/monthly-updates');
  return list.map(toMonthlyUpdate);
}

export async function fetchStatistics(): Promise<StatisticsResult> {
  const data = await apiGet<StatisticsData>('/statistics');
  return {
    totalHeritage: data.totalHeritage,
    national: data.national,
    city: data.city,
    unranked: data.unranked,
    intangible: data.intangible,
    images: data.images,
    videos: data.videos,
    documents: data.documents,
    byType: data.byType,
    byStatus: data.byStatus,
    monthlyUpdates: data.monthlyUpdates.map(toMonthlyUpdate),
  };
}
