import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Member } from '../types/tajneed';

export type MajlisReportType = 'accumulated' | 'comprehensive' | 'spiritual' | 'financial' | 'attendance';

interface ExportMajlisPdfOptions {
  region: string;
  majlis: string;
  members: Member[];
  reportType?: MajlisReportType;
  title?: string;
  preparedBy?: string;
}

interface BatchExportOptions {
  region: string;
  majlises: string[];
  membersByMajlis: Record<string, Member[]>;
  reportType?: MajlisReportType;
  preparedBy?: string;
}

/**
 * Format currency in Bangladeshi Taka
 */
function formatBDT(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0
  }).format(amount) + ' Tk';
}

/**
 * Get displayable status string
 */
function boolStr(val: boolean): string {
  return val ? 'Yes' : '-';
}

/**
 * Generates a PDF for a single Majlis
 */
export function generateMajlisPdfDoc(options: ExportMajlisPdfOptions): jsPDF {
  const {
    region,
    majlis,
    members,
    reportType = 'comprehensive',
    title = "Majlis Ansarullah Bangladesh",
    preparedBy = 'Secretary Tajneed'
  } = options;

  // Use landscape for wide data tables
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  buildMajlisPage(doc, {
    region,
    majlis,
    members,
    reportType,
    title,
    preparedBy,
    isFirstPage: true
  });

  return doc;
}

/**
 * Builds table and headers for a single Majlis on current/new page of doc
 */
