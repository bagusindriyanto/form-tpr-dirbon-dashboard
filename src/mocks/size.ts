import { fakerID_ID as faker } from '@faker-js/faker';
import type { SizeGroup } from '@/types/size';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL', '3XL'] as const;

export const createSizeGroup = (length = 10): SizeGroup => {
  return Array.from({ length }).reduce<SizeGroup>((group, _, i) => {
    const spo = `SPO-${String(i + 1).padStart(4, '0')}`;

    group[spo] = faker.helpers.arrayElements(SIZES, {
      min: 2,
      max: SIZES.length,
    });

    return group;
  }, {});
};
