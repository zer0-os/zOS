import { useTransactionHistoryQuery } from '../queries/useTransactionHistoryQuery';
import { Transaction } from './transaction';
import { useSelector } from 'react-redux';
import { selectedWalletSelector } from '../../../store/wallet/selectors';

import styles from './transactions-list.module.scss';

export const TransactionsList = () => {
  const selectedWallet = useSelector(selectedWalletSelector);
  const { data } = useTransactionHistoryQuery(selectedWallet.address);

  if (!data) {
    return <div>No transactions found</div>;
  }

  return (
    <div className={styles.transactionsList}>
      {data.transactions.map((transaction) => (
        <Transaction key={transaction.hash} transaction={transaction} />
      ))}
    </div>
  );
};
