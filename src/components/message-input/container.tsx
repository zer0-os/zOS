import React, { RefObject } from 'react';
import { User } from '../../store/channels';
import { UserForMention, Media } from './utils';
import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';
import { ViewModes } from '../../shared-components/theme-engine';
import { MessageInput as MessageInputComponent } from './index';
import { ParentMessage } from '../../lib/chat/types';

export interface PublicProperties {
  className?: string;
  onSubmit: (message: string, mentionedUserIds: User['userId'][], media: Media[]) => void;
  initialValue?: string;
  getUsersForMentions: (search: string) => Promise<UserForMention[]>;
  renderAfterInput?: (value: string, mentionedUserIds: User['userId'][]) => React.ReactNode;
  onMessageInputRendered?: (textareaRef: RefObject<HTMLTextAreaElement>) => void;
  id?: string;
  reply?: null | ParentMessage;
  onRemoveReply?: () => void;
}

export interface Properties extends PublicProperties {
  viewMode: ViewModes;
  isFullScreen: boolean;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      theme: {
        value: { viewMode },
      },
      layout,
    } = state;

    return {
      viewMode,
      isFullScreen: layout.value?.isMessengerFullScreen,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {};
  }

  render() {
    return (
      <MessageInputComponent
        className={this.props.className}
        id={this.props.id}
        initialValue={this.props.initialValue}
        onSubmit={this.props.onSubmit}
        getUsersForMentions={this.props.getUsersForMentions}
        renderAfterInput={this.props.renderAfterInput}
        onMessageInputRendered={this.props.onMessageInputRendered}
        onRemoveReply={this.props.onRemoveReply}
        viewMode={this.props.viewMode}
        reply={this.props.reply}
        isMessengerFullScreen={this.props.isFullScreen}
      />
    );
  }
}

export const MessageInput = connectContainer<PublicProperties>(Container);
