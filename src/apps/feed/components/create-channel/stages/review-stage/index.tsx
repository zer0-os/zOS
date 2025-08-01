import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { IconChevronRightDouble } from '@zero-tech/zui/icons';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';
import { calculateTotalPriceInUSDCents, formatUSD } from '../../../../../../lib/number';
import { parsePrice } from '../../lib/utils';
import { meowInUSDSelector } from '../../../../../../store/rewards/selectors';
import { usePurchaseZid } from './hooks/usePurchaseZid';
import { parsePurchaseError } from './utils';
import { TokenData } from '../../lib/hooks/useTokenFinder';

import styles from './styles.module.scss';

interface ReviewStageProps {
  onNext: () => void;
  selectedZid: string;
  priceData: any;
  joiningFee: string;
  tokenData: TokenData | null;
  mainnetProvider: ethers.providers.Provider;
}

export const ReviewStage: React.FC<ReviewStageProps> = ({
  onNext,
  selectedZid,
  priceData,
  joiningFee,
  tokenData,
  mainnetProvider,
}) => {
  const meowPriceUSD = useSelector(meowInUSDSelector);

  // RainbowKit/Wagmi wallet integration
  const { address: account } = useAccount();

  const signer = useCallback(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
      return ethersProvider.getSigner();
    }
    return undefined;
  }, [])();

  const purchaseZid = usePurchaseZid();
  const isPurchasing = purchaseZid.isPending;
  const purchaseError = purchaseZid.error;

  // Calculate USD value
  const usdText =
    priceData?.total && meowPriceUSD
      ? formatUSD(calculateTotalPriceInUSDCents(priceData.total.toString(), meowPriceUSD))
      : '';

  const meowAmount = priceData?.total ? parsePrice(priceData.total) : '0';
  const zeroId = `0://${selectedZid}`;
  const tokenSymbol = tokenData?.symbol || '';

  const handlePurchase = useCallback(async () => {
    if (!account || !signer || !mainnetProvider) return;

    await purchaseZid.mutateAsync({ zna: selectedZid, account, signer, provider: mainnetProvider });
    onNext();
  }, [
    account,
    signer,
    mainnetProvider,
    selectedZid,
    purchaseZid,
    onNext,
  ]);

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
            <div className={styles.InfoRowLabel}>{meowAmount} MEOW</div>
            <div className={styles.InfoRowValue}>~{usdText}</div>
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
          <span className={styles.InfoRowLabel}>Channel Joining Fee</span>
          <span className={styles.InfoRowValue}>
            {joiningFee} {tokenSymbol}
          </span>
        </div>

        <div className={styles.InfoRow}>
          <span className={styles.InfoRowLabel}>Total Est. Cost</span>
          <span className={styles.InfoRowValue}>{usdText}</span>
        </div>

        <div className={styles.InfoRow}>
          <span className={styles.InfoRowLabel}>Est. Time</span>
          <span className={styles.InfoRowValue}>5 secs</span>
        </div>
      </div>

      <div className={styles.InfoText}>By paying, you accept the Terms and Conditions</div>

      <button className={styles.ContinueButton} onClick={handlePurchase} disabled={isPurchasing || !account || !signer}>
        {isPurchasing ? 'Purchasing...' : !account ? 'Connect wallet to purchase' : `Pay ${meowAmount} MEOW`}
      </button>

      <div className={styles.InfoContainer}>
        {isPurchasing && <div className={styles.Success}>Please confirm the transactions in your wallet</div>}

        {purchaseError && <div className={styles.Failure}>Purchase failed: {parsePurchaseError(purchaseError)}</div>}
      </div>
    </div>
  );
};
