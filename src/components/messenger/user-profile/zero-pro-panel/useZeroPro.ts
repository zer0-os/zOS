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
  // State
  activeSheet: ZeroProSheet;
  billingDetails: BillingDetails | null;
  pollingType: 'payment' | 'cancellation' | null;
  pollError: string | null;

  // Subscription data
  currentPeriodEnd?: Date;
  subscriptionStatus?: string;
  formattedEndDate: string;
  isSubscriptionCancelled: boolean;

  // Actions
  openPlan: () => void;
  openDetails: () => void;
  openPayment: () => void;
  openManage: () => void;
  closeSheet: () => void;
  handleBillingDetails: (details: BillingDetails) => void;
  handlePaymentNext: () => void;
  handleCancelNext: () => void;

  // Computed values
  isLoading: boolean;
  loadingTitle: string;
  loadingMessage: string;
  successSubtitle: string;
}

export const useZeroPro = (isZeroProSubscriber: boolean): UseZeroProReturn => {
  const [activeSheet, setActiveSheet] = useState<ZeroProSheet>(null);
  const [billingDetails, setBillingDetails] = useState<BillingDetails | null>(null);
  const [pollingType, setPollingType] = useState<'payment' | 'cancellation' | null>(null);
  const [pollError, setPollError] = useState<string | null>(null);
  const dispatch = useDispatch();

  // Only fetch subscription status if user is already a subscriber (includes cancelled)
  const { data: subscriptionData } = useStatusZeroProSubscription(isZeroProSubscriber);

  const openPlan = useCallback(() => setActiveSheet(ZeroProStage.PaymentPlan), []);
  const openDetails = useCallback(() => setActiveSheet(ZeroProStage.Details), []);
  const openPayment = useCallback(() => setActiveSheet(ZeroProStage.Payment), []);
  const openManage = useCallback(() => setActiveSheet(ZeroProStage.Manage), []);
  const closeSheet = useCallback(() => setActiveSheet(null), []);

  const handleBillingDetails = useCallback(
    (details: BillingDetails) => {
      setBillingDetails(details);
      openPayment();
    },
    [openPayment]
  );

  const handlePaymentNext = useCallback(() => {
    setPollingType('payment');
    setPollError(null);
    setActiveSheet(ZeroProStage.Loading);
  }, []);

  const handleCancelNext = useCallback(() => {
    setPollingType('cancellation');
    setPollError(null);
    setActiveSheet(ZeroProStage.Loading);
  }, []);

  usePollZeroProStatus(
    !!pollingType,
    pollingType === 'payment' ? 'active' : 'cancelled',
    () => {
      setPollingType(null);
      setActiveSheet(ZeroProStage.Success);
      dispatch(refreshCurrentUser());
    },
    () => {
      setPollingType(null);
      const errorMessage =
        pollingType === 'payment'
          ? 'Subscription activation timed out. Please contact support or try again.'
          : 'Subscription cancellation timed out. Please contact support or try again.';
      setPollError(errorMessage);
      setActiveSheet(ZeroProStage.Error);
    }
  );

  const isLoading = !!pollingType;
  const loadingTitle = pollingType === 'cancellation' ? 'Cancel Zero Pro' : 'Activate Zero Pro';
  const loadingMessage =
    pollingType === 'cancellation' ? 'Cancelling your subscription...' : 'Activating your subscription...';
  const successSubtitle = pollingType === 'cancellation' ? 'Your subscription has been cancelled' : 'Rewards Unlocked';
  console.log(subscriptionData);
  const formattedEndDate = subscriptionData?.subscription?.currentPeriodEnd
    ? new Date(subscriptionData.subscription.currentPeriodEnd).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  const isSubscriptionCancelled = subscriptionData?.subscription?.status === 'cancelled';

  return {
    // State
    activeSheet,
    billingDetails,
    pollingType,
    pollError,

    // Subscription data
    currentPeriodEnd: subscriptionData?.subscription?.currentPeriodEnd,
    subscriptionStatus: subscriptionData?.subscription?.status,
    formattedEndDate,
    isSubscriptionCancelled,

    // Actions
    openPlan,
    openDetails,
    openPayment,
    openManage,
    closeSheet,
    handleBillingDetails,
    handlePaymentNext,
    handleCancelNext,

    // Computed values
    isLoading,
    loadingTitle,
    loadingMessage,
    successSubtitle,
  };
};
