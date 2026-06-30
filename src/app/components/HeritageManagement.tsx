import { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { heritageSites, classificationLabels, typeLabels, statusLabels, HeritageSite, Classification, HeritageType, HeritageStatus } from './data';
import { classificationColors, statusColors } from '../constants';
import {
  Plus, Search, Filter, Eye, Pencil, Trash2, X, Upload, QrCode,
  ChevronLeft, ChevronRight, MapPin, Check, AlertTriangle
} from 'lucide-react';

interface HeritageManagementProps {
  onNavigate?: (page: string, id?: string) => void;
}

type FormMode = 'add' | 'edit' | null;

export function HeritageManagement({ onNavigate }: HeritageManagementProps) {
  const { lang, t } = useLanguage();
  const [sites, setSites] = useState<HeritageSite[]>(heritageSites);
  const [search, setSearch] = useState('');
  const [filterCls, setFilterCls] = useState<Classification | 'all'>('all');
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [editSite, setEditSite] = useState<HeritageSite | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const PER_PAGE = 6;

  const filtered = sites.filter(s => {
    const matchSearch = !search || s.nameVi.toLowerCase().includes(search.toLowerCase()) || s.nameEn.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase());
    const matchCls = filterCls === 'all' || s.classification === filterCls;
    return matchSearch && matchCls;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = (id: string) => {
    setSites(prev => prev.filter(s => s.id !== id));
    setDeleteId(null);
    showToast(lang === 'vi' ? 'Đã xóa di tích thành công' : 'Heritage site deleted successfully');
  };

  const openEdit = (site: HeritageSite) => {
    setEditSite({ ...site });
    setFormMode('edit');
  };

  const openAdd = () => {
    setEditSite({
      id: `h${String(Date.now()).slice(-4)}`,
      code: `VĐHN-DT-${String(sites.length + 1).padStart(3, '0')}`,
      nameVi: '', nameEn: '', type: 'dinh', classification: 'unranked',
      status: 'active', addressVi: '', addressEn: '',
      lat: 20.752, lon: 105.852,
      descriptionVi: '', descriptionEn: '',
      historyVi: '', historyEn: '',
      image: 'https://images.unsplash.com/photo-1571842533456-9b0d746c5a9b?w=800&h=500&fit=crop&auto=format',
      images: [],
      updatedAt: new Date().toISOString().slice(0, 10),
      yearBuilt: '', guardian: '',
    });
    setFormMode('add');
  };

  const handleSave = () => {
    if (!editSite?.nameVi) {
      showToast(lang === 'vi' ? 'Vui lòng nhập tên di tích' : 'Please enter heritage name', 'error');
      return;
    }
    if (formMode === 'add') {
      setSites(prev => [...prev, { ...editSite!, updatedAt: new Date().toISOString().slice(0, 10) }]);
      showToast(lang === 'vi' ? 'Đã thêm di tích mới thành công' : 'New heritage site added successfully');
    } else {
      setSites(prev => prev.map(s => s.id === editSite!.id ? { ...editSite!, updatedAt: new Date().toISOString().slice(0, 10) } : s));
      showToast(lang === 'vi' ? 'Đã cập nhật di tích thành công' : 'Heritage site updated successfully');
    }
    setFormMode(null);
    setEditSite(null);
  };

  const inputStyle = {
    width: '100%', padding: '9px 12px', borderRadius: 6,
    border: '1.5px solid rgba(15,61,94,0.15)', fontSize: 13,
    background: '#F8FAFC', outline: 'none', boxSizing: 'border-box' as const,
  };

  return (
    <div style={{ padding: '24px', position: 'relative' }}>
      {/* Toast */}
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

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ color: '#0F3D5E', margin: 0, fontSize: 20, fontFamily: 'Merriweather, serif' }}>
            {t('admin.heritage_mgmt')}
          </h1>
          <p style={{ color: '#5d7a8c', fontSize: 12, margin: '4px 0 0' }}>
            {lang === 'vi' ? `Tổng cộng ${filtered.length} di tích` : `Total ${filtered.length} heritage sites`}
          </p>
        </div>
        <button
          onClick={openAdd}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 18px', borderRadius: 8,
            background: '#0F3D5E', border: 'none', color: 'white',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(15,61,94,0.25)',
          }}
        >
          <Plus size={16} /> {t('hm.add')}
        </button>
      </div>

      {/* Filters bar */}
      <div style={{
        background: 'white', borderRadius: 10, padding: '14px 16px', marginBottom: 16,
        display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
        boxShadow: '0 1px 6px rgba(15,61,94,0.06)',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#5d7a8c' }} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder={t('hm.search')}
            style={{ ...inputStyle, paddingLeft: 32, background: '#F0F4F8' }}
          />
        </div>

        {/* Classification filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Filter size={13} style={{ color: '#5d7a8c' }} />
          <select
            value={filterCls}
            onChange={e => { setFilterCls(e.target.value as Classification | 'all'); setPage(1); }}
            style={{ ...inputStyle, width: 'auto', background: 'white', cursor: 'pointer' }}
          >
            <option value="all">{t('common.all')}</option>
            <option value="national">{t('map.national')}</option>
            <option value="city">{t('map.city')}</option>
            <option value="unranked">{t('map.unranked')}</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 6px rgba(15,61,94,0.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#0F3D5E' }}>
              {[t('hm.id'), t('hm.name'), t('hm.classification'), t('hm.type'), t('hm.status'), t('hm.updated'), t('hm.actions')].map(h => (
                <th key={h} style={{ padding: '12px 14px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.8)', textAlign: 'left', textTransform: 'uppercase', letterSpacing: 0.4, whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((site, i) => (
              <tr key={site.id} style={{ background: i % 2 === 0 ? 'white' : '#FAFBFD', borderBottom: '1px solid rgba(15,61,94,0.04)', transition: 'background 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = '#EBF5FB'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = i % 2 === 0 ? 'white' : '#FAFBFD'; }}
              >
                <td style={{ padding: '12px 14px', fontSize: 11, color: '#5d7a8c', fontWeight: 600 }}>{site.code}</td>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <img src={site.image} alt="" style={{ width: 36, height: 28, borderRadius: 4, objectFit: 'cover' }} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#0F3D5E' }}>{lang === 'vi' ? site.nameVi : site.nameEn}</div>
                      <div style={{ fontSize: 10, color: '#5d7a8c', display: 'flex', alignItems: 'center', gap: 2 }}>
                        <MapPin size={9} /> {lang === 'vi' ? 'Vân Đình, Ứng Hòa' : 'Van Dinh, Ung Hoa'}
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px 14px' }}>
<span style={{
                     padding: '3px 8px', borderRadius: 8, fontSize: 10, fontWeight: 700,
                     background: `${classificationColors[site.classification]}15`,
                     color: classificationColors[site.classification],
                   }}>
                    {classificationLabels[site.classification][lang]}
                  </span>
                </td>
                <td style={{ padding: '12px 14px', fontSize: 12, color: '#5d7a8c' }}>
                  {typeLabels[site.type][lang]}
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: statusColors[site.status], fontWeight: 600 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColors[site.status], display: 'inline-block' }} />
                    {statusLabels[site.status][lang]}
                  </span>
                </td>
                <td style={{ padding: '12px 14px', fontSize: 11, color: '#5d7a8c' }}>{site.updatedAt}</td>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => onNavigate?.('heritage-detail', site.id)}
                      style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(15,61,94,0.15)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F3D5E' }}
                      title={t('hm.view')}
                    >
                      <Eye size={12} />
                    </button>
                    <button onClick={() => openEdit(site)}
                      style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(15,61,94,0.15)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4A017' }}
                      title={t('hm.edit')}
                    >
                      <Pencil size={12} />
                    </button>
                    <button onClick={() => setDeleteId(site.id)}
                      style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(231,76,60,0.2)', background: '#FDEDEC', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E74C3C' }}
                      title={t('hm.delete')}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#5d7a8c', fontSize: 13 }}>
                  {t('common.nodata')}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
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

      {/* Add/Edit Modal */}
      {formMode && editSite && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500 }}
          onClick={() => { setFormMode(null); setEditSite(null); }}>
          <div style={{
            background: 'white', borderRadius: 12, width: '90%', maxWidth: 680, maxHeight: '90vh',
            overflow: 'hidden', display: 'flex', flexDirection: 'column',
            boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
          }} onClick={e => e.stopPropagation()}>
            {/* Modal header */}
            <div style={{ padding: '16px 20px', background: '#0F3D5E', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>
                {formMode === 'add' ? t('hm.add') : t('hm.edit')}
              </span>
              <button onClick={() => { setFormMode(null); setEditSite(null); }}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {/* Form content */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {/* Code */}
                <div style={{ gridColumn: '1' }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>{t('detail.code')}</label>
                  <input style={inputStyle} value={editSite.code} onChange={e => setEditSite(s => s ? { ...s, code: e.target.value } : s)} />
                </div>

                {/* Year built */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>{lang === 'vi' ? 'Năm xây dựng' : 'Year Built'}</label>
                  <input style={inputStyle} value={editSite.yearBuilt} onChange={e => setEditSite(s => s ? { ...s, yearBuilt: e.target.value } : s)} />
                </div>

                {/* Name VI */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>{lang === 'vi' ? 'Tên di tích (VI)' : 'Heritage Name (VI)'} *</label>
                  <input style={inputStyle} value={editSite.nameVi} onChange={e => setEditSite(s => s ? { ...s, nameVi: e.target.value } : s)} />
                </div>

                {/* Name EN */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>{lang === 'vi' ? 'Tên di tích (EN)' : 'Heritage Name (EN)'}</label>
                  <input style={inputStyle} value={editSite.nameEn} onChange={e => setEditSite(s => s ? { ...s, nameEn: e.target.value } : s)} />
                </div>

                {/* Type */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>{t('hm.type')}</label>
                  <select style={{ ...inputStyle, background: 'white', cursor: 'pointer' }} value={editSite.type}
                    onChange={e => setEditSite(s => s ? { ...s, type: e.target.value as HeritageType } : s)}>
                    {(Object.keys(typeLabels) as HeritageType[]).map(type => (
                      <option key={type} value={type}>{typeLabels[type][lang]}</option>
                    ))}
                  </select>
                </div>

                {/* Classification */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>{t('hm.classification')}</label>
                  <select style={{ ...inputStyle, background: 'white', cursor: 'pointer' }} value={editSite.classification}
                    onChange={e => setEditSite(s => s ? { ...s, classification: e.target.value as Classification } : s)}>
                    <option value="national">{classificationLabels.national[lang]}</option>
                    <option value="city">{classificationLabels.city[lang]}</option>
                    <option value="unranked">{classificationLabels.unranked[lang]}</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>{t('hm.status')}</label>
                  <select style={{ ...inputStyle, background: 'white', cursor: 'pointer' }} value={editSite.status}
                    onChange={e => setEditSite(s => s ? { ...s, status: e.target.value as HeritageStatus } : s)}>
                    <option value="active">{statusLabels.active[lang]}</option>
                    <option value="maintenance">{statusLabels.maintenance[lang]}</option>
                    <option value="closed">{statusLabels.closed[lang]}</option>
                  </select>
                </div>

                {/* Lat */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>{t('common.latitude')}</label>
                  <input style={inputStyle} type="number" step="0.0001" value={editSite.lat} onChange={e => setEditSite(s => s ? { ...s, lat: parseFloat(e.target.value) || 0 } : s)} />
                </div>

                {/* Lon */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>{t('common.longitude')}</label>
                  <input style={inputStyle} type="number" step="0.0001" value={editSite.lon} onChange={e => setEditSite(s => s ? { ...s, lon: parseFloat(e.target.value) || 0 } : s)} />
                </div>

                {/* Address VI */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>{t('common.address')} (VI)</label>
                  <input style={inputStyle} value={editSite.addressVi} onChange={e => setEditSite(s => s ? { ...s, addressVi: e.target.value } : s)} />
                </div>

                {/* Description VI */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>{t('common.description')} (VI)</label>
                  <textarea
                    style={{ ...inputStyle, resize: 'vertical', minHeight: 72 }}
                    value={editSite.descriptionVi}
                    onChange={e => setEditSite(s => s ? { ...s, descriptionVi: e.target.value } : s)}
                  />
                </div>

                {/* Upload image placeholder */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>{t('common.upload_image')}</label>
                  <div style={{
                    border: '2px dashed rgba(15,61,94,0.2)', borderRadius: 8, padding: '20px',
                    textAlign: 'center', background: '#F8FAFC', cursor: 'pointer',
                  }}>
                    <Upload size={24} style={{ color: '#5d7a8c', marginBottom: 6 }} />
                    <p style={{ fontSize: 12, color: '#5d7a8c', margin: 0 }}>
                      {lang === 'vi' ? 'Kéo thả ảnh hoặc nhấn để chọn' : 'Drag & drop images or click to browse'}
                    </p>
                    <p style={{ fontSize: 10, color: '#cbced4', margin: '4px 0 0' }}>PNG, JPG, WebP — tối đa 5MB</p>
                  </div>
                </div>

                {/* QR code preview */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px', background: '#EBF5FB', borderRadius: 8 }}>
                    <QrCode size={20} style={{ color: '#0F3D5E' }} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#0F3D5E' }}>{t('common.gen_qr')}</div>
                      <div style={{ fontSize: 11, color: '#5d7a8c' }}>
                        {lang === 'vi' ? 'Mã QR sẽ được tự động tạo khi lưu' : 'QR code will be auto-generated on save'}
                      </div>
                    </div>
                    <span style={{ marginLeft: 'auto', padding: '3px 8px', borderRadius: 4, background: '#27AE60', color: 'white', fontSize: 10, fontWeight: 700 }}>
                      {lang === 'vi' ? 'Tự động' : 'Auto'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(15,61,94,0.1)', display: 'flex', justifyContent: 'flex-end', gap: 10, background: '#F8FAFC' }}>
              <button onClick={() => { setFormMode(null); setEditSite(null); }}
                style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid rgba(15,61,94,0.2)', background: 'white', color: '#5d7a8c', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                {t('common.cancel')}
              </button>
              <button onClick={handleSave}
                style={{ padding: '9px 20px', borderRadius: 8, background: '#0F3D5E', border: 'none', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(15,61,94,0.3)' }}>
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 600 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: '28px', maxWidth: 360, width: '90%', textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#FDEDEC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#E74C3C' }}>
              <Trash2 size={24} />
            </div>
            <h3 style={{ color: '#0F3D5E', fontSize: 16, marginBottom: 8 }}>
              {lang === 'vi' ? 'Xác nhận xóa' : 'Confirm Delete'}
            </h3>
            <p style={{ color: '#5d7a8c', fontSize: 13, marginBottom: 20 }}>
              {lang === 'vi' ? 'Bạn có chắc chắn muốn xóa di tích này? Hành động này không thể hoàn tác.' : 'Are you sure you want to delete this heritage site? This action cannot be undone.'}
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setDeleteId(null)} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid rgba(15,61,94,0.2)', background: 'white', color: '#5d7a8c', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                {t('common.cancel')}
              </button>
              <button onClick={() => handleDelete(deleteId)} style={{ padding: '9px 20px', borderRadius: 8, background: '#E74C3C', border: 'none', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                {t('hm.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
