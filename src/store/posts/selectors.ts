import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../store';

export const qoutingPostSelector = createSelector(
  (state: RootState) => state.posts.qoutingPost,
  (qoutingPost) => qoutingPost
);
