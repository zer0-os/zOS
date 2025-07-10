import { IconButton } from '@zero-tech/zui/components';
import styles from './send-header.module.scss';
import { IconChevronLeft } from '@zero-tech/zui/icons';

interface SendHeaderProps {
  title: string;
  onBack?: () => void;
  action?: React.ReactNode;
}

export const SendHeader = ({ title, onBack, action }: SendHeaderProps) => {
  return (
    <div className={styles.header}>
      {onBack ? (
        <IconButton Icon={IconChevronLeft} className={styles.backButton} onClick={() => onBack?.()} />
      ) : (
        <span className={styles.headerSpacer} />
      )}
      <span className={styles.headerLabel}>{title}</span>
      {action || <span className={styles.headerSpacer} />}
    </div>
  );
};
