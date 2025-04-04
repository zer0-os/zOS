import * as React from 'react';
import { getProgressText } from '../utils';
import { bemClassName } from '../../../../lib/bem';
import { RestoreProgress } from '../../../../store/matrix';

const cn = bemClassName('secure-backup');

export const ProgressTracker = ({ progress }: { progress: RestoreProgress }) => {
  const { stage, total, successes } = progress;

  if (!stage) {
    return null;
  }

  const progressText = getProgressText(stage, total, successes);

  return (
    <div {...cn('restore-progress-container')}>
      <p {...cn('secondary-text')}>{progressText}</p>
    </div>
  );
};
