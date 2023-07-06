import React from 'react';
import { RootState } from './store/reducer';
import { connectContainer } from './store/redux-container';
import { ReactComponent as ZeroLogo } from './zero-logo.svg';
import { Redirect } from 'react-router-dom';

import './invite.scss';
import { ThemeEngine, Themes } from '@zero-tech/zui/components/ThemeEngine';
import { RegistrationStage } from './store/registration';
import { InviteContainer } from './authentication/validate-invite/container';
import { SelectMethodContainer } from './authentication/select-method/container';
import { CreateEmailAccountContainer } from './authentication/create-email-account/container';
import { CreateAccountDetailsContainer } from './authentication/create-account-details/container';
import { CreateWalletAccountContainer } from './authentication/create-wallet-account/container';

export interface Properties {
  stage: RegistrationStage;
  shouldRender: boolean;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const { registration, pageload } = state;
    return {
      stage: registration.stage,
      shouldRender: pageload.isComplete,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {};
  }

  render() {
    if (!this.props.shouldRender) {
      return null;
    }

    return (
      <>
        <ThemeEngine theme={Themes.Dark} />
        <div className='invite-main'>
          <ZeroLogo />
          {this.props.stage === RegistrationStage.ValidateInvite && <InviteContainer />}
          {this.props.stage === RegistrationStage.SelectMethod && <SelectMethodContainer />}
          {this.props.stage === RegistrationStage.EmailAccountCreation && <CreateEmailAccountContainer />}
          {this.props.stage === RegistrationStage.WalletAccountCreation && <CreateWalletAccountContainer />}
          {this.props.stage === RegistrationStage.ProfileDetails && <CreateAccountDetailsContainer />}
          {this.props.stage === RegistrationStage.Done && <Redirect to='/' />}
        </div>
      </>
    );
  }
}

export const Invite = connectContainer<{}>(Container);
