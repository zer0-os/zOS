import React from 'react';
import { RootState } from '../../../store/reducer';
import { connectContainer } from '../../../store/redux-container';
import { ScrollbarContainer } from '../../scrollbar-container';
import { PostPayload as PayloadPostMessage } from '../../../store/posts/saga';
import { Channel, denormalize } from '../../../store/channels';
import { MessageSendStatus } from '../../../store/messages';
import { sendPost } from '../../../store/posts';
import { FeedViewContainer } from './feed-view-container/feed-view-container';
import { PostInputContainer as PostInput } from './components/post-input/container';

import { bemClassName } from '../../../lib/bem';
import './styles.scss';

// should move this to a shared location
import { Media } from '../../message-input/utils';

const cn = bemClassName('messenger-feed');

export interface PublicProperties {}

export interface Properties extends PublicProperties {
  channel: Channel;
  activeConversationId: string;
  isSocialChannel: boolean;
  isJoiningConversation: boolean;

  sendPost: (payload: PayloadPostMessage) => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      chat: { activeConversationId, isJoiningConversation },
    } = state;

    const currentChannel = denormalize(activeConversationId, state) || null;

    return {
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

  submitPost = (message: string, media: Media[] = []) => {
    const { activeConversationId } = this.props;

    let payloadPostMessage = {
      channelId: activeConversationId,
      message: message,
      files: media,
    };

    this.props.sendPost(payloadPostMessage);
  };

  get isSubmitting() {
    return this.props.channel?.messages
      .filter((message) => message.isPost)
      .some((message) => message.sendStatus === MessageSendStatus.IN_PROGRESS);
  }

  render() {
    const { isJoiningConversation, activeConversationId, isSocialChannel } = this.props;

    if (!activeConversationId || !isSocialChannel || isJoiningConversation) {
      return null;
    }

    return (
      <div {...cn('')}>
        <ScrollbarContainer variant='on-hover'>
          <PostInput id={activeConversationId} onSubmit={this.submitPost} isSubmitting={this.isSubmitting} />

          <FeedViewContainer channelId={activeConversationId} />
        </ScrollbarContainer>
      </div>
    );
  }
}

export const MessengerFeed = connectContainer<PublicProperties>(Container);
