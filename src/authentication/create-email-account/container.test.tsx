import React from 'react';

import { shallow } from 'enzyme';

import { Container, Properties } from './container';
import { AccountCreationErrors, RegistrationState } from '../../store/registration';
import { RootState } from '../../store/reducer';

describe('Container', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      isLoading: false,
      createAccount: () => null,
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('passes data down', function () {
    const wrapper = subject({ isLoading: true });

    expect(wrapper.find('CreateEmailAccount').props()).toEqual(
      expect.objectContaining({
        isLoading: true,
      })
    );
  });

  describe('mapState', () => {
    const subject = (registrationState: Partial<RegistrationState> = {}) => {
      const state = {
        registration: {
          loading: false,
          errors: [],
          ...registrationState,
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
        const props = subject({ errors: [AccountCreationErrors.EMAIL_REQUIRED] });

        expect(props.errors).toEqual({ email: 'Email is required' });
      });

      it('invalid email', () => {
        const props = subject({ errors: [AccountCreationErrors.EMAIL_INVALID] });

        expect(props.errors).toEqual({ email: 'This email is invalid' });
      });

      it('email exists', () => {
        const props = subject({ errors: [AccountCreationErrors.EMAIL_ALREADY_EXISTS] });

        expect(props.errors).toEqual({ email: 'This email already exists' });
      });
    });

    describe('password errors', () => {
      it('empty password', () => {
        const props = subject({ errors: [AccountCreationErrors.PASSWORD_REQUIRED] });

        expect(props.errors).toEqual({ password: 'Password is required' });
      });

      it('invalid password', () => {
        const props = subject({ errors: [AccountCreationErrors.PASSWORD_INVALID] });

        expect(props.errors).toEqual({ password: 'Password is too weak' });
      });
    });

    describe('general errors', () => {
      it('unknown error', () => {
        const props = subject({ errors: ['random_error'] });

        expect(props.errors).toEqual({ general: 'An error has occurred' });
      });
    });
  });
});
