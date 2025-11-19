import { PanelBody } from '../../../../components/layout/panel';
import { Button, Variant as ButtonVariant } from '@zero-tech/zui/components/Button';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { currentUserSelector } from '../../../../store/authentication/selectors';
import { useZBancToken } from '../../hooks/useZBancToken';
import { useUserBalance } from '../../hooks/useZBancTrading';

import styles from './styles.module.scss';
import { validateTradingFormData } from './utils';
import { TokenProcessingTransaction } from '../token-processing-transaction';
import { TradingSuccess } from '../trading-success';
import { useTradingForm } from '../../hooks/useTradingForm';
import { useTradingSubmission } from '../../hooks/useTradingSubmission';
import { Header } from './Header';
import { InfoBox } from './InfoBox';
import { FormInputs } from './FormInputs';

interface TradingFormProps {
  tokenAddress: string;
  onBack: () => void;
}

export const TradingForm = ({ tokenAddress, onBack }: TradingFormProps) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [successTransactionHash, setSuccessTransactionHash] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [hasCalculationError, setHasCalculationError] = useState(false);
  const userAddress = useSelector(currentUserSelector)?.zeroWalletAddress;

  const { data: token, isLoading, error } = useZBancToken(tokenAddress);

  const { data: balance, isLoading: balanceLoading } = useUserBalance(
    {
      tokenAddress: tokenAddress,
      userAddress: userAddress || '',
    },
    !!userAddress && !!tokenAddress
  );

  const form = useTradingForm();
  const submission = useTradingSubmission({
    token: token!,
    formData: form.formData,
    userAddress: userAddress || '',
    onTradeCompleted: (transactionHash: string) => {
      setSuccessTransactionHash(transactionHash);
      setShowSuccess(true);
    },
    setFormError: form.setFormError,
    clearErrors: form.clearErrors,
  });

  // Check if we should disable the submit button
  const isSubmitDisabled =
    submission.isSubmitting ||
    !form.formData.amount ||
    form.formData.amount === '0' ||
    isCalculating ||
    hasCalculationError;

  if (isLoading) {
    return (
      <PanelBody className={styles.TradingForm}>
        <div className={styles.Loading}>
          <div className={styles.Spinner} />
          <span>Loading token details...</span>
        </div>
      </PanelBody>
    );
  }

  if (error || !token) {
    return (
      <PanelBody className={styles.TradingForm}>
        <div className={styles.Error}>
          <div className={styles.ErrorTitle}>Token Not Found</div>
          <div className={styles.ErrorMessage}>{error?.message || 'The requested token could not be found.'}</div>
          <Button variant={ButtonVariant.Primary} onPress={onBack}>
            Back to Tokens
          </Button>
        </div>
      </PanelBody>
    );
  }

  const handleSubmit = async () => {
    const validationError = validateTradingFormData(form.formData);
    if (validationError) {
      form.setFormError(validationError);
      return;
    }

    await submission.submit();
  };

  const handleBackToForm = () => {
    setShowSuccess(false);
    setSuccessTransactionHash(null);
  };

  const handleCalculationStateChange = (calculating: boolean, hasError: boolean) => {
    setIsCalculating(calculating);
    setHasCalculationError(hasError);
  };

  if (submission.isSubmitting || submission.isApproving) {
    const title = submission.isApproving ? 'Approving transaction' : 'Processing trade';
    const subtitle = 'Just a moment...';

    return (
      <PanelBody className={styles.TradingForm}>
        <TokenProcessingTransaction title={title} subtitle={subtitle} />
      </PanelBody>
    );
  }

  if (showSuccess && successTransactionHash) {
    return (
      <PanelBody className={styles.TradingForm}>
        <TradingSuccess token={token} tradeType={form.formData.tradeType} onBackToTokens={handleBackToForm} />
      </PanelBody>
    );
  }

  return (
    <PanelBody className={styles.TradingForm}>
      <div className={styles.Container}>
        <Header token={token} onBack={onBack} />

        <div className={styles.Form}>
          <FormInputs
            token={token}
            formData={form.formData}
            isSubmitting={submission.isSubmitting}
            onInputChange={form.handleInputChange}
            onTradeTypeChange={form.handleTradeTypeChange}
            onCalculationStateChange={handleCalculationStateChange}
          />

          <div className={styles.BalanceInfo}>
            <div className={styles.BalanceTitle}>Your Balances</div>
            {balanceLoading ? (
              <div className={styles.BalanceLoading}>Loading balances...</div>
            ) : balance ? (
              <>
                <div className={styles.BalanceItem}>
                  <span className={styles.BalanceLabel}>Your {token.symbol} Balance:</span>
                  <span className={styles.BalanceValue}>{balance.tokenBalance}</span>
                </div>
                <div className={styles.BalanceItem}>
                  <span className={styles.BalanceLabel}>Your {token.asset.symbol} Balance:</span>
                  <span className={styles.BalanceValue}>{balance.assetBalance}</span>
                </div>
                <div className={styles.BalanceItem}>
                  <span className={styles.BalanceLabel}>Max Withdraw:</span>
                  <span className={styles.BalanceValue}>{balance.maxWithdraw}</span>
                </div>
              </>
            ) : (
              <div className={styles.BalanceError}>Unable to load balances</div>
            )}
          </div>

          {form.error && <div className={styles.ErrorMessage}>{form.error}</div>}

          <Button onPress={handleSubmit} isDisabled={isSubmitDisabled} className={styles.SubmitButton}>
            {submission.isSubmitting
              ? 'Processing Trade...'
              : `${form.formData.tradeType === 'buy' ? 'Buy' : 'Sell'} ${token.symbol}`}
          </Button>

          <InfoBox />
        </div>
      </div>
    </PanelBody>
  );
};
