import { PanelBody } from '../../../../components/layout/panel';
import { useState } from 'react';
import { Input } from '@zero-tech/zui/components/Input/Input';
import { Button, Variant as ButtonVariant } from '@zero-tech/zui/components/Button';
import { IconRocket } from '@zero-tech/zui/icons';

import styles from './styles.module.scss';
import {
  FormData,
  validateFormData,
  isValidNumericInput,
  formatSymbolInput,
  GRADUATION_THRESHOLD,
  MAX_SYMBOL_LENGTH,
} from './utils';
import { TokenProcessingTransaction } from '../token-processing-transaction';

interface TokenLauncherProps {
  onBack: () => void;
}

const INITIAL_FORM_DATA: FormData = {
  name: '',
  symbol: '',
  initialBuyAmount: '',
};

export const TokenLauncher = ({ onBack }: TokenLauncherProps) => {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    if (error && validateFormData(newFormData) === null) {
      setError(null);
    }
  };

  const handleSubmit = async () => {
    const validationError = validateFormData(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Creating token:', formData);
      // TODO: Implement actual token creation logic
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log('Token created successfully!');
    } catch (error: any) {
      console.error('Token creation failed:', error);
      setError(error.message || 'Failed to create token');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <PanelBody className={styles.TokenLauncher}>
        <TokenProcessingTransaction />
      </PanelBody>
    );
  }

  return (
    <PanelBody className={styles.TokenLauncher}>
      <div className={styles.Container}>
        <div className={styles.Header}>
          <Button variant={ButtonVariant.Primary} onPress={onBack} className={styles.BackButton}>
            Back
          </Button>
          <div className={styles.Title}>
            <IconRocket size={24} className={styles.RocketIcon} />
            Launch Your Token
          </div>
          <div className={styles.Subtitle}>
            Create a new ZBanc token with bonding curve mechanics and automatic graduation to Uniswap V3.
          </div>
        </div>

        <div className={styles.InfoBox}>
          <div className={styles.InfoTitle}>Important Information</div>
          <ul className={styles.InfoList}>
            <li>Tokens start with bonding curve pricing and graduate to Uniswap V3 at 800M supply</li>
            <li>Initial buy amount determines starting liquidity</li>
            <li>Tokens are soulbound (non-transferable) until graduation</li>
            <li>Factory fees apply: 1% vault entry/exit, 1% protocol entry/exit</li>
          </ul>
        </div>

        <div className={styles.Form}>
          <div className={styles.InputGroup}>
            <label className={styles.Label}>Token Name</label>
            <Input value={formData.name} onChange={handleInputChange('name')} placeholder='e.g., My Awesome Token' />
            <div className={styles.HelperText}>The full name of your token (e.g., "Bitcoin", "Ethereum")</div>
          </div>

          <div className={styles.InputGroup}>
            <label className={styles.Label}>Token Symbol</label>
            <Input value={formData.symbol} onChange={handleInputChange('symbol')} placeholder='e.g., MAT' />
            <div className={styles.HelperText}>
              Short symbol for your token (max {MAX_SYMBOL_LENGTH} characters, e.g., "BTC", "ETH")
            </div>
          </div>

          <div className={styles.InputGroup}>
            <label className={styles.Label}>Initial Buy Amount (mMEOW)</label>
            <Input
              value={formData.initialBuyAmount}
              onChange={handleInputChange('initialBuyAmount')}
              placeholder='e.g., 1000'
              type='number'
            />
            <div className={styles.HelperText}>Amount of mMEOW to provide as initial liquidity</div>
          </div>

          {formData.name && formData.symbol && formData.initialBuyAmount && (
            <div className={styles.TokenPreview}>
              <div className={styles.PreviewTitle}>Token Preview</div>
              <div className={styles.PreviewContent}>
                <div className={styles.PreviewRow}>
                  <span className={styles.PreviewLabel}>Name:</span>
                  <span className={styles.PreviewValue}>{formData.name}</span>
                </div>
                <div className={styles.PreviewRow}>
                  <span className={styles.PreviewLabel}>Symbol:</span>
                  <span className={styles.PreviewValue}>{formData.symbol}</span>
                </div>
                <div className={styles.PreviewRow}>
                  <span className={styles.PreviewLabel}>Initial Liquidity:</span>
                  <span className={styles.PreviewValue}>{formData.initialBuyAmount} mMEOW</span>
                </div>
                <div className={styles.PreviewRow}>
                  <span className={styles.PreviewLabel}>Graduation Threshold:</span>
                  <span className={styles.PreviewValue}>{GRADUATION_THRESHOLD}</span>
                </div>
              </div>
            </div>
          )}

          {error && <div className={styles.ErrorMessage}>{error}</div>}

          <Button onPress={handleSubmit} disabled={isLoading} className={styles.SubmitButton}>
            {isLoading ? 'Creating Token...' : 'Launch Token'}
          </Button>
        </div>

        <div className={styles.FeeStructure}>
          <div className={styles.FeeSection}>
            <div className={styles.FeeTitle}>Entry Fees (Buying)</div>
            <div className={styles.FeeItem}>
              <span>Vault Fee:</span>
              <span>1%</span>
            </div>
            <div className={styles.FeeItem}>
              <span>Protocol Fee:</span>
              <span>1%</span>
            </div>
          </div>

          <div className={styles.FeeSection}>
            <div className={styles.FeeTitle}>Exit Fees (Selling)</div>
            <div className={styles.FeeItem}>
              <span>Vault Fee:</span>
              <span>1%</span>
            </div>
            <div className={styles.FeeItem}>
              <span>Protocol Fee:</span>
              <span>1%</span>
            </div>
          </div>
        </div>
      </div>
    </PanelBody>
  );
};
