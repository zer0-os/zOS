import * as React from 'react';
import { bemClassName } from '../../../../lib/bem';
import { RestoreProgress } from '../../../../store/matrix';

import './styles.scss';

const cn = bemClassName('secure-backup-progress');

export interface Properties {
  progress: RestoreProgress;
}

export class ProgressTracker extends React.Component<Properties> {
  getProgressPercentage = () => {
    const { total, successes } = this.props.progress;
    if (total === 0) return 0;

    const actualPercentage = (successes / total) * 100;
    return actualPercentage >= 90 ? 100 : actualPercentage;
  };

  getContextualMessage = () => {
    const { stage } = this.props.progress;

    const percentage = this.getProgressPercentage();

    switch (stage) {
      case 'start':
        return 'Preparing to restore your encrypted messages...';
      case 'fetch':
        return 'Retrieving your secure backup...(Please wait a few moments)';
      case 'load_keys':
        if (percentage === 100) {
          return '';
        }

        if (percentage < 25) {
          return 'Starting to restore your encrypted messages...';
        } else if (percentage < 50) {
          return 'Loading your encrypted conversations...';
        } else if (percentage < 75) {
          return 'Almost there! Restoring your final messages...';
        } else {
          return 'Finishing up! Just a few more messages to restore...';
        }
      default:
        return '';
    }
  };

  render() {
    const { stage, total, successes, failures } = this.props.progress;
    const percentage = this.getProgressPercentage();
    const isComplete = stage === 'load_keys' && successes === total;
    const message = this.getContextualMessage();

    if (!stage) {
      return null;
    }

    return (
      <div {...cn('')}>
        <div>
          <div {...cn('progress-bar-container')}>
            <div {...cn('progress-bar')} style={{ width: `${percentage}%` }} />
          </div>
          <div {...cn('progress-text')}>
            <span {...cn('message')}>{message}</span>

            {isComplete && <p {...cn('success-message')}>Your encrypted messages have been successfully restored!</p>}
            {percentage > 0 && (
              <span {...cn('percentage')} data-is-complete={percentage === 100}>{`(${Math.round(percentage)}%)`}</span>
            )}
          </div>
        </div>

        {failures > 0 && (
          <p {...cn('failure-message')}>
            {failures} {failures === 1 ? 'key' : 'keys'} could not be restored. Some messages may remain encrypted.
          </p>
        )}
      </div>
    );
  }
}
