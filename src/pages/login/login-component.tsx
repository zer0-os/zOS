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
  renderLoginOption() {
    switch (this.props.stage) {
      case LoginStage.Web3Login:
        return <Web3LoginContainer />;
      case LoginStage.Done:
        return <Redirect to='/' />;
      default:
        return <EmailLoginContainer />;
    }
  }

  renderToggleGroup(isLoggingIn, selectedOption) {
    const options = [
      { key: 'web3', label: 'Web3' },
      { key: 'email', label: 'Email' },
    ];

    return (
      !isLoggingIn && (
        <ToggleGroup
          {...cn('toggle-group')}
          options={options}
          variant='default'
          onSelectionChange={this.props.handleSelectionChange}
          selection={selectedOption}
          selectionType='single'
          isRequired
        />
      )
    );
  }

  renderFooter(stage) {
    return (
      <div {...cn('other')}>
        <span>
          {stage === LoginStage.EmailLogin ? (
            <>
              Forgot your password? <Link to='/get-access'>Reset</Link>
            </>
          ) : (
            <>
              Not on ZERO? <Link to='/get-access'>Create account</Link>
            </>
          )}
        </span>
      </div>
    );
  }

  render() {
    const { isLoggingIn, stage } = this.props;
    const isWeb3LoginStage = stage === LoginStage.Web3Login;
    const selectedOption = isWeb3LoginStage ? 'web3' : 'email';

    return (
      <>
        <ThemeEngine theme={Themes.Dark} />
        <div {...cn('')}>
          <main {...cn('content')}>
            <div {...cn('logo-container')}>
              <ZeroLogo />
            </div>
            <div {...cn('inner-content-wrapper', isLoggingIn && isWeb3LoginStage && 'is-logging-in')}>
              <h3 {...cn('header')}>Log In</h3>
              {this.renderToggleGroup(isLoggingIn, selectedOption)}
              <div {...cn('login-option')}>{this.renderLoginOption()}</div>
            </div>
            {this.renderFooter(stage)}
          </main>
        </div>
      </>
    );
  }
}
