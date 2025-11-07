import { useMemo, useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useSelector } from 'react-redux';

import { Input, SelectInput, IconButton } from '@zero-tech/zui/components';
import { IconSearchMd, IconLinkExternal1 } from '@zero-tech/zui/icons';
import { Button } from '../../../components/button/button';
import { TokenIcon } from '../../../components/token-icon/token-icon';
import { FormattedNumber } from '../../../components/formatted-number/formatted-number';
import { TokenBalance } from '../../../types';
import { BridgeBottomSheet } from '../bridge-bottom-sheet/bridge-bottom-sheet';
import {
  getWalletAddressForChain,
  getAvailableChainsForBridge,
  formatAddress,
  openExplorerForAddress,
  ZERO_ADDRESS,
} from '../../lib/utils';
import { isSupportedBridgeToken } from '../../lib/tokens';
import { useFetchTokenBalance } from '../../hooks/useFetchTokenBalance';
import { useTokenSearch } from '../../hooks/useTokenSearch';
import { currentUserSelector } from '../../../../../store/authentication/selectors';

import styles from './bridge-token-selector.module.scss';

interface BridgeTokenSelectorProps {
  title?: string;
  isOpen?: boolean;
  onClose?: () => void;
  onTokenSelect?: (token: TokenBalance) => void;
}

