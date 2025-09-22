import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { post, get } from '../../../lib/api/rest';
import { config } from '../../../config';

interface TradingParams {
  tokenAddress: string;
  amount: string;
  chainId?: number;
}

interface MintRedeemParams {
  tokenAddress: string;
  shares: string;
  chainId?: number;
}

interface PriceQuoteParams {
  tokenAddress: string;
  amount: string;
  direction: 'buy' | 'sell';
  chainId?: number;
}

interface BalanceParams {
  tokenAddress: string;
  userAddress: string;
  chainId?: number;
}

interface TradingResponse {
  success: boolean;
  data: {
    transactionHash: string;
    amount: string;
    tokenAddress: string;
  };
}

interface PriceQuoteResponse {
  success: boolean;
  data: {
    tokenAddress: string;
    inputAmount: string;
    outputAmount: string;
    direction: 'buy' | 'sell';
    timestamp: number;
  };
}

interface BalanceResponse {
  success: boolean;
  data: {
    tokenBalance: string;
    assetBalance: string;
    maxWithdraw: string;
  };
}

interface DepositAmountResponse {
  success: boolean;
  data: {
    mintAmount: string;
    tokenSymbol: string;
  };
}

interface MintAmountResponse {
  success: boolean;
  data: {
    depositAmount: string;
    assetSymbol: string;
  };
}

// Buy tokens (deposit MEOW → get ZBanc tokens)
export const useDepositToken = () => {
  const queryClient = useQueryClient();

  return useMutation<TradingResponse, Error, TradingParams>({
    mutationFn: async (params: TradingParams) => {
      const response = await post('/api/zbanc/deposit').send({
        ...params,
        chainId: config.zChainId,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to deposit tokens');
      }

      return response.body;
    },
    onSuccess: () => {
      // Invalidate balance queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['zbanc-balance'] });
    },
  });
};

// Sell tokens (withdraw MEOW by burning ZBanc tokens)
export const useWithdrawToken = () => {
  const queryClient = useQueryClient();

  return useMutation<TradingResponse, Error, TradingParams>({
    mutationFn: async (params: TradingParams) => {
      const response = await post('/api/zbanc/withdraw').send({
        ...params,
        chainId: config.zChainId,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to withdraw tokens');
      }

      return response.body;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zbanc-balance'] });
    },
  });
};

// Mint specific amount of ZBanc tokens
export const useMintToken = () => {
  const queryClient = useQueryClient();

  return useMutation<TradingResponse, Error, MintRedeemParams>({
    mutationFn: async (params: MintRedeemParams) => {
      const response = await post('/api/zbanc/mint').send({
        ...params,
        chainId: config.zChainId,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to mint tokens');
      }

      return response.body;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zbanc-balance'] });
    },
  });
};

// Redeem specific amount of ZBanc tokens
export const useRedeemToken = () => {
  const queryClient = useQueryClient();

  return useMutation<TradingResponse, Error, MintRedeemParams>({
    mutationFn: async (params: MintRedeemParams) => {
      const response = await post('/api/zbanc/redeem').send({
        ...params,
        chainId: config.zChainId,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to redeem tokens');
      }

      return response.body;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zbanc-balance'] });
    },
  });
};

// Get price quote for trading
export const usePriceQuote = (params: PriceQuoteParams, enabled = true) => {
  return useQuery<PriceQuoteResponse['data']>({
    queryKey: [
      'zbanc-price-quote',
      params.tokenAddress,
      params.amount,
      params.direction,
    ],
    queryFn: async () => {
      const response = await post('/api/zbanc/price').send({
        ...params,
        chainId: config.zChainId,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get price quote');
      }

      return response.body.data;
    },
    enabled: enabled && !!params.tokenAddress && !!params.amount,
    staleTime: 30000, // 30 seconds
  });
};

// Get amount for deposit (how many tokens for X MEOW)
export const useAmountForDeposit = (params: TradingParams, enabled = true) => {
  return useQuery<DepositAmountResponse['data']>({
    queryKey: ['zbanc-deposit-amount', params.tokenAddress, params.amount],
    queryFn: async () => {
      const response = await post('/api/zbanc/get-amount-for-deposit').send({
        ...params,
        chainId: config.zChainId,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to calculate deposit amount');
      }

      return response.body.data;
    },
    enabled: enabled && !!params.tokenAddress && !!params.amount,
    staleTime: 30000, // 30 seconds
  });
};

// Get amount for mint (how much MEOW for X tokens)
export const useAmountForMint = (params: MintRedeemParams, enabled = true) => {
  return useQuery<MintAmountResponse['data']>({
    queryKey: ['zbanc-mint-amount', params.tokenAddress, params.shares],
    queryFn: async () => {
      const response = await post('/api/zbanc/get-amount-for-mint').send({
        ...params,
        chainId: config.zChainId,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to calculate mint amount');
      }

      return response.body.data;
    },
    enabled: enabled && !!params.tokenAddress && !!params.shares,
    staleTime: 30000, // 30 seconds
  });
};

// Get user balance for a token
export const useUserBalance = (params: BalanceParams, enabled = true) => {
  return useQuery<BalanceResponse['data']>({
    queryKey: ['zbanc-balance', params.tokenAddress, params.userAddress],
    queryFn: async () => {
      const response = await get(`/api/zbanc/balance/${params.tokenAddress}/${params.userAddress}`).query({
        chainId: config.zChainId,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get user balance');
      }

      return response.body.data;
    },
    enabled: enabled && !!params.tokenAddress && !!params.userAddress,
    refetchInterval: 10000, // Refetch every 10 seconds for real-time balance
  });
};
