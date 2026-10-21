import { fakerID_ID as faker } from '@faker-js/faker';
import type { Operator } from '@/types/operator';

const DIVISIONS = ['IHP', 'QUALITY CONTROL'] as const;

const JOBS = [
  'Support',
  'Leader',
  'Trainer',
  'Helper',
  'QC',
  'TPR',
  'Dirbon',
] as const;

export const createOperator = (): Operator => {
  return {
    name: faker.person.fullName(),
    nip: `MGM ${faker.number.int({ min: 1000, max: 20000 })}`,
    division: faker.helpers.arrayElement(DIVISIONS),
    section: `IHP TPR Dirbon ${faker.number.int({ min: 1, max: 4 })}`,
    job: faker.helpers.arrayElement(JOBS),
  };
};
