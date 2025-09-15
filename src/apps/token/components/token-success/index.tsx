import React from 'react';
import { PanelBody } from '../../../../components/layout/panel';
import { Button, Variant as ButtonVariant } from '@zero-tech/zui/components/Button';
import { IconCheck } from '@zero-tech/zui/icons';

import styles from './styles.module.scss';

interface TokenSuccessProps {
  tokenAddress: string;
  onViewToken: () => void;
  onBackToTokens: () => void;
}

export const TokenSuccess = ({ tokenAddress, onViewToken, onBackToTokens }: TokenSuccessProps) => {
  const handleViewToken = () => {
    onViewToken();
  };

  const handleBackToTokens = () => {
    onBackToTokens();
  };

  return (
    <PanelBody className={styles.TokenSuccess}>
      <div className={styles.Container}>
        <div className={styles.SuccessIcon}>
          <IconCheck size={64} />
        </div>

        <div className={styles.SuccessTitle}>Token Launched Successfully!</div>

        <div className={styles.SuccessSubtitle}>Your ZBanc token has been created and is now live on Z Chain.</div>

        <div className={styles.TokenInfo}>
          <div className={styles.TokenInfoRow}>
            <span className={styles.TokenInfoLabel}>Token Address:</span>
            <span className={styles.TokenInfoValue}>{tokenAddress}</span>
          </div>
        </div>

        <div className={styles.Actions}>
          <Button variant={ButtonVariant.Secondary} onPress={handleBackToTokens} className={styles.BackButton}>
            Back to Tokens
          </Button>
          <Button variant={ButtonVariant.Primary} onPress={handleViewToken} className={styles.ViewTokenButton}>
            View Token
          </Button>
        </div>
      </div>
    </PanelBody>
  );
};
