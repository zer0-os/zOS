import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { post } from '../../../lib/api/rest';
import { removeChannel } from '../../../store/channels';
import { clearLastActiveConversation } from '../../../lib/last-conversation';
import { openFirstConversation } from '../../../store/channels/saga';

export interface LeaveTokenGatedChannelResponse {
  success: boolean;
}

export interface LeaveTokenGatedChannelError {
  message: string;
}

export const useLeaveTokenGatedChannel = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation<LeaveTokenGatedChannelResponse, LeaveTokenGatedChannelError, string>({
    mutationFn: async (zid: string) => {
      const zna = zid.replace('0://', '');
      const response = await post(`/token-gated-channels/${zna}/leave`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to leave channel');
      }

      return response.body;
    },
    onSuccess: async (_, zid) => {
      queryClient.invalidateQueries({ queryKey: ['token-gated-channels', 'mine'] });
      queryClient.invalidateQueries({ queryKey: ['token-gated-channels', 'all'] });

      // Handle Redux state cleanup - same as original leave flow
      try {
        // Remove channel from Redux state
        dispatch(removeChannel(zid));

        // Check if this was the active conversation and handle navigation
        // This logic matches what happens in currentUserLeftChannel saga
        const activeConversationId = window.location.pathname.includes('/feed/')
          ? window.location.pathname.split('/feed/')[1]
          : null;

        if (activeConversationId === zid) {
          clearLastActiveConversation();
          openFirstConversation();
        }
      } catch (error) {
        console.warn('Failed to handle Redux state cleanup after leave:', error);
      }
    },
  });
};
