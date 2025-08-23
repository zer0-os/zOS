import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { useCallback, useRef } from 'react';
import { SagaActionTypes } from '../../../store/posts';
import { ethers } from 'ethers';
import { meowPost as meowPostApi } from '../../../store/posts/utils';
import { useMeowBalance } from './useMeowBalance';

export const useMeowPost = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { meowBalance } = useMeowBalance();

  // Batching state - single post at a time
  const pendingPostId = useRef<string | null>(null);
  const pendingAmount = useRef<number>(0);
  const timeout = useRef<NodeJS.Timeout | null>(null);

  // Store the original state before any optimistic updates for proper rollback
  const previousPost = useRef<any>(null);
  const previousPosts = useRef<any>(null);

  // updates the UI state before the API call is made
  const updatePostCachesOptimistically = useCallback(
    (postId: string, meowAmount: string, isFirstMeowForPost: boolean) => {
      if (isFirstMeowForPost) {
        previousPost.current = queryClient.getQueryData(['posts', { postId }]);
        previousPosts.current = queryClient.getQueryData(['posts']);
      }

      queryClient.setQueryData(['posts', { postId }], (data: any) => {
        if (!data) return data;
        return updatePostReactions(data, postId, meowAmount);
      });

      queryClient.setQueriesData({ queryKey: ['posts'] }, (data: any) => {
        if (!data?.pages) return data;
        return {
          ...data,
          pages: data.pages.map((page) => page.map((post) => updatePostReactions(post, postId, meowAmount))),
        };
      });
    },
    [queryClient]
  );

  const { mutate } = useMutation({
    mutationFn: async ({ postId, meowAmount }: { postId: string; meowAmount: string }) => {
      // Validate against user's balance - cap at available balance
      const userBalance = Number(ethers.utils.formatEther(meowBalance));
      const requestedAmount = Number(meowAmount);
      const cappedAmount = Math.min(requestedAmount, userBalance);

      const meowAmountWei = ethers.utils.parseEther(cappedAmount.toString());
      const res = await meowPostApi(postId, meowAmountWei.toString());
      if (!res.ok) {
        throw new Error('Failed to meow post');
      }
      return { postId, meowAmount: cappedAmount.toString() };
    },

    onError: (_error, _variables, _context) => {
      if (previousPost.current) {
        queryClient.setQueryData(['posts', { postId: _variables.postId }], previousPost.current);
      }
      if (previousPosts.current) {
        queryClient.setQueryData(['posts'], previousPosts.current);
      }
    },

    onSettled: () => {
      // Clear saved state and refresh data
      previousPost.current = null;
      previousPosts.current = null;

      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['meowBalance'] });
    },
  });

  /**
   * We're first batching the MEOWs (in a 4s interval) and
   * then sending them to the server.
   */
  const meowPostFeed = useCallback(
    (postId: string, meowAmount: string) => {
      const amount = Number(meowAmount);

      // If MEOWing a different post, immediately send pending MEOWs to the server for the previous post
      if (pendingPostId.current && pendingPostId.current !== postId && pendingAmount.current > 0) {
        if (timeout.current) {
          clearTimeout(timeout.current);
          timeout.current = null;
        }

        // Send the previous post's accumulated MEOWs
        mutate({ postId: pendingPostId.current, meowAmount: pendingAmount.current.toString() });

        // Reset state
        pendingAmount.current = 0;
      }

      // Check if this is the first MEOW for this post
      const isFirstMeowForPost = !pendingPostId.current || pendingPostId.current !== postId;

      // Set current post and add to accumulated amount
      pendingPostId.current = postId;
      pendingAmount.current += amount;

      // Immediately update UI optimistically (saves original state if first MEOW)
      updatePostCachesOptimistically(postId, meowAmount, isFirstMeowForPost);

      // Clear existing timer and start a new 4-second timer
      if (timeout.current) {
        clearTimeout(timeout.current);
      }

      timeout.current = setTimeout(() => {
        if (pendingAmount.current > 0 && pendingPostId.current) {
          mutate({ postId: pendingPostId.current, meowAmount: pendingAmount.current.toString() });
        }

        // Reset state
        pendingPostId.current = null;
        pendingAmount.current = 0;
        timeout.current = null;
      }, 4000);
    },
    [mutate, updatePostCachesOptimistically]
  );

  const meowPost = (postId: string, meowAmount: string) => {
    dispatch({ type: SagaActionTypes.MeowPost, payload: { postId, meowAmount } });
  };

  return {
    meowPost,
    meowPostFeed,
  };
};

const updatePostReactions = (post, postId: string, meowAmount: string) => {
  if (post.id !== postId) {
    return post;
  }

  const currentMeowCount = post.reactions?.MEOW || 0;
  const newMeowCount = currentMeowCount + Number(meowAmount);

  return {
    ...post,
    reactions: {
      ...post.reactions,
      MEOW: newMeowCount,
      VOTED: 1,
    },
  };
};
