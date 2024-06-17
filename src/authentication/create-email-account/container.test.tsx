import React from 'react';

import { shallow } from 'enzyme';

import { Container, Properties } from './container';
import { AccountCreationErrors, RegistrationState } from '../../store/registration';
import { RootState } from '../../store/reducer';

describe('Container', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      isLoading: false,
      addAccount: false,

      errors: {},
      createAccount: () => null,
      addEmailAccount: () => null,
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
        let props = subject({ errors: [AccountCreationErrors.EMAIL_REQUIRED] });
        expect(props.errors).toEqual({ email: 'Email is required' });

        props = subject({ errors: [AccountCreationErrors.PROFILE_PRIMARY_EMAIL_REQUIRED] });
        expect(props.errors).toEqual({ email: 'Email is required' });
      });

      it('invalid email', () => {
        const props = subject({ errors: [AccountCreationErrors.EMAIL_INVALID] });

        expect(props.errors).toEqual({ email: 'Please enter a valid email address' });
      });

      it('email exists', () => {
        let props = subject({ errors: [AccountCreationErrors.EMAIL_ALREADY_EXISTS] });
        expect(props.errors).toEqual({ email: 'This email is already associated with a ZERO account' });

        props = subject({ errors: [AccountCreationErrors.PROFILE_PRIMARY_EMAIL_ALREADY_EXISTS] });
        expect(props.errors).toEqual({ email: 'This email is already associated with a ZERO account' });
      });
    });

    describe('password errors', () => {
      it('empty password', () => {
        const props = subject({ errors: [AccountCreationErrors.PASSWORD_REQUIRED] });

        expect(props.errors).toEqual({ password: 'Password is required' });
      });

      it('weak password', () => {
        const props = subject({ errors: [AccountCreationErrors.PASSWORD_TOO_WEAK] });

        expect(props.errors.password).toEqual(
          'Must include at least 8 characters, 1 number, 1 lowercase letter and 1 uppercase letter'
        );
      });

      it('invalid password', () => {
        const props = subject({ errors: [AccountCreationErrors.PASSWORD_INVALID] });

        expect(props.errors.password).toEqual(
          'Must include at least 8 characters, 1 number, 1 lowercase letter and 1 uppercase letter'
        );
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
