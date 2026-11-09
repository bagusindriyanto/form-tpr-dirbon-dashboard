function addTarget(targetFormData: TargetFormData) {
  withScriptLock(() => {
    const {
      database: { spreadsheetId, sheetNames },
    } = SPREADSHEET_CONFIG;
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = spreadsheet.getSheetByName(sheetNames.target);
    if (!sheet) throw new Error(`Sheet '${sheetNames.target}' tidak ditemukan`);

    const createdAt = new Date();
    const {
      line,
      shift,
      spo,
      style,
      prcs,
      parts,
      workingHour,
      leader,
      operators,
      target,
    } = targetFormData;
    const recordDate = getShiftDate(shift);
    const manPower = operators.length;

    const lastRow = sheet.getLastRow();
    const nextRow = lastRow + 1;

    sheet.appendRow([
      createdAt,
      recordDate,
      line,
      shift,
      spo,
      style,
      prcs.join(', '),
      parts.join(', '),
      manPower,
      workingHour,
      leader,
      operators.join(', '),
      target,
      `=ROW()`,
    ]);

    sheet.getRange(`B${nextRow}`).setNumberFormat('yyyy-MM-dd');
  });
}

function addOutput(outputFormData: OutputFormData) {
  withScriptLock(() => {
    const createdAt = new Date();
    const {
      line,
      shift,
      type,
      spo,
      style,
      prcs,
      parts,
      size,
      hour,
      actual,
      repair,
      reject,
    } = outputFormData;
    const recordDate = getShiftDate(shift);

    // 1. Menambahkan formData ke LKH
    if (line.startsWith('D')) {
      updateLKHDirbon(outputFormData, recordDate);
    } else if (line.startsWith('T')) {
      updateLKHTPR(outputFormData, recordDate);
    }

    // 2. Menambahkan formData ke Trial Form TPR Dirbon
    const {
      database: { spreadsheetId, sheetNames },
    } = SPREADSHEET_CONFIG;
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = spreadsheet.getSheetByName(sheetNames.output);
    if (!sheet) throw new Error(`Sheet '${sheetNames.output}' tidak ditemukan`);
    const lastRow = sheet.getLastRow();
    const nextRow = lastRow + 1;

    sheet.appendRow([
      createdAt,
      recordDate,
      line,
      shift,
      type,
      spo,
      style,
      `=XLOOKUP(G${nextRow},'Database SPO'!$B$2:$B,'Database SPO'!$C$2:$C, XLOOKUP(F${nextRow},'Database SPO'!$A$2:$A,'Database SPO'!$C$2:$C, "NOT FOUND", 0), 0)`,
      prcs.join(', '),
      parts.join(', '),
      size,
      hour,
      actual,
      repair ?? 0,
      reject ?? 0,
    ]);

    sheet.getRange(`B${nextRow}`).setNumberFormat('yyyy-MM-dd');
  });
}

function addProblem(problemFormData: ProblemFormData) {
  withScriptLock(() => {
    const {
      tprDirbon: { spreadsheetId, sheetNames },
    } = SPREADSHEET_CONFIG;
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = spreadsheet.getSheetByName(sheetNames.kanban);
    if (!sheet) throw new Error(`Sheet '${sheetNames.kanban}' tidak ditemukan`);

    const createdAt = new Date();
    const { line, problem, pic } = problemFormData;
    const shift = getShiftByTimestamp(createdAt);
    const recordDate = getShiftDate(shift);
    const week = getISOWeek(createdAt);
    const section = line.startsWith('T')
      ? 'TPR'
      : line.startsWith('D')
        ? 'Dirbon'
        : 'Unknown';

    sheet.appendRow([
      createdAt,
      line,
      problem,
      pic,
      null,
      null,
      recordDate,
      `=ROW()-1`,
      week,
      section,
      null,
      shift,
    ]);
  });
}
