import React, { useEffect } from 'react';
import { Input } from '@zero-tech/zui/components/Input/Input';
import { Button, Variant as ButtonVariant } from '@zero-tech/zui/components/Button';
import { TradingFormData } from './utils';
import { ZBancToken } from '../utils';
import { useAmountForDeposit, useAmountForMint, usePriceQuote } from '../../hooks/useZBancTrading';
import styles from './styles.module.scss';

interface FormInputsProps {
  token: ZBancToken;
  formData: TradingFormData;
  isSubmitting: boolean;
  onInputChange: (field: keyof TradingFormData) => (value: string) => void;
  onTradeTypeChange: (tradeType: 'buy' | 'sell') => void;
  onModeChange: (mode: 'deposit' | 'mint') => void;
  onCalculationStateChange?: (isCalculating: boolean, hasError: boolean) => void;
}

export const FormInputs = ({
  token,
  formData,
  isSubmitting,
  onInputChange,
  onTradeTypeChange,
  onModeChange,
  onCalculationStateChange,
}: FormInputsProps) => {
  // Helper to check if we should fetch data
  const shouldFetchData = !!formData.amount && !!token.address;
  const isBuyMode = formData.tradeType === 'buy';
  const isDepositMode = formData.mode === 'deposit';
  const isMintMode = formData.mode === 'mint';
  const isSellMode = formData.tradeType === 'sell';

  const {
    data: depositAmount,
    isLoading: depositLoading,
    error: depositError,
  } = useAmountForDeposit(
    {
      tokenAddress: token.address,
      amount: formData.amount,
    },
    shouldFetchData && isBuyMode && isDepositMode
  );

  const {
    data: mintAmount,
    isLoading: mintLoading,
    error: mintError,
  } = useAmountForMint(
    {
      tokenAddress: token.address,
      shares: formData.amount,
    },
    shouldFetchData && isBuyMode && isMintMode
  );

  const {
    data: sellQuote,
    isLoading: sellLoading,
    error: sellError,
  } = usePriceQuote(
    {
      tokenAddress: token.address,
      amount: formData.amount,
      direction: 'sell',
    },
    shouldFetchData && isSellMode
  );

  const isCalculating = depositLoading || mintLoading || sellLoading;
  const hasCalculationError = !!depositError || !!mintError || !!sellError;

  // Notify parent of calculation state changes
  useEffect(() => {
    if (onCalculationStateChange) {
      onCalculationStateChange(isCalculating, hasCalculationError);
    }
  }, [isCalculating, hasCalculationError, onCalculationStateChange]);

  const getAmountLabel = () => {
    if (isBuyMode) {
      return isDepositMode ? token.asset.symbol : token.symbol;
    }
    return token.symbol;
  };

  const getHelperText = () => {
    if (isBuyMode) {
      const action = isDepositMode ? 'deposit' : 'mint';
      const symbol = isDepositMode ? token.asset.symbol : token.symbol;
      return `Enter the amount of ${symbol} to ${action}`;
    }
    return `Enter the amount of ${token.symbol} tokens to sell`;
  };

  const getDepositButtonLabel = () => `Deposit ${token.asset.symbol}`;
  const getMintButtonLabel = () => `Mint ${token.symbol}`;

  return (
    <div className={styles.InputsSection}>
      <div className={styles.TradeTypeSelector}>
        <Button
          variant={formData.tradeType === 'buy' ? ButtonVariant.Primary : ButtonVariant.Secondary}
          onPress={() => onTradeTypeChange('buy')}
          className={styles.TradeTypeButton}
          disabled={isSubmitting}
        >
          Buy
        </Button>
        <Button
          variant={formData.tradeType === 'sell' ? ButtonVariant.Primary : ButtonVariant.Secondary}
          onPress={() => onTradeTypeChange('sell')}
          className={styles.TradeTypeButton}
          disabled={isSubmitting}
        >
          Sell
        </Button>
      </div>

      {isBuyMode && (
        <div className={styles.ModeSelector}>
          <Button
            variant={isDepositMode ? ButtonVariant.Primary : ButtonVariant.Secondary}
            onPress={() => onModeChange('deposit')}
            className={styles.ModeButton}
            disabled={isSubmitting}
          >
            {getDepositButtonLabel()}
          </Button>
          <Button
            variant={isMintMode ? ButtonVariant.Primary : ButtonVariant.Secondary}
            onPress={() => onModeChange('mint')}
            className={styles.ModeButton}
            disabled={isSubmitting}
          >
            {getMintButtonLabel()}
          </Button>
        </div>
      )}

      <div className={styles.InputGroup}>
        <label className={styles.Label}>Amount ({getAmountLabel()})</label>
        <Input
          value={formData.amount}
          onChange={onInputChange('amount')}
          placeholder='0.0'
          type='number'
          isDisabled={isSubmitting}
        />
        <div className={styles.HelperText}>{getHelperText()}</div>
      </div>

      {formData.amount && (
        <div className={styles.PreviewInfo}>
          {isCalculating ? (
            <div className={styles.PreviewLoading}>Calculating trade details...</div>
          ) : hasCalculationError ? (
            <>
              {isBuyMode ? (
                <>
                  {isDepositMode ? (
                    <>
                      <div className={styles.PreviewItem}>
                        <span className={styles.PreviewLabel}>You deposit:</span>
                        <span className={styles.PreviewValue}>
                          {formData.amount} {token.asset.symbol}
                        </span>
                      </div>
                      <div className={styles.PreviewItem}>
                        <span className={styles.PreviewLabel}>You receive:</span>
                        <span className={styles.PreviewValue}>-</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={styles.PreviewItem}>
                        <span className={styles.PreviewLabel}>You want to mint:</span>
                        <span className={styles.PreviewValue}>
                          {formData.amount} {token.symbol}
                        </span>
                      </div>
                      <div className={styles.PreviewItem}>
                        <span className={styles.PreviewLabel}>You need to deposit:</span>
                        <span className={styles.PreviewValue}>-</span>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  <div className={styles.PreviewItem}>
                    <span className={styles.PreviewLabel}>You receive:</span>
                    <span className={styles.PreviewValue}>-</span>
                  </div>
                  <div className={styles.PreviewItem}>
                    <span className={styles.PreviewLabel}>You pay:</span>
                    <span className={styles.PreviewValue}>
                      {formData.amount} {token.symbol}
                    </span>
                  </div>
                </>
              )}
              <div className={styles.PreviewError}>Unable to calculate trade details. Please try again.</div>
            </>
          ) : (
            <>
              {isBuyMode ? (
                <>
                  {isDepositMode ? (
                    <>
                      <div className={styles.PreviewItem}>
                        <span className={styles.PreviewLabel}>You deposit:</span>
                        <span className={styles.PreviewValue}>
                          {formData.amount} {token.asset.symbol}
                        </span>
                      </div>
                      {depositAmount && (
                        <div className={styles.PreviewItem}>
                          <span className={styles.PreviewLabel}>You receive:</span>
                          <span className={styles.PreviewValue}>
                            {depositAmount.mintAmount} {depositAmount.tokenSymbol}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className={styles.PreviewItem}>
                        <span className={styles.PreviewLabel}>You want to mint:</span>
                        <span className={styles.PreviewValue}>
                          {formData.amount} {token.symbol}
                        </span>
                      </div>
                      {mintAmount && (
                        <div className={styles.PreviewItem}>
                          <span className={styles.PreviewLabel}>You need to deposit:</span>
                          <span className={styles.PreviewValue}>
                            {mintAmount.depositAmount} {mintAmount.assetSymbol}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : (
                <>
                  <div className={styles.PreviewItem}>
                    <span className={styles.PreviewLabel}>You receive:</span>
                    <span className={styles.PreviewValue}>
                      {sellQuote ? sellQuote.outputAmount : formData.amount} {token.asset.symbol}
                    </span>
                  </div>
                  <div className={styles.PreviewItem}>
                    <span className={styles.PreviewLabel}>You pay:</span>
                    <span className={styles.PreviewValue}>
                      {formData.amount} {token.symbol}
                    </span>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
