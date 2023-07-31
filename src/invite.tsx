import React from 'react';
import { Action } from 'redux';
import { Redirect } from 'react-router-dom';

import { RootState } from './store/reducer';
import { connectContainer } from './store/redux-container';
import { RegistrationStage, registerWithEmail, registerWithWallet } from './store/registration';
import { InviteContainer } from './authentication/validate-invite/container';
import { CreateAccountMethod } from './authentication/create-account-method';
import { CreateAccountDetailsContainer } from './authentication/create-account-details/container';
import { Footer } from './authentication/footer/footer';

import { ReactComponent as ZeroLogo } from './zero-logo.svg';
import { ThemeEngine, Themes } from '@zero-tech/zui/components/ThemeEngine';

import { bemClassName } from './lib/bem';
import './invite.scss';

const cn = bemClassName('invite-main');

export interface Properties {
  stage: RegistrationStage;
  shouldRender: boolean;

  registerWithEmail: () => Action<string>;
  registerWithWallet: () => Action<string>;
}

export interface State {
  selectedOption: string;
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
    return { registerWithEmail: registerWithEmail, registerWithWallet: registerWithWallet };
  }

  state: State = {
    selectedOption: 'web3',
  };

  handleSelectionChange = (selectedOption: string) => {
    this.setState({ selectedOption });

    if (selectedOption === 'web3') {
      this.props.registerWithWallet();
    } else if (selectedOption === 'email') {
      this.props.registerWithEmail();
    }
  };

  render() {
    if (!this.props.shouldRender) {
      return null;
    }

    return (
      <>
        <ThemeEngine theme={Themes.Dark} />
        <div {...cn('')}>
          <div
            {...cn(
              'logo-container',
              (this.props.stage === RegistrationStage.ValidateInvite ||
                this.props.stage === RegistrationStage.ProfileDetails) &&
                'is-landing-page'
            )}
          >
            <ZeroLogo />
          </div>

          {this.props.stage === RegistrationStage.ValidateInvite && <InviteContainer />}

          {(this.props.stage === RegistrationStage.EmailAccountCreation ||
            this.props.stage === RegistrationStage.WalletAccountCreation) && (
            <CreateAccountMethod
              stage={this.props.stage}
              selectedOption={this.state.selectedOption}
              handleSelectionChange={this.handleSelectionChange}
            />
          )}

          {this.props.stage === RegistrationStage.ProfileDetails && <CreateAccountDetailsContainer />}
          {this.props.stage === RegistrationStage.Done && <Redirect to='/' />}

          <Footer stage={this.props.stage} />
        </div>
      </>
    );
  }
}

export const Invite = connectContainer<{}>(Container);
