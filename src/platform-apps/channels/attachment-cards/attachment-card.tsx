import React from 'react';
import classNames from 'classnames';

import './styles.scss';
import { IconVideoRecorder, IconXClose } from '@zero-tech/zui/icons';
import { IconButton } from '@zero-tech/zui/components';
import { MediaType } from '../../../store/messages';

export interface Attachment {
  name: string;
  type: MediaType;
  url: string;
}

export interface Properties {
  attachment: Attachment;
  onRemove?: (attachment: any) => void;
  onClick?: (attachment: Attachment) => void;
  type?: 'video' | 'file';
}

export default class AttachmentCard extends React.Component<Properties, undefined> {
  hasOnClick(): boolean {
    return typeof this.props.onClick === 'function';
  }

  onRemove = () => {
    if (this.props.onRemove) {
      this.props.onRemove(this.props.attachment);
    }
  };

  download = (event) => {
    event.stopPropagation();
    event.preventDefault();
    if (this.hasOnClick()) {
      this.props.onClick(this.props.attachment);
    }
  };

  renderPaperClip() {
    const size = 16;
    const color = '#ffffff';

    return (
      <svg width={size} height={size} viewBox='0 0 24 24' fill='none'>
        <path
          d='M21.4398 11.05L12.2498 20.24C11.124 21.3659 9.59699 21.9984 8.0048 21.9984C6.41262 21.9984 4.88565 21.3659 3.7598 20.24C2.63396 19.1142 2.00146 17.5872 2.00146 15.995C2.00146 14.4029 2.63396 12.8759 3.7598 11.75L12.9498 2.56004C13.7004 1.80948 14.7183 1.38782 15.7798 1.38782C16.8413 1.38782 17.8592 1.80948 18.6098 2.56004C19.3604 3.3106 19.782 4.32859 19.782 5.39004C19.782 6.4515 19.3604 7.46948 18.6098 8.22004L9.4098 17.41C9.03452 17.7853 8.52553 17.9962 7.9948 17.9962C7.46407 17.9962 6.95508 17.7853 6.5798 17.41C6.20452 17.0348 5.99369 16.5258 5.99369 15.995C5.99369 15.4643 6.20452 14.9553 6.5798 14.58L15.0698 6.10004'
          stroke={color}
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    );
  }

  file() {
    const content = (
      <div className='attachment-card__file'>
        <div className='attachment-card__icon'>
          {this.props.type === 'video' ? <IconVideoRecorder size={18} /> : this.renderPaperClip()}
        </div>
        <span className='attachment-card__name'>{this.props.attachment.name}</span>
      </div>
    );

    if (this.hasOnClick()) {
      return (
        <button className='attachment-card__info' onClick={this.download}>
          {content}
        </button>
      );
    }

    return <span className='attachment-card__info'>{content}</span>;
  }

  render() {
    const className = classNames('attachment-card', { downloadable: this.hasOnClick() });

    return (
      <div className={className}>
        {this.file()}
        {this.props.onRemove && (
          <IconButton Icon={IconXClose} onClick={this.onRemove} size={24} className='attachment-card__delete' />
        )}
      </div>
    );
  }
}
