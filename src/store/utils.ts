import uniqBy from 'lodash.uniqby';

export function uniqNormalizedList(objectsAndIds: ({ id: string } | string)[], favorLast = false): any {
  if (favorLast) {
    return uniqFavorLast(objectsAndIds);
  }
  return uniqFavorFirst(objectsAndIds);
}

function uniqFavorFirst(objectsAndIds: ({ id: string } | string)[]): any {
  return uniqBy(objectsAndIds, (c) => c.id ?? c);
}

function uniqFavorLast(objectsAndIds: ({ id: string } | string)[]): any {
  const reversed = [...objectsAndIds].reverse();
  const uniqued = uniqBy(reversed, (c) => c.id ?? c);
  return uniqued.reverse();
}
