import { IconZeroProVerified } from '@zero-tech/zui/icons';

import styles from './styles.module.scss';

interface UserDisplayProps {
  name: string;
  primaryZid?: string | null;
  isProUser: boolean;
}

export const UserDisplay = ({ name, primaryZid, isProUser }: UserDisplayProps) => {
  return (
    <div className={styles.userContainer}>
      <div className={styles.nameRow}>
        <span className={styles.name}>{name}</span>
        {isProUser && (
          <div className={styles.proBadge}>
            <IconZeroProVerified size={16} />
          </div>
        )}
      </div>
      {primaryZid && (
        <div className={styles.zidRow}>
          <span className={styles.zid}>{primaryZid}</span>
        </div>
      )}
    </div>
  );
};
