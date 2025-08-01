import { useMutation, useQueryClient } from '@tanstack/react-query';
import { post } from '../../../../../lib/api/rest';

interface JoinTokenGatedChannelResponse {
  success: boolean;
  channelId: string;
  roomId: string;
  zid: string;
  message: string;
}

interface JoinTokenGatedChannelError {
  error: string;
  message: string;
}

export const useJoinTokenGatedChannel = () => {
  const queryClient = useQueryClient();

  return useMutation<JoinTokenGatedChannelResponse, JoinTokenGatedChannelError, string>({
    mutationFn: async (zid: string) => {
      const zna = zid.replace('0://', '');
      const response = await post(`/token-gated-channels/${zna}/join`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to join channel');
      }

      return response.body;
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['token-gated-channels', 'mine'] });
      queryClient.invalidateQueries({ queryKey: ['token-gated-channels', 'all'] });
    },
  });
};
