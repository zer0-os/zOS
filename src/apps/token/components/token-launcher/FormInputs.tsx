import React from 'react';
import { Input } from '@zero-tech/zui/components/Input/Input';
import { FormData, MAX_SYMBOL_LENGTH } from './utils';
import { TokenIconUpload } from '../token-icon-upload';
import { FeeStructure } from './FeeStructure';
import styles from './styles.module.scss';

interface FormInputsProps {
  formData: FormData;
  selectedIconFile: File | null;
  iconUploadError: string | null;
  isSubmitting: boolean;
  onInputChange: (field: keyof FormData) => (value: string) => void;
  onIconFileSelected: (file: File) => void;
}

export const FormInputs = ({
  formData,
  selectedIconFile,
  iconUploadError,
  isSubmitting,
  onInputChange,
  onIconFileSelected,
}: FormInputsProps) => {
  return (
    <div className={styles.FormContent}>
      <div className={styles.InputsSection}>
        <div className={styles.InputGroup}>
          <label className={styles.Label}>Token Name (required)</label>
          <Input value={formData.name} onChange={onInputChange('name')} placeholder='e.g., My Awesome Token' />
          <div className={styles.HelperText}>The full name of your token (e.g., "Bitcoin", "Ethereum")</div>
        </div>

        <div className={styles.InputGroup}>
          <label className={styles.Label}>Token Symbol (required)</label>
          <Input value={formData.symbol} onChange={onInputChange('symbol')} placeholder='e.g., MAT' />
          <div className={styles.HelperText}>
            Short symbol for your token (max {MAX_SYMBOL_LENGTH} characters, e.g., "BTC", "ETH")
          </div>
        </div>

        <div className={styles.InputGroup}>
          <label className={styles.Label}>Initial Buy Amount (required)</label>
          <Input
            value={formData.initialBuyAmount}
            onChange={onInputChange('initialBuyAmount')}
            placeholder='e.g., 1000'
            type='number'
          />
          <div className={styles.HelperText}>Amount of MEOW to provide as initial liquidity</div>
        </div>

        <div className={styles.InputGroup}>
          <label className={styles.Label}>Description (optional)</label>
          <Input
            value={formData.description || ''}
            onChange={onInputChange('description')}
            placeholder='Describe your token...'
          />
          <div className={styles.HelperText}>Optional description for your token</div>
        </div>
      </div>

      <div className={styles.IconSection}>
        <div className={styles.InputGroup}>
          <label className={styles.Label}>Token Icon (required)</label>
          <TokenIconUpload
            onFileSelected={onIconFileSelected}
            currentIconUrl={formData.iconUrl}
            selectedFile={selectedIconFile}
            disabled={isSubmitting}
            error={iconUploadError}
          />
        </div>
        <FeeStructure />
      </div>
    </div>
  );
};
