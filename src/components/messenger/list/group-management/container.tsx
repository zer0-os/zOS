import React from 'react';
import { connectContainer } from '../../../../store/redux-container';

import { Stage, back } from '../../../../store/group-management';

import { GroupManagement } from '.';
import { RootState } from '../../../../store/reducer';

export interface PublicProperties {
  searchUsers: (search: string) => Promise<any>;
}

export interface Properties extends PublicProperties {
  stage: Stage;
  back: () => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const { groupManagement } = state;

    return {
      stage: groupManagement.stage,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      back,
    };
  }

  render() {
    return (
      <GroupManagement
        groupManagementStage={this.props.stage}
        backGroupManagement={this.props.back}
        usersInMyNetworks={this.props.searchUsers}
        isFetchingExistingConversations={false}
      />
    );
  }
}

export const GroupManagementContainer = connectContainer<PublicProperties>(Container);
