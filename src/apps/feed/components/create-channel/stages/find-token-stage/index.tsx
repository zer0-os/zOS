import React, { useState, useMemo } from 'react';
import { SelectInput, Input } from '@zero-tech/zui/components';
import styles from './styles.module.scss';

interface FindTokenStageProps {
  onNext: () => void;
}

export const FindTokenStage: React.FC<FindTokenStageProps> = ({ onNext }) => {
  const [network, setNetwork] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');

  const handleSetTokenAddress = (value: string) => {
    setTokenAddress(value);
  };

  const networkOptions = useMemo(
    () => [
      {
        id: 'ethereum',
        label: 'ethereum',
        onSelect: () => setNetwork('ethereum'),
      },
      {
        id: 'polygon',
        label: 'polygon',
        onSelect: () => setNetwork('polygon'),
      },
      {
        id: 'avalanche',
        label: 'avalanche',
        onSelect: () => setNetwork('avalanche'),
      },
    ],
    []
  );

  const isValid = network && tokenAddress;

  return (
    <div className={styles.Container}>
      <div className={styles.Title}>Find Your Token</div>
      <div className={styles.Subtitle}>Enter the network and contract address for your token.</div>
      <div className={styles.Form}>
        <label className={styles.InputContainer}>
          Token Network
          <SelectInput
            items={networkOptions}
            label=''
            placeholder='Select a network'
            value={network}
            itemSize='compact'
            menuClassName={styles.SelectMenu}
          />
        </label>
        <label className={styles.InputContainer}>
          Token Address
          <Input
            label=''
            value={tokenAddress}
            onChange={handleSetTokenAddress}
            placeholder='Enter token address'
            className={styles.Input}
          />
        </label>
        <button className={styles.ContinueButton} onClick={onNext} disabled={!isValid}>
          Fill in token details to continue
        </button>
      </div>
    </div>
  );
};
