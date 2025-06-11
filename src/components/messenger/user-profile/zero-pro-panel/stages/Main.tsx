import React from 'react';

import ZeroProSymbol from '../../../../../zero-pro-symbol.svg?react';
import { IconCheck } from '@zero-tech/zui/icons';
import { Button, Variant as ButtonVariant } from '@zero-tech/zui/components/Button';

import styles from './styles.module.scss';

const benefits = [
  {
    title: 'Earn Daily Income',
    subtitle: 'Only Pro members receive rewards',
  },
  {
    title: 'Pro Badge',
    subtitle: 'Flex with a special Pro badge',
  },
  {
    title: 'Earn Affiliate Fees',
    subtitle: 'Earn 30% of subscriptions from your code',
  },
];

interface Props {
  onNext: () => void;
}

export const Main: React.FC<Props> = ({ onNext }) => (
  <div className={styles.MainPanelContent}>
    <div className={styles.Hero}>
      <div className={styles.Logo}>
        <ZeroProSymbol width={120} height={120} />
      </div>
      <div className={styles.Title}>ZERO Pro</div>
      <div className={styles.Subtitle}>Supercharge your rewards.</div>
    </div>
    <div className={styles.BenefitsSection}>
      <div className={styles.SectionHeaderRow}>
        <div className={styles.SectionLine} />
        <div className={styles.SectionHeader}>Member Benefits</div>
        <div className={styles.SectionLine} />
      </div>
      <div className={styles.PanelList}>
        {benefits.map((benefit) => (
          <div className={styles.PanelItem} key={benefit.title}>
            <div className={styles.PanelItemText}>
              <div className={styles.PanelItemTitle}>{benefit.title}</div>
              <div className={styles.PanelItemSubtitle}>{benefit.subtitle}</div>
            </div>
            <IconCheck className={styles.PanelItemCheck} size={20} />
          </div>
        ))}
      </div>
    </div>

    <div className={styles.SubmitButtonContainer}>
      <Button className={styles.SubmitButton} variant={ButtonVariant.Primary} isSubmit onPress={onNext}>
        Subscribe to ZERO Pro
      </Button>
    </div>
  </div>
);
