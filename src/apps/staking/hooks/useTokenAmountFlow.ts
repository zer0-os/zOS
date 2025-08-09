import { useState, useCallback } from 'react';

export type FlowType = 'stake' | 'unstake';

export type FlowStep = 'form' | 'confirm' | 'approving' | 'processing' | 'success';

export interface TokenAmountFlowState {
  step: FlowStep;
  error: string | null;
  flowType: FlowType;
}

export interface TokenAmountFlowActions {
  goToConfirm: () => void;
  goToApproval: () => void;
  goToApproving: () => void;
  goToProcessing: () => void;
  goToSuccess: () => void;
  goBack: () => void;
  setError: (error: string | null) => void;
  handleFailure: () => void;
  reset: () => void;
}

export interface UseTokenAmountFlowReturn extends TokenAmountFlowState, TokenAmountFlowActions {}

export const useTokenAmountFlow = (flowType: FlowType): UseTokenAmountFlowReturn => {
  const [step, setStep] = useState<FlowStep>('form');
  const [error, setError] = useState<string | null>(null);

  const goToConfirm = useCallback(() => {
    setError(null);
    setStep('confirm');
  }, []);

  const goToApproval = useCallback(() => {
    setError(null);
    setStep('approving');
  }, []);

  const goToApproving = useCallback(() => {
    setError(null);
    setStep('approving');
  }, []);

  const goToProcessing = useCallback(() => {
    setError(null);
    setStep('processing');
  }, []);

  const goToSuccess = useCallback(() => {
    setError(null);
    setStep('success');
  }, []);

  const goBack = useCallback(() => {
    setError(null);
    switch (step) {
      case 'confirm':
        setStep('form');
        break;
      default:
        break;
    }
  }, [step]);

  const handleFailure = useCallback(() => {
    setStep('confirm');
  }, []);

  const reset = useCallback(() => {
    setStep('form');
    setError(null);
  }, []);

  return {
    step,
    error,
    flowType,
    goToConfirm,
    goToApproval,
    goToApproving,
    goToProcessing,
    goToSuccess,
    goBack,
    setError,
    handleFailure,
    reset,
  };
};
