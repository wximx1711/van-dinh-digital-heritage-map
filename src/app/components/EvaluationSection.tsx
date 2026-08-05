import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from './LanguageContext';
import { fetchEvaluationTargetStats, submitEvaluation } from '../services/evaluationService';
import { Star, MessageSquare, Send, ShieldCheck, CheckCircle2 } from 'lucide-react';
import type { EvaluationTargetStats, EvaluationSubmitPayload, SatisfactionLevel } from '../../core/types';

interface EvaluationSectionProps {
  targetType: 'heritage' | 'intangible';
  targetId: string;
  heritageName: string;
}

const SATISFACTION_OPTIONS: { value: SatisfactionLevel; labelVi: string; labelEn: string }[] = [
  { value: 'very_satisfied', labelVi: 'Rất hài lòng', labelEn: 'Very satisfied' },
  { value: 'satisfied', labelVi: 'Hài lòng', labelEn: 'Satisfied' },
  { value: 'neutral', labelVi: 'Bình thường', labelEn: 'Neutral' },
  { value: 'unsatisfied', labelVi: 'Không hài lòng', labelEn: 'Unsatisfied' },
  { value: 'very_unsatisfied', labelVi: 'Rất không hài lòng', labelEn: 'Very unsatisfied' },
];

const SATISFACTION_COLORS: Record<SatisfactionLevel, string> = {
  very_satisfied: '#27AE60',
  satisfied: '#27AE60',
  neutral: '#F39C12',
  unsatisfied: '#E67E22',
  very_unsatisfied: '#E74C3C',
};

export function StarRating({ value, size = 16, interactive = false, onChange }: {
  value: number;
  size?: number;
  interactive?: boolean;
  onChange?: (v: number) => void;
}) {
  const { lang } = useLanguage();
  const [hover, setHover] = useState(0);
  const display = interactive && hover > 0 ? hover : value;
  return (
    <span
      style={{ display: 'inline-flex', gap: 2, alignItems: 'center' }}
      role={interactive ? 'radiogroup' : undefined}
      aria-label={interactive ? (lang === 'vi' ? 'Chọn số sao' : 'Select rating') : undefined}
    >
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          size={size}
          style={{
            color: s <= display ? '#D4A017' : '#D5DDE5',
            fill: s <= display ? '#D4A017' : 'transparent',
            cursor: interactive ? 'pointer' : 'default',
            transition: 'transform 0.1s',
          }}
          onMouseEnter={interactive ? () => setHover(s) : undefined}
          onMouseLeave={interactive ? () => setHover(0) : undefined}
          onClick={interactive && onChange ? () => onChange(s) : undefined}
          role={interactive ? 'radio' : undefined}
          aria-checked={interactive ? s === value : undefined}
        />
      ))}
    </span>
  );
}

