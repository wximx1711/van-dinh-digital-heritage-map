import { apiGet, apiPost, apiDelete } from './api';
import type {
  EvaluationSubmitPayload,
  EvaluationTargetStats,
  EvaluationAdminStats,
  EvaluationListItem,
  EvaluationDetail,
  EvaluationSearchRequest,
  EvaluationOverallStats,
  HeritageEvaluationSummary,
  PagedResult,
} from '../../core/types';

export async function fetchEvaluationTargetStats(type: string, id: string): Promise<EvaluationTargetStats> {
  return apiGet<EvaluationTargetStats>(`/evaluations/target/${encodeURIComponent(type)}/${encodeURIComponent(id)}`);
}

export async function submitEvaluation(payload: EvaluationSubmitPayload): Promise<unknown> {
  return apiPost('/evaluations', payload);
}

export async function searchEvaluations(request: EvaluationSearchRequest): Promise<PagedResult<EvaluationListItem>> {
  return apiPost<PagedResult<EvaluationListItem>>('/evaluations/search', request);
}

export async function fetchEvaluationDetail(id: number): Promise<EvaluationDetail> {
  return apiGet<EvaluationDetail>(`/evaluations/${id}`);
}

export async function approveEvaluation(id: number): Promise<void> {
  await apiPost(`/evaluations/${id}/approve`, null);
}

export async function rejectEvaluation(id: number): Promise<void> {
  await apiPost(`/evaluations/${id}/reject`, null);
}

export async function replyEvaluation(id: number, adminReply: string): Promise<void> {
  await apiPost(`/evaluations/${id}/reply`, { adminReply });
}

export async function deleteEvaluation(id: number): Promise<void> {
  await apiDelete(`/evaluations/${id}`);
}

export async function fetchEvaluationAdminStats(): Promise<EvaluationAdminStats> {
  return apiGet<EvaluationAdminStats>('/evaluations/admin/stats');
}

export async function fetchHeritageEvaluationSummaries(): Promise<HeritageEvaluationSummary[]> {
  return apiGet<HeritageEvaluationSummary[]>('/evaluations/admin/heritage-summaries');
}

export async function fetchEvaluationOverallStats(): Promise<EvaluationOverallStats> {
  return apiGet<EvaluationOverallStats>('/evaluations/overall');
}

export function evaluationListExportUrl(params: EvaluationSearchRequest): string {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.targetType) query.set('targetType', params.targetType);
  if (params.targetId) query.set('targetId', params.targetId);
  if (params.rating) query.set('rating', String(params.rating));
  if (params.satisfactionLevel) query.set('satisfactionLevel', params.satisfactionLevel);
  if (params.status) query.set('status', params.status);
  if (params.dateFrom) query.set('dateFrom', params.dateFrom);
  if (params.dateTo) query.set('dateTo', params.dateTo);
  const qs = query.toString();
  return `/api/evaluations/admin/export/excel${qs ? `?${qs}` : ''}`;
}
