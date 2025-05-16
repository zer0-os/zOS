import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../reducer';
import { Message } from '.';

export const makeGetMessagesByIds = () => {
  return createSelector(
    [(state: RootState) => state.normalized.messages, (_state: RootState, messageIds: string[]) => messageIds],
    (allMessages, ids) => {
      if (!allMessages || !ids) return [];
      return ids.map((id) => allMessages[id]).filter(Boolean) as Message[];
    }
  );
};
