import uniqBy from 'lodash.uniqby';

export function uniqNormalizedList(objectsAndIds: ({ id: string } | string)[]): any {
  return uniqBy(objectsAndIds, (c) => c.id ?? c);
}
