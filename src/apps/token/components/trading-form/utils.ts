export interface TradingFormData {
  amount: string;
  tradeType: 'buy' | 'sell';
  mode: 'deposit' | 'mint';
}

export const validateTradingFormData = (data: TradingFormData): string | null => {
  if (!data.amount) {
    return 'Please enter an amount';
  }

  const amount = parseFloat(data.amount);
  if (isNaN(amount) || amount <= 0) {
    return 'Amount must be a valid number greater than 0';
  }

  return null;
};

export const isValidNumericInput = (value: string): boolean => {
  return value === '' || /^\d*\.?\d*$/.test(value);
};

export const formatAmount = (amount: string): string => {
  const num = parseFloat(amount);
  if (isNaN(num)) return '0';

  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(2)}B`;
  }
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(2)}K`;
  }
  return num.toFixed(6);
};
