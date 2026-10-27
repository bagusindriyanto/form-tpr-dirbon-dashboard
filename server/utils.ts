function toNumber(value: CellValue): number {
  if (typeof value !== 'number' && typeof value !== 'string') {
    throw new Error('Nilai sel harus berupa angka');
  }
  const result = Number(value);
  if (!Number.isFinite(result)) {
    throw new Error(`Nilai angka tidak valid: ${value}`);
  }
  return result;
}

function toNullableNumber(value: CellValue): number | '' {
  if (typeof value === 'string' && value.trim() === '') {
    return '';
  }
  if (typeof value !== 'number' && typeof value !== 'string') {
    throw new Error('Nilai sel harus berupa angka');
  }
  const result = Number(value);
  if (!Number.isFinite(result)) {
    throw new Error(`Nilai angka tidak valid: ${value}`);
  }
  return result;
}

function toString(value: CellValue): string {
  const result = String(value);
  return result.trim();
}

const DATE_TIME_FORMAT = 'dd/MM/yyyy HH:mm:ss';

function toDateTimeString(value: CellValue): string {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new Error('Nilai tanggal tidak valid');
    }
    return Utilities.formatDate(
      value,
      Session.getScriptTimeZone(),
      DATE_TIME_FORMAT,
    );
  }

  if (!value) {
    return '';
  }

  return String(value).trim();
}

function toShiftDate(shift: '1' | '2'): Date {
  const now = new Date();
  const date = new Date(now);
  date.setHours(0, 0, 0, 0);

  const hour = now.getHours();
  if (shift === '2' && hour > 0 && hour < 18) {
    date.setDate(date.getDate() - 1);
  }

  return date;
}
