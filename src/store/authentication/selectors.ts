import { RootState } from '../reducer';

export function currentUserSelector(state: RootState) {
  return state.authentication.user?.data;
}

export function isAuthenticatedSelector(state: RootState) {
  return !!currentUserSelector(state);
}

export function userProfileImageSelector(state: RootState) {
  return state.authentication.user?.data?.profileSummary?.profileImage;
}

export function userIdSelector(state: RootState) {
  return state.authentication.user?.data?.id;
}

export function primaryZIDSelector(state: RootState) {
  return state.authentication.user?.data?.primaryZID;
}

export function userWalletsSelector(state: RootState) {
  return state.authentication.user?.data?.wallets;
}

export function userFirstNameSelector(state: RootState) {
  return state.authentication.user?.data?.profileSummary?.firstName;
}

export function userZeroProSubscriptionSelector(state: RootState) {
  return state.authentication.user?.data?.subscriptions?.zeroPro || false;
}
