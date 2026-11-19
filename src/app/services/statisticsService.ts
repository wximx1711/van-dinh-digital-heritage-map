import { apiGet, apiPost } from './api';
import type { StatisticsOverview } from '../../core/types';

export interface VisitorStats {
  totalVisits: number;
  realVisits: number;
  uniqueVisitors: number;
  todayVisits: number;
}

export async function fetchStatisticsOverview(): Promise<StatisticsOverview> {
  return apiGet<StatisticsOverview>('/statistics/overview');
}

export async function fetchVisitorStats(): Promise<VisitorStats> {
  return apiGet<VisitorStats>('/visitors/stats');
}

export async function trackPageView(path: string): Promise<void> {
  return apiPost('/visitors/track', { path }).catch(() => {});
}