export const BridgeTokenSelector = ({
  isOpen = false,
  onClose,
  onTokenSelect,
  title = 'Select Token',
}: BridgeTokenSelectorProps) => {
  const { address: eoaAddress, isConnected, chainId: connectedChainId } = useAccount();
  const currentUser = useSelector(currentUserSelector);
  const zeroWalletAddress = currentUser?.zeroWalletAddress;

  const availableChains = useMemo(() => {
    if (!connectedChainId || !isConnected) {
      return [];
    }
    return getAvailableChainsForBridge(connectedChainId);
  }, [connectedChainId, isConnected]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChain, setSelectedChain] = useState<string>(availableChains[0]?.id || 'ethereum');

  // Reset selected chain and clear search when available chains change
  useEffect(() => {
    if (availableChains.length > 0) {
      const isValidChain = availableChains.find((c) => c.id === selectedChain);
      if (!isValidChain) {
        setSelectedChain(availableChains[0].id);
        setSearchQuery('');
      }
    }
  }, [availableChains, selectedChain]);

  const selectedChainId = availableChains.find((chain) => chain.id === selectedChain)?.chainId;

  const selectedChainWalletAddress = useMemo(
    () => getWalletAddressForChain(selectedChainId, eoaAddress, zeroWalletAddress) || eoaAddress,
    [selectedChainId, eoaAddress, zeroWalletAddress]
  );

  const chainItems = useMemo(
    () =>
      availableChains.map((chain) => ({
        id: chain.id,
        label: chain.name,
        onSelect: () => setSelectedChain(chain.id),
      })),
    [availableChains]
  );

  const { data: tokens = [], isPending: isLoading } = useFetchTokenBalance({
    chainId: selectedChainId,
    walletAddress: selectedChainWalletAddress || undefined,
    enabled: isOpen && isConnected && !!selectedChainId && !!selectedChainWalletAddress,
  });

  // token search hook for all search and custom token functionality
  const {
    isAddressQuery,
    tokenMetadata,
    isFetchingMetadata,
    metadataError,
    foundTokenInList,
    filteredTokens,
    addTokenToList,
  } = useTokenSearch({
    searchQuery,
    tokens,
    selectedChainId,
    walletAddress: selectedChainWalletAddress || undefined,
  });

  const sortedTokens = useMemo(() => {
    return [...filteredTokens].sort((a, b) => {
      const aSupported = isSupportedBridgeToken(a.symbol);
      const bSupported = isSupportedBridgeToken(b.symbol);

      if (aSupported && !bSupported) return -1;
      if (!aSupported && bSupported) return 1;
      return 0;
    });
  }, [filteredTokens]);

  const selectToken = (token: TokenBalance) => {
    onTokenSelect?.(token);
    onClose?.();
  };

  const onAddCustomToken = async () => {
    await addTokenToList();
    setSearchQuery('');
  };

  const handleExternalLink = () => {
    openExplorerForAddress(selectedChainWalletAddress, selectedChainId);
  };

  const content = (
    <div className={styles.container}>
      <div className={styles.searchSection}>
        <div className={styles.searchInput}>
          <Input
            type='text'
            placeholder='Enter token name or address'
            value={searchQuery}
            onChange={setSearchQuery}
            endEnhancer={<IconSearchMd size={16} />}
            className={styles.input}
          />
        </div>
        <div className={styles.searchHint}>Search by address to add a custom token</div>
      </div>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${styles.active}`}>Tokens</button>
        <div className={styles.chainFilter}>
          {selectedChainWalletAddress && (
            <div className={styles.walletAddressContainer}>
              <span className={styles.walletAddress}>{formatAddress(selectedChainWalletAddress)}</span>
              {selectedChainId && selectedChainWalletAddress !== ZERO_ADDRESS && (
                <IconButton
                  Icon={IconLinkExternal1}
                  onClick={handleExternalLink}
                  aria-label='View on explorer'
                  size={16}
                />
              )}
            </div>
          )}
          <SelectInput
            items={chainItems}
            label=''
            placeholder='Select a chain'
            value={availableChains.find((chain) => chain.id === selectedChain)?.name || ''}
            itemSize='compact'
          />
        </div>
      </div>

      <div className={styles.tokenList}>
        {isLoading ? (
          <div className={styles.emptyState}>Loading tokens...</div>
        ) : !isConnected ? (
          <div className={styles.emptyState}>Connect wallet to view tokens</div>
        ) : (
          <>
            {/* If searching by address for a token not in list */}
            {isAddressQuery && !foundTokenInList && (
              <>
                {isFetchingMetadata && <div className={styles.emptyState}>Loading token...</div>}

                {!isFetchingMetadata && tokenMetadata && (
                  <div className={styles.tokenItem}>
                    <TokenIcon
                      className={styles.tokenIcon}
                      url={undefined}
                      name={tokenMetadata.name}
                      chainId={selectedChainId}
                    />
                    <div className={styles.tokenInfo}>
                      <div className={styles.tokenName}>{tokenMetadata.name}</div>
                      <div className={styles.tokenCount}>{tokenMetadata.symbol}</div>
                    </div>
                    <Button onClick={onAddCustomToken} variant='primary'>
                      Add token
                    </Button>
                  </div>
                )}

                {!isFetchingMetadata && metadataError && (
                  <div className={styles.emptyState}>The token couldn't be found on the selected network.</div>
                )}
              </>
            )}

            {/* Show regular token list (for non-address searches or when token is already in list) */}
            {(!isAddressQuery || foundTokenInList) && (
              <>
                {sortedTokens.length === 0 ? (
                  <div className={styles.emptyState}>No tokens found</div>
                ) : (
                  sortedTokens.map((token) => {
                    const isSupported = isSupportedBridgeToken(token.symbol);
                    return (
                      <div
                        key={`${token.chainId}-${token.tokenAddress}`}
                        className={`${styles.tokenItem} ${!isSupported ? styles.tokenItemDisabled : ''}`}
                        onClick={isSupported ? () => selectToken(token) : undefined}
                      >
                        <TokenIcon
                          className={styles.tokenIcon}
                          url={token.logo}
                          name={token.name}
                          chainId={token.chainId}
                        />

                        <div className={styles.tokenInfo}>
                          <div className={styles.tokenName}>{token.name}</div>
                          <div className={styles.tokenCount}>
                            <FormattedNumber value={token.amount} /> <span>{token.symbol}</span>
                          </div>
                        </div>

                        {!isSupported && <div className={styles.notSupportedTag}>Not Supported</div>}
                      </div>
                    );
                  })
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );

  if (!isOpen) {
    return null;
  }

  return (
    <BridgeBottomSheet title={title} onClose={onClose}>
      {content}
    </BridgeBottomSheet>
  );
};
