import * as React from 'react';

import { Stage as GroupManagementSagaStage, back as backGroupManagement } from '../../../../store/group-management';
import { AddMembersPanel } from '../add-members-panel';

export interface Properties {
  groupManangemenetStage: GroupManagementSagaStage;
  isFetchingExistingConversations: boolean; // XXX: This is totally wrong
  backGroupManagement: () => void;
  usersInMyNetworks: (search: string) => Promise<any>;
}

export class GroupManagement extends React.Component<Properties> {
  render() {
    return (
      <>
        {this.props.groupManangemenetStage === GroupManagementSagaStage.StartAddMemberToRoom && (
          <AddMembersPanel
            isSubmitting={this.props.isFetchingExistingConversations}
            onBack={this.props.backGroupManagement}
            onSubmit={() => console.log('addMembersSelected: Submit Add New Group members')}
            searchUsers={this.props.usersInMyNetworks}
          />
        )}
      </>
    );
  }
}
