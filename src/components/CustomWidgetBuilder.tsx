import React, { useState, useMemo } from 'react';
import { 
  SlidersHorizontal, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Eye, 
  Sparkles,
  MapPin,
  Check
} from 'lucide-react';
import { useTajneed } from '../context/TajneedContext';
import { ALL_REGIONS, getMajlisesForRegion, COMMON_EDUCATIONS, COMMON_OCCUPATIONS } from '../data/regionsAndMajlis';
import { CustomDashboardWidget, CustomWidgetMetricType, Member } from '../types/tajneed';

export const CustomWidgetBuilder: React.FC = () => {
  const { 
    members, 
    customWidgets, 
    addCustomWidget, 
    deleteCustomWidget, 
    resetCustomWidgets 
  } = useTajneed();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedMajlis, setSelectedMajlis] = useState('');
  const [selectedOccupation, setSelectedOccupation] = useState('');
  const [selectedEducation, setSelectedEducation] = useState('');
  const [conditionField, setConditionField] = useState<keyof Member | ''>('isMusi');
  const [conditionValue, setConditionValue] = useState<boolean | string>(true);
  const [metricType, setMetricType] = useState<CustomWidgetMetricType>('count');
  const [colorScheme, setColorScheme] = useState<CustomDashboardWidget['colorScheme']>('emerald');

  const availableMajlises = useMemo(() => {
    return selectedRegion ? getMajlisesForRegion(selectedRegion) : [];
  }, [selectedRegion]);

  // Compute preview value
  const previewData = useMemo(() => {
    let dataset = members;

    if (selectedRegion) {
      dataset = dataset.filter(m => m.region === selectedRegion);
    }
    if (selectedMajlis) {
      dataset = dataset.filter(m => m.majlis === selectedMajlis);
    }
    if (selectedOccupation) {
      dataset = dataset.filter(m => m.occupation.toLowerCase().includes(selectedOccupation.toLowerCase()));
    }
    if (selectedEducation) {
      dataset = dataset.filter(m => m.education.toLowerCase().includes(selectedEducation.toLowerCase()));
    }
    if (conditionField) {
      dataset = dataset.filter(m => {
        const val = m[conditionField];
        if (typeof conditionValue === 'boolean') {
          return val === conditionValue;
        }
        return String(val).toLowerCase() === String(conditionValue).toLowerCase();
      });
    }

    const count = dataset.length;
    let computedValue = '';
    let unit = '';

    if (metricType === 'count') {
      computedValue = count.toLocaleString();
      unit = 'Members';
    } else if (metricType === 'sum_income') {
      const sum = dataset.reduce((acc, m) => acc + (m.monthlyIncome || 0), 0);
      computedValue = `৳${sum.toLocaleString()}`;
      unit = 'Total Monthly Income';
    } else if (metricType === 'avg_income') {
      const sum = dataset.reduce((acc, m) => acc + (m.monthlyIncome || 0), 0);
      const avg = count > 0 ? Math.round(sum / count) : 0;
      computedValue = `৳${avg.toLocaleString()}`;
      unit = 'Average Income';
    } else if (metricType === 'avg_age') {
      const validAges = dataset.filter(m => m.age && m.age > 0);
      const avg = validAges.length > 0 ? Math.round(validAges.reduce((acc, m) => acc + (m.age || 0), 0) / validAges.length) : 0;
      computedValue = `${avg} yrs`;
      unit = 'Average Age';
    } else if (metricType === 'avg_family') {
      const avg = count > 0 ? (dataset.reduce((acc, m) => acc + (m.familyMembers || 0), 0) / count).toFixed(1) : '0';
      computedValue = avg;
      unit = 'Average Family Size';
    } else if (metricType === 'percentage') {
      const pct = members.length > 0 ? Math.round((count / members.length) * 100) : 0;
      computedValue = `${pct}%`;
      unit = `of total ${members.length.toLocaleString()} members`;
    }

    return { count, computedValue, unit };
  }, [
    members, 
    selectedRegion, 
    selectedMajlis, 
    selectedOccupation, 
    selectedEducation, 
    conditionField, 
    conditionValue, 
    metricType
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addCustomWidget({
      title: title.trim(),
      description: description.trim() || undefined,
      filterRegion: selectedRegion || undefined,
      filterMajlis: selectedMajlis || undefined,
      filterOccupation: selectedOccupation || undefined,
      filterEducation: selectedEducation || undefined,
      filterConditionField: conditionField ? conditionField : undefined,
      filterConditionValue: conditionField ? conditionValue : undefined,
      metricType,
      colorScheme
    });

    // Reset form
    setTitle('');
    setDescription('');
  };

  const getWidgetBgClass = (color: CustomDashboardWidget['colorScheme']) => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-50 text-emerald-950 border-emerald-300';
      case 'indigo':
        return 'bg-indigo-50 text-indigo-950 border-indigo-300';
      case 'amber':
        return 'bg-amber-50 text-amber-950 border-amber-300';
      case 'rose':
        return 'bg-rose-50 text-rose-950 border-rose-300';
      case 'teal':
        return 'bg-teal-50 text-teal-950 border-teal-300';
      case 'slate':
      default:
        return 'bg-slate-100 text-slate-900 border-slate-300';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900">
              Custom Dashboard Metric Creator
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Build custom statistical cards based on any combination of Regions, Majlises, Professions, Spiritual criteria, or Financial indicators.
          </p>
        </div>

        <button
          onClick={resetCustomWidgets}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restore Default Widgets</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Builder Form */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Configure New Metric Card
            </h2>

            {/* Widget Title & Subtitle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Metric Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Musian in Greater Dhaka"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Registered members enrolled in Al-Wasiyyat"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Region & Majlis Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Filter by REGION (Optional)
                </label>
                <select
                  value={selectedRegion}
                  onChange={(e) => {
                    setSelectedRegion(e.target.value);
                    setSelectedMajlis('');
                  }}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">Any Region (All Bangladesh)</option>
                  {ALL_REGIONS.map(reg => (
                    <option key={reg} value={reg}>{reg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Filter by MAJLIS (Optional)
                </label>
                <select
                  value={selectedMajlis}
                  onChange={(e) => setSelectedMajlis(e.target.value)}
                  disabled={!selectedRegion}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">
                    {selectedRegion ? `Any Majlis in ${selectedRegion}` : 'Select Region First'}
                  </option>
                  {availableMajlises.map(maj => (
                    <option key={maj} value={maj}>{maj}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Demographic Condition Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Filter by Occupation
                </label>
                <input
                  type="text"
                  placeholder="e.g. Business, Service, Farmer, Retired"
                  value={selectedOccupation}
                  onChange={(e) => setSelectedOccupation(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Filter by Education
                </label>
                <input
                  type="text"
                  placeholder="e.g. Masters, Degree, SSC, HSC, Doctor"
                  value={selectedEducation}
                  onChange={(e) => setSelectedEducation(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Indicator / Status Condition Field */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Religious or Financial Indicator
                </label>
                <select
                  value={conditionField}
                  onChange={(e) => setConditionField(e.target.value as keyof Member | '')}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">(None - Count all in filter)</option>
                  <option value="isMusi">Wasiyyat (Musi) Enrolled</option>
                  <option value="chandaAamBudgeted">Chanda Aam Budgeted</option>
                  <option value="tahrikEJadid">Tahrik-e-Jadid Participating</option>
                  <option value="waqfEJadid">Waqf-e-Jadid Participating</option>
                  <option value="majlisChanda">Majlis Chanda Paid</option>
                  <option value="ijtemaChanda">Ijtema Chanda Paid</option>
                  <option value="bulletinChanda">Bulletin Chanda Paid</option>
                  <option value="regular5Salat">Regular 5 Daily Prayers</option>
                  <option value="salatWithMeaning">Prayer with Meaning Known</option>
                  <option value="regularJummah">Regular Friday Prayer (Jummah)</option>
                  <option value="quranNazira">Quran Nazira Completed</option>
                  <option value="dailyQuranRecitation">Daily Quran Recitation</option>
                  <option value="quranWithMeaning">Quran with Meaning Known</option>
                  <option value="quranTafseer">Quran Tafseer Studied</option>
                  <option value="readsJamaatBooks">Reads Jamaat Books</option>
                  <option value="doesTableeq">Engaged in Tableeq</option>
                  <option value="watchesMtaSermon">Listens/Watches MTA Sermon</option>
                  <option value="readsKhutba">Reads Friday Sermon Text</option>
                </select>
              </div>

              {conditionField && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status Condition
                  </label>
                  <select
                    value={String(conditionValue)}
                    onChange={(e) => setConditionValue(e.target.value === 'true')}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="true">Active / Yes (1)</option>
                    <option value="false">Inactive / No (0)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Metric Calculation Type & Color */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Metric Computation Type
                </label>
                <select
                  value={metricType}
                  onChange={(e) => setMetricType(e.target.value as CustomWidgetMetricType)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="count">Total Member Count</option>
                  <option value="percentage">Percentage (%) of Total Members</option>
                  <option value="sum_income">Total Monthly Income (৳)</option>
                  <option value="avg_income">Average Monthly Income (৳)</option>
                  <option value="avg_age">Average Age (Years)</option>
                  <option value="avg_family">Average Family Size</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Card Theme Color
                </label>
                <div className="flex items-center gap-2 pt-1">
                  {(['emerald', 'indigo', 'amber', 'rose', 'teal', 'slate'] as const).map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setColorScheme(color)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition ${
                        colorScheme === color ? 'border-slate-900 scale-110' : 'border-transparent hover:scale-105'
                      }`}
                      style={{
                        backgroundColor: 
                          color === 'emerald' ? '#059669' :
                          color === 'indigo' ? '#4f46e5' :
                          color === 'amber' ? '#d97706' :
                          color === 'rose' ? '#e11d48' :
                          color === 'teal' ? '#0d9488' : '#475569'
                      }}
                    >
                      {colorScheme === color && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Custom Metric to Dashboard</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Panel */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-emerald-600" />
                <span>Live Interactive Preview</span>
              </div>
              <span className="text-[11px] text-slate-400 font-normal">
                Matches: {previewData.count} members
              </span>
            </div>

            {/* Preview Card */}
            <div className={`p-5 rounded-xl border-2 transition shadow-sm ${getWidgetBgClass(colorScheme)}`}>
              <p className="text-xs font-bold uppercase tracking-wider opacity-85">
                {title || 'Sample Custom Metric Title'}
              </p>
              <p className="text-3xl font-extrabold mt-2">
                {previewData.computedValue || '0'}
              </p>
              <p className="text-xs opacity-80 mt-1">
                {previewData.unit || description || 'Computed from live registry data'}
              </p>
              {selectedRegion && (
                <div className="mt-3 inline-flex items-center gap-1 text-[11px] bg-white/70 px-2 py-0.5 rounded-md font-medium">
                  <MapPin className="w-3 h-3" />
                  <span>{selectedRegion} {selectedMajlis ? `• ${selectedMajlis}` : ''}</span>
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Once added, this card will automatically calculate on the Dashboard tab in real time as member records are edited or updated.
            </p>
          </div>

          {/* Existing Custom Widgets List */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
              Active Custom Metrics ({customWidgets.length})
            </h3>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {customWidgets.map(widget => (
                <div 
                  key={widget.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100/80 transition"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-semibold text-slate-800 truncate">
                      {widget.title}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {widget.filterRegion ? `${widget.filterRegion} • ` : ''}
                      Type: {widget.metricType}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteCustomWidget(widget.id)}
                    title="Delete widget"
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
