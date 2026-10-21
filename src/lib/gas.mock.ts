import { createMachine } from '@/mocks/machine';
import { createOperator } from '@/mocks/operator';
import type { GasFunctions } from '../../shared/contracts';

export const gasMock: GasFunctions = {
  getMachines: () => Array.from({ length: 10 }).map(createMachine),
  getOperators: () => Array.from({ length: 200 }).map(createOperator),
  addOutput: (formData) => console.log(formData),
};
