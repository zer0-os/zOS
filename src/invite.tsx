import React from 'react';
import { RootState } from './store/reducer';
import { connectContainer } from './store/redux-container';
import { ReactComponent as ZeroLogo } from './zero-logo.svg';

import './invite.scss';
import { ThemeEngine, Themes } from '@zero-tech/zui/components/ThemeEngine';
import { RegistrationStage } from './store/registration';
import { InviteContainer } from './authentication/accept-invite/container';

export interface Properties {
  isAuthenticated: boolean;
  stage: RegistrationStage;
  isLoading: boolean;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const { registration } = state;
    return {
      isAuthenticated: true,
      stage: registration.stage,
      isLoading: registration.loading,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {};
  }

  componentDidMount() {}

  render() {
    return (
      <>
        <ThemeEngine theme={Themes.Dark} />
        <div className='invite-main'>
          <ZeroLogo />
          {this.props.stage === RegistrationStage.ValidateInvite && <InviteContainer />}
        </div>
      </>
    );
  }
}

export const Invite = connectContainer<{}>(Container);
