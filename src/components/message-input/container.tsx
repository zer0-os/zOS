import React, { RefObject } from 'react';
import { User } from '../../store/channels';
import { UserForMention, Media } from './utils';
import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';
import { ViewModes } from '../../shared-components/theme-engine';
import { MessageInput as MessageInputComponent } from './index';
import { ParentMessage } from '../../lib/chat/types';
import { currentUserSelector } from '../../store/authentication/saga';

export interface PublicProperties {
  onSubmit: (message: string, mentionedUserIds: User['userId'][], media: Media[]) => void;
  initialValue?: string;
  getUsersForMentions: (search: string) => Promise<UserForMention[]>;
  renderAfterInput?: (value: string, mentionedUserIds: User['userId'][]) => React.ReactNode;
  onMessageInputRendered?: (textareaRef: RefObject<HTMLTextAreaElement>) => void;
  id?: string;
  reply?: null | ParentMessage;
  currentUserId?: string;
  onRemoveReply?: () => void;
  isEditing?: boolean;
  sendDisabledMessage?: string;
}

export interface Properties extends PublicProperties {
  viewMode: ViewModes;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const user = currentUserSelector()(state);
    const {
      theme: {
        value: { viewMode },
      },
    } = state;

    return {
      viewMode,
      currentUserId: user?.id,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {};
  }

  onMessageInputRendered = (textareaRef: RefObject<HTMLTextAreaElement>) => {
    const activeConversationId = this.props.id;
    if (textareaRef && textareaRef.current) {
      if ((activeConversationId && activeConversationId === textareaRef.current.id) || !activeConversationId) {
        textareaRef.current.focus();
      }
    }
  };

  render() {
    const { currentUserId, reply } = this.props;
    const replyIsCurrentUser = currentUserId && reply?.sender && currentUserId === reply.sender.userId;

    return (
      <MessageInputComponent
        id={this.props.id}
        initialValue={this.props.initialValue}
        onSubmit={this.props.onSubmit}
        getUsersForMentions={this.props.getUsersForMentions}
        renderAfterInput={this.props.renderAfterInput}
        onMessageInputRendered={this.onMessageInputRendered}
        onRemoveReply={this.props.onRemoveReply}
        viewMode={this.props.viewMode}
        reply={this.props.reply}
        replyIsCurrentUser={replyIsCurrentUser}
        isEditing={this.props.isEditing}
        sendDisabledMessage={this.props.sendDisabledMessage}
      />
    );
  }
}

export const MessageInput = connectContainer<PublicProperties>(Container);
