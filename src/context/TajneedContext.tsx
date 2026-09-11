import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Member, FilterOptions, CustomDashboardWidget } from '../types/tajneed';
import { INITIAL_MEMBERS } from '../data/seedMembers';
import { exportMembersToCSV, parseMembersCSV } from '../utils/csvParser';
import { getMajlisesForRegion } from '../data/regionsAndMajlis';

interface TajneedContextType {
  members: Member[];
  filteredMembers: Member[];
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  resetFilters: () => void;
  availableMajlises: string[];
  
  // Member CRUD
  addMember: (memberData: Omit<Member, 'id'>) => void;
  updateMember: (id: string, updatedData: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  resetToDefaultData: () => void;
  importCSVData: (csvContent: string, mode: 'merge' | 'replace') => { added: number; errors: number };
  downloadCSV: () => void;

  // Custom Widgets
  customWidgets: CustomDashboardWidget[];
  addCustomWidget: (widget: Omit<CustomDashboardWidget, 'id' | 'createdAt'>) => void;
  deleteCustomWidget: (id: string) => void;
  resetCustomWidgets: () => void;

  // Notification Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Stats
  stats: {
    totalMembers: number;
    filteredCount: number;
    totalRegions: number;
    totalMajlis: number;
    totalIncome: number;
    avgIncome: number;
    avgAge: number;
    totalFamilyMembers: number;
    
    // Percentages
    salatRate: number;
    jummahRate: number;
    naziraRate: number;
    tilawatRate: number;
    mtaRate: number;
    musiRate: number;
    chandaAamRate: number;
    tahrikRate: number;
    waqfRate: number;
    majlisRate: number;

    // Distributions
    regionDistribution: { name: string; count: number; income: number }[];
    topMajlisDistribution: { name: string; region: string; count: number }[];
    educationDistribution: { name: string; value: number }[];
    occupationDistribution: { name: string; value: number; avgIncome: number }[];
    ageGroupDistribution: { range: string; count: number }[];
  };
}

const defaultFilters: FilterOptions = {
  search: '',
  region: '',
  majlis: '',
  education: '',
  occupation: '',
  ageRange: 'all',
  incomeRange: 'all',
  salatFilter: 'all',
  jummahFilter: 'all',
  quranNaziraFilter: 'all',
  dailyRecitationFilter: 'all',
  mtaFilter: 'all',
  musiFilter: 'all',
  chandaAamFilter: 'all',
};

const defaultCustomWidgets: CustomDashboardWidget[] = [
  {
    id: 'widget-1',
    title: 'Dhaka Region Members',
    description: 'Total registered members in Greater Dhaka',
    filterRegion: 'Greater Dhaka',
    metricType: 'count',
    colorScheme: 'emerald',
    createdAt: new Date().toISOString()
  },
  {
    id: 'widget-2',
    title: 'Wasiyyat (Musi) Count',
    description: 'Members enrolled in Wasiyyat financial dedication',
    filterConditionField: 'isMusi',
    filterConditionValue: true,
    metricType: 'count',
    colorScheme: 'indigo',
    createdAt: new Date().toISOString()
  },
  {
    id: 'widget-3',
    title: 'Business Professionals Total Income',
    description: 'Combined monthly revenue of business members',
    filterOccupation: 'Business',
    metricType: 'sum_income',
    colorScheme: 'amber',
    createdAt: new Date().toISOString()
  },
  {
    id: 'widget-4',
    title: 'MTA Sermon Regular Listeners',
    description: 'Percentage of members watching Friday sermon weekly',
    filterConditionField: 'watchesMtaSermon',
    filterConditionValue: true,
    metricType: 'percentage',
    colorScheme: 'teal',
    createdAt: new Date().toISOString()
  }
];

const LOCAL_STORAGE_MEMBERS_KEY = 'tajneed_members_data_v3394';
const LOCAL_STORAGE_WIDGETS_KEY = 'tajneed_custom_widgets_v2';

const TajneedContext = createContext<TajneedContextType | undefined>(undefined);

export const TajneedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [members, setMembers] = useState<Member[]>(() => {
    try {
      // Clear legacy 859 data if present
      localStorage.removeItem('tajneed_members_data_v2');
      const saved = localStorage.getItem(LOCAL_STORAGE_MEMBERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed.length !== 859) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load saved members', e);
    }
    return INITIAL_MEMBERS;
  });

