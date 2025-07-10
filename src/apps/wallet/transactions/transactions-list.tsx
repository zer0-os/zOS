import { useTransactionHistoryQuery } from '../queries/useTransactionHistoryQuery';
import { Transaction } from './transaction';
import { useSelector } from 'react-redux';
import { selectedWalletSelector } from '../../../store/wallet/selectors';
import { Skeleton } from '@zero-tech/zui/components';
import { WalletEmptyState } from '../components/empty-state/wallet-empty-state';

import styles from './transactions-list.module.scss';

const skeletons = Array.from({ length: 10 });

export const TransactionsList = () => {
  const selectedWallet = useSelector(selectedWalletSelector);
  const { data, isPending } = useTransactionHistoryQuery(selectedWallet.address);
  const transactions = data?.transactions ?? [];

  return (
    <div className={styles.transactionsView}>
      {(data || isPending) && (
        <div className={styles.transactionsList}>
          {isPending && skeletons.map((_, index) => <Skeleton key={index} className={styles.transactionSkeleton} />)}

          {transactions.map((transaction) => (
            <Transaction key={transaction.hash} transaction={transaction} />
          ))}
        </div>
      )}

      {transactions.length === 0 && <WalletEmptyState className={styles.emptyState} title='No Transactions' />}
    </div>
  );
};
