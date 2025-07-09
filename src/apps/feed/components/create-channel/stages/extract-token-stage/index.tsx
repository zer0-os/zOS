import React, { useEffect, useState } from 'react';
import styles from './styles.module.scss';

interface ExtractTokenStageProps {
  onNext: () => void;
}

export const ExtractTokenStage: React.FC<ExtractTokenStageProps> = ({ onNext }) => {
  const [loading, setLoading] = useState(true);

  // Mock token data
  const token = {
    name: 'holypaws',
    symbol: 'HPAW',
    image: 'https://placekitten.com/100/100', // Replace with real image
    network: 'Avalanche',
    price: '$0.69',
    marketCap: '15.6b',
    supply: '0.5m / 1.5m',
    address: '0x1245...34e4',
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className={styles.LoadingContainer}>
        <div className={styles.Spinner} />
        <div className={styles.LoadingText}>Extracting Token Information...</div>
      </div>
    );
  }

  return (
    <div className={styles.TokenDetailsContainer}>
      <div className={styles.Title}>Token Found</div>
      <div className={styles.Subtitle}>Verify if this is the right token.</div>
      <div className={styles.TokenProfile}>
        <img className={styles.TokenImage} src={token.image} alt={token.name} />
        <div className={styles.TokenName}>{token.name}</div>
        <div className={styles.TokenSymbol}>{token.symbol}</div>
      </div>
      <div className={styles.TokenInfoBox}>
        <div className={styles.InfoRow}>
          <span className={styles.InfoRowLabel}>Network</span>
          <span className={styles.InfoRowValue}>{token.network}</span>
        </div>
        <div className={styles.InfoRow}>
          <span className={styles.InfoRowLabel}>Token Price</span>
          <span className={styles.InfoRowValue}>{token.price}</span>
        </div>
        <div className={styles.InfoRow}>
          <span className={styles.InfoRowLabel}>Market Cap</span>
          <span className={styles.InfoRowValue}>{token.marketCap}</span>
        </div>
        <div className={styles.InfoRow}>
          <span className={styles.InfoRowLabel}>Token Supply</span>
          <span className={styles.InfoRowValue}>{token.supply}</span>
        </div>
        <div className={styles.InfoRow}>
          <span className={styles.InfoRowLabel}>Token Address</span>
          <span className={styles.InfoRowValue}>{token.address}</span>
        </div>
      </div>
      <button className={styles.ContinueButton} onClick={onNext}>
        Continue
      </button>
    </div>
  );
};
