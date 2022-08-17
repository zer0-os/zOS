import React from 'react';
import classNames from 'classnames';

// import { Icon } from 'components/icon';

import './styles.scss';

export interface Properties {
  attachment: { name: string };
  onRemove?: () => void;
  onClick?: (any) => void;
}

export default class AttachmentCard extends React.Component<Properties, undefined> {
  download = (event) => {
    event.stopPropagation();
    event.preventDefault();
    if (this.props.onClick) {
      this.props.onClick(this.props.attachment);
    }
  };

  file() {
    const content = (
      <span>
        {/* <Icon
          baseClass='attachment-card__icon'
          iconClass='paper-clip'
          size='xlarge'
        /> */}
        <span className='attachment-card__name'>{this.props.attachment.name}</span>
      </span>
    );

    if (this.props.onClick) {
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
    const className = classNames('attachment-card', { downloadable: !!this.props.onClick });

    return (
      <div className={className}>
        {this.file()}
        {this.props.onRemove && (
          <button onClick={this.props.onRemove}>
            {/* <Icon
              baseClass='attachment-card__delete'
              iconClass='times'
              size='small'
            /> */}
          </button>
        )}
      </div>
    );
  }
}
