import React from 'react';
import { shallow } from 'enzyme';
import { Action } from 'redux';

import { RegistrationStage } from '../../store/registration';
import { Container, CreateAccountMethodProps } from './container';

describe('CreateAccountMethodContainer', () => {
  const registerWithEmailMock = jest.fn() as jest.MockedFunction<() => Action<string>>;
  const registerWithWalletMock = jest.fn() as jest.MockedFunction<() => Action<string>>;

  const subject = (props: Partial<CreateAccountMethodProps>) => {
    const allProps: CreateAccountMethodProps = {
      stage: RegistrationStage.WalletAccountCreation,
      isConnecting: false,
      registerWithEmail: registerWithEmailMock,
      registerWithWallet: registerWithWalletMock,
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  describe('render', () => {
    it('passes props down to CreateAccountMethod component', () => {
      const wrapper = subject({ isConnecting: true, stage: RegistrationStage.EmailAccountCreation });
      const createAccountMethodProps = wrapper.find('CreateAccountMethod').props();

      expect(createAccountMethodProps).toEqual(
        expect.objectContaining({
          isConnecting: true,
          stage: RegistrationStage.EmailAccountCreation,
        })
      );
    });
  });

  describe('handleSelectionChange', () => {
    it('calls registerWithWallet when selected option is web3', () => {
      const wrapper = subject({});
      const instance = wrapper.instance() as Container;

      instance.handleSelectionChange('web3');
      expect(registerWithWalletMock).toHaveBeenCalled();
    });

    it('calls registerWithEmail when selected option is email', () => {
      const wrapper = subject({});
      const instance = wrapper.instance() as Container;

      instance.handleSelectionChange('email');
      expect(registerWithEmailMock).toHaveBeenCalled();
    });
  });
});
