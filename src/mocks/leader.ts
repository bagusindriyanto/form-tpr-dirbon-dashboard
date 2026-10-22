import { fakerID_ID as faker } from '@faker-js/faker';
import type { Leader } from '@/types/leader';

const DIVISIONS = ['IHP', 'QUALITY CONTROL'] as const;

export const createLeader = (): Leader => {
  return {
    name: faker.person.fullName(),
    nip: `MGM ${faker.number.int({ min: 1000, max: 20000 })}`,
    division: faker.helpers.arrayElement(DIVISIONS),
    section: `IHP TPR Dirbon ${faker.number.int({ min: 1, max: 4 })}`,
    job: 'Leader',
  };
};
