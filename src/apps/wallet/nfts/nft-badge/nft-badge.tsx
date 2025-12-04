import styles from './nft-badge.module.scss';

interface NFTBadgeProps {
  type: 'quantity' | 'tokenType';
  value: number | string;
}

export const NFTBadge = ({ type, value }: NFTBadgeProps) => {
  const displayValue = type === 'quantity' ? `Qty x${value}` : value;

  return <div className={`${styles.badge} ${styles[type]}`}>{displayValue}</div>;
};
