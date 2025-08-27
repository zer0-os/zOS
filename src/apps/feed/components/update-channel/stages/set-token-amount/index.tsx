import React, { useState } from 'react';
import { Input } from '@zero-tech/zui/components';
import { TokenData } from '../../../create-channel/lib/hooks/useTokenFinder';

import styles from './styles.module.scss';

interface SetTokenAmountStageProps {
  onNext: (amount: string) => void;
  tokenData: TokenData | null;
}

export const SetTokenAmountStage: React.FC<SetTokenAmountStageProps> = ({ onNext, tokenData }) => {
  const [amount, setAmount] = useState('2500');

  const tokenTicker = tokenData?.symbol || '';

  const handleContinue = () => {
    if (Number(amount) > 0) {
      onNext(amount);
    }
  };

  const isFormValid = Number(amount) > 0;

  return (
    <div className={styles.Container}>
      <div className={styles.Title}>Set Token Amount</div>
      <div className={styles.Subtitle}>Choose how much {tokenTicker} users need to hold to join your channel.</div>

      <div className={styles.Form}>
        <label className={styles.InputContainer}>
          Required Token Amount
          <Input
            value={amount}
            onChange={setAmount}
            className={styles.Input}
            endEnhancer={<div className={styles.Enhancer}>{tokenTicker}</div>}
            isDisabled={!setAmount}
            type='number'
          />
          <div className={styles.InfoText}>
            Users must hold at least this amount of {tokenTicker} to join your channel.
          </div>
        </label>

        <button className={styles.ContinueButton} onClick={handleContinue} disabled={!isFormValid}>
          Continue
        </button>
      </div>
    </div>
  );
};
