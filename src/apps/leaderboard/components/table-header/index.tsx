import styles from './styles.module.scss';

export const TableHeader = () => {
  return (
    <thead>
      <tr className={styles.headerRow}>
        <th className={styles.rankColumn}>
          <span>Rank</span>
        </th>
        <th className={styles.memberColumn}>
          <span>Member</span>
        </th>
        <th className={styles.invitedByColumn}>
          <span>Invited by</span>
        </th>
        <th className={styles.badgesColumn}>
          <span>Badges</span>
        </th>
        <th className={styles.referralsColumn}>
          <span>Referrals</span>
        </th>
        <th className={styles.proSubsColumn}>
          <span>Pro Subs</span>
        </th>
        <th className={styles.joinedColumn}>
          <span>Joined</span>
        </th>
        <th className={styles.meowColumn}>
          <span>MEOW</span>
        </th>
        <th className={styles.codeColumn}>
          <span>Code</span>
        </th>
      </tr>
    </thead>
  );
};
