import { useMutation } from '@tanstack/react-query';
import { del } from '../../../../../lib/api/rest';
import { Provider } from '../types/providers';
import { queryClient } from '../../../../../lib/web3/rainbowkit/provider';
import { linkedAccountsQueryKeys } from './keys';

export const useUnlinkAccountMutation = () => {
  return useMutation({
    mutationFn: async ({ provider, providerUserId }: { provider: Provider; providerUserId: string }) => {
      const response = await del<any>('/api/oauth/unlink').send({ connector: provider, providerUserId });

      if (!response) {
        throw new Error('Failed to unlink account');
      }

      return response.body;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: linkedAccountsQueryKeys.all });
    },
  });
};
