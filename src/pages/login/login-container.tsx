import React from 'react';

import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';
import { LoginStage, switchLoginStage } from '../../store/login';
import { setEmailSubmitted } from '../../store/reset-password';

import { LoginComponent } from './login-component';

export interface LoginContainerProperties {
  shouldRender: boolean;
  isLoggingIn: boolean;
  stage: LoginStage;

  setEmailSubmitted: (submitted: boolean) => void;
  switchLoginStage: (stage: LoginStage) => void;
}

export class LoginContainer extends React.Component<LoginContainerProperties> {
  static mapState(state: RootState): Partial<LoginContainerProperties> {
    const { login, pageload } = state;

    return {
      stage: login.stage,
      isLoggingIn: login.loading,
      shouldRender: pageload.isComplete,
    };
  }

  static mapActions(_props: LoginContainerProperties): Partial<LoginContainerProperties> {
    return {
      switchLoginStage,
      setEmailSubmitted,
    };
  }

  handleSelectionChange = (selectedOption: string) => {
    const { switchLoginStage } = this.props;
    switch (selectedOption) {
      case 'web3':
        switchLoginStage(LoginStage.Web3Login);
        break;
      case 'email':
        switchLoginStage(LoginStage.EmailLogin);
        break;
      case 'reset':
        switchLoginStage(LoginStage.ResetPassword);
        break;
      case 'backToLogin':
        switchLoginStage(LoginStage.EmailLogin);
        this.props.setEmailSubmitted(false);
        break;
      default:
        break;
    }
  };

  render() {
    const { isLoggingIn, stage } = this.props;

    if (!this.props.shouldRender) {
      return null;
    }

    return (
      <LoginComponent isLoggingIn={isLoggingIn} stage={stage} handleSelectionChange={this.handleSelectionChange} />
    );
  }
}

export const LoginPage = connectContainer<{}>(LoginContainer);
