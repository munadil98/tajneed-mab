import React from 'react';
import { 
  X, 
  Edit3, 
  Check, 
  Minus, 
  MapPin, 
  User, 
  Briefcase, 
  GraduationCap, 
  Banknote, 
  Users, 
  Calendar 
} from 'lucide-react';
import { Member } from '../types/tajneed';

interface MemberDetailModalProps {
  member: Member | null;
  onClose: () => void;
  onEdit: (member: Member) => void;
}

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  member,
  onClose,
  onEdit
}) => {
  if (!member) return null;

  const StatusPill: React.FC<{ active: boolean; label: string; sublabel?: string }> = ({ active, label, sublabel }) => (
    <div className={`p-2.5 rounded-lg border flex items-center justify-between text-xs transition ${
      active 
        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
        : 'bg-slate-50 border-slate-200 text-slate-500'
    }`}>
      <div>
        <span className="font-medium block">{label}</span>
        {sublabel && <span className="text-[10px] opacity-75 block">{sublabel}</span>}
      </div>
      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ml-2 ${
        active ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'
      }`}>
        {active ? <Check className="w-3.5 h-3.5" /> : <Minus className="w-3 h-3" />}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full my-8 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-base">
              {member.name ? member.name.charAt(0).toUpperCase() : '#'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {member.name}
                </h3>
                <span className="text-[11px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-mono">
                  SL #{member.masterSlNo}
                </span>
                {member.isMusi && (
                  <span className="text-[11px] bg-indigo-100 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">
                    Musi (Al-Wasiyyat)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{member.region} • {member.majlis}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onEdit(member)}
              className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Demographic Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Age / Bai'at</span>
              </span>
              <p className="text-sm font-bold text-slate-800 mt-1">
                {member.age ? `${member.age} yrs` : 'N/A'}
              </p>
              <span className="text-[10px] text-slate-500 truncate block">
                {member.baiyatDateOrBirth || 'By Birth'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <GraduationCap className="w-3 h-3" />
                <span>Education</span>
              </span>
              <p className="text-sm font-bold text-slate-800 mt-1 truncate">
                {member.education || 'Unspecified'}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Briefcase className="w-3 h-3" />
                <span>Occupation</span>
              </span>
              <p className="text-sm font-bold text-slate-800 mt-1 truncate">
                {member.occupation || 'Other'}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Banknote className="w-3 h-3" />
                <span>Monthly Income</span>
              </span>
              <p className="text-sm font-bold text-emerald-700 mt-1">
                ৳{member.monthlyIncome?.toLocaleString() || 0}
              </p>
              <span className="text-[10px] text-slate-500">
                {member.familyMembers || 0} family members
              </span>
            </div>
          </div>

          {/* Religious Observances */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1.5">
              Religious & Spiritual Practices (নামাজ ও ধর্মীয় অনুশাসন)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <StatusPill active={member.regular5Salat} label="৫ ওয়াক্ত নামাজ (5 Daily Prayers)" sublabel="Regular salat observance" />
              <StatusPill active={member.salatWithMeaning} label="অর্থসহ নামাজ (Prayer with Meaning)" sublabel="Understands recitation" />
              <StatusPill active={member.regularJummah} label="জুমআর নামাজ (Friday Prayer)" sublabel="Regular Jummah attendance" />
              <StatusPill active={member.quranNazira} label="কুরআন শিক্ষা: নাজেরা" sublabel="Can recite Holy Quran text" />
              <StatusPill active={member.dailyQuranRecitation} label="প্রত্যহ তেলওয়াত (Daily Recitation)" sublabel="Daily tilawat of Quran" />
              <StatusPill active={member.quranWithMeaning} label="কোরআন অর্থসহ (With Translation)" sublabel="Understands Holy Quran" />
              <StatusPill active={member.quranTafseer} label="কোরআন তফসীর (Quran Tafseer)" sublabel="Studied Quranic commentary" />
              <StatusPill active={member.readsJamaatBooks} label="জামাতী পুস্তক পাঠ (Jamaat Books)" sublabel="Reads community literature" />
              <StatusPill active={member.doesTableeq} label="তবলীগ কার্যক্রম (Tableeq/Preaching)" sublabel="Active in outreach" />
              <StatusPill active={member.watchesMtaSermon} label="এমটিএ খুৎবা (MTA Friday Sermon)" sublabel="Watches Huzoor's Khutba" />
              <StatusPill active={member.readsKhutba} label="খুৎবা পাঠ (Reads Sermon Text)" sublabel="Reads printed/online sermon" />
            </div>
          </div>

          {/* Financial & Chanda Status */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1.5">
              Financial Contributions & Auxiliaries (চাঁদা ও আর্থিক কুরবানী)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <StatusPill active={member.chandaAamBudgeted} label="চাঁদায়ে আম (Chanda Aam)" sublabel="Budgeted standard contribution" />
              <StatusPill active={member.isMusi} label="ওসীয়তকারী (Al-Wasiyyat)" sublabel="Bequeathment dedicated member" />
              <StatusPill active={member.tahrikEJadid} label="তাহরীকে জাদীদ (Tahrik-e-Jadid)" sublabel="Global mission initiative" />
              <StatusPill active={member.waqfEJadid} label="ওয়াকফে জাদীদ (Waqf-e-Jadid)" sublabel="Moral training and village fund" />
              <StatusPill active={member.majlisChanda} label="মজলিস চাঁদা (Majlis Chanda)" sublabel="Auxiliary organization fund" />
              <StatusPill active={member.ijtemaChanda} label="ইজতেমার চাঁদা (Ijtema Chanda)" sublabel="Annual gathering participation" />
              <StatusPill active={member.bulletinChanda} label="বুলেটিনের চাঁদা (Bulletin Chanda)" sublabel="Periodical & bulletin contribution" />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50 text-xs text-slate-400">
          <span>Record ID: {member.id}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-medium transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
