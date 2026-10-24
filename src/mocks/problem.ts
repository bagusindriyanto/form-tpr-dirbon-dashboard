import { fakerID_ID as faker } from '@faker-js/faker';
import type { Problem } from '@/types/problem';
import type { PIC } from '../../shared/contracts';

const PICS: PIC[] = ['MT', 'Produksi', 'QC', 'Trainer'];

const PROBLEMS = [
  'Mesin jahit macet',
  'Benang putus',
  'Jarum patah',
  'Hasil jahitan tidak rapi',
  'Ukuran tidak sesuai',
  'Kain cacat',
  'Mesin overdeck bermasalah',
  'Proses pressing lambat',
] as const;

function formatDateTime(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');

  return [
    `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`,
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`,
  ].join(' ');
}

function createLine(): string {
  if (faker.helpers.arrayElement(['TPR', 'Dirbon'] as const) === 'TPR') {
    return `T${String(faker.number.int({ min: 1, max: 20 })).padStart(2, '0')}`;
  }

  return `D${String(faker.number.int({ min: 1, max: 5 })).padStart(2, '0')}`;
}

export const createProblem = (
  rowNumber = faker.number.int({ min: 2, max: 100 }),
  start?: string,
): Problem => {
  const timestamp = faker.date.recent({ days: 7 });
  const startDateTime =
    start ??
    formatDateTime(
      new Date(
        timestamp.getTime() + faker.number.int({ min: 30, max: 360 }) * 60_000,
      ),
    );

  return {
    timestamp: formatDateTime(timestamp),
    line: createLine(),
    problem: faker.helpers.arrayElement(PROBLEMS),
    pic: faker.helpers.arrayElement(PICS),
    start: startDateTime,
    rowNumber,
  };
};
