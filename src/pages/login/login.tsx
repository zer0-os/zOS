import React from 'react';

import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';
import { LoginStage, switchLoginStage } from '../../store/login';

import { LoginComponent } from './component';

export interface LoginContainerProperties {
  isLoggingIn: boolean;
  stage: LoginStage;
  switchLoginStage: (stage: LoginStage) => void;
}

export class LoginContainer extends React.Component<LoginContainerProperties> {
  static mapState(state: RootState): Partial<LoginContainerProperties> {
    const { login } = state;
    return {
      stage: login.stage,
      isLoggingIn: login.loading,
    };
  }

  static mapActions(_props: LoginContainerProperties): Partial<LoginContainerProperties> {
    return {
      switchLoginStage,
    };
  }

  get handleToggleLoginOption() {
    const { switchLoginStage, stage } = this.props;
    return () => switchLoginStage(stage === LoginStage.Web3Login ? LoginStage.EmailLogin : LoginStage.Web3Login);
  }

  render() {
    const { isLoggingIn } = this.props;

    return (
      <LoginComponent
        isLoggingIn={isLoggingIn}
        stage={this.props.stage}
        onToggleLoginOption={this.handleToggleLoginOption}
      />
    );
  }
}

export const Login = connectContainer<{}>(LoginContainer);
