import { useState } from 'react';
import { TradingFormData, validateTradingFormData, isValidNumericInput } from '../components/trading-form/utils';

const INITIAL_FORM_DATA: TradingFormData = {
  amount: '',
  tradeType: 'buy',
  mode: 'mint',
};

export const useTradingForm = () => {
  const [formData, setFormData] = useState<TradingFormData>(INITIAL_FORM_DATA);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof TradingFormData) => (value: string) => {
    let newFormData: TradingFormData;

    if (field === 'amount') {
      if (isValidNumericInput(value)) {
        newFormData = { ...formData, [field]: value };
      } else {
        return;
      }
    } else {
      newFormData = { ...formData, [field]: value };
    }

    setFormData(newFormData);

    if (error && validateTradingFormData(newFormData) === null) {
      setError(null);
    }
  };

  const handleTradeTypeChange = (tradeType: 'buy' | 'sell') => {
    setFormData({ ...formData, tradeType, mode: 'mint' });
    if (error) {
      setError(null);
    }
  };

  const handleModeChange = (mode: 'deposit' | 'mint') => {
    setFormData({ ...formData, mode });
    if (error) {
      setError(null);
    }
  };

  const clearErrors = () => {
    setError(null);
  };

  const setFormError = (message: string) => {
    setError(message);
  };

  const isFormValid = () => {
    return validateTradingFormData(formData) === null;
  };

  return {
    formData,
    error,
    handleInputChange,
    handleTradeTypeChange,
    handleModeChange,
    clearErrors,
    setFormError,
    isFormValid,
  };
};
