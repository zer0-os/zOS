import React from 'react';
import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';
import { IfAuthenticated } from '../authentication/if-authenticated';
import { MessengerList } from '../messenger/list';
import { GroupManagementContainer } from '../messenger/group-management/container';
import { UserProfileContainer } from '../messenger/user-profile/container';
import { Stage as ProfileStage } from '../../store/user-profile';

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
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const { groupManagement, userProfile } = state;

    return {
      profileStage: userProfile.stage,
      isSecondarySidekickOpen: groupManagement.isSecondarySidekickOpen,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {};
  }

  get isSecondary() {
    return this.props.variant === SidekickVariant.Secondary;
  }

  renderContent() {
    if (this.isSecondary) {
      return <GroupManagementContainer />;
    } else {
      return this.props.profileStage !== ProfileStage.None ? <UserProfileContainer /> : <MessengerList />;
    }
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
