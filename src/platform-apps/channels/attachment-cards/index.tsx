import React from 'react';

import AttachmentCard, { Attachment } from './attachment-card';

import './styles.scss';

export interface Properties {
  attachments: Attachment[];
  border?: boolean;
  onAttachmentClicked?: (attachment: any) => void;
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
              key={attachment.url}
              attachment={attachment}
              onClick={this.props.onAttachmentClicked ? this.itemClicked : null}
            />
          );
        })}
      </div>
    );
  }
}