function buildMajlisPage(
  doc: jsPDF, 
  data: {
    region: string;
    majlis: string;
    members: Member[];
    reportType: MajlisReportType;
    title: string;
    preparedBy: string;
    isFirstPage: boolean;
  }
) {
  const { region, majlis, members, reportType, title, isFirstPage } = data;

  if (!isFirstPage) {
    doc.addPage('a4', 'landscape');
  }

  const pageWidth = doc.internal.pageSize.getWidth();
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  // Header Banner
  doc.setFillColor(15, 76, 58); // Deep Emerald
  doc.rect(10, 10, pageWidth - 20, 24, 'F');

  // Header Titles
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(title.toUpperCase(), 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(209, 250, 229); // Light emerald
  const reportHeaderLabel = reportType === 'accumulated' 
    ? 'ALL SECTIONS ACCUMULATED (MASTER CENSUS)' 
    : reportType.toUpperCase();
  doc.text(`TAJNEED & CENSUS REGISTRY • MAJLIS REPORT (${reportHeaderLabel})`, 14, 24);

  // Majlis & Region Pills in Header (Right aligned)
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  const rightMeta = `Majlis: ${majlis}  |  Region: ${region}  |  Date: ${currentDate}`;
  doc.text(rightMeta, pageWidth - 14, 20, { align: 'right' });

  // Summary Metrics Calculation
  const totalCount = members.length;
  const avgAge = totalCount > 0 
    ? Math.round(members.reduce((acc, m) => acc + (m.age || 0), 0) / (members.filter(m => m.age).length || 1)) 
    : 0;
  const totalIncome = members.reduce((acc, m) => acc + (m.monthlyIncome || 0), 0);
  const salatCount = members.filter(m => m.regular5Salat).length;
  const salatPct = totalCount > 0 ? Math.round((salatCount / totalCount) * 100) : 0;
  const musiCount = members.filter(m => m.isMusi).length;
  const musiPct = totalCount > 0 ? Math.round((musiCount / totalCount) * 100) : 0;
  const quranCount = members.filter(m => m.quranNazira).length;
  const chandaCount = members.filter(m => m.chandaAamBudgeted).length;

  // Key KPI Cards (Y = 38 to 48)
  const kpiY = 38;
  const cardWidth = (pageWidth - 20) / 5 - 2;
  const cardHeight = 12;

  const kpis = [
    { label: 'Total Members', val: `${totalCount}` },
    { label: 'Avg Age', val: `${avgAge} yrs` },
    { label: 'Total Mo. Income', val: formatBDT(totalIncome) },
    { label: '5 Daily Salat', val: `${salatCount} (${salatPct}%)` },
    { label: 'Wasiyyat (Musi)', val: `${musiCount} (${musiPct}%)` }
  ];

  kpis.forEach((kpi, idx) => {
    const x = 10 + idx * (cardWidth + 2.5);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, kpiY, cardWidth, cardHeight, 1.5, 1.5, 'FD');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, x + 3, kpiY + 4.5);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(kpi.val, x + 3, kpiY + 9.5);
  });

  // Table Configuration Based on Report Type
  let head: any[] = [];
  let body: (string | number)[][] = [];
  let colStyles: Record<number, { cellWidth?: number | 'auto'; halign?: 'left' | 'center' | 'right' }> = {};

  if (reportType === 'accumulated') {
    head = [
      [
        { content: '1. DEMOGRAPHICS', colSpan: 8, styles: { halign: 'center', fillColor: [15, 76, 58], textColor: [255, 255, 255], fontStyle: 'bold' } },
        { content: '2. SALAT', colSpan: 3, styles: { halign: 'center', fillColor: [13, 148, 136], textColor: [255, 255, 255], fontStyle: 'bold' } },
        { content: '3. HOLY QURAN', colSpan: 4, styles: { halign: 'center', fillColor: [5, 150, 105], textColor: [255, 255, 255], fontStyle: 'bold' } },
        { content: '4. MTA & TABLIGH', colSpan: 4, styles: { halign: 'center', fillColor: [14, 116, 144], textColor: [255, 255, 255], fontStyle: 'bold' } },
        { content: '5. CHANDA & WASIYYAT', colSpan: 7, styles: { halign: 'center', fillColor: [67, 56, 202], textColor: [255, 255, 255], fontStyle: 'bold' } },
        { content: '6. VERIFY', colSpan: 1, styles: { halign: 'center', fillColor: [71, 85, 105], textColor: [255, 255, 255], fontStyle: 'bold' } }
      ],
      [
        'SL',
        'Name',
        'Age',
        'Baiyat',
        'Edu',
        'Occupation',
        'Income',
        'Fam',
        '5 Salat',
        'Meaning',
        'Jummah',
        'Nazira',
        'Daily',
        'Meaning',
        'Tafseer',
        'Books',
        'Tableeq',
        'MTA',
        'Khutba',
        'Ch. Aam',
        'Musi',
        'Tahrik',
        'Waqf',
        'Majlis',
        'Ijtema',
        'Bulletin',
        'Signature'
      ]
    ];

    body = members.map((m, idx) => [
      idx + 1,
      m.name,
      m.age ? `${m.age}` : '-',
      m.baiyatDateOrBirth || '-',
      m.education || '-',
      m.occupation || '-',
      m.monthlyIncome ? m.monthlyIncome.toLocaleString() : '0',
      m.familyMembers || 1,
      boolStr(m.regular5Salat),
      boolStr(m.salatWithMeaning),
      boolStr(m.regularJummah),
      boolStr(m.quranNazira),
      boolStr(m.dailyQuranRecitation),
      boolStr(m.quranWithMeaning),
      boolStr(m.quranTafseer),
      boolStr(m.readsJamaatBooks),
      boolStr(m.doesTableeq),
      boolStr(m.watchesMtaSermon),
      boolStr(m.readsKhutba),
      boolStr(m.chandaAamBudgeted),
      boolStr(m.isMusi),
      boolStr(m.tahrikEJadid),
      boolStr(m.waqfEJadid),
      boolStr(m.majlisChanda),
      boolStr(m.ijtemaChanda),
      boolStr(m.bulletinChanda),
      ''
    ]);

    colStyles = {
      0: { cellWidth: 7, halign: 'center' },
      1: { cellWidth: 26, halign: 'left' },
      2: { cellWidth: 7, halign: 'center' },
      3: { cellWidth: 10, halign: 'center' },
      4: { cellWidth: 13, halign: 'left' },
      5: { cellWidth: 15, halign: 'left' },
      6: { cellWidth: 13, halign: 'right' },
      7: { cellWidth: 7, halign: 'center' },
      8: { cellWidth: 8, halign: 'center' },
      9: { cellWidth: 8, halign: 'center' },
      10: { cellWidth: 8, halign: 'center' },
      11: { cellWidth: 8, halign: 'center' },
      12: { cellWidth: 8, halign: 'center' },
      13: { cellWidth: 8, halign: 'center' },
      14: { cellWidth: 8, halign: 'center' },
      15: { cellWidth: 8, halign: 'center' },
      16: { cellWidth: 8, halign: 'center' },
      17: { cellWidth: 8, halign: 'center' },
      18: { cellWidth: 8, halign: 'center' },
      19: { cellWidth: 8, halign: 'center' },
      20: { cellWidth: 8, halign: 'center' },
      21: { cellWidth: 8, halign: 'center' },
      22: { cellWidth: 8, halign: 'center' },
      23: { cellWidth: 8, halign: 'center' },
      24: { cellWidth: 8, halign: 'center' },
      25: { cellWidth: 8, halign: 'center' },
      26: { cellWidth: 13, halign: 'center' }
    };
  } else if (reportType === 'comprehensive') {
    head = [[
      'SL',
      'Name',
      'Age',
      'Baiyat',
      'Education',
      'Occupation',
      'Income (BDT)',
      'Family',
      '5 Salat',
      'Jummah',
      'Quran',
      'Musi',
      'Chanda'
    ]];

    body = members.map((m, idx) => [
      idx + 1,
      m.name,
      m.age ? `${m.age}` : '-',
      m.baiyatDateOrBirth || '-',
      m.education || '-',
      m.occupation || '-',
      m.monthlyIncome ? m.monthlyIncome.toLocaleString() : '0',
      m.familyMembers || 1,
      boolStr(m.regular5Salat),
      boolStr(m.regularJummah),
      boolStr(m.quranNazira),
      boolStr(m.isMusi),
      boolStr(m.chandaAamBudgeted)
    ]);

    colStyles = {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 52, halign: 'left' },
      2: { cellWidth: 12, halign: 'center' },
      3: { cellWidth: 20, halign: 'left' },
      4: { cellWidth: 26, halign: 'left' },
      5: { cellWidth: 32, halign: 'left' },
      6: { cellWidth: 24, halign: 'right' },
      7: { cellWidth: 14, halign: 'center' },
      8: { cellWidth: 16, halign: 'center' },
      9: { cellWidth: 16, halign: 'center' },
      10: { cellWidth: 16, halign: 'center' },
      11: { cellWidth: 15, halign: 'center' },
      12: { cellWidth: 16, halign: 'center' }
    };
  } else if (reportType === 'spiritual') {
    head = [[
      'SL',
      'Name',
      'Age',
      '5 Daily Salat',
      'Salat Meaning',
      'Jummah',
      'Quran Nazira',
      'Daily Recite',
      'Tafseer',
      'Books',
      'Tableeq',
      'MTA Sermon',
      'Khutba'
    ]];

    body = members.map((m, idx) => [
      idx + 1,
      m.name,
      m.age ? `${m.age}` : '-',
      boolStr(m.regular5Salat),
      boolStr(m.salatWithMeaning),
      boolStr(m.regularJummah),
      boolStr(m.quranNazira),
      boolStr(m.dailyQuranRecitation),
      boolStr(m.quranTafseer),
      boolStr(m.readsJamaatBooks),
      boolStr(m.doesTableeq),
      boolStr(m.watchesMtaSermon),
      boolStr(m.readsKhutba)
    ]);

    colStyles = {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 54, halign: 'left' },
      2: { cellWidth: 12, halign: 'center' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 18, halign: 'center' },
      6: { cellWidth: 20, halign: 'center' },
      7: { cellWidth: 20, halign: 'center' },
      8: { cellWidth: 16, halign: 'center' },
      9: { cellWidth: 16, halign: 'center' },
      10: { cellWidth: 16, halign: 'center' },
      11: { cellWidth: 22, halign: 'center' },
      12: { cellWidth: 18, halign: 'center' }
    };
  } else if (reportType === 'financial') {
    head = [[
      'SL',
      'Name',
      'Occupation',
      'Monthly Income (BDT)',
      'Family',
      'Chanda Aam Budgeted',
      'Wasiyyat (Musi)',
      'Tahrik-e-Jadid',
      'Waqf-e-Jadid',
      'Majlis Chanda',
      'Ijtema Chanda',
      'Bulletin Chanda'
    ]];

    body = members.map((m, idx) => [
      idx + 1,
      m.name,
      m.occupation || '-',
      m.monthlyIncome ? m.monthlyIncome.toLocaleString() : '0',
      m.familyMembers || 1,
      boolStr(m.chandaAamBudgeted),
      boolStr(m.isMusi),
      boolStr(m.tahrikEJadid),
      boolStr(m.waqfEJadid),
      boolStr(m.majlisChanda),
      boolStr(m.ijtemaChanda),
      boolStr(m.bulletinChanda)
    ]);

    colStyles = {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 52, halign: 'left' },
      2: { cellWidth: 32, halign: 'left' },
      3: { cellWidth: 28, halign: 'right' },
      4: { cellWidth: 15, halign: 'center' },
      5: { cellWidth: 26, halign: 'center' },
      6: { cellWidth: 22, halign: 'center' },
      7: { cellWidth: 20, halign: 'center' },
      8: { cellWidth: 20, halign: 'center' },
      9: { cellWidth: 18, halign: 'center' },
      10: { cellWidth: 18, halign: 'center' },
      11: { cellWidth: 18, halign: 'center' }
    };
  } else {
    // Attendance / Census Verification Roster
    head = [[
      'SL',
      'Name',
      'Age',
      'Occupation',
      'Education',
      'Family',
      'Income',
      'Contact / Phone',
      'Attendance / Verification Signature'
    ]];

    body = members.map((m, idx) => [
      idx + 1,
      m.name,
      m.age ? `${m.age}` : '-',
      m.occupation || '-',
      m.education || '-',
      m.familyMembers || 1,
      m.monthlyIncome ? `${m.monthlyIncome.toLocaleString()} Tk` : '-',
      '',
      ''
    ]);

    colStyles = {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 62, halign: 'left' },
      2: { cellWidth: 14, halign: 'center' },
      3: { cellWidth: 34, halign: 'left' },
      4: { cellWidth: 30, halign: 'left' },
      5: { cellWidth: 16, halign: 'center' },
      6: { cellWidth: 24, halign: 'right' },
      7: { cellWidth: 36, halign: 'left' },
      8: { cellWidth: 48, halign: 'center' }
    };
  }

  const isAccumulated = reportType === 'accumulated';

  // Draw Table using jspdf-autotable
  autoTable(doc, {
    startY: 53,
    head: head,
    body: body,
    theme: 'grid',
    styles: {
      fontSize: isAccumulated ? 5.5 : 7.5,
      cellPadding: isAccumulated ? 0.9 : 1.6,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.2
    },
    headStyles: {
      fillColor: [15, 76, 58],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: isAccumulated ? 5.5 : 7.5,
      halign: 'center'
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: colStyles,
    margin: { left: isAccumulated ? 8 : 10, right: isAccumulated ? 8 : 10, bottom: 18 },
    didDrawPage: (data) => {
      // Footer with signature lines and page number
      const pageHeight = doc.internal.pageSize.getHeight();
      
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.line(10, pageHeight - 12, pageWidth - 10, pageHeight - 12);

      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Tajneed Registry • Region: ${region} • Majlis: ${majlis} • Confidential Document for Official Majlis Ansarullah Use Only`,
        12,
        pageHeight - 7
      );

      const pageStr = `Page ${data.pageNumber} of ${doc.getNumberOfPages()}`;
      doc.text(pageStr, pageWidth - 12, pageHeight - 7, { align: 'right' });
    }
  });
}

/**
 * Downloads single Majlis PDF file
 */
export function exportMajlisPDF(options: ExportMajlisPdfOptions): void {
  const doc = generateMajlisPdfDoc(options);
  const cleanMajlis = options.majlis.replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanRegion = options.region.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Tajneed_${cleanRegion}_${cleanMajlis}_${options.reportType || 'comprehensive'}.pdf`;
  doc.save(filename);
}

/**
 * Batch export all majlises in a region into a single combined multi-page PDF
 */
export function exportBatchRegionPDF(options: BatchExportOptions): void {
  const { region, majlises, membersByMajlis, reportType = 'comprehensive', preparedBy = 'Secretary Tajneed' } = options;

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  let isFirst = true;
  for (const majlis of majlises) {
    const list = membersByMajlis[majlis] || [];
    if (list.length === 0) continue;

    buildMajlisPage(doc, {
      region,
      majlis,
      members: list,
      reportType,
      title: "Majlis Ansarullah Bangladesh",
      preparedBy,
      isFirstPage: isFirst
    });

    isFirst = false;
  }

  const cleanRegion = region.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Tajneed_Region_${cleanRegion}_All_Majlises.pdf`;
  doc.save(filename);
}
