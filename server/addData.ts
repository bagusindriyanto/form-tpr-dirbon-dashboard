function addTarget(formData: TargetFormData) {
  const {
    database: { spreadsheetId, sheetNames },
  } = SPREADSHEET_CONFIG;
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  const sheet = spreadsheet.getSheetByName(sheetNames.target);
  if (!sheet) throw new Error(`Sheet '${sheetNames.target}' tidak ditemukan`);

  const createdAt = new Date();
  const { line, workingHour, leader, operators, target } = formData;
  const manPower = operators.length;

  sheet.appendRow([
    createdAt,
    line,
    manPower,
    workingHour,
    leader,
    operators.join(', '),
    target,
  ]);
}

function addOutput(formData: OutputFormData) {
  const {
    database: { spreadsheetId, sheetNames },
  } = SPREADSHEET_CONFIG;
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  const sheet = spreadsheet.getSheetByName(sheetNames.output);
  if (!sheet) throw new Error(`Sheet '${sheetNames.output}' tidak ditemukan`);

  const lastRow = sheet.getLastRow();
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
  } = formData;

  sheet.appendRow([
    createdAt,
    `=A${lastRow + 1}`,
    line,
    shift,
    type,
    spo,
    style,
    null,
    prc,
    part,
    size,
    hour,
    actual,
    repair ?? 0,
    reject ?? 0,
  ]);
}
