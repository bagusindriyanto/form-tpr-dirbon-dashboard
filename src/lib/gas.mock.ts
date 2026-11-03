import { createLine } from '@/mocks/line';
import { createOperator } from '@/mocks/operator';
import { createLeader } from '@/mocks/leader';
import { createStyleGroup } from '@/mocks/style';
import { createSizeGroup } from '@/mocks/size';
import { createProblem } from '@/mocks/problem';
import { createTargets } from '@/mocks/target';
import type {
  GasFunctions,
  Leader,
  Operator,
  Target,
  TargetCellChange,
  UpdateTargetData,
} from '../../shared/contracts';

const createMockMembers = () => {
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
};

const mockMembers = createMockMembers();
const mockStyles = createStyleGroup(7000);
const mockTargets = createTargets(
  mockStyles,
  mockMembers.leaders,
  mockMembers.operators,
  24,
);

const cloneTarget = (target: Target): Target => ({
  ...target,
  prcs: [...target.prcs],
  parts: [...target.parts],
  operators: [...target.operators],
});

const toMockList = (value: TargetCellChange['value']): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  return String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const applyMockChanges = (changes: TargetCellChange[]) => {
  for (const change of changes) {
    const target = mockTargets.find(
      (candidate) => candidate.rowNumber === change.rowNumber,
    );
    if (!target) continue;

    switch (change.field) {
      case 'line':
        target.line = String(change.value ?? '').trim();
        break;
      case 'shift':
        target.shift = String(change.value) === '2' ? '2' : '1';
        break;
      case 'spo':
        target.spo = String(change.value ?? '').trim();
        break;
      case 'prcs':
        target.prcs = toMockList(change.value);
        break;
      case 'workingHour':
        target.workingHour = Number(change.value);
        break;
      case 'leader':
        target.leader = String(change.value ?? '').trim();
        break;
      case 'operators':
        target.operators = toMockList(change.value);
        break;
      case 'target':
        target.target = Number(change.value);
        break;
    }

    if (change.field === 'spo' || change.field === 'prcs') {
      const style = mockStyles[target.spo];

      if (style) {
        target.prcs = target.prcs.filter((prc) => style.parts[prc]);
        target.style = style.style;
        target.parts = target.prcs.map((prc) => style.parts[prc]);
      }
    }

    if (change.field === 'operators') {
      target.manPower = target.operators.length;
    }
  }

  return new Set(changes.map((change) => change.rowNumber)).size;
};

export const gasMock: GasFunctions = {
  getLines: () => [createLine('TPR', 20), createLine('Dirbon', 5)],
  getMembers: () => mockMembers,
  getStyles: () => mockStyles,
  getSizes: () => createSizeGroup(7000),
  getProblems: () =>
    Array.from({ length: 20 }, (_, i) =>
      createProblem(i + 1, i + 2, i % 5 === 0 ? '' : undefined),
    ),
  getTargets: () => mockTargets.map(cloneTarget),
  addTarget: (formData) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log(formData);
        resolve();
      }, 2000);
    });
  },
  updateTarget: (data: UpdateTargetData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ updated: applyMockChanges(data.changes) });
      }, 400);
    });
  },
  addOutput: (formData) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log(formData);
        resolve();
      }, 2000);
    });
  },
  addProblem: (formData) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log(formData);
        resolve();
      }, 2000);
    });
  },
  updateProblem: ({ rowNumber, action }) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log({ rowNumber, action });
        resolve();
      }, 2000);
    });
  },
};
