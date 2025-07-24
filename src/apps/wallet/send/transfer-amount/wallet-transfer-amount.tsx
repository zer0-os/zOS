import { useDispatch, useSelector } from 'react-redux';
import { nextStage, previousStage, setAmount } from '../../../../store/wallet';
import { SendHeader } from '../components/send-header';
import { Button } from '../../components/button/button';
import { TokenSwapModule } from '../components/token-swap-module';
import {
  amountSelector,
  recipientSelector,
  selectedWalletSelector,
  tokenSelector,
} from '../../../../store/wallet/selectors';
import { useMemo } from 'react';
import { parseLocaleNumber } from '../../utils/format-numbers';
import { ethers } from 'ethers';

import styles from './wallet-transfer-amount.module.scss';

export const WalletTransferAmount = () => {
  const dispatch = useDispatch();
  const selectedWallet = useSelector(selectedWalletSelector);
  const token = useSelector(tokenSelector);
  const recipient = useSelector(recipientSelector);
  const amount = useSelector(amountSelector);

  const disabled = useMemo(() => {
    if (!amount || !token) {
      return true;
    }

    try {
      // convert locale formatted string to a string
      const parsedAmount = parseLocaleNumber(amount);
      // convert string to a BigNumber for comparison
      const amountInSmallestUnit = ethers.utils.parseUnits(parsedAmount, token.decimals);
      const balanceInSmallestUnit = ethers.utils.parseUnits(token.amount, token.decimals);

      return amountInSmallestUnit.isZero() || amountInSmallestUnit.gt(balanceInSmallestUnit);
    } catch (e) {
      return true;
    }
  }, [amount, token]);

  const handleAmountChange = (amount: string) => {
    dispatch(setAmount(parseLocaleNumber(amount)));
  };

  const handleBack = () => {
    dispatch(previousStage());
  };

  const handleContinue = () => {
    dispatch(nextStage());
  };

  return (
    <div className={styles.container}>
      <SendHeader title='Send' onBack={handleBack} />

      <div className={styles.content}>
        <TokenSwapModule
          state='input'
          walletAddress={selectedWallet.address}
          walletLabel={selectedWallet.label}
          token={token}
          amount={amount}
          onAmountChange={handleAmountChange}
          autoFocus
        />
        <TokenSwapModule
          state='output'
          walletAddress={recipient?.publicAddress}
          walletLabel={recipient?.primaryZid || recipient?.name}
          token={token}
          amount={amount}
        />
        <Button onClick={handleContinue} disabled={disabled}>
          Continue
        </Button>
      </div>
    </div>
  );
};
