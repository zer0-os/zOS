import * as React from 'react';

import { Stage } from '../../../../store/group-management';
import { AddMembersPanel } from '../add-members-panel';

export interface Properties {
  stage: Stage;
  onBack: () => void;
  searchUsers: (search: string) => Promise<any>;
}

export class GroupManagement extends React.PureComponent<Properties> {
  render() {
    return (
      <>
        {this.props.stage === Stage.StartAddMemberToRoom && (
          <AddMembersPanel
            isSubmitting={false}
            onBack={this.props.onBack}
            onSubmit={() => console.log('addMembersSelected: Submit Add New Group members')}
            searchUsers={this.props.searchUsers}
          />
        )}
      </>
    );
  }
}
