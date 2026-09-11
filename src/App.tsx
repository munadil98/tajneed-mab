import React, { useState } from 'react';
import { TajneedProvider, useTajneed } from './context/TajneedContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { MemberRegistry } from './components/MemberRegistry';
import { CustomWidgetBuilder } from './components/CustomWidgetBuilder';
import { ImportExportModal } from './components/ImportExportModal';
import { MemberFormModal } from './components/MemberFormModal';
import { Member } from './types/tajneed';
import { CheckCircle, Info } from 'lucide-react';

const TajneedAppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'registry' | 'customWidgets' | 'importExport'>('dashboard');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);

  const { toastMessage } = useTajneed();

  const handleOpenAddModal = () => {
    setMemberToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleEditMember = (member: Member) => {
    setMemberToEdit(member);
    setIsFormModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={handleOpenAddModal}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {activeTab === 'dashboard' && (
          <Dashboard
            onNavigateToBuilder={() => setActiveTab('customWidgets')}
            onNavigateToRegistry={() => setActiveTab('registry')}
          />
        )}

        {activeTab === 'registry' && (
          <MemberRegistry
            onOpenAddModal={handleOpenAddModal}
            onEditMember={handleEditMember}
          />
        )}

        {activeTab === 'customWidgets' && (
          <CustomWidgetBuilder />
        )}

        {activeTab === 'importExport' && (
          <ImportExportModal />
        )}
      </main>

      {/* Add / Edit Member Modal */}
      <MemberFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setMemberToEdit(null);
        }}
        memberToEdit={memberToEdit}
      />

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-700 flex items-center gap-3 text-xs max-w-md">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="leading-tight">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Minimal Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Tajneed App • Ahmadiyya Muslim Jama'at Bangladesh Member Registry</span>
          <span className="text-slate-400">Integrated with Google Sheet Data Architecture</span>
        </div>
      </footer>

    </div>
  );
};

export default function App() {
  return (
    <TajneedProvider>
      <TajneedAppContent />
    </TajneedProvider>
  );
}
