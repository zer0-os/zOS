import { useBalancesQuery } from '../queries/useBalancesQuery';
import { Token } from './token';
import { useSelector } from 'react-redux';
import { selectedWalletSelector } from '../../../store/wallet/selectors';

import styles from './tokens-list.module.scss';

export const TokensList = () => {
  const selectedWallet = useSelector(selectedWalletSelector);
  const { data, isPending } = useBalancesQuery(selectedWallet.address);
  const tokens = data?.tokens;

  if (isPending) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.tokensList}>
      {tokens?.map((token) => (
        <Token key={token.tokenAddress} token={token} />
      ))}
    </div>
  );
};
