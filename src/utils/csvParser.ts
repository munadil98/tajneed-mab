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
 * Builds a column index map from the header row (Row 1)
 */
function buildHeaderMap(headerCols: string[]): { [key: string]: number } {
  const map: { [key: string]: number } = {};

  headerCols.forEach((colText, idx) => {
    const col = colText.toLowerCase().replace(/[\r\n_]/g, ' ').trim();
    if (!col) return;

    if (map['sl'] === undefined && (col.includes('master') || col.includes('sl') || col.includes('ক্রঃ') || col.includes('ক্রমিক') || col === 'no' || col === 'id')) {
      map['sl'] = idx;
    } else if (map['region'] === undefined && (col.includes('region') || col.includes('রিজিয়ন') || col.includes('বিভাগ'))) {
      map['region'] = idx;
    } else if (map['majlis'] === undefined && (col.includes('majlis') || col.includes('মজলিস') || col.includes('শাখা'))) {
      map['majlis'] = idx;
    } else if (map['name'] === undefined && !col.includes('meaning') && (col.includes('name') || col.includes('নাম') || col.includes('member'))) {
      map['name'] = idx;
    } else if (map['age'] === undefined && (col.includes('age') || col.includes('বয়স') || col.includes('eqm'))) {
      map['age'] = idx;
    } else if (map['baiyat'] === undefined && (col.includes('baiyat') || col.includes('বায়াত') || col.includes('birth'))) {
      map['baiyat'] = idx;
    } else if (map['education'] === undefined && (col.includes('educat') || col.includes('শিক্ষাগত') || col.includes('qualification') || col.includes('যোগ্যতা') || col === 'edu')) {
      map['education'] = idx;
    } else if (map['occupation'] === undefined && (col.includes('occupat') || col.includes('পেশা') || col.includes('profession') || col.includes('job'))) {
      map['occupation'] = idx;
    } else if (map['income'] === undefined && (col.includes('income') || col.includes('আয়') || col.includes('মাসিক') || col.includes('salary') || col.includes('bdt'))) {
      map['income'] = idx;
    } else if (map['family'] === undefined && (col.includes('family') || col.includes('পরিবার'))) {
      map['family'] = idx;
    } else if (map['regular5Salat'] === undefined && (col.includes('5 daily') || col.includes('5 salat') || col.includes('৫ ওয়াক্ত') || (col.includes('salat') && !col.includes('meaning')) || (col.includes('prayer') && !col.includes('meaning') && !col.includes('friday')))) {
      map['regular5Salat'] = idx;
    } else if (map['salatWithMeaning'] === undefined && (col.includes('prayer with meaning') || col.includes('salat with meaning') || col.includes('salat meaning') || col.includes('নামাজের অর্থ') || (col.includes('meaning') && !col.includes('quran')))) {
      map['salatWithMeaning'] = idx;
    } else if (map['regularJummah'] === undefined && (col.includes('friday') || col.includes('jummah') || col.includes('জুমুআহ') || col.includes('জুম্মা'))) {
      map['regularJummah'] = idx;
    } else if (map['quranNazira'] === undefined && (col.includes('nazira') || col.includes('নাজেরা'))) {
      map['quranNazira'] = idx;
    } else if (map['dailyQuranRecitation'] === undefined && (col.includes('daily quran') || col.includes('daily recitation') || col.includes('daily tilawat') || col.includes('দৈনিক তেলাওয়াত') || col.includes('দৈনিক'))) {
      map['dailyQuranRecitation'] = idx;
    } else if (map['quranWithMeaning'] === undefined && (col.includes('quran with meaning') || col.includes('quran meaning') || col.includes('অর্থসহ কুরআন') || col.includes('অর্থসহ তেলাওয়াত'))) {
      map['quranWithMeaning'] = idx;
    } else if (map['quranTafseer'] === undefined && (col.includes('tafseer') || col.includes('তাফসীর') || col.includes('tafsir'))) {
      map['quranTafseer'] = idx;
    } else if (map['readsJamaatBooks'] === undefined && (col.includes('book') || col.includes('পুস্তক') || col.includes('বই'))) {
      map['readsJamaatBooks'] = idx;
    } else if (map['doesTableeq'] === undefined && (col.includes('tableeq') || col.includes('তাবলীগ') || col.includes('তাবলীগে'))) {
      map['doesTableeq'] = idx;
    } else if (map['watchesMtaSermon'] === undefined && (col.includes('watches mta') || col.includes('mta khutba') || col.includes('mta sermon') || col.includes('mta') || col.includes('এমটিএ'))) {
      map['watchesMtaSermon'] = idx;
    } else if (map['readsKhutba'] === undefined && (col.includes('read khutba') || col.includes('reads khutba') || col.includes('খুতবা পাঠ') || (col.includes('khutba') && !col.includes('mta')))) {
      map['readsKhutba'] = idx;
    } else if (map['chandaAamBudgeted'] === undefined && (col.includes('chanda aam') || col.includes('aam budgeted') || col.includes('চন্দা আম') || col.includes('ধার্যকৃত'))) {
      map['chandaAamBudgeted'] = idx;
    } else if (map['isMusi'] === undefined && (col.includes('musi') || col.includes('wasiyyat') || col.includes('মুসি') || col.includes('ওসিয়ত') || col.includes('ওসিয়াত'))) {
      map['isMusi'] = idx;
    } else if (map['tahrikEJadid'] === undefined && (col.includes('tahrik') || col.includes('তাহরীক') || col.includes('তাহরীকে'))) {
      map['tahrikEJadid'] = idx;
    } else if (map['waqfEJadid'] === undefined && (col.includes('waqf') || col.includes('ওয়াকফ') || col.includes('ওয়াকফে'))) {
      map['waqfEJadid'] = idx;
    } else if (map['majlisChanda'] === undefined && (col.includes('majlis chanda') || col.includes('মজলিস চন্দা') || col.includes('chanda majlis'))) {
      map['majlisChanda'] = idx;
    } else if (map['ijtemaChanda'] === undefined && (col.includes('ijtema') || col.includes('ইজতেমা') || col.includes('chanda ijtema'))) {
      map['ijtemaChanda'] = idx;
    } else if (map['bulletinChanda'] === undefined && (col.includes('bulletin') || col.includes('বুলেটিন') || col.includes('chanda bulletin'))) {
      map['bulletinChanda'] = idx;
    }
  });

  return map;
}

