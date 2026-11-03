import { fakerID_ID as faker } from '@faker-js/faker';
import type { Leader, Operator } from '../../shared/contracts';
import type { StyleGroup } from '@/types/style';
import type { Shift, Target } from '@/types/target';

function formatDate(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');

  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

function formatDateTime(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');

  return `${formatDate(date)} ${pad(date.getHours())}:${pad(
    date.getMinutes(),
  )}:${pad(date.getSeconds())}`;
}

function comparePrc(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true });
}

function createLine(): string {
  if (faker.helpers.arrayElement(['TPR', 'Dirbon'] as const) === 'TPR') {
    return `T${String(faker.number.int({ min: 1, max: 20 })).padStart(2, '0')}`;
  }

  return `D${String(faker.number.int({ min: 1, max: 5 })).padStart(2, '0')}`;
}

export const createTargets = (
  styles: StyleGroup,
  leaders: Leader[],
  operators: Operator[],
  count = 20,
): Target[] => {
  const spoOptions = Object.keys(styles).sort();

  if (!spoOptions.length || !leaders.length || !operators.length) return [];

  return Array.from({ length: count }, (_, index) => {
    const spo = faker.helpers.arrayElement(spoOptions);
    const style = styles[spo];
    const prcOptions = Object.keys(style.parts).sort(comparePrc);
    const prcs = faker.helpers
      .arrayElements(prcOptions, {
        min: 1,
        max: Math.min(3, prcOptions.length),
      })
      .sort(comparePrc);
    const selectedOperators = faker.helpers.arrayElements(operators, {
      min: 1,
      max: Math.min(6, operators.length),
    });
    const createdAt = faker.date.recent({ days: 30 });

    return {
      createdAt: formatDateTime(createdAt),
      date: formatDate(createdAt),
      line: createLine(),
      shift: faker.helpers.arrayElement<Shift>(['1', '2']),
      spo,
      style: style.style,
      prcs,
      parts: prcs.map((prc) => style.parts[prc]),
      manPower: selectedOperators.length,
      workingHour: faker.number.int({ min: 1, max: 11 }),
      leader: faker.helpers.arrayElement(leaders).nip,
      operators: selectedOperators.map((operator) => operator.nip),
      target: faker.number.int({ min: 100, max: 1000 }),
      rowNumber: index + 2,
    };
  });
};
