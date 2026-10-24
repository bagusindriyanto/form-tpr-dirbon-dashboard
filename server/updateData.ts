function updateProblem({
  rowNumber,
  action,
}: {
  rowNumber: number;
  action: 'Start' | 'Finish';
}) {
  const {
    tprDirbon: { spreadsheetId, sheetNames },
  } = SPREADSHEET_CONFIG;
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  const sheet = spreadsheet.getSheetByName(sheetNames.kanban);
  if (!sheet) throw new Error(`Sheet '${sheetNames.kanban}' tidak ditemukan`);

  const timestamp = new Date();
  if (action === 'Start') {
    sheet.getRange('E' + rowNumber).setValue(timestamp);
  } else if (action === 'Finish') {
    sheet.getRange('F' + rowNumber).setValue(timestamp);
  }
}
