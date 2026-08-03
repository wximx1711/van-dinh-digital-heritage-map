import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from './LanguageContext';
import {
  FileSpreadsheet, UploadCloud, CheckCircle2, XCircle, Loader2, Download,
  Trash2, Eye, X, RefreshCw, AlertTriangle, History as HistoryIcon, FileText, Play
} from 'lucide-react';
import {
  analyzeMailMerge, createMailMergeJob, deleteMailMergeHistory, getMailMergeDownloadUrl,
  getMailMergeHistory, getMailMergeHistoryDetail, getMailMergeProgress,
  type MailMergeAnalyzeResult, type MailMergeHistoryDetail, type MailMergeHistoryItem,
  type MailMergeMappingItem, type MailMergeProgress, type PagedMailMergeHistory,
} from '../services/mailMergeService';

const VI = {
  title: 'Điền biểu mẫu tự động',
  subtitle: 'Tải lên mẫu Word và dữ liệu Excel, hệ thống tự động sinh văn bản cho từng công dân',
  step1: '1. Tải lên tệp mẫu và dữ liệu',
  template: 'Mẫu Word (.docx)',
  templateHint: 'Chứa các chỗ trống dạng {{FullName}}, {{Address}}, {{MeetingDate}}...',
  excel: 'Dữ liệu Excel (.xlsx)',
  excelHint: 'Hàng đầu tiên là tên cột; mỗi hàng là một công dân',
  analyze: 'Phân tích mẫu & dữ liệu',
  analyzing: 'Đang phân tích...',
  placeholders: 'Chỗ trống phát hiện trong mẫu',
  columns: 'Cột dữ liệu từ Excel',
  step2: '2. Ánh xạ cột dữ liệu sang chỗ trống',
  placeholder: 'Chỗ trống',
  mappedTo: 'Cột dữ liệu',
  unmapped: '— Chưa ánh xạ —',
  mappedExact: 'Tự động (khớp chính xác)',
  mappedNormalized: 'Tự động (khớp gần đúng)',
  notMapped: 'Chưa ánh xạ',
  noMappingWarning: 'Các chỗ trống sau chưa được ánh xạ: {0}',
  rowsFound: 'Tổng số bản ghi dữ liệu: {0}',
  emptyRowsSkipped: '{0} hàng trống sẽ được bỏ qua',
  previewRows: 'Xem trước dữ liệu (5 hàng đầu)',
  step3: '3. Tên tệp đầu ra & tạo văn bản',
  pattern: 'Mẫu tên tệp đầu ra',
  patternHint: 'Ví dụ: {{FullName}}, {{CitizenId}}, Invitation-{{FullName}}',
  patternTokens: 'Chèn chỗ trống vào tên tệp:',
  filenamePreview: 'Xem trước tên tệp',
  generate: 'Tạo văn bản hàng loạt',
  generating: 'Đang tạo...',
  progress: 'Tiến độ xử lý',
  processed: 'Đã xử lý',
  success: 'Thành công',
  failed: 'Thất lỗi',
  currentFile: 'Đang tạo:',
  liveErrors: 'Lỗi chi tiết (mới nhất):',
  downloadZip: 'Tải ZIP ({0} tệp)',
  noErrors: 'Không có lỗi nào',
  history: 'Lịch sử tạo văn bản',
  statusAll: 'Tất cả trạng thái',
  statusCompleted: 'Hoàn thành',
  statusFailed: 'Thất bại',
  statusProcessing: 'Đang xử lý',
  colTime: 'Thời gian',
  colUser: 'Người thực hiện',
  colTemplate: 'Tệp mẫu',
  colDocs: 'Số văn bản',
  colStatus: 'Trạng thái',
  colActions: 'Thao tác',
  actionDetail: 'Chi tiết',
  actionDownload: 'Tải ZIP',
  actionDelete: 'Xóa',
  detailTitle: 'Chi tiết lịch sử',
  detailErrors: 'Danh sách lỗi',
  detailMapping: 'Ánh xạ đã sử dụng',
  total: 'Tổng',
  generated: 'Sinh được',
  close: 'Đóng',
  deleteConfirm: 'Xóa bản ghi lịch sử này và tệp ZIP kèm theo?',
  required: 'Vui lòng chọn đủ tệp mẫu và tệp Excel',
  page: 'Trang',
  of: '/',
  empty: 'Chưa có lịch sử nào',
};

