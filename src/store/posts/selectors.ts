import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../store';

export const quotingPostSelector = createSelector(
  (state: RootState) => state.posts.quotingPost,
  (quotingPost) => quotingPost
);
