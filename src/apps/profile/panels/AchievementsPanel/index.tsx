import React from 'react';
import { Panel, PanelBody } from '../../../../components/layout/panel';
import { useAchievements, Achievement } from '../../lib/useAchievements';
import { useProfileApp } from '../../lib/useProfileApp';
import Tooltip from '../../../../components/tooltip';

// Import badge SVGs as React components
import MrWorldwideBadge from './badges/mr-worldwide.svg?react';
import Blockchain101Badge from './badges/blockchain-101.svg?react';
import DefaultBadge from './badges/default.svg?react';

import styles from './styles.module.scss';

// Map badge names to their corresponding SVG components
const badgeComponents: Record<string, React.ComponentType> = {
  'Mr. Worldwide': MrWorldwideBadge,
  'Blockchain 101': Blockchain101Badge,
};

const BadgeIcon: React.FC<{ achievement: Achievement }> = ({ achievement }) => {
  const BadgeComponent = badgeComponents[achievement.name];
  return <BadgeComponent />;
};

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

  // Maximum number of badge slots to show
  const MAX_BADGE_SLOTS = 4;

  // Create array of all badge slots (achievements + defaults)
  const badgeSlots = [];

  // Add actual achievements
  for (let i = 0; i < achievements.length; i++) {
    badgeSlots.push(
      <Tooltip
        key={`achievement-${i}`}
        overlay={<AchievementTooltipContent achievement={achievements[i]} />}
        placement='top'
        overlayInnerStyle={{
          padding: 0,
          boxShadow: 'none',
          minHeight: 'unset',
        }}
      >
        <div className={styles.Badge}>
          <BadgeIcon achievement={achievements[i]} />
        </div>
      </Tooltip>
    );
  }

  // Fill remaining slots with default badges
  for (let i = achievements.length; i < MAX_BADGE_SLOTS; i++) {
    badgeSlots.push(
      <div key={`default-${i}`} className={styles.DefaultBadge}>
        <DefaultBadge />
      </div>
    );
  }

  return (
    <Panel className={styles.Container}>
      <PanelBody className={styles.Body}>
        <h3 className={styles.Title}>Achievements</h3>
        <div className={styles.BadgesContainer}>{badgeSlots}</div>
      </PanelBody>
    </Panel>
  );
};
