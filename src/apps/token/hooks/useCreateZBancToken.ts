import { useMutation, useQueryClient } from '@tanstack/react-query';
import { post } from '../../../lib/api/rest';

interface CreateTokenData {
  name: string;
  symbol: string;
  initialBuyAmount: string;
  iconUrl: string;
  description?: string;
}

interface CreateTokenResponse {
  success: boolean;
  data: {
    transactionHash: string;
    tokenAddress: string;
    name: string;
    symbol: string;
  };
}

interface CreateTokenError {
  message: string;
  code?: string;
}

export const useCreateZBancToken = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateTokenResponse, CreateTokenError, CreateTokenData>({
    mutationFn: async (tokenData: CreateTokenData) => {
      const response = await post('/zbanc/create').send(tokenData);

      if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.message || 'Failed to create token') as Error & { code?: string };
        error.code = errorData.error;
        throw error;
      }

      return response.body;
    },
    onSuccess: () => {
      // Invalidate the tokens list to refresh with the new token
      queryClient.invalidateQueries({ queryKey: ['zbanc-tokens'] });
    },
  });
};
