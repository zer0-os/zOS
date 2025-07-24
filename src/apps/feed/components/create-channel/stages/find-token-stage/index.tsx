import React, { useState } from 'react';
import { SelectInput, Input } from '@zero-tech/zui/components';
import { Spinner } from '@zero-tech/zui/components/LoadingIndicator';
import { useTokenFinder, TokenData } from '../../lib/hooks/useTokenFinder';

import styles from './styles.module.scss';

interface FindTokenStageProps {
  onTokenFound: (token: TokenData) => void;
}

const NETWORKS = [
  { id: 'ethereum', label: 'Ethereum', chainId: 1, disabled: false },
  { id: 'polygon', label: 'Polygon', chainId: 137, disabled: true, className: styles.DisabledOption },
  { id: 'avalanche', label: 'Avalanche', chainId: 43114, disabled: true, className: styles.DisabledOption },
];

function isValidAddress(address: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export const FindTokenStage: React.FC<FindTokenStageProps> = ({ onTokenFound }) => {
  const [network, setNetwork] = useState(NETWORKS[0].id);
  const [address, setAddress] = useState('');
  const { token, loading, error, findToken, resetError } = useTokenFinder();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const selected = NETWORKS.find((n) => n.id === network);
    if (selected && address) {
      await findToken(selected.chainId, address, selected.label);
    }
  };

  React.useEffect(() => {
    if (submitted && token) {
      onTokenFound(token);
    }
  }, [
    submitted,
    token,
    onTokenFound,
  ]);

  // Reset error when user changes network or address
  const handleNetworkChange = (id: string) => {
    setNetwork(id);
    resetError();
  };

  const handleAddressChange = (val: string) => {
    setAddress(val);
    resetError();
  };

  const networkItems = NETWORKS.map((n) => ({
    id: n.id,
    label: n.label,
    disabled: n.disabled,
    onSelect: () => !n.disabled && handleNetworkChange(n.id),
    className: n.className,
  }));

  const networkLabel = networkItems.find((n) => n.id === network)?.label;

  return (
    <div className={styles.Container}>
      <div className={styles.Title}>Find Your Token</div>
      <div className={styles.Subtitle}>Enter the network and contract address for your token.</div>
      <form className={styles.Form} onSubmit={handleSubmit}>
        <label className={styles.InputContainer}>
          Token Network
          <SelectInput
            items={networkItems}
            label=''
            placeholder='Select a network'
            value={networkLabel}
            itemSize='compact'
            menuClassName={styles.SelectMenu}
          />
        </label>

        <label className={styles.InputContainer}>
          <div className={styles.LabelWrapper}>
            Token Address
            {loading && <Spinner className={styles.Spinner} />}
            {error && <span className={`${styles.SubLabel} ${styles.Error}`}>{error}</span>}
            {!error && !loading && <span className={styles.SubLabel}>Enter a valid token address</span>}
          </div>
          <Input
            label=''
            value={address}
            onChange={handleAddressChange}
            placeholder='Enter token address'
            className={styles.Input}
          />
        </label>

        <button
          className={styles.ContinueButton}
          type='submit'
          disabled={loading || !network || !isValidAddress(address)}
        >
          Find Token
        </button>
      </form>
    </div>
  );
};
