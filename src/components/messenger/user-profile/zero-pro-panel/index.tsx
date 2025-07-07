import React from 'react';

import { PanelHeader } from '../../list/panel-header';
import { Main } from './stages/Main';
import { Plans } from './stages/Plans';
import { Details } from './stages/Details';
import { Payment } from './stages/Payment';
import { Success } from './stages/Success';
import { Loading } from './stages/Loading';
import { Error } from './stages/Error';
import { Manage } from './stages/Manage';
import { Cancelled } from './stages/Cancelled';
import { BottomSheet } from './bottom-sheet';
import { useZeroPro, ZeroProStage } from './useZeroPro';

import styles from './styles.module.scss';

export const ZeroProPanel: React.FC<{ onClose: () => void; isZeroProSubscriber: boolean }> = ({
  onClose,
  isZeroProSubscriber,
}) => {
  const {
    activeSheet,
    billingDetails,
    pollError,
    isSubscriptionCancelled,
    formattedEndDate,
    openPlan,
    openDetails,
    openManage,
    closeSheet,
    handleBillingDetails,
    handlePaymentNext,
    handleCancelNext,
    handleClose,
  } = useZeroPro(onClose);

  return (
    <div className={styles.ZeroProPanel}>
      <PanelHeader title={''} onBack={handleClose} />

      {/* main stage remains in the background when the bottom sheet is open */}
      <Main
        isZeroProSubscriber={isZeroProSubscriber}
        formattedEndDate={formattedEndDate}
        isSubscriptionCancelled={isSubscriptionCancelled}
        onNext={isZeroProSubscriber ? openManage : openPlan}
        onClose={handleClose}
      />

      {activeSheet && (
        <BottomSheet onClose={closeSheet}>
          {activeSheet === ZeroProStage.PaymentPlan && <Plans onNext={openDetails} />}

          {activeSheet === ZeroProStage.Details && (
            <Details onNext={handleBillingDetails} onBack={openPlan} initialValues={billingDetails} />
          )}

          {activeSheet === ZeroProStage.Payment && (
            <Payment billingDetails={billingDetails} onNext={handlePaymentNext} onBack={openDetails} />
          )}

          {activeSheet === ZeroProStage.Manage && (
            <Manage onNext={handleCancelNext} onClose={closeSheet} formattedEndDate={formattedEndDate} />
          )}

          {activeSheet === ZeroProStage.Loading && <Loading isZeroProSubscriber={isZeroProSubscriber} />}

          {activeSheet === ZeroProStage.Error && <Error error={pollError} />}

          {activeSheet === ZeroProStage.Success && <Success onClose={closeSheet} />}

          {activeSheet === ZeroProStage.Cancelled && <Cancelled onClose={closeSheet} />}
        </BottomSheet>
      )}
    </div>
  );
};
