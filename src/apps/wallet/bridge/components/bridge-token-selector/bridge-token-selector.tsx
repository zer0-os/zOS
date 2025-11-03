import { useMemo, useState } from 'react';

import { Input, SelectInput } from '@zero-tech/zui/components';
import { IconSearchMd } from '@zero-tech/zui/icons';
import { Button } from '../../../components/button/button';
import { TokenIcon } from '../../../components/token-icon/token-icon';
import { FormattedNumber } from '../../../components/formatted-number/formatted-number';
import { TokenBalance } from '../../../types';
import { BridgeBottomSheet } from '../bridge-bottom-sheet/bridge-bottom-sheet';

import styles from './bridge-token-selector.module.scss';

interface Chain {
  id: string;
  name: string;
  chainId: number;
  logoUrl?: string;
}

interface BridgeTokenSelectorProps {
  title?: string;
  isOpen?: boolean;
  onClose?: () => void;
  onTokenSelect?: (token: TokenBalance) => void;
}

const CHAINS: Chain[] = [
  { id: 'ethereum', name: 'Ethereum', chainId: 1 },
  { id: 'zchain', name: 'ZChain', chainId: 9369 },
];

export const BridgeTokenSelector = ({
  isOpen = false,
  onClose,
  onTokenSelect,
  title = 'Select Token',
}: BridgeTokenSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChain, setSelectedChain] = useState<string>('ethereum');

  const chainItems = useMemo(
    () =>
      CHAINS.filter((chain) => chain.id === 'ethereum' || chain.id === 'zchain').map((chain) => ({
        id: chain.id,
        label: chain.name,
        onSelect: () => setSelectedChain(chain.id),
      })),
    []
  );

  // Empty token list for now - functionality will be re-added
  const filteredTokens: TokenBalance[] = [];

  const selectToken = (token: TokenBalance) => {
    onTokenSelect?.(token);
    onClose?.();
  };

  const onAddCustomToken = () => {
    // TODO: Implement custom token addition
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
      </div>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${styles.active}`}>Tokens</button>
        <div className={styles.chainFilter}>
          <SelectInput
            items={chainItems}
            label=''
            placeholder='Select a chain'
            value={CHAINS.find((chain) => chain.id === selectedChain)?.name || ''}
            itemSize='compact'
          />
        </div>
      </div>

      <div className={styles.tokenList}>
        {filteredTokens.length === 0 ? (
          <div className={styles.emptyState}>No tokens found</div>
        ) : (
          filteredTokens.map((token) => (
            <div
              key={`${token.chainId}-${token.tokenAddress}`}
              className={styles.tokenItem}
              onClick={() => selectToken(token)}
            >
              <TokenIcon className={styles.tokenIcon} url={token.logo} name={token.name} chainId={token.chainId} />

              <div className={styles.tokenInfo}>
                <div className={styles.tokenName}>{token.name}</div>
                <div className={styles.tokenCount}>
                  <FormattedNumber value={token.amount} />
                  <span>{token.symbol}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className={styles.addTokenSection}>
        <Button onClick={onAddCustomToken} variant='secondary'>
          Add custom token
        </Button>
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
