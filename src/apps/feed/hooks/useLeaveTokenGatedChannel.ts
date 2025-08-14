import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { post } from '../../../lib/api/rest';
import { removeChannel } from '../../../store/channels';
import { clearLastActiveConversation } from '../../../lib/last-conversation';
import { openFirstConversation } from '../../../store/channels/saga';
import { activeConversationIdSelector } from '../../../store/chat/selectors';

interface LeaveTokenGatedChannelResponse {
  success: boolean;
  channelId: string;
  zid: string;
  message: string;
}

interface LeaveTokenGatedChannelError {
  message: string;
}

export const useLeaveTokenGatedChannel = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const activeConversationId = useSelector(activeConversationIdSelector);

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
    onSuccess: (_, zid) => {
      // Invalidate relevant queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['token-gated-channels', 'mine'] });
      queryClient.invalidateQueries({ queryKey: ['token-gated-channels', 'all'] });

      // Force Redux state cleanup since Matrix client event flow isn't working properly for token-gated channels
      // This ensures isMemberOfActiveConversation returns false
      console.log('XXX Removing channel from Redux state:', zid);
      dispatch(removeChannel(zid));

      // Handle navigation if this was the active conversation
      console.log('XXXXactiveConversationId', activeConversationId);
      console.log('XXXzid', zid);
      if (activeConversationId === zid) {
        clearLastActiveConversation();
        openFirstConversation();
      }
    },
  });
};
