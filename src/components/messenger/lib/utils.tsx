import { Item, Option } from './types';

export const itemToOption = (item: Item): Option => {
  return {
    value: item.id,
    label: item.name,
    image: item.image,
  };
};
