function getLines(): ReturnType<GasFunctions['getLines']> {
  const tprLines = Array.from(
    { length: 20 },
    (_, i) => `T${String(i + 1).padStart(2, '0')}`,
  );
  const dirbonLines = Array.from(
    { length: 5 },
    (_, i) => `D${String(i + 1).padStart(2, '0')}`,
  );

  return [
    { value: 'TPR', items: tprLines },
    { value: 'Dirbon', items: dirbonLines },
  ];
}

function getMembersFromSheet(): { leaders: Leader[]; operators: Operator[] } {
  const {
    database: { spreadsheetId, sheetNames },
  } = SPREADSHEET_CONFIG;

  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  const sheet = spreadsheet.getSheetByName(sheetNames.member);
  if (!sheet) throw new Error(`Sheet '${sheetNames.member}' tidak ditemukan`);

  const [, ...data]: CellValue[][] = sheet.getDataRange().getValues();

  const leaders: Leader[] = [];
  const operators: Operator[] = [];

  data.forEach((row) => {
    const nip = toString(row[0]);
    const name = toString(row[1]);
    const division = toString(row[2]);
    const section = toString(row[3]);
    const job = toString(row[4]);

    if (!nip) return;

    if (job.toLowerCase().includes('leader')) {
      leaders.push({ nip, name, division, section, job });
    } else {
      operators.push({ nip, name, division, section, job });
    }
  });

  return { leaders, operators };
}

// Dipakai saat menyusun blok LKH. Cache singkat mengurangi waktu baca sheet
// dan memperpendek masa ScriptLock.
function getMembers(): ReturnType<GasFunctions['getMembers']> {
  return getOrSetCache('members', getMembersFromSheet, { ttl: 10 * 60 });
}

function getStylesFromSheet(): StyleGroup {
  const {
    lkh: { spreadsheetId, sheetNames },
  } = SPREADSHEET_CONFIG;

  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  const sheet = spreadsheet.getSheetByName(sheetNames.spoAndPrc);
  if (!sheet)
    throw new Error(`Sheet '${sheetNames.spoAndPrc}' tidak ditemukan`);

  const data: CellValue[][] = sheet
    .getRange(3, 3, sheet.getLastRow() - 2, 4)
    .getValues();

  const index: StyleGroup = Object.create(null);

  data.forEach((row) => {
    const spo = toString(row[0]);
    const style = toString(row[1]);
    const prc = toString(row[2]).toUpperCase();
    const part = toString(row[3]);

    if (!spo) return;

    if (!index[spo]) {
      index[spo] = { style, parts: Object.create(null) };
    }

    const styleParts = index[spo].parts;

    if (prc && /^PRC\d{2}$/.test(prc) && !styleParts[prc]) {
      styleParts[prc] = part;
    }
  });

  return index;
}

function getStyles(): ReturnType<GasFunctions['getStyles']> {
  return getOrSetCache('styles', getStylesFromSheet, { ttl: 6 * 60 * 60 });
}

function getSizesFromSheet(): SizeGroup {
  const {
    database: { spreadsheetId, sheetNames },
  } = SPREADSHEET_CONFIG;

  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  const sheet = spreadsheet.getSheetByName(sheetNames.spoAndSize);
  if (!sheet)
    throw new Error(`Sheet '${sheetNames.spoAndSize}' tidak ditemukan`);

  const [, ...data]: CellValue[][] = sheet.getDataRange().getValues();

  const index: SizeGroup = Object.create(null);
  const seen: Record<string, Set<string>> = Object.create(null);

  data.forEach((row) => {
    const spo = toString(row[0]);
    const size = toString(row[2]);

    if (!spo || !size) return;

    if (!index[spo]) {
      index[spo] = [];
      seen[spo] = new Set<string>();
    }

    if (seen[spo].has(size)) return;

    seen[spo].add(size);
    index[spo].push(size);
  });

  return index;
}

function getSizes(): ReturnType<GasFunctions['getSizes']> {
  return getOrSetCache('sizes', getSizesFromSheet, { ttl: 6 * 60 * 60 });
}

function getProblems(): ReturnType<GasFunctions['getProblems']> {
  const {
    tprDirbon: { spreadsheetId, sheetNames },
  } = SPREADSHEET_CONFIG;
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  const sheet = spreadsheet.getSheetByName(sheetNames.kanban);
  if (!sheet) throw new Error(`Sheet '${sheetNames.kanban}' tidak ditemukan`);

  const [, ...data]: CellValue[][] = sheet.getDataRange().getValues();
  const problems: Problem[] = [];

  data.forEach((row, index) => {
    const timestamp = toDateTimeString(row[0]);
    const line = toString(row[1]);
    const problem = toString(row[2]);
    const pic = toString(row[3]) as PIC;
    const start = toDateTimeString(row[4]);
    const finish = toDateTimeString(row[5]);
    const id = toNumber(row[7]);
    const rowNumber = index + 2;

    if (!finish) {
      problems.push({ id, timestamp, line, problem, pic, start, rowNumber });
    }
  });

  return problems;
}

function getTargets(): ReturnType<GasFunctions['getTargets']> {
  const {
    database: { spreadsheetId, sheetNames },
  } = SPREADSHEET_CONFIG;
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  const sheet = spreadsheet.getSheetByName(sheetNames.target);
  if (!sheet) throw new Error(`Sheet '${sheetNames.target}' tidak ditemukan`);

  const [, ...data]: CellValue[][] = sheet.getDataRange().getValues();
  const targets = data.reduce<Target[]>((result, row) => {
    const line = toString(row[2]);
    const spo = toString(row[4]);
    const target = toNumber(row[12]);

    // Kolom B dan N berisi formula, jadi getDataRange ikut membaca baris
    // kosong di bawah data. Baris tanpa isi tidak perlu ditampilkan di grid.
    if (!line && !spo && !target) return result;

    result.push({
      createdAt: toDateTimeString(row[0]),
      date: toDateString(row[1]),
      line,
      shift: toString(row[3]) as Shift,
      spo,
      style: toString(row[5]),
      prcs: splitCellList(row[6]),
      parts: splitCellList(row[7]),
      manPower: toNumber(row[8]),
      workingHour: toNumber(row[9]),
      leader: toString(row[10]),
      operators: splitCellList(row[11]),
      target,
      rowNumber: toNumber(row[13]),
    });

    return result;
  }, []);

  return targets;
}
