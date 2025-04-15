import { RootState } from '../reducer';
import getDeepProperty from 'lodash.get';

// This is somewhat of a copy of the selector in src/store/authentication/saga.ts
// The difference is there's no reason to return a function that does the thing
// when the function can just do the thing.
export function currentUserSelector(state: RootState) {
  return getDeepProperty(state, 'authentication.user.data', null);
}

export function isAuthenticatedSelector(state: RootState) {
  return !!currentUserSelector(state);
}

export function userProfileImageSelector(state: RootState) {
  return getDeepProperty(state, 'authentication.user.data.profileSummary.profileImage', null);
}

export function userIdSelector(state: RootState) {
  return getDeepProperty(state, 'authentication.user.data.id', null);
}

export function primaryZIDSelector(state: RootState) {
  return getDeepProperty(state, 'authentication.user.data.primaryZID', null);
}

export function userWalletsSelector(state: RootState) {
  return getDeepProperty(state, 'authentication.user.data.wallets', null);
}

export function userFirstNameSelector(state: RootState) {
  return getDeepProperty(state, 'authentication.user.data.profileSummary.firstName', null);
}
