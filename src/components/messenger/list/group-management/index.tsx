import * as React from 'react';

import { LeaveGroupDialogStatus, Stage } from '../../../../store/group-management';
import { AddMembersPanel } from '../add-members-panel';
import { Option } from '../../lib/types';
import { EditConversationPanel } from '../edit-conversation-panel';
import { ViewGroupInformationPanel } from '../view-group-information-panel';
import { User } from '../../../../store/channels';
import { EditConversationState, GroupManagementErrors } from '../../../../store/group-management/types';

export interface Properties {
  stage: Stage;
  addMemberError: string;
  isAddingMembers: boolean;
  errors: GroupManagementErrors;
  name: string;
  icon: string;
  currentUser: User;
  otherMembers: User[];
  editConversationState: EditConversationState;
  canAddMembers: boolean;
  canEditGroup: boolean;
  canLeaveGroup: boolean;
  conversationAdminIds: string[];

  onBack: () => void;
  onAddMembers: (options: Option[]) => void;
  onEditConversation: (name: string, image: File | null) => void;
  searchUsers: (search: string) => Promise<any>;
  onRemoveMember: (userId: string) => void;
  startEditConversation: () => void;
  startAddGroupMember: () => void;
  setLeaveGroupStatus: (status: LeaveGroupDialogStatus) => void;
}

export class GroupManagement extends React.PureComponent<Properties> {
  render() {
    return (
      <>
        {this.props.stage === Stage.StartAddMemberToRoom && (
          <AddMembersPanel
            error={this.props.addMemberError} // TODO: use this.props.errors.addMemberError
            isSubmitting={this.props.isAddingMembers}
            onBack={this.props.onBack}
            onSubmit={this.props.onAddMembers}
            searchUsers={this.props.searchUsers}
          />
        )}
        {this.props.stage === Stage.EditConversation && (
          <EditConversationPanel
            name={this.props.name}
            icon={this.props.icon}
            currentUser={this.props.currentUser}
            otherMembers={this.props.otherMembers}
            conversationAdminIds={this.props.conversationAdminIds}
            errors={this.props.errors.editConversationErrors}
            onBack={this.props.onBack}
            onRemoveMember={this.props.onRemoveMember}
            onEdit={this.props.onEditConversation}
            state={this.props.editConversationState}
          />
        )}
        {this.props.stage === Stage.ViewGroupInformation && (
          <ViewGroupInformationPanel
            name={this.props.name}
            icon={this.props.icon}
            currentUser={this.props.currentUser}
            otherMembers={this.props.otherMembers}
            canAddMembers={this.props.canAddMembers}
            canEditGroup={this.props.canEditGroup}
            canLeaveGroup={this.props.canLeaveGroup}
            conversationAdminIds={this.props.conversationAdminIds}
            onAdd={this.props.startAddGroupMember}
            onLeave={this.props.setLeaveGroupStatus}
            onEdit={this.props.startEditConversation}
            onBack={this.props.onBack}
          />
        )}
      </>
    );
  }
}
