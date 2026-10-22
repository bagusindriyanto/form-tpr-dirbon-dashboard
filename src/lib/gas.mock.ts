import { createLine } from '@/mocks/line';
import { createOperator } from '@/mocks/operator';
import { createLeader } from '@/mocks/leader';
import type { GasFunctions, Leader, Operator } from '../../shared/contracts';

export const gasMock: GasFunctions = {
  getLines: () => [createLine('TPR', 20), createLine('Dirbon', 5)],
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
  addTarget: (formData) => console.log(formData),
};
