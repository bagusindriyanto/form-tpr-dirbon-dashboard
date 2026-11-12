function getJobInsertRow(
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  job: Job,
  startRow: number,
  helperCol: number,
): number {
  const lastRow = sheet.getLastRow();

  if (lastRow < startRow) return startRow;
  const groupId = [toDateSerial(job.tanggal), job.shift, job.line].join('-');

  const matches = sheet
    .getRange(startRow, helperCol + 1, lastRow - startRow + 1, 1)
    .createTextFinder(groupId)
    .matchEntireCell(true)
    .findAll();

  if (matches.length) {
    return matches[matches.length - 1].getRow() + 1;
  }

  return getNextLKHRow(sheet, startRow);
}

function buildJobRowKey(job: Job, firstOperatorNip: Operator['nip']): string {
  return [
    toDateSerial(job.tanggal),
    job.shift,
    job.line,
    job.type,
    job.spo,
    job.prcs,
    firstOperatorNip,
  ]
    .map((value) => String(value).trim())
    .join('-');
}

function getTarget(
  { line, shift, spo, prcs }: OutputKey,
  recordDate: Date,
): MatchedTarget | null {
  const {
    database: { spreadsheetId, sheetNames },
  } = SPREADSHEET_CONFIG;
  const ss = SpreadsheetApp.openById(spreadsheetId);
  const sheet = ss.getSheetByName(sheetNames.target);

  if (!sheet) {
    throw new Error(`Sheet '${sheetNames.target}' tidak ditemukan`);
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return null;
  }
  const data: CellValue[][] = sheet.getDataRange().getValues();

  const sameDate = (a: CellValue, b: CellValue) =>
    a instanceof Date &&
    b instanceof Date &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const matches = data.filter(
    (row) =>
      toString(row[2]) === line &&
      sameDate(row[1], recordDate) &&
      toString(row[3]) === shift &&
      toString(row[4]) === spo &&
      toString(row[6]) === prcs.join(', '),
  );

  const row = matches[matches.length - 1];
  if (!row) return null;

  const { leaders } = getMembers();
  const leaderNameMap = new Map(
    leaders.map((leader) => [
      leader.nip,
      leader.name.split(' ')[0].toUpperCase(),
    ]),
  );

  const result: MatchedTarget = {
    timestamp: toDate(row[0]),
    tanggal: toDate(row[1]),
    line: toString(row[2]),
    shift: toString(row[3]) as Shift,
    spo: toString(row[4]),
    style: toString(row[5]),
    prcs: toString(row[6])
      .split(',')
      .map((x) => x.trim()),
    parts: toString(row[7])
      .split(',')
      .map((x) => x.trim()),
    mp: toNumber(row[8]),
    jk: toNumber(row[9]),
    leader: leaderNameMap.get(toString(row[10])) || '',
    operators: toString(row[11])
      .split(',')
      .map((x) => x.trim()),
    target: toNumber(row[12]),
  };

  return result;
}

function getNextLKHRow(
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  startRow: number,
): number {
  const lastRow = sheet.getLastRow();

  if (lastRow < startRow) {
    return startRow;
  }

  const matches = sheet
    .getRange(startRow, 1, lastRow - startRow + 1, 1)
    .createTextFinder('.+')
    .useRegularExpression(true)
    .findAll();

  if (!matches.length) {
    return startRow;
  }

  return matches[matches.length - 1].getRow() + 1;
}

function mergeJobSize(
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  jobRows: number[],
  sizeCol: number,
  newSize: string,
  mp: MatchedTarget['mp'],
) {
  const incoming = String(newSize ?? '').trim();
  if (!incoming || !jobRows.length) return;

  const firstRow = jobRows[0];
  const current = String(
    sheet.getRange(firstRow, sizeCol).getValue() ?? '',
  ).trim();
  const sizes = current
    ? current
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  if (sizes.includes(incoming)) return; // sudah ada, tidak perlu menulis

  sizes.push(incoming);
  const merged = sizes.join(', '); // "L, M"

  sheet.getRange(firstRow, sizeCol, mp, 1).setValue(merged);
}

