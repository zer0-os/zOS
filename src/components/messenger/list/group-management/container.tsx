import React from 'react';
import { connectContainer } from '../../../../store/redux-container';

import { Stage, back, addSelectedMembers, MembersSelectedPayload } from '../../../../store/group-management';
import { Option } from '../../lib/types';

import { GroupManagement } from '.';
import { RootState } from '../../../../store/reducer';
import { GroupManagementErrors } from '../../../../store/group-management/types';
import { denormalize as denormalizeChannel } from '../../../../store/channels';

export interface PublicProperties {
  searchUsers: (search: string) => Promise<any>;
}

export interface Properties extends PublicProperties {
  stage: Stage;
  activeConversationId?: string;
  isAddingMembers: boolean;
  addMemberError: string;
  errors: GroupManagementErrors;
  name: string;
  conversationIcon: string;

  back: () => void;
  addSelectedMembers: (payload: MembersSelectedPayload) => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      groupManagement,
      chat: { activeConversationId },
    } = state;

    const conversation = denormalizeChannel(activeConversationId, state);

    return {
      activeConversationId,
      stage: groupManagement.stage,
      isAddingMembers: groupManagement.isAddingMembers,
      addMemberError: groupManagement.addMemberError,
      errors: groupManagement.errors,
      name: conversation?.name || '',
      conversationIcon: conversation?.icon || '',
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      back,
      addSelectedMembers,
    };
  }

  onAddMembers = async (selectedOptions: Option[]) => {
    this.props.addSelectedMembers({ roomId: this.props.activeConversationId, users: selectedOptions });
  };

  render() {
    return (
      <GroupManagement
        stage={this.props.stage}
        onBack={this.props.back}
        searchUsers={this.props.searchUsers}
        onAddMembers={this.onAddMembers}
        isAddingMembers={this.props.isAddingMembers}
        addMemberError={this.props.addMemberError}
        errors={this.props.errors}
        name={this.props.name}
        icon={this.props.conversationIcon}
      />
    );
  }
}

export const GroupManagementContainer = connectContainer<PublicProperties>(Container);
