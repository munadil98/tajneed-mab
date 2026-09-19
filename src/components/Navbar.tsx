import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  PlusCircle, 
  Download, 
  SlidersHorizontal,
  FileSpreadsheet,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import { useTajneed } from '../context/TajneedContext';
import { useAuth } from '../context/AuthContext';

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
  const { logout, adminUser } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleTabClick = (tab: 'dashboard' | 'registry' | 'customWidgets' | 'importExport') => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard',
      desc: 'Statistics & regional analytics',
      icon: LayoutDashboard,
    },
    {
      id: 'registry' as const,
      label: 'Members',
      desc: 'Directory & census records',
      icon: Users,
    },
    {
      id: 'customWidgets' as const,
      label: 'Custom Analytics',
      desc: 'Build custom indicators & metrics',
      icon: SlidersHorizontal,
    },
    {
      id: 'importExport' as const,
      label: 'Sheet / CSV',
      desc: 'Import, export & Google Sheet sync',
      icon: FileSpreadsheet,
    }
  ];

  return (
    <>
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-sm w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
            
            {/* Logo & App Name */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-inner font-bold text-lg sm:text-xl shrink-0">
                ت
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base sm:text-lg tracking-tight text-white truncate">
                    Tajneed App
                  </span>
                  <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 font-medium whitespace-nowrap shrink-0">
                    {stats.totalMembers.toLocaleString()} <span className="hidden xs:inline">Members</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden md:block truncate">
                  Majlis Ansarullah Bangladesh • Registry & Statistics
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links (Hidden on Mobile) */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-tab-${item.id}`}
                    onClick={() => handleTabClick(item.id)}
                    className={`flex items-center gap-1.5 lg:gap-2 px-2.5 lg:px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Header Right Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Desktop CSV Export */}
              <button
                id="btn-quick-export"
                onClick={downloadCSV}
                title="Export filtered records to CSV"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium rounded-lg border border-slate-700 transition whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              {/* Quick Add Member Button (Compact on Mobile) */}
              <button
                id="btn-quick-add-member"
                onClick={onOpenAddModal}
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-medium rounded-lg shadow-sm transition whitespace-nowrap"
              >
                <PlusCircle className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Add Member</span>
                <span className="sm:hidden">Add</span>
              </button>

              {/* Admin Badge & Logout (Desktop) */}
              <div className="hidden sm:flex items-center gap-1.5 border-l border-slate-800 pl-2 ml-1">
                <div 
                  className="flex items-center gap-1 px-2 py-1 bg-emerald-950/80 border border-emerald-700/70 rounded-lg text-xs" 
                  title="Signed in as Administrator"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300 font-semibold text-[11px]">{adminUser?.username || 'admin'}</span>
                </div>
                <button
                  id="btn-admin-logout-desktop"
                  onClick={logout}
                  title="Sign out of Admin account"
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-red-950/60 hover:text-red-300 hover:border-red-800/80 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">Logout</span>
                </button>
              </div>

              {/* Mobile Menu Toggle Button (Hamburger) */}
              <button
                id="btn-mobile-menu-toggle"
                onClick={() => setIsMobileMenuOpen(prev => !prev)}
                aria-label="Toggle navigation menu"
                aria-expanded={isMobileMenuOpen}
                className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-900/98 backdrop-blur-md px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-200 shadow-xl">
            
            {/* Quick Registry Status & Admin Logout */}
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">
                  Logged in as <span className="text-emerald-400 font-semibold">{adminUser?.username || 'admin'}</span>
                </span>
                <span className="text-xs font-bold text-white">
                  {stats.totalMembers.toLocaleString()} Members • Live
                </span>
              </div>
              <button
                id="btn-admin-logout-mobile"
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="text-[11px] px-2.5 py-1.5 bg-red-950/70 hover:bg-red-900/80 text-red-300 border border-red-800/70 rounded-lg font-semibold flex items-center gap-1 transition"
              >
                <LogOut className="w-3 h-3" />
                <span>Logout</span>
              </button>
            </div>

            {/* Navigation List */}
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition text-left ${
                      isActive
                        ? 'bg-emerald-600 text-white font-semibold shadow-md'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-lg shrink-0 ${
                        isActive ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-300'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium leading-tight truncate">
                          {item.label}
                        </div>
                        <div className={`text-[11px] leading-tight truncate ${
                          isActive ? 'text-emerald-100' : 'text-slate-400'
                        }`}>
                          {item.desc}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-500'
                    }`} />
                  </button>
                );
              })}
            </div>

            {/* Mobile Actions Drawer Footer */}
            <div className="pt-2 border-t border-slate-800 flex gap-2">
              <button
                onClick={() => {
                  downloadCSV();
                  setIsMobileMenuOpen(false);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => {
                  onOpenAddModal();
                  setIsMobileMenuOpen(false);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-md transition"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Add Member</span>
              </button>
            </div>

          </div>
        )}
      </header>

      {/* Backdrop overlay when mobile menu is open */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 top-16 z-30 bg-slate-950/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Persistent Mobile Bottom Navigation Bar for Instant 1-Tap Navigation */}
      <nav 
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-2 py-1 shadow-2xl flex items-center justify-around"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition min-w-[60px] ${
                isActive
                  ? 'text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-md transition ${isActive ? 'bg-emerald-950/80 text-emerald-400' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[70px]">
                {item.id === 'customWidgets' ? 'Analytics' : item.id === 'importExport' ? 'Sync' : item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};

