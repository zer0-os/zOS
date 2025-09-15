import { useState } from 'react';
import { FormData, validateFormData, isValidNumericInput, formatSymbolInput } from '../components/token-launcher/utils';

const INITIAL_FORM_DATA: FormData = {
  name: '',
  symbol: '',
  initialBuyAmount: '',
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
    return validateFormData(formData) === null && selectedIconFile !== null;
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
  };
};
