import { useLanguage } from './LanguageContext';
import { useHeritageSites, useIntangibleHeritage, useMonthlyUpdates, useClassificationLabels, useTypeLabels } from '../../presentation/hooks/useHeritageData';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { TrendingUp, Building2, Star, Award, LayoutGrid, BookOpen } from 'lucide-react';

interface StatisticsPageProps {
  isAdmin?: boolean;
  onNavigate?: (page: string) => void;
}

const COLORS = ['#E74C3C', '#1A5276', '#7F8C8D', '#D4A017', '#27AE60', '#8E44AD', '#2980B9', '#F39C12', '#16A085'];

export function StatisticsPage({ isAdmin = false, onNavigate }: StatisticsPageProps) {
  const { lang, t } = useLanguage();
  const { data: heritageSites } = useHeritageSites();
  const { data: intangibleHeritage } = useIntangibleHeritage();
  const { data: monthlyUpdates } = useMonthlyUpdates();
  const classificationLabels = useClassificationLabels();
  const typeLabels = useTypeLabels();

  const nationalCount = heritageSites.filter(h => h.classification === 'national').length;
  const cityCount = heritageSites.filter(h => h.classification === 'city').length;
  const unrankedCount = heritageSites.filter(h => h.classification === 'unranked').length;

  const classificationData = [
    { name: classificationLabels.national[lang], value: nationalCount, color: '#E74C3C' },
    { name: classificationLabels.city[lang], value: cityCount, color: '#1A5276' },
    { name: classificationLabels.unranked[lang], value: unrankedCount, color: '#7F8C8D' },
  ];

  // Type distribution
  const typeCounts = heritageSites.reduce((acc, site) => {
    acc[site.type] = (acc[site.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const typeData = Object.entries(typeCounts).map(([type, count], i) => ({
    name: typeLabels[type as keyof typeof typeLabels][lang],
    count,
    fill: COLORS[i % COLORS.length],
  }));

  // Intangible by category
  const intangibleCats = intangibleHeritage.reduce((acc, item) => {
    const cat = item.category;
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const intangibleData = Object.entries(intangibleCats).map(([cat, count]) => ({
    name: t(`intangible.${cat}`),
    value: count,
  }));

  const monthlyData = monthlyUpdates.map(m => ({
    name: lang === 'vi' ? m.vi : m.en,
    updates: m.count,
    cumulative: monthlyUpdates.slice(0, monthlyUpdates.indexOf(m) + 1).reduce((s, x) => s + x.count, 0),
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'white', border: '1px solid rgba(15,61,94,0.1)', borderRadius: 8, padding: '10px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: '0 0 4px', fontWeight: 700, color: '#0F3D5E', fontSize: 12 }}>{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} style={{ margin: 0, fontSize: 12, color: p.color || '#5d7a8c' }}>
              {p.name}: <strong>{p.value}</strong>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" style={{ fontSize: 11, fontWeight: 700 }}>
        {value}
      </text>
    );
  };

  return (
    <div style={{ padding: isAdmin ? '24px' : '40px 24px', background: isAdmin ? 'transparent' : '#F0F4F8', minHeight: isAdmin ? 'auto' : '100vh' }}>
      {!isAdmin && (
        <div style={{ maxWidth: 1280, margin: '0 auto 32px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#D4A017', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              {lang === 'vi' ? 'Dữ liệu thống kê' : 'Statistical Data'}
            </div>
            <h1 style={{ color: '#0F3D5E', fontSize: 28, fontFamily: 'Merriweather, serif', fontWeight: 700, margin: '0 0 12px' }}>
              {t('stats_page.title')}
            </h1>
            <div style={{ background: 'linear-gradient(90deg, transparent, #D4A017, transparent)', height: 2, maxWidth: 100, margin: '0 auto' }} />
          </div>
        </div>
      )}

      {isAdmin && (
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ color: '#0F3D5E', margin: 0, fontSize: 20, fontFamily: 'Merriweather, serif' }}>
            {t('admin.statistics')}
          </h1>
        </div>
      )}

      <div style={{ maxWidth: isAdmin ? '100%' : 1280, margin: '0 auto' }}>
        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
          {[
            { label: t('stats.total'), value: heritageSites.length, icon: <Building2 size={18} />, color: '#0F3D5E' },
            { label: t('stats.national'), value: nationalCount, icon: <Star size={18} />, color: '#E74C3C' },
            { label: t('stats.city'), value: cityCount, icon: <Award size={18} />, color: '#1A5276' },
            { label: t('stats.unranked'), value: unrankedCount, icon: <LayoutGrid size={18} />, color: '#7F8C8D' },
            { label: t('stats.intangible'), value: intangibleHeritage.length, icon: <BookOpen size={18} />, color: '#D4A017' },
            { label: lang === 'vi' ? 'Cập nhật 2024' : '2024 Updates', value: monthlyUpdates.reduce((s, m) => s + m.count, 0), icon: <TrendingUp size={18} />, color: '#27AE60' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'white', borderRadius: 10, padding: '14px',
              boxShadow: '0 2px 8px rgba(15,61,94,0.06)',
              border: `1px solid ${s.color}15`,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#5d7a8c', marginTop: 2 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          {/* Classification pie chart */}
          <div style={{ background: 'white', borderRadius: 10, padding: '20px', boxShadow: '0 2px 8px rgba(15,61,94,0.06)' }}>
            <h3 style={{ color: '#0F3D5E', fontSize: 14, fontWeight: 700, margin: '0 0 16px', borderLeft: '3px solid #D4A017', paddingLeft: 10 }}>
              {t('stats_page.by_classification')}
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={classificationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                  labelLine={false}
                  label={CustomPieLabel}
                >
                  {classificationData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value) => <span style={{ fontSize: 12, color: '#5d7a8c' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Type bar chart */}
          <div style={{ background: 'white', borderRadius: 10, padding: '20px', boxShadow: '0 2px 8px rgba(15,61,94,0.06)' }}>
            <h3 style={{ color: '#0F3D5E', fontSize: 14, fontWeight: 700, margin: '0 0 16px', borderLeft: '3px solid #D4A017', paddingLeft: 10 }}>
              {t('stats_page.by_type')}
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={typeData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,61,94,0.06)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#5d7a8c' }} />
                <YAxis tick={{ fontSize: 10, fill: '#5d7a8c' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} label={{ position: 'top', fontSize: 10, fill: '#5d7a8c' }}>
                  {typeData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly updates area chart */}
        <div style={{ background: 'white', borderRadius: 10, padding: '20px', boxShadow: '0 2px 8px rgba(15,61,94,0.06)', marginBottom: 20 }}>
          <h3 style={{ color: '#0F3D5E', fontSize: 14, fontWeight: 700, margin: '0 0 16px', borderLeft: '3px solid #D4A017', paddingLeft: 10 }}>
            {t('stats_page.updates')}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUpdates" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0F3D5E" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0F3D5E" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4A017" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#D4A017" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,61,94,0.06)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#5d7a8c' }} />
              <YAxis tick={{ fontSize: 11, fill: '#5d7a8c' }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={(value) => <span style={{ fontSize: 11, color: '#5d7a8c' }}>{value}</span>} />
              <Area
                type="monotone" dataKey="updates" name={lang === 'vi' ? 'Cập nhật trong tháng' : 'Monthly Updates'}
                stroke="#0F3D5E" fill="url(#colorUpdates)" strokeWidth={2}
              />
              <Area
                type="monotone" dataKey="cumulative" name={lang === 'vi' ? 'Lũy kế' : 'Cumulative'}
                stroke="#D4A017" fill="url(#colorCumulative)" strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Intangible heritage breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={{ background: 'white', borderRadius: 10, padding: '20px', boxShadow: '0 2px 8px rgba(15,61,94,0.06)' }}>
            <h3 style={{ color: '#0F3D5E', fontSize: 14, fontWeight: 700, margin: '0 0 16px', borderLeft: '3px solid #D4A017', paddingLeft: 10 }}>
              {t('stats.intangible')}
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={intangibleData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name} (${value})`} labelLine={false}>
                  {intangibleData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Status overview */}
          <div style={{ background: 'white', borderRadius: 10, padding: '20px', boxShadow: '0 2px 8px rgba(15,61,94,0.06)' }}>
            <h3 style={{ color: '#0F3D5E', fontSize: 14, fontWeight: 700, margin: '0 0 16px', borderLeft: '3px solid #D4A017', paddingLeft: 10 }}>
              {lang === 'vi' ? 'Phân bố di tích theo loại hình' : 'Heritage Distribution by Type'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {typeData.slice(0, 6).map(item => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: item.fill, flexShrink: 0 }} />
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#5d7a8c' }}>{item.name}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#0F3D5E' }}>{item.count}</span>
                  </div>
                  <div style={{ width: 80, height: 6, borderRadius: 3, background: '#F0F4F8', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(item.count / heritageSites.length) * 100}%`, borderRadius: 3, background: item.fill }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
