import * as React from 'react';

import { IconButton } from '@zero-tech/zui/components';
import { Button, Variant as ButtonVariant } from '@zero-tech/zui/components/Button';
import { IconXClose } from '@zero-tech/zui/icons';

import { bemClassName } from '../../../../../lib/bem';
import './styles.scss';

const cn = bemClassName('group-type-dialog');

export interface Properties {
  onClose?: () => void;
}

export class GroupTypeDialog extends React.Component<Properties> {
  render() {
    const { onClose } = this.props;

    return (
      <div {...cn('')}>
        <IconButton {...cn('close')} size={32} Icon={IconXClose} onClick={onClose} />

        <div {...cn('heading-container')}>
          <div {...cn('header')}>Group Type</div>
        </div>

        <div {...cn('body')}>
          <p {...cn('section-content')}>Choose the Group Type that best supports your group.</p>

          <h3 {...cn('section-header')}>Encrypted Group</h3>
          <p {...cn('section-content')}>
            Encrypted Groups are ideal for more focused, intimate conversations and are encrypted by default. Check this
            box if you are creating a room intended for smaller groups.
          </p>

          <h3 {...cn('section-header')}>Super Group</h3>
          <p {...cn('section-content')}>
            Super Groups are designed to accommodate larger communities and are not encrypted by default. Check this box
            if you are creating a room intended for larger groups (10+ people).
          </p>
        </div>

        <div {...cn('footer')}>
          <Button onPress={onClose} variant={ButtonVariant.Secondary}>
            Close
          </Button>
        </div>
      </div>
    );
  }
}
