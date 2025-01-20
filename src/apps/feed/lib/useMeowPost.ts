import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { SagaActionTypes } from '../../../store/posts';
import { ethers } from 'ethers';
import { meowPost as meowPostApi } from '../../../store/posts/utils';

export const useMeowPost = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: async ({ postId, meowAmount }: { postId: string; meowAmount: string }) => {
      const meowAmountWei = ethers.utils.parseEther(meowAmount.toString());
      const res = await meowPostApi(postId, meowAmountWei.toString());

      if (!res.ok) {
        throw new Error('Failed to meow post');
      }
      return { postId, meowAmount };
    },

    onMutate: async ({ postId, meowAmount }) => {
      await queryClient.cancelQueries({ queryKey: ['posts'] });

      const previousPost = queryClient.getQueryData(['posts', { postId }]);
      const previousPosts = queryClient.getQueryData(['posts']);

      queryClient.setQueryData(['posts', { postId }], (data: any) => {
        if (!data) {
          return;
        }

        return updatePostReactions(data, postId, meowAmount);
      });

      queryClient.setQueriesData({ queryKey: ['posts'] }, (data: any) => {
        if (!data?.pages) return data;

        return {
          ...data,
          pages: data.pages.map((page) => page.map((post) => updatePostReactions(post, postId, meowAmount))),
        };
      });

      return { previousPost, previousPosts };
    },

    onError: (_error, _variables, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(['posts', { postId: _variables.postId }], context.previousPost);
      }
      if (context?.previousPosts) {
        queryClient.setQueryData(['posts'], context.previousPosts);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const meowPostFeed = (postId: string, meowAmount: string) => {
    mutate({ postId, meowAmount });
  };

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
