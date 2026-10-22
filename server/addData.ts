function addOutput(formData: TargetFormData) {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(SHEET_NAME_TARGET);
  if (!sheet) throw new Error(`Sheet '${SHEET_NAME_TARGET}' tidak ditemukan`);

  const createdAt = new Date();
  const { leader, operators } = formData;
  const manPower = operators.length;
  sheet.appendRow([createdAt, manPower, null, leader, operators.join(', ')]);
}
