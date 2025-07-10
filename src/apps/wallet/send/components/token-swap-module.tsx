import { TokenIcon } from '../../components/token-icon/token-icon';
import { truncateAddress } from '../../utils/address';
import { TokenBalance } from '../../types';
import { FormattedNumber } from '../../components/formatted-number/formatted-number';
import { TokenNumberInput } from './token-number-input';

import styles from './token-swap-module.module.scss';

interface TokenSwapModuleProps {
  state: 'input' | 'output';
  walletAddress: string;
  walletLabel: string | null;
  token: TokenBalance;
  amount: string;
  onAmountChange?: (amount: string) => void;
}

export const TokenSwapModule = ({
  state,
  walletAddress,
  walletLabel,
  token,
  amount,
  onAmountChange,
}: TokenSwapModuleProps) => {
  const handleMax = () => {
    onAmountChange?.(token.amount);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLabel}>
          <span className={styles.headerLabelText}>{state === 'input' ? 'From:' : 'Sending To:'}</span>
          <span className={styles.headerLabelRecipient}>{walletLabel || walletAddress}</span>
        </div>

        {walletLabel && <div className={styles.headerAddress}>{truncateAddress(walletAddress)}</div>}
      </div>

      <div className={styles.tokenSelect}>
        <TokenIcon url={token?.logo} name={token?.name} />
        <div className={styles.tokenInfo}>
          <span className={styles.tokenName}>{token?.name}</span>
          <span className={styles.tokenSymbol}>{token?.symbol}</span>
        </div>
      </div>

      <div className={styles.amountRow}>
        {state === 'input' ? (
          <div className={styles.amountInput}>
            <TokenNumberInput value={amount} onChange={onAmountChange} decimals={token.decimals} />
          </div>
        ) : (
          <div className={styles.amountOutput}>{amount || 0}</div>
        )}
        {state === 'input' && (
          <div className={styles.maxButton}>
            <button onClick={handleMax}>Use Max</button>
          </div>
        )}
      </div>
      <div className={styles.totalsRow}>
        {state === 'input' && (
          <>
            <div className={styles.dollarAmount}>--</div>
            <div className={styles.balance}>
              <span>Balance:</span>
              <FormattedNumber value={token.amount} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
