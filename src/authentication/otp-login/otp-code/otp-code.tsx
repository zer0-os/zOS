import React, { useRef } from 'react';
import styles from './otp-code.module.scss';

interface OTPCodeProps {
  value: string;
  onChange: (value: string) => void;
}

export const OTPCode = ({ value, onChange }: OTPCodeProps) => {
  const inputsRef = useRef<HTMLInputElement[]>([]);
  const numInputs = 6;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    let newDigit = e.target.value;
    if (newDigit === '' || /\d/.test(newDigit)) {
      if (newDigit.length > 1) {
        newDigit = newDigit.replace(value[index], '');
      }
      let newValue = value.slice(0, index) + newDigit + value.slice(index + 1);
      onChange(newValue);
      if (newDigit !== '' && index < numInputs - 1) {
        inputsRef.current[index + 1]?.focus();
      }
    } else {
      e.target.value = value[index] || '';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < numInputs - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    const digits = pasted.replace(/[^0-9]/g, '');
    if (digits.length === 0) return;

    if (digits.length === 6) {
      onChange(digits);
      inputsRef.current[5]?.focus();
    } else {
      const remaining = numInputs - index;
      const toAdd = digits.substring(0, remaining);
      if (toAdd.length > 0) {
        const newValue = value.slice(0, index) + toAdd + value.slice(index + toAdd.length);
        onChange(newValue);
        const nextIndex = index + toAdd.length;
        if (nextIndex < numInputs) {
          inputsRef.current[nextIndex]?.focus();
        } else {
          inputsRef.current[numInputs - 1]?.focus();
        }
      }
    }
  };

  return (
    <div className={styles.otpCode}>
      {Array.from({ length: numInputs }, (_, index) => (
        <input
          key={index}
          className={styles.otpCodeInput}
          type='tel'
          placeholder='X'
          value={value[index] || ''}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={(e) => handlePaste(e, index)}
          autoFocus={index === 0}
          ref={(el) => (inputsRef.current[index] = el)}
        />
      ))}
    </div>
  );
};
