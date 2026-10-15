import { faker } from '@faker-js/faker';
import type { Machine } from '@/types/machine';

export const createMachine = (): Machine => {
  return {
    name: faker.vehicle.manufacturer(),
  };
};
