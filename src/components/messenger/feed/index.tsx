import React, { ReactNode } from 'react';
import { RootState } from '../../../store/reducer';
import { connectContainer } from '../../../store/redux-container';
import { Posts } from './components/posts';
import { ScrollbarContainer } from '../../scrollbar-container';
import { CreatePost } from './components/create-post';
import { PostPayload as PayloadPostMessage, Payload as PayloadFetchPosts } from '../../../store/posts/saga';
import { Channel, denormalize } from '../../../store/channels';
import { MessageSendStatus } from '../../../store/messages';
import { fetchPosts, sendPost } from '../../../store/posts';
import { AuthenticationState } from '../../../store/authentication/types';
import { Waypoint } from 'react-waypoint';
import { Spinner } from '@zero-tech/zui/components/LoadingIndicator';

import { bemClassName } from '../../../lib/bem';
import './styles.scss';

const cn = bemClassName('messenger-feed');

export interface PublicProperties {}

export interface Properties extends PublicProperties {
  user: AuthenticationState['user'];
  channel: Channel;
  activeConversationId: string;
  isSocialChannel: boolean;
  isJoiningConversation: boolean;

  sendPost: (payload: PayloadPostMessage) => void;
  fetchPosts: (payload: PayloadFetchPosts) => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      authentication: { user },
      chat: { activeConversationId, isJoiningConversation },
    } = state;

    const currentChannel = denormalize(activeConversationId, state) || null;

    return {
      user,
      channel: currentChannel,
      isJoiningConversation,
      activeConversationId,
      isSocialChannel: currentChannel?.isSocialChannel,
    };
  }

  static mapActions(): Partial<Properties> {
    return {
      sendPost,
      fetchPosts,
    };
  }

  componentDidMount() {
    const { activeConversationId, channel } = this.props;
    if (activeConversationId && !channel.hasLoadedMessages) {
      this.props.fetchPosts({ channelId: activeConversationId });
    }
  }

  componentDidUpdate(prevProps: Properties) {
    const { activeConversationId } = this.props;

    if (activeConversationId && activeConversationId !== prevProps.activeConversationId) {
      this.props.fetchPosts({ channelId: activeConversationId });
    }

    if (activeConversationId && prevProps.user.data === null && this.props.user.data !== null) {
      this.props.fetchPosts({ channelId: activeConversationId });
    }
  }

  getOldestTimestamp(messages = []) {
    return messages.reduce((previousTimestamp, message) => {
      return message.createdAt < previousTimestamp ? message.createdAt : previousTimestamp;
    }, Date.now());
  }

  fetchMorePosts = () => {
    const { activeConversationId, channel } = this.props;

    if (channel.hasMorePosts) {
      const referenceTimestamp = this.getOldestTimestamp(this.postMessages);
      this.props.fetchPosts({ channelId: activeConversationId, referenceTimestamp });
    }
  };

  submitPost = (message: string) => {
    const { activeConversationId } = this.props;

    let payloadPostMessage = {
      channelId: activeConversationId,
      message: message,
    };

    this.props.sendPost(payloadPostMessage);
  };

  get postMessages() {
    const messages = this.props.channel?.messages || [];
    return messages.filter((message) => message.isPost && message.sendStatus === MessageSendStatus.SUCCESS).reverse();
  }

  get isSubmitting() {
    return this.props.channel?.messages.some((message) => message.sendStatus === MessageSendStatus.IN_PROGRESS);
  }

  render() {
    const { channel, isJoiningConversation, activeConversationId, isSocialChannel } = this.props;

    if (!activeConversationId || !isSocialChannel || isJoiningConversation) {
      return null;
    }

    return (
      <>
        <div {...cn('')}>
          <ScrollbarContainer variant='on-hover'>
            <CreatePost
              avatarUrl={this.props.user.data?.profileSummary.profileImage}
              onSubmit={this.submitPost}
              isSubmitting={this.isSubmitting}
            />
            {channel.hasLoadedMessages && (
              <>
                {this.postMessages.length > 0 ? (
                  <>
                    <Posts postMessages={this.postMessages} />
                    <Waypoint onEnter={this.fetchMorePosts} />
                  </>
                ) : (
                  <Message>Nobody has posted here yet</Message>
                )}
              </>
            )}

            {!channel.hasLoadedMessages && (
              <Message>
                <Spinner />
              </Message>
            )}
          </ScrollbarContainer>
        </div>

        <div {...cn('divider')} />
      </>
    );
  }
}

const Message = ({ children }: { children: ReactNode }) => {
  return <div {...cn('message')}>{children}</div>;
};

export const MessengerFeed = connectContainer<PublicProperties>(Container);
