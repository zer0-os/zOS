import React from 'react';
import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';
import { ReactComponent as ZeroLogo } from '../../zero-logo.svg';
import { Redirect } from 'react-router-dom';

import './login.scss';
import { ThemeEngine, Themes } from '@zero-tech/zui/components/ThemeEngine';
import { EmailLoginContainer } from '../../authentication/email-login/container';
import { LoginStage } from '../../store/login';

export interface Properties {}

export interface Properties {
  stage: LoginStage;
}
export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const { login } = state;
    return {
      stage: login.stage,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
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

export const Login = connectContainer<{}>(Container);
