import { RegionMajlisData } from '../types/tajneed';

export const REGIONS_AND_MAJLIS: RegionMajlisData = {
  'Greater Dhaka': [
    'DHAKA',
    'MIRPUR',
    'Nakhalpara',
    'MADARTEK',
    'Ashulia',
    'TEJGAON',
    'Gazipur',
    'Kabirpur',
    'Ashkona',
    'NARAYANGONJ',
    'NARSINDI',
    'REKAVI BAZAR',
    'SAVAR',
    'SONARGAON',
    'UTTAR BAHERCHAR',
    'CHARSINDUR'
  ],
  'Mymensing Region': [
    'MYMENSING',
    'DHANIKHOLA',
    'NETROKONA',
    'SHELBOROSH',
    'SOHAGI',
    'FULBARIA',
    'CHAANTARA'
  ],
  'B.Baria Region': [
    'B.BARIA',
    'TARUA',
    'KODDA',
    'GHATURA',
    'NATAI',
    'SHALGAO',
    'SAHBAZPUR',
    'BISNUPUR',
    'DURGARAMPUR',
    'KHUDRA B.BARIA',
    'SORAIL',
    'AKHAURA',
    'TAALSAHOR',
    'NABINAGOR',
    'VADUGOR',
    'NASIRPUR',
    'MOURAIL'
  ],
  'Cumilla CTG Region': [
    'CUMILLA',
    'CHORDUKHIA',
    'CHOTTOGRAM',
    'MAHILLA',
    'FAZILPUR',
    'KUTHIRHUT',
    'Aumbornagar',
    'PATENGA'
  ],
  'Dinajpur Region': [
    'DINAJPUR',
    'AHMADNAGAR',
    'SHALSIRI',
    'KAMLAPUKURI',
    'VAATGAONE',
    'HELENCHKURI',
    'DOHANDA',
    'BIRGONJ',
    'KHUDRAPARA',
    'RAMPUR'
  ],
  'Rangpur Region': [
    'RANGPUR',
    'SHYAMPUR',
    'MAHIGONJ',
    'SYEDPUR NIL.',
    'GAIBANDHA',
    'CHORAIKHOLA',
    'TARAGONJ'
  ],
  'Khulna Saatkhira': [
    'KHULNA',
    'JESSORE',
    'ROGHUNATHPUR BUG',
    'SHORPORAZPUR',
    'SUNDARBAN',
    'VETKHALI',
    'GHORILAL',
    'SAATKHIRA',
    'MIRGANG'
  ],
  'Kustia Chuadanga': [
    'NASERABAAD',
    'UTTAR VOBANIPUR',
    'KUSTIA',
    'UTHULI',
    'CHUANDANGA',
    'SHOILOMARI',
    'BOTIAPARA',
    'SHONTOSPUR',
    'BAHADURPUR'
  ],
  'Borishal Patuakhali': [
    'BORISHAL',
    'PATUAKHALI',
    'KHAKDAN',
    'KUKUA',
    'KAUNIA',
    'KRISHNANAGOR',
    'BOROBAISHDIA'
  ],
  'Kishorgonj Region': [
    'TEROGATI',
    'BIRPIEKSHA',
    'KOTIADI',
    'BHAIRAB BAZAR',
    'GALIMGAZI',
    'BETAL',
    'BOIRAGIRCHOR'
  ],
  'JAMALPUR-TANGAIL': [
    'SENGUA',
    'KOYRA',
    'SHORISABARI',
    'BAKSHIGONJ',
    'JAMALPUR NOWAPARA',
    'HOSNABAAD',
    'CHONOTIA',
    'RANGTIA',
    'BANIAJAAN'
  ],
  'Syl- S.gonj Region': [
    'CHADPUR CHABAGAN',
    'JAMALPUR HOBI',
    'BORO CHOR',
    'PAGULIA',
    'BIRGAONE',
    'ISLAMGONJ',
    'SYLHET',
    'Lakkhipur'
  ],
  'Bogura-Nator Region': [
    'BAGURA',
    'NEWSHONATOLA',
    'SIRAJGONJ',
    'KORITOLA',
    'PURULIA',
    'MOHARAJPUR',
    'MERIGACHA',
    'NAZIRPUR',
    'TEBARIA',
    'KAFURIA',
    'DIGAPOTIA',
    'BHARATPUR'
  ],
  'Rajshahi Region': [
    'RAJSHAHI',
    'TAHERABAD',
    'NURNAGAR ISH',
    'KODOM SOHOR',
    'SAYEDPUR BAGMARA',
    'PABNA',
    'DURGAPUR'
  ]
};

export const ALL_REGIONS = Object.keys(REGIONS_AND_MAJLIS);

export const ALL_MAJLISES = Object.values(REGIONS_AND_MAJLIS).flat().sort();

export function getMajlisesForRegion(region: string): string[] {
  if (!region || !REGIONS_AND_MAJLIS[region]) {
    return ALL_MAJLISES;
  }
  return REGIONS_AND_MAJLIS[region] || [];
}

export function getRegionForMajlis(majlis: string): string | null {
  for (const [region, majlises] of Object.entries(REGIONS_AND_MAJLIS)) {
    if (majlises.includes(majlis)) {
      return region;
    }
  }
  return null;
}

export const COMMON_EDUCATIONS = [
  'Primary / 5th',
  '8th',
  'SSC / 10th',
  'HSC / 12th',
  'Degree / Graduate',
  'BA / BSS / B.Com / BSC',
  'Masters / MA / M.Com / MSC / MBA',
  'Engineer (BE / B.Sc Eng.)',
  'Doctor (MBBS / DHMS / DMF)',
  'LLB / Advocate',
  'Mawlana / Dakhil / Alim / Fazil / Kamil / Hafez',
  'PhD / Doctorate'
];

export const COMMON_OCCUPATIONS = [
  'Business',
  'Service (Govt / Private)',
  'Retired / Pensioner',
  'Farmer / Agriculture',
  'Teacher / Educator',
  'Doctor / Physician',
  'Engineer / Technical',
  'Driver / Transport',
  'Labour / Craftsman',
  'Law / Legal Practice',
  'Unemployed / Other'
];
