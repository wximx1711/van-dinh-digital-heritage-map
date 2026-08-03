import { apiDelete, apiGet, apiPost } from './api';

export interface MailMergeColumn {
  name: string;
  index: number;
  sampleValue: string | null;
}

export interface MailMergeMappingSuggestion {
  placeholder: string;
  column: string | null;
  confidence: 'exact' | 'normalized' | 'none';
}

export interface MailMergeAnalyzeResult {
  templateFileName: string;
  placeholders: string[];
  excelFileName: string;
  columns: MailMergeColumn[];
  suggestedMapping: MailMergeMappingSuggestion[];
  previewRows: Record<string, string>[];
  rowCount: number;
  emptyRowCount: number;
}

export interface MailMergeMappingItem {
  placeholder: string;
  column: string | null;
}

export interface MailMergeJobCreated {
  jobId: number;
  publicId: string;
  status: string;
  templateFileName: string;
  excelFileName: string;
  placeholders: string[];
  columns: string[];
  rowCount: number;
  filenamePattern: string;
}

export interface MailMergeProgress {
  status: 'Processing' | 'Completed' | 'Failed';
  totalRows: number;
  processedRows: number;
  successCount: number;
  failedCount: number;
  currentFileName: string | null;
  errors: string[];
  completedAt: string | null;
  zipFileName: string | null;
}

export interface MailMergeHistoryItem {
  jobId: number;
  publicId: string;
  templateFileName: string;
  excelFileName: string;
  filenamePattern: string;
  totalRows: number;
  successCount: number;
  failedCount: number;
  status: string;
  userName: string;
  createdAt: string;
  completedAt: string | null;
  zipFileName: string | null;
}

export interface MailMergeHistoryDetail extends MailMergeHistoryItem {
  placeholders: string[];
  mapping: Record<string, string>;
  errors: string[];
}

export interface PagedMailMergeHistory {
  data: MailMergeHistoryItem[];
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export async function analyzeMailMerge(template: File, excel: File): Promise<MailMergeAnalyzeResult> {
  const form = new FormData();
  form.append('template', template);
  form.append('excel', excel);
  return apiPost<MailMergeAnalyzeResult>('/mail-merge/analyze', form, true);
}

export async function createMailMergeJob(
  template: File,
  excel: File,
  filenamePattern: string,
  mapping: MailMergeMappingItem[],
): Promise<MailMergeJobCreated> {
  const form = new FormData();
  form.append('template', template);
  form.append('excel', excel);
  form.append('filenamePattern', filenamePattern);
  form.append('mappingJson', JSON.stringify(mapping));
  return apiPost<MailMergeJobCreated>('/mail-merge/jobs', form, true);
}

export async function getMailMergeProgress(publicId: string): Promise<MailMergeProgress> {
  return apiGet<MailMergeProgress>(`/mail-merge/jobs/${publicId}`);
}

export function getMailMergeDownloadUrl(publicId: string): string {
  return `/api/mail-merge/jobs/${publicId}/download`;
}

export async function getMailMergeHistory(page = 1, pageSize = 10, status?: string): Promise<PagedMailMergeHistory> {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (status) params.set('status', status);
  return apiGet<PagedMailMergeHistory>(`/mail-merge/history?${params.toString()}`);
}

export async function getMailMergeHistoryDetail(jobId: number): Promise<MailMergeHistoryDetail> {
  return apiGet<MailMergeHistoryDetail>(`/mail-merge/history/${jobId}`);
}

export async function deleteMailMergeHistory(jobId: number): Promise<void> {
  await apiDelete<void>(`/mail-merge/history/${jobId}`);
}
