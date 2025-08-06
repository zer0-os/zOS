import React, { useRef, useState, useMemo, useCallback } from 'react';
import { Input } from '@zero-tech/zui/components';
import { IconCheck, IconXClose } from '@zero-tech/zui/icons';
import { useDebounce } from '../../../../../../lib/hooks/useDebounce';
import { useZidAvailability } from '../../lib/hooks/useZidAvailability';
import { useZidPrice } from '../../lib/hooks/useZidPrice';
import { ethers } from 'ethers';
import { parsePrice } from '../../lib/utils';
import { TokenData } from '../../lib/hooks/useTokenFinder';

import styles from './styles.module.scss';

interface CreateZidStageProps {
  onNext: (zid: string, priceData: any, joiningFee: string) => void;
  mainnetProvider: ethers.providers.Provider;
  tokenData: TokenData | null;
}

export const CreateZidStage: React.FC<CreateZidStageProps> = ({ onNext, mainnetProvider, tokenData }) => {
  const [zid, setZid] = useState('');
  const [fee, setFee] = useState('2500');
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedZid = useDebounce(zid, 400);

  const {
    data: available,
    isLoading: isAvailabilityLoading,
    error: availabilityError,
  } = useZidAvailability(debouncedZid);

  const {
    data: priceData,
    isLoading: isPriceLoading,
    error: priceError,
  } = useZidPrice(debouncedZid, mainnetProvider, available === true);

  const isLoading = isAvailabilityLoading || isPriceLoading;
  const hasError = !!(availabilityError || priceError);

  const buttonConfig = useMemo(() => {
    if (available && !isLoading && Number(fee) > 0) {
      return { text: 'Continue', disabled: false };
    }
    return { text: 'Enter a valid ZERO ID to continue', disabled: true };
  }, [available, isLoading, fee]);

  const endEnhancer = useMemo(() => {
    if (isLoading) return <div className={styles.Spinner} />;
    if (hasError) return undefined;
    if (available) {
      return <IconCheck className={styles.Success} size={20} />;
    }
    if (available === false) {
      return <IconXClose className={styles.Failure} size={20} />;
    }
    return undefined;
  }, [
    isLoading,
    hasError,
    available,
  ]);

  const tokenTicker = tokenData?.symbol || '';

  const availabilityText = useMemo(() => {
    if (isLoading) return <span>Checking availability…</span>;
    if (hasError) return <span className={styles.Failure}>{String(availabilityError || priceError)}</span>;
    if (available) {
      const displayPrice = parsePrice(priceData?.total);
      return <span className={styles.Success}>Available for {displayPrice} MEOW</span>;
    }
    if (available === false) {
      return <span className={styles.Failure}>Not available</span>;
    }
    return null;
  }, [
    isLoading,
    hasError,
    availabilityError,
    priceError,
    available,
    priceData,
  ]);

  const handleContinue = useCallback(() => {
    if (available && !isLoading) {
      onNext(zid, priceData, fee);
    }
  }, [
    available,
    isLoading,
    onNext,
    zid,
    priceData,
    fee,
  ]);

  const handleZidChange = useCallback((value: string) => {
    setZid(value);
  }, []);

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
            onChange={handleZidChange}
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
            endEnhancer={<div className={styles.Enhancer}>{tokenTicker}</div>}
            isDisabled={isLoading}
            type='number'
          />
          <div className={styles.InfoText}>A recommended value is already filled in.</div>
        </label>

        <button className={styles.ContinueButton} onClick={handleContinue} disabled={buttonConfig.disabled}>
          {buttonConfig.text}
        </button>
      </div>
    </div>
  );
};
