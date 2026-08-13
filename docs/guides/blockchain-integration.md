# Blockchain Integration Guide for zOS

This guide provides comprehensive patterns and examples for integrating blockchain functionality into zOS applications, with special focus on wallet connections, transactions, and smart contract interactions that support Haven Protocol's creator economy features.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Wallet Connection Patterns](#wallet-connection-patterns)
3. [Transaction Handling](#transaction-handling)
4. [Smart Contract Interactions](#smart-contract-interactions)
5. [State Management Integration](#state-management-integration)
6. [Error Handling & User Experience](#error-handling--user-experience)
7. [Security Best Practices](#security-best-practices)
8. [Creator Economy Patterns](#creator-economy-patterns)
9. [Testing Strategies](#testing-strategies)
10. [Troubleshooting](#troubleshooting)

## Architecture Overview

zOS uses a modern Web3 stack built around **RainbowKit**, **Wagmi**, and **Viem** for blockchain interactions. The architecture separates concerns between UI components, Redux state management, and blockchain operations.

### Core Technologies

- **RainbowKit**: Wallet connection UI and management
- **Wagmi**: React hooks for Ethereum interactions
- **Viem**: TypeScript library for Ethereum operations
- **React Query**: Caching and synchronization for blockchain data
- **Redux Toolkit**: Global state management for Web3 state

### Supported Networks

```typescript
// From /src/lib/web3/wagmi-config.ts
const supportedChains = [
  1,          // Ethereum Mainnet
  11155111,   // Sepolia Testnet
  43113,      // Avalanche Fuji Testnet
  1417429182  // Zephyr Test Net (custom chain)
];
```

## Wallet Connection Patterns

### Basic Wallet Provider Setup

The foundation of zOS's Web3 integration starts with the `RainbowKitProvider`:

```tsx
// /src/lib/web3/rainbowkit/provider.tsx
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider as RKProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { getWagmiConfig } from '../wagmi-config';

const queryClient = new QueryClient();

export const RainbowKitProvider = ({ children }) => {
  return (
    <WagmiProvider config={getWagmiConfig()}>
      <QueryClientProvider client={queryClient}>
        <RKProvider theme={darkTheme()} modalSize='compact'>
          {children}
        </RKProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
```

### Connection State Management

zOS implements a comprehensive connection monitoring system:

```tsx
// /src/lib/web3/rainbowkit/connect.tsx
import { watchAccount } from '@wagmi/core';
import { ConnectionStatus } from '..';

export class Container extends React.Component<Properties> {
  watchConnection() {
    this.unwatch = watchAccount(getWagmiConfig(), {
      onChange: (account, prevAccount) => {
        this.props.setChain(account.chainId);
        
        if (!account.isConnected) {
          this.props.setConnectionStatus(ConnectionStatus.Disconnected);
        } else if (!this.isSupportedChain(account.chainId)) {
          this.props.setConnectionStatus(ConnectionStatus.NetworkNotSupported);
        } else {
          this.props.setConnectionStatus(ConnectionStatus.Connected);
          
          // Handle address changes for wallet switching
          if (account.address && prevAccount?.address !== account.address) {
            this.props.setAddress(account.address);
          }
        }
      },
    });
  }

  isSupportedChain(chainId: number | undefined): boolean {
    if (!chainId) return false;
    const supportedChains = [1, 11155111, 43113]; // mainnet, sepolia, avalanche fuji
    return supportedChains.includes(chainId);
  }
}
```

### Connection State in Redux

```typescript
// /src/store/web3/index.ts
export enum ConnectionStatus {
  Disconnected = 'disconnected',
  Connected = 'connected',
  NetworkNotSupported = 'network-not-supported'
}

export interface Web3State {
  status: ConnectionStatus;
  value: {
    chainId: Chains;
    address: string;
    connectorId: Connector['id'] | '';
    error: string;
  };
}
```

### User Authentication with Web3

zOS integrates Web3 authentication seamlessly with traditional auth:

```tsx
// /src/authentication/web3-login/index.tsx
export class Web3Login extends React.Component<Web3LoginProperties> {
  render() {
    const { error, isConnecting, isWalletConnected, onSelect } = this.props;

    return (
      <div>
        <RainbowKitConnectButton isDisabled={isConnecting} />
        {isWalletConnected && (
          <Button isDisabled={isConnecting} onPress={onSelect}>
            Sign In
          </Button>
        )}
        {error && (
          <Alert variant='error'>
            {error === Web3LoginErrors.PROFILE_NOT_FOUND
              ? 'The wallet you connected is not associated with a ZERO account'
              : error}
          </Alert>
        )}
      </div>
    );
  }
}
```

## Transaction Handling

### Token Transfer Pattern

zOS uses a hybrid approach combining client-side preparation with server-side execution for security:

```typescript
// /src/apps/wallet/queries/transferTokenRequest.ts
export const transferTokenRequest = async (
  address: string,
  to: string,
  amount: string,
  tokenAddress: string
): Promise<TransferTokenResponse> => {
  const response = await post(`/api/wallet/${address}/transactions/transfer-token`).send({
    to,
    amount,
    tokenAddress,
  });

  return response.body as TransferTokenResponse;
};
```

### NFT Transfer Implementation

```typescript
// /src/apps/wallet/queries/transferNFTRequest.ts
export const transferNFTRequest = async (
  address: string,
  to: string,
  tokenId: string,
  nftAddress: string
): Promise<TransferNFTResponse> => {
  const response = await post(`/api/wallet/${address}/transactions/transfer-nft`).send({
    to,
    tokenId,
    nftAddress,
  });

  return response.body as TransferNFTResponse;
};
```

### Transaction Receipt Monitoring

```typescript
// Pattern for monitoring transaction status
const waitForTransactionReceipt = async (hash: string) => {
  const receiptResponse = await get(`/api/wallet/transaction/${hash}/receipt`).send();
  
  if (receiptResponse.body.status === 'confirmed') {
    return { success: true, receipt: receiptResponse.body };
  } else if (receiptResponse.body.status === 'failed') {
    throw new Error('Transaction failed');
  }
  
  // Continue polling for pending transactions
  return null;
};
```

## Smart Contract Interactions

### Staking Contract Integration

zOS implements a comprehensive staking system with proper error handling and state management:

```typescript
// /src/apps/staking/lib/useStaking.ts
export const useStaking = () => {
  const { address: userAddress } = useSelector(selectedWalletSelector);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ poolAddress, amount, lockDuration }: StakingParams) => {
      if (!userAddress) {
        throw new Error('User not connected');
      }

      let response;
      try {
        response = await post(`/api/wallet/${userAddress}/transactions/stake${lockDuration ? '-with-lock' : ''}`).send({
          poolAddress,
          amount,
          lockDuration,
        });
      } catch (e) {
        console.error(e);
        throw new Error('Failed to stake tokens, please try again.');
      }

      if (response.body?.transactionHash) {
        const receiptResponse = await get(`/api/wallet/transaction/${response.body.transactionHash}/receipt`).send();

        if (receiptResponse.body.status === 'confirmed') {
          return { success: true, hash: response.body.transactionHash, receipt: receiptResponse.body };
        } else {
          throw new Error('Transaction failed');
        }
      }
    },
    onSuccess: (_, { poolAddress }) => {
      // Invalidate relevant queries to refresh UI
      queryClient.invalidateQueries({
        queryKey: ['userStakingBalance'],
      });
      queryClient.invalidateQueries({
        queryKey: ['userStakingInfo', poolAddress],
      });
    },
  });

  const executeStake = async (poolAddress: string, amount: string, lockDuration?: string) => {
    try {
      const result = await mutation.mutateAsync({ poolAddress, amount, lockDuration });
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Staking failed';
      return { success: false, error: errorMessage };
    }
  };

  return {
    stakeWithLock: (poolAddress: string, amount: string, lockDuration: string) => 
      executeStake(poolAddress, amount, lockDuration),
    stakeWithoutLock: (poolAddress: string, amount: string) => 
      executeStake(poolAddress, amount),
    isStaking: mutation.isPending,
    error: mutation.error?.message || null,
  };
};
```

### Token Approval Pattern

```typescript
// /src/apps/staking/lib/useTokenApproval.ts
export const useTokenApproval = () => {
  const { address: userAddress } = useSelector(selectedWalletSelector);

  const mutation = useMutation({
    mutationFn: async ({ tokenAddress, spender, amount }: ApprovalParams) => {
      if (!userAddress) {
        throw new Error('User not connected');
      }

      const response = await post(`/api/wallet/${userAddress}/transactions/approve`).send({
        tokenAddress,
        spender,
        amount,
      });

      if (response.body?.transactionHash) {
        // Wait for confirmation
        const receiptResponse = await get(`/api/wallet/transaction/${response.body.transactionHash}/receipt`).send();
        
        if (receiptResponse.body.status === 'confirmed') {
          return { success: true, hash: response.body.transactionHash };
        } else {
          throw new Error('Approval transaction failed');
        }
      }
    },
  });

  return {
    approveToken: mutation.mutateAsync,
    isApproving: mutation.isPending,
    error: mutation.error?.message || null,
  };
};
```

## State Management Integration

### Web3 State Structure

```typescript
// /src/store/web3/index.ts
export interface Web3State {
  status: ConnectionStatus;
  value: {
    chainId: Chains;
    address: string;
    connectorId: Connector['id'] | '';
    error: string;
  };
}

const slice = createSlice({
  name: 'web3',
  initialState,
  reducers: {
    setConnectionStatus: (state, action: PayloadAction<ConnectionStatus>) => {
      state.status = action.payload;
    },
    setWalletAddress: (state, action: PayloadAction<string>) => {
      state.value.address = action.payload;
    },
    setChain: (state, action: PayloadAction<Chains>) => {
      state.value.chainId = action.payload;
    },
    setWalletConnectionError: (state, action: PayloadAction<string>) => {
      state.value.error = action.payload;
    },
  },
});
```

### Wallet State Management

```typescript
// /src/store/wallet/selectors.ts
export const selectedWalletSelector = (state: RootState) => {
  return {
    address: state.web3.value.address,
    chainId: state.web3.value.chainId,
    status: state.web3.status,
    connectorId: state.web3.value.connectorId,
  };
};
```

## Error Handling & User Experience

### Connection Error Handling

```typescript
// Comprehensive error handling pattern
const handleWeb3Error = (error: Error): string => {
  if (error.message.includes('User denied transaction')) {
    return 'Transaction was cancelled by user';
  }
  
  if (error.message.includes('insufficient funds')) {
    return 'Insufficient funds for transaction';
  }
  
  if (error.message.includes('network')) {
    return 'Network error. Please check your connection and try again';
  }
  
  return 'An unexpected error occurred. Please try again';
};
```

### Loading States and User Feedback

```tsx
// Pattern for showing transaction progress
const TransactionButton = ({ onExecute, children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await onExecute();
    } catch (err) {
      setError(handleWeb3Error(err as Error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button 
        isLoading={isLoading} 
        onPress={handleClick}
        isDisabled={isLoading}
      >
        {children}
      </Button>
      {error && <Alert variant="error">{error}</Alert>}
    </>
  );
};
```

## Security Best Practices

### 1. Address Validation

```typescript
const isValidAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

const validateRecipient = (to: string) => {
  if (!isValidAddress(to)) {
    throw new Error('Invalid recipient address');
  }
  
  if (to.toLowerCase() === userAddress.toLowerCase()) {
    throw new Error('Cannot send to yourself');
  }
};
```

### 2. Amount Validation

```typescript
const validateAmount = (amount: string, balance: string, decimals: number) => {
  const amountBN = parseUnits(amount, decimals);
  const balanceBN = parseUnits(balance, decimals);
  
  if (amountBN <= 0n) {
    throw new Error('Amount must be greater than 0');
  }
  
  if (amountBN > balanceBN) {
    throw new Error('Insufficient balance');
  }
};
```

### 3. Network Validation

```typescript
const requireSupportedNetwork = (chainId: number) => {
  const supportedChains = [1, 11155111, 43113, 1417429182];
  
  if (!supportedChains.includes(chainId)) {
    throw new Error('Please switch to a supported network');
  }
};
```

### 4. Transaction Signing Security

```typescript
// Always validate transaction parameters before signing
const prepareTransaction = (params: TransactionParams) => {
  validateRecipient(params.to);
  validateAmount(params.amount, params.balance, params.decimals);
  requireSupportedNetwork(params.chainId);
  
  return {
    to: params.to,
    value: parseUnits(params.amount, params.decimals),
    data: params.data || '0x',
  };
};
```

## Creator Economy Patterns

### Content Monetization Integration

```typescript
// Pattern for integrating blockchain payments with content
const useContentPayment = () => {
  const { address } = useSelector(selectedWalletSelector);
  
  const payForContent = async (
    contentId: string, 
    creatorAddress: string, 
    amount: string
  ) => {
    // Validate creator and content
    const content = await validateContent(contentId);
    if (content.creator !== creatorAddress) {
      throw new Error('Creator address mismatch');
    }
    
    // Execute payment
    const result = await transferTokenRequest(
      address,
      creatorAddress,
      amount,
      PAYMENT_TOKEN_ADDRESS
    );
    
    if (result.transactionHash) {
      // Update content access permissions
      await grantContentAccess(contentId, address);
      return { success: true, hash: result.transactionHash };
    }
    
    throw new Error('Payment failed');
  };
  
  return { payForContent };
};
```

### NFT Minting for Creators

```typescript
// Pattern for creator NFT minting
const useCreatorNFT = () => {
  const { address } = useSelector(selectedWalletSelector);
  
  const mintCreatorNFT = async (
    metadata: NFTMetadata,
    royaltyPercentage: number
  ) => {
    // Validate creator permissions
    if (!await isVerifiedCreator(address)) {
      throw new Error('Only verified creators can mint NFTs');
    }
    
    const response = await post(`/api/wallet/${address}/transactions/mint-nft`).send({
      metadata,
      royalty: royaltyPercentage,
      creator: address,
    });
    
    if (response.body?.transactionHash) {
      const receipt = await waitForTransactionReceipt(response.body.transactionHash);
      
      if (receipt.success) {
        return {
          success: true,
          tokenId: receipt.receipt.logs[0].topics[3], // Extract token ID from logs
          hash: response.body.transactionHash,
        };
      }
    }
    
    throw new Error('NFT minting failed');
  };
  
  return { mintCreatorNFT };
};
```

### Revenue Sharing Implementation

```typescript
// Pattern for automated revenue sharing
const useRevenueSharing = () => {
  const distributeRevenue = async (
    totalAmount: string,
    recipients: Array<{ address: string; percentage: number }>
  ) => {
    // Validate percentages sum to 100
    const totalPercentage = recipients.reduce((sum, r) => sum + r.percentage, 0);
    if (totalPercentage !== 100) {
      throw new Error('Percentages must sum to 100');
    }
    
    const distributions = recipients.map(recipient => ({
      to: recipient.address,
      amount: (parseFloat(totalAmount) * recipient.percentage / 100).toString(),
    }));
    
    // Execute batch transfers
    const results = await Promise.all(
      distributions.map(dist => 
        transferTokenRequest(address, dist.to, dist.amount, REVENUE_TOKEN_ADDRESS)
      )
    );
    
    return results.map(r => r.transactionHash);
  };
  
  return { distributeRevenue };
};
```

## Testing Strategies

### Mock Web3 Provider for Testing

```typescript
// /src/lib/web3/__mocks__/provider.tsx
export const MockRainbowKitProvider = ({ children }) => {
  const mockWagmiConfig = {
    chains: [mockChain],
    connectors: [mockConnector],
  };
  
  return (
    <WagmiProvider config={mockWagmiConfig}>
      <QueryClientProvider client={testQueryClient}>
        <RKProvider>
          {children}
        </RKProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
```

### Testing Transaction Flows

```typescript
// Example test for staking functionality
describe('useStaking', () => {
  it('should handle successful staking', async () => {
    const mockResponse = {
      body: { transactionHash: '0x123...' }
    };
    
    jest.mocked(post).mockReturnValue({
      send: jest.fn().mockResolvedValue(mockResponse)
    });
    
    const { result } = renderHook(() => useStaking(), {
      wrapper: MockRainbowKitProvider,
    });
    
    const stakeResult = await result.current.stakeWithoutLock('0xpool...', '100');
    
    expect(stakeResult.success).toBe(true);
    expect(stakeResult.hash).toBe('0x123...');
  });
  
  it('should handle staking errors', async () => {
    jest.mocked(post).mockImplementation(() => {
      throw new Error('Network error');
    });
    
    const { result } = renderHook(() => useStaking(), {
      wrapper: MockRainbowKitProvider,
    });
    
    const stakeResult = await result.current.stakeWithoutLock('0xpool...', '100');
    
    expect(stakeResult.success).toBe(false);
    expect(stakeResult.error).toContain('Failed to stake tokens');
  });
});
```

### Integration Testing Pattern

```typescript
// Pattern for end-to-end Web3 integration tests
const testWeb3Integration = async () => {
  // 1. Connect wallet
  await connectWallet('MetaMask');
  expect(getConnectionStatus()).toBe(ConnectionStatus.Connected);
  
  // 2. Switch to correct network
  await switchChain(1); // Mainnet
  expect(getCurrentChain()).toBe(1);
  
  // 3. Execute transaction
  const result = await transferTokens('0xrecipient...', '10');
  expect(result.success).toBe(true);
  expect(result.hash).toMatch(/^0x[a-fA-F0-9]{64}$/);
  
  // 4. Verify state updates
  expect(getTransactionHistory()).toContain(result.hash);
};
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Wallet Connection Issues

**Problem**: Wallet fails to connect or connection is lost
```typescript
// Debug connection issues
const debugConnection = () => {
  console.log('Web3 State:', {
    status: store.getState().web3.status,
    address: store.getState().web3.value.address,
    chainId: store.getState().web3.value.chainId,
    connectorId: store.getState().web3.value.connectorId,
  });
  
  // Check if wallet is installed
  if (!window.ethereum) {
    console.error('No wallet detected. Please install MetaMask or another Web3 wallet.');
    return;
  }
  
  // Check network
  window.ethereum.request({ method: 'eth_chainId' })
    .then(chainId => console.log('Current chain:', parseInt(chainId, 16)))
    .catch(console.error);
};
```

**Solution**:
- Ensure wallet extension is installed and unlocked
- Check network configuration in `wagmi-config.ts`
- Verify RPC endpoints are accessible
- Clear browser cache and localStorage

#### 2. Transaction Failures

**Problem**: Transactions fail or remain pending
```typescript
// Debug transaction issues
const debugTransaction = async (hash: string) => {
  try {
    const receipt = await publicClient.getTransactionReceipt({ hash });
    console.log('Transaction receipt:', receipt);
    
    if (receipt.status === 'reverted') {
      console.error('Transaction reverted. Check contract conditions.');
    }
  } catch (error) {
    console.error('Transaction not found or still pending:', error);
  }
};
```

**Solutions**:
- Check gas price and gas limit settings
- Verify contract addresses and ABIs
- Ensure sufficient token balance for gas fees
- Check network congestion and adjust gas price

#### 3. State Synchronization Issues

**Problem**: UI state doesn't reflect blockchain state
```typescript
// Force refresh blockchain data
const refreshWeb3State = () => {
  // Invalidate all Web3-related queries
  queryClient.invalidateQueries({ queryKey: ['balance'] });
  queryClient.invalidateQueries({ queryKey: ['allowance'] });
  queryClient.invalidateQueries({ queryKey: ['transactions'] });
  
  // Re-fetch wallet connection state
  window.location.reload(); // Last resort
};
```

**Solutions**:
- Implement proper query invalidation after transactions
- Use React Query's staleTime and cacheTime appropriately
- Handle connection changes with event listeners
- Implement retry logic for failed queries

#### 4. Network Switching Issues

**Problem**: Users can't switch networks or app doesn't recognize network changes
```typescript
// Handle network switching
const handleNetworkSwitch = async (targetChainId: number) => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${targetChainId.toString(16)}` }],
    });
  } catch (switchError: any) {
    // Network doesn't exist, add it
    if (switchError.code === 4902) {
      await addCustomNetwork(targetChainId);
    } else {
      console.error('Failed to switch network:', switchError);
    }
  }
};
```

### Performance Optimization

#### 1. Query Optimization

```typescript
// Optimize blockchain queries with proper caching
const useOptimizedBalance = (address: string, tokenAddress: string) => {
  return useQuery({
    queryKey: ['balance', address, tokenAddress],
    queryFn: () => getTokenBalance(address, tokenAddress),
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 3,
  });
};
```

#### 2. Batch Operations

```typescript
// Batch multiple contract calls
const useBatchedContractReads = (calls: ContractCall[]) => {
  return useQuery({
    queryKey: ['batchRead', calls],
    queryFn: async () => {
      const results = await multicall({
        contracts: calls,
      });
      return results;
    },
    enabled: calls.length > 0,
  });
};
```

### Debugging Tools

```typescript
// Development debugging helpers
if (process.env.NODE_ENV === 'development') {
  // Expose Web3 debugging tools to window
  window.debugWeb3 = {
    getState: () => store.getState().web3,
    getWagmiConfig,
    queryClient,
    refreshAllQueries: () => queryClient.invalidateQueries(),
  };
}
```

This comprehensive guide provides the foundation for building robust blockchain integrations in zOS. The patterns shown here emphasize security, user experience, and maintainability while supporting the creator economy features that Haven Protocol enables.

For additional support, refer to the [Integration Guide](/opusdocs/integration-guide.md) for broader integration patterns, or consult the [Developer Reference](/opusdocs/developer-reference/) for specific component and hook documentation.