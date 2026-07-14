import { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { apiGet } from '../services/api';
import {
  Search, Filter, ChevronLeft, ChevronRight, LogIn, LogOut, Plus, Pencil, Trash2, Upload, X, RefreshCw, Clock
} from 'lucide-react';
import { AdminTableSkeleton } from './Skeleton';

interface LogEntry {
  logId: number;
  userId: number;
  username: string;
  roleName: string;
  action: string;
  entityName: string;
  entityId: number | null;
  description: string;
  ipAddress: string;
  createdAt: string;
}

const actionIcons: Record<string, JSX.Element> = {
  LOGIN: <LogIn size={13} />,
  LOGOUT: <LogOut size={13} />,
  CREATE: <Plus size={13} />,
  UPDATE: <Pencil size={13} />,
  DELETE: <Trash2 size={13} />,
};

const actionColors: Record<string, string> = {
  LOGIN: '#1A5276',
  LOGOUT: '#7F8C8D',
  CREATE: '#27AE60',
  UPDATE: '#D4A017',
  DELETE: '#E74C3C',
};

export function ActivityLogPage() {
  const { lang, t } = useLanguage();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [userFilter, setUserFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const PER_PAGE = 15;

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(PER_PAGE));
      if (userFilter) params.set('user', userFilter);
      if (actionFilter) params.set('action', actionFilter);
      if (dateFrom) params.set('fromDate', new Date(dateFrom).toISOString());
      if (dateTo) params.set('toDate', new Date(dateTo + 'T23:59:59').toISOString());
      const result = await apiGet<any>(`/activity-logs?${params.toString()}`);
      setLogs(result.data || []);
      setTotalRecords(result.totalRecords || 0);
      setTotalPages(result.totalPages || 0);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    loadLogs();
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const entityLabel = (name: string) => {
    const labels: Record<string, { vi: string; en: string }> = {
      Heritage: { vi: 'Di tích', en: 'Heritage' },
      IntangibleHeritage: { vi: 'Di sản phi vật thể', en: 'Intangible Heritage' },
      HeritageImages: { vi: 'Hình ảnh', en: 'Image' },
      HeritageVideos: { vi: 'Video', en: 'Video' },
      HeritageDocuments: { vi: 'Tài liệu', en: 'Document' },
      AboutPage: { vi: 'Trang giới thiệu', en: 'About Page' },
      User: { vi: 'Người dùng', en: 'User' },
    };
    return labels[name]?.[lang] ?? name;
  };

  return (
    <div style={{ padding: '24px', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ color: '#0F3D5E', margin: 0, fontSize: 20, fontFamily: 'Merriweather, serif' }}>
            {t('admin.activity_logs')}
          </h1>
          <p style={{ color: '#5d7a8c', fontSize: 12, margin: '4px 0 0' }}>
            {lang === 'vi' ? `Tổng cộng ${totalRecords} bản ghi` : `Total ${totalRecords} records`}
          </p>
        </div>
        <button onClick={loadLogs} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8,
          border: '1px solid rgba(15,61,94,0.15)', background: 'white', color: '#0F3D5E', fontSize: 12, fontWeight: 600, cursor: 'pointer',
        }}><RefreshCw size={14} /> {lang === 'vi' ? 'Làm mới' : 'Refresh'}</button>
      </div>

      <div style={{
        background: 'white', borderRadius: 10, padding: '14px 16px', marginBottom: 16,
        display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
        boxShadow: '0 1px 6px rgba(15,61,94,0.06)',
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 150 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#5d7a8c' }} />
          <input value={userFilter} onChange={e => setUserFilter(e.target.value)}
            placeholder={lang === 'vi' ? 'Tìm theo người dùng...' : 'Search by user...'}
            style={{
              width: '100%', padding: '8px 8px 8px 32px', borderRadius: 6,
              border: '1px solid rgba(15,61,94,0.15)', fontSize: 12, background: '#F0F4F8', outline: 'none', boxSizing: 'border-box',
            }} />
        </div>
        <select value={actionFilter} onChange={e => setActionFilter(e.target.value)}
          style={{
            padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(15,61,94,0.15)', fontSize: 12,
            background: 'white', cursor: 'pointer', outline: 'none',
          }}>
          <option value="">{lang === 'vi' ? 'Tất cả hành động' : 'All Actions'}</option>
          <option value="LOGIN">LOGIN</option>
          <option value="LOGOUT">LOGOUT</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
        </select>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
          style={{
            padding: '7px 10px', borderRadius: 6, border: '1px solid rgba(15,61,94,0.15)', fontSize: 12, background: 'white', outline: 'none',
          }} />
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
          style={{
            padding: '7px 10px', borderRadius: 6, border: '1px solid rgba(15,61,94,0.15)', fontSize: 12, background: 'white', outline: 'none',
          }} />
        <button onClick={handleSearch} style={{
          padding: '8px 20px', borderRadius: 6, background: '#0F3D5E', border: 'none',
          color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer',
        }}>{lang === 'vi' ? 'Lọc' : 'Filter'}</button>
      </div>

      <div style={{ background: 'white', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 6px rgba(15,61,94,0.06)' }}>
        {loading ? (
          <AdminTableSkeleton rowCount={8} columnCount={6} />
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0F3D5E' }}>
                {[
                  lang === 'vi' ? 'Thời gian' : 'Time',
                  lang === 'vi' ? 'Người dùng' : 'User',
                  lang === 'vi' ? 'Vai trò' : 'Role',
                  lang === 'vi' ? 'Hành động' : 'Action',
                  lang === 'vi' ? 'Đối tượng' : 'Target',
                  lang === 'vi' ? 'Mô tả' : 'Description',
                  'IP',
                ].map(h => (
                  <th key={h} style={{ padding: '10px 12px', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.8)', textAlign: 'left', textTransform: 'uppercase', letterSpacing: 0.4, whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr key={log.logId} style={{ background: i % 2 === 0 ? 'white' : '#FAFBFD', borderBottom: '1px solid rgba(15,61,94,0.04)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = '#EBF5FB'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = i % 2 === 0 ? 'white' : '#FAFBFD'; }}
                >
                  <td style={{ padding: '10px 12px', fontSize: 11, color: '#5d7a8c', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} /> {formatTime(log.createdAt)}
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600, color: '#0F3D5E' }}>{log.username}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{
                      padding: '2px 7px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                      background: log.roleName === 'ADMIN' ? '#FDEDEC' : '#EBF5FB',
                      color: log.roleName === 'ADMIN' ? '#E74C3C' : '#1A5276',
                    }}>{log.roleName}</span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                      background: `${actionColors[log.action] || '#5d7a8c'}15`,
                      color: actionColors[log.action] || '#5d7a8c',
                    }}>
                      {actionIcons[log.action] || <X size={13} />}
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: 11, color: '#5d7a8c' }}>
                    {entityLabel(log.entityName)}
                    {log.entityId ? ` #${log.entityId}` : ''}
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: 11, color: '#5d7a8c', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {log.description || '-'}
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: 10, color: '#cbced4', fontFamily: 'monospace' }}>{log.ipAddress || '-'}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#5d7a8c', fontSize: 13 }}>
                  {lang === 'vi' ? 'Không có bản ghi nào' : 'No log records found'}
                </td></tr>
              )}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(15,61,94,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#5d7a8c' }}>
              {lang === 'vi' ? `Hiển thị ${(page-1)*PER_PAGE+1}–${Math.min(page*PER_PAGE, totalRecords)} trong ${totalRecords}` : `Showing ${(page-1)*PER_PAGE+1}–${Math.min(page*PER_PAGE, totalRecords)} of ${totalRecords}`}
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(15,61,94,0.15)', background: page === 1 ? '#F0F4F8' : 'white', cursor: page === 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: page === 1 ? '#cbced4' : '#0F3D5E' }}>
                <ChevronLeft size={14} />
              </button>
              <span style={{ fontSize: 12, color: '#5d7a8c', padding: '0 8px', display: 'flex', alignItems: 'center' }}>{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}
                style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(15,61,94,0.15)', background: page === totalPages ? '#F0F4F8' : 'white', cursor: page === totalPages ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: page === totalPages ? '#cbced4' : '#0F3D5E' }}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}