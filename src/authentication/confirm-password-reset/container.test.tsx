import React from 'react';

import { shallow } from 'enzyme';

import { Container, Properties } from './container';
import {
  ConfirmPasswordResetErrors,
  ConfirmPasswordResetStage,
  ConfirmPasswordResetState,
} from '../../store/confirm-password-reset';
import { RootState } from '../../store/reducer';

describe('Container', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      stage: ConfirmPasswordResetStage.SubmitNewPassword,
      isLoading: false,
      errors: {},
      token: 'token',
      updatePassword: () => null,
      enterConfirmPasswordResetPage: () => null,
      leaveConfirmPasswordResetPage: () => null,
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('passes data down', function () {
    const wrapper = subject({ isLoading: true });

    expect(wrapper.find('ConfirmPasswordReset').props()).toEqual(
      expect.objectContaining({
        isLoading: true,
      })
    );
  });

  describe('mapState', () => {
    const subject = (confirmPasswordResetState: Partial<ConfirmPasswordResetState> = {}) => {
      const state = {
        confirmPasswordReset: {
          loading: false,
          errors: [],
          ...confirmPasswordResetState,
        },
      } as RootState;
      return Container.mapState(state);
    };

    it('isLoading', () => {
      const props = subject({ loading: true });

      expect(props.isLoading).toEqual(true);
    });

    describe('password errors', () => {
      it('empty password', () => {
        const props = subject({ errors: [ConfirmPasswordResetErrors.PASSWORD_REQUIRED] });

        expect(props.errors).toEqual({ password: 'Password is required' });
      });

      it('weak password', () => {
        const props = subject({ errors: [ConfirmPasswordResetErrors.PASSWORD_TOO_WEAK] });

        expect(props.errors.password).toEqual(
          'Must include at least 8 characters, 1 number, 1 lowercase letter and 1 uppercase letter'
        );
      });

      it('invalid password', () => {
        const props = subject({ errors: [ConfirmPasswordResetErrors.PASSWORD_INVALID] });

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
