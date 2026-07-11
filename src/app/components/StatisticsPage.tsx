import { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { fetchStatisticsOverview } from '../services/statisticsService';
import { classificationColors, heritageTypeIcons } from '../constants';
import { getImageUrl } from '../utils/url';
import {
  Building2, BookOpen, ImageIcon, Film, FileText, Star, Award, LayoutGrid,
  ArrowRight, Eye, MapPin
} from 'lucide-react';
import type { StatisticsOverview, HeritageType } from '../../core/types';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const classificationLabels: Record<string, { vi: string; en: string }> = {
  national: { vi: 'Quốc gia', en: 'National' },
  city: { vi: 'Thành phố', en: 'City' },
  unranked: { vi: 'Chưa xếp hạng', en: 'Unranked' },
};

const statusLabels: Record<string, { vi: string; en: string }> = {
  active: { vi: 'Đang hoạt động', en: 'Active' },
  maintenance: { vi: 'Đang trùng tu', en: 'Maintenance' },
  closed: { vi: 'Tạm đóng cửa', en: 'Closed' },
};

const statusColors: Record<string, string> = {
  active: '#27AE60',
  maintenance: '#F39C12',
  closed: '#E74C3C',
};

interface StatisticsPageProps {
  onNavigate: (page: string, id?: string) => void;
}

export function StatisticsPage({ onNavigate }: StatisticsPageProps) {
  const { lang, t } = useLanguage();
  const [data, setData] = useState<StatisticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatisticsOverview()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ background: '#F0F4F8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5d7a8c', fontSize: 13 }}>
        {t('common.loading')}
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ background: '#F0F4F8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5d7a8c', fontSize: 13 }}>
        {t('common.error')}
      </div>
    );
  }

  const summaryCards = [
    { label: lang === 'vi' ? 'Tổng di tích' : 'Total Heritage', value: data.totalHeritage, icon: <Building2 size={22} />, color: '#0F3D5E' },
    { label: lang === 'vi' ? 'Quốc gia' : 'National', value: data.nationalCount, icon: <Star size={22} />, color: classificationColors.national },
    { label: lang === 'vi' ? 'Thành phố' : 'City', value: data.cityCount, icon: <Award size={22} />, color: classificationColors.city },
    { label: lang === 'vi' ? 'Chưa xếp hạng' : 'Unranked', value: data.unrankedCount, icon: <LayoutGrid size={22} />, color: classificationColors.unranked },
    { label: lang === 'vi' ? 'Phi vật thể' : 'Intangible', value: data.totalIntangible, icon: <BookOpen size={22} />, color: '#D4A017' },
    { label: lang === 'vi' ? 'Hình ảnh' : 'Images', value: data.totalImages, icon: <ImageIcon size={22} />, color: '#27AE60' },
    { label: lang === 'vi' ? 'Video' : 'Videos', value: data.totalVideos, icon: <Film size={22} />, color: '#8E44AD' },
    { label: lang === 'vi' ? 'Tài liệu' : 'Documents', value: data.totalDocuments, icon: <FileText size={22} />, color: '#E67E22' },
  ];

  const pieData = data.classificationBreakdown.map(item => ({
    name: classificationLabels[item.classification]?.[lang] || item.classification,
    value: item.count,
    color: classificationColors[item.classification as keyof typeof classificationColors] || '#7F8C8D',
  }));

  const typeChartData = data.typeBreakdown.map(item => ({
    name: lang === 'vi' ? item.nameVi : item.nameEn,
    value: item.count,
  }));

  const monthChartData = data.monthlyUpdates.map(item => ({
    name: lang === 'vi' ? item.displayVi : item.displayEn,
    value: item.updateCount,
  }));

  const statusData = data.statusBreakdown.map(item => ({
    name: statusLabels[item.status]?.[lang] || item.status,
    value: item.count,
    color: statusColors[item.status] || '#7F8C8D',
  }));

  const chartColors = ['#0F3D5E', '#D4A017', '#27AE60', '#E74C3C', '#8E44AD', '#2C3E50', '#16A085', '#F39C12', '#2980B9'];

  return (
    <div style={{ background: '#F0F4F8', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: '#0F3D5E', padding: '40px 24px 48px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ color: '#D4A017', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
            {lang === 'vi' ? 'Phân tích dữ liệu' : 'Data Analytics'}
          </div>
          <h1 style={{ color: 'white', fontSize: 26, fontFamily: 'Merriweather, serif', fontWeight: 700, margin: 0 }}>
            {lang === 'vi' ? 'Thống kê di sản văn hóa' : 'Cultural Heritage Statistics'}
          </h1>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px', transform: 'translateY(-24px)' }}>
        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
          {summaryCards.map(card => (
            <div key={card.label} style={{
              background: 'white', borderRadius: 10, padding: '16px',
              boxShadow: '0 2px 8px rgba(15,61,94,0.06)',
              border: `1px solid ${card.color}18`,
              textAlign: 'center',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: `${card.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 8px', color: card.color,
              }}>
                {card.icon}
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: card.color, lineHeight: 1, marginBottom: 4 }}>{card.value}</div>
              <div style={{ fontSize: 11, color: '#5d7a8c', fontWeight: 500 }}>{card.label}</div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
          {/* Classification pie chart */}
          <div style={{ background: 'white', borderRadius: 12, padding: '20px', boxShadow: '0 2px 12px rgba(15,61,94,0.08)' }}>
            <h3 style={{ color: '#0F3D5E', fontSize: 15, fontFamily: 'Merriweather, serif', fontWeight: 700, margin: '0 0 16px' }}>
              {lang === 'vi' ? 'Phân bố xếp hạng' : 'Classification Distribution'}
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, lang === 'vi' ? 'Số lượng' : 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Status breakdown */}
          <div style={{ background: 'white', borderRadius: 12, padding: '20px', boxShadow: '0 2px 12px rgba(15,61,94,0.08)' }}>
            <h3 style={{ color: '#0F3D5E', fontSize: 15, fontFamily: 'Merriweather, serif', fontWeight: 700, margin: '0 0 16px' }}>
              {lang === 'vi' ? 'Trạng thái di tích' : 'Heritage Status'}
            </h3>
            {statusData.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 20 }}>
                {statusData.map(item => {
                  const pct = data.totalHeritage > 0 ? Math.round((item.value / data.totalHeritage) * 100) : 0;
                  return (
                    <div key={item.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 13, color: '#1a2332', fontWeight: 500 }}>{item.name}</span>
                        <span style={{ fontSize: 13, color: '#5d7a8c', fontWeight: 600 }}>{item.value} ({pct}%)</span>
                      </div>
                      <div style={{ height: 10, borderRadius: 5, background: '#F0F4F8', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, borderRadius: 5, background: item.color, transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ color: '#5d7a8c', fontSize: 13, padding: 40, textAlign: 'center' }}>
                {lang === 'vi' ? 'Không có dữ liệu' : 'No data available'}
              </div>
            )}
          </div>
        </div>

        {/* Type breakdown bar chart */}
        <div style={{ background: 'white', borderRadius: 12, padding: '20px', boxShadow: '0 2px 12px rgba(15,61,94,0.08)', marginBottom: 24 }}>
          <h3 style={{ color: '#0F3D5E', fontSize: 15, fontFamily: 'Merriweather, serif', fontWeight: 700, margin: '0 0 16px' }}>
            {lang === 'vi' ? 'Phân bố loại hình di tích' : 'Heritage Type Distribution'}
          </h3>
          {typeChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={typeChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F8" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#5d7a8c' }} />
                <YAxis tick={{ fontSize: 11, fill: '#5d7a8c' }} allowDecimals={false} />
                <Tooltip formatter={(value) => [value, lang === 'vi' ? 'Số lượng' : 'Count']} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {typeChartData.map((_, i) => (
                    <Cell key={i} fill={chartColors[i % chartColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ color: '#5d7a8c', fontSize: 13, padding: 40, textAlign: 'center' }}>
              {lang === 'vi' ? 'Không có dữ liệu' : 'No data available'}
            </div>
          )}
        </div>

        {/* Monthly updates chart */}
        {monthChartData.length > 0 && (
          <div style={{ background: 'white', borderRadius: 12, padding: '20px', boxShadow: '0 2px 12px rgba(15,61,94,0.08)', marginBottom: 24 }}>
            <h3 style={{ color: '#0F3D5E', fontSize: 15, fontFamily: 'Merriweather, serif', fontWeight: 700, margin: '0 0 16px' }}>
              {lang === 'vi' ? 'Cập nhật hàng tháng' : 'Monthly Updates'}
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F8" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#5d7a8c' }} />
                <YAxis tick={{ fontSize: 11, fill: '#5d7a8c' }} allowDecimals={false} />
                <Tooltip formatter={(value) => [value, lang === 'vi' ? 'Cập nhật' : 'Updates']} />
                <Bar dataKey="value" fill="#D4A017" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recent heritage updates */}
        {data.recentHeritages.length > 0 && (
          <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 2px 12px rgba(15,61,94,0.08)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(15,61,94,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: '#0F3D5E', fontSize: 15, fontFamily: 'Merriweather, serif', fontWeight: 700, margin: 0 }}>
                {lang === 'vi' ? 'Cập nhật gần đây' : 'Recent Updates'}
              </h3>
              <button onClick={() => onNavigate('relics')} style={{
                display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 6,
                border: '1px solid rgba(15,61,94,0.1)', background: 'white', color: '#0F3D5E',
                fontSize: 12, cursor: 'pointer', fontWeight: 600,
              }}>
                {lang === 'vi' ? 'Xem tất cả' : 'View All'} <ArrowRight size={12} />
              </button>
            </div>
            <div>
              {data.recentHeritages.map(site => (
                <div key={site.id} style={{
                  padding: '12px 20px', borderBottom: '1px solid rgba(15,61,94,0.04)',
                  display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                }}
                  onClick={() => onNavigate('heritage-detail', site.id)}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#F0F4F8'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                >
                  <img
                    src={getImageUrl(site.image)}
                    alt=""
                    style={{ width: 44, height: 36, borderRadius: 6, objectFit: 'cover', flexShrink: 0, background: '#dce8f0' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0F3D5E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {lang === 'vi' ? site.nameVi : site.nameEn}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#5d7a8c' }}>
                      <span>{site.code}</span>
                      <span>·</span>
                      <span>{classificationLabels[site.classification]?.[lang] || site.classification}</span>
                      {site.type && heritageTypeIcons[site.type as HeritageType] && (
                        <>
                          <span>·</span>
                          <span>{heritageTypeIcons[site.type as HeritageType]}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#5d7a8c', fontSize: 11, flexShrink: 0 }}>
                    <Eye size={11} />
                    <span>{site.updatedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer note */}
        <div style={{ textAlign: 'center', color: '#5d7a8c', fontSize: 11, marginTop: 24 }}>
          {lang === 'vi'
            ? `Dữ liệu thống kê được cập nhật từ hệ thống quản lý di sản văn hóa Vân Đình`
            : `Statistics data updated from Van Dinh cultural heritage management system`}
        </div>
      </div>
    </div>
  );
}
