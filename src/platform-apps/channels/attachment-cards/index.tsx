import React from 'react';

import AttachmentCard, { Attachment } from './attachment-card';

import './styles.scss';

export interface Properties {
  attachments: Attachment[];
  onRemove?: (attachment: any) => void;
  onAttachmentClicked?: (attachment: any) => void;
  type?: 'video' | 'file';
}

export default class AttachmentCards extends React.Component<Properties, undefined> {
  itemClicked = (attachment) => {
    if (this.props.onAttachmentClicked) {
      this.props.onAttachmentClicked(attachment);
    }
  };

  render() {
    const { attachments } = this.props;

    if (attachments.length === 0) {
      return <span />;
    }

    return (
      <div className='attachment-cards__container'>
        {attachments.map((attachment) => {
          return (
            <AttachmentCard
              type={this.props.type}
              key={attachment.url}
              attachment={attachment}
              onRemove={this.props.onRemove}
              onClick={this.props.onAttachmentClicked ? this.itemClicked : null}
            />
          );
        })}
      </div>
    );
  }
}
