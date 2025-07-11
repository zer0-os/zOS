import React from 'react';
import { TokenData } from '../../hooks/useTokenFinder';

import styles from './styles.module.scss';

interface ExtractTokenStageProps {
  token: TokenData;
  onNext: () => void;
}

export const ExtractTokenStage: React.FC<ExtractTokenStageProps> = ({ token, onNext }) => {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className={styles.TokenDetailsContainer}>
      <div className={styles.Title}>Token Found</div>
      <div className={styles.Subtitle}>Verify if this is the right token.</div>
      <div className={styles.TokenProfile}>
        {token.logo && <img className={styles.TokenImage} src={token.logo} alt={token.name} />}
        <div className={styles.TokenName}>{token.name}</div>
        <div className={styles.TokenSymbol}>{token.symbol}</div>
      </div>
      <div className={styles.TokenInfoBox}>
        <div className={styles.InfoRow}>
          <span className={styles.InfoRowLabel}>Network</span>
          <span className={styles.InfoRowValue}>{token.network}</span>
        </div>
        <div className={styles.InfoRow}>
          <span className={styles.InfoRowLabel}>Token Name</span>
          <span className={styles.InfoRowValue}>{token.name}</span>
        </div>
        <div className={styles.InfoRow}>
          <span className={styles.InfoRowLabel}>Token Symbol</span>
          <span className={styles.InfoRowValue}>{token.symbol}</span>
        </div>
        <div className={styles.InfoRow}>
          <span className={styles.InfoRowLabel}>Decimals</span>
          <span className={styles.InfoRowValue}>{token.decimals}</span>
        </div>
        <div className={styles.InfoRow}>
          <span className={styles.InfoRowLabel}>Token Address</span>
          <span className={styles.InfoRowValue}>{formatAddress(token.address)}</span>
        </div>
      </div>
      <button className={styles.ContinueButton} onClick={onNext}>
        Continue
      </button>
    </div>
  );
};
