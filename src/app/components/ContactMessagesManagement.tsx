import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from './LanguageContext';
import { apiGet, apiPost, apiDelete } from '../services/api';
import { Check, AlertTriangle, Search, Eye, Trash2, X, Mail, MailOpen, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface ContactMessageListItem {
  id: number;
  fullName: string;
  email: string;
  subject: string | null;
  createdAt: string;
  isRead: boolean;
  readAt: string | null;
}

interface ContactMessageDetail {
  id: number;
  fullName: string;
  email: string;
  subject: string | null;
  message: string;
  createdAt: string;
  isRead: boolean;
  readAt: string | null;
  ipAddress: string | null;
  userAgent: string | null;
}

interface PagedResult<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export function ContactMessagesManagement() {
  const { lang, t } = useLanguage();
  const [messages, setMessages] = useState<ContactMessageListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [detailItem, setDetailItem] = useState<ContactMessageDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiPost<PagedResult<ContactMessageListItem>>('/contact-messages/search', {
        page,
        pageSize,
        search: search || undefined,
        status: statusFilter || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      setMessages(result.data || []);
      setTotalRecords(result.totalRecords);
      setTotalPages(result.totalPages);
    } catch {
      showToast(lang === 'vi' ? 'Không thể tải dữ liệu' : 'Failed to load messages', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, statusFilter, dateFrom, dateTo, lang]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const handleReset = () => {
    setSearchInput('');
    setSearch('');
    setStatusFilter('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
    setSelectedIds([]);
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === messages.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(messages.map(m => m.id));
    }
  };

  const viewDetail = async (id: number) => {
    setLoadingDetail(true);
    try {
      const data = await apiGet<ContactMessageDetail>(`/contact-messages/${id}`);
      setDetailItem(data);
      await fetchMessages();
    } catch {
      showToast(lang === 'vi' ? 'Không thể tải chi tiết' : 'Failed to load detail', 'error');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleBulkMarkRead = async () => {
    if (selectedIds.length === 0) {
      showToast(lang === 'vi' ? 'Chọn tin nhắn để đánh dấu' : 'Select messages to mark as read', 'error');
      return;
    }
    try {
      await apiPost('/contact-messages/bulk-mark-read', { ids: selectedIds });
      showToast(lang === 'vi' ? `Đã đánh dấu ${selectedIds.length} tin nhắn` : `${selectedIds.length} message(s) marked as read`);
      setSelectedIds([]);
      await fetchMessages();
    } catch {
      showToast(lang === 'vi' ? 'Thao tác thất bại' : 'Operation failed', 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      showToast(lang === 'vi' ? 'Chọn tin nhắn để xóa' : 'Select messages to delete', 'error');
      return;
    }
    if (!confirm(lang === 'vi'
      ? `Xóa ${selectedIds.length} tin nhắn đã chọn?`
      : `Delete ${selectedIds.length} selected message(s)?`)) return;
    try {
      await apiPost('/contact-messages/bulk-delete', { ids: selectedIds });
      showToast(lang === 'vi' ? `Đã xóa ${selectedIds.length} tin nhắn` : `${selectedIds.length} message(s) deleted`);
      setSelectedIds([]);
      await fetchMessages();
    } catch {
      showToast(lang === 'vi' ? 'Xóa thất bại' : 'Delete failed', 'error');
    }
  };

  const handleSingleDelete = async (id: number) => {
    if (!confirm(lang === 'vi' ? 'Xóa tin nhắn này?' : 'Delete this message?')) return;
    try {
      await apiDelete(`/contact-messages/${id}`);
      showToast(lang === 'vi' ? 'Đã xóa' : 'Message deleted');
      await fetchMessages();
    } catch {
      showToast(lang === 'vi' ? 'Xóa thất bại' : 'Delete failed', 'error');
    }
  };

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalRecords);

  const inputStyle = {
    padding: '8px 10px', borderRadius: 6,
    border: '1.5px solid rgba(15,61,94,0.15)', fontSize: 12,
    background: '#F8FAFC', outline: 'none',
  };

  const filterBtnStyle = (active: boolean) => ({
    padding: '6px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer',
    border: active ? '1px solid #0F3D5E' : '1px solid rgba(15,61,94,0.12)',
    background: active ? '#0F3D5E' : 'white',
    color: active ? 'white' : '#5d7a8c',
  });

  return (
    <div style={{ padding: '24px', position: 'relative' }}>
      {toast && (
        <div style={{
          position: 'fixed', top: 80, right: 24, zIndex: 1000, padding: '12px 16px', borderRadius: 8,
          background: toast.type === 'success' ? '#EAFAF1' : '#FDEDEC',
          border: `1px solid ${toast.type === 'success' ? '#27AE60' : '#E74C3C'}`,
          color: toast.type === 'success' ? '#27AE60' : '#E74C3C',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600,
        }}>
          {toast.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
          {toast.msg}
        </div>
      )}

      <h1 style={{ color: '#0F3D5E', margin: '0 0 4px', fontSize: 20, fontFamily: 'Merriweather, serif' }}>
        {lang === 'vi' ? 'Tin nhắn liên hệ' : 'Contact Messages'}
      </h1>
      <p style={{ color: '#5d7a8c', fontSize: 12, margin: '0 0 20px' }}>
        {lang === 'vi' ? 'Quản lý tin nhắn từ khách truy cập' : 'Manage messages from visitors'}
      </p>

      {/* Filters */}
      <div style={{ background: 'white', borderRadius: 10, padding: '16px', boxShadow: '0 1px 6px rgba(15,61,94,0.06)', marginBottom: 16 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 160 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#5d7a8c' }} />
            <input
              style={{ ...inputStyle, width: '100%', paddingLeft: 30 }}
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
              placeholder={lang === 'vi' ? 'Tìm tên, email, chủ đề...' : 'Search name, email, subject...'}
            />
          </div>

          <select style={inputStyle} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">{lang === 'vi' ? 'Tất cả trạng thái' : 'All Status'}</option>
            <option value="unread">{lang === 'vi' ? 'Chưa đọc' : 'Unread'}</option>
            <option value="read">{lang === 'vi' ? 'Đã đọc' : 'Read'}</option>
          </select>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={13} style={{ color: '#5d7a8c' }} />
            <input type="date" style={inputStyle} value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} />
            <span style={{ color: '#5d7a8c', fontSize: 11 }}>—</span>
            <input type="date" style={inputStyle} value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} />
          </div>

          <button onClick={handleSearch} style={filterBtnStyle(true)}>
            <Search size={12} style={{ marginRight: 4 }} /> {t('common.search')}
          </button>
          <button onClick={handleReset} style={filterBtnStyle(false)}>
            <X size={12} style={{ marginRight: 4 }} /> {lang === 'vi' ? 'Đặt lại' : 'Reset'}
          </button>
        </div>

        {/* Bulk actions */}
        {selectedIds.length > 0 && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(15,61,94,0.08)', display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#5d7a8c' }}>
              {lang === 'vi' ? `Đã chọn ${selectedIds.length} tin nhắn` : `${selectedIds.length} message(s) selected`}
            </span>
            <button onClick={handleBulkMarkRead} style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 6,
              background: '#EBF5FB', border: '1px solid #0F3D5E', color: '#0F3D5E', fontSize: 11, fontWeight: 600, cursor: 'pointer',
            }}>
              <MailOpen size={13} /> {lang === 'vi' ? 'Đánh dấu đã đọc' : 'Mark as Read'}
            </button>
            <button onClick={handleBulkDelete} style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 6,
              background: '#FDEDEC', border: '1px solid #E74C3C', color: '#E74C3C', fontSize: 11, fontWeight: 600, cursor: 'pointer',
            }}>
              <Trash2 size={13} /> {lang === 'vi' ? 'Xóa đã chọn' : 'Delete Selected'}
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: 10, boxShadow: '0 1px 6px rgba(15,61,94,0.06)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#5d7a8c', fontSize: 13 }}>
            {lang === 'vi' ? 'Đang tải...' : 'Loading...'}
          </div>
        ) : messages.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#5d7a8c', fontSize: 13 }}>
            {lang === 'vi' ? 'Không có tin nhắn nào' : 'No messages yet'}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 650 }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid rgba(15,61,94,0.08)' }}>
                  <th style={{ width: 36, padding: '10px 8px' }}>
                    <input type="checkbox" checked={selectedIds.length === messages.length && messages.length > 0}
                      onChange={toggleSelectAll} style={{ cursor: 'pointer' }} />
                  </th>
                  <th style={{ padding: '10px 12px', fontSize: 11, fontWeight: 700, color: '#5d7a8c', textTransform: 'uppercase', textAlign: 'left', width: 40 }}>#</th>
                  <th style={{ padding: '10px 12px', fontSize: 11, fontWeight: 700, color: '#5d7a8c', textTransform: 'uppercase', textAlign: 'left' }}>
                    {lang === 'vi' ? 'Họ tên' : 'Full Name'}
                  </th>
                  <th style={{ padding: '10px 12px', fontSize: 11, fontWeight: 700, color: '#5d7a8c', textTransform: 'uppercase', textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '10px 12px', fontSize: 11, fontWeight: 700, color: '#5d7a8c', textTransform: 'uppercase', textAlign: 'left' }}>
                    {lang === 'vi' ? 'Chủ đề' : 'Subject'}
                  </th>
                  <th style={{ padding: '10px 12px', fontSize: 11, fontWeight: 700, color: '#5d7a8c', textTransform: 'uppercase', textAlign: 'left', width: 140 }}>
                    {lang === 'vi' ? 'Ngày gửi' : 'Submitted At'}
                  </th>
                  <th style={{ padding: '10px 12px', fontSize: 11, fontWeight: 700, color: '#5d7a8c', textTransform: 'uppercase', textAlign: 'center', width: 80 }}>
                    {lang === 'vi' ? 'Trạng thái' : 'Status'}
                  </th>
                  <th style={{ padding: '10px 12px', fontSize: 11, fontWeight: 700, color: '#5d7a8c', textTransform: 'uppercase', textAlign: 'center', width: 100 }}>
                    {lang === 'vi' ? 'Thao tác' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg, idx) => (
                  <tr key={msg.id} style={{
                    borderBottom: '1px solid rgba(15,61,94,0.05)',
                    background: !msg.isRead ? '#F0F8FF' : 'transparent',
                    fontWeight: !msg.isRead ? 600 : 400,
                  }}>
                    <td style={{ padding: '10px 8px' }}>
                      <input type="checkbox" checked={selectedIds.includes(msg.id)}
                        onChange={() => toggleSelect(msg.id)} style={{ cursor: 'pointer' }} />
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: 12, color: '#5d7a8c' }}>{startItem + idx}</td>
                    <td style={{ padding: '10px 12px', fontSize: 13, color: '#0F3D5E' }}>
                      <span style={{ opacity: msg.isRead ? 0.7 : 1 }}>{msg.fullName}</span>
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: 12, color: '#5d7a8c' }}>{msg.email}</td>
                    <td style={{ padding: '10px 12px', fontSize: 12, color: '#1a2332', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <span style={{ opacity: msg.isRead ? 0.7 : 1 }}>{msg.subject || '—'}</span>
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: 11, color: '#5d7a8c', whiteSpace: 'nowrap' }}>
                      {new Date(msg.createdAt).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', {
                        year: 'numeric', month: '2-digit', day: '2-digit',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 3,
                        padding: '3px 10px', borderRadius: 10, fontSize: 10, fontWeight: 700,
                        background: msg.isRead ? '#F0F4F8' : '#EBF5FB',
                        color: msg.isRead ? '#5d7a8c' : '#0F3D5E',
                      }}>
                        {msg.isRead ? <MailOpen size={11} /> : <Mail size={11} />}
                        {msg.isRead
                          ? (lang === 'vi' ? 'Đã đọc' : 'Read')
                          : (lang === 'vi' ? 'Chưa đọc' : 'Unread')}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                        <button onClick={() => viewDetail(msg.id)}
                          style={{ ...actionBtnStyle, color: '#0F3D5E' }} title={lang === 'vi' ? 'Xem' : 'View'}>
                          <Eye size={14} />
                        </button>
                        <button onClick={() => handleSingleDelete(msg.id)}
                          style={{ ...actionBtnStyle, color: '#E74C3C' }} title={lang === 'vi' ? 'Xóa' : 'Delete'}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            padding: '12px 16px', borderTop: '1px solid rgba(15,61,94,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 11, color: '#5d7a8c' }}>
              {lang === 'vi'
                ? `Hiển thị ${startItem}-${endItem} của ${totalRecords} mục`
                : `Showing ${startItem}-${endItem} of ${totalRecords} items`}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                style={{
                  padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(15,61,94,0.12)',
                  background: page <= 1 ? '#F0F4F8' : 'white',
                  color: page <= 1 ? '#ccc' : '#0F3D5E',
                  cursor: page <= 1 ? 'not-allowed' : 'pointer', fontSize: 11,
                  display: 'flex', alignItems: 'center', gap: 2,
                }}>
                <ChevronLeft size={12} /> {lang === 'vi' ? 'Trước' : 'Prev'}
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <button key={pageNum} onClick={() => setPage(pageNum)}
                    style={{
                      width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(15,61,94,0.12)',
                      background: page === pageNum ? '#0F3D5E' : 'white',
                      color: page === pageNum ? 'white' : '#5d7a8c',
                      cursor: 'pointer', fontSize: 11, fontWeight: page === pageNum ? 700 : 400,
                    }}>
                    {pageNum}
                  </button>
                );
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                style={{
                  padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(15,61,94,0.12)',
                  background: page >= totalPages ? '#F0F4F8' : 'white',
                  color: page >= totalPages ? '#ccc' : '#0F3D5E',
                  cursor: page >= totalPages ? 'not-allowed' : 'pointer', fontSize: 11,
                  display: 'flex', alignItems: 'center', gap: 2,
                }}>
                {lang === 'vi' ? 'Sau' : 'Next'} <ChevronRight size={12} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detailItem && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }} onClick={() => setDetailItem(null)}>
          <div style={{
            background: 'white', borderRadius: 12, maxWidth: 600, width: '100%',
            maxHeight: '90vh', overflow: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid rgba(15,61,94,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <h2 style={{ margin: 0, fontSize: 16, color: '#0F3D5E', fontFamily: 'Merriweather, serif' }}>
                {lang === 'vi' ? 'Chi tiết tin nhắn' : 'Message Details'}
              </h2>
              <button onClick={() => setDetailItem(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5d7a8c', padding: 4 }}>
                <X size={18} />
              </button>
            </div>
            {loadingDetail ? (
              <div style={{ padding: 32, textAlign: 'center', color: '#5d7a8c', fontSize: 13 }}>
                {lang === 'vi' ? 'Đang tải...' : 'Loading...'}
              </div>
            ) : (
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'grid', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 700, color: '#5d7a8c', textTransform: 'uppercase', letterSpacing: 0.3, display: 'block', marginBottom: 2 }}>
                      {lang === 'vi' ? 'Họ tên' : 'Full Name'}
                    </label>
                    <div style={{ fontSize: 14, color: '#0F3D5E', fontWeight: 600 }}>{detailItem.fullName}</div>
                  </div>
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 700, color: '#5d7a8c', textTransform: 'uppercase', letterSpacing: 0.3, display: 'block', marginBottom: 2 }}>Email</label>
                    <div style={{ fontSize: 13, color: '#0F3D5E' }}>{detailItem.email}</div>
                  </div>
                  {detailItem.subject && (
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#5d7a8c', textTransform: 'uppercase', letterSpacing: 0.3, display: 'block', marginBottom: 2 }}>
                        {lang === 'vi' ? 'Chủ đề' : 'Subject'}
                      </label>
                      <div style={{ fontSize: 13, color: '#0F3D5E' }}>{detailItem.subject}</div>
                    </div>
                  )}
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 700, color: '#5d7a8c', textTransform: 'uppercase', letterSpacing: 0.3, display: 'block', marginBottom: 2 }}>
                      {lang === 'vi' ? 'Nội dung' : 'Message'}
                    </label>
                    <div style={{ fontSize: 13, color: '#1a2332', lineHeight: 1.6, whiteSpace: 'pre-wrap', background: '#F8FAFC', padding: 12, borderRadius: 8, border: '1px solid rgba(15,61,94,0.08)' }}>
                      {detailItem.message}
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#5d7a8c', textTransform: 'uppercase', letterSpacing: 0.3, display: 'block', marginBottom: 2 }}>
                        {lang === 'vi' ? 'Ngày gửi' : 'Submitted At'}
                      </label>
                      <div style={{ fontSize: 12, color: '#1a2332' }}>
                        {new Date(detailItem.createdAt).toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US')}
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#5d7a8c', textTransform: 'uppercase', letterSpacing: 0.3, display: 'block', marginBottom: 2 }}>
                        {lang === 'vi' ? 'Trạng thái' : 'Status'}
                      </label>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 3,
                        padding: '2px 8px', borderRadius: 8, fontSize: 10, fontWeight: 700,
                        background: detailItem.isRead ? '#F0F4F8' : '#EBF5FB',
                        color: detailItem.isRead ? '#5d7a8c' : '#0F3D5E',
                      }}>
                        {detailItem.isRead
                          ? (lang === 'vi' ? 'Đã đọc' : 'Read')
                          : (lang === 'vi' ? 'Chưa đọc' : 'Unread')}
                      </span>
                    </div>
                  </div>
                  {detailItem.ipAddress && (
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#5d7a8c', textTransform: 'uppercase', letterSpacing: 0.3, display: 'block', marginBottom: 2 }}>
                        IP Address
                      </label>
                      <div style={{ fontSize: 12, color: '#5d7a8c', fontFamily: 'monospace' }}>{detailItem.ipAddress}</div>
                    </div>
                  )}
                  {detailItem.userAgent && (
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#5d7a8c', textTransform: 'uppercase', letterSpacing: 0.3, display: 'block', marginBottom: 2 }}>
                        User Agent
                      </label>
                      <div style={{ fontSize: 11, color: '#5d7a8c', wordBreak: 'break-all', lineHeight: 1.4 }}>{detailItem.userAgent}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const actionBtnStyle = {
  width: 30, height: 30, borderRadius: 6,
  border: '1px solid rgba(15,61,94,0.1)', background: 'white',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', fontSize: 12, transition: 'all 0.15s',
} as const;
