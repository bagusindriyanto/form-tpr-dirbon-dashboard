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

function toDate(value: CellValue): Date {
  if (!(value instanceof Date)) {
    throw new Error('Nilai sel harus berupa tanggal');
  }

  return value;
}

const DATE_TIME_FORMAT = 'dd/MM/yyyy HH:mm:ss';
const DATE_FORMAT = 'dd/MM/yyyy';

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

function toDateString(value: CellValue): string {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new Error('Nilai tanggal tidak valid');
    }
    return Utilities.formatDate(
      value,
      Session.getScriptTimeZone(),
      DATE_FORMAT,
    );
  }

  if (!value) {
    return '';
  }

  return String(value).trim();
}

function getShiftDate(shift: Shift): Date {
  const now = new Date();
  const date = new Date(now);
  date.setHours(0, 0, 0, 0);

  if (shift === '2') {
    const minute = now.getMinutes();
    const hour = now.getHours();
    const day = now.getDay();
    const currentMinute = hour * 60 + minute;

    const isSunday = day === 0;
    const minuteLimit = isSunday ? 19 * 60 + 30 : 19 * 60;

    if (currentMinute >= minuteLimit) {
      date.setDate(date.getDate() + 1);
    }
  }

  return date;
}

function getISOWeek(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );

  const dayNum = d.getUTCDay() || 7;

  d.setUTCDate(d.getUTCDate() + 4 - dayNum);

  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));

  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function getShiftByTimestamp(timestamp: Date): Shift {
  const minute = timestamp.getMinutes();
  const hour = timestamp.getHours();
  const day = timestamp.getDay();
  const currentMinute = hour * 60 + minute;

  const isSunday = day === 0;
  const lowerLimit = 6 * 60 + 30;
  const upperLimit = isSunday ? 19 * 60 + 30 : 19 * 60;

  return currentMinute >= lowerLimit && currentMinute < upperLimit ? '1' : '2';
}

function toDateSerial(date: Date): number {
  return (
    (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
      Date.UTC(1899, 11, 30)) /
    86400000
  );
}
