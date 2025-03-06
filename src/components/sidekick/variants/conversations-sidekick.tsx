import React from 'react';
import { RootState } from '../../../store/reducer';
import { connectContainer } from '../../../store/redux-container';
import { ContentPortal as SidekickContentPortal } from '../components/content-portal';
import { MessengerList } from '../../messenger/list';
import { UserProfileContainer } from '../../messenger/user-profile/container';
import { Stage as ProfileStage } from '../../../store/user-profile';
import { Stage as MessageInfoStage } from '../../../store/message-info';

interface PublicProperties {
  className?: string;
}

export interface Properties extends PublicProperties {
  profileStage: ProfileStage;
  messageInfoStage: MessageInfoStage;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const { userProfile, messageInfo } = state;

    return {
      profileStage: userProfile.stage,
      messageInfoStage: messageInfo.stage,
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
    return <SidekickContentPortal>{this.renderPrimarySidekickContent()}</SidekickContentPortal>;
  }
}

export const ConversationsSidekick = connectContainer<PublicProperties>(Container);