const EN: typeof VI = {
  title: 'Automatic Form Filling',
  subtitle: 'Upload a Word template and Excel data file; the system generates one personalized document per citizen',
  step1: '1. Upload template & data files',
  template: 'Word template (.docx)',
  templateHint: 'Contains placeholders like {{FullName}}, {{Address}}, {{MeetingDate}}...',
  excel: 'Excel data (.xlsx)',
  excelHint: 'First row = column names; each row = one citizen',
  analyze: 'Analyze template & data',
  analyzing: 'Analyzing...',
  placeholders: 'Placeholders found in template',
  columns: 'Data columns from Excel',
  step2: '2. Map data columns to placeholders',
  placeholder: 'Placeholder',
  mappedTo: 'Data column',
  unmapped: '— Not mapped —',
  mappedExact: 'Auto (exact match)',
  mappedNormalized: 'Auto (fuzzy match)',
  notMapped: 'Not mapped',
  noMappingWarning: 'The following placeholders are not mapped: {0}',
  rowsFound: 'Total data records: {0}',
  emptyRowsSkipped: '{0} empty rows will be skipped',
  previewRows: 'Data preview (first 5 rows)',
  step3: '3. Output file name & generation',
  pattern: 'Output file name pattern',
  patternHint: 'Examples: {{FullName}}, {{CitizenId}}, Invitation-{{FullName}}',
  patternTokens: 'Insert placeholders into the name:',
  filenamePreview: 'File name preview',
  generate: 'Generate documents',
  generating: 'Generating...',
  progress: 'Processing progress',
  processed: 'Processed',
  success: 'Success',
  failed: 'Failed',
  currentFile: 'Current file:',
  liveErrors: 'Latest errors:',
  downloadZip: 'Download ZIP ({0} files)',
  noErrors: 'No errors',
  history: 'Generation history',
  statusAll: 'All statuses',
  statusCompleted: 'Completed',
  statusFailed: 'Failed',
  statusProcessing: 'Processing',
  colTime: 'Time',
  colUser: 'User',
  colTemplate: 'Template',
  colDocs: 'Documents',
  colStatus: 'Status',
  colActions: 'Actions',
  actionDetail: 'Details',
  actionDownload: 'Download ZIP',
  actionDelete: 'Delete',
  detailTitle: 'History details',
  detailErrors: 'Error list',
  detailMapping: 'Used mapping',
  total: 'Total',
  generated: 'Generated',
  close: 'Close',
  deleteConfirm: 'Delete this history record and its ZIP file?',
  required: 'Please select both the template and the Excel file',
  page: 'Page',
  of: '/',
  empty: 'No history yet',
};

