// Excel (.xlsx) fayldan savollarni o'qish. SheetJS kutubxonasi faqat
// kerak bo'lganda (foydalanuvchi "Yuklash"ni bosganda) CDN'dan yuklanadi.

const XLSX_SRC = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
let xlsxPromise = null;

export function loadXLSXLib() {
  if (window.XLSX) return Promise.resolve(window.XLSX);
  if (xlsxPromise) return xlsxPromise;
  xlsxPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = XLSX_SRC;
    s.onload = () => window.XLSX ? resolve(window.XLSX) : reject(new Error('xlsx-global-missing'));
    s.onerror = () => { xlsxPromise = null; reject(new Error('xlsx-script-load-failed')); };
    document.head.appendChild(s);
  });
  return xlsxPromise;
}

// optionCount: 2 (Rost/Yolg'on), 3 yoki 4. To'g'ri javob — matni (qavs) ichiga
// olingan katakcha, ustunlardan istalganida bo'lishi mumkin.
export async function parseQuestionsWorkbook(file, optionCount) {
  const XLSX = await loadXLSXLib();
  const buf = await file.arrayBuffer();
  let wb;
  try { wb = XLSX.read(buf, { type: 'array' }); }
  catch (e) { throw new Error('parse-error'); }
  const sheetName = wb.SheetNames[0];
  const sheet = sheetName ? wb.Sheets[sheetName] : null;
  if (!sheet) throw new Error('parse-error');

  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  const dataRows = rows.slice(1); // 1-qator — sarlavha, e'tiborsiz qoldiriladi
  const questions = [];
  const rowErrors = [];
  let totalDataRows = 0;

  dataRows.forEach((row, idx) => {
    const rowNum = idx + 2; // Excel'dagi haqiqiy qator raqami
    const isBlank = row.every(c => String(c ?? '').trim() === '');
    if (isBlank) return;
    totalDataRows++;

    const question = String(row[1] ?? '').trim(); // B ustuni
    if (!question) { rowErrors.push({ row: rowNum, message: "savol matni yo'q (B ustuni bo'sh)." }); return; }

    const rawCells = [];
    for (let c = 2; c < 2 + optionCount; c++) rawCells.push(row[c]); // C ustunidan boshlab
    const missing = rawCells.some(c => String(c ?? '').trim() === '');
    if (missing) { rowErrors.push({ row: rowNum, message: `javob variantlari yetarli emas: ${optionCount} ta kerak.` }); return; }

    let correct = -1;
    const options = rawCells.map((c, i) => {
      const s = String(c).trim();
      const m = s.match(/^\((.+)\)$/);
      if (m) { correct = correct === -1 ? i : -2; return m[1].trim(); }
      return s;
    });
    if (correct === -1) { rowErrors.push({ row: rowNum, message: "to'g'ri javob belgilanmagan (qavs ichiga olinmagan)." }); return; }
    if (correct === -2) { rowErrors.push({ row: rowNum, message: "bir nechta javob qavs ichida belgilangan." }); return; }
    if (options.some(o => !o)) { rowErrors.push({ row: rowNum, message: "javob varianti matni bo'sh." }); return; }

    questions.push({ q: question, options, correct, d: 2 });
  });

  return { questions, rowErrors, totalDataRows };
}
