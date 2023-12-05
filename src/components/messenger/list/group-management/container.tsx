import React from 'react';
import { connectContainer } from '../../../../store/redux-container';

import { Stage, back, addSelectedMembers, MembersSelectedPayload } from '../../../../store/group-management';
import { Option } from '../../lib/types';

import { GroupManagement } from '.';
import { RootState } from '../../../../store/reducer';

export interface PublicProperties {
  searchUsers: (search: string) => Promise<any>;
}

export interface Properties extends PublicProperties {
  stage: Stage;
  activeConversationId: string;
  isAddingMembers: boolean;
  addMemberError: string;

  back: () => void;
  addSelectedMembers: (payload: MembersSelectedPayload) => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      groupManagement,
      chat: { activeConversationId },
    } = state;

    return {
      activeConversationId,
      stage: groupManagement.stage,
      isAddingMembers: groupManagement.isAddingMembers,
      addMemberError: groupManagement.addMemberError,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      back,
      addSelectedMembers,
    };
  }

  onAddMembers = async (selectedOptions: Option[]) => {
    const userIds = selectedOptions.map((option) => option.value);
    this.props.addSelectedMembers({ roomId: this.props.activeConversationId, userIds });
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
      />
    );
  }
}

export const GroupManagementContainer = connectContainer<PublicProperties>(Container);
