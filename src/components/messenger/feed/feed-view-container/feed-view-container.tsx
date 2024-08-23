import React from 'react';
import { RootState } from '../../../../store/reducer';
import { connectContainer } from '../../../../store/redux-container';
import { Payload as PayloadFetchPost } from '../../../../store/posts/saga';
import { Channel, denormalize } from '../../../../store/channels';
import { MessageSendStatus } from '../../../../store/messages';
import { fetchPosts } from '../../../../store/posts';
import { AuthenticationState } from '../../../../store/authentication/types';
import { FeedView } from './feed-view';

interface PublicProperties {
  channelId: string;
}

export interface Properties extends PublicProperties {
  channel: Channel;
  user: AuthenticationState['user'];
  activeConversationId?: string;

  fetchPosts: (payload: PayloadFetchPost) => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState, props: PublicProperties): Partial<Properties> {
    const channel = denormalize(props.channelId, state) || null;
    const {
      authentication: { user },
      chat: { activeConversationId },
    } = state;

    return {
      channel,
      user,
      activeConversationId,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      fetchPosts,
    };
  }

  componentDidMount() {
    const { channelId, channel } = this.props;
    if (channelId && !channel.hasLoadedMessages) {
      this.props.fetchPosts({ channelId });
    }
  }

  componentDidUpdate(prevProps: Properties) {
    const { channelId } = this.props;

    if (channelId && channelId !== prevProps.channelId) {
      this.props.fetchPosts({ channelId });
    }

    if (channelId && prevProps.user.data === null && this.props.user.data !== null) {
      this.props.fetchPosts({ channelId });
    }
  }

  getOldestTimestamp(messages = []) {
    return messages.reduce((previousTimestamp, message) => {
      return message.createdAt < previousTimestamp ? message.createdAt : previousTimestamp;
    }, Date.now());
  }

  get channel(): Channel {
    return this.props.channel || ({} as Channel);
  }

  fetchMorePosts = () => {
    const { channelId, channel } = this.props;

    if (channel.hasMorePosts) {
      const referenceTimestamp = this.getOldestTimestamp(this.postMessages);
      this.props.fetchPosts({ channelId: channelId, referenceTimestamp });
    }
  };

  get postMessages() {
    const messages = this.props.channel?.messages || [];
    return messages.filter((message) => message.isPost && message.sendStatus === MessageSendStatus.SUCCESS).reverse();
  }

  render() {
    if (!this.props.channel) return null;

    return (
      <>
        <FeedView
          postMessages={this.postMessages}
          fetchPosts={this.props.fetchPosts}
          onFetchMore={this.fetchMorePosts}
          hasLoadedMessages={this.channel.hasLoadedMessages ?? false}
          messagesFetchStatus={this.channel.messagesFetchStatus}
        />
      </>
    );
  }
}

export const FeedViewContainer = connectContainer<PublicProperties>(Container);
