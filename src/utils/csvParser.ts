import { Member } from '../types/tajneed';

/**
 * Split CSV line taking quoted fields into account
 */
export function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Parse monetary string into clean number (e.g. "10,000" -> 10000)
 */
export function parseIncome(val: string | undefined): number {
  if (!val) return 0;
  const clean = val.replace(/[",\s]/g, '').trim();
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}

/**
 * Parse an indicator cell (1 = Yes, 0 or empty = No)
 */
export function parseBool(val: string | undefined): boolean {
  if (!val) return false;
  const s = val.trim().toLowerCase();
  return s === '1' || s === 'yes' || s === 'true' || s === 'হাঁ' || s === 'হ্যাঁ';
}

/**
 * Parses full raw CSV text into Member[]
 */
export function parseMembersCSV(csvText: string): Member[] {
  const lines = csvText.split(/\r?\n/);
  const members: Member[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = parseCSVLine(line);
    const firstCol = cols[0]?.trim();

    // Check if header row
    if (firstCol.toLowerCase().includes('master') || firstCol.toLowerCase().includes('sl') || isNaN(parseInt(firstCol, 10))) {
      continue;
    }

    const sl = parseInt(firstCol, 10);
    if (isNaN(sl)) continue;

    const region = cols[1] || '';
    const majlis = cols[2] || '';
    const name = cols[3] || '';
    if (!name && !majlis && !region) continue;

    const ageRaw = cols[4] ? parseInt(cols[4], 10) : null;
    const age = (ageRaw !== null && !isNaN(ageRaw) && ageRaw > 0 && ageRaw < 130) ? ageRaw : null;

    const baiyat = cols[5] || '';
    const education = cols[6] || '';
    const occupation = cols[7] || '';
    const monthlyIncome = parseIncome(cols[8]);
    const familyMembers = cols[9] ? parseInt(cols[9], 10) || 0 : 0;

    // Survey indicators:
    // In the sheet columns are paired [Yes, No]:
    // Col 10: 5 Salat Yes, Col 11: No
    // Col 12: Salat Meaning Yes, Col 13: No
    // Col 14: Jummah Yes, Col 15: No
    // Col 16: Quran Nazira Yes, Col 17: No
    // Col 18: Daily Tilawat Yes, Col 19: No
    // Col 20: Quran Meaning Yes, Col 21: No
    // Col 22: Quran Tafseer Yes, Col 23: No
    // Col 24: Jamaat Books Yes, Col 25: No
    // Col 26: Tableeq Yes, Col 27: No
    // Col 28: MTA Sermon Yes, Col 29: No
    // Col 30: Read Khutba Yes, Col 31: No
    // Col 32: Chanda Aam Budgeted Yes, Col 33: No
    // Col 34: Musi Yes, Col 35: No
    // Col 36: Tahrik-e-Jadid Yes, Col 37: No
    // Col 38: Waqf-e-Jadid Yes, Col 39: No
    // Col 40: Majlis Chanda Yes, Col 41: No
    // Col 42: Ijtema Chanda Yes, Col 43: No
    // Col 44: Bulletin Chanda Yes, Col 45: No

    const member: Member = {
      id: `mem-${sl}-${Math.random().toString(36).substring(2, 7)}`,
      masterSlNo: sl,
      region: region.trim(),
      majlis: majlis.trim(),
      name: name.trim(),
      age,
      baiyatDateOrBirth: baiyat.trim(),
      education: education.trim(),
      occupation: occupation.trim(),
      monthlyIncome,
      familyMembers: isNaN(familyMembers) ? 0 : familyMembers,

      regular5Salat: parseBool(cols[10]),
      salatWithMeaning: parseBool(cols[12]),
      regularJummah: parseBool(cols[14]),

      quranNazira: parseBool(cols[16]),
      dailyQuranRecitation: parseBool(cols[18]),
      quranWithMeaning: parseBool(cols[20]),
      quranTafseer: parseBool(cols[22]),

      readsJamaatBooks: parseBool(cols[24]),
      doesTableeq: parseBool(cols[26]),
      watchesMtaSermon: parseBool(cols[28]),
      readsKhutba: parseBool(cols[30]),

      chandaAamBudgeted: parseBool(cols[32]),
      isMusi: parseBool(cols[34]),
      tahrikEJadid: parseBool(cols[36]),
      waqfEJadid: parseBool(cols[38]),
      majlisChanda: parseBool(cols[40]),
      ijtemaChanda: parseBool(cols[42]),
      bulletinChanda: parseBool(cols[44]),
    };

    members.push(member);
  }

  return members;
}

/**
 * Export member list to CSV string
 */
export function exportMembersToCSV(members: Member[]): string {
  const header1 = [
    'Master SL No.',
    'REGION',
    'MAJLIS',
    'MEMBERS NAME',
    'eqm (Age)',
    'Date of Baiyat / By Birth',
    'Educational Qualification',
    'Occupation',
    'Monthly Income (BDT)',
    'Family Members',
    '5 Daily Prayers (Yes/No)',
    'Prayer with Meaning',
    'Regular Friday Prayer',
    'Quran Nazira',
    'Daily Quran Recitation',
    'Quran with Meaning',
    'Quran Tafseer',
    'Reads Jamaat Books',
    'Tableeq Participation',
    'Watches MTA Khutba',
    'Reads Khutba',
    'Chanda Aam Budgeted',
    'Wasiyyat (Musi)',
    'Tahrik-e-Jadid',
    'Waqf-e-Jadid',
    'Majlis Chanda',
    'Ijtema Chanda',
    'Bulletin Chanda'
  ].join(',');

  const rows = members.map(m => {
    return [
      m.masterSlNo,
      `"${(m.region || '').replace(/"/g, '""')}"`,
      `"${(m.majlis || '').replace(/"/g, '""')}"`,
      `"${(m.name || '').replace(/"/g, '""')}"`,
      m.age ?? '',
      `"${(m.baiyatDateOrBirth || '').replace(/"/g, '""')}"`,
      `"${(m.education || '').replace(/"/g, '""')}"`,
      `"${(m.occupation || '').replace(/"/g, '""')}"`,
      m.monthlyIncome,
      m.familyMembers,
      m.regular5Salat ? 1 : 0,
      m.salatWithMeaning ? 1 : 0,
      m.regularJummah ? 1 : 0,
      m.quranNazira ? 1 : 0,
      m.dailyQuranRecitation ? 1 : 0,
      m.quranWithMeaning ? 1 : 0,
      m.quranTafseer ? 1 : 0,
      m.readsJamaatBooks ? 1 : 0,
      m.doesTableeq ? 1 : 0,
      m.watchesMtaSermon ? 1 : 0,
      m.readsKhutba ? 1 : 0,
      m.chandaAamBudgeted ? 1 : 0,
      m.isMusi ? 1 : 0,
      m.tahrikEJadid ? 1 : 0,
      m.waqfEJadid ? 1 : 0,
      m.majlisChanda ? 1 : 0,
      m.ijtemaChanda ? 1 : 0,
      m.bulletinChanda ? 1 : 0
    ].join(',');
  });

  return [header1, ...rows].join('\r\n');
}
