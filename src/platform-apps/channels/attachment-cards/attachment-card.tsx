import React from 'react';
import classNames from 'classnames';

import './styles.scss';
interface Attachment {
  name: string;
}
export interface Properties {
  attachment: Attachment;
  onRemove?: () => void;
  onClick?: (Attachement) => void;
}

export default class AttachmentCard extends React.Component<Properties, undefined> {
  hasOnClick(): boolean {
    return typeof this.props.onClick === 'function';
  }

  download = (event) => {
    event.stopPropagation();
    event.preventDefault();
    if (this.hasOnClick()) {
      this.props.onClick(this.props.attachment);
    }
  };

  file() {
    const content = (
      <span>
        <div className='attachment-card__icon bt-paper-clip btr'></div>
        <span className='attachment-card__name'>{this.props.attachment.name}</span>
      </span>
    );

    if (this.hasOnClick()) {
      return (
        <button
          className='attachment-card__info'
          onClick={this.download}
        >
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
        {this.props.onRemove && <button onClick={this.props.onRemove}></button>}
      </div>
    );
  }
}
