import * as React from 'react';

import { IconLock1 } from '@zero-tech/zui/icons';

import { bemClassName } from '../../lib/bem';

import './styles.scss';

const cn = bemClassName('joining-conversation-dialog');

export class JoiningConversationDialog extends React.Component {
  render() {
    return (
      <div {...cn('')}>
        <div {...cn('content')}>
          <IconLock1 isFilled size={16} /> Joining conversation...
        </div>
      </div>
    );
  }
}
