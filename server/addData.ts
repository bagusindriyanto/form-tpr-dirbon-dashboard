function addOutput(formData: OutputFormData) {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(SHEET_NAME_TARGET);
  if (!sheet) throw new Error(`Sheet '${SHEET_NAME_TARGET}' tidak ditemukan`);

  const { operators } = formData;
  const manPower = operators.length;
  sheet.appendRow([null, manPower, null, null, operators.join(', ')]);
}
