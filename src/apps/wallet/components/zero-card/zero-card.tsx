import { Barcode } from './barcode';
import styles from './zero-card.module.scss';
import zeroLogo from './zero-logo.png';
import zeroWordmark from './zero-wordmark.png';

interface ZeroCardProps {
  displayName: string;
}

export const ZeroCard = ({ displayName }: ZeroCardProps) => {
  return (
    <div className={styles.zeroCard}>
      <img src={zeroLogo} alt='Zero Logo' className={styles.zeroCardLogo} />
      <div className={styles.zeroCardHeader}>
        <img src={zeroWordmark} alt='Zero Logo' className={styles.zeroCardWordmark} />
      </div>
      {/* Removing balance until we get pricing data */}
      {/* <div className={styles.zeroCardBody}>
        <div className={styles.balanceLabel}>Balance</div>
        <div className={styles.balanceValue}>{formatDollars(balance)}</div>
        <PercentChange percent={balanceChange} />
      </div> */}

      <div className={styles.zeroCardFooter}>
        <span className={styles.displayName}>{displayName}</span>
        <Barcode />
      </div>
    </div>
  );
};
