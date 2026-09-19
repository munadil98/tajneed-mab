import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Upload, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  FileText,
  Table,
  Printer,
  Sparkles
} from 'lucide-react';
import { useTajneed } from '../context/TajneedContext';
import { MajlisPdfExportModal } from './MajlisPdfExportModal';

export const ImportExportModal: React.FC = () => {
  const { 
    members, 
    downloadCSV, 
    importCSVData, 
    resetToDefaultData, 
    showToast 
  } = useTajneed();

  const [csvText, setCsvText] = useState('');
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setCsvText(content);
        showToast(`Loaded "${file.name}" (${(file.size / 1024).toFixed(1)} KB). Click "Execute CSV Import" to process.`);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const executeImport = () => {
    if (!csvText.trim()) {
      showToast('Please upload a CSV file or paste CSV text first.');
      return;
    }
    const result = importCSVData(csvText, importMode);
    if (result.added > 0) {
      setCsvText('');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900">
              Google Sheet & CSV Data Interchange
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Seamlessly sync data between your Google Sheet and Tajneed App. Export records or import spreadsheet updates.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsPdfModalOpen(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-sm transition"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Majlis-Wise PDF Export</span>
          </button>
          <button
            onClick={downloadCSV}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            <span>Export to Google Sheet CSV</span>
          </button>
        </div>
      </div>

      {/* Featured Banner: Majlis PDF Report Generator */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-400/30">
            <Sparkles className="w-3 h-3" />
            <span>Official Majlis Reports & Rosters</span>
          </div>
          <h2 className="text-lg font-extrabold text-white">
            Majlis-Wise PDF Census & Roster Generator
          </h2>
          <p className="text-xs text-emerald-100/80 leading-relaxed">
            Generate formal, high-resolution Landscape A4 PDFs for any Majlis or entire Regions. Includes official Majlis Ansarullah letterhead, executive KPI statistics, attendance signature blocks, and customized column presets (All Sections Accumulated, Comprehensive, Spiritual Observance, or Financial Sacrifice).
          </p>
        </div>

        <button
          onClick={() => setIsPdfModalOpen(true)}
          className="flex-shrink-0 flex items-center gap-2 px-5 py-3 bg-white text-slate-900 hover:bg-emerald-50 text-xs font-extrabold rounded-xl shadow-lg transition"
        >
          <FileText className="w-4 h-4 text-emerald-700" />
          <span>Launch Majlis PDF Generator</span>
        </button>
      </div>

      {/* Grid: Export Card and Import Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Export / Download Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Export Tajneed Dataset</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Downloads all currently loaded member records in standard UTF-8 CSV format, ready to open in Google Sheets, Microsoft Excel, or backup archives.
            </p>

            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs text-emerald-950 space-y-1.5">
              <div className="flex justify-between font-medium">
                <span>Active Member Records:</span>
                <span className="font-bold">{members.length.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Supported Columns:</span>
                <span>28 Spreadsheet Fields</span>
              </div>
              <div className="flex justify-between">
                <span>Format:</span>
                <span>UTF-8 Comma-Separated Values (.csv)</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={downloadCSV}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition"
            >
              <Download className="w-4 h-4" />
              <span>Download Complete CSV ({members.length} records)</span>
            </button>
          </div>
        </div>

        {/* Restore Initial Dataset Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <RotateCcw className="w-4 h-4 text-amber-600" />
              <span>Reset to Original Google Sheet Data</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Restores the default Google Sheet dataset (3,394 members across 14 Regions and all Majlises) and resets any local modifications or deletions.
            </p>

            <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <div className="font-semibold flex items-center gap-1 text-amber-950">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Original Seed Verification</span>
              </div>
              <p className="text-[11px] opacity-85">
                Includes complete real-world regional structures: Greater Dhaka, Chittagong, Rajshahi, Rangpur, Khulna, Mymensingh, Sylhet, Barisal, etc.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            {isResetConfirmOpen ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-red-600 text-center">
                  Are you sure? This will replace current local records.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setIsResetConfirmOpen(false)}
                    className="py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      resetToDefaultData();
                      setIsResetConfirmOpen(false);
                    }}
                    className="py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-sm transition"
                  >
                    Confirm Reset
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsResetConfirmOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-sm transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset to Default Dataset</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* CSV File & Text Importer */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Import Google Sheet / CSV File
            </h2>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="font-semibold text-slate-600">Import Mode:</span>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="importMode"
                checked={importMode === 'merge'}
                onChange={() => setImportMode('merge')}
                className="text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-slate-700">Merge (Keep Existing)</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="importMode"
                checked={importMode === 'replace'}
                onChange={() => setImportMode('replace')}
                className="text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-slate-700">Replace All</span>
            </label>
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition ${
            dragActive ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
          }`}
        >
          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-700">
            Drag & drop your Google Sheet exported CSV file here, or
          </p>
          <label className="inline-block mt-2 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg shadow-2xs cursor-pointer transition">
            Browse File
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
          </label>
        </div>

        {/* Or Paste CSV Text */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Or Paste CSV Content Directly:
          </label>
          <textarea
            rows={5}
            placeholder={`Master SL No.,REGION,MAJLIS,MEMBERS NAME,eqm (Age),Date of Baiyat / By Birth,Educational Qualification,Occupation,Monthly Income (BDT),Family Members,5 Daily Prayers,Prayer with Meaning,Regular Friday Prayer,Quran Nazira,Daily Quran Recitation,Quran with Meaning,Quran Tafseer,Reads Jamaat Books,Tableeq Participation,Watches MTA Khutba,Reads Khutba,Chanda Aam Budgeted,Wasiyyat (Musi),Tahrik-e-Jadid,Waqf-e-Jadid,Majlis Chanda,Ijtema Chanda,Bulletin Chanda\n1,Greater Dhaka,DHAKA,A K M Ataur Rahman,62,By Birth,Masters,Retired,45000,4,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1`}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            className="w-full text-xs font-mono p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {csvText && (
            <button
              onClick={() => setCsvText('')}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 transition"
            >
              Clear
            </button>
          )}
          <button
            onClick={executeImport}
            disabled={!csvText.trim()}
            className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-sm transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Execute CSV Import</span>
          </button>
        </div>

      </div>

      {/* Schema Reference Table */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Table className="w-3.5 h-3.5 text-emerald-600" />
            <span>Google Sheet Column Mapping & Structure</span>
          </h3>
          <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full w-fit">
            Row 1 = Header Row • Data starts at Row 2
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Only <strong>Row 1</strong> is the header row. Alternate blank columns from Column L onwards (L, N, P, etc.) are deleted, so all survey indicators are contiguous columns:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600">
          <div className="p-2 bg-white rounded border border-slate-200">
            <span className="font-mono font-bold text-slate-800 block">Col A: Master SL No.</span>
            <span>ক্রঃ নং / Master SL</span>
          </div>
          <div className="p-2 bg-white rounded border border-slate-200">
            <span className="font-mono font-bold text-emerald-700 block">Col B: REGION</span>
            <span>রিজিয়ন (ড্রপ-ডাউন)</span>
          </div>
          <div className="p-2 bg-white rounded border border-slate-200">
            <span className="font-mono font-bold text-emerald-700 block">Col C: MAJLIS</span>
            <span>মজলিস (ড্রপ-ডাউন)</span>
          </div>
          <div className="p-2 bg-white rounded border border-slate-200">
            <span className="font-mono font-bold text-slate-800 block">Col D: MEMBERS NAME</span>
            <span>সদস্যের নাম</span>
          </div>
          <div className="p-2 bg-white rounded border border-slate-200">
            <span className="font-mono font-bold text-slate-800 block">Col E: eqm (Age)</span>
            <span>বয়স (Years)</span>
          </div>
          <div className="p-2 bg-white rounded border border-slate-200">
            <span className="font-mono font-bold text-slate-800 block">Col F: Date of Baiyat</span>
            <span>বায়াত গ্রহণের তারিখ</span>
          </div>
          <div className="p-2 bg-white rounded border border-slate-200">
            <span className="font-mono font-bold text-slate-800 block">Col G: Education</span>
            <span>শিক্ষাগত যোগ্যতা</span>
          </div>
          <div className="p-2 bg-white rounded border border-slate-200">
            <span className="font-mono font-bold text-slate-800 block">Col H: Occupation</span>
            <span>পেশা (Service, etc.)</span>
          </div>
          <div className="p-2 bg-white rounded border border-slate-200">
            <span className="font-mono font-bold text-slate-800 block">Col I: Monthly Income</span>
            <span>মাসিক আয় (BDT)</span>
          </div>
          <div className="p-2 bg-white rounded border border-slate-200">
            <span className="font-mono font-bold text-slate-800 block">Col J: Family Members</span>
            <span>পরিবারের সদস্য সংখ্যা</span>
          </div>
          <div className="p-2 bg-white rounded border border-slate-200">
            <span className="font-mono font-bold text-slate-800 block">Col K: 5 Daily Prayers</span>
            <span>৫ ওয়াক্ত নামাজ (1 / 0)</span>
          </div>
          <div className="p-2 bg-white rounded border border-slate-200">
            <span className="font-mono font-bold text-slate-800 block">Col L: Prayer with Meaning</span>
            <span>নামাজের অর্থ (1 / 0)</span>
          </div>
          <div className="p-2 bg-white rounded border border-slate-200">
            <span className="font-mono font-bold text-slate-800 block">Col M: Friday Prayer</span>
            <span>নিয়মিত জুমুআহ (1 / 0)</span>
          </div>
          <div className="p-2 bg-white rounded border border-slate-200">
            <span className="font-mono font-bold text-slate-800 block">Col N: Quran Nazira</span>
            <span>নাজেরা কুরআন (1 / 0)</span>
          </div>
          <div className="p-2 bg-white rounded border border-slate-200">
            <span className="font-mono font-bold text-slate-800 block">Col O: Daily Recitation</span>
            <span>দৈনিক তেলাওয়াত (1 / 0)</span>
          </div>
          <div className="p-2 bg-white rounded border border-slate-200">
            <span className="font-mono font-bold text-slate-800 block">Col P–AB: Other Survey</span>
            <span>MTA, চন্দা, মুসি, ইত্যাদি (1/0)</span>
          </div>
        </div>
      </div>

      {/* Majlis PDF Export Modal */}
      <MajlisPdfExportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
      />

    </div>
  );
};
