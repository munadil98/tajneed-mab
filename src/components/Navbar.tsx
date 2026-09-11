import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  PlusCircle, 
  Download, 
  SlidersHorizontal,
  FileSpreadsheet
} from 'lucide-react';
import { useTajneed } from '../context/TajneedContext';

interface NavbarProps {
  activeTab: 'dashboard' | 'registry' | 'customWidgets' | 'importExport';
  setActiveTab: (tab: 'dashboard' | 'registry' | 'customWidgets' | 'importExport') => void;
  onOpenAddModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal
}) => {
  const { stats, downloadCSV } = useTajneed();

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & App Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-inner font-bold text-xl">
              ت
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg tracking-tight text-white">
                  Tajneed App
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 font-medium">
                  {stats.totalMembers.toLocaleString()} Members
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Registry & Statistics Management System
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              id="nav-tab-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              id="nav-tab-registry"
              onClick={() => setActiveTab('registry')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'registry'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Members</span>
            </button>

            <button
              id="nav-tab-custom-widgets"
              onClick={() => setActiveTab('customWidgets')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'customWidgets'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden md:inline">Custom Analytics</span>
              <span className="md:hidden">Custom</span>
            </button>

            <button
              id="nav-tab-import-export"
              onClick={() => setActiveTab('importExport')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'importExport'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden md:inline">Sheet / CSV</span>
              <span className="md:hidden">Sync</span>
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              id="btn-quick-export"
              onClick={downloadCSV}
              title="Export filtered records to CSV"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium rounded-lg border border-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              id="btn-quick-add-member"
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-medium rounded-lg shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Add Member</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
