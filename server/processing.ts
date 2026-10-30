function getShiftDate(shift: '1' | '2'): Date {
  const now = new Date();
  const date = new Date(now);
  date.setHours(0, 0, 0, 0);

  const hour = now.getHours();
  if (shift === '2' && hour < 18) {
    date.setDate(date.getDate() - 1);
  }

  return date;
}

function getISOWeek(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );

  const dayNum = d.getUTCDay() || 7;

  d.setUTCDate(d.getUTCDate() + 4 - dayNum);

  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));

  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
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

  sheet.getRange(firstRow, sizeCol, jobRows.length, 1).setValue(merged);
}

function findJobsRowsDirbon(
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  jobs: Job[],
): { job: Job; rows: number[] }[] {
  if (!jobs.length) return [];
  const START_ROW = 4;
  const lastRow = sheet.getLastRow();

  if (lastRow < START_ROW) {
    return jobs.map((job): { job: Job; rows: number[] } => ({
      job,
      rows: [],
    }));
  }

  const spo = jobs[0].spo;

  const hits = sheet
    .getRange(START_ROW, 10, lastRow - START_ROW + 1, 1)
    .createTextFinder(toString(spo))
    .matchEntireCell(true)
    .findAll();

  if (!hits.length) {
    return jobs.map((job): { job: Job; rows: number[] } => ({
      job,
      rows: [],
    }));
  }

  const rowNums = hits.map((row) => row.getRow());
  const firstMatchRow = rowNums[0];
  const lastMatchRow = rowNums[rowNums.length - 1];

  const data: CellValue[][] = sheet
    .getRange(firstMatchRow, 1, lastMatchRow - firstMatchRow + 1, 18)
    .getValues();

  const result: { job: Job; rows: number[] }[] = [];

  jobs.forEach((job) => {
    const rows: number[] = [];

    for (const rowNum of rowNums) {
      const row = data[rowNum - firstMatchRow];

      const same =
        row[0] instanceof Date &&
        row[0].getTime() === job.tanggal.getTime() &&
        toString(row[2]) === job.shift &&
        toString(row[3]) === job.line &&
        toString(row[7]) === job.type &&
        toString(row[9]) === job.spo &&
        toString(row[11]) === job.style &&
        toString(row[15]) === job.prcs &&
        toString(row[16]) === job.parts; //&& row[17] === job.size

      if (same) {
        rows.push(rowNum);
      }
    }

    result.push({
      job,
      rows,
    });
  });

  return result;
}

function findJobsRowsTPR(
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  jobs: Job[],
): { job: Job; rows: number[] }[] {
  if (!jobs.length) return [];
  const START_ROW = 3;
  const lastRow = sheet.getLastRow();

  if (lastRow < START_ROW) {
    return jobs.map((job): { job: Job; rows: number[] } => ({
      job,
      rows: [],
    }));
  }

  const spo = jobs[0].spo;

  const hits = sheet
    .getRange(START_ROW, 9, lastRow - START_ROW + 1, 1)
    .createTextFinder(toString(spo))
    .matchEntireCell(true)
    .findAll();

  if (!hits.length) {
    return jobs.map((job): { job: Job; rows: number[] } => ({
      job,
      rows: [],
    }));
  }

  const rowNums = hits.map((row) => row.getRow());
  const firstMatchRow = rowNums[0];
  const lastMatchRow = rowNums[rowNums.length - 1];

  const data: CellValue[][] = sheet
    .getRange(firstMatchRow, 1, lastMatchRow - firstMatchRow + 1, 18)
    .getValues();

  const result: { job: Job; rows: number[] }[] = [];

  jobs.forEach((job) => {
    const rows: number[] = [];

    for (const rowNum of rowNums) {
      const row = data[rowNum - firstMatchRow];

      const same =
        row[0] instanceof Date &&
        row[0].getTime() === job.tanggal.getTime() &&
        toString(row[6]) === job.shift &&
        toString(row[5]) === job.line &&
        toString(row[7]) === job.type &&
        toString(row[8]) === job.spo &&
        toString(row[10]) === job.style &&
        toString(row[14]) === job.prcs &&
        toString(row[15]) === job.parts;

      if (same) {
        rows.push(rowNum);
      }
    }

    result.push({
      job,
      rows,
    });
  });

  return result;
}

