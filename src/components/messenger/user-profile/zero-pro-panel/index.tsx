import React, { useState, useCallback } from 'react';

import { PanelHeader } from '../../list/panel-header';
import { Main } from './stages/Main';
import { Plans } from './stages/Plans';
import { Details } from './stages/Details';
import { Payment } from './stages/Payment';
import { Success } from './stages/Success';
import { Loading } from './stages/Loading';
import { Error } from './stages/Error';
import { BottomSheet } from './bottom-sheet';
import styles from './styles.module.scss';
import { usePollZeroProActiveStatus } from './usePollZeroProActiveStatus';

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
          {activeSheet === ZeroProStage.Loading && <Loading />}
          {activeSheet === ZeroProStage.Error && <Error error={pollError} />}
          {activeSheet === ZeroProStage.Success && <Success onClose={closeSheet} />}
        </BottomSheet>
      )}
    </div>
  );
};
