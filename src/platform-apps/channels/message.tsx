import React from 'react';
import classNames from 'classnames';
import moment from 'moment';
import { Message as MessageModel } from '../../store/messages';

interface Properties extends MessageModel {
  className: string;
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

    return <div className='message__time'>{createdTime}</div>;
  }

  render() {
    return (
      <div className={classNames('message', this.props.className)}>
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
