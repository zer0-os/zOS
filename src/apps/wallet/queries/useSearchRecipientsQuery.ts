import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { WalletQueryKeys } from './keys';
import { get } from '../../../lib/api/rest';
import { SearchRecipientsResponse } from '../types';

export const useSearchRecipientsQuery = (query: string) => {
  return useQuery({
    queryKey: WalletQueryKeys.searchRecipients(query),
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<SearchRecipientsResponse['recipients']> => {
      if (!query) return [];

      const response = await get(`/api/wallet/search-recipients?query=${query}`);
      if (!response?.body?.recipients) return [];

      return response.body.recipients;
    },
  });
};
