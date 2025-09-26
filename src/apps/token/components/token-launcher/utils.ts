export interface FormData {
  name: string;
  symbol: string;
  initialBuyAmount: string;
  description?: string;
  iconUrl: string;
}

export const MAX_SYMBOL_LENGTH = 10;
export const GRADUATION_THRESHOLD = '800,000,000 tokens';

export const validateFormData = (data: FormData, selectedIconFile?: File | null): string | null => {
  if (!data.name || !data.symbol || !data.initialBuyAmount) {
    return 'Please fill in all required fields';
  }

  if (!selectedIconFile) {
    return 'Please upload a token icon';
  }

  if (data.symbol.length > MAX_SYMBOL_LENGTH) {
    return `Symbol must be ${MAX_SYMBOL_LENGTH} characters or less`;
  }

  const initialAmount = parseFloat(data.initialBuyAmount);
  if (isNaN(initialAmount) || initialAmount < 0) {
    return 'Initial buy amount must be a valid number greater than or equal to 0';
  }

  return null;
};

export const isValidNumericInput = (value: string): boolean => {
  return value === '' || /^\d*\.?\d*$/.test(value);
};

export const formatSymbolInput = (value: string): string => {
  return value.toUpperCase();
};
