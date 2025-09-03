import classNames from 'classnames';
import { FormattedNumber } from '../components/formatted-number/formatted-number';
import { TokenIcon } from '../components/token-icon/token-icon';
import { Transaction as TransactionType } from '../types';
import { truncateAddress } from '../utils/address';
import { formatDollars } from '../utils/format-numbers';
import styles from './transaction.module.scss';

interface TransactionProps {
  transaction: TransactionType;
}

export const Transaction = ({ transaction }: TransactionProps) => {
  const isReceive = transaction.action === 'receive';
  const usdAmount =
    transaction.token.amount && transaction.token.price
      ? formatDollars(Number(transaction.token.amount) * transaction.token.price)
      : '--';

  const handleClick = () => {
    window.open(transaction.explorerUrl, '_blank');
  };

  return (
    <div className={styles.transaction} onClick={handleClick}>
      <div>
        <TokenIcon
          url={transaction.token.logo}
          name={transaction.token.name ?? ''}
          chainId={transaction.token.chainId}
        />
      </div>

      <div className={styles.transactionInfo}>
        <div className={styles.receivedFrom}>
          {transaction.action === 'receive'
            ? `Received from ${truncateAddress(transaction.from)}`
            : `Sent to ${truncateAddress(transaction.to)}`}
        </div>
        <div className={styles.tokenCount}>
          <span className={styles.tokenSymbol}>{transaction.token.symbol}</span>
        </div>
      </div>

      {transaction.type === 'token_transfer' ? (
        <div className={styles.tokenAmount}>
          {transaction.amount && <FormattedNumber value={transaction.amount} />}
          {transaction.tokenId && <div className={styles.tokenId}>#{transaction.tokenId}</div>}
          <div
            className={classNames(styles.tokenAmountUSD, {
              [styles.positive]: isReceive,
            })}
          >
            {usdAmount === '--' ? usdAmount : isReceive ? `+${usdAmount}` : usdAmount}
          </div>
        </div>
      ) : (
        <div className={styles.tokenAmount}>
          {transaction.amount && <FormattedNumber value={transaction.amount} />}
          {transaction.tokenId && <div className={styles.tokenId}>#{transaction.tokenId}</div>}
          <div className={styles.positive}>Mint</div>
        </div>
      )}
    </div>
  );
};