function findJobsRows(
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  jobs: Job[],
  jobIds: string[],
  startRow: number,
  helperCol: number,
): JobBlock[] {
  const rowsMap = new Map<string, number[]>(jobIds.map((id) => [id, []]));
  const lastRow = sheet.getLastRow();

  if (lastRow >= startRow) {
    sheet
      .getRange(startRow, helperCol, lastRow - startRow + 1, 1)
      .getValues()
      .forEach(([value]: CellValue[], i) => {
        const rows = rowsMap.get(String(value).trim());
        if (rows) rows.push(startRow + i);
      });
  }

  return jobs.map((job, i) => ({ job, rows: rowsMap.get(jobIds[i]) ?? [] }));
}

function createJobBlocksDirbon(
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  target: MatchedTarget,
  jobs: Job[],
  { startRow, helperCol }: Pick<LKHConfig, 'startRow' | 'helperCol'>,
): JobBlock[] {
  if (!jobs.length) return [];
  const { operators, leader, mp } = target;

  if (!operators.length) {
    throw new Error(`Operator Line ${jobs[0].line} kosong`);
  }

  const writeRow = getJobInsertRow(sheet, jobs[0], startRow, helperCol);

  const data: CellValue[][] = [];
  const createdJobs: JobBlock[] = [];
  const week = getISOWeek(jobs[0].tanggal);

  let rowOffset = 0;

  for (const job of jobs) {
    const jobRows: number[] = [];

    for (const operator of operators) {
      const currentRow = writeRow + rowOffset;

      data.push([
        job.tanggal,
        week,
        job.shift,
        job.line,
        leader,
        operator,
        `=IFERROR(VLOOKUP(F${currentRow};'Database NIK'!B:C;2;FALSE);"")`,
        job.type,
        mp,
        job.spo,
        `=IFERROR(INDEX('DATABASE SPO (KODE STYLE)'!$C:$C;MATCH(RIGHT($J${currentRow};8);'DATABASE SPO (KODE STYLE)'!$A:$A;0);1);"")`,
        job.style,
        `=IFERROR(VLOOKUP(K${currentRow};'DATABASE SPO (KODE STYLE)'!$C:$F;4;FALSE);"")`,
        `=MID(L${currentRow};FIND("-";L${currentRow})+1;FIND(CHAR(160);SUBSTITUTE(L${currentRow};"-";CHAR(160);2))-1-FIND("-";L${currentRow}))`,
        '',
        job.prcs,
        job.parts,
        job.size,
      ]);

      jobRows.push(currentRow);
      rowOffset++;
    }

    // simpan row milik masing-masing PRC
    createdJobs.push({
      job,
      rows: jobRows,
    });
  }

  const totalRows = data.length;

  sheet.insertRowsBefore(writeRow, totalRows);
  sheet.getRange(writeRow, 1, data.length, 18).setValues(data);
  sheet
    .getRange(writeRow - 1, 32, 1, 24)
    .copyTo(
      sheet.getRange(writeRow, 32, totalRows, 24),
      SpreadsheetApp.CopyPasteType.PASTE_FORMULA,
      false,
    );

  return createdJobs;
}

function createJobBlocksTPR(
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  target: MatchedTarget,
  jobs: Job[],
  { startRow, helperCol }: Pick<LKHConfig, 'startRow' | 'helperCol'>,
): JobBlock[] {
  if (!jobs.length) return [];
  const { operators, leader } = target;

  if (!operators.length) {
    throw new Error(`Operator Line ${jobs[0].line} kosong`);
  }

  const writeRow = getJobInsertRow(sheet, jobs[0], startRow, helperCol);

  const data: CellValue[][] = [];
  const createdJobs: JobBlock[] = [];
  const week = getISOWeek(jobs[0].tanggal);

  let rowOffset = 0;

  for (const job of jobs) {
    const jobRows: number[] = [];

    for (const operator of operators) {
      const currentRow = writeRow + rowOffset;

      data.push([
        job.tanggal,
        week,
        leader,
        operator,
        `=XLOOKUP(D${currentRow};'Database NIK'!B:B;'Database NIK'!C:C;"NOT FOUND")`,
        job.line,
        job.shift,
        job.type,
        job.spo,
        `=IFERROR(INDEX('DATABASE SPO (KODE STYLE)'!$C:$C;MATCH($I${currentRow};'DATABASE SPO (KODE STYLE)'!$A:$A;0);1);"")`,
        job.style,
        `=XLOOKUP(J${currentRow};'DATABASE SPO (KODE STYLE)'!C:C;'DATABASE SPO (KODE STYLE)'!F:F;"NOT FOUND")`,
        `=MID(K${currentRow};FIND("-";K${currentRow})+1;FIND(CHAR(160);SUBSTITUTE(K${currentRow};"-";CHAR(160);2))-1-FIND("-";K${currentRow}))`,
        '',
        job.prcs,
        job.parts,
        job.size,
        '',
      ]);

      jobRows.push(currentRow);
      rowOffset++;
    }

    // simpan row milik masing-masing PRC
    createdJobs.push({
      job,
      rows: jobRows,
    });
  }

  const totalRows = data.length;

  sheet.insertRowsBefore(writeRow, totalRows);
  sheet.getRange(writeRow, 1, data.length, 17).setValues(data);
  sheet
    .getRange(writeRow - 1, 30, 1, 14)
    .copyTo(
      sheet.getRange(writeRow, 30, totalRows, 14),
      SpreadsheetApp.CopyPasteType.PASTE_FORMULA,
      false,
    );

  return createdJobs;
}

