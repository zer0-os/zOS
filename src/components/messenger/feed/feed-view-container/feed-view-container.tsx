import React from 'react';
import { RootState } from '../../../../store/reducer';
import { connectContainer } from '../../../../store/redux-container';
import { Payload as PayloadFetchPost } from '../../../../store/posts/saga';
import { Channel, denormalize } from '../../../../store/channels';
import { Media, MessageSendStatus, loadAttachmentDetails } from '../../../../store/messages';
import { fetchPosts } from '../../../../store/posts';
import { AuthenticationState } from '../../../../store/authentication/types';
import { FeedView } from './feed-view';
import { linkMessages, mapMessagesById, mapMessagesByRootId } from '../../../chat-view-container/utils';
import { compareDatesAsc } from '../../../../lib/date';
import { transferMeow } from '../../../../store/rewards';

interface PublicProperties {
  channelId: string;
}

export interface Properties extends PublicProperties {
  channel: Channel;
  user: AuthenticationState['user'];
  activeConversationId?: string;
  userMeowBalance: string;
  transferError?: string;

  fetchPosts: (payload: PayloadFetchPost) => void;
  loadAttachmentDetails: (payload: { media: Media; messageId: string }) => void;
  transferMeow: (payload: {
    meowSenderId: string;
    postOwnerId: string;
    postMessageId: string;
    meowAmount: string;
    roomId: string;
  }) => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState, props: PublicProperties): Partial<Properties> {
    const channel = denormalize(props.channelId, state) || null;
    const {
      authentication: { user },
      chat: { activeConversationId },
      rewards: { meow, transferError },
    } = state;

    return {
      channel,
      user,
      activeConversationId,
      userMeowBalance: meow,
      transferError,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      fetchPosts,
      loadAttachmentDetails,
      transferMeow,
    };
  }

  componentDidMount() {
    const { channelId, channel } = this.props;
    if (channelId && !channel.hasLoadedMessages) {
      this.props.fetchPosts({ channelId });
    }
  }

  componentDidUpdate(prevProps: Properties) {
    const { channel, channelId } = this.props;

    if (channelId && channelId !== prevProps.channelId && !channel.hasLoadedMessages) {
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
    const allMessages = this.props.channel?.messages || [];

    const postMessages = allMessages.filter(
      (message) => message.isPost && message.sendStatus === MessageSendStatus.SUCCESS
    );

    const postMessagesById = mapMessagesById(postMessages);
    const postMessagesByRootId = mapMessagesByRootId(postMessages);
    const posts = linkMessages(postMessages, postMessagesById, postMessagesByRootId);

    return posts.sort((a, b) => compareDatesAsc(a.createdAt, b.createdAt)).reverse();
  }

  transferMeow = (postOwnerId, postMessageId, meowAmount) => {
    this.props.transferMeow({
      meowSenderId: this.props.user.data.id,
      postOwnerId,
      postMessageId,
      meowAmount,
      roomId: this.props.channelId,
    });
  };

  render() {
    if (!this.props.channel) return null;

    return (
      <>
        <FeedView
          currentUserId={this.props.user?.data?.id}
          postMessages={this.postMessages}
          fetchPosts={this.props.fetchPosts}
          onFetchMore={this.fetchMorePosts}
          hasLoadedMessages={this.channel.hasLoadedMessages ?? false}
          messagesFetchStatus={this.channel.messagesFetchStatus}
          loadAttachmentDetails={this.props.loadAttachmentDetails}
          transferMeow={this.transferMeow}
          userMeowBalance={this.props.userMeowBalance}
          transferError={this.props.transferError}
        />
      </>
    );
  }
}

export const FeedViewContainer = connectContainer<PublicProperties>(Container);
