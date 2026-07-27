import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';
import { useLanguage } from './LanguageContext';
import { apiGet, apiPost, apiPut, apiDelete } from '../services/api';
import type { HeritageCategory, HeritageType } from '../../core/types';
import {
  Plus, Search, Pencil, Trash2, X, Check, AlertTriangle,
  ChevronLeft, ChevronRight, LayoutList
} from 'lucide-react';
import { AdminTableSkeleton } from './Skeleton';
import { ConfirmDialog } from './ConfirmDialog';
import { LazyImage } from './LazyImage';
import { getIconUrl } from '../heritageIcons';
import { typeLabels } from '../../data/labels';

type FormMode = 'add' | 'edit' | null;

interface HeritageCategoriesManagementProps {
  onDirtyChange?: (dirty: boolean) => void;
}

export function HeritageCategoriesManagement({ onDirtyChange }: HeritageCategoriesManagementProps) {
  const { lang, t } = useLanguage();
  const [items, setItems] = useState<HeritageCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [editItem, setEditItem] = useState<Partial<HeritageCategory> | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const cleanSnapshotRef = useRef<string | null>(null);
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);
  const pendingCloseRef = useRef<(() => void) | null>(null);

  const isDirty = useMemo(() => {
    if (!formMode || !editItem || !cleanSnapshotRef.current) return false;
    const current = JSON.stringify({ editItem });
    return current !== cleanSnapshotRef.current;
  }, [formMode, editItem]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const closeForm = useCallback(() => {
    if (!formMode) return;
    const doClose = () => {
      setFormMode(null);
      setEditItem(null);
      cleanSnapshotRef.current = null;
    };
    if (isDirty) {
      pendingCloseRef.current = doClose;
      setShowUnsavedConfirm(true);
    } else {
      doClose();
    }
  }, [formMode, isDirty]);

  const PER_PAGE = 10;

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await apiGet<HeritageCategory[]>('/heritage-categories');
      setItems(Array.isArray(data) ? data : []);
    } catch {
      showToast(lang === 'vi' ? 'Không thể tải danh mục' : 'Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = items.filter(item =>
    !search || item.nameVi.toLowerCase().includes(search.toLowerCase()) || item.nameEn.toLowerCase().includes(search.toLowerCase()) || item.code.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const openAdd = () => {
    const item = { code: '', nameVi: '', nameEn: '', iconUrl: '' };
    setEditItem(item);
    setFormMode('add');
    cleanSnapshotRef.current = JSON.stringify({ editItem: item });
  };

  const openEdit = (item: HeritageCategory) => {
    const itemCopy = { ...item };
    setEditItem(itemCopy);
    setFormMode('edit');
    cleanSnapshotRef.current = JSON.stringify({ editItem: itemCopy });
  };

  const handleSave = async () => {
    if (!editItem?.code || !editItem?.nameVi || !editItem?.nameEn) {
      showToast(lang === 'vi' ? 'Vui lòng nhập đầy đủ thông tin' : 'Please fill all required fields', 'error');
      return;
    }
    try {
      if (formMode === 'add') {
        await apiPost('/heritage-categories', editItem);
        showToast(lang === 'vi' ? 'Đã thêm danh mục' : 'Category added');
      } else {
        await apiPut(`/heritage-categories/${editItem.categoryId}`, editItem);
        showToast(lang === 'vi' ? 'Đã cập nhật danh mục' : 'Category updated');
      }
      setFormMode(null);
      setEditItem(null);
      cleanSnapshotRef.current = null;
      fetchData();
    } catch (e: any) {
      showToast(e.message || (lang === 'vi' ? 'Lỗi khi lưu' : 'Save failed'), 'error');
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await apiDelete(`/heritage-categories/${deleteId}`);
      showToast(lang === 'vi' ? 'Đã xóa danh mục' : 'Category deleted');
      setDeleteId(null);
      fetchData();
    } catch (e: any) {
      showToast(e.message || (lang === 'vi' ? 'Không thể xóa danh mục này vì đang có di tích tham chiếu' : 'Cannot delete category - it is referenced by heritage sites'), 'error');
      setDeleteId(null);
    }
  };

  const inputStyle = {
    width: '100%', padding: '9px 12px', borderRadius: 6,
    border: '1.5px solid rgba(15,61,94,0.15)', fontSize: 13,
    background: '#F8FAFC', outline: 'none', boxSizing: 'border-box' as const,
  };

  return (
    <div style={{ padding: '24px', position: 'relative' }}>
      {toast && (
        <div style={{
          position: 'fixed', top: 80, right: 24, zIndex: 1000,
          padding: '12px 16px', borderRadius: 8,
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ color: '#0F3D5E', margin: 0, fontSize: 20, fontFamily: 'Merriweather, serif' }}>{t('admin.categories')}</h1>
          <p style={{ color: '#5d7a8c', fontSize: 12, margin: '4px 0 0' }}>
            {lang === 'vi' ? `Tổng cộng ${items.length} danh mục` : `Total ${items.length} categories`}
          </p>
        </div>
        <button onClick={openAdd} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 8,
          background: '#0F3D5E', border: 'none', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(15,61,94,0.25)',
        }}>
          <Plus size={16} /> {lang === 'vi' ? 'Thêm danh mục' : 'Add Category'}
        </button>
      </div>

      <div className="hcm-filters" style={{
        background: 'white', borderRadius: 10, padding: '14px 16px', marginBottom: 16,
        display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
        boxShadow: '0 1px 6px rgba(15,61,94,0.06)',
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#5d7a8c' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder={lang === 'vi' ? 'Tìm kiếm danh mục...' : 'Search categories...'}
            style={{ ...inputStyle, paddingLeft: 32, background: '#F0F4F8' }} />
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 6px rgba(15,61,94,0.06)' }}>
        {loading ? (
          <AdminTableSkeleton rowCount={6} columnCount={6} />
        ) : (
          <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
            <thead>
              <tr style={{ background: '#0F3D5E' }}>
                {['ID', lang === 'vi' ? 'Mã' : 'Code', lang === 'vi' ? 'Tên (VI)' : 'Name (VI)', lang === 'vi' ? 'Tên (EN)' : 'Name (EN)', lang === 'vi' ? 'Icon' : 'Icon', lang === 'vi' ? 'Thao tác' : 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.8)', textAlign: 'left', textTransform: 'uppercase', letterSpacing: 0.4, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((item, i) => (
                <tr key={item.categoryId} style={{ background: i % 2 === 0 ? 'white' : '#FAFBFD', borderBottom: '1px solid rgba(15,61,94,0.04)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = '#EBF5FB'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = i % 2 === 0 ? 'white' : '#FAFBFD'; }}>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: '#5d7a8c', fontWeight: 600 }}>{item.categoryId}</td>
                  <td style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#0F3D5E' }}>{item.code}</td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: '#1a2332' }}>{typeLabels[item.code as HeritageType]?.vi ?? item.nameVi}</td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: '#5d7a8c' }}>{item.nameEn}</td>
                  <td style={{ padding: '12px 14px', fontSize: 18 }}><LazyImage src={getIconUrl(item.code as HeritageType)} alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} /></td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => openEdit(item)}
                        style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(15,61,94,0.15)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4A017' }}
                        title={t('hm.edit')}><Pencil size={12} /></button>
                      <button onClick={() => setDeleteId(item.categoryId)}
                        style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(231,76,60,0.2)', background: '#FDEDEC', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E74C3C' }}
                        title={t('hm.delete')}><Trash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#5d7a8c', fontSize: 13 }}>
                  <LayoutList size={24} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.4 }} />
                  {lang === 'vi' ? 'Không tìm thấy danh mục nào' : 'No categories found'}</td></tr>
              )}
            </tbody>
          </table>
          </div>
        )}
        {totalPages > 1 && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(15,61,94,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#5d7a8c' }}>
              {lang === 'vi' ? `Hiển thị ${(page-1)*PER_PAGE+1}–${Math.min(page*PER_PAGE, filtered.length)} trong ${filtered.length}` : `Showing ${(page-1)*PER_PAGE+1}–${Math.min(page*PER_PAGE, filtered.length)} of ${filtered.length}`}
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(15,61,94,0.15)', background: page === 1 ? '#F0F4F8' : 'white', cursor: page === 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: page === 1 ? '#cbced4' : '#0F3D5E' }}>
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid', borderColor: page === p ? '#0F3D5E' : 'rgba(15,61,94,0.15)', background: page === p ? '#0F3D5E' : 'white', color: page === p ? 'white' : '#5d7a8c', cursor: 'pointer', fontSize: 12, fontWeight: page === p ? 700 : 400 }}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}
                style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(15,61,94,0.15)', background: page === totalPages ? '#F0F4F8' : 'white', cursor: page === totalPages ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: page === totalPages ? '#cbced4' : '#0F3D5E' }}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {formMode && editItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500 }}
          onClick={closeForm}>
          <div style={{ background: 'white', borderRadius: 12, width: '90%', maxWidth: 480, boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '16px 20px', background: '#0F3D5E', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>
                {formMode === 'add' ? (lang === 'vi' ? 'Thêm danh mục' : 'Add Category') : (lang === 'vi' ? 'Chỉnh sửa danh mục' : 'Edit Category')}
              </span>
              <button onClick={closeForm}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>{lang === 'vi' ? 'Mã danh mục' : 'Category Code'} *</label>
                <input style={inputStyle} value={editItem.code || ''} onChange={e => setEditItem(s => s ? { ...s, code: e.target.value } : s)} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>{lang === 'vi' ? 'Tên (Tiếng Việt)' : 'Name (Vietnamese)'} *</label>
                <input style={inputStyle} value={editItem.nameVi || ''} onChange={e => setEditItem(s => s ? { ...s, nameVi: e.target.value } : s)} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>{lang === 'vi' ? 'Tên (Tiếng Anh)' : 'Name (English)'} *</label>
                <input style={inputStyle} value={editItem.nameEn || ''} onChange={e => setEditItem(s => s ? { ...s, nameEn: e.target.value } : s)} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>{lang === 'vi' ? 'Icon URL' : 'Icon URL'}</label>
                <input style={inputStyle} value={editItem.iconUrl || ''} placeholder="https://..." onChange={e => setEditItem(s => s ? { ...s, iconUrl: e.target.value } : s)} />
              </div>
            </div>
            <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(15,61,94,0.1)', display: 'flex', justifyContent: 'flex-end', gap: 10, background: '#F8FAFC' }}>
              <button onClick={closeForm}
                style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid rgba(15,61,94,0.2)', background: 'white', color: '#5d7a8c', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                {t('common.cancel')}</button>
              <button onClick={handleSave}
                style={{ padding: '9px 20px', borderRadius: 8, background: '#0F3D5E', border: 'none', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(15,61,94,0.3)' }}>
                {t('common.save')}</button>
            </div>
          </div>
        </div>
      )}

      {showUnsavedConfirm && (
        <ConfirmDialog
          message={lang === 'vi' ? 'Bạn có thay đổi chưa lưu. Hủy bỏ chúng?' : 'You have unsaved changes. Discard them?'}
          onConfirm={() => {
            setShowUnsavedConfirm(false);
            pendingCloseRef.current?.();
            pendingCloseRef.current = null;
          }}
          onCancel={() => {
            setShowUnsavedConfirm(false);
            pendingCloseRef.current = null;
          }}
          confirmLabel={lang === 'vi' ? 'Hủy bỏ' : 'Discard'}
          cancelLabel={lang === 'vi' ? 'Tiếp tục' : 'Keep editing'}
        />
      )}

      {deleteId !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 600 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: '28px', maxWidth: 360, width: '90%', textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#FDEDEC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#E74C3C' }}>
              <Trash2 size={24} />
            </div>
            <h3 style={{ color: '#0F3D5E', fontSize: 16, marginBottom: 8 }}>{lang === 'vi' ? 'Xác nhận xóa' : 'Confirm Delete'}</h3>
            <p style={{ color: '#5d7a8c', fontSize: 13, marginBottom: 20 }}>
              {lang === 'vi' ? 'Bạn có chắc chắn muốn xóa danh mục này?' : 'Are you sure you want to delete this category?'}
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setDeleteId(null)} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid rgba(15,61,94,0.2)', background: 'white', color: '#5d7a8c', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                {t('common.cancel')}</button>
              <button onClick={handleDelete} style={{ padding: '9px 20px', borderRadius: 8, background: '#E74C3C', border: 'none', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                {t('hm.delete')}</button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @media (max-width: 767px) {
          .hcm-filters {
            flex-direction: column !important;
          }
          .hcm-filters > div {
            width: 100% !important;
            min-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
