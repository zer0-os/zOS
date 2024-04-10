import * as React from 'react';

import { IconButton } from '@zero-tech/zui/components';
import { Button, Variant as ButtonVariant } from '@zero-tech/zui/components/Button';
import { IconXClose } from '@zero-tech/zui/icons';

import classNames from 'classnames';
import { bemClassName } from '../../lib/bem';

import './styles.scss';

const cn = bemClassName('error-dialog');

export interface Properties {
  header: string;
  body: string;

  linkPath?: string;
  linkText?: string;

  onClose?: () => void;
}

export class ErrorDialog extends React.Component<Properties> {
  render() {
    const { header, body, linkPath, linkText, onClose } = this.props;
    const hasLink = linkPath && linkText;

    return (
      <div {...cn('')}>
        <IconButton {...cn('close')} size={40} Icon={IconXClose} onClick={onClose} />

        <div {...cn('heading-container')}>
          <div {...cn('header')}>{header}</div>
        </div>
        <div {...cn('body')}>{body}</div>
        <div {...cn('footer', classNames({ 'is-single-button': !hasLink }))}>
          <Button onPress={onClose} variant={hasLink ? ButtonVariant.Secondary : ButtonVariant.Primary}>
            Back to my conversations
          </Button>
          {hasLink && (
            <a {...cn('link')} href={linkPath} target='_blank' rel='noopener noreferrer'>
              {linkText}
            </a>
          )}
        </div>
      </div>
    );
  }
}
