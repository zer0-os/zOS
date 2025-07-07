import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { refreshCurrentUser } from '../../../../store/authentication';
import { usePollZeroProStatus } from './usePollZeroProStatus';
import { useStatusZeroProSubscription } from './useStatusZeroProSubscription';

export enum ZeroProStage {
  PaymentPlan = 'payment-plan',
  Details = 'details',
  Payment = 'payment',
  Success = 'success',
  Loading = 'loading',
  Error = 'error',
  Manage = 'manage',
  Cancelled = 'cancelled',
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

export interface UseZeroProReturn {
  activeSheet: ZeroProSheet;
  billingDetails: BillingDetails | null;
  isPolling: boolean;
  pollError: string | null;
  isSubscriptionCancelled: boolean;
  formattedEndDate: string;

  openManage: () => void;
  openPlan: () => void;
  openDetails: () => void;
  openPayment: () => void;
  handleBillingDetails: (details: BillingDetails) => void;
  handlePaymentNext: () => void;
  handleCancelNext: () => void;
  handleClose: () => void;
  closeSheet: () => void;
}

export const useZeroPro = (onClose): UseZeroProReturn => {
  const dispatch = useDispatch();

  const [activeSheet, setActiveSheet] = useState<ZeroProSheet>(null);
  const [billingDetails, setBillingDetails] = useState<BillingDetails | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [pollError, setPollError] = useState<string | null>(null);

  const openPlan = useCallback(() => setActiveSheet(ZeroProStage.PaymentPlan), []);
  const openDetails = useCallback(() => setActiveSheet(ZeroProStage.Details), []);
  const openPayment = useCallback(() => setActiveSheet(ZeroProStage.Payment), []);
  const openManage = useCallback(() => setActiveSheet(ZeroProStage.Manage), []);
  const closeSheet = useCallback(() => setActiveSheet(null), []);

  const { data: subscriptionData } = useStatusZeroProSubscription();
  const isSubscriptionCancelled = subscriptionData?.subscription?.status === 'cancelled';

  const formattedEndDate = subscriptionData?.subscription?.currentPeriodEnd
    ? new Date(subscriptionData.subscription.currentPeriodEnd).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

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

  // After payment, start polling for active status
  const handleCancelNext = useCallback(() => {
    setIsPolling(true);
    setPollError(null);
    setActiveSheet(ZeroProStage.Loading);
  }, []);

  const handleClose = () => {
    onClose();
  };

  usePollZeroProStatus(
    isPolling,
    () => {
      setIsPolling(false);
      setActiveSheet(ZeroProStage.Success);
      dispatch(refreshCurrentUser());
    },
    () => {
      setIsPolling(false);
      setActiveSheet(ZeroProStage.Cancelled);
      dispatch(refreshCurrentUser());
    },
    () => {
      setIsPolling(false);
      setPollError('Subscription activation timed out. Please contact support or try again.');
      setActiveSheet(ZeroProStage.Error);
    }
  );

  return {
    activeSheet,
    billingDetails,
    isPolling,
    pollError,
    isSubscriptionCancelled,
    formattedEndDate,
    openPlan,
    openDetails,
    openPayment,
    openManage,
    closeSheet,
    handleBillingDetails,
    handlePaymentNext,
    handleCancelNext,
    handleClose,
  };
};
