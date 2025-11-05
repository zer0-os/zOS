import { useState, useMemo, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useSelector } from 'react-redux';
import { IconChevronDown } from '@zero-tech/zui/icons';
import { BridgeHeader } from '../components/bridge-header/bridge-header';
import { Button } from '../../components/button/button';
import { BridgeTokenInput } from '../components/bridge-token-input/bridge-token-input';
import { BridgeTokenSelector } from '../components/bridge-token-selector/bridge-token-selector';
import { BridgeTokenInfo } from '../components/bridge-token-info/bridge-token-info';
import {
  BridgeParams,
  getWalletAddressForChain,
  getBridgeValidationError,
  getBridgeValidationErrorMessage,
} from '../lib/utils';
import { TokenBalance } from '../../types';
import { currentUserSelector } from '../../../../store/authentication/selectors';
import { useFetchCounterpartToken } from '../hooks/useFetchCounterpartToken';

import styles from './wallet-bridge-amount.module.scss';

interface WalletBridgeAmountProps {
  onNext: (params: BridgeParams) => void;
  onBack: () => void;
}

interface SelectedToken {
  symbol: string;
  name: string;
  chainId: number;
  balance?: string;
  logoUrl?: string;
  tokenAddress?: string;
  decimals?: number;
}

export const WalletBridgeAmount = ({ onNext, onBack }: WalletBridgeAmountProps) => {
  const { address: eoaAddress } = useAccount();
  const currentUser = useSelector(currentUserSelector);
  const zeroWalletAddress = currentUser?.zeroWalletAddress;

  const [amount, setAmount] = useState('');
  const [fromToken, setFromToken] = useState<SelectedToken | null>(null);
  const [toToken, setToToken] = useState<SelectedToken | null>(null);
  const [showTokenSelector, setShowTokenSelector] = useState(false);
  const [showValidationError, setShowValidationError] = useState(false);

  // Auto-fetch counterpart token when fromToken is selected
  // TODO: refactor to get to token from bridge
  const { data: counterpartToken } = useFetchCounterpartToken(
    fromToken ? { chainId: fromToken.chainId, tokenAddress: fromToken.tokenAddress!, symbol: fromToken.symbol } : null
  );

  useEffect(() => {
    if (counterpartToken && fromToken) {
      setToToken({
        symbol: counterpartToken.symbol,
        name: counterpartToken.name,
        chainId: counterpartToken.chainId,
        logoUrl: counterpartToken.logoUrl,
        tokenAddress: counterpartToken.tokenAddress,
        decimals: counterpartToken.decimals,
      });
    }
  }, [counterpartToken, fromToken]);

  const fromWalletAddress = useMemo(
    () => getWalletAddressForChain(fromToken?.chainId, eoaAddress, zeroWalletAddress),
    [fromToken?.chainId, eoaAddress, zeroWalletAddress]
  );
  const toWalletAddress = useMemo(
    () => getWalletAddressForChain(toToken?.chainId, eoaAddress, zeroWalletAddress),
    [toToken?.chainId, eoaAddress, zeroWalletAddress]
  );

  const validationError = getBridgeValidationError(
    fromToken?.chainId,
    toToken?.chainId,
    amount,
    fromToken?.tokenAddress,
    fromToken?.balance
  );
  const errorMessage = validationError ? getBridgeValidationErrorMessage(validationError) : '';

  const onAmountChange = (newAmount: string) => {
    setAmount(newAmount);
    setShowValidationError(false);
  };

  const onMaxClick = () => {
    if (fromToken?.balance) {
      setAmount(fromToken.balance);
    }
  };

  const onOpenFromSelector = () => {
    setShowTokenSelector(true);
  };

  const onTokenSelect = (token: TokenBalance) => {
    const selectedToken: SelectedToken = {
      symbol: token.symbol,
      name: token.name,
      chainId: token.chainId,
      balance: token.amount,
      logoUrl: token.logo,
      tokenAddress: token.tokenAddress,
      decimals: token.decimals,
    };

    setFromToken(selectedToken);
    setAmount('');
    setToToken(null);
    setShowValidationError(false);

    setShowTokenSelector(false);
  };

  const onCloseTokenSelector = () => {
    setShowTokenSelector(false);
  };

  const onSubmitAmount = () => {
    if (validationError) {
      setShowValidationError(true);
      return;
    }

    if (!fromToken || !toToken || !amount) return;

    const bridgeParams: BridgeParams = {
      tokenAddress: fromToken.tokenAddress!,
      amount,
      fromChainId: fromToken.chainId!,
      toChainId: toToken.chainId!,
    };

    onNext(bridgeParams);
  };

  return (
    <div className={styles.container}>
      <BridgeHeader title='Bridge' onBack={onBack} />

      <div className={styles.content}>
        <BridgeTokenInput
          type='from'
          selectedToken={fromToken}
          amount={amount}
          onAmountChange={onAmountChange}
          onMaxClick={onMaxClick}
          onOpenSelector={onOpenFromSelector}
          walletAddress={fromWalletAddress}
        />

        <div className={styles.chevronIcon}>
          <IconChevronDown size={20} />
        </div>

        <BridgeTokenInput type='to' selectedToken={toToken} amount={amount} walletAddress={toWalletAddress} />

        {fromToken && toToken && (
          <BridgeTokenInfo
            fromToken={{
              chainId: fromToken.chainId,
              tokenAddress: fromToken.tokenAddress,
            }}
            toToken={{
              chainId: toToken.chainId,
              tokenAddress: toToken.tokenAddress,
            }}
          />
        )}

        <div className={styles.buttonContainer}>
          <Button onClick={onSubmitAmount}>{!fromToken ? 'Select Tokens to Continue' : 'Continue'}</Button>
          {showValidationError && errorMessage && <div className={styles.errorText}>{errorMessage}</div>}
        </div>
      </div>

      <BridgeTokenSelector isOpen={showTokenSelector} onClose={onCloseTokenSelector} onTokenSelect={onTokenSelect} />
    </div>
  );
};
