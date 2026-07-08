import { apiGet } from './api';
import type { StatisticsOverview } from '../../core/types';

export async function fetchStatisticsOverview(): Promise<StatisticsOverview> {
  return apiGet<StatisticsOverview>('/statistics/overview');
}
