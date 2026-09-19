import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  Treemap, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ReferenceLine, 
  Cell 
} from 'recharts';
import { 
  MapPin, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingUp, 
  Layers, 
  BarChart3, 
  HelpCircle,
  Download,
  CheckCircle2,
  Search
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { ALL_REGIONS, REGIONS_AND_MAJLIS } from '../data/regionsAndMajlis';
import { Member } from '../types/tajneed';

interface RegionalGeographicalHeatmapProps {
  members: Member[];
  selectedRegion?: string;
  onSelectRegion?: (region: string) => void;
}

export interface RegionDensityData {
  name: string;
  membersCount: number;
  majlisCount: number;
  densityPerMajlis: number;
  percentShare: number;
  status: 'critical_gap' | 'low_gap' | 'moderate' | 'high_coverage';
  statusLabel: string;
  color: string;
  bgLight: string;
  textColor: string;
}

export const RegionalGeographicalHeatmap: React.FC<RegionalGeographicalHeatmapProps> = ({
  members,
  selectedRegion = '',
  onSelectRegion
}) => {
  const [viewMode, setViewMode] = useState<'treemap' | 'ranking'>('treemap');
  const [filterGapOnly, setFilterGapOnly] = useState<boolean>(false);
  const [isExportingHeatmap, setIsExportingHeatmap] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const heatmapContainerRef = React.useRef<HTMLDivElement>(null);

  // Compute geographical metrics across all 15 regions
  const regionalMetrics = useMemo(() => {
    const totalMembers = members.length || 1;

    // Count members per region
    const countMap: Record<string, number> = {};
    members.forEach(m => {
      if (m.region) {
        countMap[m.region] = (countMap[m.region] || 0) + 1;
      }
    });

    const data: RegionDensityData[] = ALL_REGIONS.map(region => {
      const membersCount = countMap[region] || 0;
      const majlises = REGIONS_AND_MAJLIS[region] || [];
      const majlisCount = majlises.length || 1;
      const densityPerMajlis = Number((membersCount / majlisCount).toFixed(1));
      const percentShare = Number(((membersCount / totalMembers) * 100).toFixed(1));

      // Classify density status & coverage gaps
      let status: RegionDensityData['status'];
      let statusLabel: string;
      let color: string;
      let bgLight: string;
      let textColor: string;

      if (membersCount === 0) {
        status = 'critical_gap';
        statusLabel = 'Critical Gap (0 Members)';
        color = '#e11d48'; // Rose-600
        bgLight = '#ffe4e6';
        textColor = '#881337';
      } else if (densityPerMajlis < 2.0 || percentShare < 2.5) {
        status = 'low_gap';
        statusLabel = 'Coverage Gap (Low Density)';
        color = '#f97316'; // Orange-500
        bgLight = '#ffedd5';
        textColor = '#7c2d12';
      } else if (densityPerMajlis < 4.5) {
        status = 'moderate';
        statusLabel = 'Moderate Coverage';
        color = '#0284c7'; // Sky-600
        bgLight = '#e0f2fe';
        textColor = '#0369a1';
      } else {
        status = 'high_coverage';
        statusLabel = 'High Density Hub';
        color = '#059669'; // Emerald-600
        bgLight = '#d1fae5';
        textColor = '#065f46';
      }

      return {
        name: region,
        membersCount,
        majlisCount,
        densityPerMajlis,
        percentShare,
        status,
        statusLabel,
        color,
        bgLight,
        textColor
      };
    });

    // Sort by member count descending
    return data.sort((a, b) => b.membersCount - a.membersCount);
  }, [members]);

  // Overall calculations
  const totalNationalMembers = members.length;
  const nationalAvgDensity = useMemo(() => {
    const totalMajlises = ALL_REGIONS.reduce((acc, r) => acc + (REGIONS_AND_MAJLIS[r]?.length || 0), 0);
    return totalMajlises > 0 ? Number((totalNationalMembers / totalMajlises).toFixed(1)) : 0;
  }, [totalNationalMembers]);

  const gapRegions = useMemo(() => {
    return regionalMetrics.filter(r => r.status === 'critical_gap' || r.status === 'low_gap');
  }, [regionalMetrics]);

  const displayedMetrics = useMemo(() => {
    let list = regionalMetrics;
    if (filterGapOnly) {
      list = list.filter(r => r.status === 'critical_gap' || r.status === 'low_gap');
    }
    if (searchQuery.trim()) {
      list = list.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return list;
  }, [regionalMetrics, filterGapOnly, searchQuery]);

  // Data formatted for Recharts Treemap
  // Treemap requires positive size numbers; for 0 members we set small size so it still renders a tile showing critical gap
  const treemapData = useMemo(() => {
    return displayedMetrics.map(r => ({
      name: r.name,
      size: Math.max(r.membersCount, 1), // ensure min 1 so empty regions render on the map
      actualCount: r.membersCount,
      density: r.densityPerMajlis,
      majlises: r.majlisCount,
      percent: r.percentShare,
      status: r.status,
      statusLabel: r.statusLabel,
      fillColor: r.color,
      textColor: '#ffffff'
    }));
  }, [displayedMetrics]);

  // Download Heatmap card as PNG
  const handleDownloadHeatmapImage = async () => {
    if (!heatmapContainerRef.current) return;
    try {
      setIsExportingHeatmap(true);
      const dataUrl = await toPng(heatmapContainerRef.current, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        cacheBust: true
      });
      const link = document.createElement('a');
      link.download = `Majlis_Ansarullah_Regional_Heatmap_${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export heatmap image', err);
    } finally {
      setIsExportingHeatmap(false);
    }
  };

  // Custom Treemap Content
  const renderCustomTreemapNode = (props: any) => {
    const { x, y, width, height, name, actualCount, density, majlises, fillColor, status } = props;

    if (width < 35 || height < 28) return null;

    const isSelected = selectedRegion && selectedRegion.toLowerCase() === (name || '').toLowerCase();
    const showDetails = width > 75 && height > 45;
    const showSubtext = width > 110 && height > 65;

    return (
      <g 
        style={{ cursor: 'pointer' }}
        onClick={() => onSelectRegion && onSelectRegion(name === selectedRegion ? '' : name)}
      >
        <rect
          x={x + 1}
          y={y + 1}
          width={width - 2}
          height={height - 2}
          rx={6}
          fill={fillColor}
          stroke={isSelected ? '#1e293b' : '#ffffff'}
          strokeWidth={isSelected ? 3 : 1.5}
          className="transition-all duration-200 hover:opacity-90"
        />

        {/* Region Name */}
        <text
          x={x + width / 2}
          y={y + (showDetails ? height / 2 - (showSubtext ? 14 : 7) : height / 2 + 4)}
          textAnchor="middle"
          fill="#ffffff"
          fontSize={width > 120 ? 12 : width > 80 ? 10 : 9}
          fontWeight="bold"
          className="select-none pointer-events-none drop-shadow-sm"
        >
          {name.length > 14 && width < 100 ? `${name.substring(0, 12)}…` : name}
        </text>

        {/* Member Count & Density */}
        {showDetails && (
          <text
            x={x + width / 2}
            y={y + height / 2 + (showSubtext ? 4 : 10)}
            textAnchor="middle"
            fill="#ffffff"
            fontSize={11}
            fontWeight="bold"
            className="select-none pointer-events-none drop-shadow-sm"
          >
            {actualCount} {actualCount === 1 ? 'member' : 'members'}
          </text>
        )}

        {/* Density & Coverage Indicator */}
        {showSubtext && (
          <text
            x={x + width / 2}
            y={y + height / 2 + 20}
            textAnchor="middle"
            fill="#f1f5f9"
            fontSize={9.5}
            fontWeight="500"
            className="select-none pointer-events-none opacity-90 drop-shadow-sm"
          >
            {status === 'critical_gap' ? '⚠ No Tajneed' : `${density} / majlis (${majlises} m.)`}
          </text>
        )}
      </g>
    );
  };

  return (
    <div 
      ref={heatmapContainerRef}
      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4"
      id="geographical-heatmap-card"
    >
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Geographical Member Density & Coverage Gap Heatmap
                {selectedRegion && (
                  <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    Filtered: {selectedRegion}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500">
                Visualizing regional member concentration, majlis capacity, and identifying unreached census gaps
              </p>
            </div>
          </div>
        </div>

        {/* View toggles & download button */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('treemap')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition ${
                viewMode === 'treemap' 
                  ? 'bg-white text-emerald-800 shadow-2xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Heatmap Tiles</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('ranking')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition ${
                viewMode === 'ranking' 
                  ? 'bg-white text-emerald-800 shadow-2xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Density Matrix</span>
            </button>
          </div>

          {/* Gap Filter Toggle */}
          <button
            type="button"
            onClick={() => setFilterGapOnly(!filterGapOnly)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border transition ${
              filterGapOnly
                ? 'bg-rose-50 text-rose-700 border-rose-200 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${filterGapOnly ? 'text-rose-600' : 'text-amber-500'}`} />
            <span>Coverage Gaps ({gapRegions.length})</span>
          </button>

          {/* Download Image Button */}
          <button
            type="button"
            onClick={handleDownloadHeatmapImage}
            disabled={isExportingHeatmap}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg shadow-2xs transition"
            title="Download Heatmap Image"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>{isExportingHeatmap ? 'Exporting...' : 'PNG'}</span>
          </button>
        </div>
      </div>

      {/* KPI Highlights Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl">
          <div className="flex items-center justify-between text-emerald-800 font-semibold mb-1">
            <span>National Avg Density</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-950">
            {nationalAvgDensity}
            <span className="text-[11px] font-normal text-emerald-700 ml-1">members / majlis</span>
          </div>
          <div className="text-[10px] text-emerald-600 mt-0.5">
            Across {ALL_REGIONS.length} Regions in Bangladesh
          </div>
        </div>

        <div className="p-3 bg-rose-50/70 border border-rose-100 rounded-xl">
          <div className="flex items-center justify-between text-rose-800 font-semibold mb-1">
            <span>Coverage Gaps</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-xl font-bold text-rose-950">
            {gapRegions.length}
            <span className="text-[11px] font-normal text-rose-700 ml-1">regions</span>
          </div>
          <div className="text-[10px] text-rose-600 mt-0.5">
            Require targeted census outreach
          </div>
        </div>

        <div className="p-3 bg-sky-50/70 border border-sky-100 rounded-xl">
          <div className="flex items-center justify-between text-sky-800 font-semibold mb-1">
            <span>Top Density Hub</span>
            <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
          </div>
          <div className="text-sm font-bold text-sky-950 truncate mt-1">
            {regionalMetrics[0]?.name || 'N/A'}
          </div>
          <div className="text-[10px] text-sky-700 mt-0.5">
            {regionalMetrics[0]?.membersCount || 0} members ({regionalMetrics[0]?.densityPerMajlis || 0} / majlis)
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between text-slate-700 font-semibold mb-1">
            <span>Active Coverage</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {ALL_REGIONS.length - gapRegions.length} / {ALL_REGIONS.length}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Regions meeting baseline density
          </div>
        </div>
      </div>

      {/* Heatmap Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
        <div className="flex flex-wrap items-center gap-4 text-[11px]">
          <span className="font-bold text-slate-600">Density Heat Scale:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#059669]" />
            <span className="text-slate-700 font-medium">High Density (&gt;4.5 / majlis)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#0284c7]" />
            <span className="text-slate-700 font-medium">Moderate (2.0 - 4.5 / majlis)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#f97316]" />
            <span className="text-slate-700 font-medium">Low Density / Coverage Gap</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#e11d48]" />
            <span className="text-slate-700 font-medium">Critical Gap (0 Members)</span>
          </div>
        </div>

        <span className="text-[10px] text-slate-500 italic">
          💡 Click any tile to filter entire dashboard to that region
        </span>
      </div>

      {/* Main Visualization Container */}
      <div className="w-full">
        {viewMode === 'treemap' ? (
          <div className="h-84 sm:h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={treemapData}
                dataKey="size"
                aspectRatio={4 / 3}
                stroke="#ffffff"
                content={renderCustomTreemapNode}
              >
                <Tooltip
                  content={({ payload }) => {
                    if (!payload || !payload.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1.5 max-w-xs">
                        <div className="font-bold text-sm text-emerald-300 flex items-center justify-between border-b border-slate-700 pb-1">
                          <span>{d.name}</span>
                          <span 
                            className="text-[10px] px-1.5 py-0.2 rounded font-semibold text-white"
                            style={{ backgroundColor: d.fillColor }}
                          >
                            {d.statusLabel}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                          <div>
                            <span className="text-slate-400 block">Registered Members:</span>
                            <span className="font-bold text-base text-white">{d.actualCount}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Density / Majlis:</span>
                            <span className="font-bold text-base text-white">{d.density}</span>
                          </div>
                        </div>
                        <div className="text-[11px] text-slate-300 pt-1 border-t border-slate-800">
                          <div>Total Majlises in Region: <span className="font-bold text-white">{d.majlises}</span></div>
                          <div>Share of National Registry: <span className="font-bold text-white">{d.percent}%</span></div>
                        </div>
                        <div className="text-[10px] text-emerald-400 pt-1 italic">
                          Click to filter dashboard
                        </div>
                      </div>
                    );
                  }}
                />
              </Treemap>
            </ResponsiveContainer>
          </div>
        ) : (
          /* Density Matrix / Ranking Chart */
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={displayedMetrics}
                margin={{ top: 15, right: 15, left: 0, bottom: 45 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  label={{ 
                    value: 'Members / Majlis (Density)', 
                    angle: -90, 
                    position: 'insideLeft', 
                    fontSize: 11,
                    fill: '#64748b',
                    dy: 60
                  }}
                />
                <ReferenceLine 
                  y={nationalAvgDensity} 
                  stroke="#ef4444" 
                  strokeDasharray="4 4" 
                  label={{ 
                    value: `National Avg (${nationalAvgDensity})`, 
                    position: 'top', 
                    fill: '#ef4444', 
                    fontSize: 10,
                    fontWeight: 'bold' 
                  }} 
                />
                <Tooltip
                  formatter={(val: number, name: string, item: any) => [
                    `${val} members/majlis (${item.payload.membersCount} total in ${item.payload.majlisCount} majlises)`,
                    'Density'
                  ]}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar 
                  dataKey="densityPerMajlis" 
                  radius={[4, 4, 0, 0]}
                  onClick={(entry) => onSelectRegion && onSelectRegion(entry.name)}
                >
                  {displayedMetrics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Coverage Gap Actionable Insights Strip */}
      {gapRegions.length > 0 && (
        <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Identified Coverage Gaps & Under-Represented Regions ({gapRegions.length})</span>
            </div>
            <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
              Target Census Priority
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {gapRegions.map(reg => (
              <button
                key={reg.name}
                type="button"
                onClick={() => onSelectRegion && onSelectRegion(reg.name)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                  reg.status === 'critical_gap'
                    ? 'bg-rose-100/70 border-rose-300 text-rose-900 hover:bg-rose-100'
                    : 'bg-white border-amber-200 text-amber-900 hover:bg-amber-100/50'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${reg.status === 'critical_gap' ? 'bg-rose-600' : 'bg-orange-500'}`} />
                <span className="font-semibold">{reg.name}</span>
                <span className="text-[10px] opacity-75">
                  ({reg.membersCount} m. / {reg.majlisCount} majlis)
                </span>
              </button>
            ))}
          </div>
          <p className="text-[11px] text-amber-800/90 leading-relaxed">
            These regions exhibit either 0 registered members or an average density below 2.0 members per Majlis. Reaching these areas with regional Tajneed enumerators will help eliminate organizational coverage gaps.
          </p>
        </div>
      )}
    </div>
  );
};
