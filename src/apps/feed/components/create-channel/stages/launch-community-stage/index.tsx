import React from 'react';

import styles from './styles.module.scss';

interface LaunchCommunityStageProps {
  onNext: () => void;
}

export const LaunchCommunityStage: React.FC<LaunchCommunityStageProps> = ({ onNext }) => {
  return (
    <div className={styles.ModalContent}>
      <div className={styles.Title}>Launch a Token-Powered Community</div>
      <div className={styles.Subtitle}>Select a token-gating mode that fits your community.</div>
      <div className={styles.OptionsList}>
        <button className={styles.OptionButton} onClick={onNext}>
          <div>Use an existing token</div>
          <div className={styles.Subtitle}>
            Already have a token running on another blockchain? Select this to gate access with it.
          </div>
        </button>
        <button className={styles.OptionButton} disabled>
          <div>Create a new token</div>
          <div className={styles.Subtitle}>
            Launch a new token built right into Z Chain. This is ideal for creating a fresh community.
          </div>
        </button>

        <button className={styles.OptionButton} disabled>
          <div>Use an existing ZERO ID</div>
          <div className={styles.Subtitle}>
            Strengthen your existing community by adding token-gated access to your ZERO ID.
          </div>
        </button>
      </div>
    </div>
  );
};
