import React from 'react';

import { shallow } from 'enzyme';

import { EmailLoginErrors, LoginState } from '../../store/login-wagmi';
import { RootState } from '../../store/reducer';

import { Container, Properties } from './container';

describe('Container', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      isLoading: false,
      errors: {},
      loginByEmail: () => null,
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('passes data down', function () {
    const wrapper = subject({ isLoading: true });

    expect(wrapper.find('EmailLogin').props()).toEqual(
      expect.objectContaining({
        isLoading: true,
      })
    );
  });

  describe('mapState', () => {
    const subject = (loginState: Partial<LoginState> = {}) => {
      const state = {
        login: {
          loading: false,
          errors: [],
          ...loginState,
        },
      } as RootState;
      return Container.mapState(state);
    };

    it('isLoading', () => {
      const props = subject({ loading: true });

      expect(props.isLoading).toEqual(true);
    });

    describe('email errors', () => {
      it('empty email', () => {
        const props = subject({ errors: [EmailLoginErrors.EMAIL_REQUIRED] });

        expect(props.errors).toEqual({ email: 'Email is required' });
      });
    });

    describe('password errors', () => {
      it('empty password', () => {
        const props = subject({ errors: [EmailLoginErrors.PASSWORD_REQUIRED] });

        expect(props.errors).toEqual({ password: 'Password is required' });
      });
    });

    describe('general errors', () => {
      it('unknown error', () => {
        const props = subject({ errors: ['random_error'] });

        expect(props.errors).toEqual({ general: 'An error has occurred' });
      });

      it('profile does not exist', () => {
        const props = subject({ errors: [EmailLoginErrors.PROFILE_NOT_EXISTS] });

        expect(props.errors).toEqual({ general: 'Email or Password incorrect' });
      });

      it('invalid email or password', () => {
        const props = subject({ errors: [EmailLoginErrors.INVALID_EMAIL_PASSWORD] });

        expect(props.errors).toEqual({ general: 'Email or Password incorrect' });
      });
    });
  });
});
