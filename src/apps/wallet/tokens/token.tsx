import { TokenBalance } from '../types';
import { TokenIcon } from '../components/token-icon/token-icon';
import { FormattedNumber } from '../components/formatted-number/formatted-number';
import classNames from 'classnames';

import styles from './token.module.scss';

interface TokenProps {
  token: TokenBalance;
  onClick?: () => void;
}

export const Token = ({ token, onClick }: TokenProps) => {
  return (
    <div className={classNames(styles.token, onClick && styles.clickable)} onClick={onClick}>
      <div>
        <TokenIcon url={token.logo} name={token.name} chainId={1417429182} />
      </div>

      <div className={styles.tokenInfo}>
        <div className={styles.tokenName}>{token.name}</div>
        <div className={styles.tokenCount}>
          <FormattedNumber value={token.amount} />
          <span className={styles.tokenSymbol}>{token.symbol}</span>
        </div>
      </div>

      {/* Removing balance until we get pricing data */}
      {/* <div className={styles.tokenAmount}>
        <div>{formatDollars(amount * price)}</div>
        <PercentChange percent={percentChange} />
      </div> */}
    </div>
  );
};
