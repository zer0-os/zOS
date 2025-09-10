import { IconZeroProVerified } from '@zero-tech/zui/icons';
import { Link } from 'react-router-dom';

import styles from './styles.module.scss';

interface UserDisplayProps {
  name: string;
  primaryZid?: string | null;
  isProUser: boolean;
}

const UserContent = ({ name, primaryZid, isProUser }: UserDisplayProps) => (
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

export const UserDisplay = ({ name, primaryZid, isProUser }: UserDisplayProps) => {
  // Remove '0://' prefix from ZID if present for the URL
  const profileIdentifier = primaryZid?.replace('0://', '');

  // If we don't have a primaryZid, render without a link
  if (!profileIdentifier) {
    return <UserContent name={name} primaryZid={primaryZid} isProUser={isProUser} />;
  }

  return (
    <Link to={`/profile/${profileIdentifier}`} className={styles.userLink}>
      <UserContent name={name} primaryZid={primaryZid} isProUser={isProUser} />
    </Link>
  );
};
