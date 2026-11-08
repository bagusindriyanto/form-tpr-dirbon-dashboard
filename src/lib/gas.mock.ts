import { createOperator } from '@/mocks/operator';
import { createLeader } from '@/mocks/leader';
import { createStyleGroup } from '@/mocks/style';
import { createSizeGroup } from '@/mocks/size';
import { createProblem } from '@/mocks/problem';
import type { GasFunctions, Leader, Operator } from '../../shared/contracts';

export const gasMock: GasFunctions = {
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
  getStyles: () => createStyleGroup(7000),
  getSizes: () => createSizeGroup(7000),
  getProblems: () =>
    Array.from({ length: 20 }, (_, i) =>
      createProblem(i + 1, i + 2, i % 5 === 0 ? '' : undefined),
    ),
  addTarget: (formData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(formData);
        resolve(true);
      }, 2000);
    });
  },
  addOutput: (formData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(formData);
        resolve(true);
      }, 2000);
    });
  },
  addProblem: (formData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(formData);
        resolve(true);
      }, 2000);
    });
  },
  updateProblem: ({ rowNumber, action }) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log({ rowNumber, action });
        resolve(true);
      }, 2000);
    });
  },
};
