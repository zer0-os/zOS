import React from 'react';
import { RootState } from '../../../store/reducer';
import { connectContainer } from '../../../store/redux-container';
import { Container as SidekickContainer } from '../components/container';
import { MessengerList } from '../../messenger/list';
import { UserProfileContainer } from '../../messenger/user-profile/container';
import { Stage as ProfileStage } from '../../../store/user-profile';
import { Stage as MessageInfoStage } from '../../../store/message-info';
import { Stage as GroupManagementStage } from '../../../store/group-management';

interface PublicProperties {
  className?: string;
}

export interface Properties extends PublicProperties {
  profileStage: ProfileStage;
  messageInfoStage: MessageInfoStage;
  groupManagementStage: GroupManagementStage;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const { groupManagement, userProfile, messageInfo } = state;

    return {
      profileStage: userProfile.stage,
      messageInfoStage: messageInfo.stage,
      groupManagementStage: groupManagement.stage,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {};
  }

  renderPrimarySidekickContent() {
    if (this.props.profileStage !== ProfileStage.None) {
      return <UserProfileContainer />;
    }
    return <MessengerList />;
  }

  render() {
    return <SidekickContainer>{this.renderPrimarySidekickContent()}</SidekickContainer>;
  }
}

export const ConversationsSidekick = connectContainer<PublicProperties>(Container);
