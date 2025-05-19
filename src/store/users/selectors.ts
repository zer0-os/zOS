import { RootState } from '../reducer';
import {
  extractUserIdFromMatrixId,
  isMatrixId,
  isAdminMatrixId,
  isTelegramMatrixId,
} from '../../lib/chat/matrix/utils';
import { User } from '../channels';
import { createSelector } from '@reduxjs/toolkit';

export function userByMatrixIdSelector(state: RootState, matrixId: string): User | undefined {
  const userId = extractUserIdFromMatrixId(matrixId);
  return state.normalized['users']?.[userId];
}

export function usersByMatrixIdsSelector(state: RootState, matrixIds: string[]): Map<string, User> {
  const userMap = new Map<string, User>();
  const uniqueMatrixIds = [...new Set(matrixIds)];
  uniqueMatrixIds.forEach((matrixId) => {
    if (!isMatrixId(matrixId) && !isAdminMatrixId(matrixId) && !isTelegramMatrixId(matrixId))
      console.error('Invalid matrix id', matrixId);
    const user = userByMatrixIdSelector(state, matrixId);
    // Check if the user is a complete object. If not, it means the user is not loaded yet and we just have a simplified user
    // See `store/users/utils.ts` for more details on simplified users
    if (user && 'firstName' in user) {
      userMap.set(matrixId, user);
    }
  });
  return userMap;
}

export function userSelector(state, userIds: string[]) {
  return userIds.map((id) => (state.normalized.users || {})[id]);
}

export const usersMapSelector = (state: RootState): { [id: string]: User } => state.normalized['users'] || {};

export const makeGetUsersByIds = () => {
  return createSelector(
    [(state: RootState) => state.normalized.users, (_state: RootState, userIds: string[]) => userIds],
    (allUsers, ids) => {
      if (!allUsers || !ids) return [];
      return ids.map((id) => allUsers[id]).filter(Boolean) as User[];
    }
  );
};
