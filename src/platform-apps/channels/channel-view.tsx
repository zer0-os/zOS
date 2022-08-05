import React from 'react';
import { Waypoint } from 'react-waypoint';
import { Message as MessageModel } from '../../store/messages';
import { Message } from './message';
import InvertedScroll from '../../components/inverted-scroll';

export interface Properties {
  name: string;
  messages: MessageModel[];
  onFetchMore: () => void;
}

export class ChannelView extends React.Component<Properties> {
  renderMessages() {
    return this.props.messages.map((message) => (
      <Message
        key={message.id}
        {...message}
      />
    ));
  }

  render() {
    return (
      <div className='channel-view'>
        <div className='channel-view__name'>{this.props.name}</div>
        <InvertedScroll className='channel-view__inverted-scroll'>
          {this.props.messages.length && <Waypoint onEnter={this.props.onFetchMore} />}
          {this.renderMessages()}
        </InvertedScroll>
      </div>
    );
  }
}
