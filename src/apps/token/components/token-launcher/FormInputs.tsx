import React from 'react';
import { Input } from '@zero-tech/zui/components/Input/Input';
import { FormData, MAX_SYMBOL_LENGTH } from './utils';
import { TokenIconUpload } from '../token-icon-upload';
import { FeeStructure } from './FeeStructure';
import { useBalancesQuery } from '../../../wallet/queries/useBalancesQuery';
import { currentUserSelector } from '../../../../store/authentication/selectors';
import { useSelector } from 'react-redux';
import { MEOW_TOKEN_ADDRESS } from '../../../wallet/constants';
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
  const user = useSelector(currentUserSelector);
  const userAddress = user?.zeroWalletAddress;

  const { data: balancesData, isLoading: balancesLoading } = useBalancesQuery(userAddress || '');

  const meowBalance = balancesData?.tokens?.find(
    (token) => token.tokenAddress.toLowerCase() === MEOW_TOKEN_ADDRESS.toLowerCase()
  );

  const meowAmount = meowBalance ? parseFloat(meowBalance.amount) : 0;
  const initialBuyAmount = parseFloat(formData.initialBuyAmount) || 0;
  const hasInsufficientBalance = initialBuyAmount > 0 && initialBuyAmount > meowAmount;
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
          <label className={styles.Label}>Initial Buy Amount (required) - Default: 0</label>
          <Input
            value={formData.initialBuyAmount}
            onChange={onInputChange('initialBuyAmount')}
            placeholder='e.g., 1000'
            type='number'
          />
          <div className={styles.HelperTextContainer}>
            <div className={styles.HelperText}>Amount of MEOW to provide as initial liquidity</div>
            {userAddress && (
              <div className={styles.BalanceInfo}>
                <span className={styles.BalanceLabel}>Your MEOW Balance:</span>
                {balancesLoading ? (
                  <div className={styles.BalanceLoading}>
                    <div className={styles.Spinner} />
                  </div>
                ) : (
                  <span className={styles.BalanceAmount}>{meowAmount.toFixed(2)} MEOW</span>
                )}
              </div>
            )}
          </div>

          {hasInsufficientBalance && (
            <div className={styles.BalanceError}>
              Insufficient MEOW balance. You need {initialBuyAmount.toFixed(2)} MEOW but only have{' '}
              {meowAmount.toFixed(2)} MEOW.
            </div>
          )}
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
