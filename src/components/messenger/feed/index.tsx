import React from 'react';
import { RootState } from '../../../store/reducer';
import { connectContainer } from '../../../store/redux-container';
import { ScrollbarContainer } from '../../scrollbar-container';
import { PostPayload as PayloadPostMessage } from '../../../store/posts/saga';
import { Channel, denormalize } from '../../../store/channels';
import { MessageSendStatus } from '../../../store/messages';
import { sendPost, sendPostIrys } from '../../../store/posts';
import { FeedViewContainer } from './feed-view-container/feed-view-container';
import { PostInputContainer as PostInput } from './components/post-input/container';
import { ConversationHeaderContainer as ConversationHeader } from '../conversation-header/container';
import { LeaveGroupDialogContainer } from '../../group-management/leave-group-dialog/container';
import { LeaveGroupDialogStatus, setLeaveGroupStatus } from '../../../store/group-management';
import { featureFlags } from '../../../lib/feature-flags';

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
  leaveGroupDialogStatus: LeaveGroupDialogStatus;
  isSubmittingPost: boolean;

  sendPost: (payload: PayloadPostMessage) => void;
  setLeaveGroupStatus: (status: LeaveGroupDialogStatus) => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      chat: { activeConversationId, isJoiningConversation },
      groupManagement,
      posts,
    } = state;

    const currentChannel = denormalize(activeConversationId, state) || null;

    return {
      channel: currentChannel,
      isJoiningConversation,
      activeConversationId,
      isSubmittingPost: posts?.isSubmitting,
      leaveGroupDialogStatus: groupManagement.leaveGroupDialogStatus,
      isSocialChannel: currentChannel?.isSocialChannel,
    };
  }

  static mapActions(): Partial<Properties> {
    return {
      sendPost: featureFlags.enableIrysPosting ? sendPostIrys : sendPost,
      setLeaveGroupStatus,
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
    if (featureFlags.enableIrysPosting) {
      return this.props.isSubmittingPost;
    } else {
      return this.props.channel?.messages
        .filter((message) => message.isPost)
        .some((message) => message.sendStatus === MessageSendStatus.IN_PROGRESS);
    }
  }

  get isLeaveGroupDialogOpen() {
    return this.props.leaveGroupDialogStatus !== LeaveGroupDialogStatus.CLOSED;
  }

  closeLeaveGroupDialog = () => {
    this.props.setLeaveGroupStatus(LeaveGroupDialogStatus.CLOSED);
  };

  renderLeaveGroupDialog = (): JSX.Element => {
    return (
      <LeaveGroupDialogContainer
        groupName={this.props.channel.name}
        onClose={this.closeLeaveGroupDialog}
        roomId={this.props.activeConversationId}
      />
    );
  };

  render() {
    const { isJoiningConversation, activeConversationId, isSocialChannel } = this.props;

    if (!activeConversationId || !isSocialChannel || isJoiningConversation) {
      return null;
    }

    return (
      <div {...cn('')}>
        <div {...cn('header-position', !this.props.channel?.hasLoadedMessages && 'message-loading')}>
          <div {...cn('header')}>
            <ConversationHeader />
          </div>
        </div>

        <ScrollbarContainer variant='on-hover'>
          <PostInput id={activeConversationId} onSubmit={this.submitPost} isSubmitting={this.isSubmitting} />

          <FeedViewContainer channelId={activeConversationId} />
        </ScrollbarContainer>

        {this.isLeaveGroupDialogOpen && this.renderLeaveGroupDialog()}
      </div>
    );
  }
}

export const MessengerFeed = connectContainer<PublicProperties>(Container);
