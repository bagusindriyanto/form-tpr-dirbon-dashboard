function getMachines(): ReturnType<GasFunctions['getMachines']> {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(SHEET_NAME_MACHINE);
  if (!sheet) throw new Error(`Sheet '${SHEET_NAME_MACHINE}' tidak ditemukan`);

  const data: CellValue[][] = sheet
    .getRange(2, 2, sheet.getLastRow() - 1, 1)
    .getValues();

  return data.flat().map((value): Machine => ({ name: toString(value) }));
}
