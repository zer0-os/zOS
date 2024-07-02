import React from 'react';

import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';
import { LoginStage, switchLoginStage } from '../../store/login';

import { LoginComponent } from './login-component';
import { AndroidDownload } from '../../authentication/android-download';
import { config } from '../../config';
import { setShowAndroidDownload } from '../../store/page-load';

export interface LoginContainerProperties {
  shouldRender: boolean;
  showAndroidDownload: boolean;
  androidStorePath: string;
  isLoggingIn: boolean;
  stage: LoginStage;
  switchLoginStage: (stage: LoginStage) => void;
  continueInBrowser: () => void;
}

export class LoginContainer extends React.Component<LoginContainerProperties> {
  static mapState(state: RootState): Partial<LoginContainerProperties> {
    const { login, pageload } = state;

    return {
      stage: login.stage,
      isLoggingIn: login.loading,
      shouldRender: pageload.isComplete,
      showAndroidDownload: pageload.showAndroidDownload,
      androidStorePath: config.googlePlayStorePath,
    };
  }

  static mapActions(_props: LoginContainerProperties): Partial<LoginContainerProperties> {
    return {
      switchLoginStage,
      continueInBrowser: () => setShowAndroidDownload(false),
    };
  }

  handleSelectionChange = (selectedOption: string) => {
    const { switchLoginStage } = this.props;
    switchLoginStage(selectedOption === 'web3' ? LoginStage.Web3Login : LoginStage.EmailLogin);
  };

  render() {
    const { isLoggingIn, stage } = this.props;

    if (!this.props.shouldRender) {
      return null;
    }

    return (
      <>
        <LoginComponent isLoggingIn={isLoggingIn} stage={stage} handleSelectionChange={this.handleSelectionChange} />
        {this.props.showAndroidDownload && (
          <AndroidDownload storePath={this.props.androidStorePath} onUseBrowser={this.props.continueInBrowser} />
        )}
      </>
    );
  }
}

export const LoginPage = connectContainer<{}>(LoginContainer);
