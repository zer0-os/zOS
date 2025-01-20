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
    onSuccess: (_data, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['posts', { postId }] });
      queryClient.invalidateQueries({ queryKey: ['posts', 'replies', { postId }] });
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
