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
