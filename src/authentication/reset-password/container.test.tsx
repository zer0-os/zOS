import React from 'react';
import { shallow } from 'enzyme';
import { ResetPasswordErrors } from '../../store/reset-password';
import { RootState } from '../../store/reducer';
import { Container, Properties } from './container';

describe('Container', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      isLoading: false,
      errors: {},
      emailSubmitted: false,
      resetPassword: () => null,
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('passes data down', function () {
    const wrapper = subject({ isLoading: true, emailSubmitted: true });

    expect(wrapper.find('ResetPassword').props()).toEqual(
      expect.objectContaining({
        isLoading: true,
        emailSubmitted: true,
      })
    );
  });

  describe('mapState', () => {
    const subject = (resetPasswordState) => {
      const state = {
        resetPassword: {
          loading: false,
          emailSubmitted: false,
          errors: [],
          ...resetPasswordState,
        },
      } as RootState;

      return Container.mapState(state);
    };

    it('isLoading', () => {
      const props = subject({ loading: true });

      expect(props.isLoading).toEqual(true);
    });

    it('emailSubmitted', () => {
      const props = subject({ emailSubmitted: true });

      expect(props.emailSubmitted).toEqual(true);
    });

    describe('email errors', () => {
      it('email not found', () => {
        const props = subject({ errors: [ResetPasswordErrors.EMAIL_NOT_FOUND] });

        expect(props.errors).toEqual({ email: 'Email not found' });
      });

      it('email is required', () => {
        const props = subject({ errors: [ResetPasswordErrors.EMAIL_REQUIRED] });

        expect(props.errors).toEqual({ email: 'Email is required' });
      });
    });

    describe('general errors', () => {
      it('unknown error', () => {
        const props = subject({ errors: [ResetPasswordErrors.UNKNOWN_ERROR] });

        expect(props.errors).toEqual({ general: 'An unknown error has occurred' });
      });

      it('other unknown errors', () => {
        const props = subject({ errors: ['random_error'] });

        expect(props.errors).toEqual({ general: 'An unknown error has occurred' });
      });
    });
  });
});
