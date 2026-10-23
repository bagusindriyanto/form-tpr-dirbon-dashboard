import { fakerID_ID as faker } from '@faker-js/faker';
import type { StyleGroup } from '@/types/style';

const PARTS = [
  'Front Body',
  'Back Body',
  'Sleeve',
  'Collar',
  'Cuff',
  'Pocket',
  'Placket',
  'Hem',
] as const;

export const createStyleGroup = (length = 10): StyleGroup => {
  return Array.from({ length }).reduce<StyleGroup>((group, _, i) => {
    const spo = `SPO-${String(i + 1).padStart(4, '0')}`;

    const parts = faker.helpers
      .arrayElements(PARTS, { min: 2, max: PARTS.length })
      .reduce<Record<string, string>>((acc, part, j) => {
        acc[`PRC${String(j + 1).padStart(2, '0')}`] = part;
        return acc;
      }, {});

    group[spo] = {
      style: `STY-${faker.number.int({ min: 1000, max: 9999 })}`,
      parts,
    };

    return group;
  }, {});
};
