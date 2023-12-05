import * as React from 'react';

import { Stage } from '../../../../store/group-management';
import { AddMembersPanel } from '../add-members-panel';
import { Option } from '../../lib/types';
import { EditConversationPanel } from '../edit-conversation-panel';
import { Channel } from '../../../../store/channels';
import { GroupManagementErrors } from '../../../../store/group-management/types';

export interface Properties {
  stage: Stage;
  addMemberError: string;
  isAddingMembers: boolean;
  errors: GroupManagementErrors;
  conversation: Channel;

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
            conversation={this.props.conversation}
            errors={this.props.errors.editConversationErrors}
            onBack={this.props.onBack}
          />
        )}
      </>
    );
  }
}
