import React from 'react';

import { Button, Variant as ButtonVariant } from '@zero-tech/zui/components/Button';

import styles from './styles.module.scss';

const plan = {
  title: 'Monthly plan',
  subtitle: '$120 per year, billed monthly',
  price: '$10 / month',
};

interface Props {
  onNext: () => void;
}

export const Plans: React.FC<Props> = ({ onNext }) => (
  <>
    <div className={styles.SectionContainer}>
      <div className={styles.SectionHeaderRow}>
        <div className={styles.SectionLine} />
        <div className={styles.SectionHeader}>ZERO Pro Subscription</div>
        <div className={styles.SectionLine} />
      </div>

      <div className={styles.PanelList}>
        <div className={styles.PanelItem}>
          <div className={styles.PanelItemText}>
            <div className={styles.PanelItemTitle}>{plan.title}</div>
            <div className={styles.PanelItemSubtitle}>{plan.subtitle}</div>
          </div>
          <div className={styles.PanelItemTitle}>{plan.price}</div>
        </div>
      </div>
    </div>

    <div className={styles.SubmitButtonContainer}>
      <Button className={styles.SubmitButton} variant={ButtonVariant.Primary} isSubmit onPress={onNext}>
        Pay with Credit Card
      </Button>
    </div>
  </>
);
