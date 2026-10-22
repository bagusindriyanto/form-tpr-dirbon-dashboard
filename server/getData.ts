function getMachines(): ReturnType<GasFunctions['getMachines']> {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(SHEET_NAME_MACHINE);
  if (!sheet) throw new Error(`Sheet '${SHEET_NAME_MACHINE}' tidak ditemukan`);

  const data: CellValue[][] = sheet
    .getRange(2, 2, sheet.getLastRow() - 1, 1)
    .getValues();

  return data.flat().map((value): Machine => ({ name: toString(value) }));
}

function getMembers(): ReturnType<GasFunctions['getMembers']> {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(SHEET_NAME_MEMBER);
  if (!sheet) throw new Error(`Sheet '${SHEET_NAME_MEMBER}' tidak ditemukan`);

  const [, ...data]: CellValue[][] = sheet.getDataRange().getValues();

  const leaders: Leader[] = [];
  const operators: Operator[] = [];

  data.forEach((row) => {
    const nip = toString(row[0]);
    const name = toString(row[1]);
    const division = toString(row[2]);
    const section = toString(row[3]);
    const job = toString(row[4]);

    if (!nip) return;

    if (job.toLowerCase().includes('leader')) {
      leaders.push({ nip, name, division, section, job });
    } else {
      operators.push({ nip, name, division, section, job });
    }
  });

  return { leaders, operators };
}
