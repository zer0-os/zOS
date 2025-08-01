import * as React from 'react';

import { Option } from '../../lib/types';

import { IconButton } from '@zero-tech/zui/components';
import { IconXClose } from '@zero-tech/zui/icons';
import { ZeroProBadge } from '../../../zero-pro-badge';

import classNames from 'classnames';
import { bemClassName } from '../../../../lib/bem';
import './selected-user-tag.scss';
import { MatrixAvatar } from '../../../matrix-avatar';

const cn = bemClassName('selected-user-tag');

type TagSizeType = 'compact' | 'spacious';

export interface Properties {
  userOption: Option;
  tagSize?: TagSizeType;
  inputRef?: React.RefObject<HTMLInputElement>;

  onRemove?: (id: string) => void;
}

export class SelectedUserTag extends React.Component<Properties> {
  publishRemove = () => {
    this.props.onRemove(this.props.userOption.value);

    if (this.props.inputRef?.current) {
      this.props.inputRef.current.focus();
    }
  };

  render() {
    const { userOption: option, tagSize = 'compact' } = this.props;
    const avatarSize = tagSize === 'compact' ? 'small' : 'regular';

    return (
      <div {...cn('', classNames({ [tagSize]: tagSize }))}>
        <div {...cn('avatar')}>
          <MatrixAvatar size={avatarSize} imageURL={option.image} />
        </div>

        <div {...cn('user-details')}>
          <div {...cn('user-label-container')}>
            <span {...cn('user-label')}>{option.label}</span>
            {option.isZeroProSubscriber && <ZeroProBadge size={16} />}
          </div>
          {option.subLabel && <span {...cn('user-sublabel')}>{option.subLabel}</span>}
        </div>

        {this.props.onRemove && (
          <IconButton
            {...cn('user-remove')}
            Icon={IconXClose}
            size={24}
            onClick={this.publishRemove}
            data-value={option.value}
          />
        )}
      </div>
    );
  }
}
