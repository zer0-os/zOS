import React from 'react';

// update
import { TokenData } from '../../../create-channel/lib/hooks/useTokenFinder';

import styles from './styles.module.scss';

interface ReviewStageProps {
  onNext: () => void;
  zid: string;
  tokenData: TokenData | null;
  tokenAmount: string;
}

export const ReviewStage: React.FC<ReviewStageProps> = ({ onNext, zid, tokenData, tokenAmount }) => {
  const zeroId = `0://${zid}`;
  const tokenSymbol = tokenData?.symbol || '';

  return (
    <div className={styles.Container}>
      <div className={styles.Header}>
        <div className={styles.Title}>Review</div>
        <div className={styles.Subtitle}>Review the details before confirming.</div>
      </div>

      <div className={styles.Content}>
        <div className={styles.ZeroId}>{zeroId}</div>

        <div className={styles.InfoText}>
          Users will be able to join the channel if they hold this amount. Existing and new subdomain holders will still
          have access to the channel.
        </div>

        <div className={styles.DetailsBox}>
          <div className={styles.InfoRow}>
            <span className={styles.InfoRowLabel}>Token Gated Joining Fee</span>
            <span className={styles.InfoRowValue}>
              {tokenAmount} {tokenSymbol}
            </span>
          </div>
        </div>
      </div>

      <button className={styles.Button} onClick={onNext}>
        Confirm Update
      </button>
    </div>
  );
};