function sanitizeFileName(name: string): string {
  let result = (name ?? '').replace(/[<>:"/\\|?*]/g, '').replace(/[\x00-\x1F]/g, '');
  result = result.replace(/\r/g, ' ').replace(/\n/g, ' ').trim();
  result = result.split(' ').filter(Boolean).join(' ');
  while (result.endsWith('.') || result.endsWith(' ')) result = result.slice(0, -1);
  if (result.length > 180) result = result.slice(0, 180).replace(/[. ]+$/, '');
  return result;
}

function previewNames(pattern: string, rows: Record<string, string>[]): string[] {
  const names: string[] = [];
  const used = new Set<string>();
  rows.forEach((row, index) => {
    let name = pattern;
    for (const key of Object.keys(row)) {
      name = name.split(`{{${key}}}`).join(row[key] ?? '');
    }
    name = sanitizeFileName(name) || `Document-${index + 1}`;
    let candidate = name;
    let counter = 2;
    while (used.has(candidate.toLowerCase())) {
      candidate = `${name} (${counter++})`;
    }
    used.add(candidate.toLowerCase());
    names.push(candidate);
  });
  return names;
}

export function FormFillingManagement() {
  const { lang } = useLanguage();
  const S = lang === 'vi' ? VI : EN;

  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<MailMergeAnalyzeResult | null>(null);
  const [mapping, setMapping] = useState<MailMergeMappingItem[]>([]);
  const [pattern, setPattern] = useState('');
  const [analyzeError, setAnalyzeError] = useState('');

  const [job, setJob] = useState<{ publicId: string; fileName: string } | null>(null);
  const [progress, setProgress] = useState<MailMergeProgress | null>(null);
  const [generating, setGenerating] = useState(false);

  const [history, setHistory] = useState<PagedMailMergeHistory | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyStatus, setHistoryStatus] = useState('');
  const [detail, setDetail] = useState<MailMergeHistoryDetail | null>(null);

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const templateInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadHistory = useCallback(async (page = historyPage, status = historyStatus) => {
    try {
      const result = await getMailMergeHistory(page, 10, status || undefined);
      setHistory(result);
    } catch {
      setHistory(null);
    }
  }, [historyPage, historyStatus]);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const handleAnalyze = async () => {
    if (!templateFile || !excelFile) {
      setAnalyzeError(S.required);
      return;
    }
    setAnalyzeError('');
    setAnalyzing(true);
    try {
      const result = await analyzeMailMerge(templateFile, excelFile);
      setAnalysis(result);
      setMapping(result.suggestedMapping.map(m => ({ placeholder: m.placeholder, column: m.column })));
      setPattern(result.placeholders.length > 0 ? `{{${result.placeholders[0]}}}` : '');
      setJob(null);
      setProgress(null);
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : String(err));
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerate = async () => {
    if (!templateFile || !excelFile || !analysis) {
      setAnalyzeError(S.required);
      return;
    }
    const unmapped = mapping.filter(m => !m.column).map(m => m.placeholder);
    if (unmapped.length > 0) {
      setAnalyzeError(S.noMappingWarning.replace('{0}', unmapped.join(', ')));
      return;
    }
    setAnalyzeError('');
    setGenerating(true);
    setProgress(null);
    try {
      const created = await createMailMergeJob(templateFile, excelFile, pattern, mapping);
      setJob({ publicId: created.publicId, fileName: created.filenamePattern });
      setProgress({
        status: 'Processing', totalRows: created.rowCount, processedRows: 0,
        successCount: 0, failedCount: 0, currentFileName: null, errors: [],
        completedAt: null, zipFileName: null,
      });
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : String(err));
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    if (!job) return;
    let cancelled = false;
    const timer = window.setInterval(async () => {
      try {
        const next = await getMailMergeProgress(job.publicId);
        if (cancelled) return;
        setProgress(next);
        if (next.status !== 'Processing') {
          window.clearInterval(timer);
          loadHistory(1, '');
          showToast(
            lang === 'vi'
              ? `Hoàn tất: ${next.successCount} thành công, ${next.failedCount} thất bại`
              : `Done: ${next.successCount} succeeded, ${next.failedCount} failed`,
            next.failedCount === 0 ? 'success' : 'error',
          );
        }
      } catch {
        // keep polling; the job may still be starting up
      }
    }, 800);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [job, loadHistory, lang]);

  const handleDelete = async (item: MailMergeHistoryItem) => {
    if (!window.confirm(S.deleteConfirm)) return;
    try {
      await deleteMailMergeHistory(item.jobId);
      showToast(lang === 'vi' ? 'Đã xóa bản ghi' : 'Record deleted');
      loadHistory();
    } catch (err) {
      showToast(err instanceof Error ? err.message : String(err), 'error');
    }
  };

  const openDetail = async (item: MailMergeHistoryItem) => {
    try {
      const result = await getMailMergeHistoryDetail(item.jobId);
      setDetail(result);
    } catch (err) {
      showToast(err instanceof Error ? err.message : String(err), 'error');
    }
  };

  const pct = useMemo(() => {
    if (!progress || progress.totalRows === 0) return 0;
    return Math.min(100, Math.round((progress.processedRows / progress.totalRows) * 100));
  }, [progress]);

  const fileNames = useMemo(
    () => (analysis ? previewNames(pattern, analysis.previewRows) : []),
    [analysis, pattern],
  );

  const statusColor: Record<string, string> = {
    Processing: '#F39C12',
    Completed: '#27AE60',
    Failed: '#E74C3C',
  };

  return (
    <div style={{ padding: 'clamp(12px, 3vw, 24px)', position: 'relative', maxWidth: 1200 }}>
      <style>{`@keyframes ff-spin { to { transform: rotate(360deg); } } .spin { animation: ff-spin 0.8s linear infinite; }`}</style>
      {toast && (
        <div style={{
          position: 'fixed', top: 80, right: 24, zIndex: 1000, padding: '12px 16px', borderRadius: 8,
          background: toast.type === 'success' ? '#EAFAF1' : '#FDEDEC',
          border: `1px solid ${toast.type === 'success' ? '#27AE60' : '#E74C3C'}`,
          color: toast.type === 'success' ? '#27AE60' : '#E74C3C',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, maxWidth: 420,
        }}>
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <h1 style={{ color: '#0F3D5E', margin: '0 0 4px', fontSize: 20, fontFamily: 'Merriweather, serif' }}>
        {S.title}
      </h1>
      <p style={{ color: '#5d7a8c', fontSize: 12, margin: '0 0 20px' }}>{S.subtitle}</p>

      {/* ── Step 1: Upload ── */}
      <div style={{ background: 'white', borderRadius: 10, padding: '18px 20px', boxShadow: '0 1px 6px rgba(15,61,94,0.06)', marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0F3D5E', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileSpreadsheet size={16} style={{ color: '#D4A017' }} /> {S.step1}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {[
            { label: S.template, hint: S.templateHint, file: templateFile, setFile: setTemplateFile, ref: templateInputRef, accept: '.docx', color: '#1A5276' },
            { label: S.excel, hint: S.excelHint, file: excelFile, setFile: setExcelFile, ref: excelInputRef, accept: '.xlsx', color: '#27AE60' },
          ].map(f => (
            <div key={f.label} style={{
              border: `1.5px dashed ${f.file ? f.color : 'rgba(15,61,94,0.2)'}`,
              borderRadius: 10, padding: 14, background: f.file ? '#F8FAFC' : '#FBFCFE', cursor: 'pointer',
            }}
              onClick={() => f.ref.current?.click()}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#F0F4F8'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = f.file ? '#F8FAFC' : '#FBFCFE'; }}>
              <input
                ref={f.ref} type="file" accept={f.accept} style={{ display: 'none' }}
                onChange={e => {
                  const file = e.target.files?.[0] ?? null;
                  f.setFile(file);
                  if (file) { setAnalysis(null); setMapping([]); setJob(null); setProgress(null); setAnalyzeError(''); }
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: `${f.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color, flexShrink: 0 }}>
                  <UploadCloud size={17} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0F3D5E' }}>{f.label}</div>
                  <div style={{ fontSize: 10, color: f.file ? f.color : '#5d7a8c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: f.file ? 600 : 400 }}>
                    {f.file ? f.file.name : (lang === 'vi' ? 'Nhấn để chọn tệp' : 'Click to choose file')}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 10, color: '#5d7a8c', lineHeight: 1.5 }}>{f.hint}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
          <button onClick={handleAnalyze} disabled={analyzing}
            style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '9px 20px', borderRadius: 7,
              background: analyzing ? '#94a3b8' : '#0F3D5E', border: 'none', color: 'white',
              fontSize: 12, fontWeight: 700, cursor: analyzing ? 'wait' : 'pointer',
              boxShadow: '0 3px 10px rgba(15,61,94,0.25)',
            }}>
            {analyzing ? <Loader2 size={14} className="spin" /> : <RefreshCw size={14} />}
            {analyzing ? S.analyzing : S.analyze}
          </button>
          {analyzeError && (
            <span style={{ color: '#E74C3C', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
              <AlertTriangle size={13} style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{analyzeError}</span>
            </span>
          )}
        </div>
      </div>

      {/* ── Step 2: Mapping ── */}
      {analysis && (
        <div style={{ background: 'white', borderRadius: 10, padding: '18px 20px', boxShadow: '0 1px 6px rgba(15,61,94,0.06)', marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0F3D5E', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={16} style={{ color: '#D4A017' }} /> {S.step2}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#5d7a8c', marginRight: 4, alignSelf: 'center' }}>{S.placeholders}:</span>
            {analysis.placeholders.map(p => (
              <span key={p} style={{
                padding: '3px 10px', borderRadius: 12, background: 'rgba(212,160,23,0.12)', color: '#B8860B',
                fontSize: 11, fontWeight: 700, fontFamily: 'monospace',
              }}>{`{{${p}}}`}</span>
            ))}
            <span style={{ fontSize: 11, fontWeight: 700, color: '#5d7a8c', marginLeft: 12, marginRight: 4, alignSelf: 'center' }}>{S.columns}:</span>
            {analysis.columns.map(c => (
              <span key={c.name} style={{
                padding: '3px 10px', borderRadius: 12, background: 'rgba(39,174,96,0.1)', color: '#27AE60',
                fontSize: 11, fontWeight: 600, fontFamily: 'monospace',
              }}>{c.name}</span>
            ))}
          </div>

          <div style={{ fontSize: 11, color: '#5d7a8c', marginBottom: 10 }}>
            {S.rowsFound.replace('{0}', String(analysis.rowCount))}
            {analysis.emptyRowCount > 0 && (
              <span style={{ color: '#E67E22', marginLeft: 8 }}>
                <AlertTriangle size={11} style={{ verticalAlign: -1, marginRight: 3 }} />
                {S.emptyRowsSkipped.replace('{0}', String(analysis.emptyRowCount))}
              </span>
            )}
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', fontSize: 11, color: '#5d7a8c', fontWeight: 700, padding: '6px 8px', borderBottom: '1px solid rgba(15,61,94,0.1)' }}>{S.placeholder}</th>
                <th style={{ textAlign: 'left', fontSize: 11, color: '#5d7a8c', fontWeight: 700, padding: '6px 8px', borderBottom: '1px solid rgba(15,61,94,0.1)' }}>{S.mappedTo}</th>
                <th style={{ textAlign: 'left', fontSize: 11, color: '#5d7a8c', fontWeight: 700, padding: '6px 8px', borderBottom: '1px solid rgba(15,61,94,0.1)' }}>{S.colStatus}</th>
              </tr>
            </thead>
            <tbody>
              {mapping.map(m => {
                const suggestion = analysis.suggestedMapping.find(s => s.placeholder === m.placeholder);
                return (
                  <tr key={m.placeholder}>
                    <td style={{ padding: '6px 8px', fontSize: 12, fontWeight: 700, color: '#0F3D5E', fontFamily: 'monospace' }}>{`{{${m.placeholder}}}`}</td>
                    <td style={{ padding: '6px 8px' }}>
                      <select
                        value={m.column ?? ''}
                        onChange={e => setMapping(prev => prev.map(x => x.placeholder === m.placeholder ? { ...x, column: e.target.value || null } : x))}
                        style={{
                          width: '100%', maxWidth: 320, padding: '6px 8px', borderRadius: 6,
                          border: `1.5px solid ${m.column ? 'rgba(39,174,96,0.5)' : 'rgba(231,76,60,0.5)'}`,
                          fontSize: 12, background: '#F8FAFC', outline: 'none',
                        }}>
                        <option value="">{S.unmapped}</option>
                        {analysis.columns.map(c => <option key={c.name} value={c.name}>{c.name}{c.sampleValue ? `  (${c.sampleValue})` : ''}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '6px 8px' }}>
                      {m.column ? (
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
                          background: suggestion?.confidence === 'exact' ? 'rgba(39,174,96,0.12)' : 'rgba(39,174,96,0.08)',
                          color: '#27AE60',
                        }}>
                          {suggestion?.confidence === 'exact' ? S.mappedExact : S.mappedNormalized}
                        </span>
                      ) : (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: 'rgba(231,76,60,0.1)', color: '#E74C3C' }}>
                          {S.notMapped}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {analysis.previewRows.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 8 }}>{S.previewRows}</div>
              <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid rgba(15,61,94,0.08)' }}>
                <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                  <thead>
                    <tr style={{ background: '#F0F4F8' }}>
                      {analysis.columns.map(c => (
                        <th key={c.name} style={{ padding: '6px 10px', fontSize: 10, fontWeight: 700, color: '#0F3D5E', textAlign: 'left', whiteSpace: 'nowrap' }}>{c.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.previewRows.map((row, i) => (
                      <tr key={i} style={{ borderTop: '1px solid rgba(15,61,94,0.06)' }}>
                        {analysis.columns.map(c => (
                          <td key={c.name} style={{ padding: '6px 10px', fontSize: 11, color: '#1a2332', whiteSpace: 'nowrap', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {row[c.name]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5 }}>{S.pattern}</label>
              <input
                value={pattern}
                onChange={e => setPattern(e.target.value)}
                placeholder={S.patternHint}
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: 7, border: '1.5px solid rgba(15,61,94,0.15)',
                  fontSize: 13, background: '#F8FAFC', outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace',
                }}
              />
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 10, color: '#5d7a8c', marginBottom: 5 }}>{S.patternTokens}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {analysis.placeholders.map(p => (
                    <button key={p} onClick={() => setPattern(prev => `${prev}{{${p}}}`)}
                      style={{
                        padding: '3px 9px', borderRadius: 10, border: '1px solid rgba(212,160,23,0.4)',
                        background: 'rgba(212,160,23,0.08)', color: '#B8860B', fontSize: 10, fontWeight: 700,
                        cursor: 'pointer', fontFamily: 'monospace',
                      }}>
                      {`{{${p}}}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5 }}>{S.filenamePreview}</div>
              <div style={{ background: '#F0F4F8', borderRadius: 8, padding: '8px 10px', maxHeight: 120, overflowY: 'auto' }}>
                {fileNames.map((name, i) => (
                  <div key={i} style={{ fontSize: 11, color: '#0F3D5E', fontFamily: 'monospace', padding: '2px 0' }}>{name}.docx</div>
                ))}
                {fileNames.length === 0 && <div style={{ fontSize: 11, color: '#5d7a8c' }}>—</div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 3: Generate & progress ── */}
      {analysis && (
        <div style={{ background: 'white', borderRadius: 10, padding: '18px 20px', boxShadow: '0 1px 6px rgba(15,61,94,0.06)', marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0F3D5E', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Play size={16} style={{ color: '#D4A017' }} /> {S.step3}
          </div>

          {!progress ? (
            <button onClick={handleGenerate} disabled={generating}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '11px 26px', borderRadius: 8,
                background: generating ? '#94a3b8' : '#0F3D5E', border: 'none', color: 'white',
                fontSize: 13, fontWeight: 700, cursor: generating ? 'wait' : 'pointer',
                boxShadow: '0 4px 14px rgba(15,61,94,0.3)',
              }}>
              {generating ? <Loader2 size={15} className="spin" /> : <Play size={15} />}
              {generating ? S.generating : S.generate}
            </button>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#0F3D5E' }}>{S.progress}</span>
                <span style={{ fontSize: 11, color: '#5d7a8c' }}>
                  {S.processed}: {progress.processedRows}/{progress.totalRows} ({pct}%)
                </span>
              </div>
              <div style={{ height: 10, borderRadius: 5, background: '#F0F4F8', overflow: 'hidden', marginBottom: 10 }}>
                <div style={{ height: '100%', width: `${pct}%`, borderRadius: 5, background: 'linear-gradient(90deg, #0F3D5E, #1A5276)', transition: 'width 0.3s' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#27AE60', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <CheckCircle2 size={14} /> {S.success}: {progress.successCount}
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: progress.failedCount > 0 ? '#E74C3C' : '#5d7a8c', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <XCircle size={14} /> {S.failed}: {progress.failedCount}
                </span>
                {progress.status === 'Processing' && progress.currentFileName && (
                  <span style={{ fontSize: 11, color: '#5d7a8c', display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
                    <Loader2 size={13} className="spin" style={{ flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 300 }}>
                      {S.currentFile} {progress.currentFileName}
                    </span>
                  </span>
                )}
                {progress.status === 'Completed' && (
                  <a
                    href={getMailMergeDownloadUrl(job?.publicId ?? '')}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 7,
                      background: 'rgba(212,160,23,0.1)', border: '1px solid #D4A017', color: '#B8860B',
                      fontSize: 12, fontWeight: 700, textDecoration: 'none', cursor: 'pointer',
                    }}>
                    <Download size={14} /> {S.downloadZip.replace('{0}', String(progress.successCount))}
                  </a>
                )}
              </div>
              {progress.errors.length > 0 && (
                <div style={{ background: '#FDEDEC', borderRadius: 8, padding: '10px 12px', maxHeight: 160, overflowY: 'auto' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#E74C3C', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                    {S.liveErrors}
                  </div>
                  {progress.errors.slice(0, 60).map((err, i) => (
                    <div key={i} style={{ fontSize: 11, color: '#C0392B', padding: '2px 0', fontFamily: 'monospace' }}>{err}</div>
                  ))}
                </div>
              )}
              {progress.errors.length === 0 && progress.status !== 'Processing' && (
                <div style={{ fontSize: 11, color: '#27AE60', fontWeight: 600 }}><CheckCircle2 size={12} style={{ verticalAlign: -1, marginRight: 4 }} />{S.noErrors}</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── History ── */}
      <div style={{ background: 'white', borderRadius: 10, padding: '18px 20px', boxShadow: '0 1px 6px rgba(15,61,94,0.06)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0F3D5E', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <HistoryIcon size={16} style={{ color: '#D4A017' }} /> {S.history}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <select value={historyStatus} onChange={e => { setHistoryStatus(e.target.value); setHistoryPage(1); }}
              style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid rgba(15,61,94,0.15)', fontSize: 11, background: '#F8FAFC', outline: 'none' }}>
              <option value="">{S.statusAll}</option>
              <option value="Completed">{S.statusCompleted}</option>
              <option value="Processing">{S.statusProcessing}</option>
              <option value="Failed">{S.statusFailed}</option>
            </select>
            <button onClick={() => loadHistory()} style={{ padding: '5px 9px', borderRadius: 6, border: '1px solid rgba(15,61,94,0.15)', background: 'white', color: '#0F3D5E', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              <RefreshCw size={12} />
            </button>
          </div>
        </div>

        {!history || history.data.length === 0 ? (
          <div style={{ padding: '28px', textAlign: 'center', color: '#5d7a8c', fontSize: 12 }}>
            <HistoryIcon size={36} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.3 }} />
            {S.empty}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#5d7a8c', padding: '6px 8px', borderBottom: '1px solid rgba(15,61,94,0.1)', whiteSpace: 'nowrap' }}>{S.colTime}</th>
                  <th style={{ textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#5d7a8c', padding: '6px 8px', borderBottom: '1px solid rgba(15,61,94,0.1)', whiteSpace: 'nowrap' }}>{S.colUser}</th>
                  <th style={{ textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#5d7a8c', padding: '6px 8px', borderBottom: '1px solid rgba(15,61,94,0.1)' }}>{S.colTemplate}</th>
                  <th style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#5d7a8c', padding: '6px 8px', borderBottom: '1px solid rgba(15,61,94,0.1)', whiteSpace: 'nowrap' }}>{S.colDocs}</th>
                  <th style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#5d7a8c', padding: '6px 8px', borderBottom: '1px solid rgba(15,61,94,0.1)' }}>{S.colStatus}</th>
                  <th style={{ textAlign: 'right', fontSize: 10, fontWeight: 700, color: '#5d7a8c', padding: '6px 8px', borderBottom: '1px solid rgba(15,61,94,0.1)' }}>{S.colActions}</th>
                </tr>
              </thead>
              <tbody>
                {history.data.map(item => (
                  <tr key={item.jobId} style={{ borderBottom: '1px solid rgba(15,61,94,0.05)' }}>
                    <td style={{ padding: '8px', fontSize: 11, color: '#1a2332', whiteSpace: 'nowrap' }}>
                      {new Date(item.createdAt).toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US')}
                    </td>
                    <td style={{ padding: '8px', fontSize: 11, color: '#1a2332', whiteSpace: 'nowrap' }}>{item.userName}</td>
                    <td style={{ padding: '8px', fontSize: 11, color: '#0F3D5E', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.templateFileName}</td>
                    <td style={{ padding: '8px', textAlign: 'center', fontSize: 11, color: '#1a2332', whiteSpace: 'nowrap' }}>
                      <span style={{ color: '#27AE60', fontWeight: 700 }}>{item.successCount}</span>
                      {item.failedCount > 0 && <span style={{ color: '#E74C3C', fontWeight: 700 }}> / {item.failedCount}</span>}
                      <span style={{ color: '#5d7a8c' }}> / {item.totalRows}</span>
                    </td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 10px', borderRadius: 10,
                        background: `${statusColor[item.status] ?? '#95A5A6'}15`, color: statusColor[item.status] ?? '#5d7a8c',
                      }}>
                        {item.status === 'Completed' ? S.statusCompleted : item.status === 'Failed' ? S.statusFailed : S.statusProcessing}
                      </span>
                    </td>
                    <td style={{ padding: '8px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button onClick={() => openDetail(item)} title={S.actionDetail}
                        style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid rgba(15,61,94,0.15)', background: 'white', color: '#0F3D5E', fontSize: 11, cursor: 'pointer', marginRight: 5 }}>
                        <Eye size={13} />
                      </button>
                      {item.status === 'Completed' && item.zipFileName && (
                        <a href={getMailMergeDownloadUrl(item.publicId)} title={S.actionDownload}
                          style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid rgba(212,160,23,0.5)', background: 'rgba(212,160,23,0.06)', color: '#B8860B', fontSize: 11, cursor: 'pointer', marginRight: 5, textDecoration: 'none', display: 'inline-flex', verticalAlign: 'middle' }}>
                          <Download size={13} />
                        </a>
                      )}
                      <button onClick={() => handleDelete(item)} title={S.actionDelete}
                        style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid rgba(231,76,60,0.3)', background: 'white', color: '#E74C3C', fontSize: 11, cursor: 'pointer' }}>
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {history && history.totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12 }}>
            <button disabled={history.page <= 1} onClick={() => { setHistoryPage(history.page - 1); loadHistory(history.page - 1); }}
              style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid rgba(15,61,94,0.15)', background: 'white', color: '#0F3D5E', fontSize: 11, cursor: history.page <= 1 ? 'not-allowed' : 'pointer', opacity: history.page <= 1 ? 0.4 : 1 }}>
              ‹
            </button>
            <span style={{ fontSize: 11, color: '#5d7a8c' }}>
              {S.page} {history.page}{S.of}{history.totalPages}
            </span>
            <button disabled={history.page >= history.totalPages} onClick={() => { setHistoryPage(history.page + 1); loadHistory(history.page + 1); }}
              style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid rgba(15,61,94,0.15)', background: 'white', color: '#0F3D5E', fontSize: 11, cursor: history.page >= history.totalPages ? 'not-allowed' : 'pointer', opacity: history.page >= history.totalPages ? 0.4 : 1 }}>
              ›
            </button>
          </div>
        )}
      </div>

      {/* ── Detail modal ── */}
      {detail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setDetail(null)}>
          <div style={{ background: 'white', borderRadius: 12, padding: 24, width: 'min(640px, 94vw)', maxHeight: '86vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ color: '#0F3D5E', margin: 0, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
                <HistoryIcon size={16} style={{ color: '#D4A017' }} /> {S.detailTitle}
              </h3>
              <button onClick={() => setDetail(null)} style={{ background: 'none', border: 'none', color: '#5d7a8c', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', fontSize: 12, color: '#1a2332', marginBottom: 14 }}>
              <div><strong style={{ color: '#5d7a8c' }}>{S.colTime}:</strong> {new Date(detail.createdAt).toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US')}</div>
              <div><strong style={{ color: '#5d7a8c' }}>{S.colUser}:</strong> {detail.userName}</div>
              <div><strong style={{ color: '#5d7a8c' }}>{S.colTemplate}:</strong> {detail.templateFileName}</div>
              <div><strong style={{ color: '#5d7a8c' }}>Excel:</strong> {detail.excelFileName}</div>
              <div><strong style={{ color: '#5d7a8c' }}>{S.pattern}:</strong> <span style={{ fontFamily: 'monospace' }}>{detail.filenamePattern}</span></div>
              <div>
                <strong style={{ color: '#5d7a8c' }}>{S.total}:</strong> {detail.totalRows} ·
                <strong style={{ color: '#27AE60' }}> {S.generated}:</strong> {detail.successCount} ·
                <strong style={{ color: '#E74C3C' }}> {S.failed}:</strong> {detail.failedCount}
              </div>
            </div>

            {detail.mapping && Object.keys(detail.mapping).length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#0F3D5E', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.3 }}>{S.detailMapping}</div>
                <div style={{ background: '#F0F4F8', borderRadius: 8, padding: '8px 12px' }}>
                  {Object.entries(detail.mapping).map(([ph, col]) => (
                    <div key={ph} style={{ fontSize: 11, padding: '2px 0', fontFamily: 'monospace', color: '#0F3D5E' }}>
                      {`{{${ph}}}`} → {col}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#0F3D5E', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.3 }}>{S.detailErrors} ({detail.errors.length})</div>
              <div style={{ background: detail.errors.length > 0 ? '#FDEDEC' : '#EAFAF1', borderRadius: 8, padding: '10px 12px', maxHeight: 260, overflowY: 'auto' }}>
                {detail.errors.length === 0 ? (
                  <div style={{ fontSize: 11, color: '#27AE60', fontWeight: 600 }}>{S.noErrors}</div>
                ) : (
                  detail.errors.map((err, i) => (
                    <div key={i} style={{ fontSize: 11, color: '#C0392B', padding: '2px 0', fontFamily: 'monospace' }}>{err}</div>
                  ))
                )}
              </div>
            </div>

            <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setDetail(null)} style={{ padding: '8px 20px', borderRadius: 7, background: '#0F3D5E', border: 'none', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                {S.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
