import React from 'react';
import { RootState } from './store/reducer';
import { connectContainer } from './store/redux-container';
import { ReactComponent as ZeroLogo } from './zero-logo.svg';
import { Redirect } from 'react-router-dom';

import './invite.scss';
import { ThemeEngine, Themes } from '@zero-tech/zui/components/ThemeEngine';
import { RegistrationStage, updateProfile } from './store/registration';
import { InviteContainer } from './authentication/accept-invite/container';
import { CreateEmailAccountContainer } from './authentication/create-email-account/container';
import { CreateAccountDetails } from './authentication/create-account-details';

export interface Properties {
  isAuthenticated: boolean;
  stage: RegistrationStage;
  isLoading: boolean;

  updateProfile: (data: { name: string }) => void;
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
    return { updateProfile };
  }

  componentDidMount() {}

  render() {
    return (
      <>
        <ThemeEngine theme={Themes.Dark} />
        <div className='invite-main'>
          <ZeroLogo />
          {this.props.stage === RegistrationStage.ValidateInvite && <InviteContainer />}
          {this.props.stage === RegistrationStage.AccountCreation && <CreateEmailAccountContainer />}
          {this.props.stage === RegistrationStage.ProfileDetails && (
            <CreateAccountDetails isLoading={this.props.isLoading} onCreate={this.props.updateProfile} />
          )}
          {this.props.stage === RegistrationStage.Done && <Redirect to='/' />}
        </div>
      </>
    );
  }
}

export const Invite = connectContainer<{}>(Container);
