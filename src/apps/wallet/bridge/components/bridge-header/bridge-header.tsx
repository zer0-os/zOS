import { IconButton } from '@zero-tech/zui/components';
import { IconChevronLeft } from '@zero-tech/zui/icons';

import styles from './bridge-header.module.scss';

interface BridgeHeaderProps {
  title: string;
  onBack?: () => void;
  action?: React.ReactNode;
}

export const BridgeHeader = ({ title, onBack, action }: BridgeHeaderProps) => {
  const back = () => {
    onBack();
  };

  return (
    <div className={styles.header}>
      {onBack ? (
        <IconButton Icon={IconChevronLeft} className={styles.backButton} onClick={back} />
      ) : (
        <span className={styles.headerSpacer} />
      )}
      <span className={styles.headerLabel}>{title}</span>
      {action || <span className={styles.headerSpacer} />}
    </div>
  );
};
