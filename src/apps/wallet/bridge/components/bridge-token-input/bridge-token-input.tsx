import { Input } from '@zero-tech/zui/components';
import { Button } from '../../../components/button/button';
import { FormattedNumber } from '../../../components/formatted-number/formatted-number';
import { TokenIcon } from '../../../components/token-icon/token-icon';
import { IconChevronRight } from '@zero-tech/zui/icons';
import { CHAIN_NAMES } from '../../lib/utils';

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

  onOpenSelector: () => void;
  onMaxClick?: () => void;
  onAmountChange?: (amount: string) => void;
}

export const BridgeTokenInput = ({
  type,
  selectedToken,
  amount = '',
  isLoading = false,
  autoFocus = false,
  onOpenSelector,
  onMaxClick,
  onAmountChange,
}: BridgeTokenInputProps) => {
  const isFrom = type === 'from';
  const chainName = selectedToken?.chainId ? CHAIN_NAMES[selectedToken.chainId] : null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.label}>{isFrom ? 'From' : 'To'}</span>
        {chainName && <span className={styles.chainNameLabel}>{chainName}</span>}
      </div>

      <div className={styles.tokenSection}>
        {selectedToken ? (
          <div className={styles.selectedToken} onClick={onOpenSelector}>
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
            <IconChevronRight className={styles.chevron} />
          </div>
        ) : (
          <div className={styles.selectTokenButton} onClick={onOpenSelector}>
            <div className={styles.placeholderIcon} />
            <div className={styles.selectTokenText}>Select Token</div>
            <IconChevronRight className={styles.chevron} />
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
                  <FormattedNumber value={selectedToken.balance} /> {selectedToken.symbol}
                </>
              ) : (
                '0'
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
            <FormattedNumber value={amount} /> <span className={styles.tokenSymbol}>{selectedToken.symbol}</span>
          </div>
        </div>
      )}
    </div>
  );
};
