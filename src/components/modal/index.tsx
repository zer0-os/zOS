import * as React from 'react';

import { Button, IconButton, Modal as ZuiModal } from '@zero-tech/zui/components';
import { IconXClose } from '@zero-tech/zui/icons';

import { bemClassName } from '../../lib/bem';
import './styles.scss';

const cn = bemClassName('modal');

export interface Properties {
  title: string;
  primaryText?: string;
  secondaryText?: string;

  onClose: () => void;
  onPrimary?: () => void;
  onSecondary?: () => void;
}

export class Modal extends React.Component<Properties> {
  publishIfClosing = (open: boolean) => {
    if (!open) {
      this.props.onClose();
    }
  };

  render() {
    return (
      <ZuiModal open={true} onOpenChange={this.publishIfClosing}>
        <div {...cn('')}>
          <div {...cn('title-bar')}>
            <h3 {...cn('title')}>{this.props.title}</h3>
            <IconButton {...cn('close')} size='large' Icon={IconXClose} onClick={this.props.onClose} />
          </div>

          <div {...cn('body')}>{this.props.children}</div>

          <div {...cn('footer')}>
            {this.props.onSecondary && (
              <Button {...cn('text-button')} variant='text' onPress={this.props.onSecondary}>
                <div {...cn('text-button-text')}>{this.props.secondaryText}</div>
              </Button>
            )}

            {/* XXX: text-button styles? */}
            {this.props.onPrimary && (
              <Button
                {...cn('text-button')}
                variant='negative'
                onPress={this.props.onPrimary}
                // isLoading={this.props.status === LeaveGroupDialogStatus.IN_PROGRESS}
              >
                <div {...cn('text-button-text')}>{this.props.primaryText}</div>
              </Button>
            )}
          </div>
        </div>
      </ZuiModal>
    );
  }
}
