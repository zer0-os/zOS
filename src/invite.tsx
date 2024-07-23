import React from 'react';
import { Redirect } from 'react-router-dom';

import { RootState } from './store/reducer';
import { connectContainer } from './store/redux-container';
import { RegistrationStage } from './store/registration';
import { InviteContainer } from './authentication/validate-invite/container';
import { CreateAccountMethodContainer } from './authentication/create-account-method/container';
import { CreateAccountDetailsContainer } from './authentication/create-account-details/container';
import { Footer } from './authentication/footer/footer';
import { AndroidDownload } from './authentication/android-download';
import { config } from './config';
import { setShowAndroidDownload } from './store/page-load';

import ZeroLogo from './zero-logo.svg?react';
import { ThemeEngine, Themes } from '@zero-tech/zui/components/ThemeEngine';

import { bemClassName } from './lib/bem';
import './invite.scss';

const cn = bemClassName('invite-main');

export interface Properties {
  stage: RegistrationStage;
  shouldRender: boolean;
  showAndroidDownload: boolean;
  androidStorePath: string;
  continueInBrowser: () => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const { registration, pageload } = state;
    return {
      stage: registration.stage,
      shouldRender: pageload.isComplete,
      showAndroidDownload: pageload.showAndroidDownload,
      androidStorePath: config.googlePlayStorePath,
    };
  }

  static mapActions() {
    return {
      continueInBrowser: () => setShowAndroidDownload(false),
    };
  }

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
            this.props.stage === RegistrationStage.WalletAccountCreation) && <CreateAccountMethodContainer />}

          {this.props.stage === RegistrationStage.ProfileDetails && <CreateAccountDetailsContainer />}
          {this.props.stage === RegistrationStage.Done && <Redirect to='/' />}

          <Footer stage={this.props.stage} />
        </div>
        {this.props.showAndroidDownload && (
          <AndroidDownload storePath={this.props.androidStorePath} onUseBrowser={this.props.continueInBrowser} />
        )}
      </>
    );
  }
}

export const Invite = connectContainer<{}>(Container);
