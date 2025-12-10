import { useTransactionHistoryQuery } from '../queries/useTransactionHistoryQuery';
import { Transaction } from './transaction';
import { useSelector } from 'react-redux';
import { selectedWalletSelector } from '../../../store/wallet/selectors';
import { WalletEmptyState } from '../components/empty-state/wallet-empty-state';
import { TransactionSkeleton } from './transaction-skeleton';

import styles from './transactions-list.module.scss';

const skeletons = Array.from({ length: 11 });

export const TransactionsList = () => {
  const selectedWallet = useSelector(selectedWalletSelector);
  const { data, isPending } = useTransactionHistoryQuery(selectedWallet.address);
  const transactions = data?.transactions ?? [];

  return (
    <div className={styles.transactionsView}>
      {(data || isPending) && (
        <div className={styles.transactionsList}>
          {isPending && skeletons.map((_, index) => <TransactionSkeleton key={index} />)}

          {transactions.map((transaction) => (
            <Transaction key={`${transaction.hash}-${transaction.action}`} transaction={transaction} />
          ))}
        </div>
      )}

      {transactions.length === 0 && !isPending && (
        <WalletEmptyState className={styles.emptyState} title='No Transactions' />
      )}
    </div>
  );
};
