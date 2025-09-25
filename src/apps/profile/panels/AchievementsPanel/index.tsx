import React from 'react';
import { Panel, PanelBody } from '../../../../components/layout/panel';
import { useAchievements, Achievement } from '../../lib/useAchievements';
import { useProfileApp } from '../../lib/useProfileApp';
import Tooltip from '../../../../components/tooltip';

// Import badge SVGs as React components
import WorldBuilderBadge from '../../../../assets/badges/world-builder.svg?react';
import Blockchain101Badge from '../../../../assets/badges/blockchain101.svg?react';
import DefaultBadge from '../../../../assets/badges/default.svg?react';
import ReferralBadge from '../../../../assets/badges/referral.svg?react';
import ProSubscriptionsBadge from '../../../../assets/badges/pro-subs.svg?react';
import OGBadge from '../../../../assets/badges/og.svg?react';

import styles from './styles.module.scss';

// Map badge names to their corresponding SVG components
const badgeComponents: Record<string, React.ComponentType> = {
  'World Builder': WorldBuilderBadge,
  'Blockchain 101': Blockchain101Badge,
  Referral: ReferralBadge,
  'Pro Subscriptions': ProSubscriptionsBadge,
  OG: OGBadge,
};

const MAX_BADGE_SLOTS_PER_ROW = 4;
const MAX_BADGE_ROWS = 2;

const resolveBadgeComponent = (achievement: Achievement) => {
  return badgeComponents[achievement.name] ?? DefaultBadge;
};

const renderAchievementBadge = (achievement: Achievement, key: string) => {
  const BadgeComponent = resolveBadgeComponent(achievement);
  const isDefaultBadge = BadgeComponent === DefaultBadge;

  return (
    <Tooltip
      key={key}
      overlay={<AchievementTooltipContent achievement={achievement} />}
      placement='top'
      overlayInnerStyle={{
        padding: 0,
        boxShadow: 'none',
        minHeight: 'unset',
      }}
    >
      <div className={isDefaultBadge ? styles.DefaultBadge : styles.Badge}>
        <BadgeComponent />
      </div>
    </Tooltip>
  );
};

const renderDefaultBadge = (key: string) => (
  <div key={key} className={styles.DefaultBadge}>
    <DefaultBadge />
  </div>
);

const AchievementTooltipContent: React.FC<{ achievement: Achievement }> = ({ achievement }) => (
  <div className={styles.TooltipContent}>
    <div className={styles.TooltipHeader}>
      <div className={styles.TooltipTitle}>{achievement.name}</div>
      <div className={styles.TooltipEffect}>{achievement.effect}</div>
    </div>
    <div className={styles.TooltipDescription}>{achievement.description}</div>
  </div>
);

export const AchievementsPanel: React.FC = () => {
  const { data: profileData } = useProfileApp();
  const { data: achievements, isLoading } = useAchievements({ userId: profileData?.userId });

  // Don't render anything if no achievements or still loading
  if (isLoading || !achievements || achievements.length === 0) {
    return null;
  }

  // filter out achievements with effect 0
  const eligibleAchievements = achievements.filter((achievement) => {
    return achievement.effect !== '0';
  });

  const displayedAchievements = eligibleAchievements.slice(0, MAX_BADGE_SLOTS_PER_ROW * MAX_BADGE_ROWS);
  const totalRows = Math.max(1, Math.ceil(displayedAchievements.length / MAX_BADGE_SLOTS_PER_ROW));
  const rows: React.ReactNode[][] = [];

  for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
    const rowStart = rowIndex * MAX_BADGE_SLOTS_PER_ROW;
    const rowAchievements = displayedAchievements.slice(rowStart, rowStart + MAX_BADGE_SLOTS_PER_ROW);
    const rowSlots = rowAchievements.map((achievement, slotIndex) =>
      renderAchievementBadge(achievement, `achievement-${rowIndex}-${slotIndex}`)
    );

    const placeholdersNeeded = MAX_BADGE_SLOTS_PER_ROW - rowSlots.length;
    for (let placeholderIndex = 0; placeholderIndex < placeholdersNeeded; placeholderIndex++) {
      rowSlots.push(renderDefaultBadge(`default-${rowIndex}-${placeholderIndex}`));
    }

    rows.push(rowSlots);
  }

  return (
    <Panel className={styles.Container}>
      <PanelBody className={styles.Body}>
        <h3 className={styles.Title}>Achievements</h3>
        <div className={styles.BadgesContainer}>
          {rows.map((row, rowIndex) => (
            <div key={`badge-row-${rowIndex}`} className={styles.BadgeRow}>
              {row}
            </div>
          ))}
        </div>
      </PanelBody>
    </Panel>
  );
};
