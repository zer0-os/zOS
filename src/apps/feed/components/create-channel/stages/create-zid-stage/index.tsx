import React, { useRef, useState, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Input } from '@zero-tech/zui/components';
import { IconCheck, IconXClose } from '@zero-tech/zui/icons';
import { useDebounce } from '../../../../../../lib/hooks/useDebounce';
import { useZidAvailability } from '../../lib/hooks/useZidAvailability';
import { useZidPrice } from '../../lib/hooks/useZidPrice';
import { usePurchaseZid } from '../../lib/usePurchaseZid';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { calculateTotalPriceInUSDCents, formatUSD } from '../../../../../../lib/number';
import { parsePrice } from '../../lib/utils';
import { meowInUSDSelector } from '../../../../../../store/rewards/selectors';

import styles from './styles.module.scss';

interface CreateZidStageProps {
  onNext: () => void;
  mainnetProvider: ethers.providers.Provider;
}

export const CreateZidStage: React.FC<CreateZidStageProps> = ({ onNext, mainnetProvider }) => {
  const [zid, setZid] = useState('');
  const [fee, setFee] = useState('2500');
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedZid = useDebounce(zid, 400);
  const meowPriceUSD = useSelector(meowInUSDSelector);

  // RainbowKit/Wagmi wallet integration
  const { address: account } = useAccount();
  const signer = useMemo(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
      return ethersProvider.getSigner();
    }
    return undefined;
  }, []);
  const provider = mainnetProvider;

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

  const usdText = useMemo(() => {
    if (!priceData?.total || !meowPriceUSD) return '';
    const cents = calculateTotalPriceInUSDCents(priceData.total.toString(), meowPriceUSD);
    return formatUSD(cents);
  }, [priceData, meowPriceUSD]);

  const buttonConfig = useMemo(() => {
    if (available && !isLoading) {
      return { text: usdText ? `Buy ZERO ID for ${usdText}` : 'Buy ZERO ID', disabled: false };
    }
    return { text: 'Enter a valid ZERO ID to continue', disabled: true };
  }, [available, usdText, isLoading]);

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

  // --- Purchase logic ---
  const purchaseZid = usePurchaseZid();

  const handlePurchase = useCallback(async () => {
    if (!available || !account || !signer || !provider) return;
    try {
      await purchaseZid.mutateAsync({ zna: zid, account, signer, provider });
      onNext();
    } catch (error) {
      // TODO: handle error (show toast, etc)
      // eslint-disable-next-line no-console
      console.error('Purchase failed:', error);
    }
  }, [
    available,
    account,
    signer,
    provider,
    zid,
    purchaseZid,
    onNext,
  ]);

  const handleZidChange = useCallback((value: string) => {
    setZid(value);
  }, []);

  const isPurchasing = purchaseZid.isPending;

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
            isDisabled={isLoading || isPurchasing}
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
            isDisabled={isLoading || isPurchasing}
            type='number'
          />
          <div className={styles.InfoText}>A recommended value is already filled in.</div>
        </label>

        <button
          className={styles.ContinueButton}
          onClick={handlePurchase}
          disabled={buttonConfig.disabled || isPurchasing || !account || !signer}
        >
          {isPurchasing ? 'Purchasing...' : buttonConfig.text}
        </button>
      </div>
    </div>
  );
};
