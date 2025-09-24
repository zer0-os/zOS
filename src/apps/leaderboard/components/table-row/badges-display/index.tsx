import { Badge } from '../../utils';
import Tooltip from '../../../../../components/tooltip';

// Import badge SVGs as React components
import WorldBuilderBadge from './icons/world-builder.svg?react';
import Blockchain101Badge from './icons/blockchain101.svg?react';
import DefaultBadge from './icons/default.svg?react';

import styles from './styles.module.scss';

interface BadgesDisplayProps {
  badges: Badge[];
}

// Map badge names to their corresponding SVG components
const badgeComponents: Record<string, React.ComponentType> = {
  'World Builder': WorldBuilderBadge,
  'Blockchain 101': Blockchain101Badge,
  Referral: DefaultBadge,
  'Pro Subscriptions': DefaultBadge,
};

const BadgeIcon: React.FC<{ badge: Badge }> = ({ badge }) => {
  const BadgeComponent = badgeComponents[badge.name];
  return <BadgeComponent />;
};

const BadgeTooltipContent: React.FC<{ badge: Badge }> = ({ badge }) => (
  <div className={styles.tooltipContent}>
    <div className={styles.tooltipHeader}>
      <div className={styles.tooltipTitle}>{badge.name}</div>
      <div className={styles.tooltipEffect}>{badge.effect}</div>
    </div>
    <div className={styles.tooltipDescription}>{badge.description}</div>
  </div>
);

export const BadgesDisplay: React.FC<BadgesDisplayProps> = ({ badges }) => {
  // If no badges, show single default badge
  if (!badges || badges.length === 0) {
    return (
      <div className={styles.badgesContainer}>
        <div className={styles.badge}>
          <DefaultBadge />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.badgesContainer}>
      {badges.map((badge, index) => (
        <Tooltip
          key={index}
          overlay={<BadgeTooltipContent badge={badge} />}
          placement='top'
          overlayInnerStyle={{
            background: 'transparent',
            padding: 0,
            boxShadow: 'none',
            minHeight: 'unset',
          }}
        >
          <div className={styles.badge}>
            <BadgeIcon badge={badge} />
          </div>
        </Tooltip>
      ))}
    </div>
  );
};
