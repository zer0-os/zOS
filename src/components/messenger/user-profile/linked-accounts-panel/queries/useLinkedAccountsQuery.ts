import { useQuery } from '@tanstack/react-query';
import { get } from '../../../../../lib/api/rest';
import { Provider } from '../types/providers';
import { linkedAccountsQueryKeys } from './keys';
import { LinkedAccountType } from '../types/linked-accounts';

export const useLinkedAccountsQuery = () => {
  return useQuery({
    queryKey: linkedAccountsQueryKeys.all,
    queryFn: async (): Promise<LinkedAccountType[]> => {
      const response = await get<LinkedAccountType[]>('/api/oauth/linked-accounts').send();
      if (!response) {
        throw new Error('Failed to fetch linked accounts');
      }

      const accounts = response.body || [];
      return accounts
        .filter((account) => Object.values(Provider).includes(account.providerName))
        .map((account) => ({
          provider: account.providerName,
          providerUserId: account.providerId,
          handle: account.handle,
        }));
    },
  });
};
