import { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { submitEvaluation } from '../services/evaluationService';
import { Star, Send, ShieldCheck, CheckCircle2, RotateCcw } from 'lucide-react';
import { StarRating } from './EvaluationSection';
import type { SatisfactionLevel } from '../../core/types';
import { AppLogo } from './AppLogo';

const SATISFACTION_OPTIONS: { value: SatisfactionLevel; labelVi: string; labelEn: string; color: string }[] = [
  { value: 'very_satisfied', labelVi: 'Rất hài lòng', labelEn: 'Very satisfied', color: '#27AE60' },
  { value: 'satisfied', labelVi: 'Hài lòng', labelEn: 'Satisfied', color: '#27AE60' },
  { value: 'neutral', labelVi: 'Bình thường', labelEn: 'Neutral', color: '#F39C12' },
  { value: 'unsatisfied', labelVi: 'Không hài lòng', labelEn: 'Unsatisfied', color: '#E67E22' },
  { value: 'very_unsatisfied', labelVi: 'Rất không hài lòng', labelEn: 'Very unsatisfied', color: '#E74C3C' },
];

const SATISFACTION_COLORS: Record<SatisfactionLevel, string> = {
  very_satisfied: '#27AE60',
  satisfied: '#27AE60',
  neutral: '#F39C12',
  unsatisfied: '#E67E22',
  very_unsatisfied: '#E74C3C',
};

export function EvaluationKiosk() {
  const { lang } = useLanguage();
  const [score, setScore] = useState(0);
  const [satisfaction, setSatisfaction] = useState<SatisfactionLevel | ''>('');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: 7,
    border: '1.5px solid rgba(15,61,94,0.15)', fontSize: 13,
    background: '#F8FAFC', outline: 'none', boxSizing: 'border-box',
  };

  const handleSubmit = async () => {
    setError('');
    if (score < 1) {
      setError(lang === 'vi' ? 'Vui lòng chọn số sao đánh giá' : 'Please select a star rating');
      return;
    }
    if (!reviewerName.trim()) {
      setError(lang === 'vi' ? 'Vui lòng nhập tên của bạn' : 'Please enter your name');
      return;
    }
    if (email.trim() && !email.includes('@')) {
      setError(lang === 'vi' ? 'Email không hợp lệ' : 'Invalid email address');
      return;
    }
    setSubmitting(true);
    try {
      await submitEvaluation({
        targetType: 'service',
        targetId: undefined,
        score,
        satisfactionLevel: satisfaction || undefined,
        title: title.trim() || undefined,
        comment: comment.trim() || undefined,
        reviewerName: reviewerName.trim(),
        email: email.trim() || undefined,
      });
      setDone(true);
    } catch (e) {
      const msg = (e as { message?: string })?.message;
      setError(msg && msg.length < 200
        ? msg
        : (lang === 'vi' ? 'Gửi đánh giá thất bại, vui lòng thử lại sau' : 'Failed to submit, please try again later'));
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setScore(0);
    setSatisfaction('');
    setTitle('');
    setComment('');
    setReviewerName('');
    setEmail('');
    setError('');
    setDone(false);
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #F0F4F8 0%, #E3EDF5 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, boxSizing: 'border-box',
    }}>
      <div style={{
        width: '100%', maxWidth: 560, background: 'white', borderRadius: 16,
        boxShadow: '0 12px 40px rgba(15,61,94,0.15)', overflow: 'hidden',
      }}>
        <div style={{ background: '#0F3D5E', padding: '28px 32px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 10 }}>
            <AppLogo size={44} />
            <span style={{ color: 'white', fontSize: 14, fontWeight: 700, fontFamily: 'Merriweather, serif' }}>
              {lang === 'vi' ? 'Di sản Vân Đình' : 'Van Dinh Heritage'}
            </span>
          </div>
          <h1 style={{ color: 'white', margin: 0, fontSize: 20, fontFamily: 'Merriweather, serif', fontWeight: 700 }}>
            {lang === 'vi' ? 'Đánh giá trải nghiệm' : 'Rate your experience'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', margin: '6px 0 0', fontSize: 12.5 }}>
            {lang === 'vi'
              ? 'Cảm ơn bạn đã sử dụng dịch vụ. Ý kiến của bạn giúp chúng tôi phục vụ tốt hơn!'
              : 'Thank you for using our service. Your feedback helps us serve you better!'}
          </p>
        </div>

        <div style={{ padding: '28px 32px 32px' }}>
          {done ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(39,174,96,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircle2 size={32} color="#27AE60" />
              </div>
              <h2 style={{ color: '#0F3D5E', fontFamily: 'Merriweather, serif', margin: '0 0 8px', fontSize: 18 }}>
                {lang === 'vi' ? 'Đã gửi thành công!' : 'Submitted successfully!'}
              </h2>
              <p style={{ color: '#5d7a8c', fontSize: 13, lineHeight: 1.7, margin: '0 0 20px' }}>
                {lang === 'vi'
                  ? 'Đánh giá của bạn sẽ được xem xét và hiển thị sau khi được phê duyệt.'
                  : 'Your evaluation will be reviewed and displayed after approval.'}
              </p>
              <button onClick={reset} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 24px', borderRadius: 8,
                background: '#0F3D5E', border: 'none', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>
                <RotateCcw size={14} /> {lang === 'vi' ? 'Đánh giá tiếp' : 'Submit another'}
              </button>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0F3D5E', marginBottom: 8 }}>
                {lang === 'vi' ? '1. Chọn số sao' : '1. Choose a star rating'} <span style={{ color: '#E74C3C' }}>*</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                <StarRating value={score} size={36} interactive onChange={setScore} />
              </div>

              <div style={{ fontSize: 13, fontWeight: 700, color: '#0F3D5E', marginBottom: 8 }}>
                {lang === 'vi' ? '2. Mức độ hài lòng' : '2. Satisfaction level'}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
                {SATISFACTION_OPTIONS.map(opt => {
                  const active = satisfaction === opt.value;
                  return (
                    <button key={opt.value} onClick={() => setSatisfaction(active ? '' : opt.value)} style={{
                      padding: '7px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                      border: active ? `1.5px solid ${SATISFACTION_COLORS[opt.value]}` : '1.5px solid rgba(15,61,94,0.15)',
                      background: active ? `${SATISFACTION_COLORS[opt.value]}12` : 'white',
                      color: active ? SATISFACTION_COLORS[opt.value] : '#5d7a8c',
                      fontWeight: active ? 700 : 500,
                    }}>
                      {lang === 'vi' ? opt.labelVi : opt.labelEn}
                    </button>
                  );
                })}
              </div>

              <div style={{ fontSize: 13, fontWeight: 700, color: '#0F3D5E', marginBottom: 8 }}>
                {lang === 'vi' ? '3. Nhận xét của bạn' : '3. Your comments'}
              </div>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={lang === 'vi' ? 'Tiêu đề (không bắt buộc)' : 'Title (optional)'}
                style={{ ...inputStyle, marginBottom: 10 }}
              />
              <textarea
                rows={3}
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder={lang === 'vi' ? 'Chia sẻ trải nghiệm của bạn...' : 'Share your experience...'}
                style={{ ...inputStyle, resize: 'vertical', marginBottom: 10 }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 6 }}>
                <input
                  value={reviewerName}
                  onChange={e => setReviewerName(e.target.value)}
                  placeholder={lang === 'vi' ? 'Tên của bạn *' : 'Your name *'}
                  style={inputStyle}
                />
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={lang === 'vi' ? 'Email (không bắt buộc)' : 'Email (optional)'}
                  style={inputStyle}
                />
              </div>

              {error && (
                <div style={{ color: '#dc2626', fontSize: 12.5, marginTop: 8, textAlign: 'center' }}>{error}</div>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  marginTop: 16, width: '100%', padding: '12px', borderRadius: 8,
                  background: submitting ? '#94a3b8' : '#0F3D5E', border: 'none', color: 'white',
                  fontSize: 14, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 4px 12px rgba(15,61,94,0.3)',
                }}
              >
                {submitting ? (lang === 'vi' ? 'Đang gửi...' : 'Submitting...') : (<><Send size={14} /> {lang === 'vi' ? 'Gửi đánh giá' : 'Submit rating'}</>)}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 14, color: '#5d7a8c', fontSize: 11 }}>
                <ShieldCheck size={12} />
                {lang === 'vi' ? 'Thông tin của bạn được bảo mật. Mỗi email chỉ đánh giá một lần mỗi ngày.' : 'Your information is secure. One evaluation per email per day.'}
              </div>
            </div>
          )}
        </div>

        <div style={{ background: '#F0F4F8', padding: '12px 32px', textAlign: 'center', color: '#5d7a8c', fontSize: 11 }}>
          {lang === 'vi' ? 'Cổng đánh giá — Ủy ban Nhân dân xã Vân Đình, huyện Ứng Hòa, Hà Nội' : 'Feedback kiosk — Van Dinh Commune People\'s Committee, Ung Hoa District, Hanoi'}
        </div>
      </div>
    </div>
  );
}
