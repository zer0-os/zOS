import React from 'react';
import classNames from 'classnames';
import moment from 'moment';
import { Message as MessageModel } from '../../store/messages';

interface Properties extends MessageModel {
  isFirstFromUser: boolean;
}

export class Message extends React.Component<Properties> {
  renderImage() {
    const {
      media: { type, url, name },
    } = this.props;
    if (type === 'image') {
      return (
        <div className='message__block-image'>
          <img
            src={url}
            alt={name}
          />
        </div>
      );
    } else if (type === 'video') {
      return (
        <div className='message__block-video'>
          <video controls>
            <source src={url} />
          </video>
        </div>
      );
    }
    return '';
  }

  renderTime(): React.ReactElement {
    const createdTime = moment(this.props.createdAt).format('HH:mm');

    return (
      <div className={classNames('message__time', { 'message__time--hidden': !this.props.isFirstFromUser })}>
        {createdTime}
      </div>
    );
  }

  render() {
    return (
      <div className='message'>
        <div className='message__block'>
          <div className='message__block-icon'></div>
          {this.props.media && this.renderImage()}
          {this.props.message && <div className='message__block-body'>{this.props.message}</div>}
          {this.renderTime()}
        </div>
      </div>
    );
  }
}
