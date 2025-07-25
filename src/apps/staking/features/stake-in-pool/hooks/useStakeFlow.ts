import { useState, useCallback } from 'react';

export type StakeStep = 'form' | 'confirm' | 'approving' | 'processing' | 'success';

export interface StakeFlowState {
  step: StakeStep;
  error: string | null;
}

export interface StakeFlowActions {
  goToConfirm: () => void;
  goToApproval: () => void;
  goToApproving: () => void;
  goToProcessing: () => void;
  goToSuccess: () => void;
  goBack: () => void;
  setError: (error: string | null) => void;
  handleStakeFailure: () => void;
  reset: () => void;
}

export interface UseStakeFlowReturn extends StakeFlowState, StakeFlowActions {}

export const useStakeFlow = (): UseStakeFlowReturn => {
  const [step, setStep] = useState<StakeStep>('form');
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

  const handleStakeFailure = useCallback(() => {
    setStep('confirm');
  }, []);

  const reset = useCallback(() => {
    setStep('form');
    setError(null);
  }, []);

  return {
    step,
    error,
    goToConfirm,
    goToApproval,
    goToApproving,
    goToProcessing,
    goToSuccess,
    goBack,
    setError,
    handleStakeFailure,
    reset,
  };
};
