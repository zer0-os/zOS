import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@zero-tech/zui/components';
import { IconCheck, IconXClose } from '@zero-tech/zui/icons';
import { useZidAvailability } from '../../hooks/useZidAvailability';
import styles from './styles.module.scss';

interface CreateZidStageProps {
  onNext: () => void;
  onZidChange?: (zid: string) => void;
}

export const CreateZidStage: React.FC<CreateZidStageProps> = ({ onNext, onZidChange }) => {
  const [zid, setZid] = useState('');
  const [fee, setFee] = useState('2500');
  const inputRef = useRef<HTMLInputElement>(null);

  const isValid = zid.length > 0 && /^[a-z0-9-]+$/.test(zid);
  const { data: available, isLoading, error } = useZidAvailability(isValid ? zid : '');

  useEffect(() => {
    if (onZidChange) onZidChange(zid);
  }, [zid, onZidChange]);

  // Keep input focused after availability check or error
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [available, isLoading, error]);

  let endEnhancer = undefined;
  if (isLoading) {
    endEnhancer = <div className={styles.Spinner} />;
  } else if (available) {
    endEnhancer = <IconCheck className={styles.Success} size={20} />;
  } else if (available === false) {
    endEnhancer = <IconXClose className={styles.Failure} size={20} />;
  }

  let availabilityText = null;
  if (isLoading) {
    availabilityText = 'Checking Availability';
  } else if (available) {
    availabilityText = <span className={styles.Success}>Available for 5,000 MEOW</span>;
  } else if (available === false) {
    availabilityText = <span className={styles.Failure}>Not available</span>;
  } else if (error) {
    availabilityText = <span className={styles.Failure}>{String(error)}</span>;
  }

  let buttonText = 'Enter a valid ZERO ID to continue';
  let buttonDisabled = !isValid || isLoading || available === false;
  if (available) {
    buttonText = 'Buy ZERO ID for $250';
    buttonDisabled = false;
  } else if (available === false) {
    buttonDisabled = true;
  }

  const handleContinue = () => {
    if (available) {
      onNext();
    }
  };

  return (
    <div className={styles.Container}>
      <div className={styles.Title}>Claim Your ZERO ID</div>
      <div className={styles.Subtitle}>Choose your unique ZERO ID and set a joining fee to gate access.</div>
      <div className={styles.Form}>
        <label className={styles.InputContainer}>
          <div className={styles.LabelWrapper}>
            ZERO ID
            <span>{availabilityText}</span>
          </div>
          <Input
            ref={inputRef}
            label=''
            value={zid}
            onChange={setZid}
            startEnhancer={<div className={styles.Enhancer}>0://</div>}
            endEnhancer={endEnhancer}
            className={styles.Input}
            isDisabled={isLoading}
          />
          <div className={styles.InfoText}>Lowercase (a-z), numbers (0-9), and hyphens (-) only.</div>
        </label>

        <label className={styles.InputContainer}>
          Set Joining Fees
          <Input
            value={fee}
            onChange={setFee}
            className={styles.Input}
            endEnhancer={<div className={styles.Enhancer}>MEOW</div>}
            isDisabled={isLoading}
            type='number'
          />
          <div className={styles.InfoText}>A recommended value is already filled in.</div>
        </label>

        <button className={styles.ContinueButton} onClick={handleContinue} disabled={buttonDisabled}>
          {buttonText}
        </button>
      </div>
    </div>
  );
};