function formatDate(iso: string, lang: string): string {
  try {
    return new Date(iso).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function EvaluationSection({ targetType, targetId, heritageName }: EvaluationSectionProps) {
  const { lang } = useLanguage();
  const [stats, setStats] = useState<EvaluationTargetStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentPage, setCommentPage] = useState(1);
  const [totalCommentPages, setTotalCommentPages] = useState(1);

  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [score, setScore] = useState(0);
  const [satisfaction, setSatisfaction] = useState<SatisfactionLevel | ''>('');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const loadStats = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const data = await fetchEvaluationTargetStats(targetType, targetId);
      setStats(data);
      setTotalCommentPages(Math.max(1, Math.ceil(data.recentComments.length / 5) === 0 ? 1 : Math.ceil(data.recentComments.length / 5)));
      setCommentPage(page);
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [targetType, targetId]);

  useEffect(() => {
    loadStats(1);
  }, [loadStats]);

  const handleSubmit = async () => {
    setFormError('');
    if (score < 1) {
      setFormError(lang === 'vi' ? 'Vui lòng chọn số sao (1–5).' : 'Please select a star rating (1–5).');
      return;
    }
    if (!reviewerName.trim()) {
      setFormError(lang === 'vi' ? 'Vui lòng nhập tên của bạn.' : 'Please enter your name.');
      return;
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError(lang === 'vi' ? 'Email không hợp lệ.' : 'Invalid email address.');
      return;
    }
    if (comment.trim() && comment.trim().length > 1000) {
      setFormError(lang === 'vi' ? 'Nội dung đánh giá tối đa 1000 ký tự.' : 'Review must be at most 1000 characters.');
      return;
    }
    setSubmitting(true);
    try {
      const payload: EvaluationSubmitPayload = {
        targetType,
        targetId,
        score,
        satisfactionLevel: satisfaction || undefined,
        title: title.trim() || undefined,
        comment: comment.trim() || undefined,
        reviewerName: reviewerName.trim(),
        email: email.trim() || undefined,
        deviceName: navigator.userAgent.slice(0, 150),
      };
      await submitEvaluation(payload);
      setSubmitted(true);
      setFormOpen(false);
      setScore(0);
      setSatisfaction('');
      setTitle('');
      setComment('');
      setReviewerName('');
      setEmail('');
      loadStats(1);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : (lang === 'vi' ? 'Gửi đánh giá thất bại.' : 'Failed to submit review.'));
    } finally {
      setSubmitting(false);
    }
  };

  const satisfactionRate = stats && stats.totalEvaluations > 0
    ? Math.round((stats.ratingDistribution.filter(d => d.score >= 4).reduce((a, d) => a + d.count, 0) / stats.totalEvaluations) * 100)
    : 0;

  const inputStyle = {
    width: '100%', padding: '9px 12px', borderRadius: 7,
    border: '1.5px solid rgba(15,61,94,0.15)', fontSize: 13,
    background: '#F8FAFC', outline: 'none', boxSizing: 'border-box' as const,
  };

  return (
    <div id="danh-gia" style={{ background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(15,61,94,0.08)', marginTop: 20 }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(15,61,94,0.08)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <MessageSquare size={16} style={{ color: '#D4A017' }} />
        <span style={{ fontSize: 15, fontWeight: 700, color: '#0F3D5E', fontFamily: 'Merriweather, serif' }}>
          {lang === 'vi' ? 'Đánh giá & Nhận xét' : 'Ratings & Reviews'}
        </span>
      </div>

      {loading && !stats ? (
        <div style={{ padding: '32px', textAlign: 'center', color: '#5d7a8c', fontSize: 13 }}>
          {lang === 'vi' ? 'Đang tải đánh giá...' : 'Loading reviews...'}
        </div>
      ) : stats ? (
        <div style={{ padding: '20px' }}>
          {/* Overall summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 24, alignItems: 'center' }}>
            <div style={{ textAlign: 'center', padding: '8px 24px' }}>
              <div style={{ fontSize: 44, fontWeight: 800, color: '#0F3D5E', lineHeight: 1 }}>{stats.averageScore.toFixed(1)}</div>
              <div style={{ marginTop: 8 }}>
                <StarRating value={Math.round(stats.averageScore)} size={18} />
              </div>
              <div style={{ fontSize: 12, color: '#5d7a8c', marginTop: 6 }}>
                {lang === 'vi' ? 'trên 5' : 'out of 5'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 13, color: '#1a2332', fontWeight: 600, marginBottom: 12 }}>
                {lang === 'vi'
                  ? `Dựa trên ${stats.totalEvaluations} lượt đánh giá`
                  : `Based on ${stats.totalEvaluations} evaluation${stats.totalEvaluations === 1 ? '' : 's'}`}
              </div>
              {[...stats.ratingDistribution].sort((a, b) => b.score - a.score).map(d => (
                <div key={d.score} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                  <span style={{ fontSize: 11, color: '#5d7a8c', width: 16, textAlign: 'right', fontWeight: 600 }}>{d.score}</span>
                  <Star size={11} style={{ color: '#D4A017', fill: '#D4A017' }} />
                  <div style={{ flex: 1, height: 8, borderRadius: 4, background: '#F0F4F8', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${d.percentage}%`, borderRadius: 4, background: 'linear-gradient(90deg, #D4A017, #E8B93A)' }} />
                  </div>
                  <span style={{ fontSize: 11, color: '#5d7a8c', width: 34, textAlign: 'right' }}>{d.count}</span>
                </div>
              ))}
              <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#27AE60', fontWeight: 600 }}>
                <ShieldCheck size={14} />
                {lang === 'vi'
                  ? `Tỷ lệ hài lòng: ${satisfactionRate}%`
                  : `Satisfaction rate: ${satisfactionRate}%`}
              </div>
            </div>
          </div>

          {/* Submit button / success */}
          {submitted ? (
            <div style={{ marginTop: 20, padding: '16px', borderRadius: 8, background: '#EAF9F0', border: '1px solid rgba(39,174,96,0.3)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <CheckCircle2 size={18} style={{ color: '#27AE60', flexShrink: 0 }} />
              <div style={{ fontSize: 13, color: '#1a2332' }}>
                {lang === 'vi'
                  ? 'Cảm ơn bạn đã đánh giá! Nhận xét của bạn đã được gửi và sẽ được hiển thị sau khi được duyệt.'
                  : 'Thank you for your review! It has been submitted and will be displayed after approval.'}
              </div>
              <button
                onClick={() => setSubmitted(false)}
                style={{ marginLeft: 'auto', padding: '6px 14px', borderRadius: 6, background: '#27AE60', border: 'none', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                {lang === 'vi' ? 'Gửi đánh giá khác' : 'Write another review'}
              </button>
            </div>
          ) : !formOpen ? (
            <button
              onClick={() => setFormOpen(true)}
              style={{ marginTop: 20, width: '100%', padding: '11px', borderRadius: 8, background: '#0F3D5E', border: 'none', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(15,61,94,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <Star size={14} />
              {lang === 'vi' ? 'Viết đánh giá của bạn' : 'Write your review'}
            </button>
          ) : (
            <div style={{ marginTop: 20, padding: '16px', borderRadius: 10, border: '1px solid rgba(15,61,94,0.12)', background: '#FAFCFE' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0F3D5E', marginBottom: 12 }}>
                {lang === 'vi' ? `Đánh giá: ${heritageName}` : `Review: ${heritageName}`}
              </div>

              {/* Stars */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#5d7a8c' }}>{lang === 'vi' ? 'Số sao *' : 'Rating *'}</span>
                <StarRating value={score} size={26} interactive onChange={setScore} />
                {score > 0 && (
                  <span style={{ fontSize: 12, color: '#D4A017', fontWeight: 700 }}>
                    {score}/{5}
                  </span>
                )}
              </div>

              {/* Satisfaction level */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#0F3D5E', marginBottom: 6 }}>
                  {lang === 'vi' ? 'Mức độ hài lòng' : 'Satisfaction level'}
                </label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {SATISFACTION_OPTIONS.map(opt => {
                    const active = satisfaction === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setSatisfaction(active ? '' : opt.value)}
                        style={{
                          padding: '6px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                          border: active ? `1.5px solid ${SATISFACTION_COLORS[opt.value]}` : '1.5px solid rgba(15,61,94,0.15)',
                          background: active ? `${SATISFACTION_COLORS[opt.value]}12` : 'white',
                          color: active ? SATISFACTION_COLORS[opt.value] : '#5d7a8c',
                          fontWeight: active ? 700 : 500,
                        }}
                      >
                        {lang === 'vi' ? opt.labelVi : opt.labelEn}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#0F3D5E', marginBottom: 5 }}>
                  {lang === 'vi' ? 'Tiêu đề (không bắt buộc)' : 'Title (optional)'}
                </label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  maxLength={200}
                  placeholder={lang === 'vi' ? 'Tóm tắt ngắn về trải nghiệm của bạn' : 'A short summary of your experience'}
                  style={inputStyle}
                />
              </div>

              {/* Comment */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#0F3D5E', marginBottom: 5 }}>
                  {lang === 'vi' ? 'Nhận xét chi tiết' : 'Detailed review'}
                </label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  maxLength={1000}
                  placeholder={lang === 'vi' ? 'Chia sẻ trải nghiệm, cảm nhận của bạn về di tích này...' : 'Share your experience and feelings about this heritage site...'}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              {/* Name + email */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#0F3D5E', marginBottom: 5 }}>
                    {lang === 'vi' ? 'Tên của bạn *' : 'Your name *'}
                  </label>
                  <input value={reviewerName} onChange={e => setReviewerName(e.target.value)} maxLength={150} placeholder={lang === 'vi' ? 'Họ và tên' : 'Full name'} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#0F3D5E', marginBottom: 5 }}>
                    {lang === 'vi' ? 'Email (không bắt buộc)' : 'Email (optional)'}
                  </label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} maxLength={254} placeholder="email@example.com" style={inputStyle} />
                </div>
              </div>

              {formError && (
                <div style={{ padding: '10px 12px', borderRadius: 6, background: '#FDEDEC', color: '#E74C3C', fontSize: 12, marginBottom: 12 }}>
                  {formError}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '10px 22px', borderRadius: 8,
                    background: submitting ? '#94a3b8' : '#D4A017',
                    border: 'none', color: 'white', fontSize: 13, fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(212,160,23,0.35)',
                  }}
                >
                  <Send size={13} />
                  {submitting ? (lang === 'vi' ? 'Đang gửi...' : 'Submitting...') : (lang === 'vi' ? 'Gửi đánh giá' : 'Submit review')}
                </button>
                <button
                  onClick={() => setFormOpen(false)}
                  style={{ padding: '10px 18px', borderRadius: 8, border: '1px solid rgba(15,61,94,0.15)', background: 'white', color: '#5d7a8c', fontSize: 13, cursor: 'pointer' }}
                >
                  {lang === 'vi' ? 'Hủy' : 'Cancel'}
                </button>
              </div>

              <div style={{ marginTop: 10, fontSize: 11, color: '#5d7a8c', display: 'flex', alignItems: 'center', gap: 5 }}>
                <ShieldCheck size={12} />
                {lang === 'vi'
                  ? 'Không cần đăng nhập. Đánh giá sẽ được duyệt trước khi hiển thị công khai.'
                  : 'No login required. Reviews are moderated before being published.'}
              </div>
            </div>
          )}

          {/* Recent reviews */}
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0F3D5E', marginBottom: 12, borderBottom: '1px solid rgba(15,61,94,0.08)', paddingBottom: 8 }}>
              {lang === 'vi' ? 'Nhận xét gần đây' : 'Recent reviews'}
            </div>
            {stats.recentComments.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#5d7a8c', fontSize: 13, background: '#F8FAFC', borderRadius: 8 }}>
                {lang === 'vi' ? 'Chưa có nhận xét nào. Hãy là người đầu tiên đánh giá!' : 'No reviews yet. Be the first to review!'}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {stats.recentComments.map(c => (
                  <div key={c.id} style={{ padding: '14px 16px', background: '#F8FAFC', borderRadius: 8, border: '1px solid rgba(15,61,94,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                          background: 'linear-gradient(135deg, #0F3D5E, #1A5276)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontSize: 11, fontWeight: 700,
                        }}>
                          {(c.reviewerName || '?').trim().charAt(0).toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#0F3D5E' }}>{c.reviewerName || 'Ẩn danh'}</div>
                          <div style={{ fontSize: 11, color: '#5d7a8c' }}>{formatDate(c.createdAt, lang)}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <StarRating value={c.score} size={13} />
                      </div>
                    </div>
                    {c.title && (
                      <div style={{ marginTop: 10, fontSize: 13, fontWeight: 700, color: '#1a2332' }}>{c.title}</div>
                    )}
                    {c.comment && (
                      <div style={{ marginTop: 4, fontSize: 13, color: '#1a2332', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{c.comment}</div>
                    )}
                    {c.adminReply && (
                      <div style={{ marginTop: 10, padding: '10px 12px', background: '#EBF5FB', borderRadius: 6, borderLeft: '3px solid #0F3D5E' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#0F3D5E', marginBottom: 3 }}>
                          {lang === 'vi' ? 'Phản hồi từ ban quản lý' : 'Reply from the management board'}
                        </div>
                        <div style={{ fontSize: 12, color: '#1a2332', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{c.adminReply}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {totalCommentPages > 1 && (
              <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center', gap: 6 }}>
                <button
                  onClick={() => loadStats(Math.max(1, commentPage - 1))}
                  disabled={commentPage <= 1}
                  style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid rgba(15,61,94,0.15)', background: 'white', color: '#0F3D5E', fontSize: 12, cursor: commentPage <= 1 ? 'default' : 'pointer', opacity: commentPage <= 1 ? 0.5 : 1 }}
                >
                  ←
                </button>
                <span style={{ fontSize: 12, color: '#5d7a8c', padding: '6px 8px' }}>
                  {lang === 'vi' ? 'Trang' : 'Page'} {commentPage}/{totalCommentPages}
                </span>
                <button
                  onClick={() => loadStats(Math.min(totalCommentPages, commentPage + 1))}
                  disabled={commentPage >= totalCommentPages}
                  style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid rgba(15,61,94,0.15)', background: 'white', color: '#0F3D5E', fontSize: 12, cursor: commentPage >= totalCommentPages ? 'default' : 'pointer', opacity: commentPage >= totalCommentPages ? 0.5 : 1 }}
                >
                  →
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ padding: '32px', textAlign: 'center', color: '#5d7a8c', fontSize: 13 }}>
          {lang === 'vi' ? 'Không thể tải đánh giá.' : 'Failed to load reviews.'}
        </div>
      )}
    </div>
  );
}
