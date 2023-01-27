import React from 'react';

require('./styles.scss');

export interface Properties {
  message: string;
  onRemove?: () => void;
}

export default class ReplyCard extends React.Component<Properties, undefined> {
  itemRemoved = () => {
    if (this.props.onRemove) {
      this.props.onRemove();
    }
  };

  render() {
    const { message } = this.props;

    return (
      <div className='reply-card'>
        <div className='reply-card__container'>
          <div className='reply-card__icon'></div>
          <div className='reply-card__message'>{message}</div>
          <span
            className='reply-card__icon-close'
            onClick={this.itemRemoved}
          />
        </div>
      </div>
    );
  }
}
