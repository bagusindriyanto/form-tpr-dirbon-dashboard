const TARGET_FIRST_COLUMN = 3;
const TARGET_COLUMN_COUNT = 11;

type TargetSheetRow = {
  line: string;
  shift: Shift;
  spo: string;
  style: string;
  prcs: string[];
  parts: string[];
  manPower: number;
  workingHour: number;
  leader: string;
  operators: string[];
  target: number;
};

function targetCellList_(value: TargetCellChange['value']): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  return String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function targetCellInteger_(
  value: TargetCellChange['value'],
  label: string,
): number {
  if (Array.isArray(value)) {
    throw new Error(`${label} harus berupa angka`);
  }

  const raw =
    typeof value === 'number'
      ? value
      : String(value ?? '')
          .replace(/,/g, '')
          .trim();
  if (raw === '') throw new Error(`${label} wajib diisi`);

  const parsed = Number(raw);
  if (!Number.isInteger(parsed)) {
    throw new Error(`${label} tidak valid: ${raw}`);
  }

  return parsed;
}

function readTargetSheetRow(row: CellValue[]): TargetSheetRow {
  return {
    line: toString(row[0]),
    shift: toString(row[1]) as Shift,
    spo: toString(row[2]),
    style: toString(row[3]),
    prcs: splitCellList(row[4]),
    parts: splitCellList(row[5]),
    manPower: toNumber(row[6]),
    workingHour: toNumber(row[7]),
    leader: toString(row[8]),
    operators: splitCellList(row[9]),
    target: toNumber(row[10]),
  };
}

function applyTargetCellChange_(
  row: TargetSheetRow,
  change: TargetCellChange,
): void {
  switch (change.field) {
    case 'line': {
      const line = String(change.value ?? '').trim();
      if (!line) throw new Error('Line tidak boleh kosong');
      row.line = line;
      return;
    }
    case 'shift': {
      const shift = String(change.value ?? '').trim();
      if (shift !== '1' && shift !== '2') {
        throw new Error(`Shift tidak valid: ${shift}`);
      }
      row.shift = shift;
      return;
    }
    case 'spo': {
      const spo = String(change.value ?? '').trim();
      if (!spo) throw new Error('SPO tidak boleh kosong');
      row.spo = spo;
      return;
    }
    case 'prcs': {
      row.prcs = targetCellList_(change.value);
      return;
    }
    case 'workingHour': {
      const value = targetCellInteger_(change.value, 'Jam kerja');
      if (value < 1 || value > 11) {
        throw new Error('Jam kerja harus antara 1 dan 11');
      }
      row.workingHour = value;
      return;
    }
    case 'leader': {
      const leader = String(change.value ?? '').trim();
      if (!leader) throw new Error('Leader tidak boleh kosong');
      row.leader = leader;
      return;
    }
    case 'operators': {
      row.operators = targetCellList_(change.value);
      return;
    }
    case 'target': {
      const value = targetCellInteger_(change.value, 'Target');
      if (value < 1) throw new Error('Target minimal 1');
      row.target = value;
      return;
    }
    default:
      throw new Error(`Field target tidak dikenal: ${change.field}`);
  }
}

function updateTarget({ changes }: UpdateTargetData): { updated: number } {
  if (!changes.length) return { updated: 0 };

  const updated = withScriptLock(() => {
    const {
      database: { spreadsheetId, sheetNames },
    } = SPREADSHEET_CONFIG;
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = spreadsheet.getSheetByName(sheetNames.target);
    if (!sheet) throw new Error(`Sheet '${sheetNames.target}' tidak ditemukan`);

    const lastRow = sheet.getLastRow();
    const styleGroup = getStyles();
    const byRow = new Map<number, TargetCellChange[]>();

    for (const change of changes) {
      const rowChanges = byRow.get(change.rowNumber) ?? [];
      rowChanges.push(change);
      byRow.set(change.rowNumber, rowChanges);
    }

    // Validasi dan hitung seluruh baris dulu, baru tulis. Jadi satu request
    // batch tidak meninggalkan baris setengah jadi kalau ada nilai invalid.
    const writes: Array<{
      rowNumber: number;
      values: Array<Array<string | number>>;
    }> = [];

    for (const [rowNumber, rowChanges] of byRow) {
      if (
        !Number.isInteger(rowNumber) ||
        rowNumber < 2 ||
        rowNumber > lastRow
      ) {
        throw new Error(`Row number tidak valid: ${rowNumber}`);
      }

      const values = sheet
        .getRange(rowNumber, TARGET_FIRST_COLUMN, 1, TARGET_COLUMN_COUNT)
        .getValues()[0];
      const row = readTargetSheetRow(values);

      for (const change of rowChanges) {
        applyTargetCellChange_(row, change);
      }

      if (!row.line) throw new Error(`Line baris ${rowNumber} kosong`);
      if (row.shift !== '1' && row.shift !== '2') {
        throw new Error(`Shift baris ${rowNumber} tidak valid`);
      }
      if (!row.spo) throw new Error(`SPO baris ${rowNumber} kosong`);
      if (!row.prcs.length) {
        throw new Error(`Baris ${rowNumber} harus punya minimal satu PRC`);
      }
      if (!row.leader) throw new Error(`Leader baris ${rowNumber} kosong`);
      if (
        !Number.isInteger(row.workingHour) ||
        row.workingHour < 1 ||
        row.workingHour > 11
      ) {
        throw new Error(`Jam kerja baris ${rowNumber} tidak valid`);
      }
      if (!Number.isInteger(row.target) || row.target < 1) {
        throw new Error(`Target baris ${rowNumber} tidak valid`);
      }

      // Kolom turunan selalu dihitung ulang supaya F/H/I tetap konsisten
      // walaupun data lama diedit dari kolom lain.
      const style = styleGroup[row.spo];
      if (!style) throw new Error(`SPO '${row.spo}' tidak ditemukan`);

      const missing = row.prcs.filter((prc) => !style.parts[prc]);
      if (missing.length) {
        throw new Error(
          `PRC ${missing.join(', ')} tidak tersedia untuk SPO ${row.spo}`,
        );
      }

      row.style = style.style;
      row.parts = row.prcs.map((prc) => style.parts[prc]);
      row.manPower = row.operators.length;

      writes.push({
        rowNumber,
        values: [
          [
            row.line,
            row.shift,
            row.spo,
            row.style,
            row.prcs.join(', '),
            row.parts.join(', '),
            row.manPower,
            row.workingHour,
            row.leader,
            row.operators.join(', '),
            row.target,
          ],
        ],
      });
    }

    for (const write of writes) {
      sheet
        .getRange(write.rowNumber, TARGET_FIRST_COLUMN, 1, TARGET_COLUMN_COUNT)
        .setValues(write.values);
    }

    return byRow.size;
  });

  return { updated };
}

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
