function addTarget(formData: TargetFormData) {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(SHEET_NAME_TARGET);
  if (!sheet) throw new Error(`Sheet '${SHEET_NAME_TARGET}' tidak ditemukan`);

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
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(SHEET_NAME_OUTPUT);
  if (!sheet) throw new Error(`Sheet '${SHEET_NAME_OUTPUT}' tidak ditemukan`);

  const lastRow = sheet.getLastRow();
  const createdAt = new Date();
  const {
    line,
    shift,
    type,
    spo,
    style,
    prc,
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
    prc,
    size,
    hour,
    actual,
    repair,
    reject,
  ]);
}
