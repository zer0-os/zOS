import React from 'react';
import { IconChevronRightDouble } from '@zero-tech/zui/icons';

import styles from './styles.module.scss';

interface ReviewStageProps {
  onNext: () => void;
}

export const ReviewStage: React.FC<ReviewStageProps> = ({ onNext }) => {
  // Mock data
  const token = {
    name: 'holypaws',
    symbol: 'HPAW',
    image: 'https://placekitten.com/100/100',
    price: '$0.69',
    meowAmount: '7,200',
    meowValue: '$1,700.20',
  };
  const zeroId = '0://holykats';

  return (
    <div className={styles.Container}>
      <div className={styles.Title}>Review and Pay</div>
      <div className={styles.Subtitle}>
        Review the details before confirming. Once paid, your transaction is irreversible.
      </div>

      <div className={styles.ProfileSection}>
        <div className={styles.ZeroId}>{zeroId}</div>
      </div>

      <div className={styles.DetailsBox}>
        <div className={styles.InfoRow}>
          <div>
            <div className={styles.InfoRowLabel}>{token.meowAmount} MEOW</div>
            <div className={styles.InfoRowValue}>~{token.meowValue}</div>
          </div>

          <IconChevronRightDouble className={styles.ArrowIcon} size={20} />

          <div>
            <div className={styles.InfoRowLabel}>ZERO ID</div>
            <div className={styles.InfoRowValue}>{zeroId}</div>
          </div>
        </div>
      </div>

      <div className={styles.DetailsBox}>
        <div className={styles.InfoRow}>
          <span className={styles.InfoRowLabel}>Ticker</span>
          <span className={styles.InfoRowValue}>{token.symbol}</span>
        </div>

        <div className={styles.InfoRow}>
          <span className={styles.InfoRowLabel}>Total Est. Cost</span>
          <span className={styles.InfoRowValue}>{token.meowValue}</span>
        </div>

        <div className={styles.InfoRow}>
          <span className={styles.InfoRowLabel}>Total Fees</span>
          <span className={styles.InfoRowValue}>$0.20</span>
        </div>

        <div className={styles.InfoRow}>
          <span className={styles.InfoRowLabel}>Est. Time</span>
          <span className={styles.InfoRowValue}>5 secs</span>
        </div>
      </div>

      <div className={styles.InfoText}>By paying, you accept the Terms and Conditions</div>

      <button className={styles.ContinueButton} onClick={onNext}>
        Pay {token.meowAmount} MEOW
      </button>
    </div>
  );
};
