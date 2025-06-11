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

  const openPlan = useCallback(() => setActiveSheet(ZeroProStage.PaymentPlan), []);
  const openDetails = useCallback(() => setActiveSheet(ZeroProStage.Details), []);
  const openPayment = useCallback(() => setActiveSheet(ZeroProStage.Payment), []);
  const openSuccess = useCallback(() => setActiveSheet(ZeroProStage.Success), []);
  const closeSheet = useCallback(() => setActiveSheet(null), []);

  // Callback to receive details from Details stage and open payment
  const handleBillingDetails = useCallback(
    (details: BillingDetails) => {
      setBillingDetails(details);
      openPayment();
    },
    [openPayment]
  );

  return (
    <div className={styles.ZeroProPanel}>
      <PanelHeader title={''} onBack={onClose} />

      {/* main stage remains in the background when the bottom sheet is open */}
      <Main onNext={openPlan} />

      {activeSheet && (
        <BottomSheet onClose={closeSheet}>
          {activeSheet === ZeroProStage.PaymentPlan && <Plans onNext={openDetails} />}
          {activeSheet === ZeroProStage.Details && <Details onNext={handleBillingDetails} onBack={openPlan} />}
          {activeSheet === ZeroProStage.Payment && (
            <Payment billingDetails={billingDetails} onNext={openSuccess} onBack={openDetails} />
          )}
          {activeSheet === ZeroProStage.Success && <Success onClose={closeSheet} />}
        </BottomSheet>
      )}
    </div>
  );
};
