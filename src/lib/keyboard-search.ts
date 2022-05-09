export enum Key {
  ArrowUp = 'ArrowUp',
  ArrowDown = 'ArrowDown',
  Enter = 'Enter',
}

function handleArrowUp(currentIndex: number, options: any[]): number {
  if (!Array.isArray(options)) {
    return 0;
  }

  let newIndex;
  if (currentIndex === 0) {
    newIndex = options.length - 1;
  } else {
    newIndex = currentIndex - 1;
  }

  return newIndex;
}

function handleArrowDown(currentIndex: number, options: any[]): number {
  if (!Array.isArray(options)) {
    return 0;
  }

  let newIndex;
  if (currentIndex >= options.length - 1) {
    newIndex = 0;
  } else {
    newIndex = currentIndex + 1;
  }

  return newIndex;
}

export function newIndexForKey(key: string, currentIndex: number, options: any[]): number {
  if (!Array.isArray(options)) {
    return 0;
  }

  if (currentIndex === null) {
    return 0;
  }

  let newIndex = currentIndex;
  switch (key) {
    case(Key.ArrowUp):
      newIndex = handleArrowUp(currentIndex, options);
      break;
    case(Key.ArrowDown):
      newIndex = handleArrowDown(currentIndex, options);
      break;
  }

  return newIndex;
}
