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
    return (successes / total) * 100;
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
          return 'Your encrypted messages have been successfully restored!';
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
    const { stage, failures } = this.props.progress;
    const percentage = this.getProgressPercentage();
    const isComplete = percentage === 100;
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
            <span {...cn('message')} data-is-complete={isComplete}>
              {message}
            </span>

            {percentage > 0 && (
              <span {...cn('percentage')} data-is-complete={isComplete}>{`(${Math.round(percentage)}%)`}</span>
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
