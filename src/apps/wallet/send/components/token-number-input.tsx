import { useNumberFormat } from '@react-input/number-format';
import { useEffect } from 'react';
import styles from './token-number-input.module.scss';

interface TokenNumberInputProps {
  value: string;
  decimals: number;
  onChange: (value: string) => void;
}

export const TokenNumberInput = ({ value, decimals, onChange }: TokenNumberInputProps) => {
  const inputRef = useNumberFormat({
    locales: 'en',
    maximumFractionDigits: decimals,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onChange(value);
  };

  useEffect(() => {
    const currentValue = inputRef.current?.value;
    if (inputRef.current && value && currentValue !== value) {
      inputRef.current.value = value;
    }
  }, [inputRef, value]);

  return <input ref={inputRef} placeholder='0' onChange={handleChange} className={styles.input} />;
};
