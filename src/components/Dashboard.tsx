import React from 'react';
import { 
  Users, 
  Banknote, 
  MapPin, 
  Building2, 
  HeartHandshake, 
  BookOpen, 
  Tv, 
  Plus, 
  Flame,
  CheckCircle2,
  Calendar,
  Filter,
  FileText
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell
} from 'recharts';
import { useTajneed } from '../context/TajneedContext';
import { ALL_REGIONS, getMajlisesForRegion } from '../data/regionsAndMajlis';
import { CustomDashboardWidget, Member } from '../types/tajneed';
import { MajlisPdfExportModal } from './MajlisPdfExportModal';

const COLORS = ['#059669', '#2563eb', '#7c3aed', '#d97706', '#dc2626', '#0d9488', '#4b5563', '#ea580c'];

interface DashboardProps {
  onNavigateToBuilder: () => void;
  onNavigateToRegistry: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  onNavigateToBuilder,
  onNavigateToRegistry
}) => {
  const { 
    filteredMembers, 
    stats, 
    filters, 
    setFilters, 
    resetFilters,
    customWidgets 
  } = useTajneed();

  const [isPdfModalOpen, setIsPdfModalOpen] = React.useState(false);

  const isFiltered = filters.region || filters.majlis || filters.occupation || filters.education || filters.ageRange !== 'all';

  // Compute a custom widget's value based on filtered data
  const computeCustomWidget = (widget: CustomDashboardWidget) => {
    let dataset = filteredMembers;
    
    if (widget.filterRegion) {
      dataset = dataset.filter(m => m.region === widget.filterRegion);
    }
    if (widget.filterMajlis) {
      dataset = dataset.filter(m => m.majlis === widget.filterMajlis);
    }
    if (widget.filterOccupation) {
      dataset = dataset.filter(m => m.occupation.toLowerCase().includes((widget.filterOccupation || '').toLowerCase()));
    }
    if (widget.filterEducation) {
      dataset = dataset.filter(m => m.education.toLowerCase().includes((widget.filterEducation || '').toLowerCase()));
    }
    if (widget.filterConditionField) {
      dataset = dataset.filter(m => {
        const val = m[widget.filterConditionField as keyof Member];
        if (typeof widget.filterConditionValue === 'boolean') {
          return val === widget.filterConditionValue;
        }
        return String(val).toLowerCase() === String(widget.filterConditionValue).toLowerCase();
      });
    }

    const count = dataset.length;
    if (widget.metricType === 'count') {
      return { value: count.toLocaleString(), unit: 'Members' };
    }
    if (widget.metricType === 'sum_income') {
      const sum = dataset.reduce((acc, m) => acc + (m.monthlyIncome || 0), 0);
      return { value: `৳${sum.toLocaleString()}`, unit: 'Total Monthly Income' };
    }
    if (widget.metricType === 'avg_income') {
      const sum = dataset.reduce((acc, m) => acc + (m.monthlyIncome || 0), 0);
      const avg = count > 0 ? Math.round(sum / count) : 0;
      return { value: `৳${avg.toLocaleString()}`, unit: 'Avg Monthly Income' };
    }
    if (widget.metricType === 'avg_age') {
      const ages = dataset.filter(m => m.age && m.age > 0);
      const avg = ages.length > 0 ? Math.round(ages.reduce((acc, m) => acc + (m.age || 0), 0) / ages.length) : 0;
      return { value: `${avg} yrs`, unit: 'Average Age' };
    }
    if (widget.metricType === 'avg_family') {
      const avg = count > 0 ? (dataset.reduce((acc, m) => acc + (m.familyMembers || 0), 0) / count).toFixed(1) : '0';
      return { value: avg, unit: 'Avg Family Size' };
    }
    if (widget.metricType === 'percentage') {
      const totalCount = filteredMembers.length || 1;
      const pct = Math.round((count / totalCount) * 100);
      return { value: `${pct}%`, unit: `of ${totalCount} members` };
    }
    return { value: count.toLocaleString(), unit: '' };
  };

  const getWidgetColorClasses = (color: CustomDashboardWidget['colorScheme']) => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-50 text-emerald-900 border-emerald-200';
      case 'indigo':
        return 'bg-indigo-50 text-indigo-900 border-indigo-200';
      case 'amber':
        return 'bg-amber-50 text-amber-900 border-amber-200';
      case 'rose':
        return 'bg-rose-50 text-rose-900 border-rose-200';
      case 'teal':
        return 'bg-teal-50 text-teal-900 border-teal-200';
      case 'slate':
      default:
        return 'bg-slate-50 text-slate-900 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Bar: Regional & Majlis Filter Selector */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Tajneed Statistics & Analytics Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time demographic, spiritual, and financial insights derived from Member Registry data
          </p>
        </div>

        {/* Quick Dropdown Selectors for Region & Majlis */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Filter by:</span>
          </div>

          {/* Region dropdown */}
          <select
            id="dashboard-filter-region"
            value={filters.region}
            onChange={(e) => setFilters(prev => ({ ...prev, region: e.target.value, majlis: '' }))}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full sm:w-auto max-w-full truncate"
          >
            <option value="">All Regions ({ALL_REGIONS.length})</option>
            {ALL_REGIONS.map(reg => (
              <option key={reg} value={reg}>{reg}</option>
            ))}
          </select>

          {/* Majlis dropdown */}
          <select
            id="dashboard-filter-majlis"
            value={filters.majlis}
            onChange={(e) => setFilters(prev => ({ ...prev, majlis: e.target.value }))}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full sm:w-auto max-w-full truncate"
          >
            <option value="">
              {filters.region ? `All Majlises in ${filters.region}` : 'All Majlises'}
            </option>
            {getMajlisesForRegion(filters.region).map(maj => (
              <option key={maj} value={maj}>{maj}</option>
            ))}
          </select>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isFiltered && (
              <button
                onClick={resetFilters}
                className="text-xs text-slate-500 hover:text-red-600 px-2 py-1 font-medium transition"
              >
                Reset Filters
              </button>
            )}

            <button
              onClick={() => setIsPdfModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg shadow-sm transition whitespace-nowrap"
              title="Export Majlis PDF"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-200" />
              <span>Majlis PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row 1: High-Level Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Members */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Members
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-900">
                {stats.filteredCount.toLocaleString()}
              </span>
              {stats.filteredCount !== stats.totalMembers && (
                <span className="text-xs text-slate-400">
                  of {stats.totalMembers.toLocaleString()}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Across {stats.totalRegions} Regions & {stats.totalMajlis} Majlises
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Monthly Income Total */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Monthly Income
            </p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-slate-900">
                ৳{stats.totalIncome.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Avg: ৳{stats.avgIncome.toLocaleString()} / member
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Banknote className="w-6 h-6" />
          </div>
        </div>

        {/* Average Age & Demographics */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Average Age
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-900">
                {stats.avgAge}
              </span>
              <span className="text-xs text-slate-500">Years</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {stats.totalFamilyMembers.toLocaleString()} family dependents
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Wasiyyat & Chanda Aam Coverage */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Wasiyyat (Musi) Rate
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-indigo-700">
                {stats.musiRate}%
              </span>
              <span className="text-xs font-medium text-slate-500">
                ({Math.round((stats.musiRate * stats.filteredCount) / 100)} Musian)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Chanda Aam Budgeted: {stats.chandaAamRate}%
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <HeartHandshake className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Admin Custom Dashboard Metrics Section */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                Custom Dashboard Data & Metrics
              </h2>
              <span className="text-xs bg-slate-200 text-slate-700 font-medium px-2 py-0.5 rounded-full">
                Admin Created ({customWidgets.length})
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Custom criteria cards defined by administrator to monitor specific regions, professions, or statuses
            </p>
          </div>

          <button
            onClick={onNavigateToBuilder}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-300 rounded-lg shadow-2xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Custom Metric</span>
          </button>
        </div>

        {/* Custom Widget Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {customWidgets.map(widget => {
            const computed = computeCustomWidget(widget);
            const colorClass = getWidgetColorClasses(widget.colorScheme);
            return (
              <div 
                key={widget.id}
                className={`p-4 rounded-xl border transition shadow-2xs ${colorClass}`}
              >
                <p className="text-xs font-semibold uppercase tracking-wider opacity-80 line-clamp-1">
                  {widget.title}
                </p>
                <p className="text-2xl font-bold mt-1.5">
                  {computed.value}
                </p>
                <p className="text-xs opacity-75 mt-0.5">
                  {computed.unit || widget.description}
                </p>
                {widget.filterRegion && (
                  <div className="mt-2 inline-flex items-center gap-1 text-[11px] bg-white/60 px-2 py-0.5 rounded-md font-medium">
                    <MapPin className="w-3 h-3" />
                    <span>{widget.filterRegion}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 2: Spiritual Practices & Financial Contribution Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Spiritual & Religious Practice Stats */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Spiritual & Religious Observances
                </h3>
                <p className="text-xs text-slate-500">
                  Adherence rates among current filtered population ({stats.filteredCount})
                </p>
              </div>
            </div>
            <button
              onClick={onNavigateToRegistry}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
            >
              View Registry →
            </button>
          </div>

          <div className="space-y-3.5 pt-1">
            {/* 5 Daily Prayers */}
            <div>
              <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1">
                <span>নিয়মিত ৫ ওয়াক্ত নামাজ (5 Daily Prayers)</span>
                <span className="font-bold text-slate-900">{stats.salatRate}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${stats.salatRate}%` }} 
                />
              </div>
            </div>

            {/* Friday Prayers */}
            <div>
              <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1">
                <span>নিয়মিত জুমআর নামাজ (Regular Friday Prayer)</span>
                <span className="font-bold text-slate-900">{stats.jummahRate}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${stats.jummahRate}%` }} 
                />
              </div>
            </div>

            {/* Quran Nazira */}
            <div>
              <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1">
                <span>কুরআন শিক্ষা: নাজেরা (Quran Nazira Knowledge)</span>
                <span className="font-bold text-slate-900">{stats.naziraRate}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-teal-600 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${stats.naziraRate}%` }} 
                />
              </div>
            </div>

            {/* Daily Quran Recitation */}
            <div>
              <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1">
                <span>প্রত্যহ কোরআন তেলওয়াত (Daily Quran Recitation)</span>
                <span className="font-bold text-slate-900">{stats.tilawatRate}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${stats.tilawatRate}%` }} 
                />
              </div>
            </div>

            {/* MTA Khutba Viewers */}
            <div>
              <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1">
                <span>এমটিএ-তে হুযুর (আইঃ) এর খুৎবা দর্শন ও শ্রবণ (MTA Sermon)</span>
                <span className="font-bold text-slate-900">{stats.mtaRate}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-600 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${stats.mtaRate}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Financial & Chanda Participation */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <Banknote className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Financial Sacrifice & Chanda Schemes
                </h3>
                <p className="text-xs text-slate-500">
                  Active participation in obligatory & auxiliary contributions
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 block">চাঁদায়ে আম (Chanda Aam)</span>
              <span className="text-xl font-bold text-slate-900 mt-1 block">{stats.chandaAamRate}%</span>
              <span className="text-[10px] text-slate-400">Budgeted members</span>
            </div>

            <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
              <span className="text-[11px] font-semibold text-indigo-600 block">ওসীয়ত (Wasiyyat)</span>
              <span className="text-xl font-bold text-indigo-900 mt-1 block">{stats.musiRate}%</span>
              <span className="text-[10px] text-indigo-600">Al-Wasiyyat dedicated</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 block">তাহরীকে জাদীদ (TJ)</span>
              <span className="text-xl font-bold text-slate-900 mt-1 block">{stats.tahrikRate}%</span>
              <span className="text-[10px] text-slate-400">Global mission fund</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 block">ওয়াকফে জাদীদ (WJ)</span>
              <span className="text-xl font-bold text-slate-900 mt-1 block">{stats.waqRate}%</span>
              <span className="text-[10px] text-slate-400">Rural development</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 block">মজলিস চাঁদা (Majlis)</span>
              <span className="text-xl font-bold text-slate-900 mt-1 block">{stats.majlisRate}%</span>
              <span className="text-[10px] text-slate-400">Local sub-organization</span>
            </div>

            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
              <span className="text-[11px] font-semibold text-emerald-700 block">Combined Total</span>
              <span className="text-xl font-bold text-emerald-900 mt-1 block">৳{(stats.totalIncome / 1000).toFixed(0)}k</span>
              <span className="text-[10px] text-emerald-700">Monthly base capacity</span>
            </div>
          </div>
        </div>

      </div>

      {/* Row 3: Charts (Regions and Top Majlis) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Members by Region Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Members Distribution by Region</span>
            </h3>
            <span className="text-xs text-slate-400">Top Regions</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.regionDistribution.slice(0, 7)}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  formatter={(value: number) => [`${value} Members`, 'Count']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Majlises Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Top Majlises by Member Strength</span>
            </h3>
            <span className="text-xs text-slate-400">Highest Registered</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.topMajlisDistribution.slice(0, 7)}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  formatter={(value: number, name: string, item: any) => [
                    `${value} Members (${item.payload.region})`, 
                    'Count'
                  ]}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Row 4: Education, Profession & Age Group Demographics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Education Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>Educational Qualifications</span>
          </h3>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.educationDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {stats.educationDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value} Members`, 'Count']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Mini Legend */}
          <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600 pt-1">
            {stats.educationDistribution.slice(0, 4).map((item, idx) => (
              <div key={item.name} className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="truncate">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Occupation Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>Professions & Careers</span>
          </h3>

          <div className="space-y-2 pt-2">
            {stats.occupationDistribution.slice(0, 5).map((occ, idx) => {
              const pct = Math.round((occ.value / stats.filteredCount) * 100);
              return (
                <div key={occ.name} className="text-xs">
                  <div className="flex items-center justify-between text-slate-700 font-medium mb-0.5">
                    <span className="truncate">{occ.name}</span>
                    <span className="text-slate-500">{occ.value} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full rounded-full" 
                      style={{ width: `${pct}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Age Groups Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-amber-600" />
            <span>Age Distribution</span>
          </h3>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.ageGroupDistribution}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  formatter={(value: number) => [`${value} Members`, 'Count']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#d97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Majlis PDF Export Modal */}
      <MajlisPdfExportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        defaultRegion={filters.region}
        defaultMajlis={filters.majlis}
      />

    </div>
  );
};
