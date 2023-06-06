import React from 'react';
import { Redirect } from 'react-router-dom';

import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';
import { LoginStage } from '../../store/login';

import { ThemeEngine, Themes } from '@zero-tech/zui/components/ThemeEngine';
import { EmailLoginContainer } from '../../authentication/email-login/container';
import { ReactComponent as ZeroLogo } from '../../zero-logo.svg';

import './login.scss';

export interface LoginContainerProperties {
  stage: LoginStage;
}

export class LoginContainer extends React.Component<LoginContainerProperties> {
  static mapState(state: RootState): Partial<LoginContainerProperties> {
    const { login } = state;
    return {
      stage: login.stage,
    };
  }

  static mapActions(_props: LoginContainerProperties): Partial<LoginContainerProperties> {
    return {};
  }

  render() {
    return (
      <>
        <ThemeEngine theme={Themes.Dark} />
        <div className='login-main'>
          <ZeroLogo />
          {this.props.stage === LoginStage.EmailLogin && <EmailLoginContainer />}
          {this.props.stage === LoginStage.Done && <Redirect to='/' />}
        </div>
      </>
    );
  }
}

export const Login = connectContainer<{}>(LoginContainer);
