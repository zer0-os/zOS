import React, { useState, useEffect } from 'react';
import { Input } from '@zero-tech/zui/components';
import { IconCheck, IconXClose } from '@zero-tech/zui/icons';
import styles from './styles.module.scss';

interface CreateZidStageProps {
  onNext: () => void;
}

type Availability = 'unknown' | 'available' | 'unavailable';

export const CreateZidStage: React.FC<CreateZidStageProps> = ({ onNext }) => {
  const [zid, setZid] = useState('');
  const [fee, setFee] = useState('2500');
  const [checking, setChecking] = useState(false);
  const [availability, setAvailability] = useState<Availability>('unknown');

  const isValid = zid.length > 0 && /^[a-z0-9-]+$/.test(zid);

  useEffect(() => {
    if (availability !== 'unknown') {
      setAvailability('unknown');
      setChecking(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zid]);

  const handleContinue = () => {
    if (availability === 'available') {
      onNext();
      return;
    }
    setChecking(true);
    setAvailability('unknown');
    setTimeout(() => {
      // Simulate random availability
      const available = Math.random() > 0.5;
      setChecking(false);
      setAvailability(available ? 'available' : 'unavailable');
    }, 2000);
  };

  let endEnhancer = undefined;
  if (checking) {
    endEnhancer = <div className={styles.Spinner} />;
  } else if (availability === 'available') {
    endEnhancer = <IconCheck className={styles.Success} size={20} />;
  } else if (availability === 'unavailable') {
    endEnhancer = <IconXClose className={styles.Failure} size={20} />;
  }

  let availabilityText = null;
  if (checking) {
    availabilityText = 'Checking Availability';
  } else if (availability === 'available') {
    availabilityText = <span className={styles.Success}>Available for 5,000 MEOW</span>;
  } else if (availability === 'unavailable') {
    availabilityText = <span className={styles.Failure}>Not available</span>;
  }

  let buttonText = 'Enter a valid ZERO ID to continue';
  let buttonDisabled = !isValid || checking || availability === 'unavailable';
  if (availability === 'available') {
    buttonText = 'Buy ZERO ID for $250';
    buttonDisabled = false;
  } else if (availability === 'unavailable') {
    buttonDisabled = true;
  }

  return (
    <div className={styles.Container}>
      <div className={styles.Title}>Claim Your ZERO ID</div>
      <div className={styles.Subtitle}>Choose your unique ZERO ID and set a joining fee to gate access.</div>
      <div className={styles.Form}>
        <label className={styles.InputContainer}>
          <div className={styles.LabelWrapper}>
            ZERO ID
            <span className={styles.AvailabilityText}>{availabilityText}</span>
          </div>
          <Input
            label=''
            value={zid}
            onChange={setZid}
            startEnhancer={<div className={styles.Enhancer}>0://</div>}
            endEnhancer={endEnhancer}
            className={styles.Input}
            isDisabled={checking}
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
            isDisabled={checking}
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
