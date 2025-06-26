import { RootState } from '../reducer';
import { PostQueueState } from './index';

export const postQueueSelector = (state: RootState): PostQueueState => state.postQueue;

export const queuedPostByIdSelector = (optimisticId?: string) => (state: RootState) => {
  const allQueuedPosts = postQueueSelector(state);
  if (!optimisticId) {
    return undefined;
  }
  return allQueuedPosts.find((post) => post.id === optimisticId);
};

export const queuedPostsByFeedSelector = (feedZid?: string) => (state: RootState) => {
  const allQueuedPosts = postQueueSelector(state);
  if (!feedZid) {
    return allQueuedPosts;
  }
  return allQueuedPosts.filter((post) => post.feedZid === feedZid);
};

export const queuedCommentsByPostSelector = (postId?: string) => (state: RootState) => {
  const allQueuedPosts = postQueueSelector(state);
  if (!postId) {
    return [];
  }
  return allQueuedPosts.filter((post) => post.replyToId === postId);
};

export const postStatusSelector = (optimisticId?: string) => (state: RootState) => {
  if (!optimisticId) return undefined;
  const allQueuedPosts = postQueueSelector(state);
  return allQueuedPosts.find((post) => post.id === optimisticId)?.status;
};

export const isOptimisticPostSelector =
  (optimisticId?: string) =>
  (state: RootState): boolean => {
    if (!optimisticId) return false;
    const allQueuedPosts = postQueueSelector(state);
    return allQueuedPosts.find((post) => post.id === optimisticId) !== undefined;
  };
