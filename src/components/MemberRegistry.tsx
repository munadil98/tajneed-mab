import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Trash2, 
  Edit3, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  Check, 
  RotateCcw,
  Sparkles,
  ArrowUpDown,
  Building2,
  FileText
} from 'lucide-react';
import { useTajneed } from '../context/TajneedContext';
import { Member } from '../types/tajneed';
import { ALL_REGIONS, getMajlisesForRegion, COMMON_EDUCATIONS, COMMON_OCCUPATIONS } from '../data/regionsAndMajlis';
import { MemberDetailModal } from './MemberDetailModal';
import { MajlisPdfExportModal } from './MajlisPdfExportModal';

interface MemberRegistryProps {
  onOpenAddModal: () => void;
  onEditMember: (member: Member) => void;
}

export const MemberRegistry: React.FC<MemberRegistryProps> = ({
  onOpenAddModal,
  onEditMember
}) => {
  const { 
    filteredMembers, 
    members, 
    filters, 
    setFilters, 
    resetFilters, 
    availableMajlises,
    deleteMember,
    downloadCSV
  } = useTajneed();

  // Sorting
  const [sortField, setSortField] = useState<keyof Member>('masterSlNo');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(25);

  // Selected Member for details modal
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Region and Majlis member counts for intuitive selection
  const regionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of members) {
      const reg = m.region?.trim() || '';
      counts[reg] = (counts[reg] || 0) + 1;
    }
    return counts;
  }, [members]);

  const majlisCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of members) {
      const maj = m.majlis?.trim() || '';
      counts[maj] = (counts[maj] || 0) + 1;
    }
    return counts;
  }, [members]);

  // Majlis PDF Export Modal
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);

  // Deletion confirmation
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

  // Advanced filter collapse toggle
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  // Handle sort toggle
  const handleSort = (field: keyof Member) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sorted and paginated members
  const sortedMembers = useMemo(() => {
    const list = [...filteredMembers];
    list.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const strA = String(aVal).toLowerCase();
      const strB = String(bVal).toLowerCase();
      if (strA < strB) return sortDirection === 'asc' ? -1 : 1;
      if (strA > strB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [filteredMembers, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedMembers.length / rowsPerPage) || 1;
  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedMembers.slice(start, start + rowsPerPage);
  }, [sortedMembers, currentPage, rowsPerPage]);

  const isAnyFilterActive = Boolean(
    filters.search || 
    filters.region || 
    filters.majlis || 
    filters.education || 
    filters.occupation || 
    filters.ageRange !== 'all' || 
    filters.incomeRange !== 'all' || 
    filters.salatFilter !== 'all' || 
    filters.musiFilter !== 'all' ||
    filters.mtaFilter !== 'all' ||
    filters.chandaAamFilter !== 'all'
  );

  const confirmDelete = () => {
    if (memberToDelete) {
      deleteMember(memberToDelete.id);
      setMemberToDelete(null);
    }
  };

  return (
    <div className="space-y-4 pb-12">
      
      {/* Top Filter & Action Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        
        {/* Row 1: Search & Primary Dropdowns (REGION and MAJLIS) */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1 min-w-0 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-members"
              type="text"
              placeholder="Search by Member Name, SL No., Profession, Majlis..."
              value={filters.search}
              onChange={(e) => {
                setFilters(prev => ({ ...prev, search: e.target.value }));
                setCurrentPage(1);
              }}
              className="w-full text-xs pl-9 pr-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 hover:bg-white focus:bg-white transition"
            />
            {filters.search && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Region Dropdown Filter */}
          <div className="w-full sm:w-56">
            <select
              id="select-filter-region"
              value={filters.region}
              onChange={(e) => {
                setFilters(prev => ({ ...prev, region: e.target.value, majlis: '' }));
                setCurrentPage(1);
              }}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white font-medium text-slate-700 shadow-2xs focus:outline-none focus:ring-1 focus:ring-emerald-500 truncate"
            >
              <option value="">All Regions ({members.length})</option>
              {ALL_REGIONS.map(reg => (
                <option key={reg} value={reg}>
                  {reg} ({regionCounts[reg] || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Majlis Dropdown Filter (Populated dynamically with member count) */}
          <div className="w-full sm:w-56">
            <select
              id="select-filter-majlis"
              value={filters.majlis}
              onChange={(e) => {
                setFilters(prev => ({ ...prev, majlis: e.target.value }));
                setCurrentPage(1);
              }}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white font-medium text-slate-700 shadow-2xs focus:outline-none focus:ring-1 focus:ring-emerald-500 truncate"
            >
              <option value="">
                {filters.region 
                  ? `All Majlises in ${filters.region} (${regionCounts[filters.region] || 0})` 
                  : `All Majlises (${members.length})`}
              </option>
              {availableMajlises.map(maj => (
                <option key={maj} value={maj}>
                  {maj} ({majlisCounts[maj] || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons (Fully wrap on mobile) */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <button
              onClick={() => setShowAdvancedFilters(prev => !prev)}
              className={`flex-1 sm:flex-none justify-center flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border transition ${
                showAdvancedFilters || isAnyFilterActive
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
              {isAnyFilterActive && (
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
              )}
            </button>

            <button
              onClick={() => setIsPdfModalOpen(true)}
              title="Export Official Majlis PDF"
              className="flex-1 sm:flex-none justify-center flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl shadow-2xs transition whitespace-nowrap"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-700" />
              <span>Majlis PDF</span>
            </button>

            <button
              onClick={downloadCSV}
              title="Download CSV"
              className="flex-1 sm:flex-none justify-center flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>

            <button
              id="btn-add-member-table"
              onClick={onOpenAddModal}
              className="w-full sm:w-auto justify-center flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-sm transition whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Add Member</span>
            </button>
          </div>

        </div>

        {/* Row 2: Collapsible Advanced Filters */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 animate-in fade-in slide-in-from-top-1 duration-150">
            
            {/* Age Range */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Age Demographic
              </label>
              <select
                value={filters.ageRange}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, ageRange: e.target.value as any }));
                  setCurrentPage(1);
                }}
                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
              >
                <option value="all">All Ages</option>
                <option value="under40">Under 40</option>
                <option value="40-50">40 - 50 Years</option>
                <option value="51-60">51 - 60 Years</option>
                <option value="61-70">61 - 70 Years</option>
                <option value="71plus">71+ Years</option>
              </select>
            </div>

            {/* Income Range */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Monthly Income
              </label>
              <select
                value={filters.incomeRange}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, incomeRange: e.target.value as any }));
                  setCurrentPage(1);
                }}
                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
              >
                <option value="all">All Income Levels</option>
                <option value="zero">৳0 (Unemployed / None)</option>
                <option value="1-10000">৳1 - ৳10,000</option>
                <option value="10001-30000">৳10,001 - ৳30,000</option>
                <option value="30001-60000">৳30,001 - ৳60,000</option>
                <option value="60000plus">৳60,000+</option>
              </select>
            </div>

            {/* 5 Daily Prayers (Salat) */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                ৫ ওয়াক্ত নামাজ (Salat)
              </label>
              <select
                value={filters.salatFilter}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, salatFilter: e.target.value as any }));
                  setCurrentPage(1);
                }}
                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
              >
                <option value="all">Any Status</option>
                <option value="yes">Regular (Yes)</option>
                <option value="no">Irregular (No)</option>
              </select>
            </div>

            {/* Wasiyyat (Musi) */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                ওসীয়তকারী (Musi)
              </label>
              <select
                value={filters.musiFilter}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, musiFilter: e.target.value as any }));
                  setCurrentPage(1);
                }}
                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
              >
                <option value="all">Any Status</option>
                <option value="yes">Musi (Enrolled)</option>
                <option value="no">Non-Musi</option>
              </select>
            </div>

            {/* MTA Friday Sermon */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                MTA Khutba Listener
              </label>
              <select
                value={filters.mtaFilter}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, mtaFilter: e.target.value as any }));
                  setCurrentPage(1);
                }}
                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
              >
                <option value="all">Any Status</option>
                <option value="yes">Watches MTA (Yes)</option>
                <option value="no">Does Not Watch</option>
              </select>
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  resetFilters();
                  setCurrentPage(1);
                }}
                className="w-full flex items-center justify-center gap-1 text-xs py-1.5 px-3 text-slate-600 hover:text-red-600 bg-slate-100 hover:bg-red-50 rounded-lg transition"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            </div>

          </div>
        )}

        {/* Row 3: Status Strip */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <div>
            Showing <span className="font-bold text-slate-800">{filteredMembers.length.toLocaleString()}</span> of{' '}
            <span className="font-semibold text-slate-700">{members.length.toLocaleString()}</span> registered members
            {filters.region && (
              <span className="ml-1.5 inline-flex items-center gap-1 font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                <MapPin className="w-3 h-3" />
                {filters.region} {filters.majlis ? `• ${filters.majlis}` : ''}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span>Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-slate-200 rounded px-2 py-0.5 bg-white text-slate-700 focus:outline-none"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

      </div>

      {/* Main Members Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold select-none">
                
                {/* SL No */}
                <th 
                  onClick={() => handleSort('masterSlNo')}
                  className="py-3 px-3.5 cursor-pointer hover:bg-slate-100 transition whitespace-nowrap w-16"
                >
                  <div className="flex items-center gap-1">
                    <span>SL #</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {/* Name */}
                <th 
                  onClick={() => handleSort('name')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Member Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {/* Region & Majlis */}
                <th 
                  onClick={() => handleSort('region')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Region / Majlis</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {/* Age & Bai'at */}
                <th 
                  onClick={() => handleSort('age')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition whitespace-nowrap text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Age</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {/* Occupation & Education */}
                <th className="py-3 px-3 whitespace-nowrap">
                  <span>Occupation & Edu</span>
                </th>

                {/* Monthly Income */}
                <th 
                  onClick={() => handleSort('monthlyIncome')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition whitespace-nowrap text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Monthly Income</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {/* Religious / Chanda Badges */}
                <th className="py-3 px-3 text-center whitespace-nowrap">
                  <span>Observances</span>
                </th>

                {/* Actions */}
                <th className="py-3 px-3 text-right whitespace-nowrap">
                  <span>Actions</span>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedMembers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-medium text-slate-600">No members matching current filter criteria.</p>
                    <p className="text-xs mt-1">Try clearing search or changing the Region / Majlis selector.</p>
                    <button
                      onClick={resetFilters}
                      className="mt-3 px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                    >
                      Clear All Filters
                    </button>
                  </td>
                </tr>
              ) : (
                paginatedMembers.map((member) => (
                  <tr 
                    key={member.id}
                    className="hover:bg-slate-50/80 transition group"
                  >
                    {/* Master SL No */}
                    <td className="py-3 px-3.5 font-mono text-slate-500 text-[11px] font-medium">
                      #{member.masterSlNo}
                    </td>

                    {/* Member Name */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedMember(member)}
                          className="font-semibold text-slate-900 hover:text-emerald-600 transition text-left"
                        >
                          {member.name}
                        </button>
                        {member.isMusi && (
                          <span 
                            title="Al-Wasiyyat Musi Member"
                            className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200"
                          >
                            Musi
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {member.baiyatDateOrBirth || 'By Birth'}
                      </span>
                    </td>

                    {/* Region / Majlis */}
                    <td className="py-3 px-3">
                      <div className="inline-flex flex-col">
                        <span className="font-medium text-slate-800 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                          <span className="truncate max-w-[150px]">{member.region}</span>
                        </span>
                        <span className="text-[11px] text-slate-500 ml-4 font-mono">
                          {member.majlis}
                        </span>
                      </div>
                    </td>

                    {/* Age */}
                    <td className="py-3 px-3 text-center">
                      <span className="font-semibold text-slate-800">
                        {member.age ? `${member.age}` : '—'}
                      </span>
                    </td>

                    {/* Occupation & Education */}
                    <td className="py-3 px-3">
                      <span className="text-slate-800 font-medium block truncate max-w-[140px]">
                        {member.occupation || '—'}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate max-w-[140px]">
                        {member.education || '—'}
                      </span>
                    </td>

                    {/* Monthly Income */}
                    <td className="py-3 px-3 text-right font-mono">
                      <span className="font-semibold text-slate-900">
                        ৳{member.monthlyIncome?.toLocaleString() || 0}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Fam: {member.familyMembers || 0}
                      </span>
                    </td>

                    {/* Observance Icons / Badges */}
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <span 
                          title={`5 Daily Salat: ${member.regular5Salat ? 'Regular (Yes)' : 'No'}`}
                          className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
                            member.regular5Salat ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          ন
                        </span>

                        <span 
                          title={`Jummah Prayer: ${member.regularJummah ? 'Regular (Yes)' : 'No'}`}
                          className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
                            member.regularJummah ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          জু
                        </span>

                        <span 
                          title={`Daily Quran Tilawat: ${member.dailyQuranRecitation ? 'Yes' : 'No'}`}
                          className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
                            member.dailyQuranRecitation ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          কু
                        </span>

                        <span 
                          title={`MTA Sermon: ${member.watchesMtaSermon ? 'Yes' : 'No'}`}
                          className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
                            member.watchesMtaSermon ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          M
                        </span>

                        <span 
                          title={`Chanda Aam Budgeted: ${member.chandaAamBudgeted ? 'Yes' : 'No'}`}
                          className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
                            member.chandaAamBudgeted ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          চাঁ
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedMember(member)}
                          title="View Details"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onEditMember(member)}
                          title="Edit Member"
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setMemberToDelete(member)}
                          title="Delete Member"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Page <span className="font-semibold text-slate-800">{currentPage}</span> of{' '}
            <span className="font-semibold text-slate-800">{totalPages}</span> ({sortedMembers.length} total filtered members)
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition"
              title="First Page"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <span className="px-2 font-medium">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition"
              title="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition"
              title="Last Page"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Member Details Modal */}
      <MemberDetailModal
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
        onEdit={(m) => {
          setSelectedMember(null);
          onEditMember(m);
        }}
      />

      {/* Majlis PDF Export Modal */}
      <MajlisPdfExportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        defaultRegion={filters.region}
        defaultMajlis={filters.majlis}
      />

      {/* Delete Confirmation Dialog */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-sm w-full shadow-xl space-y-4">
            <h4 className="text-base font-bold text-slate-900">
              Confirm Delete
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to remove member{' '}
              <span className="font-bold text-slate-900">"{memberToDelete.name}"</span> (SL #{memberToDelete.masterSlNo}) from the Tajneed database?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setMemberToDelete(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-sm transition"
              >
                Delete Member
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
