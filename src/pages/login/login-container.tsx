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
  isEmailOnlyMode: boolean;
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
      isEmailOnlyMode: pageload.isZWalletReferrer,
    };
  }

  static mapActions(_props: LoginContainerProperties): Partial<LoginContainerProperties> {
    return {
      switchLoginStage,
      continueInBrowser: () => setShowAndroidDownload(false),
    };
  }

  componentDidMount() {
    this.enforceEmailOnlyMode();
  }

  componentDidUpdate(prevProps: LoginContainerProperties) {
    if (prevProps.stage !== this.props.stage || prevProps.isEmailOnlyMode !== this.props.isEmailOnlyMode) {
      this.enforceEmailOnlyMode();
    }
  }

  enforceEmailOnlyMode() {
    const { isEmailOnlyMode, stage, switchLoginStage } = this.props;
    const isEmailStage = stage === LoginStage.OTPLogin || stage === LoginStage.EmailLogin;

    if (isEmailOnlyMode && !isEmailStage) {
      switchLoginStage(LoginStage.OTPLogin);
    }
  }

  handleSelectionChange = (selectedOption: LoginStage) => {
    const { switchLoginStage } = this.props;
    switchLoginStage(selectedOption);
  };

  render() {
    const { isLoggingIn, stage, isEmailOnlyMode } = this.props;

    if (!this.props.shouldRender) {
      return null;
    }

    return (
      <>
        <LoginComponent
          isLoggingIn={isLoggingIn}
          stage={stage}
          isEmailOnlyMode={isEmailOnlyMode}
          handleSelectionChange={this.handleSelectionChange}
        />
        {this.props.showAndroidDownload && (
          <AndroidDownload storePath={this.props.androidStorePath} onUseBrowser={this.props.continueInBrowser} />
        )}
      </>
    );
  }
}

export const LoginPage = connectContainer<{}>(LoginContainer);
