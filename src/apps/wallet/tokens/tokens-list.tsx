import { useBalancesQuery } from '../queries/useBalancesQuery';
import { Token } from './token';
import { useSelector } from 'react-redux';
import { selectedWalletSelector } from '../../../store/wallet/selectors';
import { TokenSkeleton } from './token-skeleton';
import { WalletEmptyState } from '../components/empty-state/wallet-empty-state';

import styles from './tokens-list.module.scss';

const skeletons = Array.from({ length: 13 });

export const TokensList = () => {
  const selectedWallet = useSelector(selectedWalletSelector);
  const { data, isPending } = useBalancesQuery(selectedWallet.address);
  const tokens = data?.tokens ?? [];

  return (
    <div className={styles.tokensView}>
      {(data || isPending) && (
        <div className={styles.tokensList}>
          {isPending && skeletons.map((_, index) => <TokenSkeleton key={index} />)}

          {tokens.map((token) => (
            <Token key={token.tokenAddress} token={token} />
          ))}
        </div>
      )}

      {tokens.length === 0 && !isPending && <WalletEmptyState className={styles.emptyState} title='No Tokens' />}
    </div>
  );
};
