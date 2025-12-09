import classNames from 'classnames';
import { useHistory } from 'react-router-dom';
import { IconButton } from '@zero-tech/zui/components';
import { IconLinkExternal1 } from '@zero-tech/zui/icons';
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
  const history = useHistory();
  const isReceive = transaction.action === 'receive';
  const usdAmount =
    transaction.token.amount && transaction.token.price
      ? formatDollars(Number(transaction.token.amount) * transaction.token.price)
      : '--';

  const handleClick = () => {
    // Use hash + action for a cleaner URL
    // This uniquely identifies the transaction when there are multiple with the same hash
    const uniqueId = `${transaction.hash}-${transaction.action}`;
    history.push(`/wallet/transactions/${encodeURIComponent(uniqueId)}`);
  };

  const handleExternalLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(transaction.explorerUrl, '_blank', 'noopener,noreferrer');
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
              [styles.positive]: isReceive && usdAmount !== '--',
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

      <div className={styles.externalLinkContainer}>
        <IconButton
          onClick={handleExternalLink}
          Icon={IconLinkExternal1}
          aria-label='View on explorer'
          size={16}
          className={styles.externalLinkButton}
        />
      </div>
    </div>
  );
};
