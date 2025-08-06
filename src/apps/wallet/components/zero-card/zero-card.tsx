import { formatDollars } from '../../utils/format-numbers';
import { Barcode } from './barcode';
import styles from './zero-card.module.scss';
import zeroLogo from './zero-logo.png';
import zeroWordmark from './zero-wordmark.png';
import { useSelector } from 'react-redux';
import { selectedWalletSelector } from '../../../../store/wallet/selectors';
import { useBalancesQuery } from '../../queries/useBalancesQuery';
import { MEOW_TOKEN_ADDRESS, VMEOW_TOKEN_ADDRESS } from '../../constants';

interface ZeroCardProps {
  displayName: string;
}

export const ZeroCard = ({ displayName }: ZeroCardProps) => {
  const selectedWallet = useSelector(selectedWalletSelector);
  const { data } = useBalancesQuery(selectedWallet.address);
  const meowToken = data?.tokens?.find((token) => token.tokenAddress === MEOW_TOKEN_ADDRESS);
  const vmeowToken = data?.tokens?.find((token) => token.tokenAddress === VMEOW_TOKEN_ADDRESS);
  const price = meowToken?.price ?? vmeowToken?.price;
  const totalAmount = Number(meowToken?.amount ?? 0) + Number(vmeowToken?.amount ?? 0);

  return (
    <div className={styles.zeroCard}>
      <img src={zeroLogo} alt='Zero Logo' className={styles.zeroCardLogo} />
      <div className={styles.zeroCardHeader}>
        <img src={zeroWordmark} alt='Zero Logo' className={styles.zeroCardWordmark} />
      </div>
      {price && totalAmount > 0 && (
        <div className={styles.zeroCardBody}>
          <div className={styles.balanceLabel}>Balance</div>
          <div className={styles.balanceValue}>{formatDollars(price * totalAmount)}</div>
          {/* <PercentChange percent={null} /> */}
        </div>
      )}

      <div className={styles.zeroCardFooter}>
        <span className={styles.displayName}>{displayName}</span>
        <Barcode />
      </div>
    </div>
  );
};