function updateLKH(key: Division, formData: OutputFormData, recordDate: Date) {
  const config = LKH_SHEETS[key];
  if (!config) throw new Error(`Konfigurasi LKH '${key}' tidak dikenal`);

  const { line, shift, type, spo, style, prcs, parts, size, hour, actual } =
    formData;

  // Validasi jam di awal, gagal cepat sebelum membuka spreadsheet
  const jam = Number(hour);
  if (!Number.isInteger(jam) || jam < 1 || jam > 10) {
    throw new Error(`Jam '${hour}' tidak valid. Harus 1-10`);
  }
  const outputColumn = config.outputBase + jam;

  const startExecution = Date.now();
  let t = startExecution;
  const lap = (label: string) => {
    const now = Date.now();
    Logger.log(`Waktu ${label}: ${now - t} ms`);
    t = now;
  };

  // Target
  const target = getTarget(formData, recordDate);
  lap('get Target');
  if (!target) {
    throw new Error(
      `Target untuk Line ${line} shift ${shift} tanggal ${toDateString(recordDate)} tidak ditemukan`,
    );
  }

  // Sheet LKH
  const {
    lkh: { spreadsheetId, sheetNames },
  } = SPREADSHEET_CONFIG;
  const sheetName = sheetNames[key];
  const sheet =
    SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
  if (!sheet) throw new Error(`Sheet '${sheetName}' tidak ditemukan`);
  lap('load LKH');

  // Jobs
  const normalizedLine = line.replace(/^([A-Z])0+/, '$1');
  const jobs = prcs.map((prc, i) => ({
    tanggal: recordDate,
    shift,
    line: normalizedLine,
    type,
    spo,
    style,
    prcs: prc,
    parts: parts[i],
    size,
  }));
  const firstOperatorNip = target.operators[0];
  const jobIds = jobs.map((job) => buildJobRowKey(job, firstOperatorNip));
  lap('mapping Job dan Id');

  // Cari job yang sudah ada, sisanya dibuat baru
  const jobResults: JobBlock[] = [];
  const newJobs: Job[] = [];

  const foundJobs = findJobsRows(
    sheet,
    jobs,
    jobIds,
    config.startRow,
    config.helperCol,
  );
  lap('find Job Rows');

  foundJobs.forEach((result) => {
    if (result.rows.length) {
      mergeJobSize(
        sheet,
        result.rows,
        config.sizeCol,
        result.job.size,
        target.mp,
      );
      jobResults.push(result);
    } else {
      newJobs.push(result.job);
    }
  });
  lap('merge size');

  if (newJobs.length) {
    jobResults.push(...config.createBlocks(sheet, target, newJobs, config));
    lap('create Job Block');
  }

  // Tulis output jam
  if (jobResults.length) {
    const actualValue = Number(actual) || 0;
    const firstRows = jobResults.map((result) => result.rows[0]);
    const currentValue =
      Number(sheet.getRange(firstRows[0], outputColumn).getValue()) || 0;
    const ranges = firstRows.map((row) =>
      sheet.getRange(row, outputColumn).getA1Notation(),
    );
    sheet.getRangeList(ranges).setValue(currentValue + actualValue);
  }
  lap('set value');
  Logger.log(`Waktu Total: ${Date.now() - startExecution} ms`);
}
