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
    },
    onSuccess: (_data, { postId, meowAmount }) => {
      queryClient.setQueryData(['posts', { postId }], (data: any) => {
        return updatePostReactions(data, postId, meowAmount);
      });

      // Updates the post in whatever grouped queries it's part of
      queryClient.setQueriesData({ queryKey: ['posts'] }, (data: any) => {
        if (!data?.pages) {
          return data;
        }

        return {
          ...data,
          pages: data.pages.map((page) => page.map((post) => updatePostReactions(post, postId, meowAmount))),
        };
      });
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
