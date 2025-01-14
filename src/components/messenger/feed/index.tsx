import React from 'react';
import { RootState } from '../../../store/reducer';
import { connectContainer } from '../../../store/redux-container';
import { PostPayload as PayloadPostMessage } from '../../../store/posts/saga';
import { Channel, denormalize } from '../../../store/channels';
import { sendPost } from '../../../store/posts';
import { ConversationHeaderContainer as ConversationHeader } from '../conversation-header/container';
import { LeaveGroupDialogContainer } from '../../group-management/leave-group-dialog/container';
import { LeaveGroupDialogStatus, setLeaveGroupStatus } from '../../../store/group-management';
import { Switch, Route } from 'react-router-dom';

import { bemClassName } from '../../../lib/bem';
import './styles.scss';

// should move this to a shared location
import { Media } from '../../message-input/utils';
import { PostView } from '../../../apps/feed/components/post-view-container';
import { MainFeed } from '../../../apps/feed/components/main-feed';

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
      sendPost: sendPost,
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
    return this.props.isSubmittingPost;
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

        <Switch>
          <Route
            path='/conversation/:conversationId/:postId'
            exact
            render={(props) => <PostView postId={props.match.params.postId} />}
          />
          <Route path='/conversation/:conversationId' exact component={MainFeed} />
        </Switch>
        {this.isLeaveGroupDialogOpen && this.renderLeaveGroupDialog()}
      </div>
    );
  }
}

export const MessengerFeed = connectContainer<PublicProperties>(Container);
