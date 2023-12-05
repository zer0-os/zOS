import * as React from 'react';

import { Stage } from '../../../../store/group-management';
import { AddMembersPanel } from '../add-members-panel';
import { Option } from '../../lib/types';

export interface Properties {
  stage: Stage;
  addMemberError: string;
  isAddingMembers: boolean;

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
            error={this.props.addMemberError}
            isSubmitting={this.props.isAddingMembers}
            onBack={this.props.onBack}
            onSubmit={this.props.onAddMembers}
            searchUsers={this.props.searchUsers}
          />
        )}
      </>
    );
  }
}