  const [customWidgets, setCustomWidgets] = useState<CustomDashboardWidget[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_WIDGETS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load custom widgets', e);
    }
    return defaultCustomWidgets;
  });

  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 4000);
  };

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_MEMBERS_KEY, JSON.stringify(members));
    } catch (e) {
      console.error('Failed to save members to localStorage', e);
    }
  }, [members]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_WIDGETS_KEY, JSON.stringify(customWidgets));
    } catch (e) {
      console.error('Failed to save widgets to localStorage', e);
    }
  }, [customWidgets]);

  // Handle region filter changing -> if current majlis is not in that region, clear majlis
  useEffect(() => {
    if (filters.region && filters.majlis) {
      const validMajlises = getMajlisesForRegion(filters.region);
      if (!validMajlises.includes(filters.majlis)) {
        setFilters(prev => ({ ...prev, majlis: '' }));
      }
    }
  }, [filters.region, filters.majlis]);

  const availableMajlises = useMemo(() => {
    return getMajlisesForRegion(filters.region);
  }, [filters.region]);

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  // Filtered members calculation
  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      // Search
      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        const matchesName = (m.name || '').toLowerCase().includes(q);
        const matchesSl = m.masterSlNo.toString().includes(q);
        const matchesOcc = (m.occupation || '').toLowerCase().includes(q);
        const matchesEdu = (m.education || '').toLowerCase().includes(q);
        const matchesMaj = (m.majlis || '').toLowerCase().includes(q);
        const matchesReg = (m.region || '').toLowerCase().includes(q);
        if (!matchesName && !matchesSl && !matchesOcc && !matchesEdu && !matchesMaj && !matchesReg) {
          return false;
        }
      }

      // Region
      if (filters.region && m.region !== filters.region) {
        return false;
      }

      // Majlis
      if (filters.majlis && m.majlis !== filters.majlis) {
        return false;
      }

      // Education
      if (filters.education && m.education !== filters.education) {
        return false;
      }

      // Occupation
      if (filters.occupation && m.occupation !== filters.occupation) {
        return false;
      }

      // Age Range
      if (filters.ageRange !== 'all') {
        const age = m.age ?? 0;
        if (filters.ageRange === 'under40' && (age >= 40 || age === 0)) return false;
        if (filters.ageRange === '40-50' && (age < 40 || age > 50)) return false;
        if (filters.ageRange === '51-60' && (age < 51 || age > 60)) return false;
        if (filters.ageRange === '61-70' && (age < 61 || age > 70)) return false;
        if (filters.ageRange === '71plus' && age < 71) return false;
      }

      // Income Range
      if (filters.incomeRange !== 'all') {
        const inc = m.monthlyIncome;
        if (filters.incomeRange === 'zero' && inc > 0) return false;
        if (filters.incomeRange === '1-10000' && (inc < 1 || inc > 10000)) return false;
        if (filters.incomeRange === '10001-30000' && (inc < 10001 || inc > 30000)) return false;
        if (filters.incomeRange === '30001-60000' && (inc < 30001 || inc > 60000)) return false;
        if (filters.incomeRange === '60000plus' && inc <= 60000) return false;
      }

      // Religious & Chanda filters
      if (filters.salatFilter === 'yes' && !m.regular5Salat) return false;
      if (filters.salatFilter === 'no' && m.regular5Salat) return false;

      if (filters.jummahFilter === 'yes' && !m.regularJummah) return false;
      if (filters.jummahFilter === 'no' && m.regularJummah) return false;

      if (filters.quranNaziraFilter === 'yes' && !m.quranNazira) return false;
      if (filters.quranNaziraFilter === 'no' && m.quranNazira) return false;

      if (filters.dailyRecitationFilter === 'yes' && !m.dailyQuranRecitation) return false;
      if (filters.dailyRecitationFilter === 'no' && m.dailyQuranRecitation) return false;

      if (filters.mtaFilter === 'yes' && !m.watchesMtaSermon) return false;
      if (filters.mtaFilter === 'no' && m.watchesMtaSermon) return false;

      if (filters.musiFilter === 'yes' && !m.isMusi) return false;
      if (filters.musiFilter === 'no' && m.isMusi) return false;

      if (filters.chandaAamFilter === 'yes' && !m.chandaAamBudgeted) return false;
      if (filters.chandaAamFilter === 'no' && m.chandaAamBudgeted) return false;

      return true;
    });
  }, [members, filters]);

  // Comprehensive stats for Dashboard
  const stats = useMemo(() => {
    const total = filteredMembers.length;
    if (total === 0) {
      return {
        totalMembers: members.length,
        filteredCount: 0,
        totalRegions: 0,
        totalMajlis: 0,
        totalIncome: 0,
        avgIncome: 0,
        avgAge: 0,
        totalFamilyMembers: 0,
        salatRate: 0,
        jummahRate: 0,
        naziraRate: 0,
        tilawatRate: 0,
        mtaRate: 0,
        musiRate: 0,
        chandaAamRate: 0,
        tahrikRate: 0,
        waqfRate: 0,
        majlisRate: 0,
        regionDistribution: [],
        topMajlisDistribution: [],
        educationDistribution: [],
        occupationDistribution: [],
        ageGroupDistribution: []
      };
    }

    let incomeSum = 0;
    let ageSum = 0;
    let ageCount = 0;
    let familySum = 0;

    let salatCount = 0;
    let jummahCount = 0;
    let naziraCount = 0;
    let tilawatCount = 0;
    let mtaCount = 0;
    let musiCount = 0;
    let chandaAamCount = 0;
    let tahrikCount = 0;
    let waqfCount = 0;
    let majlisCount = 0;

    const regionMap: { [key: string]: { count: number; income: number } } = {};
    const majlisMap: { [key: string]: { region: string; count: number } } = {};
    const eduMap: { [key: string]: number } = {};
    const occMap: { [key: string]: { count: number; incomeSum: number } } = {};
    const ageMap = {
      'Under 40': 0,
      '40-50': 0,
      '51-60': 0,
      '61-70': 0,
      '71+': 0
    };

    filteredMembers.forEach(m => {
      incomeSum += m.monthlyIncome || 0;
      familySum += m.familyMembers || 0;
      if (m.age && m.age > 0) {
        ageSum += m.age;
        ageCount++;
        if (m.age < 40) ageMap['Under 40']++;
        else if (m.age <= 50) ageMap['40-50']++;
        else if (m.age <= 60) ageMap['51-60']++;
        else if (m.age <= 70) ageMap['61-70']++;
        else ageMap['71+']++;
      }

      if (m.regular5Salat) salatCount++;
      if (m.regularJummah) jummahCount++;
      if (m.quranNazira) naziraCount++;
      if (m.dailyQuranRecitation) tilawatCount++;
      if (m.watchesMtaSermon) mtaCount++;
      if (m.isMusi) musiCount++;
      if (m.chandaAamBudgeted) chandaAamCount++;
      if (m.tahrikEJadid) tahrikCount++;
      if (m.waqfEJadid) waqfCount++;
      if (m.majlisChanda) majlisCount++;

      // Region
      const reg = m.region || 'Unassigned';
      if (!regionMap[reg]) regionMap[reg] = { count: 0, income: 0 };
      regionMap[reg].count++;
      regionMap[reg].income += m.monthlyIncome || 0;

      // Majlis
      const maj = m.majlis || 'Unknown';
      if (!majlisMap[maj]) majlisMap[maj] = { region: reg, count: 0 };
      majlisMap[maj].count++;

      // Edu
      const edu = m.education || 'Unspecified';
      eduMap[edu] = (eduMap[edu] || 0) + 1;

      // Occ
      const occ = m.occupation || 'Other';
      if (!occMap[occ]) occMap[occ] = { count: 0, incomeSum: 0 };
      occMap[occ].count++;
      occMap[occ].incomeSum += m.monthlyIncome || 0;
    });

    const regionDistribution = Object.entries(regionMap)
      .map(([name, data]) => ({ name, count: data.count, income: data.income }))
      .sort((a, b) => b.count - a.count);

    const topMajlisDistribution = Object.entries(majlisMap)
      .map(([name, data]) => ({ name, region: data.region, count: data.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const educationDistribution = Object.entries(eduMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    const occupationDistribution = Object.entries(occMap)
      .map(([name, data]) => ({
        name,
        value: data.count,
        avgIncome: Math.round(data.incomeSum / data.count)
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    const ageGroupDistribution = Object.entries(ageMap).map(([range, count]) => ({
      range,
      count
    }));

    return {
      totalMembers: members.length,
      filteredCount: total,
      totalRegions: Object.keys(regionMap).length,
      totalMajlis: Object.keys(majlisMap).length,
      totalIncome: incomeSum,
      avgIncome: Math.round(incomeSum / total),
      avgAge: ageCount > 0 ? Math.round(ageSum / ageCount) : 0,
      totalFamilyMembers: familySum,

      salatRate: Math.round((salatCount / total) * 100),
      jummahRate: Math.round((jummahCount / total) * 100),
      naziraRate: Math.round((naziraCount / total) * 100),
      tilawatRate: Math.round((tilawatCount / total) * 100),
      mtaRate: Math.round((mtaCount / total) * 100),
      musiRate: Math.round((musiCount / total) * 100),
      chandaAamRate: Math.round((chandaAamCount / total) * 100),
      tahrikRate: Math.round((tahrikCount / total) * 100),
      waqfRate: Math.round((waqfCount / total) * 100),
      majlisRate: Math.round((majlisCount / total) * 100),

      regionDistribution,
      topMajlisDistribution,
      educationDistribution,
      occupationDistribution,
      ageGroupDistribution
    };
  }, [members, filteredMembers]);

  // CRUD Operations
  const addMember = (memberData: Omit<Member, 'id'>) => {
    const maxSl = members.reduce((max, m) => Math.max(max, m.masterSlNo || 0), 0);
    const newMember: Member = {
      ...memberData,
      id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      masterSlNo: memberData.masterSlNo || maxSl + 1,
      updatedAt: new Date().toISOString()
    };
    setMembers(prev => [newMember, ...prev]);
    showToast(`Member "${newMember.name}" successfully registered into Tajneed database.`);
  };

  const updateMember = (id: string, updatedData: Partial<Member>) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updatedData, updatedAt: new Date().toISOString() } : m));
    showToast(`Member record #${updatedData.masterSlNo || ''} updated successfully.`);
  };

  const deleteMember = (id: string) => {
    const target = members.find(m => m.id === id);
    setMembers(prev => prev.filter(m => m.id !== id));
    showToast(`Member "${target?.name || ''}" removed from registry.`);
  };

  const resetToDefaultData = () => {
    setMembers(INITIAL_MEMBERS);
    resetFilters();
    showToast(`Registry reset to original Google Sheet dataset (${INITIAL_MEMBERS.length} members).`);
  };

  const importCSVData = (csvContent: string, mode: 'merge' | 'replace'): { added: number; errors: number } => {
    try {
      const parsed = parseMembersCSV(csvContent);
      if (!parsed || parsed.length === 0) {
        showToast('No valid member records found in the provided CSV.');
        return { added: 0, errors: 1 };
      }

      if (mode === 'replace') {
        setMembers(parsed);
        showToast(`Successfully imported ${parsed.length} members replacing previous records.`);
      } else {
        // Merge without duplicate SL No
        const existingSls = new Set(members.map(m => m.masterSlNo));
        const newRecords = parsed.filter(m => !existingSls.has(m.masterSlNo));
        setMembers(prev => [...newRecords, ...prev]);
        showToast(`Merged ${newRecords.length} new records into registry (${parsed.length - newRecords.length} duplicates skipped).`);
      }
      return { added: parsed.length, errors: 0 };
    } catch (err) {
      console.error(err);
      showToast('Error parsing CSV file. Please verify CSV column format.');
      return { added: 0, errors: 1 };
    }
  };

  const downloadCSV = () => {
    const csv = exportMembersToCSV(filteredMembers.length > 0 ? filteredMembers : members);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tajneed_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredMembers.length > 0 ? filteredMembers.length : members.length} records to CSV.`);
  };

  // Custom Widgets
  const addCustomWidget = (widgetData: Omit<CustomDashboardWidget, 'id' | 'createdAt'>) => {
    const newWidget: CustomDashboardWidget = {
      ...widgetData,
      id: `widget-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setCustomWidgets(prev => [newWidget, ...prev]);
    showToast(`Custom dashboard widget "${newWidget.title}" created.`);
  };

  const deleteCustomWidget = (id: string) => {
    setCustomWidgets(prev => prev.filter(w => w.id !== id));
    showToast('Custom dashboard widget removed.');
  };

  const resetCustomWidgets = () => {
    setCustomWidgets(defaultCustomWidgets);
    showToast('Custom widgets restored to default presets.');
  };

  return (
    <TajneedContext.Provider
      value={{
        members,
        filteredMembers,
        filters,
        setFilters,
        resetFilters,
        availableMajlises,
        addMember,
        updateMember,
        deleteMember,
        resetToDefaultData,
        importCSVData,
        downloadCSV,
        customWidgets,
        addCustomWidget,
        deleteCustomWidget,
        resetCustomWidgets,
        toastMessage,
        showToast,
        stats
      }}
    >
      {children}
    </TajneedContext.Provider>
  );
};

export const useTajneed = () => {
  const context = useContext(TajneedContext);
  if (!context) {
    throw new Error('useTajneed must be used within a TajneedProvider');
  }
  return context;
};
