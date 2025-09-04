import { formatDollars } from '../../utils/format-numbers';
import { Barcode } from './barcode';
import styles from './zero-card.module.scss';
import zeroLogo from './zero-logo.png';
import zeroWordmark from './zero-wordmark.png';
import { useUserZeroBalance } from '../../hooks/userZeroBalance';

interface ZeroCardProps {
  displayName: string;
}

export const ZeroCard = ({ displayName }: ZeroCardProps) => {
  const { balance } = useUserZeroBalance();

  return (
    <div className={styles.zeroCard}>
      <img src={zeroLogo} alt='Zero Logo' className={styles.zeroCardLogo} />
      <div className={styles.zeroCardHeader}>
        <img src={zeroWordmark} alt='Zero Logo' className={styles.zeroCardWordmark} />
      </div>
      {balance > 0 && (
        <div className={styles.zeroCardBody}>
          <div className={styles.balanceLabel}>Balance</div>
          <div className={styles.balanceValue}>{formatDollars(balance)}</div>
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
