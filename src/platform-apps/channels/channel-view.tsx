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
    return (
      <div className='messages'>
        {this.props.messages.map((message) => (
          <Message
            key={message.id}
            {...message}
          />
        ))}
      </div>
    );
  }

  render() {
    return (
      <div className='channel-view'>
        <div className='channel-view__name'>
          <h1>Welcome to #{this.props.name}</h1>
          <span>This is the start of the channel.</span>
        </div>
        <InvertedScroll className='channel-view__inverted-scroll'>
          {this.props.messages.length && <Waypoint onEnter={this.props.onFetchMore} />}
          {this.renderMessages()}
        </InvertedScroll>
      </div>
    );
  }
}
