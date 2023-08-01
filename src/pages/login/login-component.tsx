import React from 'react';

import { Link, Redirect } from 'react-router-dom';
import { LoginStage } from '../../store/login';
import { ThemeEngine, Themes } from '@zero-tech/zui/components/ThemeEngine';
import { ReactComponent as ZeroLogo } from '../../zero-logo.svg';

import { bem } from '../../lib/bem';
import { Web3LoginContainer } from '../../authentication/web3-login/container';
import { EmailLoginContainer } from '../../authentication/email-login/container';
import { ToggleGroup } from '@zero-tech/zui/components';

import './login.scss';

const c = bem('login');

interface LoginComponentProperties {
  isLoggingIn: boolean;
  stage: LoginStage;
  handleSelectionChange: (selectedOption: string) => void;
}

export class LoginComponent extends React.Component<LoginComponentProperties> {
  get loginOption() {
    switch (this.props.stage) {
      case LoginStage.Web3Login:
        return <Web3LoginContainer />;
      case LoginStage.Done:
        return <Redirect to='/' />;
      default:
        return <EmailLoginContainer />;
    }
  }

  render() {
    const { isLoggingIn, stage } = this.props;

    const selectedOption = stage === LoginStage.Web3Login ? 'web3' : 'email';

    const options = [
      { key: 'web3', label: 'Web3' },
      { key: 'email', label: 'Email' },
    ];

    return (
      <>
        <ThemeEngine theme={Themes.Dark} />
        <div className={c('')}>
          <main className={c('content')}>
            <ZeroLogo />
            <h3 className={c('header')}>Log in</h3>
            {!isLoggingIn && (
              <ToggleGroup
                options={options}
                variant='default'
                onSelectionChange={this.props.handleSelectionChange}
                selection={selectedOption}
                selectionType='single'
                isRequired
              />
            )}
            <div className={c('login')}>{this.loginOption}</div>

            <div className={c('other')}>
              <span>
                New to ZERO? <Link to='/get-access'>Create an account</Link>
              </span>
            </div>
          </main>
        </div>
      </>
    );
  }
}
