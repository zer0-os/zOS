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
    openPlan,
    openDetails,
    openManage,
    closeSheet,
    handleBillingDetails,
    handlePaymentNext,
    handleCancelNext,
    loadingTitle,
    loadingMessage,
    successSubtitle,
    formattedEndDate,
    isSubscriptionCancelled,
  } = useZeroPro(isZeroProSubscriber);

  const handleClose = () => {
    onClose();
  };

  return (
    <div className={styles.ZeroProPanel}>
      <PanelHeader title={''} onBack={handleClose} />

      {/* main stage remains in the background when the bottom sheet is open */}
      <Main
        isZeroProSubscriber={isZeroProSubscriber}
        onNext={openPlan}
        onManage={openManage}
        formattedEndDate={formattedEndDate}
        isSubscriptionCancelled={isSubscriptionCancelled}
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
          {activeSheet === ZeroProStage.Loading && <Loading title={loadingTitle} message={loadingMessage} />}
          {activeSheet === ZeroProStage.Error && <Error error={pollError} />}
          {activeSheet === ZeroProStage.Success && <Success onClose={closeSheet} subtitle={successSubtitle} />}
          {activeSheet === ZeroProStage.Manage && (
            <Manage onNext={handleCancelNext} onClose={closeSheet} formattedEndDate={formattedEndDate} />
          )}
        </BottomSheet>
      )}
    </div>
  );
};
