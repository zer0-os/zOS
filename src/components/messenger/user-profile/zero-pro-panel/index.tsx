import React, { useState, useCallback } from 'react';

import { PanelHeader } from '../../list/panel-header';
import { Main } from './stages/Main';
import { Plans } from './stages/Plans';
import { Details } from './stages/Details';
import { Payment } from './stages/Payment';
import { Success } from './stages/Success';
import { BottomSheet } from './bottom-sheet';
import styles from './styles.module.scss';

export enum ZeroProStage {
  PaymentPlan = 'payment-plan',
  Details = 'details',
  Payment = 'payment',
  Success = 'success',
  Loading = 'loading',
  Error = 'error',
}

export type ZeroProSheet = ZeroProStage | null;

export interface BillingDetails {
  name: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

// Polling hook for subscription status
function usePollZeroProActiveStatus(
  shouldPoll: boolean,
  onActive: () => void,
  onTimeout: () => void,
  timeoutMs = 20000
) {
  React.useEffect(() => {
    if (!shouldPoll) return;
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    let start = Date.now();
    async function poll() {
      while (isMounted) {
        const res = await fetch('/subscription/status?type=ZERO');
        const data = await res.json();
        const status = data.subscription?.status ?? data.status;
        if (status === 'active') {
          onActive();
          return;
        }
        if (Date.now() - start > timeoutMs) {
          onTimeout();
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
    poll();
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [
    shouldPoll,
    onActive,
    onTimeout,
    timeoutMs,
  ]);
}

export const ZeroProPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeSheet, setActiveSheet] = useState<ZeroProSheet>(null);
  const [billingDetails, setBillingDetails] = useState<BillingDetails | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [pollError, setPollError] = useState<string | null>(null);

  const openPlan = useCallback(() => setActiveSheet(ZeroProStage.PaymentPlan), []);
  const openDetails = useCallback(() => setActiveSheet(ZeroProStage.Details), []);
  const openPayment = useCallback(() => setActiveSheet(ZeroProStage.Payment), []);
  const closeSheet = useCallback(() => setActiveSheet(null), []);

  // Callback to receive details from Details stage and open payment
  const handleBillingDetails = useCallback(
    (details: BillingDetails) => {
      setBillingDetails(details);
      openPayment();
    },
    [openPayment]
  );

  // After payment, start polling for active status
  const handlePaymentNext = useCallback(() => {
    setIsPolling(true);
    setPollError(null);
    setActiveSheet(ZeroProStage.Loading);
  }, []);

  usePollZeroProActiveStatus(
    isPolling,
    () => {
      setIsPolling(false);
      setActiveSheet(ZeroProStage.Success);
    },
    () => {
      setIsPolling(false);
      setPollError('Subscription activation timed out. Please contact support or try again.');
      setActiveSheet(ZeroProStage.Error);
    }
  );

  return (
    <div className={styles.ZeroProPanel}>
      <PanelHeader title={''} onBack={onClose} />

      {/* main stage remains in the background when the bottom sheet is open */}
      <Main onNext={openPlan} />

      {activeSheet && (
        <BottomSheet onClose={closeSheet}>
          {activeSheet === ZeroProStage.PaymentPlan && <Plans onNext={openDetails} />}
          {activeSheet === ZeroProStage.Details && (
            <Details onNext={handleBillingDetails} onBack={openPlan} initialValues={billingDetails} />
          )}
          {activeSheet === ZeroProStage.Payment && (
            <Payment billingDetails={billingDetails} onNext={handlePaymentNext} onBack={openDetails} />
          )}
          {activeSheet === ZeroProStage.Loading && (
            <div className={styles.LoadingContainer}>
              <div className={styles.Spinner} />
              <div className={styles.LoadingText}>Activating your subscription...</div>
            </div>
          )}
          {activeSheet === ZeroProStage.Error && (
            <div className={styles.ErrorContainer}>
              <div className={styles.ErrorText}>{pollError}</div>
            </div>
          )}
          {activeSheet === ZeroProStage.Success && <Success onClose={closeSheet} />}
        </BottomSheet>
      )}
    </div>
  );
};
