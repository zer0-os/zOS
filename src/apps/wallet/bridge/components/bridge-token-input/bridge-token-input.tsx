import { Input, IconButton } from '@zero-tech/zui/components';
import { Button } from '../../../components/button/button';
import { TokenIcon } from '../../../components/token-icon/token-icon';
import { IconChevronRight, IconLinkExternal1 } from '@zero-tech/zui/icons';
import { CHAIN_NAMES, formatAmount, formatAddress, getExplorerAddressUrl, ZERO_ADDRESS } from '../../lib/utils';

import styles from './bridge-token-input.module.scss';

interface SelectedToken {
  symbol: string;
  name: string;
  chainId: number;
  balance?: string;
  logoUrl?: string;
}

interface BridgeTokenInputProps {
  type: 'from' | 'to';
  selectedToken: SelectedToken | null;
  amount?: string;
  isLoading?: boolean;
  autoFocus?: boolean;
  walletAddress?: string;

  onOpenSelector?: () => void;
  onMaxClick?: () => void;
  onAmountChange?: (amount: string) => void;
}

export const BridgeTokenInput = ({
  type,
  selectedToken,
  amount = '',
  isLoading = false,
  autoFocus = false,
  walletAddress,
  onOpenSelector,
  onMaxClick,
  onAmountChange,
}: BridgeTokenInputProps) => {
  const isFrom = type === 'from';
  const chainName = selectedToken?.chainId ? CHAIN_NAMES[selectedToken.chainId] : null;

  const onExternalLink = () => {
    if (!walletAddress || !selectedToken?.chainId || walletAddress === ZERO_ADDRESS) {
      return;
    }
    const url = getExplorerAddressUrl(walletAddress, selectedToken.chainId);
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.labelContainer}>
          <span className={styles.label}>{isFrom ? 'From' : 'To'}</span>
          {walletAddress && (
            <div className={styles.walletAddressContainer}>
              <span className={styles.walletAddress}>{formatAddress(walletAddress)}</span>
              {selectedToken?.chainId && walletAddress && (
                <IconButton Icon={IconLinkExternal1} onClick={onExternalLink} aria-label='View on explorer' size={16} />
              )}
            </div>
          )}
        </div>
        {chainName && <span className={styles.chainNameLabel}>{chainName}</span>}
      </div>

      <div className={styles.tokenSection}>
        {selectedToken ? (
          <div
            className={`${styles.selectedToken} ${isFrom && onOpenSelector ? styles.clickable : ''}`}
            {...(isFrom && onOpenSelector && { onClick: onOpenSelector })}
          >
            <TokenIcon
              className={styles.tokenIcon}
              url={selectedToken?.logoUrl}
              name={selectedToken.symbol}
              chainId={selectedToken.chainId}
            />
            <div className={styles.tokenDetails}>
              <div className={styles.tokenName}>{selectedToken.symbol}</div>
              <div className={styles.tokenSymbol}>{selectedToken.name}</div>
            </div>
            {onOpenSelector && <IconChevronRight className={styles.chevron} />}
          </div>
        ) : (
          <div
            className={`${styles.selectTokenButton} ${isFrom && onOpenSelector ? styles.clickable : ''}`}
            {...(isFrom && onOpenSelector && { onClick: onOpenSelector })}
          >
            <div className={styles.placeholderIcon} />
            <div className={styles.selectTokenText}>Select Token</div>
            {isFrom && onOpenSelector && <IconChevronRight className={styles.chevron} />}
          </div>
        )}
      </div>

      {isFrom && selectedToken && (
        <div className={styles.inputSection}>
          <Input
            type='number'
            placeholder='0.00'
            value={amount}
            onChange={onAmountChange}
            autoFocus={autoFocus}
            className={styles.amountInput}
          />
          <div className={styles.balanceSection}>
            <span className={styles.balanceLabel}>
              Balance:{' '}
              {isLoading ? (
                'Loading...'
              ) : selectedToken?.balance ? (
                <>
                  {formatAmount(selectedToken.balance)} {selectedToken.symbol}
                </>
              ) : (
                '0.0'
              )}
            </span>
            {onMaxClick && selectedToken?.balance && (
              <div className={styles.maxButtonContainer}>
                <Button onClick={onMaxClick} variant='secondary' disabled={isLoading}>
                  MAX
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {!isFrom && selectedToken && (
        <div className={styles.outputSection}>
          <div className={styles.amountDisplay}>
            {formatAmount(amount)} <span className={styles.tokenSymbol}>{selectedToken.symbol}</span>
          </div>
        </div>
      )}
    </div>
  );
};
