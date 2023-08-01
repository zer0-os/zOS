import React from 'react';
import { Link, Redirect } from 'react-router-dom';

import { LoginStage } from '../../store/login';
import { Web3LoginContainer } from '../../authentication/web3-login/container';
import { EmailLoginContainer } from '../../authentication/email-login/container';

import { ReactComponent as ZeroLogo } from '../../zero-logo.svg';
import { ToggleGroup } from '@zero-tech/zui/components';
import { ThemeEngine, Themes } from '@zero-tech/zui/components/ThemeEngine';

import { bemClassName } from '../../lib/bem';
import './login.scss';

const cn = bemClassName('login-main');

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
        <div {...cn('')}>
          <main {...cn('content')}>
            <div {...cn('logo-container')}>
              <ZeroLogo />
            </div>
            <div>
              <h3 {...cn('header')}>Log in</h3>

              <ToggleGroup
                {...cn('toggle-group')}
                options={options}
                variant='default'
                onSelectionChange={this.props.handleSelectionChange}
                selection={selectedOption}
                selectionType='single'
                isRequired
                isDisabled={isLoggingIn}
              />

              <div {...cn('login-option')}>{this.loginOption}</div>
            </div>

            <div {...cn('other')}>
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
