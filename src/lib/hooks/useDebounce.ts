import { useEffect, useState } from 'react';
import { debounce } from 'lodash';

export const useDebounce = (value: string, delay: number) => {
  const [state, setState] = useState(value);

  useEffect(() => {
    const handler = debounce(() => setState(value), delay);
    handler();
    return () => handler.cancel();
  }, [value, delay]);

  return state;
};
