import * as React from 'react';

import { Stage } from '../../../../store/group-management';
import { AddMembersPanel } from '../add-members-panel';
import { Option } from '../../lib/types';
import { EditConversationPanel } from '../edit-conversation-panel';
import { GroupManagementErrors } from '../../../../store/group-management/types';

export interface Properties {
  stage: Stage;
  addMemberError: string;
  isAddingMembers: boolean;
  errors: GroupManagementErrors;
  name: string;
  icon: string;

  onBack: () => void;
  onAddMembers: (options: Option[]) => void;
  searchUsers: (search: string) => Promise<any>;
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
            errors={this.props.errors.editConversationErrors}
            onBack={this.props.onBack}
            name={this.props.name}
            icon={this.props.icon}
          />
        )}
      </>
    );
  }
}
