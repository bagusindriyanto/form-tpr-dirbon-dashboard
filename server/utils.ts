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

function formattedTimestamp(timestamp: string): string {
  if (timestamp === '') {
    return '-';
  } else {
    return timestamp;
  }
}