/**
 * Parses full raw CSV text into Member[]
 *
 * NOTE ON SCHEMA FORMAT:
 * - Only Row 1 is the header row. Member records begin immediately on Row 2.
 * - From Column L alternate blank header columns (L, N, etc.) are deleted across all rows.
 * - Survey indicators are contiguous starting at Column K (index 10) through Column AB (index 27):
 *     10: 5 Daily Prayers
 *     11: Prayer with Meaning
 *     12: Regular Friday Prayer
 *     13: Quran Nazira
 *     14: Daily Quran Recitation
 *     15: Quran with Meaning
 *     16: Quran Tafseer
 *     17: Reads Jamaat Books
 *     18: Tableeq Participation
 *     19: Watches MTA Khutba
 *     20: Reads Khutba
 *     21: Chanda Aam Budgeted
 *     22: Wasiyyat (Musi)
 *     23: Tahrik-e-Jadid
 *     24: Waqf-e-Jadid
 *     25: Majlis Chanda
 *     26: Ijtema Chanda
 *     27: Bulletin Chanda
 */
export function parseMembersCSV(csvText: string): Member[] {
  const rawLines = csvText.split(/\r?\n/);
  const members: Member[] = [];

  let headerMap: { [key: string]: number } | null = null;
  let isLegacyPairedFormat = false;

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim();
    if (!line) continue;

    const cols = parseCSVLine(line);
    if (!cols || cols.length === 0) continue;

    const firstCol = cols[0]?.trim().replace(/^\uFEFF/, '') || '';
    const isFirstColInteger = /^\d+$/.test(firstCol);

    // Row 1 detection: only row-1 is the header row
    if (!headerMap) {
      if (!isFirstColInteger || firstCol.toLowerCase().includes('master') || firstCol.toLowerCase().includes('sl') || firstCol.includes('ক্রঃ')) {
        headerMap = buildHeaderMap(cols);
        continue;
      }
    }

    // Helper functions for column access
    const getCol = (key: string, defaultIdx: number): string => {
      if (headerMap && headerMap[key] !== undefined && cols[headerMap[key]] !== undefined) {
        return cols[headerMap[key]] || '';
      }
      return cols[defaultIdx] || '';
    };

    const getBoolCol = (key: string, contiguousIdx: number, legacyPairedIdx: number): boolean => {
      if (headerMap && headerMap[key] !== undefined && cols[headerMap[key]] !== undefined) {
        return parseBool(cols[headerMap[key]]);
      }
      if (isLegacyPairedFormat) {
        return parseBool(cols[legacyPairedIdx]);
      }
      return parseBool(cols[contiguousIdx]);
    };

    const region = getCol('region', 1).trim();
    const majlis = getCol('majlis', 2).trim();
    const name = getCol('name', 3).trim();

    // Skip if empty data row
    if (!name && !majlis && !region) continue;

    // Skip secondary or repeated header rows
    if (name.toLowerCase().includes('members name') || name.toLowerCase().includes('সদস্যের নাম') ||
        majlis.toLowerCase().includes('majlis (ড্রপ') || region.toLowerCase().includes('region (ড্রপ')) {
      continue;
    }

    // Extract serial number or fallback to sequential count
    let sl: number;
    const numMatch = firstCol.match(/\d+/);
    if (numMatch) {
      sl = parseInt(numMatch[0], 10);
    } else {
      sl = members.length + 1;
    }

    // Detect legacy 46-column paired [Yes, No] format if no header was matched and line has >= 40 columns
    if (!headerMap && cols.length >= 40) {
      isLegacyPairedFormat = true;
    }

    const ageStr = getCol('age', 4);
    const ageRaw = ageStr ? parseInt(ageStr, 10) : null;
    const age = (ageRaw !== null && !isNaN(ageRaw) && ageRaw > 0 && ageRaw < 130) ? ageRaw : null;

    const baiyat = getCol('baiyat', 5);
    const education = getCol('education', 6);
    const occupation = getCol('occupation', 7);
    const monthlyIncome = parseIncome(getCol('income', 8));
    const familyStr = getCol('family', 9);
    const familyMembers = familyStr ? parseInt(familyStr, 10) || 0 : 0;

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

      // Indicator columns: contiguous indices 10 through 27
      regular5Salat: getBoolCol('regular5Salat', 10, 10),
      salatWithMeaning: getBoolCol('salatWithMeaning', 11, 12),
      regularJummah: getBoolCol('regularJummah', 12, 14),

      quranNazira: getBoolCol('quranNazira', 13, 16),
      dailyQuranRecitation: getBoolCol('dailyQuranRecitation', 14, 18),
      quranWithMeaning: getBoolCol('quranWithMeaning', 15, 20),
      quranTafseer: getBoolCol('quranTafseer', 16, 22),

      readsJamaatBooks: getBoolCol('readsJamaatBooks', 17, 24),
      doesTableeq: getBoolCol('doesTableeq', 18, 26),
      watchesMtaSermon: getBoolCol('watchesMtaSermon', 19, 28),
      readsKhutba: getBoolCol('readsKhutba', 20, 30),

      chandaAamBudgeted: getBoolCol('chandaAamBudgeted', 21, 32),
      isMusi: getBoolCol('isMusi', 22, 34),
      tahrikEJadid: getBoolCol('tahrikEJadid', 23, 36),
      waqfEJadid: getBoolCol('waqfEJadid', 24, 38),
      majlisChanda: getBoolCol('majlisChanda', 25, 40),
      ijtemaChanda: getBoolCol('ijtemaChanda', 26, 42),
      bulletinChanda: getBoolCol('bulletinChanda', 27, 44),
    };

    members.push(member);
  }

  return members;
}

/**
 * Export member list to CSV string with a single header row and contiguous columns
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
    '5 Daily Prayers',
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
