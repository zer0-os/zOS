import { IconPackageMinus } from '@zero-tech/zui/icons';
import styles from './wallet-empty-state.module.scss';
import classNames from 'classnames';

interface WalletEmptyStateProps {
  title: string;
  className?: string;
}

export const WalletEmptyState = ({ title, className }: WalletEmptyStateProps) => {
  return (
    <div className={classNames(styles.emptyState, className)}>
      <IconPackageMinus className={styles.icon} size={48} />
      <div className={styles.title}>{title}</div>
    </div>
  );
};
