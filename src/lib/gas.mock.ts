import { createMachine } from '@/mocks/machine';
import type { GasFunctions } from '../../shared/contracts';

export const gasMock: GasFunctions = {
  getMachines: () => Array.from({ length: 10 }).map(createMachine),
};
