import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';
import { useLanguage } from './LanguageContext';
import { apiGet, apiPost, apiPut, apiDelete } from '../services/api';
import {
  Plus, Search, Pencil, Trash2, X, Check, AlertTriangle, Key, ToggleLeft, ToggleRight,
  ChevronLeft, ChevronRight, Users as UsersIcon, Eye, EyeOff
} from 'lucide-react';
import { AdminTableSkeleton } from './Skeleton';
import { ConfirmDialog } from './ConfirmDialog';

interface UserDto {
  userId: number;
  username: string;
  fullName: string | null;
  email: string | null;
  roleName: string;
  status: boolean;
  createdAt: string;
}

type FormMode = 'add' | 'edit' | null;

interface UserManagementProps {
  onDirtyChange?: (dirty: boolean) => void;
}

export function UserManagement({ onDirtyChange }: UserManagementProps) {
  const { lang, t } = useLanguage();
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [editUser, setEditUser] = useState<Partial<UserDto> | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [resetPwId, setResetPwId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [page, setPage] = useState(1);
  const cleanSnapshotRef = useRef<string | null>(null);
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);
  const pendingCloseRef = useRef<(() => void) | null>(null);

  const isDirty = useMemo(() => {
    if (!formMode || !editUser || !cleanSnapshotRef.current) return false;
    const current = JSON.stringify({ editUser });
    return current !== cleanSnapshotRef.current;
  }, [formMode, editUser]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const closeForm = useCallback(() => {
    if (!formMode) return;
    const doClose = () => {
      setFormMode(null);
      setEditUser(null);
      setFormErrors({});
      cleanSnapshotRef.current = null;
    };
    if (isDirty) {
      pendingCloseRef.current = doClose;
      setShowUnsavedConfirm(true);
    } else {
      doClose();
    }
  }, [formMode, isDirty]);

  const PER_PAGE = 8;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiGet<any>('/users');
      const list: UserDto[] = data.data || data;
      setUsers(Array.isArray(list) ? list : []);
    } catch {
      showToast(lang === 'vi' ? 'Không thể tải danh sách người dùng' : 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.username.toLowerCase().includes(q) || (u.fullName ?? '').toLowerCase().includes(q) || (u.email ?? '').toLowerCase().includes(q);
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openAdd = () => {
    const user = { username: '', password: '', fullName: '', email: '', roleName: 'MANAGER' };
    setEditUser(user);
    setFormErrors({});
    setFormMode('add');
    cleanSnapshotRef.current = JSON.stringify({ editUser: user });
  };

  const openEdit = (user: UserDto) => {
    const userCopy = { userId: user.userId, username: user.username, fullName: user.fullName, email: user.email, roleName: user.roleName, status: user.status };
    setEditUser(userCopy);
    setFormErrors({});
    setFormMode('edit');
    cleanSnapshotRef.current = JSON.stringify({ editUser: userCopy });
  };

  const validateUserForm = (isCreate: boolean): boolean => {
    const errors: Record<string, string> = {};
    if (!editUser) return false;
    if (!editUser.username?.trim()) errors.username = lang === 'vi' ? 'Tên đăng nhập là bắt buộc' : 'Username is required';
    else if (editUser.username.trim().length < 4 || editUser.username.trim().length > 30) errors.username = lang === 'vi' ? 'Từ 4-30 ký tự' : '4-30 characters';
    else if (!/^[a-zA-Z0-9_]+$/.test(editUser.username.trim())) errors.username = lang === 'vi' ? 'Chỉ chấp nhận chữ, số, dấu gạch dưới' : 'Only letters, numbers, underscores';
    if (isCreate && !editUser.password) errors.password = lang === 'vi' ? 'Mật khẩu là bắt buộc' : 'Password is required';
    else if (isCreate && editUser.password.length < 6) errors.password = lang === 'vi' ? 'Tối thiểu 6 ký tự' : 'Minimum 6 characters';
    if (!editUser.fullName?.trim()) errors.fullName = lang === 'vi' ? 'Họ tên là bắt buộc' : 'Full name is required';
    else if (editUser.fullName.trim().length < 5 || editUser.fullName.trim().length > 100) errors.fullName = lang === 'vi' ? 'Từ 5-100 ký tự' : '5-100 characters';
    if (!editUser.email?.trim()) errors.email = lang === 'vi' ? 'Email là bắt buộc' : 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editUser.email.trim())) errors.email = lang === 'vi' ? 'Email không hợp lệ' : 'Invalid email';
    if (!editUser.roleName || !['ADMIN', 'MANAGER'].includes(editUser.roleName)) errors.roleName = lang === 'vi' ? 'Vai trò phải là ADMIN hoặc MANAGER' : 'Role must be ADMIN or MANAGER';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async () => {
    if (!editUser) return;
    setFormErrors({});
    if (!validateUserForm(true)) return;
    try {
      await apiPost('/users', {
        username: editUser.username?.trim(),
        password: editUser.password,
        roleName: editUser.roleName || 'MANAGER',
        fullName: editUser.fullName?.trim() || null,
        email: editUser.email?.trim() || null,
      });
      showToast(lang === 'vi' ? 'Đã tạo người dùng thành công' : 'User created successfully');
      setFormMode(null);
      setEditUser(null);
      setFormErrors({});
      cleanSnapshotRef.current = null;
      fetchUsers();
    } catch (e: any) {
      showToast(e.message || (lang === 'vi' ? 'Tạo người dùng thất bại' : 'Failed to create user'), 'error');
    }
  };

  const handleUpdate = async () => {
    if (!editUser?.userId) return;
    setFormErrors({});
    if (!validateUserForm(false)) return;
    try {
      await apiPut(`/users/${editUser.userId}`, {
        roleName: editUser.roleName,
        fullName: editUser.fullName?.trim() || null,
        email: editUser.email?.trim() || null,
        status: editUser.status ?? true,
      });
      showToast(lang === 'vi' ? 'Đã cập nhật người dùng thành công' : 'User updated successfully');
      setFormMode(null);
      setEditUser(null);
      setFormErrors({});
      cleanSnapshotRef.current = null;
      fetchUsers();
    } catch (e: any) {
      showToast(e.message || (lang === 'vi' ? 'Cập nhật thất bại' : 'Failed to update user'), 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await apiDelete(`/users/${deleteId}`);
      showToast(lang === 'vi' ? 'Đã xóa người dùng' : 'User deleted');
      setDeleteId(null);
      fetchUsers();
    } catch (e: any) {
      showToast(e.message || (lang === 'vi' ? 'Xóa thất bại' : 'Failed to delete user'), 'error');
      setDeleteId(null);
    }
  };

  const handleToggleStatus = async (user: UserDto) => {
    try {
      await apiPut(`/users/${user.userId}/status`, { status: !user.status });
      showToast(lang === 'vi' ? `Đã ${user.status ? 'vô hiệu hóa' : 'kích hoạt'} người dùng` : `User ${user.status ? 'disabled' : 'enabled'}`);
      fetchUsers();
    } catch (e: any) {
      showToast(e.message || (lang === 'vi' ? 'Thay đổi trạng thái thất bại' : 'Failed to change status'), 'error');
    }
  };

  const handleResetPassword = async () => {
    if (!resetPwId || !newPassword) return;
    try {
      await apiPost(`/users/${resetPwId}/reset-password`, { newPassword });
      showToast(lang === 'vi' ? 'Đã đặt lại mật khẩu thành công' : 'Password reset successfully');
      setResetPwId(null);
      setNewPassword('');
    } catch (e: any) {
      showToast(e.message || (lang === 'vi' ? 'Đặt lại mật khẩu thất bại' : 'Failed to reset password'), 'error');
    }
  };

  const inputStyle = {
    width: '100%', padding: '9px 12px', borderRadius: 6,
    border: '1.5px solid rgba(15,61,94,0.15)', fontSize: 13,
    background: '#F8FAFC', outline: 'none', boxSizing: 'border-box' as const,
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
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
          <h1 style={{ color: '#0F3D5E', margin: 0, fontSize: 20, fontFamily: 'Merriweather, serif' }}>
            {t('admin.users')}
          </h1>
          <p style={{ color: '#5d7a8c', fontSize: 12, margin: '4px 0 0' }}>
            {lang === 'vi' ? `Tổng cộng ${users.length} người dùng` : `Total ${users.length} users`}
          </p>
        </div>
        <button onClick={openAdd} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '10px 18px', borderRadius: 8,
          background: '#0F3D5E', border: 'none', color: 'white',
          fontSize: 13, fontWeight: 600, cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(15,61,94,0.25)',
        }}>
          <Plus size={16} /> {lang === 'vi' ? 'Thêm người dùng' : 'Add User'}
        </button>
      </div>

      <div className="um-filters" style={{
        background: 'white', borderRadius: 10, padding: '14px 16px', marginBottom: 16,
        display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
        boxShadow: '0 1px 6px rgba(15,61,94,0.06)',
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#5d7a8c' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder={lang === 'vi' ? 'Tìm kiếm người dùng...' : 'Search users...'}
            style={{ ...inputStyle, paddingLeft: 32, background: '#F0F4F8' }}
          />
        </div>
      </div>

      <div className="um-table-wrapper" style={{ background: 'white', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 6px rgba(15,61,94,0.06)' }}>
        {loading ? (
          <AdminTableSkeleton rowCount={6} columnCount={8} />
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
              <thead>
                <tr style={{ background: '#0F3D5E' }}>
                  {[
                    'ID', lang === 'vi' ? 'Tên đăng nhập' : 'Username',
                    lang === 'vi' ? 'Họ tên' : 'Full Name', 'Email',
                    lang === 'vi' ? 'Vai trò' : 'Role',
                    lang === 'vi' ? 'Trạng thái' : 'Status',
                    lang === 'vi' ? 'Ngày tạo' : 'Created At',
                    lang === 'vi' ? 'Thao tác' : 'Actions'
                  ].map(h => (
                    <th key={h} style={{ padding: '12px 14px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.8)', textAlign: 'left', textTransform: 'uppercase', letterSpacing: 0.4, whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((user, i) => (
                  <tr key={user.userId} style={{ background: i % 2 === 0 ? 'white' : '#FAFBFD', borderBottom: '1px solid rgba(15,61,94,0.04)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = '#EBF5FB'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = i % 2 === 0 ? 'white' : '#FAFBFD'; }}
                  >
                    <td style={{ padding: '12px 14px', fontSize: 12, color: '#5d7a8c', fontWeight: 600 }}>{user.userId}</td>
                    <td style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#0F3D5E' }}>{user.username}</td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: '#1a2332' }}>{user.fullName || '-'}</td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: '#5d7a8c' }}>{user.email || '-'}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        padding: '3px 8px', borderRadius: 8, fontSize: 10, fontWeight: 700,
                        background: user.roleName === 'ADMIN' ? '#FDEDEC' : user.roleName === 'MANAGER' ? '#EBF5FB' : '#F2F3F4',
                        color: user.roleName === 'ADMIN' ? '#E74C3C' : user.roleName === 'MANAGER' ? '#1A5276' : '#7F8C8D',
                      }}>
                        {user.roleName}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        fontSize: 11, fontWeight: 600,
                        color: user.status ? '#27AE60' : '#E74C3C',
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: user.status ? '#27AE60' : '#E74C3C', display: 'inline-block' }} />
                        {user.status ? (lang === 'vi' ? 'Hoạt động' : 'Active') : (lang === 'vi' ? 'Vô hiệu' : 'Disabled')}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 11, color: '#5d7a8c' }}>{formatDate(user.createdAt)}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => openEdit(user)}
                          style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(15,61,94,0.15)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4A017' }}
                          title={lang === 'vi' ? 'Chỉnh sửa' : 'Edit'}
                        >
                          <Pencil size={12} />
                        </button>
                        <button onClick={() => handleToggleStatus(user)}
                          style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(15,61,94,0.15)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: user.status ? '#E67E22' : '#27AE60' }}
                          title={user.status ? (lang === 'vi' ? 'Vô hiệu hóa' : 'Disable') : (lang === 'vi' ? 'Kích hoạt' : 'Enable')}
                        >
                          {user.status ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
                        </button>
                        <button onClick={() => { setResetPwId(user.userId); setNewPassword(''); }}
                          style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(15,61,94,0.15)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F3D5E' }}
                          title={lang === 'vi' ? 'Đặt lại mật khẩu' : 'Reset Password'}
                        >
                          <Key size={12} />
                        </button>
                        <button onClick={() => setDeleteId(user.userId)}
                          style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(231,76,60,0.2)', background: '#FDEDEC', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E74C3C' }}
                          title={lang === 'vi' ? 'Xóa' : 'Delete'}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: '#5d7a8c', fontSize: 13 }}>
                      <UsersIcon size={24} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.4 }} />
                      {lang === 'vi' ? 'Không tìm thấy người dùng nào' : 'No users found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
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
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      {formMode && editUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500 }}
          onClick={closeForm}>
          <div style={{ background: 'white', borderRadius: 12, width: '90%', maxWidth: 480, boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '16px 20px', background: '#0F3D5E', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>
                {formMode === 'add' ? (lang === 'vi' ? 'Thêm người dùng' : 'Add User') : (lang === 'vi' ? 'Chỉnh sửa người dùng' : 'Edit User')}
              </span>
              <button onClick={closeForm}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                  {lang === 'vi' ? 'Tên đăng nhập' : 'Username'} *
                </label>
                <input style={{ ...inputStyle, borderColor: formErrors.username ? '#E74C3C' : 'rgba(15,61,94,0.15)' }} value={editUser.username || ''}
                  disabled={formMode === 'edit'}
                  onChange={e => { setEditUser(s => s ? { ...s, username: e.target.value } : s); setFormErrors(prev => ({ ...prev, username: '' })); }} />
                {formErrors.username && <span style={{ fontSize: 11, color: '#E74C3C', marginTop: 2, display: 'block' }}>{formErrors.username}</span>}
              </div>
              {formMode === 'add' && (
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                    {lang === 'vi' ? 'Mật khẩu' : 'Password'} *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPassword ? 'text' : 'password'}
                      style={{ ...inputStyle, paddingRight: 36, borderColor: formErrors.password ? '#E74C3C' : 'rgba(15,61,94,0.15)' }}
                      value={editUser.password || ''}
                      onChange={e => { setEditUser(s => s ? { ...s, password: e.target.value } : s); setFormErrors(prev => ({ ...prev, password: '' })); }} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#5d7a8c', display: 'flex', alignItems: 'center', padding: 4 }}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {formErrors.password && <span style={{ fontSize: 11, color: '#E74C3C', marginTop: 2, display: 'block' }}>{formErrors.password}</span>}
                  <p style={{ fontSize: 10, color: '#cbced4', margin: '4px 0 0' }}>{lang === 'vi' ? 'Tối thiểu 6 ký tự' : 'Minimum 6 characters'}</p>
                </div>
              )}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                  {lang === 'vi' ? 'Họ tên' : 'Full Name'} *
                </label>
                <input style={{ ...inputStyle, borderColor: formErrors.fullName ? '#E74C3C' : 'rgba(15,61,94,0.15)' }} value={editUser.fullName || ''}
                  onChange={e => { setEditUser(s => s ? { ...s, fullName: e.target.value } : s); setFormErrors(prev => ({ ...prev, fullName: '' })); }} />
                {formErrors.fullName && <span style={{ fontSize: 11, color: '#E74C3C', marginTop: 2, display: 'block' }}>{formErrors.fullName}</span>}
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>Email *</label>
                <input style={{ ...inputStyle, borderColor: formErrors.email ? '#E74C3C' : 'rgba(15,61,94,0.15)' }} value={editUser.email || ''}
                  onChange={e => { setEditUser(s => s ? { ...s, email: e.target.value } : s); setFormErrors(prev => ({ ...prev, email: '' })); }} />
                {formErrors.email && <span style={{ fontSize: 11, color: '#E74C3C', marginTop: 2, display: 'block' }}>{formErrors.email}</span>}
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                  {lang === 'vi' ? 'Vai trò' : 'Role'} *
                </label>
                <select style={{ ...inputStyle, background: 'white', cursor: 'pointer', borderColor: formErrors.roleName ? '#E74C3C' : 'rgba(15,61,94,0.15)' }} value={editUser.roleName || 'MANAGER'}
                  onChange={e => { setEditUser(s => s ? { ...s, roleName: e.target.value } : s); setFormErrors(prev => ({ ...prev, roleName: '' })); }}>
                  <option value="ADMIN">ADMIN</option>
                  <option value="MANAGER">MANAGER</option>
                </select>
                {formErrors.roleName && <span style={{ fontSize: 11, color: '#E74C3C', marginTop: 2, display: 'block' }}>{formErrors.roleName}</span>}
              </div>
              {formMode === 'edit' && (
                <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#0F3D5E' }}>
                    {lang === 'vi' ? 'Trạng thái' : 'Status'}
                  </label>
                  <button onClick={() => setEditUser(s => s ? { ...s, status: !s.status } : s)}
                    style={{
                      padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
                      background: editUser.status ? '#EAFAF1' : '#FDEDEC',
                      color: editUser.status ? '#27AE60' : '#E74C3C',
                      fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                    {editUser.status ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                    {editUser.status ? (lang === 'vi' ? 'Hoạt động' : 'Active') : (lang === 'vi' ? 'Vô hiệu' : 'Disabled')}
                  </button>
                </div>
              )}
            </div>
            <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(15,61,94,0.1)', display: 'flex', justifyContent: 'flex-end', gap: 10, background: '#F8FAFC' }}>
              <button onClick={closeForm}
                style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid rgba(15,61,94,0.2)', background: 'white', color: '#5d7a8c', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                {t('common.cancel')}
              </button>
              <button onClick={formMode === 'add' ? handleCreate : handleUpdate}
                style={{ padding: '9px 20px', borderRadius: 8, background: '#0F3D5E', border: 'none', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(15,61,94,0.3)' }}>
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
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
              {lang === 'vi' ? 'Bạn có chắc chắn muốn xóa người dùng này?' : 'Are you sure you want to delete this user?'}
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setDeleteId(null)} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid rgba(15,61,94,0.2)', background: 'white', color: '#5d7a8c', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                {t('common.cancel')}
              </button>
              <button onClick={handleDelete} style={{ padding: '9px 20px', borderRadius: 8, background: '#E74C3C', border: 'none', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                {lang === 'vi' ? 'Xóa' : 'Delete'}
              </button>
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

      {/* Reset Password Modal */}
      {resetPwId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 600 }}
          onClick={() => { setResetPwId(null); setNewPassword(''); }}>
          <div style={{ background: 'white', borderRadius: 12, padding: '28px', maxWidth: 400, width: '90%', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#EBF5FB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#0F3D5E' }}>
              <Key size={24} />
            </div>
            <h3 style={{ color: '#0F3D5E', fontSize: 16, marginBottom: 8, textAlign: 'center' }}>
              {lang === 'vi' ? 'Đặt lại mật khẩu' : 'Reset Password'}
            </h3>
            <p style={{ color: '#5d7a8c', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>
              {lang === 'vi' ? 'Nhập mật khẩu mới cho người dùng' : 'Enter new password for the user'}
            </p>
            <input type="password" style={inputStyle} value={newPassword}
              placeholder={lang === 'vi' ? 'Mật khẩu mới' : 'New password'}
              onChange={e => setNewPassword(e.target.value)} />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16 }}>
              <button onClick={() => { setResetPwId(null); setNewPassword(''); }}
                style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid rgba(15,61,94,0.2)', background: 'white', color: '#5d7a8c', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                {t('common.cancel')}
              </button>
              <button onClick={handleResetPassword} disabled={newPassword.length < 6}
                style={{ padding: '9px 20px', borderRadius: 8, background: newPassword.length < 6 ? '#5d7a8c' : '#0F3D5E', border: 'none', color: 'white', fontSize: 13, fontWeight: 600, cursor: newPassword.length < 6 ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(15,61,94,0.3)' }}>
                {lang === 'vi' ? 'Lưu' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @media (max-width: 767px) {
          .um-table-wrapper {
            overflow-x: auto !important;
          }
          .um-table-wrapper table {
            min-width: 600px !important;
          }
          .um-filters {
            flex-direction: column !important;
          }
        }
      `}</style>
    </div>
  );
}