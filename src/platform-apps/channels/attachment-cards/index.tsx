import React from 'react';

import AttachmentCard from './attachment-card';

import './styles.scss';

export interface Properties {
  attachments: Array<{ url: string; name: string }>;
  onRemove?: (attachment: any) => void;
  border?: boolean;
  onAttachmentClicked?: (attachment: any) => void;
}

export default class AttachmentCards extends React.Component<Properties, undefined> {
  itemRemoved = (attachment) => {
    if (this.props.onRemove) {
      this.props.onRemove(attachment);
    }
  };

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
              onRemove={this.props.onRemove ? this.itemRemoved.bind(this, attachment) : null}
              onClick={this.props.onAttachmentClicked ? this.itemClicked : null}
            />
          );
        })}
      </div>
    );
  }
}
