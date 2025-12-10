import classNames from 'classnames';
import { useHistory } from 'react-router-dom';
import { IconButton } from '@zero-tech/zui/components';
import { IconLinkExternal1 } from '@zero-tech/zui/icons';
import { FormattedNumber } from '../components/formatted-number/formatted-number';
import { TokenIcon } from '../components/token-icon/token-icon';
import { Transaction as TransactionType } from '../types';
import { truncateAddress, truncateTokenId } from '../utils/address';
import { getTransactionTypeLabel } from './utils';
import styles from './transaction.module.scss';

interface TransactionProps {
  transaction: TransactionType;
}

export const Transaction = ({ transaction }: TransactionProps) => {
  const history = useHistory();
  const isReceive = transaction.action === 'receive';

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
          {transaction.tokenId && (
            <span className={styles.tokenId} title={transaction.tokenId}>
              {' '}
              #{truncateTokenId(transaction.tokenId, 20)}
            </span>
          )}
        </div>
      </div>

      <div className={styles.tokenAmount}>
        <div
          className={classNames({
            [styles.positive]: isReceive,
            [styles.negative]: !isReceive,
          })}
        >
          {isReceive ? '+' : '-'}
          <FormattedNumber value={transaction.amount || '1'} />
        </div>
        <div className={styles.transactionType}>{getTransactionTypeLabel(transaction)}</div>
      </div>

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