function createJobBlocksDirbon(
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  target: MatchedTarget,
  jobs: Job[],
): { job: Job; rows: number[] }[] {
  if (!jobs.length) return [];
  const { operators, leader, mp } = target;

  if (!operators.length) {
    throw new Error(`Operator Line ${jobs[0].line} kosong`);
  }

  const START_ROW = 4;
  const writeRow = getNextLKHRow(sheet, START_ROW);

  const data: CellValue[][] = [];
  const createdJobs: { job: Job; rows: number[] }[] = [];

  let rowOffset = 0;

  for (const job of jobs) {
    const jobRows: number[] = [];

    for (const operator of operators) {
      const currentRow = writeRow + rowOffset;

      data.push([
        job.tanggal,
        getISOWeek(job.tanggal),
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

  sheet.getRange(writeRow, 1, data.length, 18).setValues(data);

  return createdJobs;
}

function createJobBlocksTPR(
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  target: MatchedTarget,
  jobs: Job[],
): { job: Job; rows: number[] }[] {
  if (!jobs.length) return [];
  const { operators, leader } = target;

  if (!operators.length) {
    throw new Error(`Operator Line ${jobs[0].line} kosong`);
  }

  const START_ROW = 3;
  const writeRow = getNextLKHRow(sheet, START_ROW);
  const data: CellValue[][] = [];
  const createdJobs: { job: Job; rows: number[] }[] = [];

  let rowOffset = 0;

  for (const job of jobs) {
    const jobRows: number[] = [];

    for (const operator of operators) {
      const currentRow = writeRow + rowOffset;

      data.push([
        job.tanggal,
        getISOWeek(job.tanggal),
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

  sheet.getRange(writeRow, 1, data.length, 18).setValues(data);

  return createdJobs;
}

function updateLKHTPR(formData: OutputFormData, recordDate: Date) {
  const { line, shift, type, spo, style, prcs, parts, size, hour, actual } =
    formData;

  const target = getTarget(formData, recordDate);

  if (!target) {
    throw new Error(
      `Target untuk Line ${line} tanggal ` + `${recordDate} tidak ditemukan`,
    );
  }

  // lkh
  const {
    lkh: { spreadsheetId, sheetNames },
  } = SPREADSHEET_CONFIG;
  const lkhSS = SpreadsheetApp.openById(spreadsheetId);
  const sheetName = sheetNames.tpr;
  const sheet = lkhSS.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error(`Sheet '${sheetName}' tidak ditemukan`);
  }
  // =====================================================
  // VALIDASI JAM
  // =====================================================

  const jam = Number(hour);

  if (!Number.isInteger(jam) || jam < 1 || jam > 10) {
    throw new Error(`Jam '${hour}' tidak valid. Harus 1-10`);
  }

  const outputColumn = 18 + jam;

  // jobs
  const jobs = prcs.map(
    (prc, i): Job => ({
      tanggal: recordDate,
      shift,
      line: line.replace(/^([A-Z])0+/, '$1'),
      type,
      spo,
      style,
      prcs: prc,
      parts: parts[i],
      size,
    }),
  );

  const jobResults: { job: Job; rows: number[] }[] = [];
  const newJobs: Job[] = [];

  const foundJobs = findJobsRowsTPR(sheet, jobs);

  for (const result of foundJobs) {
    if (result.rows.length) {
      mergeJobSize(sheet, result.rows, 17, result.job.size);
      jobResults.push(result);
    } else {
      newJobs.push(result.job);
    }
  }

  if (newJobs.length) {
    const createdJobs = createJobBlocksTPR(sheet, target, newJobs);
    jobResults.push(...createdJobs);
  }

  const actualValue = Number(actual) || 0;

  const ranges = jobResults.map((result) =>
    sheet.getRange(result.rows[0], outputColumn).getA1Notation(),
  );

  if (ranges.length) {
    sheet.getRangeList(ranges).setValue(actualValue);
  }

  // for (let i = 0; i < prcs.length; i++) {

  //   const job = {
  //     tanggal: recordDate,
  //     shift: shift,
  //     line: line.replace(/^([A-Z])0+/, "$1"),
  //     type: type,
  //     spo: spo,
  //     style: style,

  //     // 1 PRC = 1 JOB
  //     prcs: prcs[i],
  //     parts: parts[i],

  //     size: size,
  //   };

  //   // cek job yg sudah ada
  //   let jobRows = findJobRowsTPR(sheet, job);

  //   // job belum ada
  //   if (jobRows.length === 0) {
  //     jobRows = createJobBlockTPR(sheet, target, job);
  //   } else {
  //     mergeJobSize(sheet, jobRows, 17, job.size);
  //   }

  //   // output hanya masuk baris operator pertama
  //   const firstRow = jobRows[0];

  //   sheet
  //     .getRange(firstRow, outputColumn)
  //     .setValue(Number(actual) || 0);
  // }
}

function updateLKHDirbon(formData: OutputFormData, recordDate: Date) {
  // data output
  const { line, shift, type, spo, style, prcs, parts, size, hour, actual } =
    formData;

  // target
  const target = getTarget(formData, recordDate);

  if (!target) {
    throw new Error(
      `Target untuk Line ${line} tanggal ` + `${recordDate} tidak ditemukan`,
    );
  }

  // lkh
  const {
    lkh: { spreadsheetId, sheetNames },
  } = SPREADSHEET_CONFIG;
  const lkhSS = SpreadsheetApp.openById(spreadsheetId);
  const sheetName = sheetNames.dirbon;
  const sheet = lkhSS.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error(`Sheet '${sheetName}' tidak ditemukan`);
  }

  // =====================================================
  // VALIDASI JAM
  // =====================================================

  const jam = Number(hour);

  if (!Number.isInteger(jam) || jam < 1 || jam > 10) {
    throw new Error(`Jam '${hour}' tidak valid. Harus 1-10`);
  }

  const outputColumn = 19 + jam;

  // job
  const jobs = prcs.map(
    (prc, i): Job => ({
      tanggal: recordDate,
      shift,
      line: line.replace(/^([A-Z])0+/, '$1'),
      type,
      spo,
      style,
      prcs: prc,
      parts: parts[i],
      size,
    }),
  );

  const jobResults: { job: Job; rows: number[] }[] = [];
  const newJobs: Job[] = [];

  const foundJobs = findJobsRowsDirbon(sheet, jobs);

  for (const result of foundJobs) {
    if (result.rows.length) {
      mergeJobSize(sheet, result.rows, 18, result.job.size);
      jobResults.push(result);
    } else {
      newJobs.push(result.job);
    }
  }

  if (newJobs.length) {
    const createdJobs = createJobBlocksDirbon(sheet, target, newJobs);
    jobResults.push(...createdJobs);
  }

  const actualValue = Number(actual) || 0;

  const ranges = jobResults.map((result) =>
    sheet.getRange(result.rows[0], outputColumn).getA1Notation(),
  );

  if (ranges.length) {
    sheet.getRangeList(ranges).setValue(actualValue);
  }
}
