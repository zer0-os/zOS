import { RootState } from '../reducer';
import getDeepProperty from 'lodash.get';

// This is somewhat of a copy of the selector in src/store/authentication/saga.ts
// The difference is there's no reason to return a function that does the thing
// when the function can just do the thing.
export function currentUserSelector(state: RootState) {
  return getDeepProperty(state, 'authentication.user.data', null);
}
