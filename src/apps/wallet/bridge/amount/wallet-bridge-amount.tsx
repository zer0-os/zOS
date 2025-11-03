import { useState } from 'react';
import { BridgeHeader } from '../components/bridge-header/bridge-header';
import { Button } from '../../components/button/button';
import { BridgeTokenInput } from '../components/bridge-token-input/bridge-token-input';
import { BridgeTokenSelector } from '../components/bridge-token-selector/bridge-token-selector';
import { BridgeParams, isBridgeValid } from '../lib/utils';
import { TokenBalance } from '../../types';

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
  const [amount, setAmount] = useState('');
  const [fromToken, setFromToken] = useState<SelectedToken | null>(null);
  const [toToken, setToToken] = useState<SelectedToken | null>(null);
  const [showTokenSelector, setShowTokenSelector] = useState(false);
  const [selectingFor, setSelectingFor] = useState<'from' | 'to'>('from');

  const disabled = !isBridgeValid(fromToken?.chainId, toToken?.chainId, amount, fromToken?.tokenAddress);

  const onAmountChange = (newAmount: string) => {
    setAmount(newAmount);
  };

  const onMaxClick = () => {
    if (fromToken?.balance) {
      setAmount(fromToken.balance);
    }
  };

  const onOpenSelector = (type: 'from' | 'to') => {
    setSelectingFor(type);
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

    if (selectingFor === 'from') {
      setFromToken(selectedToken);
    } else {
      setToToken(selectedToken);
    }
    setShowTokenSelector(false);
  };

  const onCloseTokenSelector = () => {
    setShowTokenSelector(false);
  };

  const onSwapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setAmount('');
  };

  const onSubmitAmount = () => {
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
          onOpenSelector={() => onOpenSelector('from')}
        />

        <div className={styles.swapIcon}>
          <div className={styles.swapIconInner} onClick={onSwapTokens}>
            ⇅
          </div>
        </div>

        <BridgeTokenInput
          type='to'
          selectedToken={toToken}
          onOpenSelector={() => onOpenSelector('to')}
          amount={amount}
        />

        <Button onClick={onSubmitAmount} disabled={disabled}>
          {!fromToken || !toToken ? 'Select Tokens to Continue' : 'Continue'}
        </Button>
      </div>

      <BridgeTokenSelector isOpen={showTokenSelector} onClose={onCloseTokenSelector} onTokenSelect={onTokenSelect} />
    </div>
  );
};
