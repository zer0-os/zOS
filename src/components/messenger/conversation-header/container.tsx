import React from 'react';
import { RootState } from '../../../store/reducer';
import { connectContainer } from '../../../store/redux-container';
import { Channel, denormalize } from '../../../store/channels';
import { toggleSecondarySidekick } from '../../../store/group-management';
import { ConversationHeader } from '.';
import { ConversationActionsContainer as ConversationActions } from '../conversation-actions/container';
import { PanelHeader } from '../../layout/panel';

import { bemClassName } from '../../../lib/bem';
import './styles.scss';

const cn = bemClassName('conversation-header');

export interface PublicProperties {
  className?: string;
}

export interface Properties extends PublicProperties {
  activeConversationId: string;
  directMessage: Channel;
  isJoiningConversation: boolean;
  isSecondarySidekickOpen: boolean;

  toggleSecondarySidekick: () => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      chat: { activeConversationId, isJoiningConversation },
      groupManagement,
    } = state;

    const directMessage = denormalize(activeConversationId, state);

    return {
      activeConversationId,
      directMessage,
      isJoiningConversation,
      isSecondarySidekickOpen: groupManagement.isSecondarySidekickOpen,
    };
  }

  static mapActions(): Partial<Properties> {
    return {
      toggleSecondarySidekick,
    };
  }

  isOneOnOne() {
    return this.props.directMessage?.isOneOnOne;
  }

  render() {
    if (
      ((!this.props.activeConversationId || !this.props.directMessage) && !this.props.isJoiningConversation) ||
      !this.props.directMessage
    ) {
      return null;
    }

    return (
      <PanelHeader {...cn('')}>
        <ConversationHeader
          className={this.props.className}
          name={this.props.directMessage.name}
          isOneOnOne={this.isOneOnOne()}
          otherMembers={this.props.directMessage.otherMembers || []}
          toggleSecondarySidekick={this.props.toggleSecondarySidekick}
        />
        <div {...cn('actions-container')}>
          <ConversationActions />
        </div>
      </PanelHeader>
    );
  }
}

export const ConversationHeaderContainer = connectContainer<PublicProperties>(Container);
