import React from 'react';
import { Link, Redirect } from 'react-router-dom';

import { shallow } from 'enzyme';
import { LoginStage } from '../../store/login';

import { LoginComponent } from './login-component';
import { ThemeEngine, Themes } from '@zero-tech/zui/components/ThemeEngine';
import { Web3LoginContainer } from '../../authentication/web3-login/container';
import { EmailLoginContainer } from '../../authentication/email-login/container';
import { ToggleGroup } from '@zero-tech/zui/components';

describe('Login Component', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      isLoggingIn: false,
      stage: LoginStage.Web3Login,
      handleSelectionChange: jest.fn(),
      ...props,
    };

    return shallow(<LoginComponent {...allProps} />);
  };

  it('renders Web3LoginContainer by default', () => {
    const wrapper = subject();
    expect(wrapper.find(Web3LoginContainer).exists()).toBeTrue();
    expect(wrapper.find(EmailLoginContainer).exists()).toBeFalse();
    expect(wrapper.find(Redirect).exists()).toBeFalse();
  });

  it('renders EmailLoginContainer when stage is LoginStage.EmailLogin', () => {
    const wrapper = subject({ stage: LoginStage.EmailLogin });
    expect(wrapper.find(Web3LoginContainer).exists()).toBeFalse();
    expect(wrapper.find(EmailLoginContainer).exists()).toBeTrue();
    expect(wrapper.find(Redirect).exists()).toBeFalse();
  });

  it('renders Redirect when stage is LoginStage.Done', () => {
    const wrapper = subject({ stage: LoginStage.Done });
    expect(wrapper.find(Web3LoginContainer).exists()).toBeFalse();
    expect(wrapper.find(EmailLoginContainer).exists()).toBeFalse();
    expect(wrapper.find(Redirect).exists()).toBeTrue();
  });

  it('renders ThemeEngine', () => {
    const wrapper = subject();
    expect(wrapper.find(ThemeEngine).exists()).toBeTrue();
  });

  it('sets theme to Themes.Dark', () => {
    const wrapper = subject();
    expect(wrapper.find(ThemeEngine).prop('theme')).toBe(Themes.Dark);
  });

  it('calls handleSelectionChange when login option is changed', () => {
    const handleSelectionChange = jest.fn();
    const wrapper = subject({ handleSelectionChange });
    const toggleGroup = wrapper.find(ToggleGroup);
    (toggleGroup.prop('onSelectionChange') as (selectedOption: string) => void)('email');
    expect(handleSelectionChange).toHaveBeenCalledWith('email');
  });

  it('renders Link to create an account', () => {
    const wrapper = subject();

    const link = wrapper.find(Link);
    expect(link).toHaveLength(1);
    expect(link.prop('to')).toBe('/get-access');
  });

  it('passes isLoggingIn to ToggleGroup as isDisabled', () => {
    const wrapper = subject({ isLoggingIn: true });
    const toggleGroup = wrapper.find(ToggleGroup);
    expect(toggleGroup.prop('isDisabled')).toBe(true);
  });

  it('does not disable ToggleGroup when isLoggingIn is false', () => {
    const wrapper = subject({ isLoggingIn: false });
    const toggleGroup = wrapper.find(ToggleGroup);
    expect(toggleGroup.prop('isDisabled')).toBe(false);
  });
});
