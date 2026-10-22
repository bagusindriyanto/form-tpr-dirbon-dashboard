function getLines(): ReturnType<GasFunctions['getLines']> {
  const tprLines = Array.from(
    { length: 20 },
    (_, i) => `T${String(i + 1).padStart(2, '0')}`,
  );
  const dirbonLines = Array.from(
    { length: 5 },
    (_, i) => `D${String(i + 1).padStart(2, '0')}`,
  );

  return [
    { value: 'TPR', items: tprLines },
    { value: 'Dirbon', items: dirbonLines },
  ];
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
