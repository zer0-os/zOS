import React from 'react';
import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';
import { IfAuthenticated } from '../authentication/if-authenticated';
import { MessengerList } from '../messenger/list';
import { GroupManagementContainer } from '../messenger/group-management/container';
import { UserProfileContainer } from '../messenger/user-profile/container';
import { Stage as ProfileStage } from '../../store/user-profile';
import { Stage as MessageInfoStage } from '../../store/message-info';
import { Stage as GroupManagementStage } from '../../store/group-management';
import { MessageInfoContainer } from '../messenger/message-info/container';

import classNames from 'classnames';
import { bemClassName } from '../../lib/bem';
import './styles.scss';

const cn = bemClassName('sidekick');

export enum SidekickVariant {
  Primary = 'primary',
  Secondary = 'secondary',
}

interface PublicProperties {
  className?: string;
  variant?: 'primary' | 'secondary';
}

export interface Properties extends PublicProperties {
  isSecondarySidekickOpen: boolean;
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
      isSecondarySidekickOpen: groupManagement.isSecondarySidekickOpen,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {};
  }

  get isSecondary() {
    return this.props.variant === SidekickVariant.Secondary;
  }

  renderSecondarySidekickContent() {
    if (
      this.props.messageInfoStage !== MessageInfoStage.None &&
      this.props.groupManagementStage === GroupManagementStage.None
    ) {
      return <MessageInfoContainer />;
    }
    return <GroupManagementContainer />;
  }

  renderPrimarySidekickContent() {
    if (this.props.profileStage !== ProfileStage.None) {
      return <UserProfileContainer />;
    }
    return <MessengerList />;
  }

  renderContent() {
    return this.isSecondary ? this.renderSecondarySidekickContent() : this.renderPrimarySidekickContent();
  }

  render() {
    const sidekickClass = classNames(this.props.variant, this.props.isSecondarySidekickOpen ? 'open' : 'close');

    return (
      <IfAuthenticated showChildren>
        <div {...cn('', sidekickClass)}>
          <div {...cn('tab-content-outer', this.props.variant)}>
            <div {...cn('tab-content')}>
              <div {...cn('tab-content--messages')}>{this.renderContent()}</div>
            </div>
          </div>
        </div>
      </IfAuthenticated>
    );
  }
}

export const Sidekick = connectContainer<PublicProperties>(Container);
