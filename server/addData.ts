function addTarget(targetFormData: TargetFormData) {
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
    prc,
    part,
    workingHour,
    leader,
    operators,
    target,
  } = targetFormData;
  const manPower = operators.length;
  const recordDate = toShiftDate(shift);

  const lastRow = sheet.getLastRow();
  const nextRow = lastRow + 1;

  sheet.appendRow([
    createdAt,
    `=IF(
      (HOUR(A${nextRow})>=0)*
      (HOUR(A${nextRow})<18)*
      (D${nextRow}=2),
      INT(A${nextRow})-1,
      INT(A${nextRow})
    )`,
    line,
    shift,
    spo,
    style,
    prc,
    part,
    manPower,
    workingHour,
    leader,
    operators.join(', '),
    target,
  ]);

  sheet.getRange(`B${nextRow}`).setNumberFormat('yyyy-MM-dd');
}

function addOutput(outputFormData: OutputFormData) {
  const {
    database: { spreadsheetId, sheetNames },
  } = SPREADSHEET_CONFIG;
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  const sheet = spreadsheet.getSheetByName(sheetNames.output);
  if (!sheet) throw new Error(`Sheet '${sheetNames.output}' tidak ditemukan`);

  const createdAt = new Date();
  const {
    line,
    shift,
    type,
    spo,
    style,
    prc,
    part,
    size,
    hour,
    actual,
    repair,
    reject,
  } = outputFormData;
  const recordDate = toShiftDate(shift);

  const lastRow = sheet.getLastRow();
  const nextRow = lastRow + 1;

  sheet.appendRow([
    createdAt,
    `=IF(
      (HOUR(A${nextRow})>=0)*
      (HOUR(A${nextRow})<18)*
      (D${nextRow}=2),
      INT(A${nextRow})-1,
      INT(A${nextRow})
    )`,
    line,
    shift,
    type,
    spo,
    style,
    `=XLOOKUP(G${nextRow},'Database SPO'!$B$2:$B,'Database SPO'!$C$2:$C, XLOOKUP(F${nextRow},'Database SPO'!$A$2:$A,'Database SPO'!$C$2:$C, "NOT FOUND", 0), 0)`,
    prc,
    part,
    size,
    hour,
    actual,
    repair ?? 0,
    reject ?? 0,
  ]);

  sheet.getRange(`B${nextRow}`).setNumberFormat('yyyy-MM-dd');
}

function addProblem(problemFormData: ProblemFormData) {
  const {
    tprDirbon: { spreadsheetId, sheetNames },
  } = SPREADSHEET_CONFIG;
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  const sheet = spreadsheet.getSheetByName(sheetNames.kanban);
  if (!sheet) throw new Error(`Sheet '${sheetNames.kanban}' tidak ditemukan`);

  const createdAt = new Date();
  const { line, problem, pic } = problemFormData;

  const lastRow = sheet.getLastRow();
  const nextRow = lastRow + 1;

  sheet.appendRow([
    createdAt,
    line,
    problem,
    pic,
    null,
    null,
    `=TEXT(DATEVALUE(A${nextRow}), "yyyy-mm-dd")`,
    `=ROW()-1`,
    `=ISOWEEKNUM(G${nextRow})`,
    `=IFS(LEFT(B${nextRow},1)="D", "Dirbon", LEFT(B${nextRow},1)="T", "TPR")`,
  ]);
}
