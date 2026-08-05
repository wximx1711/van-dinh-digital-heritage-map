import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLanguage } from './LanguageContext';
import { useHeritageSites, useIntangibleHeritage } from '../../presentation/hooks/useHeritageData';
import {
  searchEvaluations, fetchEvaluationAdminStats, fetchEvaluationDetail, fetchEvaluationOverallStats,
  approveEvaluation, rejectEvaluation, replyEvaluation, deleteEvaluation, evaluationListExportUrl,
} from '../services/evaluationService';
import { StarRating } from './EvaluationSection';
import {
  Search, Eye, Check, X, Trash2, MessageSquare, ChevronLeft, ChevronRight,
  Download, Filter, Star, RefreshCw, TrendingUp, TrendingDown, Award, Calendar,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';
import type {
  EvaluationListItem, EvaluationDetail, EvaluationSearchRequest, EvaluationAdminStats,
  EvaluationOverallStats, SatisfactionLevel,
} from '../../core/types';

interface EvaluationsManagementProps {
  initialHeritageFilter?: string | null;
  onClearHeritageFilter?: () => void;
}

const PER_PAGE = 10;

const SATISFACTION_OPTIONS: { value: SatisfactionLevel; labelVi: string; labelEn: string; color: string }[] = [
  { value: 'very_satisfied', labelVi: 'Rất hài lòng', labelEn: 'Very satisfied', color: '#27AE60' },
  { value: 'satisfied', labelVi: 'Hài lòng', labelEn: 'Satisfied', color: '#2ECC71' },
  { value: 'neutral', labelVi: 'Bình thường', labelEn: 'Neutral', color: '#F39C12' },
  { value: 'unsatisfied', labelVi: 'Không hài lòng', labelEn: 'Unsatisfied', color: '#E67E22' },
  { value: 'very_unsatisfied', labelVi: 'Rất không hài lòng', labelEn: 'Very unsatisfied', color: '#E74C3C' },
];

function statusStyle(status: string, lang: 'vi' | 'en') {
  switch (status) {
    case 'approved': return { color: '#27AE60', bg: 'rgba(39,174,96,0.12)', label: lang === 'vi' ? 'Đã duyệt' : 'Approved' };
    case 'rejected': return { color: '#E74C3C', bg: 'rgba(231,76,60,0.12)', label: lang === 'vi' ? 'Từ chối' : 'Rejected' };
    default: return { color: '#F39C12', bg: 'rgba(243,156,18,0.12)', label: lang === 'vi' ? 'Chờ duyệt' : 'Pending' };
  }
}

function satisfactionLabel(s: SatisfactionLevel | null | undefined, lang: 'vi' | 'en'): string {
  if (!s) return '—';
  const opt = SATISFACTION_OPTIONS.find(o => o.value === s);
  return opt ? (lang === 'vi' ? opt.labelVi : opt.labelEn) : s;
}

function formatDateTime(iso: string, lang: 'vi' | 'en'): string {
  try {
    return new Date(iso).toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US', {
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function EvaluationsManagement({ initialHeritageFilter, onClearHeritageFilter }: EvaluationsManagementProps) {
  const { lang, t } = useLanguage();
  const { data: heritageSites } = useHeritageSites();
  const { data: intangibleHeritage } = useIntangibleHeritage();

  const [items, setItems] = useState<EvaluationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [targetType, setTargetType] = useState('');
  const [heritageId, setHeritageId] = useState(initialHeritageFilter || '');
  const [rating, setRating] = useState('');
  const [satisfactionFilter, setSatisfactionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const [adminStats, setAdminStats] = useState<EvaluationAdminStats | null>(null);
  const [overallStats, setOverallStats] = useState<EvaluationOverallStats | null>(null);
  const [showStats, setShowStats] = useState(false);

  const [detail, setDetail] = useState<EvaluationDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyId, setReplyId] = useState<number | null>(null);
  const [replying, setReplying] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    setHeritageId(initialHeritageFilter || '');
    setPage(1);
  }, [initialHeritageFilter]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const request: EvaluationSearchRequest = {
        page, pageSize: PER_PAGE,
        search: search || undefined,
        targetType: targetType || undefined,
        targetId: heritageId || undefined,
        rating: rating ? Number(rating) : undefined,
        satisfactionLevel: satisfactionFilter || undefined,
        status: statusFilter || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        sortBy, sortDirection: sortDir,
      };
      const result = await searchEvaluations(request);
      setItems(result.data || []);
      setTotalRecords(result.totalRecords);
      setTotalPages(result.totalPages);
    } catch {
      showToast(lang === 'vi' ? 'Không thể tải dữ liệu' : 'Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, targetType, heritageId, rating, satisfactionFilter, statusFilter, dateFrom, dateTo, sortBy, sortDir, lang]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const fetchStats = useCallback(async () => {
    try {
      const [admin, overall] = await Promise.all([fetchEvaluationAdminStats(), fetchEvaluationOverallStats()]);
      setAdminStats(admin);
      setOverallStats(overall);
    } catch {
      // statistics are optional; keep the list usable
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const handleReset = () => {
    setSearchInput('');
    setSearch('');
    setTargetType('');
    setHeritageId('');
    onClearHeritageFilter?.();
    setRating('');
    setSatisfactionFilter('');
    setStatusFilter('');
    setDateFrom('');
    setDateTo('');
    setSortBy('createdAt');
    setSortDir('desc');
    setPage(1);
  };

  const viewDetail = async (id: number) => {
    setLoadingDetail(true);
    try {
      const data = await fetchEvaluationDetail(id);
      setDetail(data);
      setReplyText(data.adminReply || '');
      setReplyId(null);
    } catch {
      showToast(lang === 'vi' ? 'Không thể tải chi tiết' : 'Failed to load detail', 'error');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await approveEvaluation(id);
      showToast(lang === 'vi' ? 'Đã duyệt đánh giá' : 'Evaluation approved');
      await fetchList();
      await fetchStats();
      setDetail(null);
    } catch {
      showToast(lang === 'vi' ? 'Duyệt thất bại' : 'Approve failed', 'error');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await rejectEvaluation(id);
      showToast(lang === 'vi' ? 'Đã từ chối đánh giá' : 'Evaluation rejected');
      await fetchList();
      await fetchStats();
      setDetail(null);
    } catch {
      showToast(lang === 'vi' ? 'Từ chối thất bại' : 'Reject failed', 'error');
    }
  };

  const handleReply = async () => {
    if (!detail) return;
    if (!replyText.trim()) {
      showToast(lang === 'vi' ? 'Vui lòng nhập nội dung phản hồi' : 'Please enter a reply', 'error');
      return;
    }
    setReplying(true);
    try {
      await replyEvaluation(detail.id, replyText.trim());
      showToast(lang === 'vi' ? 'Đã lưu phản hồi' : 'Reply saved');
      await fetchList();
      await fetchStats();
      if (detail) setDetail({ ...detail, adminReply: replyText.trim(), status: detail.status === 'pending' ? 'approved' : detail.status, isApproved: detail.status === 'pending' ? true : detail.isApproved });
    } catch {
      showToast(lang === 'vi' ? 'Lưu phản hồi thất bại' : 'Failed to save reply', 'error');
    } finally {
      setReplying(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(lang === 'vi' ? 'Xóa đánh giá này?' : 'Delete this evaluation?')) return;
    try {
      await deleteEvaluation(id);
      showToast(lang === 'vi' ? 'Đã xóa' : 'Deleted');
      await fetchList();
      await fetchStats();
      setDetail(null);
    } catch {
      showToast(lang === 'vi' ? 'Xóa thất bại' : 'Delete failed', 'error');
    }
  };

  const startItem = totalRecords > 0 ? (page - 1) * PER_PAGE + 1 : 0;
  const endItem = Math.min(page * PER_PAGE, totalRecords);

  const inputStyle = {
    padding: '8px 10px', borderRadius: 6,
    border: '1.5px solid rgba(15,61,94,0.15)', fontSize: 12,
    background: '#F8FAFC', outline: 'none', color: '#1a2332',
  };

  const heritageOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [];
    heritageSites.forEach(h => options.push({ value: `heritage:${h.id}`, label: `${lang === 'vi' ? h.nameVi : h.nameEn} (${lang === 'vi' ? 'Di tích' : 'Relic'})` }));
    intangibleHeritage.forEach(i => options.push({ value: `intangible:${i.id}`, label: `${lang === 'vi' ? i.nameVi : i.nameEn} (${lang === 'vi' ? 'Phi vật thể' : 'Intangible'})` }));
    return options.sort((a, b) => a.label.localeCompare(b.label, lang === 'vi' ? 'vi' : 'en'));
  }, [heritageSites, intangibleHeritage, lang]);

  const handleHeritageFilter = (value: string) => {
    if (!value) { setTargetType(''); setHeritageId(''); }
    else {
      const [type, id] = value.split(':');
      setTargetType(type);
      setHeritageId(id);
    }
    setPage(1);
  };

  const exportExcel = () => {
    const params: EvaluationSearchRequest = {
      search: search || undefined,
      targetType: targetType || undefined,
      targetId: heritageId || undefined,
      rating: rating ? Number(rating) : undefined,
      satisfactionLevel: satisfactionFilter || undefined,
      status: statusFilter || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    };
    window.open(evaluationListExportUrl(params), '_blank');
  };

  const cards = [
    { label: lang === 'vi' ? 'Tổng đánh giá' : 'Total evaluations', value: adminStats?.totalEvaluations ?? 0, icon: <Star size={16} />, color: '#0F3D5E' },
    { label: lang === 'vi' ? 'Điểm trung bình' : 'Average rating', value: adminStats ? adminStats.averageScore.toFixed(2) : '0', icon: <Award size={16} />, color: '#D4A017' },
    { label: lang === 'vi' ? 'Tỷ lệ hài lòng' : 'Satisfaction', value: adminStats ? `${adminStats.satisfactionRate}%` : '0%', icon: <TrendingUp size={16} />, color: '#27AE60' },
    { label: lang === 'vi' ? 'Chờ duyệt' : 'Pending', value: adminStats?.pendingCount ?? 0, icon: <Calendar size={16} />, color: '#F39C12' },
    { label: lang === 'vi' ? 'Đã duyệt' : 'Approved', value: adminStats?.approvedCount ?? 0, icon: <Check size={16} />, color: '#1A5276' },
    { label: lang === 'vi' ? 'Bị từ chối' : 'Rejected', value: adminStats?.rejectedCount ?? 0, icon: <X size={16} />, color: '#E74C3C' },
  ];

  const distributionData = useMemo(() =>
    overallStats ? [...overallStats.ratingDistribution].sort((a, b) => a.score - b.score).map(d => ({ score: `${d.score}★`, count: d.count })) : [],
    [overallStats]);

  const trendData = useMemo(() =>
    overallStats ? overallStats.monthlyTrend.map(m => ({ month: m.month, count: m.count })) : [],
    [overallStats]);

  const rankingList = (items2: { nameVi: string; nameEn: string; averageScore: number; evaluationCount: number }[], color: string) =>
    items2.map((x, i) => (
      <div key={`${x.nameVi}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 6, background: i % 2 === 0 ? 'white' : '#FAFBFD' }}>
        <span style={{ width: 20, height: 20, borderRadius: '50%', background: `${color}15`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0F3D5E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lang === 'vi' ? x.nameVi : x.nameEn}</div>
          <div style={{ fontSize: 10, color: '#5d7a8c' }}>{x.evaluationCount} {lang === 'vi' ? 'lượt đánh giá' : 'reviews'}</div>
        </div>
        <span style={{ fontSize: 13, fontWeight: 800, color }}>{x.averageScore.toFixed(1)}</span>
      </div>
    ));

  return (
    <div style={{ padding: 'clamp(12px, 3vw, 24px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
        <div>
          <h1 style={{ color: '#0F3D5E', margin: '0 0 4px', fontSize: 'clamp(18px, 4vw, 22px)', fontFamily: 'Merriweather, serif' }}>
            {lang === 'vi' ? 'Đánh giá & Phản hồi' : 'Evaluations & Feedback'}
          </h1>
          <p style={{ color: '#5d7a8c', fontSize: 13, margin: 0 }}>
            {lang === 'vi' ? 'Quản lý đánh giá từ khách tham quan về di tích và di sản phi vật thể' : 'Manage visitor reviews of relics and intangible heritage'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={exportExcel}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: '#27AE60', border: 'none', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
          >
            <Download size={14} /> {lang === 'vi' ? 'Xuất Excel' : 'Export Excel'}
          </button>
          <button
            onClick={() => setShowStats(s => !s)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: showStats ? '#0F3D5E' : 'white', border: '1.5px solid #0F3D5E', color: showStats ? 'white' : '#0F3D5E', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
          >
            <TrendingUp size={14} /> {lang === 'vi' ? 'Thống kê' : 'Statistics'}
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10, marginBottom: 16 }}>
        {cards.map(c => (
          <div key={c.label} style={{ background: 'white', borderRadius: 10, padding: '14px', boxShadow: '0 2px 8px rgba(15,61,94,0.06)', border: `1px solid ${c.color}18`, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: `${c.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color }}>{c.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: c.color, lineHeight: 1 }}>{c.value}</div>
            <div style={{ fontSize: 11, color: '#5d7a8c', fontWeight: 500 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Statistics panel */}
      {showStats && overallStats && (
        <div style={{ background: 'white', borderRadius: 10, boxShadow: '0 2px 8px rgba(15,61,94,0.06)', padding: '16px', marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0F3D5E', marginBottom: 14 }}>
            {lang === 'vi' ? 'Thống kê đánh giá (đã duyệt)' : 'Evaluation statistics (approved)'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="admin-dashboard-grid">
            <div style={{ background: '#F8FAFC', borderRadius: 8, padding: '14px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0F3D5E', marginBottom: 10 }}>
                {lang === 'vi' ? 'Phân bố số sao' : 'Rating distribution'}
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={distributionData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5EAF0" />
                  <XAxis dataKey="score" tick={{ fontSize: 11, fill: '#5d7a8c' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#5d7a8c' }} allowDecimals={false} />
                  <Tooltip cursor={{ fill: 'rgba(15,61,94,0.05)' }} />
                  <Bar dataKey="count" fill="#D4A017" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ background: '#F8FAFC', borderRadius: 8, padding: '14px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0F3D5E', marginBottom: 10 }}>
                {lang === 'vi' ? 'Đánh giá theo tháng' : 'Monthly evaluations'}
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={trendData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5EAF0" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#5d7a8c' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#5d7a8c' }} allowDecimals={false} />
                  <Tooltip cursor={{ stroke: 'rgba(15,61,94,0.2)' }} />
                  <Line type="monotone" dataKey="count" stroke="#0F3D5E" strokeWidth={2} dot={{ r: 3, fill: '#0F3D5E' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 16 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0F3D5E', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <TrendingUp size={13} style={{ color: '#27AE60' }} /> {lang === 'vi' ? 'Được đánh giá nhiều nhất' : 'Most reviewed'}
              </div>
              {rankingList(overallStats.topHeritages, '#27AE60')}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0F3D5E', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <TrendingDown size={13} style={{ color: '#E74C3C' }} /> {lang === 'vi' ? 'Điểm thấp nhất' : 'Lowest rated'}
              </div>
              {rankingList(overallStats.lowestHeritages, '#E74C3C')}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0F3D5E', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Star size={13} style={{ color: '#D4A017' }} /> {lang === 'vi' ? 'Phi vật thể nổi bật' : 'Top intangible'}
              </div>
              {rankingList(overallStats.topIntangible, '#D4A017')}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0F3D5E', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Award size={13} style={{ color: '#1A5276' }} /> {lang === 'vi' ? 'Phi vật thể thấp nhất' : 'Lowest intangible'}
              </div>
              {rankingList(overallStats.lowestIntangible, '#1A5276')}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ background: 'white', borderRadius: 10, boxShadow: '0 1px 6px rgba(15,61,94,0.06)', padding: '14px 16px', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 320 }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#5d7a8c' }} />
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
              placeholder={lang === 'vi' ? 'Tìm theo di tích, người đánh giá, nội dung...' : 'Search by heritage, reviewer, content...'}
              style={{ ...inputStyle, width: '100%', paddingLeft: 32 }}
            />
          </div>
          <button onClick={handleSearch} style={{ padding: '8px 14px', borderRadius: 6, background: '#0F3D5E', border: 'none', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            {t('common.search')}
          </button>
          <button onClick={handleReset} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(15,61,94,0.15)', background: 'white', color: '#5d7a8c', fontSize: 12, cursor: 'pointer' }}>
            <RefreshCw size={12} /> {lang === 'vi' ? 'Đặt lại' : 'Reset'}
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
          <Filter size={13} style={{ color: '#5d7a8c' }} />
          <select value={heritageId ? `${targetType}:${heritageId}` : ''} onChange={e => handleHeritageFilter(e.target.value)} style={{ ...inputStyle, background: 'white', cursor: 'pointer', maxWidth: 260 }}>
            <option value="">{lang === 'vi' ? 'Tất cả di tích' : 'All heritage'}</option>
            {heritageOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={rating} onChange={e => { setRating(e.target.value); setPage(1); }} style={{ ...inputStyle, background: 'white', cursor: 'pointer' }}>
            <option value="">{lang === 'vi' ? 'Sao' : 'Rating'}</option>
            {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} ★</option>)}
          </select>
          <select value={satisfactionFilter} onChange={e => { setSatisfactionFilter(e.target.value); setPage(1); }} style={{ ...inputStyle, background: 'white', cursor: 'pointer' }}>
            <option value="">{lang === 'vi' ? 'Mức hài lòng' : 'Satisfaction'}</option>
            {SATISFACTION_OPTIONS.map(o => <option key={o.value} value={o.value}>{lang === 'vi' ? o.labelVi : o.labelEn}</option>)}
          </select>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} style={{ ...inputStyle, background: 'white', cursor: 'pointer' }}>
            <option value="">{lang === 'vi' ? 'Trạng thái' : 'Status'}</option>
            <option value="pending">{lang === 'vi' ? 'Chờ duyệt' : 'Pending'}</option>
            <option value="approved">{lang === 'vi' ? 'Đã duyệt' : 'Approved'}</option>
            <option value="rejected">{lang === 'vi' ? 'Từ chối' : 'Rejected'}</option>
          </select>
          <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} title={lang === 'vi' ? 'Từ ngày' : 'From'} style={{ ...inputStyle, width: 'auto', background: 'white' }} />
          <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} title={lang === 'vi' ? 'Đến ngày' : 'To'} style={{ ...inputStyle, width: 'auto', background: 'white' }} />
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ ...inputStyle, background: 'white', cursor: 'pointer' }}>
              <option value="createdAt">{lang === 'vi' ? 'Ngày' : 'Date'}</option>
              <option value="score">{lang === 'vi' ? 'Sao' : 'Rating'}</option>
              <option value="status">{lang === 'vi' ? 'Trạng thái' : 'Status'}</option>
            </select>
            <select value={sortDir} onChange={e => setSortDir(e.target.value as 'asc' | 'desc')} style={{ ...inputStyle, background: 'white', cursor: 'pointer' }}>
              <option value="desc">{lang === 'vi' ? 'Giảm dần' : 'Desc'}</option>
              <option value="asc">{lang === 'vi' ? 'Tăng dần' : 'Asc'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 6px rgba(15,61,94,0.06)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr style={{ background: '#0F3D5E' }}>
                {[
                  lang === 'vi' ? 'Di tích' : 'Heritage',
                  lang === 'vi' ? 'Loại' : 'Type',
                  lang === 'vi' ? 'Sao' : 'Stars',
                  lang === 'vi' ? 'Mức hài lòng' : 'Satisfaction',
                  lang === 'vi' ? 'Người đánh giá' : 'Reviewer',
                  lang === 'vi' ? 'Ngày' : 'Date',
                  lang === 'vi' ? 'Trạng thái' : 'Status',
                  lang === 'vi' ? 'Thao tác' : 'Actions',
                ].map(h => (
                  <th key={h} style={{ padding: '12px 14px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.8)', textAlign: 'left', textTransform: 'uppercase', letterSpacing: 0.4, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: '#5d7a8c', fontSize: 13 }}>{t('common.loading')}</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: '#5d7a8c', fontSize: 13 }}>{t('common.nodata')}</td></tr>
              ) : items.map((item, i) => {
                const st = statusStyle(item.status, lang);
                const satisfaction = satisfactionLabel(item.satisfactionLevel, lang);
                return (
                  <tr key={item.id} style={{ background: i % 2 === 0 ? 'white' : '#FAFBFD', borderBottom: '1px solid rgba(15,61,94,0.04)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = '#EBF5FB'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = i % 2 === 0 ? 'white' : '#FAFBFD'; }}>
                    <td style={{ padding: '12px 14px', fontSize: 12, fontWeight: 600, color: '#0F3D5E', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {lang === 'vi' ? (item.heritageNameVi || item.targetId || '—') : (item.heritageNameEn || item.targetId || '—')}
                      {item.title && (
                        <div style={{ fontSize: 10, color: '#5d7a8c', fontWeight: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700, background: item.targetType === 'heritage' ? 'rgba(15,61,94,0.1)' : 'rgba(212,160,23,0.15)', color: item.targetType === 'heritage' ? '#0F3D5E' : '#B8860B' }}>
                        {item.targetType === 'heritage' ? (lang === 'vi' ? 'Di tích' : 'Relic') : item.targetType === 'intangible' ? (lang === 'vi' ? 'Phi vật thể' : 'Intangible') : (lang === 'vi' ? 'Dịch vụ' : 'Service')}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <StarRating value={item.score} size={12} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#1a2332' }}>{item.score}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 11, color: '#5d7a8c', whiteSpace: 'nowrap' }}>{satisfaction}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#1a2332' }}>{item.reviewerName || (lang === 'vi' ? 'Ẩn danh' : 'Anonymous')}</div>
                      {item.email && <div style={{ fontSize: 10, color: '#5d7a8c' }}>{item.email}</div>}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 11, color: '#5d7a8c', whiteSpace: 'nowrap' }}>{formatDateTime(item.createdAt, lang)}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ padding: '3px 9px', borderRadius: 10, fontSize: 10, fontWeight: 700, background: st.bg, color: st.color, whiteSpace: 'nowrap' }}>{st.label}</span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => viewDetail(item.id)} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(15,61,94,0.15)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F3D5E' }} title={lang === 'vi' ? 'Xem chi tiết' : 'View detail'}><Eye size={12} /></button>
                        {item.status !== 'approved' && (
                          <button onClick={() => handleApprove(item.id)} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(39,174,96,0.25)', background: '#EAF9F0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#27AE60' }} title={lang === 'vi' ? 'Duyệt' : 'Approve'}><Check size={12} /></button>
                        )}
                        {item.status !== 'rejected' && (
                          <button onClick={() => handleReject(item.id)} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(243,156,18,0.25)', background: '#FEF9E7', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F39C12' }} title={lang === 'vi' ? 'Từ chối' : 'Reject'}><X size={12} /></button>
                        )}
                        <button onClick={() => viewDetail(item.id)} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(15,61,94,0.15)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1A5276' }} title={lang === 'vi' ? 'Phản hồi' : 'Reply'}><MessageSquare size={12} /></button>
                        <button onClick={() => handleDelete(item.id)} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(231,76,60,0.2)', background: '#FDEDEC', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E74C3C' }} title={lang === 'vi' ? 'Xóa' : 'Delete'}><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(15,61,94,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#5d7a8c' }}>
              {lang === 'vi' ? `Hiển thị ${startItem}–${endItem} trong ${totalRecords}` : `Showing ${startItem}–${endItem} of ${totalRecords}`}
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(15,61,94,0.15)', background: page === 1 ? '#F0F4F8' : 'white', cursor: page === 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: page === 1 ? '#cbced4' : '#0F3D5E' }}>
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid', borderColor: page === p ? '#0F3D5E' : 'rgba(15,61,94,0.15)', background: page === p ? '#0F3D5E' : 'white', color: page === p ? 'white' : '#5d7a8c', cursor: 'pointer', fontSize: 12, fontWeight: page === p ? 700 : 400 }}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(15,61,94,0.15)', background: page === totalPages ? '#F0F4F8' : 'white', cursor: page === totalPages ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: page === totalPages ? '#cbced4' : '#0F3D5E' }}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {detail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500 }}
          onClick={() => setDetail(null)}>
          <div style={{ background: 'white', borderRadius: 12, width: '95%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding: '14px 20px', background: '#0F3D5E', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 1 }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>
                {lang === 'vi' ? 'Chi tiết đánh giá' : 'Evaluation detail'} #{detail.id}
              </span>
              <button onClick={() => setDetail(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>

            {loadingDetail ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#5d7a8c', fontSize: 13 }}>{t('common.loading')}</div>
            ) : (
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0F3D5E' }}>
                    {lang === 'vi' ? (detail.heritageNameVi || detail.targetId || '—') : (detail.heritageNameEn || detail.targetId || '—')}
                  </div>
                  {(() => { const st = statusStyle(detail.status, lang); return (
                    <span style={{ padding: '3px 9px', borderRadius: 10, fontSize: 10, fontWeight: 700, background: st.bg, color: st.color }}>{st.label}</span>
                  ); })()}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                  <div style={{ padding: '10px', background: '#F8FAFC', borderRadius: 8 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#5d7a8c', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 4 }}>{lang === 'vi' ? 'Sao' : 'Rating'}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><StarRating value={detail.score} size={14} /><span style={{ fontSize: 14, fontWeight: 700, color: '#1a2332' }}>{detail.score}/5</span></div>
                  </div>
                  <div style={{ padding: '10px', background: '#F8FAFC', borderRadius: 8 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#5d7a8c', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 4 }}>{lang === 'vi' ? 'Mức độ hài lòng' : 'Satisfaction'}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1a2332' }}>{satisfactionLabel(detail.satisfactionLevel, lang)}</div>
                  </div>
                  <div style={{ padding: '10px', background: '#F8FAFC', borderRadius: 8 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#5d7a8c', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 4 }}>{lang === 'vi' ? 'Người đánh giá' : 'Reviewer'}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1a2332' }}>{detail.reviewerName || (lang === 'vi' ? 'Ẩn danh' : 'Anonymous')}</div>
                    {detail.email && <div style={{ fontSize: 11, color: '#5d7a8c' }}>{detail.email}</div>}
                  </div>
                  <div style={{ padding: '10px', background: '#F8FAFC', borderRadius: 8 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#5d7a8c', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 4 }}>{lang === 'vi' ? 'Ngày gửi' : 'Submitted'}</div>
                    <div style={{ fontSize: 13, color: '#1a2332' }}>{formatDateTime(detail.createdAt, lang)}</div>
                  </div>
                </div>

                {detail.title && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#5d7a8c', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 4 }}>{lang === 'vi' ? 'Tiêu đề' : 'Title'}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1a2332' }}>{detail.title}</div>
                  </div>
                )}
                {detail.comment && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#5d7a8c', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 4 }}>{lang === 'vi' ? 'Nội dung' : 'Comment'}</div>
                    <div style={{ fontSize: 13, color: '#1a2332', lineHeight: 1.7, whiteSpace: 'pre-line', background: '#F8FAFC', padding: '10px', borderRadius: 8 }}>{detail.comment}</div>
                  </div>
                )}

                {/* Reply */}
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(15,61,94,0.1)' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0F3D5E', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MessageSquare size={13} style={{ color: '#D4A017' }} />
                    {lang === 'vi' ? 'Phản hồi của ban quản lý' : 'Management reply'}
                  </div>
                  {detail.adminReply && replyId === null && (
                    <div style={{ marginBottom: 10, padding: '10px 12px', background: '#EBF5FB', borderRadius: 8, borderLeft: '3px solid #0F3D5E' }}>
                      <div style={{ fontSize: 12, color: '#1a2332', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{detail.adminReply}</div>
                    </div>
                  )}
                  {replyId === detail.id ? (
                    <>
                      <textarea
                        rows={3}
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        maxLength={1000}
                        placeholder={lang === 'vi' ? 'Nhập phản hồi công khai...' : 'Enter a public reply...'}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid rgba(15,61,94,0.15)', fontSize: 13, background: '#F8FAFC', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                      />
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <button onClick={handleReply} disabled={replying}
                          style={{ padding: '8px 18px', borderRadius: 6, background: replying ? '#94a3b8' : '#0F3D5E', border: 'none', color: 'white', fontSize: 12, fontWeight: 600, cursor: replying ? 'not-allowed' : 'pointer' }}>
                          {replying ? '...' : (lang === 'vi' ? 'Lưu phản hồi' : 'Save reply')}
                        </button>
                        <button onClick={() => { setReplyId(null); setReplyText(detail.adminReply || ''); }}
                          style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid rgba(15,61,94,0.15)', background: 'white', color: '#5d7a8c', fontSize: 12, cursor: 'pointer' }}>
                          {lang === 'vi' ? 'Hủy' : 'Cancel'}
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={() => setReplyId(detail.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 6, background: '#EBF5FB', border: '1px solid rgba(15,61,94,0.2)', color: '#0F3D5E', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                    >
                      <MessageSquare size={12} />
                      {detail.adminReply ? (lang === 'vi' ? 'Sửa phản hồi' : 'Edit reply') : (lang === 'vi' ? 'Viết phản hồi' : 'Write reply')}
                    </button>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                  {detail.status !== 'approved' && (
                    <button onClick={() => handleApprove(detail.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 6, background: '#27AE60', border: 'none', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                      <Check size={13} /> {lang === 'vi' ? 'Duyệt' : 'Approve'}
                    </button>
                  )}
                  {detail.status !== 'rejected' && (
                    <button onClick={() => handleReject(detail.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 6, background: '#F39C12', border: 'none', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                      <X size={13} /> {lang === 'vi' ? 'Từ chối' : 'Reject'}
                    </button>
                  )}
                  <button onClick={() => handleDelete(detail.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 6, background: '#E74C3C', border: 'none', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    <Trash2 size={13} /> {lang === 'vi' ? 'Xóa' : 'Delete'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 700,
          padding: '12px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
          background: toast.type === 'success' ? '#27AE60' : '#E74C3C', color: 'white',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        }}>
          {toast.msg}
        </div>
      )}
      <style>{`
        @media (max-width: 900px) {
          .admin-dashboard-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
