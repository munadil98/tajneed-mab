import React, { useState, useEffect } from 'react';
import { X, Save, UserPlus, Edit3, CheckCircle2 } from 'lucide-react';
import { Member } from '../types/tajneed';
import { ALL_REGIONS, getMajlisesForRegion, COMMON_EDUCATIONS, COMMON_OCCUPATIONS } from '../data/regionsAndMajlis';
import { useTajneed } from '../context/TajneedContext';

interface MemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberToEdit?: Member | null;
}

export const MemberFormModal: React.FC<MemberFormModalProps> = ({
  isOpen,
  onClose,
  memberToEdit
}) => {
  const { addMember, updateMember, members } = useTajneed();

  const isEditing = Boolean(memberToEdit);

  // Form states
  const [masterSlNo, setMasterSlNo] = useState<number>(1);
  const [region, setRegion] = useState<string>('Greater Dhaka');
  const [majlis, setMajlis] = useState<string>('DHAKA');
  const [name, setName] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [baiyatDateOrBirth, setBaiyatDateOrBirth] = useState<string>('By Birth');
  const [education, setEducation] = useState<string>('SSC');
  const [occupation, setOccupation] = useState<string>('Service');
  const [monthlyIncome, setMonthlyIncome] = useState<string>('15000');
  const [familyMembers, setFamilyMembers] = useState<string>('4');

  // Religious Practices
  const [regular5Salat, setRegular5Salat] = useState<boolean>(true);
  const [salatWithMeaning, setSalatWithMeaning] = useState<boolean>(true);
  const [regularJummah, setRegularJummah] = useState<boolean>(true);
  const [quranNazira, setQuranNazira] = useState<boolean>(true);
  const [dailyQuranRecitation, setDailyQuranRecitation] = useState<boolean>(true);
  const [quranWithMeaning, setQuranWithMeaning] = useState<boolean>(false);
  const [quranTafseer, setQuranTafseer] = useState<boolean>(false);
  const [readsJamaatBooks, setReadsJamaatBooks] = useState<boolean>(true);
  const [doesTableeq, setDoesTableeq] = useState<boolean>(true);
  const [watchesMtaSermon, setWatchesMtaSermon] = useState<boolean>(true);
  const [readsKhutba, setReadsKhutba] = useState<boolean>(true);

  // Financial & Chanda
  const [chandaAamBudgeted, setChandaAamBudgeted] = useState<boolean>(true);
  const [isMusi, setIsMusi] = useState<boolean>(false);
  const [tahrikEJadid, setTahrikEJadid] = useState<boolean>(true);
  const [waqfEJadid, setWaqfEJadid] = useState<boolean>(true);
  const [majlisChanda, setMajlisChanda] = useState<boolean>(true);
  const [ijtemaChanda, setIjtemaChanda] = useState<boolean>(true);
  const [bulletinChanda, setBulletinChanda] = useState<boolean>(true);

  // Set initial form values when opening or switching member
  useEffect(() => {
    if (memberToEdit) {
      setMasterSlNo(memberToEdit.masterSlNo);
      setRegion(memberToEdit.region || 'Greater Dhaka');
      setMajlis(memberToEdit.majlis || 'DHAKA');
      setName(memberToEdit.name || '');
      setAge(memberToEdit.age ? String(memberToEdit.age) : '');
      setBaiyatDateOrBirth(memberToEdit.baiyatDateOrBirth || 'By Birth');
      setEducation(memberToEdit.education || '');
      setOccupation(memberToEdit.occupation || '');
      setMonthlyIncome(String(memberToEdit.monthlyIncome || 0));
      setFamilyMembers(String(memberToEdit.familyMembers || 0));

      setRegular5Salat(memberToEdit.regular5Salat);
      setSalatWithMeaning(memberToEdit.salatWithMeaning);
      setRegularJummah(memberToEdit.regularJummah);
      setQuranNazira(memberToEdit.quranNazira);
      setDailyQuranRecitation(memberToEdit.dailyQuranRecitation);
      setQuranWithMeaning(memberToEdit.quranWithMeaning);
      setQuranTafseer(memberToEdit.quranTafseer);
      setReadsJamaatBooks(memberToEdit.readsJamaatBooks);
      setDoesTableeq(memberToEdit.doesTableeq);
      setWatchesMtaSermon(memberToEdit.watchesMtaSermon);
      setReadsKhutba(memberToEdit.readsKhutba);

      setChandaAamBudgeted(memberToEdit.chandaAamBudgeted);
      setIsMusi(memberToEdit.isMusi);
      setTahrikEJadid(memberToEdit.tahrikEJadid);
      setWaqfEJadid(memberToEdit.waqfEJadid);
      setMajlisChanda(memberToEdit.majlisChanda);
      setIjtemaChanda(memberToEdit.ijtemaChanda);
      setBulletinChanda(memberToEdit.bulletinChanda);
    } else {
      const maxSl = members.reduce((max, m) => Math.max(max, m.masterSlNo || 0), 0);
      setMasterSlNo(maxSl + 1);
      setRegion('Greater Dhaka');
      setMajlis('DHAKA');
      setName('');
      setAge('');
      setBaiyatDateOrBirth('By Birth');
      setEducation('SSC');
      setOccupation('Service');
      setMonthlyIncome('15000');
      setFamilyMembers('4');

      setRegular5Salat(true);
      setSalatWithMeaning(true);
      setRegularJummah(true);
      setQuranNazira(true);
      dailyQuranRecitation;
      setDailyQuranRecitation(true);
      setQuranWithMeaning(false);
      setQuranTafseer(false);
      setReadsJamaatBooks(true);
      setDoesTableeq(true);
      setWatchesMtaSermon(true);
      setReadsKhutba(true);

      setChandaAamBudgeted(true);
      setIsMusi(false);
      setTahrikEJadid(true);
      waqfEJadid;
      setWaqfEJadid(true);
      setMajlisChanda(true);
      setIjtemaChanda(true);
      setBulletinChanda(true);
    }
  }, [memberToEdit, isOpen, members]);

  // When region changes, update majlis to the first one in the region if not valid
  const handleRegionChange = (newRegion: string) => {
    setRegion(newRegion);
    const validMajlises = getMajlisesForRegion(newRegion);
    if (!validMajlises.includes(majlis)) {
      setMajlis(validMajlises[0] || '');
    }
  };

  const majlisOptions = getMajlisesForRegion(region);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const memberPayload = {
      masterSlNo: Number(masterSlNo) || 1,
      region: region.trim(),
      majlis: majlis.trim(),
      name: name.trim(),
      age: age ? parseInt(age, 10) : null,
      baiyatDateOrBirth: baiyatDateOrBirth.trim() || 'By Birth',
      education: education.trim(),
      occupation: occupation.trim(),
      monthlyIncome: Number(monthlyIncome) || 0,
      familyMembers: Number(familyMembers) || 0,

      regular5Salat,
      salatWithMeaning,
      regularJummah,
      quranNazira,
      dailyQuranRecitation,
      quranWithMeaning,
      quranTafseer,
      readsJamaatBooks,
      doesTableeq,
      watchesMtaSermon,
      readsKhutba,

      chandaAamBudgeted,
      isMusi,
      tahrikEJadid,
      waqfEJadid,
      majlisChanda,
      ijtemaChanda,
      bulletinChanda
    };

    if (isEditing && memberToEdit) {
      updateMember(memberToEdit.id, memberPayload);
    } else {
      addMember(memberPayload);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full my-8 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            {isEditing ? (
              <Edit3 className="w-5 h-5 text-indigo-600" />
            ) : (
              <UserPlus className="w-5 h-5 text-emerald-600" />
            )}
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isEditing ? `Edit Member #${masterSlNo}` : 'Register New Member'}
              </h3>
              <p className="text-xs text-slate-500">
                {isEditing ? 'Update Tajneed record information' : 'Add member record with drop-down Region and Majlis assignment'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Section 1: Core Identification & Dropdowns */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1.5">
              1. Basic Information & Geographic Affiliation
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Master SL No. *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={masterSlNo}
                  onChange={(e) => setMasterSlNo(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* REGION dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  REGION (ড্রপ-ডাউন) *
                </label>
                <select
                  id="modal-select-region"
                  required
                  value={region}
                  onChange={(e) => handleRegionChange(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {ALL_REGIONS.map(reg => (
                    <option key={reg} value={reg}>{reg}</option>
                  ))}
                </select>
              </div>

              {/* MAJLIS dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  MAJLIS (ড্রপ-ডাউন) *
                </label>
                <select
                  id="modal-select-majlis"
                  required
                  value={majlis}
                  onChange={(e) => setMajlis(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {majlisOptions.map(maj => (
                    <option key={maj} value={maj}>{maj}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Member Full Name (সদস্যের নাম) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. A K M Ataur Rahman"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Age (বয়স)
                </label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  placeholder="e.g. 55"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date of Bai'at / By Birth (বয়াত গ্রহণের তারিখ বা জন্মগত)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="By Birth or Year (e.g. 1985)"
                    value={baiyatDateOrBirth}
                    onChange={(e) => setBaiyatDateOrBirth(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setBaiyatDateOrBirth('By Birth')}
                    className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-300 whitespace-nowrap"
                  >
                    By Birth
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Monthly Income (৳)
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="15000"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Family Size
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="4"
                    value={familyMembers}
                    onChange={(e) => setFamilyMembers(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Educational Qualification (শিক্ষাগত যোগ্যতা)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Masters, HSC, SSC, BA, MBBS, 8th"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  list="education-options"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <datalist id="education-options">
                  {COMMON_EDUCATIONS.map(edu => (
                    <option key={edu} value={edu} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Occupation / Profession (পেশা)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Business, Service, Farmer, Retired, Doctor"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  list="occupation-options"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <datalist id="occupation-options">
                  {COMMON_OCCUPATIONS.map(occ => (
                    <option key={occ} value={occ} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          {/* Section 2: Spiritual & Quran Observances */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1.5">
              2. Prayers & Quran Education (নামাজ ও কুরআন শিক্ষা)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2.5 p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={regular5Salat}
                  onChange={(e) => setRegular5Salat(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="font-medium text-slate-800">নিয়মিত ৫ ওয়াক্ত নামাজ আদায় করেন</span>
              </label>

              <label className="flex items-center gap-2.5 p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={salatWithMeaning}
                  onChange={(e) => setSalatWithMeaning(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="font-medium text-slate-800">অর্থসহ নামাজ জানেন</span>
              </label>

              <label className="flex items-center gap-2.5 p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={regularJummah}
                  onChange={(e) => setRegularJummah(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="font-medium text-slate-800">নিয়মিত জুমআর নামাজ পড়েন</span>
              </label>

              <label className="flex items-center gap-2.5 p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={quranNazira}
                  onChange={(e) => setQuranNazira(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="font-medium text-slate-800">কুরআন শিক্ষা: নাজেরা</span>
              </label>

              <label className="flex items-center gap-2.5 p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dailyQuranRecitation}
                  onChange={(e) => setDailyQuranRecitation(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="font-medium text-slate-800">প্রত্যহ কোরআন তেলওয়াত করেন</span>
              </label>

              <label className="flex items-center gap-2.5 p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={quranWithMeaning}
                  onChange={(e) => setQuranWithMeaning(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="font-medium text-slate-800">কোরআন অর্থসহ জানেন</span>
              </label>

              <label className="flex items-center gap-2.5 p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={quranTafseer}
                  onChange={(e) => setQuranTafseer(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="font-medium text-slate-800">তফসীর জানেন</span>
              </label>

              <label className="flex items-center gap-2.5 p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={readsJamaatBooks}
                  onChange={(e) => setReadsJamaatBooks(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="font-medium text-slate-800">জামাতী পুস্তক পাঠ করেন</span>
              </label>

              <label className="flex items-center gap-2.5 p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={doesTableeq}
                  onChange={(e) => setDoesTableeq(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="font-medium text-slate-800">তবলীগ করেন</span>
              </label>

              <label className="flex items-center gap-2.5 p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={watchesMtaSermon}
                  onChange={(e) => setWatchesMtaSermon(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="font-medium text-slate-800">এমটিএ-তে হুযুরের খুৎবা শুনেন ও দেখেন</span>
              </label>

              <label className="flex items-center gap-2.5 p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={readsKhutba}
                  onChange={(e) => setReadsKhutba(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="font-medium text-slate-800">হুযুর (আইঃ) এর খুৎবা পড়েন</span>
              </label>
            </div>
          </div>

          {/* Section 3: Chanda & Auxiliary Contributions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1.5">
              3. Chanda Schemes & Financial Contributions (চাঁদা ও আর্থিক কুরবানী)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2.5 p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={chandaAamBudgeted}
                  onChange={(e) => setChandaAamBudgeted(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="font-medium text-slate-800">চাঁদায়ে আম বাজেটভূক্ত</span>
              </label>

              <label className="flex items-center gap-2.5 p-2 bg-indigo-50/70 hover:bg-indigo-100/70 rounded-lg border border-indigo-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isMusi}
                  onChange={(e) => setIsMusi(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="font-bold text-indigo-950">ওসীয়তকারী (Musi - Al-Wasiyyat)</span>
              </label>

              <label className="flex items-center gap-2.5 p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tahrikEJadid}
                  onChange={(e) => setTahrikEJadid(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="font-medium text-slate-800">তাহরীকে জাদীদ (Tahrik-e-Jadid)</span>
              </label>

              <label className="flex items-center gap-2.5 p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={waqfEJadid}
                  onChange={(e) => setWaqfEJadid(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="font-medium text-slate-800">ওয়াকফে জাদীদ (Waqf-e-Jadid)</span>
              </label>

              <label className="flex items-center gap-2.5 p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={majlisChanda}
                  onChange={(e) => setMajlisChanda(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="font-medium text-slate-800">মজলিস চাঁদা (Majlis Chanda)</span>
              </label>

              <label className="flex items-center gap-2.5 p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ijtemaChanda}
                  onChange={(e) => setIjtemaChanda(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="font-medium text-slate-800">ইজতেমার চাঁদা (Ijtema Chanda)</span>
              </label>

              <label className="flex items-center gap-2.5 p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bulletinChanda}
                  onChange={(e) => setBulletinChanda(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="font-medium text-slate-800">বুলেটিনের চাঁদা (Bulletin Chanda)</span>
              </label>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Update Record' : 'Save Member'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
