import React from 'react';
import { PanelBody } from '../../../../components/layout/panel';
import { Button, Variant as ButtonVariant } from '@zero-tech/zui/components/Button';
import { IconCheck } from '@zero-tech/zui/icons';
import { ZBancToken } from '../utils';

import styles from './styles.module.scss';

interface TradingSuccessProps {
  token: ZBancToken;
  tradeType: 'buy' | 'sell';
  onBackToTokens: () => void;
}

export const TradingSuccess = ({ token, tradeType, onBackToTokens }: TradingSuccessProps) => {
  const handleBackToTokens = () => {
    onBackToTokens();
  };

  return (
    <PanelBody className={styles.TradingSuccess}>
      <div className={styles.Container}>
        <div className={styles.SuccessIcon}>
          <IconCheck size={64} />
        </div>

        <div className={styles.SuccessTitle}>{tradeType === 'buy' ? 'Purchase Successful!' : 'Sale Successful!'}</div>

        <div className={styles.SuccessSubtitle}>
          Your {tradeType === 'buy' ? 'purchase' : 'sale'} of {token.symbol} has been completed successfully.
        </div>

        <div className={styles.Actions}>
          <Button variant={ButtonVariant.Primary} onPress={handleBackToTokens} className={styles.BackButton}>
            Back to Tokens
          </Button>
        </div>
      </div>
    </PanelBody>
  );
};
