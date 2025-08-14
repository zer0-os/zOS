import { useMutation, useQueryClient } from '@tanstack/react-query';
import { post } from '../../../lib/api/rest';

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
    onMutate: () => {
      // Clear any previous errors when starting a new leave attempt
      // This ensures the user doesn't see stale error messages
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['token-gated-channels', 'mine'] });
      queryClient.invalidateQueries({ queryKey: ['token-gated-channels', 'all'] });

      // Note: Redux state cleanup should be handled automatically by the Matrix client event flow:
      // 1. Backend kick triggers Matrix membership change event
      // 2. publishMembershipChange calls this.events.onUserLeft(roomId, userId)
      // 3. Saga receives UserLeftChannel event and calls currentUserLeftChannel
      // 4. currentUserLeftChannel handles removeChannel and navigation cleanup
    },
  });
};
