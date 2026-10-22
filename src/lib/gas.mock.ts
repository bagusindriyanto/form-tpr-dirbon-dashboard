import { createMachine } from '@/mocks/machine';
import { createOperator } from '@/mocks/operator';
import { createLeader } from '@/mocks/leader';
import type { GasFunctions, Leader, Operator } from '../../shared/contracts';

export const gasMock: GasFunctions = {
  getMachines: () => Array.from({ length: 10 }).map(createMachine),
  getMembers: () => {
    const leaders: Leader[] = [];
    const operators: Operator[] = [];

    Array.from({ length: 200 }).forEach((_, i) => {
      if (i % 40 === 0) {
        leaders.push(createLeader());
      } else {
        operators.push(createOperator());
      }
    });

    return { leaders, operators };
  },
  addOutput: (formData) => console.log(formData),
};
