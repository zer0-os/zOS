import { useState } from 'react';
import { useSwitchChain } from 'wagmi';
import { Button } from '@zero-tech/zui/components/Button';

import styles from './styles.module.scss';

interface NetworkSwitchButtonProps {
  targetChainId: number;
  onSuccess?: () => void;
}

export const NetworkSwitchButton = ({ targetChainId, onSuccess }: NetworkSwitchButtonProps) => {
  const { chains, switchChain, isPending, error } = useSwitchChain();
  const [isSwitching, setIsSwitching] = useState(false);

  const targetChain = chains.find((chain) => chain.id === targetChainId);
  const chainName = targetChain?.name || (targetChainId === 43113 ? 'Avalanche Fuji' : 'Zephyr Test Net');

  const handleSwitch = async () => {
    if (!switchChain) {
      console.error('Chain switching not supported by wallet');
      return;
    }

    setIsSwitching(true);

    try {
      await switchChain(
        { chainId: targetChainId },
        {
          onSuccess: () => {
            setIsSwitching(false);
            onSuccess?.();
          },
          onError: (error) => {
            console.error('Failed to switch chain:', error);
            setIsSwitching(false);
          },
        }
      );
    } catch (err) {
      console.error('Error switching chain:', err);
      setIsSwitching(false);
    }
  };

  if (!switchChain) {
    return (
      <div className={styles.ManualSwitch}>
        <p>Please switch to {chainName} in your wallet app</p>
      </div>
    );
  }

  return (
    <div className={styles.Container}>
      <Button onPress={handleSwitch} isLoading={isSwitching || isPending} isDisabled={isSwitching || isPending}>
        Switch to {chainName}
      </Button>
      {error && <p className={styles.Error}>Failed to switch network. Please try switching manually in your wallet.</p>}
    </div>
  );
};
