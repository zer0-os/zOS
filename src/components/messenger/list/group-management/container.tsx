import React from 'react';
import { connectContainer } from '../../../../store/redux-container';

import {
  Stage,
  back,
  addSelectedMembers,
  MembersSelectedPayload,
  removeMember,
  editConversationNameAndIcon,
  EditConversationPayload,
} from '../../../../store/group-management';
import { Option } from '../../lib/types';

import { GroupManagement } from '.';
import { RootState } from '../../../../store/reducer';
import { GroupManagementErrors, EditConversationState } from '../../../../store/group-management/types';
import { User, denormalize as denormalizeChannel } from '../../../../store/channels';
import { currentUserSelector } from '../../../../store/authentication/selectors';

export interface PublicProperties {
  searchUsers: (search: string) => Promise<any>;
}

export interface Properties extends PublicProperties {
  stage: Stage;
  activeConversationId: string;
  currentUser: User;
  otherMembers: User[];
  isAddingMembers: boolean;
  addMemberError: string;
  errors: GroupManagementErrors;
  name: string;
  conversationIcon: string;
  editConversationState: EditConversationState;

  back: () => void;
  addSelectedMembers: (payload: MembersSelectedPayload) => void;
  removeMember: (params: { roomId: string; userId: string }) => void;
  editConversationNameAndIcon: (payload: EditConversationPayload) => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      groupManagement,
      chat: { activeConversationId },
    } = state;

    const conversation = denormalizeChannel(activeConversationId, state);
    const currentUser = currentUserSelector(state);

    return {
      activeConversationId,
      stage: groupManagement.stage,
      isAddingMembers: groupManagement.isAddingMembers,
      addMemberError: groupManagement.addMemberError,
      errors: groupManagement.errors,
      name: conversation?.name || '',
      conversationIcon: conversation?.icon || '',
      currentUser: {
        firstName: currentUser?.profileSummary.firstName,
        lastName: currentUser?.profileSummary.lastName,
        profileImage: currentUser?.profileSummary.profileImage,
      } as User,
      otherMembers: conversation ? conversation.otherMembers : [],
      editConversationState: groupManagement.editConversationState,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      back,
      addSelectedMembers,
      removeMember,
      editConversationNameAndIcon,
    };
  }

  onAddMembers = async (selectedOptions: Option[]) => {
    this.props.addSelectedMembers({ roomId: this.props.activeConversationId, users: selectedOptions });
  };

  removeMember = (userId: string) => {
    this.props.removeMember({ roomId: this.props.activeConversationId, userId });
  };

  onEditConversation = async (name: string, image: File | null) => {
    this.props.editConversationNameAndIcon({ roomId: this.props.activeConversationId, name, image });
  };

  render() {
    return (
      <GroupManagement
        stage={this.props.stage}
        currentUser={this.props.currentUser}
        otherMembers={this.props.otherMembers}
        onBack={this.props.back}
        searchUsers={this.props.searchUsers}
        onAddMembers={this.onAddMembers}
        isAddingMembers={this.props.isAddingMembers}
        addMemberError={this.props.addMemberError}
        errors={this.props.errors}
        name={this.props.name}
        icon={this.props.conversationIcon}
        onRemoveMember={this.removeMember}
        onEditConversation={this.onEditConversation}
        editConversationState={this.props.editConversationState}
      />
    );
  }
}

export const GroupManagementContainer = connectContainer<PublicProperties>(Container);
