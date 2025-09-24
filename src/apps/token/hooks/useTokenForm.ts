import { useState } from 'react';
import { FormData, validateFormData, isValidNumericInput, formatSymbolInput } from '../components/token-launcher/utils';

const INITIAL_FORM_DATA: FormData = {
  name: '',
  symbol: '',
  initialBuyAmount: '0',
  description: '',
  iconUrl: '',
};

export const useTokenForm = () => {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [error, setError] = useState<string | null>(null);
  const [selectedIconFile, setSelectedIconFile] = useState<File | null>(null);
  const [iconUploadError, setIconUploadError] = useState<string | null>(null);

  const handleInputChange = (field: keyof FormData) => (value: string) => {
    let newFormData: FormData;

    if (field === 'initialBuyAmount') {
      if (isValidNumericInput(value)) {
        newFormData = { ...formData, [field]: value };
      } else {
        return;
      }
    } else if (field === 'symbol') {
      newFormData = { ...formData, [field]: formatSymbolInput(value) };
    } else {
      newFormData = { ...formData, [field]: value };
    }

    setFormData(newFormData);

    if (error && validateFormData(newFormData, selectedIconFile) === null) {
      setError(null);
    }
  };

  const handleIconFileSelected = (file: File) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    if (!allowedTypes.includes(file.type)) {
      setIconUploadError('Please select a valid image file (JPG, PNG, GIF, WEBP)');
      setSelectedIconFile(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setIconUploadError('File size must be less than 10MB');
      setSelectedIconFile(null);
      return;
    }

    setSelectedIconFile(file);
    setIconUploadError(null);
    if (error) {
      setError(null);
    }
  };

  const clearErrors = () => {
    setError(null);
    setIconUploadError(null);
  };

  const setFormError = (message: string) => {
    setError(message);
  };

  const setIconError = (message: string) => {
    setIconUploadError(message);
  };

  const isFormValid = () => {
    return validateFormData(formData, selectedIconFile) === null;
  };

  const hasInsufficientBalance = (balance: number) => {
    const initialBuyAmount = parseFloat(formData.initialBuyAmount) || 0;
    return initialBuyAmount > 0 && initialBuyAmount > balance;
  };

  return {
    formData,
    selectedIconFile,
    error,
    iconUploadError,
    handleInputChange,
    handleIconFileSelected,
    clearErrors,
    setFormError,
    setIconError,
    isFormValid,
    hasInsufficientBalance,
  };
};
