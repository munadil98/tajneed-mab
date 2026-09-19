import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  X, 
  Layers, 
  Building2, 
  MapPin, 
  CheckCircle2, 
  Users, 
  DollarSign, 
  Calendar,
  Sparkles,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { useTajneed } from '../context/TajneedContext';
import { ALL_REGIONS, getMajlisesForRegion } from '../data/regionsAndMajlis';
import { exportMajlisPDF, exportBatchRegionPDF, MajlisReportType } from '../utils/pdfExport';
import { Member } from '../types/tajneed';

interface MajlisPdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRegion?: string;
  defaultMajlis?: string;
}

export const MajlisPdfExportModal: React.FC<MajlisPdfExportModalProps> = ({
  isOpen,
  onClose,
  defaultRegion,
  defaultMajlis
}) => {
  const { members, showToast } = useTajneed();

  // Region and Majlis state
  const [selectedRegion, setSelectedRegion] = useState<string>(
    defaultRegion || ALL_REGIONS[0] || 'Greater Dhaka'
  );
  
  const availableMajlises = useMemo(() => {
    return getMajlisesForRegion(selectedRegion);
  }, [selectedRegion]);

  const [selectedMajlis, setSelectedMajlis] = useState<string>(() => {
    if (defaultMajlis && getMajlisesForRegion(selectedRegion).includes(defaultMajlis)) {
      return defaultMajlis;
    }
    return getMajlisesForRegion(selectedRegion)[0] || '';
  });

  // Report Type
  const [reportType, setReportType] = useState<MajlisReportType>('comprehensive');
  
  // Batch Mode Toggle
  const [isBatchRegion, setIsBatchRegion] = useState<boolean>(false);

  // Updating region updates majlis
  const handleRegionChange = (reg: string) => {
    setSelectedRegion(reg);
    const majlises = getMajlisesForRegion(reg);
    setSelectedMajlis(majlises[0] || '');
  };

  // Filter members for the selected Majlis
  const majlisMembers = useMemo(() => {
    return members.filter(m => 
      m.region.trim().toLowerCase() === selectedRegion.trim().toLowerCase() &&
      m.majlis.trim().toLowerCase() === selectedMajlis.trim().toLowerCase()
    );
  }, [members, selectedRegion, selectedMajlis]);

  // Grouped members for the entire Region (for batch export)
  const regionMembersByMajlis = useMemo(() => {
    const map: Record<string, Member[]> = {};
    for (const maj of availableMajlises) {
      map[maj] = members.filter(m => 
        m.region.trim().toLowerCase() === selectedRegion.trim().toLowerCase() &&
        m.majlis.trim().toLowerCase() === maj.trim().toLowerCase()
      );
    }
    return map;
  }, [members, selectedRegion, availableMajlises]);

  const totalRegionMembers = useMemo(() => {
    return members.filter(m => 
      m.region.trim().toLowerCase() === selectedRegion.trim().toLowerCase()
    ).length;
  }, [members, selectedRegion]);

  // Quick stats for selected Majlis
  const stats = useMemo(() => {
    const count = majlisMembers.length;
    if (count === 0) return { count: 0, avgAge: 0, totalIncome: 0, salatPct: 0, musiPct: 0 };

    const validAges = majlisMembers.filter(m => m.age && m.age > 0);
    const avgAge = validAges.length > 0 
      ? Math.round(validAges.reduce((acc, m) => acc + (m.age || 0), 0) / validAges.length) 
      : 0;

    const totalIncome = majlisMembers.reduce((acc, m) => acc + (m.monthlyIncome || 0), 0);
    const salatCount = majlisMembers.filter(m => m.regular5Salat).length;
    const musiCount = majlisMembers.filter(m => m.isMusi).length;

    return {
      count,
      avgAge,
      totalIncome,
      salatPct: Math.round((salatCount / count) * 100),
      musiPct: Math.round((musiCount / count) * 100)
    };
  }, [majlisMembers]);

  // Direct download PDF
  const handleExportPDF = () => {
    if (isBatchRegion) {
      if (totalRegionMembers === 0) {
        showToast(`No members found in region "${selectedRegion}"`);
        return;
      }
      exportBatchRegionPDF({
        region: selectedRegion,
        majlises: availableMajlises,
        membersByMajlis: regionMembersByMajlis,
        reportType
      });
      showToast(`Exported batch PDF for ${availableMajlises.length} Majlises in ${selectedRegion}!`);
    } else {
      if (majlisMembers.length === 0) {
        showToast(`No members found in ${selectedMajlis}, ${selectedRegion}`);
        return;
      }
      exportMajlisPDF({
        region: selectedRegion,
        majlis: selectedMajlis,
        members: majlisMembers,
        reportType
      });
      showToast(`Exported PDF for Majlis ${selectedMajlis} (${majlisMembers.length} members)!`);
    }
  };

  // Direct Browser Print
  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-600/30 text-emerald-400 border border-emerald-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <span>Majlis-Wise PDF Report Generator</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
                  Official PDF
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Generate high-resolution printable reports, rosters, and official census records by Majlis.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          
          {/* Controls: Region, Majlis, Batch Toggle */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Region Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Select Region</span>
                </label>
                <select
                  value={selectedRegion}
                  onChange={(e) => handleRegionChange(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white font-medium text-slate-800 focus:ring-1 focus:ring-emerald-500"
                >
                  {ALL_REGIONS.map(reg => (
                    <option key={reg} value={reg}>{reg}</option>
                  ))}
                </select>
              </div>

              {/* Majlis Selector (Disabled if batch mode) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Select Majlis</span>
                </label>
                <select
                  value={selectedMajlis}
                  disabled={isBatchRegion}
                  onChange={(e) => setSelectedMajlis(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white font-medium text-slate-800 focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  {availableMajlises.map(maj => (
                    <option key={maj} value={maj}>
                      {maj} ({(regionMembersByMajlis[maj] || []).length} members)
                    </option>
                  ))}
                </select>
              </div>

              {/* Scope Selection / Batch Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Export Scope</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsBatchRegion(false)}
                    className={`py-2 px-2.5 text-xs font-semibold rounded-xl border transition ${
                      !isBatchRegion
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Single Majlis
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsBatchRegion(true)}
                    className={`py-2 px-2.5 text-xs font-semibold rounded-xl border transition ${
                      isBatchRegion
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    All in Region
                  </button>
                </div>
              </div>

            </div>

            {/* Report Layout Presets */}
            <div className="pt-3 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Choose Report Layout & Data Columns
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  {
                    id: 'comprehensive' as MajlisReportType,
                    name: 'Comprehensive',
                    desc: 'Demographics, Salat, Quran, Musi, Chanda'
                  },
                  {
                    id: 'spiritual' as MajlisReportType,
                    name: 'Spiritual & Salat',
                    desc: '5 Salat, Meaning, Recitation, MTA, Khutba'
                  },
                  {
                    id: 'financial' as MajlisReportType,
                    name: 'Financial & Chanda',
                    desc: 'Income, Musi, Tahrik, Waqf, Majlis Chanda'
                  },
                  {
                    id: 'attendance' as MajlisReportType,
                    name: 'Verification Roster',
                    desc: 'Attendance sheets with signature fields'
                  }
                ].map(preset => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setReportType(preset.id)}
                    className={`p-3 text-left rounded-xl border transition flex flex-col justify-between ${
                      reportType === preset.id
                        ? 'bg-emerald-50/80 border-emerald-500 text-emerald-950 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">{preset.name}</span>
                      {reportType === preset.id && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      {preset.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Quick Stats Summary for Selected Majlis */}
          {!isBatchRegion && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Total Members
                </span>
                <span className="text-lg font-extrabold text-slate-900 mt-0.5 block">
                  {stats.count}
                </span>
                <span className="text-[10px] text-emerald-600 font-medium">In {selectedMajlis}</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Average Age
                </span>
                <span className="text-lg font-extrabold text-slate-900 mt-0.5 block">
                  {stats.avgAge || '-'} {stats.avgAge ? 'years' : ''}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Active demographics</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Total Income
                </span>
                <span className="text-base font-extrabold text-slate-900 mt-0.5 block truncate">
                  {stats.totalIncome.toLocaleString()} Tk
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Monthly declared</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  5 Daily Prayers
                </span>
                <span className="text-lg font-extrabold text-emerald-700 mt-0.5 block">
                  {stats.salatPct}%
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Regular observance</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Wasiyyat (Musi)
                </span>
                <span className="text-lg font-extrabold text-indigo-700 mt-0.5 block">
                  {stats.musiPct}%
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Sacrifice rate</span>
              </div>
            </div>
          )}

          {isBatchRegion && (
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
              <div>
                <span className="font-bold block text-sm">Batch Multi-Page Export Active</span>
                <span className="text-emerald-800">
                  Includes all {availableMajlises.length} Majlises in {selectedRegion} ({totalRegionMembers} total members) with page breaks between majlises.
                </span>
              </div>
              <div className="text-right font-mono font-bold text-emerald-900 text-lg">
                {totalRegionMembers} Records
              </div>
            </div>
          )}

          {/* Live Document Preview Card */}
          <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden">
            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span className="font-semibold flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                <span>PDF Document Page Preview (Landscape A4)</span>
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {isBatchRegion ? `${availableMajlises.length} Majlises` : `${majlisMembers.length} Members`}
              </span>
            </div>

            {/* Paper Preview Simulation */}
            <div className="p-5 font-sans bg-white space-y-3">
              {/* Document Header */}
              <div className="bg-emerald-900 text-white p-3.5 rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold tracking-wider">AHMADIYYA MUSLIM JAMA'AT BANGLADESH</div>
                  <div className="text-[10px] text-emerald-200 font-medium">
                    TAJNEED & CENSUS REGISTRY • MAJLIS {isBatchRegion ? 'ALL MAJLISES' : selectedMajlis.toUpperCase()} ({reportType.toUpperCase()})
                  </div>
                </div>
                <div className="text-right text-[10px] text-emerald-100 font-medium">
                  <div>Region: {selectedRegion}</div>
                  <div>Majlis: {isBatchRegion ? `All (${availableMajlises.length})` : selectedMajlis}</div>
                </div>
              </div>

              {/* Sample Table Rows Preview */}
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-emerald-900 text-white font-semibold text-[10px]">
                    <tr>
                      <th className="py-1.5 px-2 text-center w-8">SL</th>
                      <th className="py-1.5 px-2">Member Name</th>
                      <th className="py-1.5 px-2 text-center w-12">Age</th>
                      <th className="py-1.5 px-2">Occupation</th>
                      <th className="py-1.5 px-2 text-right">Income</th>
                      <th className="py-1.5 px-2 text-center">Salat</th>
                      <th className="py-1.5 px-2 text-center">Musi</th>
                      <th className="py-1.5 px-2 text-center">Chanda Aam</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {majlisMembers.slice(0, 5).map((m, idx) => (
                      <tr key={m.id} className={idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                        <td className="py-1 px-2 text-center font-mono text-[10px] text-slate-500">{idx + 1}</td>
                        <td className="py-1 px-2 font-medium text-slate-900">{m.name}</td>
                        <td className="py-1 px-2 text-center">{m.age || '-'}</td>
                        <td className="py-1 px-2 truncate max-w-[120px]">{m.occupation || '-'}</td>
                        <td className="py-1 px-2 text-right font-mono text-[10px]">
                          {m.monthlyIncome ? `${m.monthlyIncome.toLocaleString()} Tk` : '-'}
                        </td>
                        <td className="py-1 px-2 text-center font-bold text-emerald-700">
                          {m.regular5Salat ? 'Yes' : '-'}
                        </td>
                        <td className="py-1 px-2 text-center font-bold text-indigo-700">
                          {m.isMusi ? 'Yes' : '-'}
                        </td>
                        <td className="py-1 px-2 text-center font-bold text-slate-700">
                          {m.chandaAamBudgeted ? 'Yes' : '-'}
                        </td>
                      </tr>
                    ))}
                    {majlisMembers.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-6 text-center text-slate-400 text-xs">
                          No members found in this Majlis. Please select another Majlis or Region.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {majlisMembers.length > 5 && (
                <div className="text-[11px] text-slate-400 text-center font-medium">
                  + {majlisMembers.length - 5} more members included in the final downloaded PDF...
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>
              Format: <strong>Landscape A4 PDF</strong> with official Jama'at letterhead and signatures
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              title="Open Print Dialog"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Print Preview</span>
            </button>

            <button
              onClick={handleExportPDF}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 transition"
            >
              <Download className="w-4 h-4" />
              <span>
                {isBatchRegion 
                  ? `Download All ${selectedRegion} Majlises PDF` 
                  : `Download ${selectedMajlis} PDF (${majlisMembers.length})`}
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
