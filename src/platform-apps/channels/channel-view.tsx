import classNames from 'classnames';
import React from 'react';
import { Message as MessageModel } from '../../store/messages';
import { Message } from './message';

export interface Properties {
  name: string;
  messages: MessageModel[];
  onFirstMessageInViewport: (createdAt: MessageModel['createdAt']) => void;
}

interface State {
  hasScrolledToBottom: boolean;
}

export class ChannelView extends React.Component<Properties, State> {
  channelViewRef: React.RefObject<HTMLDivElement>;
  lastElementOnChannelViewRe: React.RefObject<HTMLDivElement>;
  state = { hasScrolledToBottom: false };

  constructor(props) {
    super(props);

    this.lastElementOnChannelViewRe = React.createRef();
    this.channelViewRef = React.createRef();
  }

  componentDidMount() {
    this.scrollToBottom();
  }

  scrollToBottom = () => {
    this.lastElementOnChannelViewRe.current?.scrollIntoView({ behavior: 'auto' });
    this.setState({ hasScrolledToBottom: true });
  };

  renderMessages() {
    return this.props.messages.map((message, index) => {
      let messagesProps: any = {};

      if (index === 0) {
        messagesProps.inView = this.firstMessageInViewHandler;
      }

      return (
        <Message
          key={message.id + index + 'khalid'}
          wrapperRef={this.channelViewRef}
          {...messagesProps}
          {...message}
        />
      );
    });
  }

  firstMessageInViewHandler = (createdAt: MessageModel['createdAt']) => {
    this.props.onFirstMessageInViewport(createdAt);
  };

  render() {
    return (
      <div
        className={classNames('channel-view', { 'channel-view--scrolling': !this.state.hasScrolledToBottom })}
        ref={this.channelViewRef}
      >
        <div className='channel-view__name'>{this.props.name}</div>
        {this.renderMessages()}
        <div ref={this.lastElementOnChannelViewRe}></div>
      </div>
    );
  }
}
