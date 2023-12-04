import * as React from 'react';

import { Stage as GroupManagementSagaStage } from '../../../../store/group-management';
import { AddMembersPanel } from '../add-members-panel';
import { Option } from '../../lib/types';

export interface Properties {
  groupManagementStage: GroupManagementSagaStage;
  isFetchingExistingConversations: boolean; // This is wrong as it's a flag related to creating conversations
  backGroupManagement: () => void;
  usersInMyNetworks: (search: string) => Promise<any>;
  onSubmitSelectedMembers: (options: Option[]) => void;
}

export class GroupManagement extends React.PureComponent<Properties> {
  render() {
    return (
      <>
        {this.props.groupManagementStage === GroupManagementSagaStage.StartAddMemberToRoom && (
          <AddMembersPanel
            isSubmitting={this.props.isFetchingExistingConversations}
            onBack={this.props.backGroupManagement}
            onSubmit={this.props.onSubmitSelectedMembers}
            searchUsers={this.props.usersInMyNetworks}
          />
        )}
      </>
    );
  }
}
