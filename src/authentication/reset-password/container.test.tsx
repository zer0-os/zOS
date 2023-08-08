import React from 'react';
import { shallow } from 'enzyme';
import { RootState } from '../../store/reducer';
import { Container, Properties } from './container';
import { AccountCreationErrors, RegistrationState } from '../../store/registration';

describe('Container', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      isLoading: false,
      errors: {},
      resetPassword: () => null,
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('passes data down', function () {
    const wrapper = subject({ isLoading: true });

    expect(wrapper.find('ResetPassword').props()).toEqual(
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

    describe('general errors', () => {
      it('unknown error', () => {
        const props = subject({ errors: ['random_error'] });

        expect(props.errors).toEqual({ general: 'An error has occurred' });
      });
    });
  });
});
