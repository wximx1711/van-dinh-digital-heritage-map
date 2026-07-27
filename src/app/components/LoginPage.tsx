import { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { useSystemSettings } from './SystemSettingsContext';
import { LazyImage } from './LazyImage';
import { getImageUrl, getLogoUrl } from '../utils/url';
import { Eye, EyeOff, LogIn, ArrowLeft, Landmark, Globe } from 'lucide-react';
import type { UserInfo } from '../../core/types';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface CsrfTokenResponse {
  token: string;
  headerName: string;
}

interface LoginResponse {
  userId: number;
  username: string;
  fullName: string | null;
  roleName: string;
}

interface LoginPageProps {
  onNavigate: (page: string) => void;
  onLoginSuccess: (user: UserInfo) => void;
}

export function LoginPage({ onNavigate, onLoginSuccess }: LoginPageProps) {
  const { lang, setLang, t } = useLanguage();
  const { settings } = useSystemSettings();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');

  const handleForgotPassword = () => {
    setForgotMsg(lang === 'vi' ? 'Vui lòng liên hệ quản trị viên hệ thống để đặt lại mật khẩu.' : 'Please contact the system administrator to reset your password.');
    setTimeout(() => setForgotMsg(''), 4000);
  };

const handleLogin = async () => {
     if (!username.trim() || !password.trim()) {
       setError(lang === 'vi' ? 'Vui lòng nhập đầy đủ thông tin' : 'Please fill in all fields');
       return;
     }
     setError('');
     setLoading(true);
     try {
       const csrfResponse = await fetch('/api/security/csrf-token', {
         credentials: 'include',
       });

       if (!csrfResponse.ok) {
         setError(lang === 'vi' ? 'Lỗi kết nối đến server' : 'Connection error');
         setLoading(false);
         return;
       }

       const csrfData = await csrfResponse.json() as CsrfTokenResponse;
       const response = await fetch('/api/auth/login', {
         method: 'POST',
         credentials: 'include',
         headers: {
           'Content-Type': 'application/json',
           [csrfData.headerName]: csrfData.token,
         },
         body: JSON.stringify({
           username: username.trim(),
           password: password,
           rememberMe: remember,
         }),
       });

       if (!response.ok) {
         const errorData = await response.json();
         setError(lang === 'vi' ? (errorData.message || 'Tên đăng nhập hoặc mật khẩu không đúng') : (errorData.message || 'Invalid username or password'));
         setLoading(false);
         return;
       }

        const data = await response.json() as ApiResponse<LoginResponse>;
        const loginData = data.data;
        if (data.success && loginData) {
          onLoginSuccess({
            userId: loginData.userId,
            username: loginData.username,
            fullName: loginData.fullName ?? loginData.username,
            roleName: loginData.roleName,
          });
        } else {
         setError(lang === 'vi' ? 'Đăng nhập thất bại' : 'Login failed');
         setLoading(false);
       }
     } catch (err) {
       setError(lang === 'vi' ? 'Lỗi kết nối đến server' : 'Connection error');
       setLoading(false);
     }
   };

  return (
    <div style={{
      minHeight: '100vh', position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0a1929',
    }}>
      {/* Background image */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url(https://images.unsplash.com/photo-1571842533456-9b0d746c5a9b?w=1600&h=900&fit=crop&auto=format)`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        opacity: 0.3,
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(10,25,41,0.95) 0%, rgba(15,61,94,0.85) 100%)',
      }} />

      {/* Gold top border */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, transparent, #D4A017 20%, #D4A017 80%, transparent)' }} />

      {/* Back to home button */}
      <button
        onClick={() => onNavigate('home')}
        style={{
          position: 'absolute', top: 24, left: 24,
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 8, padding: '8px 16px', color: 'rgba(255,255,255,0.8)',
          fontSize: 13, cursor: 'pointer', backdropFilter: 'blur(8px)',
        }}
      >
        <ArrowLeft size={14} /> {t('login.back_home')}
      </button>

      {/* Language switch */}
      <div style={{ position: 'absolute', top: 24, right: 24, display: 'flex', gap: 4 }}>
        {(['vi', 'en'] as const).map(l => (
          <button
            key={l}
            onClick={() => setLang(l)}
            style={{
              padding: '6px 12px', borderRadius: 6, border: 'none',
              background: lang === l ? '#D4A017' : 'rgba(255,255,255,0.1)',
              color: lang === l ? 'white' : 'rgba(255,255,255,0.6)',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            <Globe size={12} /> {l.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Login card */}
      <div style={{
        position: 'relative', width: '100%', maxWidth: 420, padding: '0 24px',
      }}>
        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.97)',
          borderRadius: 16, overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        }}>
          {/* Card header */}
          <div style={{
            background: '#0F3D5E', padding: '28px 28px 20px',
            textAlign: 'center', position: 'relative',
          }}>
            {/* Decorative pattern */}
            <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 5 Q25 12 20 20 Q15 12 20 5Z' fill='%23D4A017' /%3E%3C/svg%3E")` }} />
            <div style={{
              width: 64, height: 64, borderRadius: 16, margin: '0 auto 12px',
              background: settings?.logoUrl ? 'transparent' : 'linear-gradient(135deg, #D4A017, #B8860B)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(212,160,23,0.4)', overflow: 'hidden',
            }}>
              {settings?.logoUrl ? (
                <LazyImage src={getLogoUrl(settings.logoUrl, settings.updatedAt)} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 16 }} />
              ) : (
                <Landmark size={30} color="white" />
              )}
            </div>
            <h2 style={{ color: 'white', fontSize: 20, fontFamily: 'Merriweather, serif', fontWeight: 700, margin: '0 0 4px' }}>
              {t('login.title')}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, margin: 0 }}>
              {t('login.subtitle')}
            </p>
          </div>

          {/* Gold divider */}
          <div style={{ background: 'linear-gradient(90deg, transparent, #D4A017 30%, #D4A017 70%, transparent)', height: 2 }} />

          {/* Form */}
          <div style={{ padding: '28px' }}>
            {/* Error */}
            {error && (
              <div style={{
                padding: '10px 14px', borderRadius: 8, marginBottom: 16,
                background: '#FDEDEC', border: '1px solid #F5C6CB',
                color: '#E74C3C', fontSize: 13,
              }}>
                ⚠️ {error}
              </div>
            )}
            {forgotMsg && (
              <div style={{
                padding: '10px 14px', borderRadius: 8, marginBottom: 16,
                background: '#EBF5FB', border: '1px solid #A9CCE3',
                color: '#1A5276', fontSize: 13,
              }}>
                ℹ️ {forgotMsg}
              </div>
            )}

            {/* Username */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#0F3D5E', marginBottom: 6 }}>
                {t('login.username')}
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder={lang === 'vi' ? 'Nhập tên đăng nhập' : 'Enter username'}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 8,
                  border: '1.5px solid rgba(15,61,94,0.2)',
                  fontSize: 14, outline: 'none', background: '#F8FAFC',
                  boxSizing: 'border-box', transition: 'border-color 0.2s',
                }}
                onFocus={e => { (e.currentTarget as HTMLInputElement).style.borderColor = '#0F3D5E'; }}
                onBlur={e => { (e.currentTarget as HTMLInputElement).style.borderColor = 'rgba(15,61,94,0.2)'; }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#0F3D5E', marginBottom: 6 }}>
                {t('login.password')}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder={lang === 'vi' ? 'Nhập mật khẩu' : 'Enter password'}
                  style={{
                    width: '100%', padding: '10px 44px 10px 14px', borderRadius: 8,
                    border: '1.5px solid rgba(15,61,94,0.2)',
                    fontSize: 14, outline: 'none', background: '#F8FAFC',
                    boxSizing: 'border-box', transition: 'border-color 0.2s',
                  }}
                  onFocus={e => { (e.currentTarget as HTMLInputElement).style.borderColor = '#0F3D5E'; }}
                  onBlur={e => { (e.currentTarget as HTMLInputElement).style.borderColor = 'rgba(15,61,94,0.2)'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#5d7a8c', padding: 4,
                  }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember & forgot */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#5d7a8c' }}>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  style={{ accentColor: '#0F3D5E' }}
                />
                {t('login.remember')}
              </label>
              <button onClick={handleForgotPassword} style={{
                background: 'none', border: 'none', color: '#D4A017', fontSize: 13, cursor: 'pointer', fontWeight: 600,
              }}>
                {t('login.forgot')}
              </button>
            </div>

            {/* Login button */}
            <button
              onClick={handleLogin}
              disabled={loading}
              style={{
                width: '100%', padding: '12px', borderRadius: 8,
                background: loading ? '#5d7a8c' : 'linear-gradient(135deg, #0F3D5E, #1A5276)',
                border: 'none', color: 'white', fontSize: 15, fontWeight: 700, cursor: loading ? 'wait' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: '0 4px 16px rgba(15,61,94,0.3)',
                transition: 'opacity 0.2s', opacity: loading ? 0.8 : 1,
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white',
                    animation: 'spin 0.8s linear infinite',
                  }} />
                  {lang === 'vi' ? 'Đang đăng nhập...' : 'Logging in...'}
                </>
              ) : (
                <>
                  <LogIn size={16} /> {t('login.btn')}
                </>
              )}
            </button>

<p style={{ textAlign: 'center', fontSize: 12, color: '#5d7a8c', marginTop: 16, lineHeight: 1.5 }}>
               {lang === 'vi'
                 ? 'Chỉ dành cho cán bộ quản lý di sản được cấp tài khoản'
                 : 'For authorized heritage management staff only'}
             </p>
           </div>
         </div>

         {/* Bottom text */}
         <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 16 }}>
           © {new Date().getFullYear()} {lang === 'vi' ? 'Bản đồ số Di sản Văn hóa Vân Đình' : 'Van Dinh Digital Heritage Map'}
         </p>
       </div>

       <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
     </div>
   );
 }
