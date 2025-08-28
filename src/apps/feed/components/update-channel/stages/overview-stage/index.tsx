import React from 'react';

import { Button } from '@zero-tech/zui/components/Button';
import { IconLock } from '@zero-tech/zui/icons';

import styles from './styles.module.scss';

interface OverviewStageProps {
  onNext: () => void;
}

export const OverviewStage = ({ onNext }: OverviewStageProps) => {
  return (
    <div className={styles.Stage}>
      <div className={styles.Header}>
        <div className={styles.IconContainer}>
          <IconLock size={48} />
        </div>
        <h2 className={styles.Title}>Token Gated Settings</h2>

        <p className={styles.Description}>
          Update your channel to use the new token gating system. This will allow you to set a specific token and amount
          required for users to join your channel.
          <br />
          <br />
          Currently only subdomain holders can access this channel.
          <br />
          <br />
          If you choose to set a token, users who own a subdomain will still be able to access the channel.
        </p>
      </div>

      <div className={styles.Content}>
        <div className={styles.Steps}>
          <div className={styles.Step}>
            <div className={styles.StepNumber}>1</div>
            <div className={styles.StepContent}>
              <h3>Find Token</h3>
              <p>Search for the token you want to use for gating</p>
            </div>
          </div>
          <div className={styles.Step}>
            <div className={styles.StepNumber}>2</div>
            <div className={styles.StepContent}>
              <h3>Set Amount</h3>
              <p>Choose how much of the token users need to hold</p>
            </div>
          </div>
          <div className={styles.Step}>
            <div className={styles.StepNumber}>3</div>
            <div className={styles.StepContent}>
              <h3>Review & Update</h3>
              <p>Review your settings and update the channel</p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.Actions}>
        <Button onPress={onNext}>Get Started</Button>
      </div>
    </div>
  );
};
