import React from 'react';
import { RootState } from '../../../store/reducer';
import { connectContainer } from '../../../store/redux-container';
import { ScrollbarContainer } from '../../scrollbar-container';
import { CreatePost } from './components/create-post';
import { PostPayload as PayloadPostMessage } from '../../../store/posts/saga';
import { Channel, denormalize } from '../../../store/channels';
import { MessageSendStatus } from '../../../store/messages';
import { sendPost } from '../../../store/posts';
import { AuthenticationState } from '../../../store/authentication/types';
import { FeedViewContainer } from './feed-view-container/feed-view-container';

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
    };
  }

  submitPost = (message: string) => {
    const { activeConversationId } = this.props;

    let payloadPostMessage = {
      channelId: activeConversationId,
      message: message,
    };

    this.props.sendPost(payloadPostMessage);
  };

  get isSubmitting() {
    return this.props.channel?.messages.some((message) => message.sendStatus === MessageSendStatus.IN_PROGRESS);
  }

  render() {
    const { isJoiningConversation, activeConversationId, isSocialChannel } = this.props;

    if (!activeConversationId || !isSocialChannel || isJoiningConversation) {
      return null;
    }

    return (
      <div {...cn('')}>
        <ScrollbarContainer variant='on-hover'>
          <CreatePost
            avatarUrl={this.props.user.data?.profileSummary.profileImage}
            onSubmit={this.submitPost}
            isSubmitting={this.isSubmitting}
          />

          <FeedViewContainer channelId={activeConversationId} />
        </ScrollbarContainer>
      </div>
    );
  }
}

export const MessengerFeed = connectContainer<PublicProperties>(Container);
