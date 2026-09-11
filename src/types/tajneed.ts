export interface Member {
  id: string; // internal unique id
  masterSlNo: number;
  region: string;
  majlis: string;
  name: string;
  age: number | null;
  baiyatDateOrBirth: string; // 'By Birth' or date string
  education: string;
  occupation: string;
  monthlyIncome: number; // in BDT
  familyMembers: number;
  
  // Religious & Spiritual Practices (true/false)
  regular5Salat: boolean; // নিয়মিত ৫ ওয়াক্ত নামাজ আদায় করেন কিনা?
  salatWithMeaning: boolean; // অর্থসহ নামাজ জানেন কি?
  regularJummah: boolean; // নিয়মিত জুমআর নামাজ পড়েন কি?
  
  // Quran Education
  quranNazira: boolean; // নাজেরা
  dailyQuranRecitation: boolean; // প্রত্যহ কোরআন তেলওয়াত করেন কি?
  quranWithMeaning: boolean; // অর্থসহ জানেন কিনা?
  quranTafseer: boolean; // তফসীর জানেন কি?
  
  // Activities & MTA
  readsJamaatBooks: boolean; // জামাতী পুস্তক পাঠ করেন কি?
  doesTableeq: boolean; // তবলীগ করেন কি?
  watchesMtaSermon: boolean; // এমটিএ-তে হুযুর (আইঃ)এর খুৎবা শুনেন ও দেখেন কি?
  readsKhutba: boolean; // হুযুর (আইঃ)এর খুৎবা পড়েন কি?
  
  // Chanda / Financial
  chandaAamBudgeted: boolean; // চাঁদায়ে আম বাজেটভূক্ত কিনা?
  isMusi: boolean; // ওসীয়তকারী কিনা?
  tahrikEJadid: boolean; // তাহরীকে জাদীদ
  waqfEJadid: boolean; // ওয়াকফে জাদীদ
  majlisChanda: boolean; // মজলিস চাঁদা
  ijtemaChanda: boolean; // ইজতেমার চাঁদা
  bulletinChanda: boolean; // বুলেটিনের চাঁদা
  
  updatedAt?: string;
}

export interface RegionMajlisData {
  [region: string]: string[];
}

export interface FilterOptions {
  search: string;
  region: string;
  majlis: string;
  education: string;
  occupation: string;
  ageRange: 'all' | 'under40' | '40-50' | '51-60' | '61-70' | '71plus';
  incomeRange: 'all' | 'zero' | '1-10000' | '10001-30000' | '30001-60000' | '60000plus';
  salatFilter: 'all' | 'yes' | 'no';
  jummahFilter: 'all' | 'yes' | 'no';
  quranNaziraFilter: 'all' | 'yes' | 'no';
  dailyRecitationFilter: 'all' | 'yes' | 'no';
  mtaFilter: 'all' | 'yes' | 'no';
  musiFilter: 'all' | 'yes' | 'no';
  chandaAamFilter: 'all' | 'yes' | 'no';
}

export type CustomWidgetMetricType = 
  | 'count' 
  | 'sum_income' 
  | 'avg_income' 
  | 'avg_age' 
  | 'avg_family' 
  | 'percentage';

export interface CustomDashboardWidget {
  id: string;
  title: string;
  description?: string;
  filterRegion?: string;
  filterMajlis?: string;
  filterOccupation?: string;
  filterEducation?: string;
  filterConditionField?: keyof Member;
  filterConditionValue?: boolean | string;
  metricType: CustomWidgetMetricType;
  colorScheme: 'emerald' | 'blue' | 'indigo' | 'amber' | 'rose' | 'teal' | 'slate';
  createdAt: string;
}
