function getMachines(): ReturnType<GasFunctions['getMachines']> {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(SHEET_NAME_MACHINE);
  if (!sheet) throw new Error(`Sheet '${SHEET_NAME_MACHINE}' tidak ditemukan`);

  const data: CellValue[][] = sheet
    .getRange(2, 2, sheet.getLastRow() - 1, 1)
    .getValues();

  return data.flat().map((value): Machine => ({ name: toString(value) }));
}

function getOperators(): ReturnType<GasFunctions['getOperators']> {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(SHEET_NAME_OPERATOR);
  if (!sheet) throw new Error(`Sheet '${SHEET_NAME_OPERATOR}' tidak ditemukan`);

  const [, ...data]: CellValue[][] = sheet.getDataRange().getValues();

  return data
    .map(
      (row): Operator => ({
        nip: toString(row[0]),
        name: toString(row[1]),
        division: toString(row[2]),
        section: toString(row[3]),
        job: toString(row[4]),
      }),
    )
    .filter((operator) => !!operator.nip);
}
