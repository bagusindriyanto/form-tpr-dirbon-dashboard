import type { StyleGroup } from '@/types/style';
import type { Shift, Target, TargetCellChange } from '@/types/target';

export const targetChangeKey = (change: TargetCellChange) =>
  `${change.rowNumber}:${change.field}`;

export const toTargetList = (value: TargetCellChange['value']): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  return String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

/**
 * Terapkan perubahan ke data yang sedang ditampilkan. Dipakai untuk pratinjau
 * sebelum disimpan, jadi kolom turunan (style, parts, manPower) ikut dihitung.
 */
export const applyTargetChanges = (
  targets: Target[],
  changes: TargetCellChange[],
  styleGroup: StyleGroup | undefined,
): Target[] => {
  if (!changes.length) return targets;

  const changesByRow = new Map<number, TargetCellChange[]>();
  for (const change of changes) {
    const rowChanges = changesByRow.get(change.rowNumber) ?? [];
    rowChanges.push(change);
    changesByRow.set(change.rowNumber, rowChanges);
  }

  return targets.map((target) => {
    const rowChanges = changesByRow.get(target.rowNumber);
    if (!rowChanges) return target;

    const next: Target = {
      ...target,
      prcs: [...target.prcs],
      parts: [...target.parts],
      operators: [...target.operators],
    };

    for (const change of rowChanges) {
      switch (change.field) {
        case 'line':
          next.line = String(change.value ?? '').trim();
          break;
        case 'shift':
          next.shift = String(change.value) as Shift;
          break;
        case 'spo':
          next.spo = String(change.value ?? '').trim();
          break;
        case 'prcs':
          next.prcs = toTargetList(change.value);
          break;
        case 'workingHour':
          next.workingHour = Number(change.value);
          break;
        case 'leader':
          next.leader = String(change.value ?? '').trim();
          break;
        case 'operators':
          next.operators = toTargetList(change.value);
          break;
        case 'target':
          next.target = Number(change.value);
          break;
      }
    }

    const touchedStyle = rowChanges.some(
      (change) => change.field === 'spo' || change.field === 'prcs',
    );

    if (touchedStyle) {
      const style = styleGroup?.[next.spo];

      if (style) {
        next.prcs = next.prcs.filter((prc) => style.parts[prc]);
        next.style = style.style;
        next.parts = next.prcs.map((prc) => style.parts[prc]);
      }
    }

    if (rowChanges.some((change) => change.field === 'operators')) {
      next.manPower = next.operators.length;
    }

    return next;
  });
};

/**
 * Gabungkan perubahan baru dengan yang sudah menunggu. Satu sel hanya punya
 * satu nilai terakhir, sehingga payload simpan tidak mengirim duplikat.
 */
export const mergeTargetChanges = (
  current: TargetCellChange[],
  next: TargetCellChange[],
): TargetCellChange[] => {
  const merged = new Map(
    current.map((change) => [targetChangeKey(change), change] as const),
  );

  for (const change of next) {
    merged.set(targetChangeKey(change), change);
  }

  return [...merged.values()];
};
